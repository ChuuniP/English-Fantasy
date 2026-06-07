const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Auth Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { gmail, password, username, gender } = req.body;
  if (!gmail || !password || !username) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    // Check if account already exists
    const checkEmail = await db.query('SELECT * FROM accounts WHERE LOWER(gmail) = LOWER($1)', [gmail]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'This email address is already registered.' });
    }

    // Insert account
    const newAccountResult = await db.query(
      'INSERT INTO accounts (gmail, password, username, gender) VALUES ($1, $2, $3, $4) RETURNING id_account, gmail, username, gender, created_at',
      [gmail, password, username, gender || 'other']
    );
    const newAccount = newAccountResult.rows[0];

    // Find default level (level 1)
    let defaultLevelId = 1;
    const levelRes = await db.query('SELECT id_level FROM levels WHERE level_number = 1');
    if (levelRes.rows.length > 0) {
      defaultLevelId = levelRes.rows[0].id_level;
    }

    // Insert profile linked to account
    const newProfileResult = await db.query(
      'INSERT INTO profiles (id_account, level_id, current_xp, current_hp, max_hp, atk, floor_unlocked, dungeon_unlocked) VALUES ($1, $2, 0, 100, 100, 20, 1, 1) RETURNING *',
      [newAccount.id_account, defaultLevelId]
    );
    const newProfile = newProfileResult.rows[0];

    res.status(201).json({
      message: 'Account successfully registered.',
      account: newAccount,
      profile: {
        id_profile: newProfile.id_profile,
        level_id: 1, // mapping level_id relation to level number
        current_xp: newProfile.current_xp,
        current_hp: newProfile.current_hp,
        max_hp: newProfile.max_hp,
        atk: newProfile.atk,
        floor_unlocked: newProfile.floor_unlocked,
        dungeon_unlocked: newProfile.dungeon_unlocked
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Auth Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { gmail, password } = req.body;
  if (!gmail || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const accountRes = await db.query('SELECT * FROM accounts WHERE LOWER(gmail) = LOWER($1) AND password = $2', [gmail, password]);
    if (accountRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email address or incorrect password.' });
    }
    const account = accountRes.rows[0];

    // Get Profile and map level number
    const profileRes = await db.query(
      `SELECT p.*, l.level_number 
       FROM profiles p 
       LEFT JOIN levels l ON p.level_id = l.id_level 
       WHERE p.id_account = $1`,
      [account.id_account]
    );

    let profile = null;
    if (profileRes.rows.length > 0) {
      const p = profileRes.rows[0];
      profile = {
        id_profile: p.id_profile,
        level_id: p.level_number || 1, // Return actual level number
        current_xp: p.current_xp,
        current_hp: p.current_hp,
        max_hp: p.max_hp,
        atk: p.atk,
        floor_unlocked: p.floor_unlocked,
        dungeon_unlocked: p.dungeon_unlocked
      };
    } else {
      // If profile missing for some reason, create one
      const levelRes = await db.query('SELECT id_level FROM levels WHERE level_number = 1');
      const lvlId = levelRes.rows.length > 0 ? levelRes.rows[0].id_level : 1;

      const newP = await db.query(
        'INSERT INTO profiles (id_account, level_id, current_xp, current_hp, max_hp, atk, floor_unlocked, dungeon_unlocked) VALUES ($1, $2, 0, 100, 100, 20, 1, 1) RETURNING *',
        [account.id_account, lvlId]
      );
      profile = {
        id_profile: newP.rows[0].id_profile,
        level_id: 1,
        current_xp: 0,
        current_hp: 100,
        max_hp: 100,
        atk: 20,
        floor_unlocked: 1,
        dungeon_unlocked: 1
      };
    }

    res.json({
      message: 'Login successful.',
      account: {
        id_account: account.id_account,
        gmail: account.gmail,
        username: account.username,
        gender: account.gender,
        created_at: account.created_at
      },
      profile
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Get User Profile and Account data
app.get('/api/profile/:id_account', async (req, res) => {
  const { id_account } = req.params;
  try {
    const accountRes = await db.query('SELECT id_account, gmail, username, gender, created_at FROM accounts WHERE id_account = $1', [id_account]);
    if (accountRes.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const profileRes = await db.query(
      `SELECT p.*, l.level_number 
       FROM profiles p 
       LEFT JOIN levels l ON p.level_id = l.id_level 
       WHERE p.id_account = $1`,
      [id_account]
    );

    res.json({
      account: accountRes.rows[0],
      profile: profileRes.rows.length > 0 ? {
        id_profile: profileRes.rows[0].id_profile,
        level_id: profileRes.rows[0].level_number || 1,
        current_xp: profileRes.rows[0].current_xp,
        current_hp: profileRes.rows[0].current_hp,
        max_hp: profileRes.rows[0].max_hp,
        atk: profileRes.rows[0].atk,
        floor_unlocked: profileRes.rows[0].floor_unlocked,
        dungeon_unlocked: profileRes.rows[0].dungeon_unlocked
      } : null
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4. Update Profile Unlocked Floor
app.put('/api/profile/:id_account/floor', async (req, res) => {
  const { id_account } = req.params;
  const { floor_unlocked } = req.body;

  if (floor_unlocked === undefined) {
    return res.status(400).json({ error: 'Please provide floor_unlocked value.' });
  }

  try {
    const result = await db.query(
      'UPDATE profiles SET floor_unlocked = $1 WHERE id_account = $2 RETURNING *',
      [floor_unlocked, id_account]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ message: 'Floor unlocked status updated.', profile: result.rows[0] });
  } catch (err) {
    console.error('Update floor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4.1 Update Profile Unlocked Dungeon
app.put('/api/profile/:id_account/dungeon', async (req, res) => {
  const { id_account } = req.params;
  const { dungeon_unlocked } = req.body;

  if (dungeon_unlocked === undefined) {
    return res.status(400).json({ error: 'Please provide dungeon_unlocked value.' });
  }

  try {
    const result = await db.query(
      'UPDATE profiles SET dungeon_unlocked = $1 WHERE id_account = $2 RETURNING *',
      [dungeon_unlocked, id_account]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ message: 'Dungeon unlocked status updated.', profile: result.rows[0] });
  } catch (err) {
    console.error('Update dungeon error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4.2 Get Dungeon Details
app.get('/api/dungeon/:id_dungeon', async (req, res) => {
  const { id_dungeon } = req.params;
  try {
    const dungeonRes = await db.query('SELECT * FROM dungeons WHERE id_dungeon = $1', [id_dungeon]);
    if (dungeonRes.rows.length === 0) {
      return res.status(404).json({ error: 'Dungeon not found.' });
    }
    res.json(dungeonRes.rows[0]);
  } catch (err) {
    console.error('Fetch dungeon error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4.3 Get All Dungeons
app.get('/api/dungeons', async (req, res) => {
  try {
    const dungeonsRes = await db.query('SELECT * FROM dungeons ORDER BY id_dungeon ASC');
    res.json(dungeonsRes.rows);
  } catch (err) {
    console.error('Fetch dungeons list error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

function buildMonsterImageUrl(type, name) {
  const folder = type === 'Normal' ? 'Normal Monsters' : type === 'Elite' ? 'Elite Monsters' : 'Boss';
  const knownNameMap = {
    'Goblin Scout': 'Normal Monster 1.png',
    'Enchanted Sphinx': 'Elite Monster 1.png',
    'Vault Guardian': 'Boss 1.png'
  };
  const defaultFile = type === 'Normal' ? 'Normal Monster 1.png' : type === 'Elite' ? 'Elite Monster 1.png' : 'Boss 1.png';
  const fileName = knownNameMap[name] || defaultFile;
  const filePath = path.join(__dirname, '..', 'src', 'assets', 'images', 'Monsters', folder, fileName);

  if (fs.existsSync(filePath)) {
    return encodeURI(`../assets/images/Monsters/${folder}/${fileName}`);
  }
  return null;
}

// 4.4 Get Floors of a Dungeon
app.get('/api/dungeon/:id_dungeon/floors', async (req, res) => {
  const { id_dungeon } = req.params;
  try {
    const floorsRes = await db.query('SELECT * FROM floors WHERE id_dungeon = $1 ORDER BY floor_number ASC', [id_dungeon]);
    res.json(floorsRes.rows);
  } catch (err) {
    console.error('Fetch floors error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4.5 Get Floor Details and Monster Pool by id_floor
app.get('/api/floor/:id_floor/details', async (req, res) => {
  const { id_floor } = req.params;

  try {
    const floorRes = await db.query(
      `SELECT f.id_floor, f.id_dungeon, f.floor_number, f.total_turns, f.type_floor, d.name_dungeon, d.description AS dungeon_description, v.name_vocabulary
       FROM floors f
       JOIN dungeons d ON f.id_dungeon = d.id_dungeon
       LEFT JOIN vocabularies v ON f.id_vocabulary = v.id_vocabulary
       WHERE f.id_floor = $1`,
      [id_floor]
    );

    if (floorRes.rows.length === 0) {
      return res.status(404).json({ error: 'Floor not found.' });
    }

    const monsterRes = await db.query(
      `SELECT m.id_monster, m.name_monster, m.type_monster, m.hp_monster, m.atk_monster
       FROM floor_monsters_pool fp
       JOIN monsters m ON fp.id_monster = m.id_monster
       WHERE fp.id_floor = $1`,
      [id_floor]
    );

    const monsters = monsterRes.rows.map(monster => ({
      ...monster,
      image_url: buildMonsterImageUrl(monster.type_monster, monster.name_monster)
    }));

    const floorRow = floorRes.rows[0];
    const floorPayload = {
      id_floor: floorRow.id_floor,
      id_dungeon: floorRow.id_dungeon,
      floor_number: floorRow.floor_number,
      total_turns: floorRow.total_turns,
      name_dungeon: floorRow.name_dungeon,
      dungeon_description: floorRow.dungeon_description,
      vocabulary_name: floorRow.name_vocabulary || null,
      type_floor: floorRow.type_floor
    };

    res.json({
      floor: floorPayload,
      monsters
    });
  } catch (err) {
    console.error('Fetch floor details error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. Update Profile Level & XP
app.put('/api/profile/:id_account/xp', async (req, res) => {
  const { id_account } = req.params;
  const { level, current_xp } = req.body;

  if (level === undefined || current_xp === undefined) {
    return res.status(400).json({ error: 'Please provide level and current_xp.' });
  }

  try {
    // Map level number to id_level from levels table
    const levelRes = await db.query('SELECT id_level FROM levels WHERE level_number = $1', [level]);
    let levelId = 1;
    if (levelRes.rows.length > 0) {
      levelId = levelRes.rows[0].id_level;
    } else {
      // Create level if doesn't exist
      const newLvl = await db.query('INSERT INTO levels (level_number, required_xp) VALUES ($1, $2) RETURNING id_level', [level, level * 200]);
      levelId = newLvl.rows[0].id_level;
    }

    const result = await db.query(
      'UPDATE profiles SET level_id = $1, current_xp = $2 WHERE id_account = $3 RETURNING *',
      [levelId, current_xp, id_account]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.json({ message: 'XP and Level updated successfully.', profile: result.rows[0] });
  } catch (err) {
    console.error('Update XP error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 6. Evaluate Boss Answer using Gemini API
app.post('/api/boss/evaluate', async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Please provide question and answer.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in .env. Falling back to default grading.');
    const cleanAnswer = answer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const isNotEmpty = cleanAnswer.length > 0;
    return res.json({ damage: isNotEmpty ? 20 : 0 });
  }

  try {
    const prompt = `You are a grader for an English learning fantasy game. The player is on a boss floor.
The English question asked to the player is: "${question}"
The player's English response/answer is: "${answer}".

Evaluate if the player's response is a grammatically correct, meaningful, and suitable English answer to the question.
Requirements:
1. If the answer is incorrect, nonsensical, irrelevant to the question, or completely unsuitable, the damage is 0.
2. If the answer is correct and answers the question properly, the base damage is 20. Depending on the quality (e.g., naturalness, grammar correctness, vocabulary choice, sophistication), add extra damage (from 0 to 30). So the total damage will be between 20 and 50.
3. Respond ONLY with a single JSON object having the key 'damage' containing an integer. Do not include any markdown format or backticks. Example response: {"damage": 35}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    let cleanText = textResponse.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(cleanText);
    const damage = typeof result.damage === 'number' ? result.damage : 0;
    res.json({ damage });
  } catch (err) {
    console.error('Gemini evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate answer using Gemini.' });
  }
});

// 6.1 Evaluate Visual Novel player input using Gemini API
app.post('/api/visual-novel/evaluate', async (req, res) => {
  const { npc, context, player_response, logic } = req.body;
  if (!player_response) {
    return res.status(400).json({ error: 'Please provide player response.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in .env. Falling back to default grading.');
    const score = player_response.split(' ').length > 5 ? 75 : 45;
    const classification = score > 60 ? (logic && logic.check_type === 'persuasion_check' ? 'on_success' : 'sincere_and_profound') : (logic && logic.check_type === 'persuasion_check' ? 'on_fail' : 'surface_level');
    return res.json({ score, classification, feedback: 'Heuristic fallback assessment' });
  }

  try {
    let checkPrompt = '';
    if (logic && logic.check_type === 'persuasion_check') {
      checkPrompt = `The player is facing a persuasion check against NPC ${npc ? npc.name_en : 'NPC'}.
NPC context: "${context || ''}"
Action required: "${logic.player_action_required || ''}"
Player response: "${player_response}"

Evaluate if the response is grammatically correct and successfully persuades the NPC based on the action required (politely introducing themselves and requesting a stay).
Classify the outcome as either "on_success" (if they are polite, introduce themselves, and make the request in reasonable English) or "on_fail" (if it's rude, completely incorrect English, or irrelevant).`;
    } else {
      checkPrompt = `The player is offering final advice to help NPC Elena (Apprentice).
NPC Profile:
- Name: ${npc ? npc.name : 'Elena'}
- Role: ${npc ? npc.role : 'Apprentice'}
- Personality: ${npc ? npc.personality : 'Melancholic, insecure, but passionate'}
- Background: ${npc ? npc.background : 'Rural girl who dreams of academia, poor family, failed exams.'}

NPC Statement: "${context || ''}"
Player response: "${player_response}"

Grading Criteria:
1. "off_topic": Answer is completely irrelevant, nonsensical, or rude.
2. "surface_level": Cliché response (e.g., "Don't give up", "You can do it", "Try again next time") without addressing her specific context (poor family, exam failure, academic dreams). Score range: 50-60.
3. "sincere_and_profound": Deep, empathetic English advice using rich vocabulary or metaphors, directly addressing her struggles (poverty, exam failure by one point, academic passion). Score range: 61-100.

Assign a score from 0 to 100, and classify the response into one of the three criteria above.`;
    }

    const prompt = `You are a grader for an English learning fantasy visual novel game.
${checkPrompt}

Respond ONLY with a single JSON object. Do NOT wrap it in markdown block quotes or HTML tags.
For a persuasion check, return:
{
  "score": <number 0-100>,
  "classification": "on_success" | "on_fail",
  "feedback": "<short constructive feedback in English on their grammar and tone>"
}

For final advice grading, return:
{
  "score": <number 0-100>,
  "classification": "off_topic" | "surface_level" | "sincere_and_profound",
  "feedback": "<short constructive feedback in English on their advice, grammar, and vocabulary choice>"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Empty response from Gemini');
    }

    let cleanText = textResponse.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(cleanText);
    res.json(result);
  } catch (err) {
    console.error('Gemini visual novel evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate response using Gemini.' });
  }
});

// 6.2 Free NPC chat endpoint using Gemini API
app.post('/api/visual-novel/chat', async (req, res) => {
  const { npc, user_question } = req.body;
  if (!user_question) {
    return res.status(400).json({ error: 'Please provide user question.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in .env. Falling back to default chat.');
    return res.json({ response: "I'm sorry, I'm a bit overwhelmed right now. Please tell me more." });
  }

  try {
    const prompt = `You are roleplaying as a character in an English fantasy visual novel game.
Character Profile:
- Name: ${npc ? npc.name : 'Elena'}
- Role: ${npc ? npc.role : 'Apprentice'}
- Personality: ${npc ? npc.personality : 'Melancholic, insecure, but deeply passionate about knowledge'}
- Background: ${npc ? npc.background : 'Rural girl who dreams of academia, poor family, failed exams.'}

The player is talking to you during an inquiry phase before giving you final advice.
Player asks: "${user_question}"

Respond to the player in character as ${npc ? npc.name : 'Elena'}.
Guidelines:
1. Speak in English.
2. Keep your response short, warm, but sad, between 1 to 3 sentences.
3. Address the question and organically hint at your struggles if appropriate (e.g. your poor family struggling, studying by candle light, or failing the exam by only one point).
4. Do NOT say you are an AI or language model.

Response:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const npcResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I... I don't know what to say.";
    res.json({ response: npcResponse });
  } catch (err) {
    console.error('NPC chat error:', err);
    res.status(500).json({ error: 'Failed to chat with NPC using Gemini.' });
  }
});
// 7. Complete Floor – Save word/sentence encounters & award XP
app.post('/api/profile/:id_account/complete-floor', async (req, res) => {
  const { id_account } = req.params;
  const { words, boss_sentences } = req.body;
  // words: [{ word: string, hintUsed: bool }]
  // boss_sentences: [{ sentence: string, damage: number }]

  try {
    // 1. Get id_profile
    const profileRes = await db.query('SELECT id_profile, current_xp, level_id FROM profiles WHERE id_account = $1', [id_account]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    const { id_profile, current_xp, level_id } = profileRes.rows[0];
    let xpGained = 0;

    // 2. Process words (only those answered without hint)
    if (Array.isArray(words)) {
      for (const entry of words) {
        if (entry.hintUsed) continue; // skip hint-assisted answers
        const wordStr = (entry.word || '').trim().toLowerCase();
        if (!wordStr) continue;

        const existing = await db.query(
          'SELECT id_profile_detail, encounter_count FROM profile_word_details WHERE id_profile = $1 AND LOWER(word) = $2',
          [id_profile, wordStr]
        );

        if (existing.rows.length === 0) {
          // New word → insert, +2 XP
          await db.query(
            'INSERT INTO profile_word_details (id_profile, word, encounter_count) VALUES ($1, $2, 1)',
            [id_profile, wordStr]
          );
          xpGained += 2;
        } else {
          const row = existing.rows[0];
          if (row.encounter_count < 5) {
            // Already seen, encounter < 5 → increment, +1 XP
            await db.query(
              'UPDATE profile_word_details SET encounter_count = encounter_count + 1 WHERE id_profile_detail = $1',
              [row.id_profile_detail]
            );
            xpGained += 1;
          }
          // encounter_count >= 5 → no XP, no update
        }
      }
    }

    // 3. Process boss sentences (only those with damage > 0)
    if (Array.isArray(boss_sentences)) {
      for (const entry of boss_sentences) {
        if (!entry.damage || entry.damage <= 0) continue;
        const sentenceStr = (entry.sentence || '').trim();
        if (!sentenceStr) continue;

        const existing = await db.query(
          'SELECT id_boss_detail, encounter_count FROM profile_boss_details WHERE id_profile = $1 AND sentence = $2',
          [id_profile, sentenceStr]
        );

        if (existing.rows.length === 0) {
          // New sentence → insert, +5 XP
          await db.query(
            'INSERT INTO profile_boss_details (id_profile, sentence, encounter_count) VALUES ($1, $2, 1)',
            [id_profile, sentenceStr]
          );
          xpGained += 5;
        } else {
          const row = existing.rows[0];
          if (row.encounter_count < 5) {
            // Already seen, encounter < 5 → increment, +2 XP
            await db.query(
              'UPDATE profile_boss_details SET encounter_count = encounter_count + 1 WHERE id_boss_detail = $1',
              [row.id_boss_detail]
            );
            xpGained += 2;
          }
          // encounter_count >= 5 → no XP
        }
      }
    }

    // 4. Calculate new total XP and determine level
    const newXp = current_xp + xpGained;

    // Fetch all levels ordered descending to find the highest level the player qualifies for
    const levelsRes = await db.query('SELECT id_level, level_number, required_xp FROM levels ORDER BY level_number ASC');
    const allLevels = levelsRes.rows;

    let newLevelId = level_id;
    let newLevelNumber = 1;
    for (const lvl of allLevels) {
      if (newXp >= lvl.required_xp) {
        newLevelId = lvl.id_level;
        newLevelNumber = lvl.level_number;
      }
    }

    // 5. Update profile
    await db.query(
      'UPDATE profiles SET current_xp = $1, level_id = $2 WHERE id_profile = $3',
      [newXp, newLevelId, id_profile]
    );

    res.json({
      message: 'Floor completed. XP awarded.',
      xp_gained: xpGained,
      new_xp: newXp,
      new_level: newLevelNumber
    });
  } catch (err) {
    console.error('Complete floor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

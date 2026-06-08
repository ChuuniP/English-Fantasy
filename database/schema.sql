-- ==========================================
-- Database Schema for English Fantasy Game
-- Dialect: PostgreSQL (Standard SQL compatible)
-- Description: Users & progress, Vocabularies & Questions, Dungeon & Battle Systems
-- ==========================================

-- 11. Levels Configuration Table
CREATE TABLE IF NOT EXISTS levels (
    id_level SERIAL PRIMARY KEY,
    level_number INT UNIQUE NOT NULL,
    required_xp INT NOT NULL
);

-- 1. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id_account SERIAL PRIMARY KEY,
    gmail VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id_profile SERIAL PRIMARY KEY,
    id_account INT UNIQUE NOT NULL,
    level_id INT NOT NULL,
    current_xp INT DEFAULT 0,
    current_hp INT NOT NULL DEFAULT 100,
    max_hp INT DEFAULT 100,
    atk INT NOT NULL DEFAULT 20,
    floor_unlocked INT DEFAULT 1,
    dungeon_unlocked INT DEFAULT 1,
    subquest_unlocked INT DEFAULT 1,
    CONSTRAINT fk_profiles_accounts FOREIGN KEY (id_account) REFERENCES accounts (id_account) ON DELETE CASCADE,
    CONSTRAINT fk_profiles_levels FOREIGN KEY (level_id) REFERENCES levels (id_level)
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subquest_unlocked INT DEFAULT 1;

-- 3. Profile_Word_Details (User vocabulary notebook) Table
CREATE TABLE IF NOT EXISTS profile_word_details (
    id_profile_detail SERIAL PRIMARY KEY,
    id_profile INT NOT NULL,
    word VARCHAR(255) NOT NULL,
    encounter_count INT DEFAULT 1 CHECK (encounter_count >= 0 AND encounter_count <= 5),
    CONSTRAINT fk_pwd_profiles FOREIGN KEY (id_profile) REFERENCES profiles (id_profile) ON DELETE CASCADE
);

-- 4. Profile Boss Details Table
CREATE TABLE IF NOT EXISTS profile_boss_details (
    id_boss_detail SERIAL PRIMARY KEY,
    id_profile INT NOT NULL,
    sentence TEXT NOT NULL,
    encounter_count INT DEFAULT 1 CHECK (encounter_count >= 1 AND encounter_count <= 5),
    CONSTRAINT fk_pbd_profiles FOREIGN KEY (id_profile) REFERENCES profiles (id_profile) ON DELETE CASCADE
);

-- 5. Vocabularies (Topics/Sets) Table
CREATE TABLE IF NOT EXISTS vocabularies (
    id_vocabulary SERIAL PRIMARY KEY,
    name_vocabulary VARCHAR(255) NOT NULL,
    type_cefr VARCHAR(10) NOT NULL, -- e.g. A1, A2, B1, B2, C1, C2
    type_floor VARCHAR(20) NOT NULL CHECK (type_floor IN ('Normal', 'Boss'))
);

-- 5. Dungeons Table
CREATE TABLE IF NOT EXISTS dungeons (
    id_dungeon SERIAL PRIMARY KEY,
    name_dungeon VARCHAR(255) NOT NULL,
    description TEXT
);

-- 6. Floors Table
CREATE TABLE IF NOT EXISTS floors (
    id_floor SERIAL PRIMARY KEY,
    id_dungeon INT NOT NULL,
    floor_number INT NOT NULL,
    total_turns INT NOT NULL, -- e.g. 3 turns or 5 turns
    id_vocabulary INT,
    type_floor VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (type_floor IN ('Normal', 'Boss')),
    CONSTRAINT fk_floors_dungeons FOREIGN KEY (id_dungeon) REFERENCES dungeons (id_dungeon) ON DELETE CASCADE,
    CONSTRAINT fk_floors_vocabularies FOREIGN KEY (id_vocabulary) REFERENCES vocabularies (id_vocabulary)
);

-- 7. Monsters Table
CREATE TABLE IF NOT EXISTS monsters (
    id_monster SERIAL PRIMARY KEY,
    name_monster VARCHAR(255) NOT NULL,
    type_monster VARCHAR(20) NOT NULL CHECK (type_monster IN ('Normal', 'Elite', 'Boss')),
    hp_monster INT NOT NULL DEFAULT 100,
    atk_monster INT NOT NULL DEFAULT 10
);

-- 8. Floor_Monsters_Pool Table (M-to-M relationship for random floor monsters)
CREATE TABLE IF NOT EXISTS floor_monsters_pool (
    id_pool SERIAL PRIMARY KEY,
    id_floor INT NOT NULL,
    id_monster INT NOT NULL,
    CONSTRAINT fk_fmp_floors FOREIGN KEY (id_floor) REFERENCES floors (id_floor) ON DELETE CASCADE,
    CONSTRAINT fk_fmp_monsters FOREIGN KEY (id_monster) REFERENCES monsters (id_monster) ON DELETE CASCADE
);

-- 9. Boss_Questions Table
CREATE TABLE IF NOT EXISTS boss_questions (
    id_boss_question SERIAL PRIMARY KEY,
    name_boss_question VARCHAR(255) NOT NULL,
    question_amount INT NOT NULL DEFAULT 0
);

-- 10. Sub Quests Table
CREATE TABLE IF NOT EXISTS sub_quests (
    id_subquest SERIAL PRIMARY KEY,
    id_profile INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    progress_stage INT NOT NULL DEFAULT 0,
    stage_xp JSONB NOT NULL DEFAULT '[]'::jsonb,
    CONSTRAINT fk_sub_quests_profiles FOREIGN KEY (id_profile) REFERENCES profiles (id_profile) ON DELETE CASCADE,
    CONSTRAINT uq_profile_file_name UNIQUE (id_profile, file_name)
);
ALTER TABLE sub_quests DROP COLUMN IF EXISTS unlocked;
ALTER TABLE sub_quests DROP COLUMN IF EXISTS completed;
ALTER TABLE sub_quests DROP COLUMN IF EXISTS created_at;
ALTER TABLE sub_quests DROP COLUMN IF EXISTS last_updated;

-- ==========================================
-- PERFORMANCE OPTIMIZING INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_accounts_gmail ON accounts(gmail);
CREATE INDEX IF NOT EXISTS idx_profiles_account ON profiles(id_account);
CREATE INDEX IF NOT EXISTS idx_profile_word_details_profile ON profile_word_details(id_profile);
CREATE INDEX IF NOT EXISTS idx_profile_boss_details_profile ON profile_boss_details(id_profile);
CREATE INDEX IF NOT EXISTS idx_floors_dungeon ON floors(id_dungeon);
CREATE INDEX IF NOT EXISTS idx_floor_monsters_pool_floor ON floor_monsters_pool(id_floor);
CREATE INDEX IF NOT EXISTS idx_sub_quests_profile ON sub_quests(id_profile);
CREATE INDEX IF NOT EXISTS idx_sub_quests_file_name ON sub_quests(file_name);

-- ==========================================
-- DEFAULT SEED DATA
-- ==========================================
-- Add default level configurations
INSERT INTO levels (level_number, required_xp) VALUES (1, 100)
ON CONFLICT (level_number) DO NOTHING;
INSERT INTO levels (level_number, required_xp) VALUES (2, 300)
ON CONFLICT (level_number) DO NOTHING;
INSERT INTO levels (level_number, required_xp) VALUES (3, 500)
ON CONFLICT (level_number) DO NOTHING;
INSERT INTO levels (level_number, required_xp) VALUES (4, 750)
ON CONFLICT (level_number) DO NOTHING;
INSERT INTO levels (level_number, required_xp) VALUES (5, 1000)
ON CONFLICT (level_number) DO NOTHING;

-- Add default account requested by user
INSERT INTO accounts (gmail, password, username, gender) 
VALUES ('phat78789@gmail.com', '123456', 'Chuunibyou', 'male')
ON CONFLICT (gmail) DO NOTHING;

-- Add default profile linked to the seeded account
INSERT INTO profiles (id_account, level_id, current_xp, current_hp, max_hp, atk, floor_unlocked, dungeon_unlocked, subquest_unlocked)
SELECT
    id_account,
    (SELECT id_level FROM levels WHERE level_number = 1),
    0, 100, 100, 20, 1, 1, 1
FROM accounts
WHERE gmail = 'phat78789@gmail.com'
ON CONFLICT (id_account) DO NOTHING;

-- Add default dungeons
INSERT INTO dungeons (name_dungeon, description) 
SELECT 'Arcane Vaults', 'The initial dungeon where travelers test their basic English skills.'
WHERE NOT EXISTS (SELECT 1 FROM dungeons WHERE name_dungeon = 'Arcane Vaults');

-- Add default vocabularies (used by floors to determine question files)
INSERT INTO vocabularies (name_vocabulary, type_cefr, type_floor)
SELECT 'Floor 1', 'A1', 'Normal'
WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE name_vocabulary = 'Floor 1' AND type_cefr = 'A1' AND type_floor = 'Normal');
INSERT INTO vocabularies (name_vocabulary, type_cefr, type_floor)
SELECT 'Floor 2', 'A2', 'Normal'
WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE name_vocabulary = 'Floor 2' AND type_cefr = 'A2' AND type_floor = 'Normal');
INSERT INTO vocabularies (name_vocabulary, type_cefr, type_floor)
SELECT 'Floor 3', 'B1', 'Boss'
WHERE NOT EXISTS (SELECT 1 FROM vocabularies WHERE name_vocabulary = 'Floor 3' AND type_cefr = 'B1' AND type_floor = 'Boss');

-- Add default floors belonging to Dungeon 1 (Arcane Vaults)
INSERT INTO floors (id_dungeon, floor_number, total_turns, id_vocabulary, type_floor)
SELECT
    (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults'),
    1, 3,
    (SELECT id_vocabulary FROM vocabularies WHERE name_vocabulary = 'Floor 1'),
    'Normal'
WHERE NOT EXISTS (
    SELECT 1 FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1
);
INSERT INTO floors (id_dungeon, floor_number, total_turns, id_vocabulary, type_floor)
SELECT
    (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults'),
    2, 5,
    (SELECT id_vocabulary FROM vocabularies WHERE name_vocabulary = 'Floor 2'),
    'Normal'
WHERE NOT EXISTS (
    SELECT 1 FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2
);
INSERT INTO floors (id_dungeon, floor_number, total_turns, id_vocabulary, type_floor)
SELECT
    (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults'),
    3, 1,
    (SELECT id_vocabulary FROM vocabularies WHERE name_vocabulary = 'Floor 3'),
    'Boss'
WHERE NOT EXISTS (
    SELECT 1 FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 3
);

-- Add default monsters for the first dungeon
INSERT INTO monsters (name_monster, type_monster, hp_monster, atk_monster)
SELECT 'Goblin Scout', 'Normal', 50, 8
WHERE NOT EXISTS (SELECT 1 FROM monsters WHERE name_monster = 'Goblin Scout');
INSERT INTO monsters (name_monster, type_monster, hp_monster, atk_monster)
SELECT 'Enchanted Sphinx', 'Elite', 120, 18
WHERE NOT EXISTS (SELECT 1 FROM monsters WHERE name_monster = 'Enchanted Sphinx');
INSERT INTO monsters (name_monster, type_monster, hp_monster, atk_monster)
SELECT 'Vault Guardian', 'Boss', 250, 30
WHERE NOT EXISTS (SELECT 1 FROM monsters WHERE name_monster = 'Vault Guardian');

-- Add default sub quests
INSERT INTO sub_quests (id_profile, file_name, progress_stage, stage_xp)
SELECT
    id_profile,
    'Sub_quest_1', 0, '[10,10,10]'::jsonb
FROM profiles
WHERE id_account = (SELECT id_account FROM accounts WHERE gmail = 'phat78789@gmail.com')
ON CONFLICT ON CONSTRAINT uq_profile_file_name DO NOTHING;

-- Add default floor monster pools
INSERT INTO floor_monsters_pool (id_floor, id_monster)
SELECT
    (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1),
    (SELECT id_monster FROM monsters WHERE name_monster = 'Goblin Scout')
WHERE NOT EXISTS (
    SELECT 1 FROM floor_monsters_pool WHERE id_floor = (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1)
    AND id_monster = (SELECT id_monster FROM monsters WHERE name_monster = 'Goblin Scout')
);
INSERT INTO floor_monsters_pool (id_floor, id_monster)
SELECT
    (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1),
    (SELECT id_monster FROM monsters WHERE name_monster = 'Enchanted Sphinx')
WHERE NOT EXISTS (
    SELECT 1 FROM floor_monsters_pool WHERE id_floor = (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1)
    AND id_monster = (SELECT id_monster FROM monsters WHERE name_monster = 'Enchanted Sphinx')
);
INSERT INTO floor_monsters_pool (id_floor, id_monster)
SELECT
    (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2),
    (SELECT id_monster FROM monsters WHERE name_monster = 'Goblin Scout')
WHERE NOT EXISTS (
    SELECT 1 FROM floor_monsters_pool WHERE id_floor = (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2)
    AND id_monster = (SELECT id_monster FROM monsters WHERE name_monster = 'Goblin Scout')
);
INSERT INTO floor_monsters_pool (id_floor, id_monster)
SELECT
    (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2),
    (SELECT id_monster FROM monsters WHERE name_monster = 'Enchanted Sphinx')
WHERE NOT EXISTS (
    SELECT 1 FROM floor_monsters_pool WHERE id_floor = (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2)
    AND id_monster = (SELECT id_monster FROM monsters WHERE name_monster = 'Enchanted Sphinx')
);
INSERT INTO floor_monsters_pool (id_floor, id_monster)
SELECT
    (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 3),
    (SELECT id_monster FROM monsters WHERE name_monster = 'Vault Guardian')
WHERE NOT EXISTS (
    SELECT 1 FROM floor_monsters_pool WHERE id_floor = (SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 3)
    AND id_monster = (SELECT id_monster FROM monsters WHERE name_monster = 'Vault Guardian')
);


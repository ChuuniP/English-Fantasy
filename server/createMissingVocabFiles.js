const fs = require('fs');
const path = require('path');

const dataDir = 'e:\\Antigravity\\English Fantasy\\src\\assets\\data';

async function createMissingVocabFiles() {
  try {
    // Read Dungeon Monster 1 for Elite 1
    const monsterPath = path.join(dataDir, 'Dungeon Monster 1.json');
    const monsterData = JSON.parse(fs.readFileSync(monsterPath, 'utf8'));
    
    // Create Elite 1.json (same as Dungeon Monster 1)
    const elite1Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Elite 1'
    }));
    fs.writeFileSync(path.join(dataDir, 'Elite 1.json'), JSON.stringify(elite1Data, null, 4));
    console.log('✓ Created Elite 1.json (', elite1Data.length, ' words)');

    // Read Dungeon Boss 1 for Boss 1
    const bossPath = path.join(dataDir, 'Dungeon Boss 1.json');
    const bossData = JSON.parse(fs.readFileSync(bossPath, 'utf8'));
    
    // Create Boss 1.json (same as Dungeon Boss 1)
    const boss1Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Boss 1'
    }));
    fs.writeFileSync(path.join(dataDir, 'Boss 1.json'), JSON.stringify(boss1Data, null, 4));
    console.log('✓ Created Boss 1.json (', boss1Data.length, ' questions)');

    console.log('\n✓ All missing vocabulary files created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createMissingVocabFiles();

const fs = require('fs');
const path = require('path');

const dataDir = 'e:\\Antigravity\\English Fantasy\\src\\assets\\data';

async function createAllMissingVocabs() {
  try {
    const monsterPath = path.join(dataDir, 'Dungeon Monster 1.json');
    const monsterData = JSON.parse(fs.readFileSync(monsterPath, 'utf8'));
    
    const bossPath = path.join(dataDir, 'Dungeon Boss 1.json');
    const bossData = JSON.parse(fs.readFileSync(bossPath, 'utf8'));
    
    // Create Elite 2.json
    const elite2Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Elite 2'
    }));
    fs.writeFileSync(path.join(dataDir, 'Elite 2.json'), JSON.stringify(elite2Data, null, 4));
    console.log('✓ Created Elite 2.json (', elite2Data.length, ' words)');

    // Create Boss 2.json
    const boss2Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Boss 2'
    }));
    fs.writeFileSync(path.join(dataDir, 'Boss 2.json'), JSON.stringify(boss2Data, null, 4));
    console.log('✓ Created Boss 2.json (', boss2Data.length, ' questions)');

    console.log('\n✓ All missing vocabulary files created!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAllMissingVocabs();

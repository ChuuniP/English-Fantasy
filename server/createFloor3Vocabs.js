const fs = require('fs');
const path = require('path');

const dataDir = 'e:\\Antigravity\\English Fantasy\\src\\assets\\data';

async function createFloor3Vocabs() {
  try {
    // Read Dungeon Monster 1 for Elite 3
    const monsterPath = path.join(dataDir, 'Dungeon Monster 1.json');
    const monsterData = JSON.parse(fs.readFileSync(monsterPath, 'utf8'));
    
    // Create Elite 3.json
    const elite3Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Elite 3'
    }));
    fs.writeFileSync(path.join(dataDir, 'Elite 3.json'), JSON.stringify(elite3Data, null, 4));
    console.log('✓ Created Elite 3.json (', elite3Data.length, ' words)');

    // Read Dungeon Boss 1 for Boss 3
    const bossPath = path.join(dataDir, 'Dungeon Boss 1.json');
    const bossData = JSON.parse(fs.readFileSync(bossPath, 'utf8'));
    
    // Create Boss 3.json
    const boss3Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Boss 3'
    }));
    fs.writeFileSync(path.join(dataDir, 'Boss 3.json'), JSON.stringify(boss3Data, null, 4));
    console.log('✓ Created Boss 3.json (', boss3Data.length, ' questions)');

    console.log('\n✓ All Floor 3 vocabulary files created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createFloor3Vocabs();

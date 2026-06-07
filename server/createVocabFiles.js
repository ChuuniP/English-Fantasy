const fs = require('fs');
const path = require('path');

const dataDir = 'e:\\Antigravity\\English Fantasy\\src\\assets\\data';

async function createVocabularyFiles() {
  try {
    // Read Dungeon Monster 1
    const monsterPath = path.join(dataDir, 'Dungeon Monster 1.json');
    const monsterData = JSON.parse(fs.readFileSync(monsterPath, 'utf8'));
    console.log('✓ Loaded Dungeon Monster 1.json');

    // Create Floor 1.json (A1, Normal)
    const floor1Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Floor 1'
    }));
    fs.writeFileSync(path.join(dataDir, 'Floor 1.json'), JSON.stringify(floor1Data, null, 4));
    console.log('✓ Created Floor 1.json (', floor1Data.length, ' words)');

    // Create Floor 2.json (A2, Normal) - same as Floor 1 for now
    const floor2Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Floor 2'
    }));
    fs.writeFileSync(path.join(dataDir, 'Floor 2.json'), JSON.stringify(floor2Data, null, 4));
    console.log('✓ Created Floor 2.json (', floor2Data.length, ' words)');

    // Read Dungeon Boss 1
    const bossPath = path.join(dataDir, 'Dungeon Boss 1.json');
    const bossData = JSON.parse(fs.readFileSync(bossPath, 'utf8'));
    console.log('✓ Loaded Dungeon Boss 1.json');

    // Create Floor 3.json (B1, Boss)
    const floor3Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Floor 3'
    }));
    fs.writeFileSync(path.join(dataDir, 'Floor 3.json'), JSON.stringify(floor3Data, null, 4));
    console.log('✓ Created Floor 3.json (', floor3Data.length, ' questions)');

    console.log('\n✓ All vocabulary files created successfully!');
    console.log('\nFiles created:');
    console.log('  - Floor 1.json');
    console.log('  - Floor 2.json');
    console.log('  - Floor 3.json');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createVocabularyFiles();

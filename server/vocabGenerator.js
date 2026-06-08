const fs = require('fs');
const path = require('path');

const dataDir = 'e:\\Antigravity\\English Fantasy\\src\\assets\\data';

// ==========================================
// Vocabulary File Generator
// Consolidates all vocab creation tasks
// ==========================================

// Create core floor vocabulary files (Floor 1, 2, 3)
async function createFloorVocabs() {
  try {
    console.log('\n--- Creating Floor Vocabularies ---');
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

    // Create Floor 2.json (A2, Normal)
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

    console.log('✓ All floor vocabulary files created successfully!');
  } catch (err) {
    console.error('Error creating floor vocabs:', err.message);
    throw err;
  }
}

// Create Elite vocabulary files (Elite 1, 2, 3)
async function createEliteVocabs() {
  try {
    console.log('\n--- Creating Elite Vocabularies ---');
    const monsterPath = path.join(dataDir, 'Dungeon Monster 1.json');
    const monsterData = JSON.parse(fs.readFileSync(monsterPath, 'utf8'));
    
    // Create Elite 1.json
    const elite1Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Elite 1'
    }));
    fs.writeFileSync(path.join(dataDir, 'Elite 1.json'), JSON.stringify(elite1Data, null, 4));
    console.log('✓ Created Elite 1.json (', elite1Data.length, ' words)');

    // Create Elite 2.json
    const elite2Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Elite 2'
    }));
    fs.writeFileSync(path.join(dataDir, 'Elite 2.json'), JSON.stringify(elite2Data, null, 4));
    console.log('✓ Created Elite 2.json (', elite2Data.length, ' words)');

    // Create Elite 3.json
    const elite3Data = monsterData.map(item => ({
      ...item,
      name_vocabulary: 'Elite 3'
    }));
    fs.writeFileSync(path.join(dataDir, 'Elite 3.json'), JSON.stringify(elite3Data, null, 4));
    console.log('✓ Created Elite 3.json (', elite3Data.length, ' words)');

    console.log('✓ All elite vocabulary files created successfully!');
  } catch (err) {
    console.error('Error creating elite vocabs:', err.message);
    throw err;
  }
}

// Create Boss vocabulary files (Boss 1, 2, 3)
async function createBossVocabs() {
  try {
    console.log('\n--- Creating Boss Vocabularies ---');
    const bossPath = path.join(dataDir, 'Dungeon Boss 1.json');
    const bossData = JSON.parse(fs.readFileSync(bossPath, 'utf8'));
    
    // Create Boss 1.json
    const boss1Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Boss 1'
    }));
    fs.writeFileSync(path.join(dataDir, 'Boss 1.json'), JSON.stringify(boss1Data, null, 4));
    console.log('✓ Created Boss 1.json (', boss1Data.length, ' questions)');

    // Create Boss 2.json
    const boss2Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Boss 2'
    }));
    fs.writeFileSync(path.join(dataDir, 'Boss 2.json'), JSON.stringify(boss2Data, null, 4));
    console.log('✓ Created Boss 2.json (', boss2Data.length, ' questions)');

    // Create Boss 3.json
    const boss3Data = bossData.map(item => ({
      ...item,
      name_vocabulary: 'Boss 3'
    }));
    fs.writeFileSync(path.join(dataDir, 'Boss 3.json'), JSON.stringify(boss3Data, null, 4));
    console.log('✓ Created Boss 3.json (', boss3Data.length, ' questions)');

    console.log('✓ All boss vocabulary files created successfully!');
  } catch (err) {
    console.error('Error creating boss vocabs:', err.message);
    throw err;
  }
}

// Main function: create all vocabulary files
async function createAllVocabs() {
  try {
    console.log('========================================');
    console.log('Starting vocabulary file generation...');
    console.log('========================================');
    
    await createFloorVocabs();
    await createEliteVocabs();
    await createBossVocabs();

    console.log('\n========================================');
    console.log('✓ All vocabulary files created successfully!');
    console.log('========================================');
  } catch (err) {
    console.error('\nError during vocabulary generation:', err.message);
    process.exit(1);
  }
}

// Command handler
async function main() {
  const command = process.argv[2] || 'all';

  try {
    switch (command) {
      case 'floor':
        await createFloorVocabs();
        break;
      case 'elite':
        await createEliteVocabs();
        break;
      case 'boss':
        await createBossVocabs();
        break;
      case 'all':
        await createAllVocabs();
        break;
      default:
        console.log('Usage: node vocabGenerator.js [floor|elite|boss|all]');
        console.log('  floor - Create Floor vocabulary files (Floor 1, 2, 3)');
        console.log('  elite - Create Elite vocabulary files (Elite 1, 2, 3)');
        console.log('  boss  - Create Boss vocabulary files (Boss 1, 2, 3)');
        console.log('  all   - Create all vocabulary files (default)');
        process.exit(0);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Export functions for modular use
module.exports = {
  createFloorVocabs,
  createEliteVocabs,
  createBossVocabs,
  createAllVocabs
};

// Run if called directly
if (require.main === module) {
  main();
}

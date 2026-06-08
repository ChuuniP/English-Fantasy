const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ==========================================
// Test Suite
// Consolidated testing utilities
// ==========================================

// Test 1: API Floor Data
async function testFloorApi() {
  try {
    console.log('\n========================================');
    console.log('Testing Floor API endpoint...');
    console.log('========================================\n');
    
    // Simulate the API query
    const result = await pool.query(`
      SELECT f.*, d.name_dungeon, v.name_vocabulary, v.type_cefr, v.type_floor
      FROM floors f
      LEFT JOIN dungeons d ON f.id_dungeon = d.id_dungeon
      LEFT JOIN vocabularies v ON f.id_vocabulary = v.id_vocabulary
      WHERE f.id_floor = $1;
    `, [1]);

    if (result.rows.length > 0) {
      const floor = result.rows[0];
      console.log('✓ Floor Data Retrieved:');
      console.log({
        id_floor: floor.id_floor,
        floor_number: floor.floor_number,
        total_turns: floor.total_turns,
        name_dungeon: floor.name_dungeon,
        name_vocabulary: floor.name_vocabulary,
        type_cefr: floor.type_cefr,
        type_floor: floor.type_floor
      });

      console.log('\n✓ Floor Monsters:');
      const monstersResult = await pool.query(`
        SELECT id_monster, name_monster, type_monster
        FROM monsters
        WHERE id_monster IN (
          SELECT id_monster FROM floor_monsters_pool
          WHERE id_floor = $1
        );
      `, [1]);
      console.table(monstersResult.rows);
      return true;
    } else {
      console.error('✗ No floor data found');
      return false;
    }
  } catch (err) {
    console.error('✗ Error testing floor API:', err.message);
    throw err;
  }
}

// Test 2: AI Models Availability
async function testAiModels() {
  try {
    console.log('\n========================================');
    console.log('Testing AI Models...');
    console.log('========================================\n');

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key Status:', apiKey ? '✓ Found' : '✗ Not found');
    
    if (!apiKey) {
      console.log('⚠ Warning: GEMINI_API_KEY not configured in .env');
      return false;
    }

    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest'
    ];

    let successCount = 0;

    for (const model of models) {
      try {
        console.log(`Testing ${model}...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Say hello' }] }]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(`  ✓ ${model}: Available`);
          console.log(`  Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
          successCount++;
          break; // Stop after first success
        } else {
          const err = await response.text();
          console.log(`  ✗ ${model}: Status ${response.status}`);
        }
      } catch (e) {
        console.log(`  ✗ ${model}: ${e.message}`);
      }
    }

    if (successCount > 0) {
      console.log('\n✓ AI Models test passed!');
      return true;
    } else {
      console.log('\n✗ No AI models available');
      return false;
    }
  } catch (err) {
    console.error('✗ Error testing AI models:', err.message);
    throw err;
  }
}

// Test 3: Database Connectivity
async function testDatabaseConnection() {
  try {
    console.log('\n========================================');
    console.log('Testing Database Connection...');
    console.log('========================================\n');

    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');
    console.log('✓ Current server time:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    throw err;
  }
}

// Run all tests
async function runAllTests() {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║      Running All Tests Suite          ║');
    console.log('╚════════════════════════════════════════╝');

    const dbTest = await testDatabaseConnection();
    const apiTest = await testFloorApi();
    const modelTest = await testAiModels();

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         Test Summary                  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`Database: ${dbTest ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`API: ${apiTest ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`AI Models: ${modelTest ? '✓ PASS' : '✗ FAIL'}`);

    const allPassed = dbTest && apiTest && modelTest;
    console.log(`\nOverall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);

    await pool.end();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('\nFatal test error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

// Command handler
async function main() {
  const command = process.argv[2] || 'all';

  try {
    switch (command) {
      case 'floor':
        await testFloorApi();
        break;
      case 'models':
        await testAiModels();
        break;
      case 'db':
        await testDatabaseConnection();
        break;
      case 'all':
        await runAllTests();
        return; // runAllTests handles exit
      default:
        console.log('Usage: node tests.js [floor|models|db|all]');
        console.log('  floor  - Test floor API endpoint');
        console.log('  models - Test AI models availability');
        console.log('  db     - Test database connection');
        console.log('  all    - Run all tests (default)');
        process.exit(0);
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error running test:', err.message);
    await pool.end();
    process.exit(1);
  }
}

// Export functions for modular use
module.exports = {
  testFloorApi,
  testAiModels,
  testDatabaseConnection,
  runAllTests
};

// Run if called directly
if (require.main === module) {
  main();
}

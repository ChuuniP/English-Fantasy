const fs = require('fs');
const path = require('path');
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
// Schema Manager
// Handles schema application and verification
// ==========================================

// Apply the complete schema from schema.sql file
async function applySchema() {
  try {
    console.log('Applying database schema...');
    const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✓ Schema applied successfully.');
    return true;
  } catch (err) {
    console.error('Failed to apply schema:', err);
    throw err;
  }
}

// Check and display schema structure
async function checkSchema() {
  try {
    console.log('\n========================================');
    console.log('Checking database schema...');
    console.log('========================================');

    console.log('\n--- Vocabularies table structure ---');
    const colInfo = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'vocabularies' ORDER BY ordinal_position;
    `);
    console.table(colInfo.rows);

    console.log('\n--- Vocabularies data ---');
    const vocabData = await pool.query(`SELECT * FROM vocabularies;`);
    console.table(vocabData.rows);

    console.log('\n--- Floors table structure ---');
    const floorColInfo = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'floors' ORDER BY ordinal_position;
    `);
    console.table(floorColInfo.rows);

    console.log('\n--- Profiles table structure ---');
    const profileColInfo = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'profiles' ORDER BY ordinal_position;
    `);
    console.table(profileColInfo.rows);

    console.log('\n--- Sub Quests table structure ---');
    const subQuestColInfo = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'sub_quests' ORDER BY ordinal_position;
    `);
    console.table(subQuestColInfo.rows);

    console.log('\n✓ Schema check completed successfully.');
    return true;
  } catch (err) {
    console.error('Error checking schema:', err);
    throw err;
  }
}

// Main command handler
async function main() {
  const command = process.argv[2] || 'apply';

  try {
    if (command === 'apply') {
      await applySchema();
    } else if (command === 'check') {
      await checkSchema();
    } else if (command === 'all') {
      await applySchema();
      await checkSchema();
    } else {
      console.log('Usage: node schemaManager.js [apply|check|all]');
      console.log('  apply - Apply schema from schema.sql file (default)');
      console.log('  check - Check and display schema structure');
      console.log('  all   - Apply schema and then check it');
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Export functions for modular use
module.exports = {
  applySchema,
  checkSchema
};

// Run if called directly
if (require.main === module) {
  main();
}

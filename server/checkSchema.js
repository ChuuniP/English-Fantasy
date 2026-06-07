const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkSchema() {
  try {
    console.log('Checking vocabularies table structure...');
    const colInfo = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'vocabularies' ORDER BY ordinal_position;
    `);
    console.log('Vocabularies columns:');
    console.table(colInfo.rows);

    console.log('\nVocabularies data:');
    const vocabData = await pool.query(`SELECT * FROM vocabularies;`);
    console.table(vocabData.rows);

    console.log('\nFloors table structure:');
    const floorColInfo = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'floors' ORDER BY ordinal_position;
    `);
    console.table(floorColInfo.rows);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();

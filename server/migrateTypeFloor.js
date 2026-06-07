const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigrations() {
  try {
    console.log('Starting migrations for type_floor...');

    // 1. Add type_floor column to floors if not exists
    console.log('Adding type_floor column to floors...');
    await pool.query(`
      ALTER TABLE floors ADD COLUMN IF NOT EXISTS type_floor VARCHAR(20) DEFAULT 'Normal' CHECK (type_floor IN ('Normal', 'Boss'));
    `);
    console.log('✓ Added type_floor column');

    // 2. Update type_floor values for existing floors
    console.log('Updating type_floor values...');
    
    // Floor 1 & 2 = Normal
    await pool.query(`
      UPDATE floors SET type_floor = 'Normal' WHERE floor_number IN (1, 2);
    `);
    
    // Floor 3 = Boss
    await pool.query(`
      UPDATE floors SET type_floor = 'Boss' WHERE floor_number = 3;
    `);
    
    console.log('✓ Updated type_floor values');

    // 3. Verify the updates
    console.log('Verifying updates...');
    const result = await pool.query(`
      SELECT f.id_floor, f.floor_number, f.total_turns, v.name_vocabulary, f.type_floor
      FROM floors f 
      LEFT JOIN vocabularies v ON f.id_vocabulary = v.id_vocabulary
      ORDER BY f.floor_number;
    `);
    console.log('Current floors data:');
    console.table(result.rows);

    console.log('✓ All migrations completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();

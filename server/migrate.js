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
    console.log('Starting migrations...');

    // 1. Add id_vocabulary column to floors if not exists
    console.log('Adding id_vocabulary column to floors...');
    await pool.query(`
      ALTER TABLE floors ADD COLUMN IF NOT EXISTS id_vocabulary INT;
    `);
    console.log('✓ Added id_vocabulary column');

    // 2. Add foreign key constraint if not exists
    console.log('Adding foreign key constraint...');
    try {
      await pool.query(`
        ALTER TABLE floors ADD CONSTRAINT fk_floors_vocabularies 
        FOREIGN KEY (id_vocabulary) REFERENCES vocabularies (id_vocabulary) ON DELETE SET NULL;
      `);
      console.log('✓ Added foreign key constraint');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ Foreign key constraint already exists');
      } else {
        throw err;
      }
    }

    // 3. Insert vocabularies for floors (if not exist)
    console.log('Adding floor vocabularies...');
    await pool.query(`
      INSERT INTO vocabularies (name_vocabulary, type_cefr, type_floor) VALUES
        ('Floor 1', 'A1', 'Normal'),
        ('Floor 2', 'A2', 'Normal'),
        ('Floor 3', 'B1', 'Boss')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Ensured floor vocabularies exist');

    // 4. Update floors with vocabulary links
    console.log('Updating floors with vocabulary IDs...');
    await pool.query(`
      UPDATE floors f SET id_vocabulary = v.id_vocabulary 
      FROM vocabularies v 
      WHERE v.name_vocabulary = CONCAT('Floor ', f.floor_number)
      AND f.id_vocabulary IS NULL;
    `);
    console.log('✓ Updated floors with vocabulary links');

    // 5. Verify the updates
    console.log('Verifying updates...');
    const result = await pool.query(`
      SELECT f.id_floor, f.floor_number, f.total_turns, v.name_vocabulary 
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

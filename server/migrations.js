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
// Database Migrations
// Handles all database schema and data migrations
// ==========================================

// Migration 1: Core vocabulary and subquest migrations
async function migrateVocabularyAndSubquests() {
  try {
    console.log('\n--- Running vocabulary and subquest migrations ---');

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

    // 5. Add single-table subquest support
    console.log('Adding single-table subquest schema...');
    await pool.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subquest_unlocked INT DEFAULT 1;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sub_quests (
        id_subquest SERIAL PRIMARY KEY,
        id_profile INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        progress_stage INT NOT NULL DEFAULT 0,
        stage_xp JSONB NOT NULL DEFAULT '[]'::jsonb,
        CONSTRAINT fk_sub_quests_profiles FOREIGN KEY (id_profile) REFERENCES profiles (id_profile) ON DELETE CASCADE,
        CONSTRAINT uq_profile_file_name UNIQUE (id_profile, file_name)
      );
    `);

    await pool.query(`
      ALTER TABLE sub_quests DROP COLUMN IF EXISTS unlocked;
    `);
    await pool.query(`
      ALTER TABLE sub_quests DROP COLUMN IF EXISTS completed;
    `);
    await pool.query(`
      ALTER TABLE sub_quests DROP COLUMN IF EXISTS created_at;
    `);
    await pool.query(`
      ALTER TABLE sub_quests DROP COLUMN IF EXISTS last_updated;
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sub_quests_profile ON sub_quests (id_profile);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sub_quests_file_name ON sub_quests (file_name);
    `);

    await pool.query(`
      INSERT INTO sub_quests (id_profile, file_name, progress_stage, stage_xp)
      SELECT
        id_profile,
        'Sub_quest_1', 0, '[10,10,10]'::jsonb
      FROM profiles
      WHERE id_account = (SELECT id_account FROM accounts WHERE gmail = 'phat78789@gmail.com')
      ON CONFLICT ON CONSTRAINT uq_profile_file_name DO NOTHING;
    `);

    await pool.query(`
      UPDATE profiles SET subquest_unlocked = 1 WHERE subquest_unlocked IS NULL;
    `);
    console.log('✓ Added single-table subquest schema and seed data');

    return true;
  } catch (err) {
    console.error('Error in vocabulary and subquest migration:', err);
    throw err;
  }
}

// Migration 2: Floor type migration
async function migrateFloorTypes() {
  try {
    console.log('\n--- Running floor type migrations ---');

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

    return true;
  } catch (err) {
    console.error('Error in floor type migration:', err);
    throw err;
  }
}

// Verify migrations
async function verifyMigrations() {
  try {
    console.log('\n--- Verifying migrations ---');
    
    const result = await pool.query(`
      SELECT f.id_floor, f.floor_number, f.total_turns, v.name_vocabulary, f.type_floor
      FROM floors f 
      LEFT JOIN vocabularies v ON f.id_vocabulary = v.id_vocabulary
      ORDER BY f.floor_number;
    `);
    console.log('Floors data:');
    console.table(result.rows);

    console.log('✓ Migration verification complete!');
    return true;
  } catch (err) {
    console.error('Error verifying migrations:', err);
    throw err;
  }
}

// Run all migrations
async function runAllMigrations() {
  try {
    console.log('========================================');
    console.log('Starting all database migrations...');
    console.log('========================================');

    await migrateVocabularyAndSubquests();
    await migrateFloorTypes();
    await verifyMigrations();

    console.log('\n========================================');
    console.log('✓ All migrations completed successfully!');
    console.log('========================================');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\nFatal migration error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

// Export functions for modular use
module.exports = {
  migrateVocabularyAndSubquests,
  migrateFloorTypes,
  verifyMigrations,
  runAllMigrations
};

// Run if called directly
if (require.main === module) {
  runAllMigrations();
}

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testApi() {
  try {
    console.log('Testing API endpoint for Floor 1...\n');
    
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
      console.log('Floor Data:');
      console.log({
        id_floor: floor.id_floor,
        floor_number: floor.floor_number,
        total_turns: floor.total_turns,
        name_dungeon: floor.name_dungeon,
        name_vocabulary: floor.name_vocabulary,
        type_cefr: floor.type_cefr,
        type_floor: floor.type_floor
      });

      console.log('\nFloor Monsters:');
      const monstersResult = await pool.query(`
        SELECT id_monster, name_monster, type_monster
        FROM monsters
        WHERE id_monster IN (
          SELECT id_monster FROM floor_monsters_pool
          WHERE id_floor = $1
        );
      `, [1]);
      console.table(monstersResult.rows);
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
    process.exit(1);
  }
}

testApi();

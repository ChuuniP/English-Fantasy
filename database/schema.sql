-- ==========================================
-- Database Schema for English Fantasy Game
-- Dialect: PostgreSQL (Standard SQL compatible)
-- Description: Users & progress, Vocabularies & Questions, Dungeon & Battle Systems
-- ==========================================

-- 11. Levels Configuration Table
CREATE TABLE levels (
    id_level SERIAL PRIMARY KEY,
    level_number INT UNIQUE NOT NULL,
    required_xp INT NOT NULL
);

-- 1. Accounts Table
CREATE TABLE accounts (
    id_account SERIAL PRIMARY KEY,
    gmail VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
CREATE TABLE profiles (
    id_profile SERIAL PRIMARY KEY,
    id_account INT UNIQUE NOT NULL,
    level_id INT NOT NULL,
    current_xp INT DEFAULT 0,
    current_hp INT NOT NULL DEFAULT 100,
    max_hp INT DEFAULT 100,
    atk INT NOT NULL DEFAULT 20,
    floor_unlocked INT DEFAULT 1,
    dungeon_unlocked INT DEFAULT 1,
    CONSTRAINT fk_profiles_accounts FOREIGN KEY (id_account) REFERENCES accounts (id_account) ON DELETE CASCADE,
    CONSTRAINT fk_profiles_levels FOREIGN KEY (level_id) REFERENCES levels (id_level)
);

-- 3. Profile_Word_Details (User vocabulary notebook) Table
CREATE TABLE profile_word_details (
    id_profile_detail SERIAL PRIMARY KEY,
    id_profile INT NOT NULL,
    word VARCHAR(255) NOT NULL,
    encounter_count INT DEFAULT 1 CHECK (encounter_count >= 0 AND encounter_count <= 5),
    CONSTRAINT fk_pwd_profiles FOREIGN KEY (id_profile) REFERENCES profiles (id_profile) ON DELETE CASCADE
);

-- 4. Vocabularies (Topics/Sets) Table
CREATE TABLE vocabularies (
    id_vocabulary SERIAL PRIMARY KEY,
    name_vocabulary VARCHAR(255) NOT NULL,
    type_cefr VARCHAR(10) NOT NULL, -- e.g. A1, A2, B1, B2, C1, C2
    type_floor VARCHAR(20) NOT NULL CHECK (type_floor IN ('Normal', 'Boss'))
);

-- 5. Dungeons Table
CREATE TABLE dungeons (
    id_dungeon SERIAL PRIMARY KEY,
    name_dungeon VARCHAR(255) NOT NULL,
    description TEXT
);

-- 6. Floors Table
CREATE TABLE floors (
    id_floor SERIAL PRIMARY KEY,
    id_dungeon INT NOT NULL,
    floor_number INT NOT NULL,
    total_turns INT NOT NULL, -- e.g. 3 turns or 5 turns
    id_vocabulary INT,
    type_floor VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (type_floor IN ('Normal', 'Boss')),
    CONSTRAINT fk_floors_dungeons FOREIGN KEY (id_dungeon) REFERENCES dungeons (id_dungeon) ON DELETE CASCADE,
    CONSTRAINT fk_floors_vocabularies FOREIGN KEY (id_vocabulary) REFERENCES vocabularies (id_vocabulary)
);

-- 7. Monsters Table
CREATE TABLE monsters (
    id_monster SERIAL PRIMARY KEY,
    name_monster VARCHAR(255) NOT NULL,
    type_monster VARCHAR(20) NOT NULL CHECK (type_monster IN ('Normal', 'Elite', 'Boss')),
    hp_monster INT NOT NULL DEFAULT 100,
    atk_monster INT NOT NULL DEFAULT 10
);

-- 8. Floor_Monsters_Pool Table (M-to-M relationship for random floor monsters)
CREATE TABLE floor_monsters_pool (
    id_pool SERIAL PRIMARY KEY,
    id_floor INT NOT NULL,
    id_monster INT NOT NULL,
    CONSTRAINT fk_fmp_floors FOREIGN KEY (id_floor) REFERENCES floors (id_floor) ON DELETE CASCADE,
    CONSTRAINT fk_fmp_monsters FOREIGN KEY (id_monster) REFERENCES monsters (id_monster) ON DELETE CASCADE
);

-- 9. Boss_Questions Table
CREATE TABLE boss_questions (
    id_boss_question SERIAL PRIMARY KEY,
    name_boss_question VARCHAR(255) NOT NULL,
    question_amount INT NOT NULL DEFAULT 0
);

-- ==========================================
-- PERFORMANCE OPTIMIZING INDEXES
-- ==========================================
CREATE INDEX idx_accounts_gmail ON accounts(gmail);
CREATE INDEX idx_profiles_account ON profiles(id_account);
CREATE INDEX idx_profile_word_details_profile ON profile_word_details(id_profile);
CREATE INDEX idx_floors_dungeon ON floors(id_dungeon);
CREATE INDEX idx_floor_monsters_pool_floor ON floor_monsters_pool(id_floor);

-- ==========================================
-- DEFAULT SEED DATA
-- ==========================================
-- Add default level configurations
INSERT INTO levels (level_number, required_xp) VALUES (1, 100);
INSERT INTO levels (level_number, required_xp) VALUES (2, 300);
INSERT INTO levels (level_number, required_xp) VALUES (3, 500);
INSERT INTO levels (level_number, required_xp) VALUES (4, 750);
INSERT INTO levels (level_number, required_xp) VALUES (5, 1000);

-- Add default account requested by user
INSERT INTO accounts (gmail, password, username, gender) 
VALUES ('phat78789@gmail.com', '123456', 'Chuunibyou', 'male');

-- Add default profile linked to the seeded account
INSERT INTO profiles (id_account, level_id, current_xp, current_hp, max_hp, atk, floor_unlocked)
VALUES (
    (SELECT id_account FROM accounts WHERE gmail = 'phat78789@gmail.com'),
    (SELECT id_level FROM levels WHERE level_number = 1),
    0, 100, 100, 20, 1
);

-- Add default dungeons
INSERT INTO dungeons (name_dungeon, description) 
VALUES ('Arcane Vaults', 'The initial dungeon where travelers test their basic English skills.');

-- Add default vocabularies (used by floors to determine question files)
INSERT INTO vocabularies (name_vocabulary, type_cefr, type_floor) VALUES
    ('Floor 1', 'A1', 'Normal'),
    ('Floor 2', 'A2', 'Normal'),
    ('Floor 3', 'B1', 'Boss');

-- Add default floors belonging to Dungeon 1 (Arcane Vaults)
INSERT INTO floors (id_dungeon, floor_number, total_turns, id_vocabulary, type_floor)
VALUES 
    ((SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults'), 1, 3, (SELECT id_vocabulary FROM vocabularies WHERE name_vocabulary = 'Floor 1'), 'Normal'),
    ((SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults'), 2, 5, (SELECT id_vocabulary FROM vocabularies WHERE name_vocabulary = 'Floor 2'), 'Normal'),
    ((SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults'), 3, 1, (SELECT id_vocabulary FROM vocabularies WHERE name_vocabulary = 'Floor 3'), 'Boss');

-- Add default monsters for the first dungeon
INSERT INTO monsters (name_monster, type_monster, hp_monster, atk_monster) VALUES
    ('Goblin Scout', 'Normal', 50, 8),
    ('Enchanted Sphinx', 'Elite', 120, 18),
    ('Vault Guardian', 'Boss', 250, 30);

-- Add default floor monster pools
INSERT INTO floor_monsters_pool (id_floor, id_monster)
VALUES
    ((SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1), (SELECT id_monster FROM monsters WHERE name_monster = 'Goblin Scout')),
    ((SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 1), (SELECT id_monster FROM monsters WHERE name_monster = 'Enchanted Sphinx')),
    ((SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2), (SELECT id_monster FROM monsters WHERE name_monster = 'Goblin Scout')),
    ((SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 2), (SELECT id_monster FROM monsters WHERE name_monster = 'Enchanted Sphinx')),
    ((SELECT id_floor FROM floors WHERE id_dungeon = (SELECT id_dungeon FROM dungeons WHERE name_dungeon = 'Arcane Vaults') AND floor_number = 3), (SELECT id_monster FROM monsters WHERE name_monster = 'Vault Guardian'));


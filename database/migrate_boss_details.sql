-- ==========================================
-- Migration: Add profile_boss_details table
-- Run this once against your PostgreSQL DB
-- ==========================================

CREATE TABLE IF NOT EXISTS profile_boss_details (
    id_boss_detail  SERIAL PRIMARY KEY,
    id_profile      INT NOT NULL,
    sentence        TEXT NOT NULL,
    encounter_count INT DEFAULT 1 CHECK (encounter_count >= 1 AND encounter_count <= 5),
    CONSTRAINT fk_pbd_profiles FOREIGN KEY (id_profile)
        REFERENCES profiles (id_profile) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profile_boss_details_profile
    ON profile_boss_details (id_profile);

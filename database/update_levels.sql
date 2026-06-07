-- Update level XP requirements
UPDATE levels SET required_xp = 100 WHERE level_number = 1;
UPDATE levels SET required_xp = 300 WHERE level_number = 2;
UPDATE levels SET required_xp = 500 WHERE level_number = 3;
UPDATE levels SET required_xp = 750 WHERE level_number = 4;
UPDATE levels SET required_xp = 1000 WHERE level_number = 5;

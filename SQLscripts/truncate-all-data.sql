-- Truncate All Data from Database
-- This script deletes all data from all tables while preserving the schema
-- Run this script in your Supabase SQL editor to clear all data
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. All data will be deleted but the schema will remain intact

-- Truncate all tables in the correct order (respecting foreign key constraints)
-- Using CASCADE to handle foreign key dependencies

TRUNCATE TABLE tournament_stats CASCADE;
TRUNCATE TABLE group_standings CASCADE;
TRUNCATE TABLE match_player_stats CASCADE;
TRUNCATE TABLE group_players CASCADE;
TRUNCATE TABLE tournament_players CASCADE;
TRUNCATE TABLE dart_throws CASCADE;
TRUNCATE TABLE legs CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE groups CASCADE;
TRUNCATE TABLE tournaments CASCADE;
TRUNCATE TABLE players CASCADE;

-- Verify deletion - all counts should be 0
SELECT 
    (SELECT COUNT(*) FROM tournaments) as tournaments_count,
    (SELECT COUNT(*) FROM players) as players_count,
    (SELECT COUNT(*) FROM groups) as groups_count,
    (SELECT COUNT(*) FROM matches) as matches_count,
    (SELECT COUNT(*) FROM legs) as legs_count,
    (SELECT COUNT(*) FROM dart_throws) as dart_throws_count,
    (SELECT COUNT(*) FROM tournament_players) as tournament_players_count,
    (SELECT COUNT(*) FROM group_players) as group_players_count,
    (SELECT COUNT(*) FROM match_player_stats) as match_player_stats_count,
    (SELECT COUNT(*) FROM group_standings) as group_standings_count,
    (SELECT COUNT(*) FROM tournament_stats) as tournament_stats_count;


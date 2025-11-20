-- Clear All Data from Database
-- This script deletes all data from all tables while preserving the schema
-- Run this script in your Supabase SQL editor to clear all data
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. All data will be deleted but the schema will remain intact

-- Method 1: Using DELETE (safer, respects foreign keys)
-- Delete in order respecting foreign key constraints

-- Clear tournament_stats
DELETE FROM tournament_stats;

-- Clear group_standings
DELETE FROM group_standings;

-- Clear match_player_stats
DELETE FROM match_player_stats;

-- Clear group_players
DELETE FROM group_players;

-- Clear tournament_players
DELETE FROM tournament_players;

-- Clear dart_throws
DELETE FROM dart_throws;

-- Clear legs
DELETE FROM legs;

-- Clear matches
DELETE FROM matches;

-- Clear groups
DELETE FROM groups;

-- Clear tournaments
DELETE FROM tournaments;

-- Clear players (delete last since other tables might reference them)
DELETE FROM players;

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

-- Alternative Method 2: Using TRUNCATE (faster, but requires CASCADE)
-- Uncomment the lines below if you want to use TRUNCATE instead
-- Note: TRUNCATE is faster but requires CASCADE to handle foreign keys

/*
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
*/


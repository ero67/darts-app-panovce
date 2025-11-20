-- Drop All Tables Script
-- This script drops all tables from the database
-- Run this in Supabase SQL Editor to completely erase all data and tables

-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS tournament_stats CASCADE;
DROP TABLE IF EXISTS group_standings CASCADE;
DROP TABLE IF EXISTS match_player_stats CASCADE;
DROP TABLE IF EXISTS group_players CASCADE;
DROP TABLE IF EXISTS tournament_players CASCADE;
DROP TABLE IF EXISTS dart_throws CASCADE;
DROP TABLE IF EXISTS legs CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify deletion
SELECT 
    'tournaments' as table_name, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments'
UNION ALL
SELECT 
    'players', COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'players'
UNION ALL
SELECT 
    'groups', COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups'
UNION ALL
SELECT 
    'matches', COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches';


-- Enable public viewing for non-logged-in users
-- This allows anyone to view tournaments, matches, and related data
-- Only creation/modification requires authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view all tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can view all groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can view matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can view legs" ON legs;
DROP POLICY IF EXISTS "Authenticated users can view dart throws" ON dart_throws;
DROP POLICY IF EXISTS "Authenticated users can view all tournament players" ON tournament_players;
DROP POLICY IF EXISTS "Authenticated users can view all group players" ON group_players;
DROP POLICY IF EXISTS "Authenticated users can view all match player stats" ON match_player_stats;
DROP POLICY IF EXISTS "Authenticated users can view all group standings" ON group_standings;
DROP POLICY IF EXISTS "Authenticated users can view all tournament stats" ON tournament_stats;

-- Create new public read policies
CREATE POLICY "Anyone can view tournaments" ON tournaments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view legs" ON legs
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view dart throws" ON dart_throws
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view tournament players" ON tournament_players
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view group players" ON group_players
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view match player stats" ON match_player_stats
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view group standings" ON group_standings
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view tournament stats" ON tournament_stats
    FOR SELECT USING (true);

-- Keep write policies restricted to authenticated users (these remain unchanged)
-- Users can only create/update/delete their own tournaments and related data


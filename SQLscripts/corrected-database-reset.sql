-- Complete Database Reset Script for Darts Tournament App
-- This script drops all existing tables and recreates the complete schema

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

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legs_to_win INTEGER DEFAULT 3,
    starting_score INTEGER DEFAULT 501,
    group_settings JSONB, -- Group configuration settings (type: groups/playersPerGroup, value: number)
    playoff_settings JSONB, -- Playoff configuration (enabled, playersPerGroup, playoffLegsToWin)
    playoffs JSONB, -- Playoff bracket data (qualifyingPlayers, rounds, currentRound, etc.)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table (FIXED: group_id is now nullable for playoff matches)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE, -- Direct tournament link (required for playoff-only tournaments)
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE, -- NULL for playoff matches
    player1_id UUID REFERENCES players(id),
    player2_id UUID REFERENCES players(id),
    winner_id UUID REFERENCES players(id),
    started_by_user_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending',
    player1_legs INTEGER DEFAULT 0,
    player2_legs INTEGER DEFAULT 0,
    legs_to_win INTEGER DEFAULT 3,
    starting_score INTEGER DEFAULT 501,
    is_playoff BOOLEAN DEFAULT FALSE,
    playoff_round INTEGER,
    playoff_match_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_playoff_tournament_id CHECK (is_playoff = false OR tournament_id IS NOT NULL)
);

-- Create legs table for detailed match tracking
CREATE TABLE legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    player1_id UUID REFERENCES players(id),
    player2_id UUID REFERENCES players(id),
    winner_id UUID REFERENCES players(id),
    player1_score INTEGER DEFAULT 501,
    player2_score INTEGER DEFAULT 501,
    player1_darts INTEGER DEFAULT 0,
    player2_darts INTEGER DEFAULT 0,
    player1_average DECIMAL(5,2) DEFAULT 0,
    player2_average DECIMAL(5,2) DEFAULT 0,
    player1_checkout VARCHAR(50),
    player2_checkout VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dart_throws table for detailed scoring
CREATE TABLE dart_throws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leg_id UUID REFERENCES legs(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id),
    throw_number INTEGER NOT NULL,
    dart1_score INTEGER,
    dart2_score INTEGER,
    dart3_score INTEGER,
    total_score INTEGER,
    is_bust BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_players junction table
CREATE TABLE tournament_players (
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    PRIMARY KEY (tournament_id, player_id)
);

-- Create group_players junction table
CREATE TABLE group_players (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, player_id)
);

-- Create match_player_stats table for aggregated statistics
CREATE TABLE match_player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id),
    legs_won INTEGER DEFAULT 0,
    legs_lost INTEGER DEFAULT 0,
    total_darts INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    average DECIMAL(5,2) DEFAULT 0,
    highest_checkout INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_standings table for cached standings
CREATE TABLE group_standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id),
    position INTEGER NOT NULL,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    legs_won INTEGER DEFAULT 0,
    legs_lost INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    average DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_stats table for overall tournament statistics
CREATE TABLE tournament_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id),
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    legs_won INTEGER DEFAULT 0,
    legs_lost INTEGER DEFAULT 0,
    total_darts INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    average DECIMAL(5,2) DEFAULT 0,
    highest_checkout INTEGER DEFAULT 0,
    final_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_user_id ON tournaments(user_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_groups_tournament_id ON groups(tournament_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_group_id ON matches(group_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_is_playoff ON matches(is_playoff);
CREATE INDEX idx_matches_started_by_user_id ON matches(started_by_user_id);
CREATE INDEX idx_legs_match_id ON legs(match_id);
CREATE INDEX idx_dart_throws_leg_id ON dart_throws(leg_id);
CREATE INDEX idx_tournament_players_tournament_id ON tournament_players(tournament_id);
CREATE INDEX idx_tournament_players_player_id ON tournament_players(player_id);
CREATE INDEX idx_group_players_group_id ON group_players(group_id);
CREATE INDEX idx_group_players_player_id ON group_players(player_id);
CREATE INDEX idx_match_player_stats_match_id ON match_player_stats(match_id);
CREATE INDEX idx_group_standings_group_id ON group_standings(group_id);
CREATE INDEX idx_tournament_stats_tournament_id ON tournament_stats(tournament_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_standings_updated_at BEFORE UPDATE ON group_standings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_stats_updated_at BEFORE UPDATE ON tournament_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dart_throws ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tournaments (FIXED: Allow all authenticated users to view tournaments)
CREATE POLICY "Authenticated users can view all tournaments" ON tournaments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own tournaments" ON tournaments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tournaments" ON tournaments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tournaments" ON tournaments
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for players (public read, authenticated write)
CREATE POLICY "Anyone can view players" ON players
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create players" ON players
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update players" ON players
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for groups (FIXED: Allow all authenticated users to view groups)
CREATE POLICY "Authenticated users can view all groups" ON groups
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create groups for their tournaments" ON groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE tournaments.id = groups.tournament_id 
            AND tournaments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update groups of their tournaments" ON groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE tournaments.id = groups.tournament_id 
            AND tournaments.user_id = auth.uid()
        )
    );

-- Create RLS policies for matches (FIXED: Allow all authenticated users to access matches)
CREATE POLICY "Authenticated users can view matches" ON matches
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update matches" ON matches
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for legs (FIXED: Allow all authenticated users to access legs)
CREATE POLICY "Authenticated users can view legs" ON legs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create legs" ON legs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update legs" ON legs
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for dart_throws (FIXED: Allow all authenticated users to access dart_throws)
CREATE POLICY "Authenticated users can view dart throws" ON dart_throws
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create dart throws" ON dart_throws
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for tournament_players (FIXED: Allow all authenticated users to view tournament_players)
CREATE POLICY "Authenticated users can view all tournament players" ON tournament_players
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tournament players for their tournaments" ON tournament_players
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE tournaments.id = tournament_players.tournament_id 
            AND tournaments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tournament players from their tournaments" ON tournament_players
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE tournaments.id = tournament_players.tournament_id 
            AND tournaments.user_id = auth.uid()
        )
    );

-- Create RLS policies for group_players (FIXED: Allow all authenticated users to view group_players)
CREATE POLICY "Authenticated users can view all group players" ON group_players
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create group players for their tournaments" ON group_players
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups 
            JOIN tournaments ON tournaments.id = groups.tournament_id
            WHERE groups.id = group_players.group_id 
            AND tournaments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete group players from their tournaments" ON group_players
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM groups 
            JOIN tournaments ON tournaments.id = groups.tournament_id
            WHERE groups.id = group_players.group_id 
            AND tournaments.user_id = auth.uid()
        )
    );

-- Create RLS policies for match_player_stats (FIXED: Allow all authenticated users to view match_player_stats)
CREATE POLICY "Authenticated users can view all match player stats" ON match_player_stats
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create match player stats" ON match_player_stats
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update match player stats" ON match_player_stats
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for group_standings (FIXED: Allow all authenticated users to view group_standings)
CREATE POLICY "Authenticated users can view all group standings" ON group_standings
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create group standings for their tournaments" ON group_standings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups 
            JOIN tournaments ON tournaments.id = groups.tournament_id
            WHERE groups.id = group_standings.group_id 
            AND tournaments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update group standings of their tournaments" ON group_standings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM groups 
            JOIN tournaments ON tournaments.id = groups.tournament_id
            WHERE groups.id = group_standings.group_id 
            AND tournaments.user_id = auth.uid()
        )
    );

-- Create RLS policies for tournament_stats (FIXED: Allow all authenticated users to view tournament_stats)
CREATE POLICY "Authenticated users can view all tournament stats" ON tournament_stats
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tournament stats for their tournaments" ON tournament_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE tournaments.id = tournament_stats.tournament_id 
            AND tournaments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tournament stats of their tournaments" ON tournament_stats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tournaments 
            WHERE tournaments.id = tournament_stats.tournament_id 
            AND tournaments.user_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE tournaments IS 'Main tournaments table with playoff settings and bracket data';
COMMENT ON COLUMN tournaments.playoff_settings IS 'JSONB containing playoff configuration (enabled, playersPerGroup, playoffLegsToWin)';
COMMENT ON COLUMN tournaments.playoffs IS 'JSONB containing playoff bracket data (qualifyingPlayers, rounds, currentRound, etc.)';
COMMENT ON TABLE matches IS 'Matches table supporting both group stage and playoff matches';
COMMENT ON COLUMN matches.is_playoff IS 'Boolean flag indicating if this is a playoff match';
COMMENT ON COLUMN matches.playoff_round IS 'Round number for playoff matches (1, 2, 3, etc.)';
COMMENT ON COLUMN matches.playoff_match_number IS 'Match number within the playoff round';
COMMENT ON COLUMN matches.group_id IS 'Group ID for group stage matches, NULL for playoff matches';

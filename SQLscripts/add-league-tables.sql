-- League Feature Database Migration
-- Adds league tables and extends tournaments table

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'archived', 'upcoming'
    manager_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Array of manager user IDs
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    default_tournament_settings JSONB, -- Default settings for tournaments in this league
    scoring_rules JSONB DEFAULT '{"placementPoints": {"1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1}, "allowManualOverride": true}'::jsonb,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create league_members table
CREATE TABLE IF NOT EXISTS league_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'player', -- 'manager' or 'player'
    is_active BOOLEAN DEFAULT TRUE, -- For auto-enrollment in tournaments
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(league_id, player_id)
);

-- Create league_tournament_results table
CREATE TABLE IF NOT EXISTS league_tournament_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    placement INTEGER NOT NULL, -- Final placement in tournament (1, 2, 3, etc.)
    points_awarded INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, tournament_id, player_id)
);

-- Create league_leaderboard table (cached leaderboard data)
CREATE TABLE IF NOT EXISTS league_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    tournaments_played INTEGER DEFAULT 0,
    best_placement INTEGER, -- Best (lowest) placement achieved
    worst_placement INTEGER, -- Worst (highest) placement achieved
    avg_placement DECIMAL(5,2), -- Average placement
    last_tournament_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, player_id)
);

-- Add league columns to tournaments table
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS league_points_calculated BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leagues_status ON leagues(status);
CREATE INDEX IF NOT EXISTS idx_leagues_created_by ON leagues(created_by);
CREATE INDEX IF NOT EXISTS idx_leagues_deleted ON leagues(deleted);
CREATE INDEX IF NOT EXISTS idx_league_members_league_id ON league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_player_id ON league_members(player_id);
CREATE INDEX IF NOT EXISTS idx_league_members_is_active ON league_members(is_active);
CREATE INDEX IF NOT EXISTS idx_league_tournament_results_league_id ON league_tournament_results(league_id);
CREATE INDEX IF NOT EXISTS idx_league_tournament_results_tournament_id ON league_tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_league_tournament_results_player_id ON league_tournament_results(player_id);
CREATE INDEX IF NOT EXISTS idx_league_leaderboard_league_id ON league_leaderboard(league_id);
CREATE INDEX IF NOT EXISTS idx_league_leaderboard_player_id ON league_leaderboard(player_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_league_id ON tournaments(league_id);

-- Create updated_at trigger for leagues
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for league_tournament_results
CREATE TRIGGER update_league_tournament_results_updated_at BEFORE UPDATE ON league_tournament_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for league_leaderboard
CREATE TRIGGER update_league_leaderboard_updated_at BEFORE UPDATE ON league_leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leagues
CREATE POLICY "Authenticated users can view all leagues" ON leagues
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create leagues" ON leagues
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Managers can update their leagues" ON leagues
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = ANY(manager_ids)
    );

CREATE POLICY "Managers can delete their leagues" ON leagues
    FOR DELETE USING (
        auth.uid() = created_by OR 
        auth.uid() = ANY(manager_ids)
    );

-- RLS Policies for league_members
CREATE POLICY "Authenticated users can view league members" ON league_members
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can add league members" ON league_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM leagues 
            WHERE leagues.id = league_members.league_id 
            AND (leagues.created_by = auth.uid() OR auth.uid() = ANY(leagues.manager_ids))
        )
    );

CREATE POLICY "Managers can update league members" ON league_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM leagues 
            WHERE leagues.id = league_members.league_id 
            AND (leagues.created_by = auth.uid() OR auth.uid() = ANY(leagues.manager_ids))
        )
    );

CREATE POLICY "Managers can remove league members" ON league_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM leagues 
            WHERE leagues.id = league_members.league_id 
            AND (leagues.created_by = auth.uid() OR auth.uid() = ANY(leagues.manager_ids))
        )
    );

-- RLS Policies for league_tournament_results
CREATE POLICY "Authenticated users can view league tournament results" ON league_tournament_results
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can create league tournament results" ON league_tournament_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM leagues 
            WHERE leagues.id = league_tournament_results.league_id 
            AND (leagues.created_by = auth.uid() OR auth.uid() = ANY(leagues.manager_ids))
        )
    );

CREATE POLICY "Managers can update league tournament results" ON league_tournament_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM leagues 
            WHERE leagues.id = league_tournament_results.league_id 
            AND (leagues.created_by = auth.uid() OR auth.uid() = ANY(leagues.manager_ids))
        )
    );

-- RLS Policies for league_leaderboard
CREATE POLICY "Authenticated users can view league leaderboard" ON league_leaderboard
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can update league leaderboard" ON league_leaderboard
    FOR ALL USING (auth.uid() IS NOT NULL); -- Allow updates from service role or authenticated users

-- Add comments for documentation
COMMENT ON TABLE leagues IS 'Leagues table for organizing tournaments and tracking player standings';
COMMENT ON COLUMN leagues.default_tournament_settings IS 'JSONB containing default tournament settings (legsToWin, startingScore, groupSettings, playoffSettings, etc.)';
COMMENT ON COLUMN leagues.scoring_rules IS 'JSONB containing scoring rules (placementPoints map, allowManualOverride flag)';
COMMENT ON TABLE league_members IS 'Junction table linking players to leagues with role and active status';
COMMENT ON TABLE league_tournament_results IS 'Records tournament results and points awarded to players in league tournaments';
COMMENT ON TABLE league_leaderboard IS 'Cached leaderboard data aggregated from league_tournament_results';


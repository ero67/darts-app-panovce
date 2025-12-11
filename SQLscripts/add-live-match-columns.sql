-- Add live match tracking columns to matches table
ALTER TABLE matches ADD COLUMN current_leg INTEGER DEFAULT 1;
ALTER TABLE matches ADD COLUMN player1_current_score INTEGER DEFAULT 501;
ALTER TABLE matches ADD COLUMN player2_current_score INTEGER DEFAULT 501;
ALTER TABLE matches ADD COLUMN current_player INTEGER DEFAULT 0; -- 0 or 1
ALTER TABLE matches ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE matches ADD COLUMN live_device_id VARCHAR(255);
ALTER TABLE matches ADD COLUMN live_started_at TIMESTAMP WITH TIME ZONE;

-- Add comments to describe the columns
COMMENT ON COLUMN matches.current_leg IS 'Current leg number being played';
COMMENT ON COLUMN matches.player1_current_score IS 'Player 1 current score in the current leg';
COMMENT ON COLUMN matches.player2_current_score IS 'Player 2 current score in the current leg';
COMMENT ON COLUMN matches.current_player IS 'Current player turn (0 for player1, 1 for player2)';
COMMENT ON COLUMN matches.last_activity_at IS 'Timestamp of last match activity for live tracking';
COMMENT ON COLUMN matches.live_device_id IS 'Device ID of the device currently playing this match';
COMMENT ON COLUMN matches.live_started_at IS 'Timestamp when the match went live';

-- Create index for faster queries on live matches
CREATE INDEX idx_matches_live_status ON matches(status, last_activity_at) WHERE status = 'in_progress';
CREATE INDEX idx_matches_live_device ON matches(live_device_id) WHERE live_device_id IS NOT NULL;

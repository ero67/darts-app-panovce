-- Add result JSONB column to matches table to store full match result data
ALTER TABLE matches ADD COLUMN IF NOT EXISTS result JSONB;

-- Add comment
COMMENT ON COLUMN matches.result IS 'Full match result data including player stats, checkouts, and leg averages';


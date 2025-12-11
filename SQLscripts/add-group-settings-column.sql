-- Add missing group_settings column to tournaments table
-- This column will store group configuration settings

ALTER TABLE tournaments 
ADD COLUMN group_settings JSONB;

-- Add a comment to describe the column
COMMENT ON COLUMN tournaments.group_settings IS 'Group configuration settings (type: groups/playersPerGroup, value: number)';

-- Update existing tournaments to have default group settings
UPDATE tournaments 
SET group_settings = '{"type": "groups", "value": 2}'::jsonb 
WHERE group_settings IS NULL;

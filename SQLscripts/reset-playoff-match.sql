-- Reset a playoff match from "in_progress" back to "pending" (initial state)
-- Replace 'YOUR_MATCH_ID_HERE' with the actual match UUID

UPDATE matches
SET 
  status = 'pending',
  started_by_user_id = NULL,
  player1_legs = 0,
  player2_legs = 0,
  current_leg = 1,
  player1_current_score = starting_score,  -- Usually 501, but uses the match's starting_score setting
  player2_current_score = starting_score,  -- Usually 501, but uses the match's starting_score setting
  current_player = 0,
  live_device_id = NULL,
  live_started_at = NULL,
  last_activity_at = NOW(),
  updated_at = NOW()
WHERE id = 'YOUR_MATCH_ID_HERE'
  AND is_playoff = TRUE;

-- Example: Reset match with specific ID
-- UPDATE matches
-- SET 
--   status = 'pending',
--   started_by_user_id = NULL,
--   player1_legs = 0,
--   player2_legs = 0,
--   current_leg = 1,
--   player1_current_score = starting_score,
--   player2_current_score = starting_score,
--   current_player = 0,
--   live_device_id = NULL,
--   live_started_at = NULL,
--   last_activity_at = NOW(),
--   updated_at = NOW()
-- WHERE id = '123e4567-e89b-12d3-a456-426614174000'
--   AND is_playoff = TRUE;

-- To find the match ID, you can query:
-- SELECT id, player1_id, player2_id, status, playoff_round, playoff_match_number
-- FROM matches
-- WHERE is_playoff = TRUE
--   AND status = 'in_progress'
-- ORDER BY updated_at DESC;


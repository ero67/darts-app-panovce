-- Set Admin Role for a User
-- This script shows how to set a user as admin in Supabase
-- Replace 'user-uuid-here' with the actual user ID from auth.users table

-- Method 1: Update user_metadata (recommended for user-facing roles)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
) 
WHERE id = 'user-uuid-here';

-- Method 2: Update app_metadata (recommended for system-level roles)
-- This requires service role key and is more secure
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
) 
WHERE id = 'user-uuid-here';

-- To check if a user is admin:
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as user_role,
  raw_app_meta_data->>'role' as app_role
FROM auth.users
WHERE id = 'user-uuid-here';

-- To list all admin users:
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as user_role,
  raw_app_meta_data->>'role' as app_role
FROM auth.users
WHERE 
  raw_user_meta_data->>'role' = 'admin' 
  OR raw_app_meta_data->>'role' = 'admin';

-- To remove admin role from a user:
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE id = 'user-uuid-here';


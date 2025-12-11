-- Allow Admins to Update and Delete Any Tournament
-- This script adds RLS policies that allow administrators to manage any tournament

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get current user's metadata
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if user exists and has admin role
  IF user_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check multiple metadata locations for admin role
  RETURN (
    COALESCE(user_record.raw_user_meta_data->>'role', '') = 'admin' OR
    COALESCE(user_record.raw_app_meta_data->>'role', '') = 'admin'
  );
END;
$$;

-- Alter existing UPDATE policy to allow admins
-- This is the only policy that matters since we use soft delete (UPDATE deleted = true)
ALTER POLICY "Users can update their own tournaments" ON tournaments
    USING (is_admin() OR auth.uid() = user_id);

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'tournaments'
ORDER BY policyname;


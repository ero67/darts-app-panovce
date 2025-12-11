-- Admin Functions for User Role Management
-- These functions allow admins to set and get user roles

-- Function to set user role by email
CREATE OR REPLACE FUNCTION set_user_role(
  user_email TEXT,
  user_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  result JSONB;
BEGIN
  -- Find user by email
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  -- If user not found, return error
  IF user_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update user metadata with role
  IF user_role IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(user_role)
    )
    WHERE id = user_record.id;
  ELSE
    -- Remove role if user_role is NULL
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data - 'role'
    WHERE id = user_record.id;
  END IF;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'role', user_role
  );
END;
$$;

-- Function to get users by role
CREATE OR REPLACE FUNCTION get_users_by_role(
  role_name TEXT
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      NULL
    )::TEXT as full_name,
    COALESCE(
      u.raw_user_meta_data->>'role',
      u.raw_app_meta_data->>'role',
      NULL
    )::TEXT as role,
    u.created_at
  FROM auth.users u
  WHERE 
    (u.raw_user_meta_data->>'role' = role_name)
    OR (u.raw_app_meta_data->>'role' = role_name)
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permissions to authenticated users
-- Note: In production, you may want to restrict this to admins only
-- by checking the caller's role in the function
GRANT EXECUTE ON FUNCTION set_user_role(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_role(TEXT) TO authenticated;

-- Optional: Create a more secure version that checks if caller is admin
CREATE OR REPLACE FUNCTION set_user_role_secure(
  user_email TEXT,
  user_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  caller_record RECORD;
  result JSONB;
BEGIN
  -- Get the caller's user record
  SELECT * INTO caller_record
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if caller is admin
  IF caller_record IS NULL OR (
    COALESCE(caller_record.raw_user_meta_data->>'role', '') != 'admin' AND
    COALESCE(caller_record.raw_app_meta_data->>'role', '') != 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only administrators can set user roles'
    );
  END IF;

  -- Find user by email
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  -- If user not found, return error
  IF user_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update user metadata with role
  IF user_role IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(user_role)
    )
    WHERE id = user_record.id;
  ELSE
    -- Remove role if user_role is NULL
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data - 'role'
    WHERE id = user_record.id;
  END IF;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'role', user_role
  );
END;
$$;

-- Grant execute permission for secure function
GRANT EXECUTE ON FUNCTION set_user_role_secure(TEXT, TEXT) TO authenticated;

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_record RECORD;
BEGIN
  -- Get the caller's user record
  SELECT * INTO caller_record
  FROM auth.users u
  WHERE u.id = auth.uid();

  -- Check if caller is admin
  IF caller_record IS NULL OR (
    COALESCE(caller_record.raw_user_meta_data->>'role', '') != 'admin' AND
    COALESCE(caller_record.raw_app_meta_data->>'role', '') != 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can view all users';
  END IF;

  -- Return all users
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      NULL
    )::TEXT as full_name,
    COALESCE(
      u.raw_user_meta_data->>'role',
      u.raw_app_meta_data->>'role',
      'user'
    )::TEXT as role,
    u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC
  LIMIT 1000;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;


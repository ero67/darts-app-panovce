# Admin Role Setup Guide

This guide explains how to set up admin roles for the Darts Tournament App.

## Database Setup

1. **SQL Script Reference**:
   - See `SQLscripts/set-admin-role.sql` for SQL examples on how to set/check/remove admin roles
   - No database migration is required - admin roles are stored in user metadata

## Setting a User as Admin

There are two ways to set a user as admin in Supabase:

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Find the user you want to make admin
4. Click on the user to open their details
5. Scroll to **User Metadata** section
6. Click **Add** and add:
   ```json
   {
     "role": "admin"
   }
   ```
7. Save the changes

### Method 2: Using SQL (Advanced)

Run this SQL in Supabase SQL Editor (replace `user-uuid-here` with the actual user ID):

```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
) 
WHERE id = 'user-uuid-here';
```

## Admin Permissions

**Admins can:**
- Create tournaments
- Edit tournament settings
- Delete tournaments
- Access all admin features

**Non-admin logged-in users can:**
- Start matches
- Count/score matches
- View tournaments and statistics
- View live matches

**Non-logged-in users can:**
- View tournaments
- View statistics
- View live matches (read-only)

## Verifying Admin Status

To verify a user is admin, check their `user_metadata.role` field in Supabase Dashboard. It should be set to `"admin"`.

The app checks for admin role in multiple places:
- `user.user_metadata.role`
- `user.app_metadata.role`
- `user.raw_user_meta_data.role`
- `user.raw_app_meta_data.role`

Any of these fields set to `"admin"` will grant admin access.


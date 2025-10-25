# Database Setup Instructions

## Step 1: Run the Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql` and paste it into the editor
5. Click "Run" to execute the schema

## Step 2: Verify Tables Created

After running the schema, you should see these tables in your database:

### Core Tables
- `tournaments` - Tournament information
- `players` - Player profiles
- `tournament_players` - Tournament-player relationships
- `groups` - Tournament groups
- `group_players` - Group-player relationships
- `matches` - Individual matches
- `legs` - Individual legs within matches
- `dart_throws` - Individual dart throws

### Statistics Tables
- `match_player_stats` - Player statistics per match
- `group_standings` - Calculated group standings
- `tournament_stats` - Overall tournament statistics

## Step 3: Test the Connection

1. Make sure your `.env.local` file has the correct Supabase URL and anon key
2. Start your development server: `npm run dev`
3. Try creating a new tournament
4. Check the Supabase dashboard to see if data is being saved

## Step 4: Enable Row Level Security (Optional)

If you want to add authentication later, uncomment the RLS policies in the schema:

```sql
-- Uncomment these lines in supabase-schema.sql
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ... etc for other tables
```

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you ran the complete schema
   - Check that all tables were created successfully

2. **"permission denied" error**
   - Make sure you're using the anon key, not the service role key
   - Check that RLS is not enabled (or add proper policies)

3. **"uuid_generate_v4() does not exist" error**
   - The schema includes `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
   - If this fails, you can use the JavaScript `generateId()` function instead

### Testing Queries

You can test your setup with these queries in the SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Test inserting a tournament
INSERT INTO tournaments (name, status) 
VALUES ('Test Tournament', 'active') 
RETURNING *;
```

## Next Steps

Once the database is set up:

1. Create a tournament in the app
2. Check the Supabase dashboard to see the data
3. Try the live match tracking features
4. Test multi-device functionality

The app will automatically fall back to localStorage if Supabase is not available, so you can test locally first.

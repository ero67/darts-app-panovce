# Supabase Integration Guide

This guide explains how to integrate the Darts Tournament Manager with Supabase for persistent data storage and real-time features.

## Database Schema

The complete database schema is provided in `supabase-schema.sql`. This includes:

### Core Tables
- **tournaments**: Tournament information and settings
- **players**: Player profiles and information
- **tournament_players**: Many-to-many relationship between tournaments and players
- **groups**: Tournament groups (A, B, C, etc.)
- **group_players**: Players assigned to groups
- **matches**: Individual matches between players
- **legs**: Individual legs within matches
- **dart_throws**: Individual dart throws with full scoring details

### Statistics Tables
- **match_player_stats**: Player statistics per match
- **group_standings**: Calculated group standings
- **tournament_stats**: Overall tournament statistics

### Key Features
- **Live Match Tracking**: `live_device_id` and `live_started_at` fields
- **Automatic Timestamps**: Triggers for `updated_at` fields
- **Calculated Statistics**: Functions for standings and player stats
- **Performance Indexes**: Optimized for common queries

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Execute the script to create all tables and functions

### 3. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 4. Environment Variables
Create a `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Supabase Client Setup
Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Data Flow

### Tournament Creation
1. Create tournament record
2. Create/update player records
3. Create tournament_players relationships
4. Generate groups and group_players
5. Generate matches for each group

### Match Play
1. Update match status to 'in_progress'
2. Set live_device_id for tracking
3. Create leg records as they're completed
4. Create dart_throw records for each dart
5. Update match_player_stats
6. Update group_standings

### Real-time Features
- Use Supabase Realtime for live match updates
- Subscribe to match changes for live scoring
- Update live_device_id when matches start/end

## API Functions

### Tournament Management
```javascript
// Create tournament
const { data, error } = await supabase
  .from('tournaments')
  .insert(tournamentData)

// Get tournament with all related data
const { data, error } = await supabase
  .from('tournaments')
  .select(`
    *,
    tournament_players(
      player:players(*)
    ),
    groups(
      *,
      group_players(
        player:players(*)
      ),
      matches(
        *,
        player1:players(*),
        player2:players(*)
      )
    )
  `)
  .eq('id', tournamentId)
```

### Live Match Tracking
```javascript
// Start live match
const { error } = await supabase
  .from('matches')
  .update({
    status: 'in_progress',
    live_device_id: deviceId,
    live_started_at: new Date().toISOString()
  })
  .eq('id', matchId)

// End live match
const { error } = await supabase
  .from('matches')
  .update({
    status: 'completed',
    live_device_id: null,
    live_started_at: null,
    completed_at: new Date().toISOString()
  })
  .eq('id', matchId)
```

### Dart Scoring
```javascript
// Create leg
const { data: leg, error } = await supabase
  .from('legs')
  .insert({
    match_id: matchId,
    leg_number: legNumber,
    winner_id: winnerId,
    darts_used: dartsUsed,
    checkout: checkoutString
  })

// Record dart throws
const dartThrows = dartScores.map((dart, index) => ({
  leg_id: leg.id,
  player_id: playerId,
  turn_number: turnNumber,
  dart_number: index + 1,
  score_value: dart.value,
  dart_type: dart.type,
  number_hit: dart.number
}))

const { error } = await supabase
  .from('dart_throws')
  .insert(dartThrows)
```

## Real-time Subscriptions

### Live Match Updates
```javascript
// Subscribe to match changes
const subscription = supabase
  .channel('match-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'matches',
    filter: `id=eq.${matchId}`
  }, (payload) => {
    // Update UI with new match data
    updateMatchData(payload.new)
  })
  .subscribe()
```

### Tournament-wide Updates
```javascript
// Subscribe to all matches in a tournament
const subscription = supabase
  .channel('tournament-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'matches',
    filter: `tournament_id=eq.${tournamentId}`
  }, (payload) => {
    // Update tournament view
    updateTournamentView(payload)
  })
  .subscribe()
```

## Statistics and Analytics

### Player Statistics
```javascript
// Get player stats for a tournament
const { data, error } = await supabase
  .from('match_player_stats')
  .select(`
    *,
    player:players(*),
    match:matches(*)
  `)
  .eq('match.tournament_id', tournamentId)
```

### Group Standings
```javascript
// Get group standings
const { data, error } = await supabase
  .from('group_standings')
  .select(`
    *,
    player:players(*)
  `)
  .eq('group_id', groupId)
  .order('position')
```

## Security Considerations

### Row Level Security (RLS)
The schema includes commented RLS policies. Enable them when you add authentication:

```sql
-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all tournaments" ON tournaments 
  FOR SELECT USING (true);

CREATE POLICY "Users can create tournaments" ON tournaments 
  FOR INSERT WITH CHECK (true);
```

### Data Validation
- Use Supabase Edge Functions for complex validation
- Implement proper error handling
- Validate dart scores and match rules server-side

## Performance Optimization

### Indexes
The schema includes optimized indexes for:
- Tournament status queries
- Match lookups by tournament/group
- Live match tracking
- Player statistics

### Query Optimization
- Use select() to limit returned columns
- Implement pagination for large datasets
- Cache frequently accessed data
- Use database functions for complex calculations

## Migration Strategy

### From Local Storage
1. Export existing tournaments from localStorage
2. Transform data to match Supabase schema
3. Bulk insert tournaments, players, and matches
4. Update app to use Supabase instead of localStorage

### Data Backup
- Regular database backups via Supabase dashboard
- Export tournament data as JSON for offline backup
- Implement data recovery procedures

## Future Enhancements

### User Authentication
- Add user accounts and authentication
- Implement tournament ownership
- Add user preferences and settings

### Advanced Features
- Tournament brackets and elimination rounds
- Player rankings and ELO systems
- Tournament templates and presets
- Export/import tournament data
- Mobile app with offline support

### Analytics
- Advanced statistics and charts
- Player performance trends
- Tournament comparison tools
- Historical data analysis

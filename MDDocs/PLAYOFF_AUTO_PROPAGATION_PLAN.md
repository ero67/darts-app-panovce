# Playoff Automatic Match Propagation Plan

## Overview
This document outlines the plan for implementing automatic match propagation in playoffs based on group standings. The system will automatically seed players into playoff brackets and advance winners to subsequent rounds.

## Current State
- Playoffs can be started after group stage completion
- Qualifying players are selected based on group standings
- Playoff rounds are generated (Top 16, Quarterfinals, Semifinals, Final)
- **Currently**: Players are NOT automatically assigned to matches - manual assignment required
- **Goal**: Automatically seed players and propagate winners through rounds

---

## 1. Seeding Strategy

### 1.1 Player Ranking
Players are ranked based on:
1. **Overall Performance** (across all groups):
   - Points (descending)
   - Leg difference (descending)
   - Average (descending)
   - Group position (1st place > 2nd place > 3rd place, etc.)

### 1.2 Seeding Methods

#### Method A: Standard Tournament Seeding (Recommended)
**Principle**: Best vs Worst, 2nd best vs 2nd worst, etc.

**Example for Top 16 (16 players)**:
```
Round of 16:
Match 1: Seed 1 vs Seed 16
Match 2: Seed 8 vs Seed 9
Match 3: Seed 4 vs Seed 13
Match 4: Seed 5 vs Seed 12
Match 5: Seed 2 vs Seed 15
Match 6: Seed 7 vs Seed 10
Match 7: Seed 3 vs Seed 14
Match 8: Seed 6 vs Seed 11

Quarterfinals (after Round of 16):
Match 1: Winner(M1) vs Winner(M2)
Match 2: Winner(M3) vs Winner(M4)
Match 3: Winner(M5) vs Winner(M6)
Match 4: Winner(M7) vs Winner(M8)

Semifinals:
Match 1: Winner(QF1) vs Winner(QF2)
Match 2: Winner(QF3) vs Winner(QF4)

Final:
Match 1: Winner(SF1) vs Winner(SF2)
```

**Bracket Structure**:
```
1 ──┐
    ├──┐
16 ──┘  │
        ├──┐
8  ──┐  │  │
     ├──┘  │
9  ──┘     │
           ├──┐
4  ──┐     │  │
     ├──┐  │  │
13 ──┘  │  │  │
        ├──┘  │
5  ──┐  │     │
     ├──┘     │
12 ──┘        │
              ├── FINAL
2  ──┐        │
     ├──┐     │
15 ──┘  │     │
        ├──┐  │
7  ──┐  │  │  │
     ├──┘  │  │
10 ──┘     │  │
           ├──┘
3  ──┐     │
     ├──┐  │
14 ──┘  │  │
        ├──┘
6  ──┐  │
     ├──┘
11 ──┘
```

#### Method B: Group-Based Seeding (Alternative)
**Principle**: Separate players by group position, then seed within groups.

**Example for 4 groups, 2 players per group (8 total)**:
- All 1st place finishers → Seeds 1-4 (ranked by performance)
- All 2nd place finishers → Seeds 5-8 (ranked by performance)

Then apply standard tournament seeding.

**Settings Option**: 
- `seedingMethod`: `'standard'` | `'groupBased'`

---

## 2. Automatic Match Propagation Logic

### 2.1 Initial Seeding (First Round)
When playoffs start:
1. Get all qualifying players
2. Rank them by performance (see 1.1)
3. Assign seeds (1 = best, N = worst)
4. Populate first round matches using seeding method

**Implementation**:
```javascript
function seedFirstRound(qualifyingPlayers, rounds) {
  const firstRound = rounds[0]; // First round (e.g., Round of 16)
  const numMatches = firstRound.matches.length;
  
  for (let i = 0; i < numMatches; i++) {
    const match = firstRound.matches[i];
    const seed1 = i + 1; // 1, 2, 3, ...
    const seed2 = (numMatches * 2) - i; // 16, 15, 14, ...
    
    match.player1 = qualifyingPlayers[seed1 - 1]; // Seed 1 = index 0
    match.player2 = qualifyingPlayers[seed2 - 1];
    match.seed1 = seed1;
    match.seed2 = seed2;
  }
}
```

### 2.2 Automatic Progression (Subsequent Rounds)
When a match is completed:
1. Identify the winner
2. Find the next round match for this winner
3. Determine which position (player1 or player2) based on bracket structure
4. Automatically assign winner to next round match

**Bracket Position Logic**:
- Match 1 winner → Next round, Match 1, player1 position
- Match 2 winner → Next round, Match 1, player2 position
- Match 3 winner → Next round, Match 2, player1 position
- Match 4 winner → Next round, Match 2, player2 position
- etc.

**Implementation**:
```javascript
function propagateWinner(match, rounds, currentRoundIndex) {
  if (currentRoundIndex >= rounds.length - 1) {
    return; // Final match - no progression
  }
  
  const nextRound = rounds[currentRoundIndex + 1];
  const matchIndex = rounds[currentRoundIndex].matches.indexOf(match);
  const nextMatchIndex = Math.floor(matchIndex / 2);
  const nextMatch = nextRound.matches[nextMatchIndex];
  
  // Determine position: even matchIndex → player1, odd → player2
  const position = (matchIndex % 2 === 0) ? 'player1' : 'player2';
  nextMatch[position] = match.result.winner;
  nextMatch.status = 'pending'; // Ready to play
}
```

### 2.3 Round Completion Detection
- Check if all matches in a round are completed
- If yes, mark round as complete
- Enable next round matches (if not already enabled)

---

## 3. Settings & Configuration

### 3.1 Seeding Settings
**Location**: Tournament Settings → Playoff Settings

**Options**:
```javascript
playoffSettings: {
  enabled: true,
  playersPerGroup: 2, // or totalPlayersToAdvance
  qualificationMode: 'perGroup', // or 'totalPlayers'
  
  // NEW SETTINGS:
  seedingMethod: 'standard', // 'standard' | 'groupBased'
  autoPropagate: true, // Automatically advance winners
  allowManualOverride: true, // Allow manual player assignment
  preventSameGroupEarly: false, // Try to avoid same-group matchups in early rounds
}
```

### 3.2 Decision Points (When Manual Intervention Needed)

#### Scenario 1: Tie in Group Standings
- **Issue**: Multiple players have identical stats
- **Decision**: Use tiebreaker settings or manual selection
- **Setting**: `tiebreakerMethod`: `'automatic'` | `'manual'`

#### Scenario 2: Same Group Matchups
- **Issue**: Players from same group meet in early rounds
- **Decision**: Allow or prevent (swap seeds)
- **Setting**: `preventSameGroupEarly`: `true` | `false`
- **Logic**: If enabled, check if players are from same group, swap with adjacent seed if needed

#### Scenario 3: Odd Number of Qualifiers
- **Issue**: Not a power of 2 (e.g., 10, 12, 14 players)
- **Decision**: 
  - Option A: Give byes to top seeds (e.g., top 6 get byes, bottom 8 play)
  - Option B: Round up to next power of 2, add "dummy" players
  - Option C: Round down, exclude lowest seeds
- **Setting**: `oddQualifiersHandling`: `'byes'` | `'roundUp'` | `'roundDown'`

#### Scenario 4: Incomplete Group Stage
- **Issue**: Some groups finished, others haven't
- **Decision**: Block playoff start (current behavior) or allow partial
- **Setting**: `requireAllGroupsComplete`: `true` | `false`

---

## 4. Implementation Phases

### Phase 1: Basic Seeding (First Round)
**Goal**: Automatically populate first round matches with seeded players

**Tasks**:
1. Implement `seedFirstRound()` function
2. Update `populatePlayoffBracket()` to call seeding
3. Add seeding method setting to playoff settings
4. Test with various playoff sizes (8, 16, 32 players)

### Phase 2: Automatic Progression
**Goal**: Automatically advance winners to next round

**Tasks**:
1. Implement `propagateWinner()` function
2. Hook into match completion event
3. Update next round match when current match completes
4. Handle edge cases (match reset, manual changes)

### Phase 3: Advanced Features
**Goal**: Add decision settings and edge case handling

**Tasks**:
1. Implement same-group prevention logic
2. Handle odd number of qualifiers
3. Add tiebreaker settings
4. Add manual override capability

### Phase 4: UI/UX Improvements
**Goal**: Visual feedback and controls

**Tasks**:
1. Show seeding numbers in bracket view
2. Highlight automatic assignments vs manual
3. Add "Reset Seeding" button
4. Add "Manual Override" toggle per match

---

## 5. Detailed Logic Examples

### 5.1 Top 16 Seeding (16 players, 4 groups, 4 per group)

**Input**:
- Group A: Player A1 (1st), A2 (2nd), A3 (3rd), A4 (4th)
- Group B: Player B1 (1st), B2 (2nd), B3 (3rd), B4 (4th)
- Group C: Player C1 (1st), C2 (2nd), C3 (3rd), C4 (4th)
- Group D: Player D1 (1st), D2 (2nd), D3 (3rd), D4 (4th)

**Ranking Process**:
1. Rank all 1st place finishers: [A1, B1, C1, D1] → Seeds 1-4
2. Rank all 2nd place finishers: [A2, B2, C2, D2] → Seeds 5-8
3. Rank all 3rd place finishers: [A3, B3, C3, D3] → Seeds 9-12
4. Rank all 4th place finishers: [A4, B4, C4, D4] → Seeds 13-16

**Standard Seeding**:
```
Match 1: Seed 1 vs Seed 16
Match 2: Seed 8 vs Seed 9
Match 3: Seed 4 vs Seed 13
Match 4: Seed 5 vs Seed 12
Match 5: Seed 2 vs Seed 15
Match 6: Seed 7 vs Seed 10
Match 7: Seed 3 vs Seed 14
Match 8: Seed 6 vs Seed 11
```

### 5.2 Quarterfinals Seeding (8 players, 2 groups, 4 per group)

**Input**:
- Group A: A1, A2, A3, A4
- Group B: B1, B2, B3, B4

**Ranking**: All players ranked 1-8 by performance

**Standard Seeding**:
```
Match 1: Seed 1 vs Seed 8
Match 2: Seed 4 vs Seed 5
Match 3: Seed 2 vs Seed 7
Match 4: Seed 3 vs Seed 6
```

### 5.3 Odd Number Example: 10 Players

**Option: Byes**
- Top 6 seeds get byes (automatically advance)
- Bottom 4 seeds play: Seed 7 vs Seed 10, Seed 8 vs Seed 9
- Winners join top 6 in next round (8 players total)

**Option: Round Up**
- Add 6 "dummy" players (or use lowest seeds twice)
- Create 16-player bracket
- Dummy players automatically lose

**Option: Round Down**
- Only top 8 players qualify
- Bottom 2 excluded

---

## 6. Edge Cases & Error Handling

### 6.1 Match Reset
- **Scenario**: User resets a completed match
- **Action**: Remove winner from next round, reset next round match if needed

### 6.2 Manual Player Assignment
- **Scenario**: User manually assigns players (override automatic)
- **Action**: 
  - Mark match as `manualOverride: true`
  - Don't auto-propagate from this match
  - Allow manual progression

### 6.3 Incomplete Previous Round
- **Scenario**: User tries to start next round before previous completes
- **Action**: Block or show warning

### 6.4 Player Withdrawal
- **Scenario**: Qualified player withdraws
- **Action**: 
  - Option A: Replace with next best player
  - Option B: Give opponent a bye
  - Option C: Manual reassignment required

---

## 7. Database Schema Considerations

### Current Structure
- `matches` table: `player1_id`, `player2_id`, `is_playoff`, `playoff_round`, `playoff_match_number`
- `tournaments` table: `playoff_settings` (JSONB)

### Additional Fields Needed
```sql
-- Add to matches table (if not exists):
ALTER TABLE matches ADD COLUMN IF NOT EXISTS seed1 INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS seed2 INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS auto_propagated BOOLEAN DEFAULT FALSE;
```

### Playoff Settings Extension
```javascript
playoffSettings: {
  // ... existing fields ...
  seedingMethod: 'standard',
  autoPropagate: true,
  allowManualOverride: true,
  preventSameGroupEarly: false,
  oddQualifiersHandling: 'byes',
  tiebreakerMethod: 'automatic'
}
```

---

## 8. User Interface Considerations

### 8.1 Bracket Visualization
- Show seed numbers next to player names
- Highlight automatic assignments (different color)
- Show progression arrows
- Indicate which matches are ready to play

### 8.2 Settings UI
- Add seeding method dropdown
- Add auto-propagate toggle
- Add same-group prevention toggle
- Add odd qualifiers handling dropdown

### 8.3 Match Management
- "Auto-seed" button (if not already seeded)
- "Reset Seeding" button (clear all assignments)
- "Manual Override" toggle per match
- Visual indicator for auto vs manual assignments

---

## 9. Testing Scenarios

### Test Case 1: Standard Top 16
- 4 groups, 4 players per group
- Verify seeding: 1 vs 16, 8 vs 9, etc.
- Complete matches, verify automatic progression

### Test Case 2: Quarterfinals (8 players)
- 2 groups, 4 players per group
- Verify seeding and progression

### Test Case 3: Odd Number (10 players)
- Test bye system
- Verify bracket structure

### Test Case 4: Same Group Prevention
- Enable setting
- Verify players from same group don't meet early

### Test Case 5: Manual Override
- Manually assign players
- Verify auto-propagate doesn't override
- Test manual progression

### Test Case 6: Match Reset
- Complete match, verify progression
- Reset match, verify next round cleared
- Re-complete, verify progression again

---

## 10. Future Enhancements

1. **Double Elimination Bracket**: Support for losers bracket
2. **Round Robin Playoffs**: Alternative format
3. **Consolation Bracket**: 3rd place, 5th place matches
4. **Dynamic Seeding**: Re-seed after each round based on performance
5. **Bracket Templates**: Pre-defined bracket structures for common formats

---

## 11. Questions for Discussion

1. **Seeding Method**: Standard vs Group-based - which is preferred?
2. **Same Group Prevention**: Should we prevent same-group matchups in early rounds?
3. **Odd Qualifiers**: How should we handle non-power-of-2 qualifier counts?
4. **Manual Override**: Should users be able to override automatic assignments?
5. **Tiebreakers**: Automatic tiebreaking or manual selection?
6. **Visualization**: What level of bracket visualization is needed?

---

## 12. Implementation Priority

**High Priority** (Phase 1):
- Basic standard seeding for first round
- Automatic winner propagation

**Medium Priority** (Phase 2):
- Settings UI
- Same-group prevention
- Manual override

**Low Priority** (Phase 3):
- Odd qualifiers handling
- Advanced tiebreakers
- Enhanced visualization

---

## Conclusion

This plan provides a comprehensive approach to automatic playoff match propagation. The system will automatically seed players based on group standings and advance winners through rounds, while providing flexibility for manual intervention when needed.

The implementation should be done in phases, starting with basic seeding and progression, then adding advanced features and settings based on user feedback.


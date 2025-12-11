# Tournament Management Guide

This guide will walk you through creating and managing tournaments in the Darts Tournament Application, from initial setup to viewing final statistics.

---

## Table of Contents

1. [Creating a Tournament](#creating-a-tournament)
2. [Tournament Settings](#tournament-settings)
3. [Adding Players](#adding-players)
4. [Starting the Tournament](#starting-the-tournament)
5. [Managing Groups and Matches](#managing-groups-and-matches)
6. [Viewing Standings](#viewing-standings)
7. [Setting Up Playoffs](#setting-up-playoffs)
8. [Viewing Statistics](#viewing-statistics)
9. [Live Matches](#live-matches)
10. [Scoring a Match](#scoring-a-match)

---

## Creating a Tournament

### Step 1: Access Tournament Creation

**Screenshot Placeholder:** *Dashboard showing the "Create Tournament" button or navigation menu*

- From the main dashboard, click the **"Create Tournament"** button or navigate to the tournament creation page
- You'll see a form with several sections to configure your tournament

### Step 2: Enter Tournament Name

**Screenshot Placeholder:** *Tournament creation form with the name input field highlighted*

- Enter a unique name for your tournament (maximum 50 characters)
- This name will be displayed throughout the tournament interface

### Step 3: Configure Match Settings

**Screenshot Placeholder:** *Match settings section showing legs to win and starting score dropdowns*

- **Default Legs to Win:** Select how many legs a player needs to win a match (options: 1, 2, 3, 4, 5, 7, or 9 legs)
- **Starting Score:** Choose the starting score for each leg (301, 501, or 701)

**Note:** These are default settings. Individual match settings can be adjusted later if needed.

### Step 4: Configure Standings Criteria Order

**Screenshot Placeholder:** *Standings criteria order section showing the list with up/down arrows*

- This determines how players are ranked in group standings when they have equal points
- The criteria are used in order:
  1. **Matches Won** - Number of matches won
  2. **Leg Difference** - Difference between legs won and legs lost
  3. **Average** - Match average score
  4. **Head to Head** - Result of direct match between tied players

- Use the **up/down arrows** to reorder these criteria according to your preference
- The first criterion will be checked first, then the second if values are equal, and so on

### Step 5: Configure Group Settings

**Screenshot Placeholder:** *Group settings section showing radio buttons for "Number of Groups" and "Players per Group"*

- Choose how players will be divided into groups:
  - **Number of Groups:** Specify how many groups you want (e.g., 2 groups, 4 groups)
  - **Players per Group:** Specify how many players should be in each group (the system will calculate the number of groups automatically)

- Enter the value (number of groups or players per group) in the input field
- Groups will be automatically created when you start the tournament

### Step 6: Configure Playoff Settings (Optional)

**Screenshot Placeholder:** *Playoff settings section with checkbox and expanded options*

- **Enable Playoffs:** Check this box if you want a playoff stage after group matches
- If enabled, configure:
  - **Qualification Mode:**
    - **Per Group:** Advance a specific number of players from each group (e.g., top 2 from each group)
    - **Total Players:** Advance a total number of players across all groups (e.g., top 8 overall)
  - **Players Advancing:** Set how many players advance (1-8 per group, or "All")
  - **Legs to Win by Round:** Set different leg requirements for each playoff round:
    - **Round of 16** (if applicable)
    - **Quarter-finals**
    - **Semi-finals**
    - **Final**

### Step 7: Create the Tournament

**Screenshot Placeholder:** *Create Tournament button at the bottom of the form*

- Click the **"Create Tournament"** button
- The tournament will be created with status "Open for Registration"
- You'll be redirected to the Tournament Registration page

---

## Tournament Settings

### Accessing Settings

**Screenshot Placeholder:** *Tournament registration page showing the "Edit Settings" button*

- On the Tournament Registration page, click the **"Edit Settings"** button (gear icon) in the header
- A modal window will open with all tournament settings

### Editing Settings

**Screenshot Placeholder:** *Settings modal showing all editable options*

You can modify:
- **Match Settings:** Legs to win and starting score
- **Standings Criteria Order:** Reorder the tie-breaking criteria
- **Group Settings:** Change group configuration (only before tournament starts)
- **Playoff Settings:** Enable/disable playoffs and configure playoff rules

**Note:** Some settings cannot be changed after the tournament has started. Group settings can only be modified before starting the tournament.

### Saving Changes

- Click **"Update Settings"** to save your changes
- Click **"Cancel"** to close without saving

---

## Adding Players

### Adding Players During Registration

**Screenshot Placeholder:** *Player registration section showing the input field and "Add Player" button*

- On the Tournament Registration page, you'll see the **Players** section
- Enter a player's name in the input field
- Click **"Add Player"** or press Enter
- The player will be added to the tournament (maximum 64 players)

### Viewing Registered Players

**Screenshot Placeholder:** *List of registered players showing player cards with remove buttons*

- All registered players are displayed as cards below the input field
- Each card shows the player's name
- You can remove players by clicking the **X** button (only before tournament starts)

### Player Limits

- Minimum: 2 players required to start a tournament
- Maximum: 64 players per tournament

---

## Starting the Tournament

### Prerequisites

**Screenshot Placeholder:** *Tournament registration page with at least 2 players added*

Before starting, ensure:
- At least 2 players are registered
- Group settings are configured
- All desired players have been added

### Starting the Tournament

**Screenshot Placeholder:** *"Start Tournament" button at the bottom of the registration page*

- Click the **"Start Tournament"** button
- A confirmation dialog may appear
- Once confirmed:
  - Players will be automatically divided into groups based on your settings
  - All group matches will be generated
  - Tournament status will change to "Active"
  - You'll be redirected to the Tournament Management page

**Note:** After starting, you cannot remove players or change group settings.

---

## Managing Groups and Matches

### Tournament Management Interface

**Screenshot Placeholder:** *Tournament Management page showing tabs: Groups, Matches, Standings, Playoffs, Statistics, Live Matches*

The Tournament Management page has several tabs:
- **Groups:** View all groups and their matches
- **Matches:** View all matches with filtering options
- **Standings:** View group standings tables
- **Playoffs:** View and manage playoff brackets
- **Statistics:** View tournament-wide statistics
- **Live Matches:** View currently active matches

### Groups Tab

**Screenshot Placeholder:** *Groups tab showing multiple groups with their matches*

- Each group is displayed as a card
- Group name is shown at the top (e.g., "Group A", "Group B")
- All matches in that group are listed below
- Match status indicators:
  - **Not Started:** Gray/scheduled status
  - **In Progress:** Green "Live" indicator
  - **Completed:** Shows final score with winner highlighted

### Matches Tab

**Screenshot Placeholder:** *Matches tab showing filter dropdowns and match list*

- View all matches from all groups in one place
- **Filter Options:**
  - **Filter by Group:** Dropdown to show matches from a specific group or "All Groups"
  - **Filter by Player:** Text input to search for matches containing a specific player name
  - **Clear Filters:** Button to reset all filters
- Each match card shows:
  - Player names
  - Match status
  - Score (if completed)
  - Statistics button (for completed matches)

### Starting a Match

**Screenshot Placeholder:** *Match card with "Start Match" button*

- Click **"Start Match"** on any scheduled match
- You'll be taken to the Match Interface to score the match
- The match status will change to "In Progress" and appear in Live Matches

### Editing Matches (Playoffs Only)

**Screenshot Placeholder:** *Playoff match with edit icon button*

- In the Playoffs tab, playoff matches can be edited before they start
- Click the **edit icon** (pencil) next to a playoff match
- Select different players for the match
- This is useful if players need to be substituted or brackets need adjustment

---

## Viewing Standings

### Standings Tab

**Screenshot Placeholder:** *Standings tab showing group standings tables*

- Each group has its own standings table
- Tables show:
  - **Position:** Player's rank in the group
  - **Player Name:** Name of the player
  - **Matches Won:** Number of matches won
  - **Leg Difference:** Difference between legs won and legs lost
  - **Average:** Match average score
  - **Points:** Total points (if applicable)

### Understanding Standings

**Screenshot Placeholder:** *Standings table with multiple players showing different statistics*

- Players are sorted according to the **Standings Criteria Order** you configured
- The table updates automatically as matches are completed
- Positive leg differences are shown in green
- Negative leg differences are shown in red

### Standings Criteria

The standings use these criteria in order (as configured):
1. **Matches Won:** Higher is better
2. **Leg Difference:** Higher is better
3. **Average:** Higher is better
4. **Head to Head:** Winner of direct match ranks higher

---

## Setting Up Playoffs

### Prerequisites

**Screenshot Placeholder:** *Playoffs tab showing "Start Playoffs" section with qualifying players*

Before starting playoffs:
- All group matches must be completed (or at least enough to determine qualifiers)
- Playoff settings must be enabled in tournament settings
- Qualifying players will be automatically determined based on your playoff settings

### Viewing Qualifying Players

**Screenshot Placeholder:** *Qualifying players section showing players grouped by their groups*

- The Playoffs tab shows which players qualify from each group
- Players are grouped by their original group
- The number of qualifiers matches your playoff settings

### Starting Playoffs

**Screenshot Placeholder:** *"Start Playoffs" button*

- Click the **"Start Playoffs"** button
- Playoff brackets will be automatically generated
- Matches will be created for each round:
  - Round of 16 (if 16+ players qualify)
  - Quarter-finals (8 players)
  - Semi-finals (4 players)
  - Final (2 players)
  - Third Place Match (if configured)

### Playoff Brackets

**Screenshot Placeholder:** *Playoff brackets showing different rounds with match cards*

- Each round is displayed as a separate section
- The current round is highlighted
- Match cards show:
  - Player names
  - Match status
  - Legs to win requirement for that round
  - Edit button (before match starts)

### Editing Playoff Matches

**Screenshot Placeholder:** *Edit playoff match modal showing player selection dropdowns*

- Click the **edit icon** on any playoff match
- Select different players from the qualifying players list
- Save to update the match
- Useful for handling substitutions or bracket adjustments

---

## Viewing Statistics

### Tournament Statistics Tab

**Screenshot Placeholder:** *Statistics tab showing tournament-wide statistics*

The Statistics tab shows overall tournament statistics:
- **Best Averages:** Top match averages across all matches
- **Best Checkouts:** Highest checkout scores
- **Fewest Darts:** Best leg performances (lowest darts per leg)
- Statistics are calculated from all completed matches (group and playoff)

### Match Statistics

**Screenshot Placeholder:** *Completed match card with statistics icon button*

- For any completed match, click the **statistics icon** (bar chart) button
- A modal will open showing detailed match statistics

### Match Statistics Modal

**Screenshot Placeholder:** *Match statistics modal showing player names, legs won, and detailed stats*

The statistics modal displays:

1. **Match Header:**
   - Player 1 name and legs won
   - Player 2 name and legs won
   - "vs" divider

2. **Match Average:**
   - Average score for Player 1
   - Average score for Player 2

3. **Legs Won:**
   - Total legs won by each player

4. **Checkouts:**
   - List of all checkout scores for Player 1 (sorted highest to lowest)
   - List of all checkout scores for Player 2 (sorted highest to lowest)

5. **Darts per Leg:**
   - Table showing darts used in each leg for both players
   - Winning legs are highlighted
   - Shows leg-by-leg performance comparison

**Screenshot Placeholder:** *Detailed statistics sections showing averages, checkouts list, and darts per leg table*

---

## Live Matches

### Live Matches Tab

**Screenshot Placeholder:** *Live Matches tab showing scoreboard-style cards for active matches*

- The Live Matches tab shows all currently active matches
- Matches are displayed in a scoreboard style:
  - Player names
  - Current leg score (legs won)
  - Current score in the active leg
  - Group name at the bottom
- Live matches auto-refresh every 8 seconds (only when this tab is active)

### Match Status Indicators

**Screenshot Placeholder:** *Live match card with "Live" indicator and connection status*

- **Live Indicator:** Green "Live" badge shows the match is in progress
- **Connection Status:** Shows if the match is being scored on your device or another device

### Viewing Live Match Details

- Click on a live match card to view more details
- You'll be taken to the Match Interface if you're the scorer
- Otherwise, you'll see a view-only version

---

## Scoring a Match

### Match Interface Overview

**Screenshot Placeholder:** *Match Interface showing scoreboard at top and dart board buttons below*

The Match Interface has two main sections:
1. **Scoreboard:** Shows both players' scores and statistics
2. **Dart Board:** Buttons for entering scores

### Scoreboard Section

**Screenshot Placeholder:** *Scoreboard showing active player highlighted and non-active player*

**Active Player (Currently Throwing):**
- Background: Orange gradient highlight
- Player name: Large, bold, white text
- Legs won: Large number with orange background
- Current score: Large, bold number
- Last throws: Shows the last 3 dart scores
- Statistics: Average and darts used in current leg

**Non-Active Player:**
- Background: Transparent/dark
- Player name: Large, bold text (black in light mode, white in dark mode)
- Legs won: Large number
- Current score: Large, bold number
- Last throws: Shows the last 3 dart scores
- Statistics: Average and darts used in current leg

### Dart Board Section

**Screenshot Placeholder:** *Dart board section showing number buttons, mode buttons, and remove last button*

**Number Selection:**
- Buttons for numbers 0-20 and 25 (bull)
- Click a number to enter that score

**Mode Selection:**
- **Single:** Standard single score (default)
- **Double:** Double the number (outer ring)
- **Triple:** Triple the number (inner ring)
- **Bull:** 25 or 50 (bullseye)

**Special Buttons:**
- **Remove Last:** Remove the last entered dart score
- **Bust:** Automatically triggered if score goes below zero

### Scoring Process

**Screenshot Placeholder:** *Match in progress showing dart entry and score updates*

1. **Select Mode:** Choose Single, Double, or Triple (if needed)
2. **Enter Score:** Click the number button
3. **Repeat:** Enter up to 3 darts per turn
4. **Checkout:** If the score reaches exactly 0 with a double or bull, the leg is won
5. **Bust:** If score goes below 0, the turn is bust and score resets to previous value

### Match Flow

**Screenshot Placeholder:** *Leg starter dialog showing player selection*

- **Starting a Leg:** When a new leg begins, you'll be asked to choose who throws first
- **Leg Completion:** When a player wins a leg, the scoreboard updates
- **Match Completion:** When a player reaches the required legs to win, a winner card appears

### Match Winner Card

**Screenshot Placeholder:** *Match complete card showing winner name, trophy icon, and final score*

- Shows the winner's name prominently
- Displays final score (e.g., "3-1")
- Trophy icon indicates match completion
- Click to return to tournament management

### Match Settings During Play

**Screenshot Placeholder:** *Match settings accessible during match (if available)*

- Some match settings can be adjusted during play (if permitted)
- Legs to win can sometimes be changed before the match completes

---

## Additional Features

### Filtering Matches

**Screenshot Placeholder:** *Matches tab with filters applied*

- Use the group dropdown to filter by specific group
- Use the player name input to find matches with specific players
- Filters persist while navigating (except when live matches refresh)

### Tournament Status

Tournaments can have different statuses:
- **Open for Registration:** Players can be added, settings can be changed
- **Active:** Tournament is in progress, matches are being played
- **Completed:** All matches (including playoffs) are finished

### Dark Mode

**Screenshot Placeholder:** *Navigation bar showing theme toggle button*

- Toggle between light and dark mode using the moon/sun icon in the navigation bar
- Your preference is saved and persists across sessions
- All tournament pages support both themes

### Language Selection

**Screenshot Placeholder:** *Language switcher dropdown*

- Change the application language using the language switcher in the navigation bar
- Available languages: English, Slovak (and others if configured)

---

## Tips and Best Practices

1. **Plan Your Groups:** Decide on group structure before adding players to ensure even distribution

2. **Configure Playoffs Early:** Set up playoff settings during tournament creation to avoid confusion later

3. **Check Standings Regularly:** Monitor group standings to understand qualification scenarios

4. **Use Match Filters:** When managing many matches, use filters to find specific matches quickly

5. **Review Statistics:** Check match statistics after important matches to track player performance

6. **Live Match Monitoring:** Use the Live Matches tab to monitor all active matches simultaneously

7. **Edit Playoff Matches:** If players need to be substituted in playoffs, use the edit function before starting the match

8. **Save Settings:** Always click "Update Settings" after making changes to ensure they're saved

---

## Troubleshooting

### Can't Start Tournament
- **Issue:** Start Tournament button is disabled
- **Solution:** Ensure at least 2 players are registered

### Can't Remove Players
- **Issue:** Remove button doesn't work
- **Solution:** Players can only be removed before the tournament starts

### Match Not Appearing in Live Matches
- **Issue:** Started match doesn't show as live
- **Solution:** Refresh the page or check if you're on the Live Matches tab

### Statistics Not Showing
- **Issue:** Statistics button doesn't appear or shows no data
- **Solution:** Ensure the match is completed and has a result saved

### Playoffs Not Starting
- **Issue:** Start Playoffs button is disabled
- **Solution:** Ensure enough group matches are completed to determine qualifiers

---

## Conclusion

This guide covers all aspects of tournament management from creation to completion. For additional help or questions, refer to the application's help section or contact support.

**Happy Tournament Managing! 🎯**


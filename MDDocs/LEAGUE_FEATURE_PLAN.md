# League Feature Plan

## Goals (MVP)
- Managers create leagues with members and default tournament settings.
- League has leaderboard and aggregated stats across its tournaments.
- Managers create tournaments scoped to a league; default settings/players auto-applied but editable per tournament.
- Tournament results award league points to participating players.
- Keep compatibility with existing tournament flow and Supabase schema patterns.

## UX Outline
- New nav entry: `Leagues` → list with create button (managers only).
- League detail:
  - Header with name, season dates/status, managers.
  - Tabs: `Leaderboard`, `Tournaments`, `Players`, `Settings`.
  - Leaderboard: points table with per-player aggregates.
  - Tournaments: list of tournaments linked to this league; create button uses league defaults and pre-populates players.
  - Players: add/remove players; mark active/inactive for next tournament.
  - Settings: scoring rules, default tournament settings, season dates, auto-sync options.
- Tournament creation within a league:
  - Defaults pre-filled from league (legs, starting score, group settings, playoff settings, standings criteria).
  - Players auto-selected from active league members; UI allows deselect/add extras.

## Data Model (Supabase)
- `leagues`
  - `id (uuid pk)`, `name`, `description`, `status` (`active`, `completed`, `archived`, `upcoming`)
  - `manager_ids` (uuid[]), `created_by`
  - `default_tournament_settings` (jsonb) – mirrors TournamentCreation fields
  - `scoring_rules` (jsonb) – placement points only (see below)
  - `deleted` (bool, default false), timestamps
- `league_members`
  - `id (uuid pk)`, `league_id`, `player_id`, `role` (`manager`, `player`), `is_active` (bool for auto-enroll), `joined_at`, `left_at`
- `tournaments` (existing) add columns:
  - `league_id uuid null` (FK leagues.id)
  - `league_locked_players boolean default true` (prevents auto-add after start)
  - `league_points_calculated boolean default false`
- `league_tournament_results`
  - `id (uuid pk)`, `league_id`, `tournament_id`, `player_id`
  - `placement` (int), `points_awarded` (int), `bonus_points` (int), `notes`, timestamps
- `league_leaderboard` (materialized view or cached table)
  - `league_id`, `player_id`, `points`, `tournaments_played`, `wins`, `avg_leg_diff`, `avg_match_avg`, `last_tournament_at`
- Optional audit: `league_points_events` (id, league_id, tournament_id, player_id, reason, delta, created_at).

### Scoring Rules (jsonb shape - MVP: Placement Only)
```json
{
  "placementPoints": { "1": 12, "2": 9, "3": 7, "4": 5, "5": 3, "default": 1 },
  "allowManualOverride": true
}
```
Note: For MVP, only placement-based points are awarded. Match-level bonuses and participation points can be added later.

## Service Layer Changes
- New `leagueService`:
  - `createLeague(data)`, `getLeagues()`, `getLeague(id)`, `updateLeague(id, updates)`, `deleteLeague(id)`.
  - `addMembers(leagueId, playerIds/objects)`, `updateMemberStatus`.
  - `createTournamentFromLeague(leagueId, overrides)` → calls existing `tournamentService.createTournament` with merged defaults + selected players, sets `league_id`.
  - `recordTournamentResults(leagueId, tournamentId)` → calculates placements and writes `league_tournament_results`, updates leaderboard cache.
  - `getLeaderboard(leagueId)` → aggregates from cache or live query.
- Extend `tournamentService` to accept optional `leagueId` and skip creating players already existing; populate `tournament_players` from provided league members.
- Add `LeagueContext` (similar to TournamentContext) for UI state: leagues list, current league, leaderboard, create/update actions.

## Result → Points Flow
1. Tournament completion triggers `recordTournamentResults` (manual button + automatic when status becomes `completed`).
2. Determine placements:
   - If playoffs exist: use final, third-place outcomes; losers ranked by round/seed.
   - If group-only: rank by standings order (criteria already defined per tournament).
3. Award points per `scoring_rules`:
   - Base placement points, participation point, per-match win bonus from match data, optional bonus metrics (highest average, etc.).
   - Persist rows in `league_tournament_results` (and audit events if enabled).
4. Rebuild/refresh leaderboard cache (materialized view or `league_leaderboard` table).

## Default Tournament Settings Merge
- Source: `leagues.default_tournament_settings` shaped like TournamentCreation payload.
- On league tournament creation:
  - Pre-fill `legsToWin`, `startingScore`, `tournamentType`, `groupSettings`, `playoffSettings`, `standingsCriteriaOrder`.
  - Players: include all `league_members.is_active = true`; allow toggling per player and adding ad-hoc players.
  - Persist selected players in `tournament_players`; if player not in global `players` table, create then optionally add to league_members (flag).

## UI/Routes
- `LeaguesList` (new route `/leagues`): cards with status, tournaments count, next tournament CTA.
- `LeagueDetail` (`/leagues/:id`):
  - Leaderboard table with points and key stats; filter by season.
  - Tournaments tab: reuse `TournamentsList` filtered by league; create button uses league defaults.
  - Players tab: list with toggle for auto-enroll, add/remove, role badges.
  - Settings tab: edit scoring rules and defaults; manager-only actions.
- Tournament pages show badge `League: <name>` linking back.

## Phased Implementation
1) Schema & service
   - Add Supabase tables/columns; migrations & RLS rules.
   - Implement `leagueService` and extend `tournamentService` for `league_id`.
2) UI plumbing
   - `LeagueContext`, nav entry, list/detail pages.
   - League-aware tournament creation flow (pre-fill defaults, auto players).
3) Points + leaderboard
   - Placement calculation pipeline; write `league_tournament_results`; leaderboard aggregation.
   - Manual “Recalculate points” admin action.
4) Polishing
   - Stats display (averages, win rate), filters by season.
   - Email/shareable invite links (optional).
   - Cypress coverage for league create, tournament create with defaults, points calc.

## Decisions Made
- **Scoring Model**: Placement-only scoring (no match-level bonuses for MVP)
- **Season Handling**: Not needed for MVP (can be added later)
- **Post-Creation Attachment**: Yes, tournaments can have `league_id` set later
- **Missing Players**: Stay neutral (no penalty, no points awarded)

## Next Steps (recommended)
- Confirm scoring schema and season rules.
- Approve proposed DB changes.
- Build `leagueService` + migrations, then ship list/detail UI and league-aware tournament creation.


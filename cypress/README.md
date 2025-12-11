# Cypress E2E Tests

This directory contains end-to-end tests for the Darts Tournament Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Create test user account** (if not exists):
   - Go to your app and sign up a test user
   - Or use an existing account
   - Note the email and password

3. **Configure test credentials** (optional):
   Create `cypress.env.json` file:
```json
{
  "TEST_USER_EMAIL": "your-test-email@example.com",
  "TEST_USER_PASSWORD": "your-test-password"
}
```
   **Note**: Add `cypress.env.json` to `.gitignore` to keep credentials safe!

4. Start the development server:
```bash
npm run dev
```

5. Run Cypress tests:
```bash
# Open Cypress Test Runner (interactive)
npm run test:e2e:open

# Run tests headlessly
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

## Authentication

All tests require a logged-in user. The tests automatically log in using:
- Credentials from `cypress.env.json` (if exists)
- Or default test credentials: `test@example.com` / `testpassword123`
- Or credentials passed to `cy.login(email, password)`

**Important**: Make sure you have a test user account set up in your Supabase database!

## Test Structure

- `cypress/e2e/` - Test files
  - `tournament-creation.cy.js` - Tournament creation flow
  - `tournament-registration.cy.js` - Player registration
  - `complete-tournament-flow.cy.js` - Full tournament flow
  - `playoff-auto-propagation.cy.js` - Playoff seeding and propagation
  - `match-completion.cy.js` - Match completion flow

- `cypress/fixtures/` - Test data
  - `tournaments.json` - Tournament fixtures
  - `auth.json` - Authentication fixtures

- `cypress/support/` - Support files
  - `commands.js` - Custom Cypress commands
  - `e2e.js` - Global test configuration
  - `match-helpers.js` - Match completion helpers

## Custom Commands

The following custom commands are available:

- `cy.login(email, password)` - Logs in a user
- `cy.logout()` - Logs out current user
- `cy.ensureLoggedIn()` - Ensures user is logged in (logs in if needed)
- `cy.createTournament(name)` - Creates a new tournament (auto-logs in)
- `cy.addPlayer(name)` - Adds a player to tournament
- `cy.addPlayers(names[])` - Adds multiple players
- `cy.startTournament()` - Starts the tournament
- `cy.completeMatch(selector, options)` - Completes a match
- `cy.completeAllGroupMatches()` - Completes all group matches
- `cy.startPlayoffs()` - Starts playoffs
- `cy.waitForTournament()` - Waits for tournament to load

## Writing Tests

### Example Test with Login

```javascript
describe('My Test Suite', () => {
  beforeEach(() => {
    // Log in before each test
    cy.login()
  })

  it('should do something', () => {
    cy.visit('/tournaments')
    cy.createTournament('Test Tournament')
    cy.addPlayers(['Player 1', 'Player 2'])
    cy.startTournament()
    // ... more test steps
  })
})
```

## Configuration

Cypress is configured in `cypress.config.js`:
- Base URL: `http://localhost:5173` (Vite default)
- Viewport: 1280x720
- Videos and screenshots enabled on failure

## Environment Variables

Create `cypress.env.json` (not committed to git) with:
```json
{
  "TEST_USER_EMAIL": "test@example.com",
  "TEST_USER_PASSWORD": "testpassword123"
}
```

## Notes

- Tests assume the dev server is running on `http://localhost:5173`
- Tests automatically log in before running
- Some tests require match completion which may need API mocking or full UI interaction
- For faster tests, consider mocking Supabase API calls
- Screenshots and videos are saved on test failures

## Troubleshooting

- **Tests timeout**: Increase `defaultCommandTimeout` in `cypress.config.js`
- **Element not found**: Check selectors match your UI structure
- **Navigation issues**: Ensure routes are correct and app is running
- **Login fails**: 
  - Check test user exists in Supabase
  - Verify credentials in `cypress.env.json`
  - Check Supabase connection

## Security Note

⚠️ **Never commit `cypress.env.json` to git!** It contains test credentials.
The file is already in `.gitignore`.

# Cypress E2E Testing Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Keep this running in one terminal.

### 3. Run Cypress Tests

**Option A: Interactive Mode (Recommended for development)**
```bash
npm run test:e2e:open
```
This opens the Cypress Test Runner where you can:
- See tests run in real-time
- Debug tests step-by-step
- See what's happening in the browser

**Option B: Headless Mode (For CI/CD)**
```bash
npm run test:e2e
```

**Option C: Headed Mode (See browser but automated)**
```bash
npm run test:e2e:headed
```

## Test Files

- `cypress/e2e/tournament-creation.cy.js` - Tests tournament creation
- `cypress/e2e/tournament-registration.cy.js` - Tests player registration
- `cypress/e2e/complete-tournament-flow.cy.js` - Full tournament flow
- `cypress/e2e/playoff-auto-propagation.cy.js` - Playoff seeding tests
- `cypress/e2e/match-completion.cy.js` - Match completion tests

## Custom Commands

You can use these custom commands in your tests:

```javascript
cy.createTournament('Tournament Name')
cy.addPlayer('Player Name')
cy.addPlayers(['Player 1', 'Player 2', 'Player 3'])
cy.startTournament()
cy.completeMatch('.match-selector', { winner: 'player1' })
cy.startPlayoffs()
```

## Test API (Optional)

For faster tests, you can expose a test API in your app:

```javascript
// In your app (development only)
if (import.meta.env.DEV && window.Cypress) {
  window.testAPI = {
    completeMatch: async (matchId, result) => {
      // Directly complete match via service
      await matchService.saveMatchResult({
        matchId,
        ...result
      })
    },
    getGroupMatches: async (groupId) => {
      // Get all matches in a group
    },
    getAllGroups: async () => {
      // Get all groups
    }
  }
}
```

## Configuration

Cypress is configured in `cypress.config.js`:
- Base URL: `http://localhost:5173` (Vite default)
- Viewport: 1280x720
- Videos and screenshots enabled on failure

## Troubleshooting

### Tests can't find elements
- Make sure the dev server is running
- Check that selectors match your UI
- Use Cypress's built-in selector tools (click "Selector Playground" in Test Runner)

### Tests timeout
- Increase `defaultCommandTimeout` in `cypress.config.js`
- Check if the app is loading slowly

### Match completion not working
- Match completion via UI requires full interaction
- Consider using test API for faster tests
- Or mock Supabase responses

## Next Steps

1. Run `npm run test:e2e:open` to see tests in action
2. Modify tests to match your exact UI structure
3. Add more test scenarios as needed
4. Set up CI/CD to run tests automatically


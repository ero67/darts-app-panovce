# Testing Plan for Darts Tournament Manager

## Overview
This document outlines a comprehensive testing strategy to automate testing of the tournament flow, eliminating the need to manually click through every match.

## Current State
- **No testing framework installed**
- **Vite** is used as the build tool
- **React 19** with React Router
- **Supabase** for backend/database

---

## 1. Testing Framework Recommendations

### Primary Framework: **Vitest**
- **Why**: Native Vite integration, fast, Jest-compatible API
- **Best for**: Unit tests, integration tests, component tests
- **Setup**: Minimal configuration needed with Vite

### E2E Framework: **Playwright** (Recommended) or **Cypress**
- **Why**: Fast, reliable, supports multiple browsers
- **Best for**: Full user flow testing, browser automation
- **Alternative**: Cypress (easier setup, but slower)

---

## 2. Test Structure

```
tests/
├── unit/                    # Unit tests for pure functions
│   ├── services/
│   │   └── tournamentService.test.js
│   ├── utils/
│   │   └── seeding.test.js
│   └── helpers/
│       └── standings.test.js
├── integration/            # Component integration tests
│   ├── components/
│   │   ├── TournamentManagement.test.jsx
│   │   ├── TournamentRegistration.test.jsx
│   │   └── MatchInterface.test.jsx
│   └── contexts/
│       └── TournamentContext.test.jsx
├── e2e/                    # End-to-end tests
│   ├── tournament-flow.spec.js
│   ├── playoff-flow.spec.js
│   └── match-completion.spec.js
├── fixtures/               # Mock data
│   ├── tournaments.js
│   ├── players.js
│   └── matches.js
└── helpers/                # Test utilities
    ├── test-utils.jsx
    ├── mock-supabase.js
    └── mock-data-builder.js
```

---

## 3. Installation & Setup

### Step 1: Install Dependencies

```bash
# Unit/Integration Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E Testing (Playwright)
npm install -D @playwright/test

# Or Cypress (alternative)
npm install -D cypress
```

### Step 2: Configure Vitest

Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### Step 3: Update package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 4. Test Categories & Scenarios

### 4.1 Unit Tests

#### Tournament Service Tests
```javascript
// tests/unit/services/tournamentService.test.js
describe('TournamentService', () => {
  test('creates tournament with correct structure')
  test('generates groups correctly')
  test('calculates standings with custom criteria order')
  test('starts tournament with group settings')
  test('handles playoff seeding (standard)')
  test('handles playoff seeding (group-based)')
})
```

#### Seeding Logic Tests
```javascript
// tests/unit/utils/seeding.test.js
describe('Seeding Functions', () => {
  test('standard seeding for 16 players')
  test('standard seeding for 8 players')
  test('group-based seeding with matchups')
  test('handles odd number of qualifiers')
})
```

#### Standings Calculation Tests
```javascript
// tests/unit/helpers/standings.test.js
describe('Standings Calculation', () => {
  test('sorts by matches won')
  test('sorts by leg difference')
  test('sorts by average')
  test('sorts by head-to-head')
  test('handles custom criteria order')
})
```

### 4.2 Integration Tests

#### Tournament Management Component
```javascript
// tests/integration/components/TournamentManagement.test.jsx
describe('TournamentManagement', () => {
  test('displays groups correctly')
  test('shows matches in groups')
  test('allows starting playoffs')
  test('auto-seeds first round')
  test('propagates winners automatically')
})
```

#### Match Completion Flow
```javascript
// tests/integration/components/MatchInterface.test.jsx
describe('Match Completion', () => {
  test('completes group match and updates standings')
  test('completes playoff match and advances winner')
  test('updates statistics correctly')
  test('handles match reset')
})
```

### 4.3 End-to-End Tests

#### Full Tournament Flow
```javascript
// tests/e2e/tournament-flow.spec.js
test('Complete tournament flow', async ({ page }) => {
  // 1. Create tournament
  await page.goto('/tournaments')
  await page.click('text=Create Tournament')
  await page.fill('input[name="tournamentName"]', 'Test Tournament')
  await page.click('button:has-text("Create")')
  
  // 2. Add players
  for (let i = 1; i <= 8; i++) {
    await page.fill('input[placeholder*="player"]', `Player ${i}`)
    await page.click('button:has-text("Add Player")')
  }
  
  // 3. Start tournament
  await page.click('button:has-text("Start Tournament")')
  
  // 4. Complete all group matches
  const matches = await page.locator('.match-card').all()
  for (const match of matches) {
    await match.click()
    // Auto-complete match with mock scores
    await completeMatchAutomatically(page)
  }
  
  // 5. Start playoffs
  await page.click('button:has-text("Start Playoffs")')
  
  // 6. Verify seeding
  await expect(page.locator('.playoff-match')).toHaveCount(4) // Quarterfinals
  
  // 7. Complete playoff matches
  // ... continue through all rounds
})
```

#### Playoff Auto-Propagation Test
```javascript
// tests/e2e/playoff-flow.spec.js
test('Playoff auto-propagation', async ({ page }) => {
  // Setup: Tournament with completed group stage
  await setupCompletedGroupStage(page)
  
  // Start playoffs
  await page.click('button:has-text("Start Playoffs")')
  
  // Verify first round is seeded
  const firstRoundMatches = await page.locator('.round:first-child .match').all()
  expect(firstRoundMatches.length).toBeGreaterThan(0)
  
  // Complete first match
  await firstRoundMatches[0].click()
  await completeMatchWithWinner(page, 'player1')
  
  // Verify winner advanced to next round
  const nextRoundMatch = await page.locator('.round:nth-child(2) .match:first-child')
  await expect(nextRoundMatch.locator('.player1')).toContainText('Winner Name')
})
```

---

## 5. Mock Data & Fixtures

### Tournament Fixtures
```javascript
// tests/fixtures/tournaments.js
export const mockTournament = {
  id: 'test-tournament-1',
  name: 'Test Tournament',
  status: 'active',
  legsToWin: 3,
  startingScore: 501,
  players: [
    { id: 'p1', name: 'Player 1' },
    { id: 'p2', name: 'Player 2' },
    // ... 8 players
  ],
  groups: [
    {
      id: 'g1',
      name: 'Group A',
      players: [/* ... */],
      matches: [/* ... */]
    }
  ]
}
```

### Match Completion Helper
```javascript
// tests/helpers/match-completion.js
export async function completeMatchAutomatically(page, winner = 'player1') {
  // Click start match
  await page.click('button:has-text("Start Match")')
  
  // Simulate dart throws (or use API to set scores directly)
  // For testing, we can mock the completion
  await page.evaluate((winner) => {
    // Directly complete match via test API
    window.testAPI?.completeMatch(winner)
  }, winner)
  
  // Or simulate actual throws
  // await simulateDartThrows(page, targetScore)
}
```

---

## 6. Test Scenarios to Cover

### Scenario 1: Small Tournament (4 players, 2 groups)
- ✅ Create tournament
- ✅ Add 4 players
- ✅ Start tournament (creates 2 groups of 2)
- ✅ Complete all group matches
- ✅ Verify standings
- ✅ Start playoffs (if enabled)
- ✅ Complete playoff matches
- ✅ Verify tournament completion

### Scenario 2: Medium Tournament (8 players, 2 groups)
- ✅ All steps from Scenario 1
- ✅ Verify group-based seeding
- ✅ Test standard seeding
- ✅ Test playoff progression

### Scenario 3: Large Tournament (16 players, 4 groups)
- ✅ All steps from Scenario 1
- ✅ Test Top 16 playoff bracket
- ✅ Test automatic seeding
- ✅ Test winner propagation through all rounds

### Scenario 4: Group-Based Seeding
- ✅ Configure group matchups
- ✅ Verify seeding matches configuration
- ✅ Test 1st vs last, 2nd vs second-to-last logic

### Scenario 5: Match Reset & Recovery
- ✅ Complete match
- ✅ Verify progression
- ✅ Reset match
- ✅ Verify next round cleared
- ✅ Re-complete match
- ✅ Verify progression again

### Scenario 6: Statistics & Standings
- ✅ Complete matches with various scores
- ✅ Verify averages calculated correctly
- ✅ Verify standings sorted correctly
- ✅ Test custom criteria order

---

## 7. Mock Supabase Setup

### Mock Supabase Client
```javascript
// tests/helpers/mock-supabase.js
import { vi } from 'vitest'

export const createMockSupabase = () => {
  const mockData = {
    tournaments: [],
    players: [],
    matches: []
  }
  
  return {
    from: (table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((callback) => {
        const result = { data: mockData[table], error: null }
        return Promise.resolve(callback(result))
      })
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })
    }
  }
}
```

---

## 8. Test Data Builder Pattern

### Builder for Easy Test Data Creation
```javascript
// tests/helpers/test-data-builder.js
export class TournamentBuilder {
  constructor() {
    this.tournament = {
      id: generateId(),
      name: 'Test Tournament',
      status: 'open_for_registration',
      players: [],
      groups: []
    }
  }
  
  withPlayers(count) {
    for (let i = 1; i <= count; i++) {
      this.tournament.players.push({
        id: `p${i}`,
        name: `Player ${i}`
      })
    }
    return this
  }
  
  withGroups(count, playersPerGroup) {
    // Generate groups with players
    return this
  }
  
  withCompletedGroupStage() {
    // Mark all group matches as completed
    return this
  }
  
  build() {
    return this.tournament
  }
}

// Usage:
const tournament = new TournamentBuilder()
  .withPlayers(8)
  .withGroups(2, 4)
  .withCompletedGroupStage()
  .build()
```

---

## 9. Automated Test Scripts

### Quick Test Scripts
```javascript
// tests/scripts/quick-tournament-test.js
// Run a complete tournament flow programmatically

export async function runQuickTournamentTest() {
  // 1. Create tournament via API
  const tournament = await createTournament({
    name: 'Quick Test Tournament',
    legsToWin: 3,
    startingScore: 501
  })
  
  // 2. Add players
  for (let i = 1; i <= 8; i++) {
    await addPlayer(tournament.id, `Player ${i}`)
  }
  
  // 3. Start tournament
  await startTournament(tournament.id, {
    type: 'groups',
    value: 2
  })
  
  // 4. Complete all matches
  const groups = await getGroups(tournament.id)
  for (const group of groups) {
    for (const match of group.matches) {
      await completeMatch(match.id, {
        winner: match.player1.id,
        player1Legs: 2,
        player2Legs: 0
      })
    }
  }
  
  // 5. Start playoffs
  await startPlayoffs(tournament.id)
  
  // 6. Complete playoff matches
  // ... continue through all rounds
  
  return tournament
}
```

---

## 10. CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

---

## 11. Implementation Priority

### Phase 1: Basic Setup (High Priority)
1. ✅ Install Vitest and testing libraries
2. ✅ Set up basic configuration
3. ✅ Create mock Supabase helper
4. ✅ Write unit tests for seeding functions
5. ✅ Write unit tests for standings calculation

### Phase 2: Component Tests (Medium Priority)
1. ✅ Test TournamentManagement component
2. ✅ Test MatchInterface component
3. ✅ Test playoff seeding UI
4. ✅ Test group matchup configuration

### Phase 3: E2E Tests (High Priority)
1. ✅ Install Playwright
2. ✅ Create full tournament flow test
3. ✅ Create playoff flow test
4. ✅ Create match completion test

### Phase 4: Advanced Testing (Low Priority)
1. ✅ Performance tests
2. ✅ Visual regression tests
3. ✅ Accessibility tests
4. ✅ Load/stress tests

---

## 12. Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @playwright/test
```

### Step 2: Create Test Files
```bash
mkdir -p tests/unit tests/integration tests/e2e tests/fixtures tests/helpers
```

### Step 3: Write First Test
Create `tests/unit/utils/seeding.test.js`:
```javascript
import { describe, test, expect } from 'vitest'
import { seedFirstRound } from '../../../src/components/TournamentManagement'

describe('Seeding', () => {
  test('seeds 8 players correctly', () => {
    const players = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      name: `Player ${i + 1}`
    }))
    
    const firstRound = {
      matches: Array.from({ length: 4 }, () => ({
        player1: null,
        player2: null
      }))
    }
    
    const seeded = seedFirstRound(players, firstRound, {})
    
    expect(seeded.matches[0].player1).toBe(players[0])
    expect(seeded.matches[0].player2).toBe(players[7])
  })
})
```

### Step 4: Run Tests
```bash
npm run test
```

---

## 13. Benefits

### Time Savings
- **Manual testing**: ~30-60 minutes per full tournament flow
- **Automated testing**: ~2-5 minutes for multiple scenarios
- **Regression testing**: Catch bugs immediately

### Quality Assurance
- ✅ Test edge cases automatically
- ✅ Verify calculations are correct
- ✅ Ensure UI updates correctly
- ✅ Catch breaking changes early

### Development Speed
- ✅ Confident refactoring
- ✅ Faster feature development
- ✅ Better code quality
- ✅ Documentation through tests

---

## 14. Next Steps

1. **Review this plan** and decide on testing framework
2. **Install dependencies** (Vitest + Playwright recommended)
3. **Set up basic configuration**
4. **Write first unit test** (seeding function)
5. **Write first E2E test** (simple tournament creation)
6. **Gradually expand** test coverage
7. **Integrate into CI/CD** pipeline

---

## Conclusion

This testing plan provides a comprehensive approach to automate testing of the tournament flow. Starting with unit tests for core functions and gradually building up to full E2E tests will ensure the application works correctly without manual clicking through every match.

**Recommended Starting Point**: 
1. Install Vitest
2. Write unit tests for seeding functions
3. Install Playwright
4. Write one E2E test for complete tournament flow
5. Expand from there


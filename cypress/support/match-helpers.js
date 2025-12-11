/**
 * Helper functions for match completion in tests
 * These can be used to complete matches programmatically
 */

/**
 * Complete a match via direct API call (if test API is available)
 * @param {string} matchId - The match ID
 * @param {object} result - Match result { winner, player1Legs, player2Legs }
 */
export function completeMatchViaAPI(matchId, result) {
  return cy.window().then((win) => {
    if (win.testAPI && win.testAPI.completeMatch) {
      return win.testAPI.completeMatch(matchId, result)
    } else {
      cy.log('Test API not available - match completion via API not possible')
      return Promise.resolve()
    }
  })
}

/**
 * Simulate completing a match by setting scores directly
 * This bypasses the UI and directly sets match results
 * @param {string} matchId - The match ID
 * @param {object} options - { winner: 'player1'|'player2', player1Legs: 2, player2Legs: 0 }
 */
export function simulateMatchCompletion(matchId, options = {}) {
  const { winner = 'player1', player1Legs = 2, player2Legs = 0 } = options
  
  return cy.window().then((win) => {
    // Try to access tournament context or service directly
    if (win.__TOURNAMENT_CONTEXT__) {
      const context = win.__TOURNAMENT_CONTEXT__
      const matchResult = {
        matchId,
        winner: winner === 'player1' ? 'player1Id' : 'player2Id',
        player1Legs,
        player2Legs,
        player1Stats: { totalScore: 1503, totalDarts: 60, average: 75.15 },
        player2Stats: { totalScore: 0, totalDarts: 0, average: 0 }
      }
      return context.completeMatch(matchResult)
    } else {
      cy.log('Tournament context not available - using API fallback')
      return completeMatchViaAPI(matchId, { winner, player1Legs, player2Legs })
    }
  })
}

/**
 * Complete all matches in a group
 * @param {string} groupId - The group ID
 */
export function completeAllMatchesInGroup(groupId) {
  return cy.window().then((win) => {
    if (win.testAPI && win.testAPI.getGroupMatches) {
      return win.testAPI.getGroupMatches(groupId).then((matches) => {
        matches.forEach((match, index) => {
          // Alternate winners for variety
          const winner = index % 2 === 0 ? 'player1' : 'player2'
          simulateMatchCompletion(match.id, {
            winner,
            player1Legs: winner === 'player1' ? 2 : 0,
            player2Legs: winner === 'player2' ? 2 : 0
          })
        })
      })
    } else {
      cy.log('Test API not available for group match completion')
    }
  })
}

/**
 * Complete all group stage matches
 */
export function completeAllGroupStageMatches() {
  return cy.window().then((win) => {
    if (win.testAPI && win.testAPI.getAllGroups) {
      return win.testAPI.getAllGroups().then((groups) => {
        groups.forEach((group) => {
          completeAllMatchesInGroup(group.id)
        })
      })
    } else {
      cy.log('Test API not available - cannot complete group matches automatically')
      cy.log('You may need to complete matches manually or set up test API')
    }
  })
}


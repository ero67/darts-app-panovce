import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { tournamentService, matchService } from '../services/tournamentService.js';


const TournamentContext = createContext();

// Action types
const ACTIONS = {
  CREATE_TOURNAMENT: 'CREATE_TOURNAMENT',
  LOAD_TOURNAMENTS: 'LOAD_TOURNAMENTS',
  SELECT_TOURNAMENT: 'SELECT_TOURNAMENT',
  UPDATE_MATCH_RESULT: 'UPDATE_MATCH_RESULT',
  START_MATCH: 'START_MATCH',
  COMPLETE_MATCH: 'COMPLETE_MATCH',
  DELETE_TOURNAMENT: 'DELETE_TOURNAMENT',
  UPDATE_TOURNAMENT_STATUS: 'UPDATE_TOURNAMENT_STATUS',
  START_PLAYOFFS: 'START_PLAYOFFS'
};

// Initial state
const initialState = {
  tournaments: [],
  currentTournament: null,
  currentMatch: null,
  loading: false,
  error: null
};

// Reducer
function tournamentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.CREATE_TOURNAMENT:
      return {
        ...state,
        tournaments: [...state.tournaments, action.payload],
        currentTournament: action.payload
      };

    case ACTIONS.LOAD_TOURNAMENTS:
      return {
        ...state,
        tournaments: action.payload,
        loading: false
      };

    case ACTIONS.SELECT_TOURNAMENT:
      return {
        ...state,
        currentTournament: action.payload
      };

    case ACTIONS.START_MATCH:
      return {
        ...state,
        currentMatch: action.payload
      };

    case ACTIONS.COMPLETE_MATCH:
      if (!state.currentTournament) {
        console.error('No current tournament to update');
        return state;
      }
      
      const updatedTournament = { ...state.currentTournament };
      const group = updatedTournament.groups?.find(g => g.id === action.payload.groupId);
      
      if (!group) {
        console.error('Group not found for match completion:', action.payload.groupId);
        return state;
      }
      
      const match = group.matches?.find(m => m.id === action.payload.matchId);
      
      if (!match) {
        console.error('Match not found for completion:', action.payload.matchId);
        return state;
      }
      
      match.result = action.payload;
      match.status = 'completed';
      
      // Update group standings
      updateGroupStandings(group);
      
      // Update tournament in tournaments array
      const updatedTournaments = state.tournaments.map(t => 
        t.id === updatedTournament.id ? updatedTournament : t
      );
      
      return {
        ...state,
        currentTournament: updatedTournament,
        tournaments: updatedTournaments,
        currentMatch: null
      };

    case ACTIONS.DELETE_TOURNAMENT:
      return {
        ...state,
        tournaments: state.tournaments.filter(t => t.id !== action.payload),
        currentTournament: state.currentTournament?.id === action.payload ? null : state.currentTournament
      };

    case ACTIONS.UPDATE_TOURNAMENT_STATUS:
      const tournamentToUpdate = state.tournaments.find(t => t.id === action.payload.id);
      if (tournamentToUpdate) {
        tournamentToUpdate.status = action.payload.status;
        tournamentToUpdate.updatedAt = new Date().toISOString();
      }
      return {
        ...state,
        tournaments: [...state.tournaments]
      };

    case ACTIONS.START_PLAYOFFS:
      if (!state.currentTournament) {
        console.error('No current tournament to start playoffs');
        return state;
      }
      
      const tournamentWithPlayoffs = {
        ...state.currentTournament,
        playoffs: action.payload.playoffs
      };
      
      return {
        ...state,
        currentTournament: tournamentWithPlayoffs,
        tournaments: state.tournaments.map(t => 
          t.id === state.currentTournament.id ? tournamentWithPlayoffs : t
        )
      };

    default:
      return state;
  }
}

// Helper function to update group standings
function updateGroupStandings(group) {
  if (!group || !group.players || !group.matches) {
    console.error('Invalid group data for standings update:', group);
    return;
  }
  
  const standings = {};
  
  // Initialize standings
  group.players.forEach(player => {
    if (player && player.id) {
      standings[player.id] = {
        player,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        legsWon: 0,
        legsLost: 0,
        average: 0,
        points: 0
      };
    }
  });

  // Calculate standings from completed matches
  group.matches.forEach(match => {
    if (match.status === 'completed' && match.result && match.player1 && match.player2) {
      const { player1, player2, result } = match;
      const p1Stats = standings[player1.id];
      const p2Stats = standings[player2.id];
      
      if (!p1Stats || !p2Stats) {
        console.error('Player stats not found for match:', match);
        return;
      }
      
      p1Stats.matchesPlayed++;
      p2Stats.matchesPlayed++;
      
      if (result.winner === player1.id) {
        p1Stats.matchesWon++;
        p2Stats.matchesLost++;
        p1Stats.points += 3;
      } else {
        p2Stats.matchesWon++;
        p1Stats.matchesLost++;
        p2Stats.points += 3;
      }
      
      p1Stats.legsWon += result.player1Legs || 0;
      p1Stats.legsLost += result.player2Legs || 0;
      p2Stats.legsWon += result.player2Legs || 0;
      p2Stats.legsLost += result.player1Legs || 0;
      
      // Update averages - use the match average which is already calculated as average of leg averages
      if (result.player1Stats?.average) {
        p1Stats.average = result.player1Stats.average;
      }
      if (result.player2Stats?.average) {
        p2Stats.average = result.player2Stats.average;
      }
    }
  });

  // Sort standings by points, then by leg difference
  group.standings = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.legsWon - b.legsLost) - (a.legsWon - a.legsLost);
  });
}

// Context Provider
export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);

  // Load tournaments from Supabase on mount
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const tournaments = await tournamentService.getTournaments();
        dispatch({ type: ACTIONS.LOAD_TOURNAMENTS, payload: tournaments });
      } catch (error) {
        console.error('Error loading tournaments:', error);
        // Fallback to localStorage if Supabase fails
        const savedTournaments = localStorage.getItem('darts-tournaments');
        if (savedTournaments) {
          try {
            const tournaments = JSON.parse(savedTournaments);
            dispatch({ type: ACTIONS.LOAD_TOURNAMENTS, payload: tournaments });
          } catch (localError) {
            console.error('Error loading from localStorage:', localError);
          }
        }
      }
    };

    loadTournaments();
  }, []);

  // Save tournaments to localStorage as backup whenever tournaments change
  useEffect(() => {
    if (state.tournaments.length > 0) {
      localStorage.setItem('darts-tournaments', JSON.stringify(state.tournaments));
    }
  }, [state.tournaments]);

  // Actions
  const createTournament = async (tournamentData) => {
    try {
      const tournament = await tournamentService.createTournament(tournamentData);
      dispatch({ type: ACTIONS.CREATE_TOURNAMENT, payload: tournament });
      return tournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      // Fallback to local creation
      const tournament = {
        ...tournamentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      dispatch({ type: ACTIONS.CREATE_TOURNAMENT, payload: tournament });
      return tournament;
    }
  };

  const selectTournament = (tournament) => {
    dispatch({ type: ACTIONS.SELECT_TOURNAMENT, payload: tournament });
  };

  const startMatch = (match) => {
    dispatch({ type: ACTIONS.START_MATCH, payload: match });
  };

  const completeMatch = async (matchResult) => {
    console.log('TournamentContext.completeMatch called with:', matchResult);
    try {
      // Save to Supabase first
      await matchService.saveMatchResult(matchResult);
      console.log('Match result saved to Supabase successfully');
    } catch (error) {
      console.error('Error saving match result to Supabase:', error);
      // Continue with local update even if Supabase fails
    }
    
    // Update local state
    dispatch({ type: ACTIONS.COMPLETE_MATCH, payload: matchResult });
  };

  const deleteTournament = async (tournamentId) => {
    try {
      await tournamentService.deleteTournament(tournamentId);
      dispatch({ type: ACTIONS.DELETE_TOURNAMENT, payload: tournamentId });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      // Still dispatch to remove from local state
      dispatch({ type: ACTIONS.DELETE_TOURNAMENT, payload: tournamentId });
    }
  };

  const updateTournamentStatus = (tournamentId, status) => {
    dispatch({ type: ACTIONS.UPDATE_TOURNAMENT_STATUS, payload: { id: tournamentId, status } });
  };

  const startPlayoffs = async (playoffsData) => {
    try {
      // Save playoff data to Supabase
      await tournamentService.updateTournamentPlayoffs(state.currentTournament.id, playoffsData);
      console.log('Playoff data saved to Supabase successfully');
    } catch (error) {
      console.error('Error saving playoff data to Supabase:', error);
    }
    
    // Update local state
    dispatch({ type: ACTIONS.START_PLAYOFFS, payload: { playoffs: playoffsData } });
  };

  const startTournament = async (groupSettings) => {
    try {
      const updatedTournament = await tournamentService.startTournament(state.currentTournament.id, groupSettings);
      dispatch({ type: ACTIONS.SELECT_TOURNAMENT, payload: updatedTournament });
      return updatedTournament;
    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  };

  const addPlayerToTournament = async (playerName) => {
    try {
      const newPlayer = await tournamentService.addPlayerToTournament(state.currentTournament.id, playerName);
      // Refresh tournament data to get updated player list
      const updatedTournament = await tournamentService.getTournament(state.currentTournament.id);
      dispatch({ type: ACTIONS.SELECT_TOURNAMENT, payload: updatedTournament });
      return newPlayer;
    } catch (error) {
      console.error('Error adding player to tournament:', error);
      throw error;
    }
  };

  const getTournament = async (tournamentId) => {
    try {
      const tournament = await tournamentService.getTournament(tournamentId);
      dispatch({ type: ACTIONS.SELECT_TOURNAMENT, payload: tournament });
      return tournament;
    } catch (error) {
      console.error('Error loading tournament:', error);
      throw error;
    }
  };

  const updateTournamentSettings = async (tournamentId, settings) => {
    try {
      const updatedTournament = await tournamentService.updateTournamentSettings(tournamentId, settings);
      dispatch({ type: ACTIONS.SELECT_TOURNAMENT, payload: updatedTournament });
      return updatedTournament;
    } catch (error) {
      console.error('Error updating tournament settings:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    createTournament,
    selectTournament,
    getTournament,
    startMatch,
    completeMatch,
    deleteTournament,
    updateTournamentStatus,
    startPlayoffs,
    startTournament,
    addPlayerToTournament,
    updateTournamentSettings
  };

  // Debug: Log available functions
  console.log('TournamentContext value functions:', {
    updateTournamentSettings: typeof updateTournamentSettings,
    startTournament: typeof startTournament,
    addPlayerToTournament: typeof addPlayerToTournament
  });

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

// Custom hook to use tournament context
export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LiveMatchContext = createContext();

// Action types
const ACTIONS = {
  START_LIVE_MATCH: 'START_LIVE_MATCH',
  END_LIVE_MATCH: 'END_LIVE_MATCH',
  UPDATE_LIVE_MATCH: 'UPDATE_LIVE_MATCH',
  SYNC_LIVE_MATCHES: 'SYNC_LIVE_MATCHES',
  DEVICE_CONNECTED: 'DEVICE_CONNECTED',
  DEVICE_DISCONNECTED: 'DEVICE_DISCONNECTED'
};

// Initial state
const initialState = {
  liveMatches: new Map(), // Map of matchId -> { deviceId, startedAt, lastUpdate }
  deviceId: null,
  isOnline: true,
  lastSync: null
};

// Reducer
function liveMatchReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_LIVE_MATCH:
      return {
        ...state,
        liveMatches: new Map(state.liveMatches).set(action.payload.matchId, {
          deviceId: action.payload.deviceId,
          startedAt: action.payload.startedAt,
          lastUpdate: Date.now(),
          matchData: action.payload.matchData,
          userId: action.payload.userId,
          userEmail: action.payload.userEmail
        })
      };

    case ACTIONS.END_LIVE_MATCH:
      const newLiveMatches = new Map(state.liveMatches);
      newLiveMatches.delete(action.payload.matchId);
      return {
        ...state,
        liveMatches: newLiveMatches
      };

    case ACTIONS.UPDATE_LIVE_MATCH:
      const updatedLiveMatches = new Map(state.liveMatches);
      if (updatedLiveMatches.has(action.payload.matchId)) {
        const existing = updatedLiveMatches.get(action.payload.matchId);
        updatedLiveMatches.set(action.payload.matchId, {
          ...existing,
          lastUpdate: Date.now(),
          matchData: action.payload.matchData
        });
      }
      return {
        ...state,
        liveMatches: updatedLiveMatches
      };

    case ACTIONS.SYNC_LIVE_MATCHES:
      return {
        ...state,
        liveMatches: new Map(action.payload.liveMatches),
        lastSync: Date.now()
      };

    case ACTIONS.DEVICE_CONNECTED:
      return {
        ...state,
        deviceId: action.payload.deviceId,
        isOnline: true
      };

    case ACTIONS.DEVICE_DISCONNECTED:
      return {
        ...state,
        isOnline: false
      };

    default:
      return state;
  }
}

// Generate unique device ID
const generateDeviceId = () => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Context Provider
export function LiveMatchProvider({ children }) {
  const [state, dispatch] = useReducer(liveMatchReducer, initialState);
  const { user } = useAuth();

  // Initialize device ID
  useEffect(() => {
    const deviceId = localStorage.getItem('darts-device-id') || generateDeviceId();
    localStorage.setItem('darts-device-id', deviceId);
    dispatch({ type: ACTIONS.DEVICE_CONNECTED, payload: { deviceId } });
  }, []);

  // Load live matches from localStorage on mount
  useEffect(() => {
    const savedLiveMatches = localStorage.getItem('darts-live-matches');
    if (savedLiveMatches) {
      try {
        const liveMatchesData = JSON.parse(savedLiveMatches);
        const liveMatchesMap = new Map(liveMatchesData);
        
        // Clean up old matches (older than 1 hour) and completed matches
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const cleanedMatches = new Map();
        
        for (const [matchId, matchData] of liveMatchesMap) {
          // Skip if match is marked as completed in matchData
          if (matchData.matchData?.matchComplete || matchData.matchData?.status === 'completed') {
            continue;
          }
          
          // Skip if match is older than 1 hour
          if (matchData.lastUpdate > oneHourAgo) {
            cleanedMatches.set(matchId, matchData);
          }
        }
        
        // Update localStorage with cleaned matches
        if (cleanedMatches.size !== liveMatchesMap.size) {
          if (cleanedMatches.size > 0) {
            localStorage.setItem('darts-live-matches', JSON.stringify(Array.from(cleanedMatches)));
          } else {
            localStorage.removeItem('darts-live-matches');
          }
        }
        
        dispatch({ type: ACTIONS.SYNC_LIVE_MATCHES, payload: { liveMatches: Array.from(cleanedMatches) } });
      } catch (error) {
        console.error('Error loading live matches:', error);
      }
    }
  }, []);

  // Save live matches to localStorage whenever they change
  useEffect(() => {
    if (state.liveMatches.size > 0) {
      localStorage.setItem('darts-live-matches', JSON.stringify(Array.from(state.liveMatches)));
    } else {
      // Clear localStorage if no live matches
      localStorage.removeItem('darts-live-matches');
    }
  }, [state.liveMatches]);

  // Clean up old matches periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const cleanedMatches = new Map();
      
      for (const [matchId, matchData] of state.liveMatches) {
        if (matchData.lastUpdate > oneHourAgo) {
          cleanedMatches.set(matchId, matchData);
        }
      }
      
      if (cleanedMatches.size !== state.liveMatches.size) {
        dispatch({ type: ACTIONS.SYNC_LIVE_MATCHES, payload: { liveMatches: Array.from(cleanedMatches) } });
      }
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [state.liveMatches]);

  // Actions
  const startLiveMatch = (matchId, matchData) => {
    const liveMatchData = {
      matchId,
      deviceId: state.deviceId,
      startedAt: Date.now(),
      matchData,
      userId: user?.id,
      userEmail: user?.email
    };
    
    dispatch({ type: ACTIONS.START_LIVE_MATCH, payload: liveMatchData });
    return liveMatchData;
  };

  const endLiveMatch = (matchId) => {
    dispatch({ type: ACTIONS.END_LIVE_MATCH, payload: { matchId } });
    // Also remove from localStorage immediately
    const savedLiveMatches = localStorage.getItem('darts-live-matches');
    if (savedLiveMatches) {
      try {
        const liveMatchesData = JSON.parse(savedLiveMatches);
        const liveMatchesMap = new Map(liveMatchesData);
        liveMatchesMap.delete(matchId);
        if (liveMatchesMap.size > 0) {
          localStorage.setItem('darts-live-matches', JSON.stringify(Array.from(liveMatchesMap)));
        } else {
          localStorage.removeItem('darts-live-matches');
        }
      } catch (error) {
        console.error('Error removing live match from localStorage:', error);
      }
    }
  };

  const updateLiveMatch = (matchId, matchData) => {
    dispatch({ type: ACTIONS.UPDATE_LIVE_MATCH, payload: { matchId, matchData } });
  };

  const isMatchLive = (matchId) => {
    return state.liveMatches.has(matchId);
  };

  const isMatchLiveOnThisDevice = (matchId) => {
    const liveMatch = state.liveMatches.get(matchId);
    return liveMatch && liveMatch.deviceId === state.deviceId;
  };

  const isMatchStartedByCurrentUser = (matchId, matchData = null) => {
    // Check live match context first
    const liveMatch = state.liveMatches.get(matchId);
    if (liveMatch && liveMatch.userId === user?.id) {
      return true;
    }
    
    // Check database field if match data is provided
    if (matchData && matchData.startedByUserId === user?.id) {
      return true;
    }
    
    return false;
  };

  const getLiveMatchInfo = (matchId) => {
    return state.liveMatches.get(matchId);
  };

  const getAllLiveMatches = () => {
    return Array.from(state.liveMatches.entries()).map(([matchId, data]) => ({
      matchId,
      ...data
    }));
  };

  const value = {
    ...state,
    startLiveMatch,
    endLiveMatch,
    updateLiveMatch,
    isMatchLive,
    isMatchLiveOnThisDevice,
    isMatchStartedByCurrentUser,
    getLiveMatchInfo,
    getAllLiveMatches
  };

  return (
    <LiveMatchContext.Provider value={value}>
      {children}
    </LiveMatchContext.Provider>
  );
}

// Custom hook to use live match context
export function useLiveMatch() {
  const context = useContext(LiveMatchContext);
  if (!context) {
    throw new Error('useLiveMatch must be used within a LiveMatchProvider');
  }
  return context;
}

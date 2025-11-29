import React, { useEffect, useState } from 'react';
import { Clock, Users, Trophy, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const LiveMatchesDashboard = () => {
  const { t } = useLanguage(); // Get translation function
  const [liveMatches, setLiveMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load tournaments and initial live matches
    loadTournaments();
    loadLiveMatches();

    // Set up real-time subscription
    const channel = supabase
      .channel('live-matches-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'matches',
          filter: 'status=eq.in_progress'
        },
        async (payload) => {
          console.log('📡 Live match update received:', payload.new.id);
          
          if (payload.new.status === 'in_progress') {
            // Reload the full match data with relations to get updated scores
            const { data: updatedMatch, error } = await supabase
              .from('matches')
              .select(`
                *,
                player1:players!matches_player1_id_fkey(*),
                player2:players!matches_player2_id_fkey(*),
                group:groups(
                  *,
                  tournament:tournaments(*)
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && updatedMatch) {
              setLiveMatches(prev => {
                const existing = prev.find(m => m.id === updatedMatch.id);
                if (existing) {
                  // Update existing match with fresh data
                  return prev.map(m => m.id === updatedMatch.id ? updatedMatch : m);
                } else {
                  // Add new match if it doesn't exist
                  return [...prev, updatedMatch];
                }
              });
            } else {
              // Fallback: update with payload data if full reload fails
              setLiveMatches(prev => {
                const existing = prev.find(m => m.id === payload.new.id);
                if (existing) {
                  return prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m);
                } else {
                  return [...prev, payload.new];
                }
              });
            }
          } else if (payload.new.status === 'completed') {
            // Remove completed match
            setLiveMatches(prev => prev.filter(m => m.id !== payload.new.id));
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: 'status=eq.in_progress'
        },
        async (payload) => {
          console.log('📡 New live match inserted:', payload.new.id);
          
          // Load full match data with relations
          const { data: newMatch, error } = await supabase
            .from('matches')
            .select(`
              *,
              player1:players!matches_player1_id_fkey(*),
              player2:players!matches_player2_id_fkey(*),
              group:groups(
                *,
                tournament:tournaments(*)
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && newMatch) {
            setLiveMatches(prev => {
              // Check if match already exists
              if (prev.find(m => m.id === newMatch.id)) {
                return prev;
              }
              return [...prev, newMatch];
            });
          } else {
            // Fallback: add payload data if full reload fails
            setLiveMatches(prev => {
              if (prev.find(m => m.id === payload.new.id)) {
                return prev;
              }
              return [...prev, payload.new];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('📡 Unsubscribing from live matches');
      supabase.removeChannel(channel);
    };
  }, []);

  // Reload matches when tournament filter changes
  useEffect(() => {
    loadLiveMatches();
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, status')
        .eq('status', 'started')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading tournaments:', error);
        return;
      }

      setTournaments(data || []);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    }
  };

  const loadLiveMatches = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(*),
          player2:players!matches_player2_id_fkey(*),
          group:groups(
            *,
            tournament:tournaments(*)
          )
        `)
        .eq('status', 'in_progress');

      // Filter by tournament if not 'all'
      if (selectedTournament !== 'all') {
        query = query.eq('group.tournament_id', selectedTournament);
      }

      const { data, error } = await query.order('last_activity_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading live matches:', error);
        setError('Failed to load live matches');
        return;
      }

      setLiveMatches(data || []);
    } catch (err) {
      console.error('Error loading live matches:', err);
      setError('Failed to load live matches');
    } finally {
      setLoading(false);
    }
  };


  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getMatchStatusColor = () => {
    return '#3b82f6'; // Blue for all live matches
  };

  const getMatchStatusText = () => {
    return t('liveMatches.live');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={loadLiveMatches} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="live-matches-dashboard">
      <div className="dashboard-header">
        <h1>
          <Trophy size={24} />
          {t('liveMatches.title')}
        </h1>
        <p className="dashboard-subtitle">
          {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} currently in progress
        </p>
        
        <div className="tournament-filter">
          <Filter size={16} />
          <select 
            value={selectedTournament} 
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="tournament-select"
          >
            <option value="all">{t('liveMatches.allTournaments')}</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {liveMatches.length === 0 ? (
        <div className="no-matches">
          <Users size={48} className="no-matches-icon" />
          <h3>{t('liveMatches.noMatches')}</h3>
          <p>{t('liveMatches.noMatchesDescription')}</p>
        </div>
      ) : (
        <div className="live-matches-grid">
          {liveMatches.map(match => (
            <div key={match.id} className="live-match-card">
              <div className="match-header">
                <div className="match-players">
                  <span className="player-name">{match.player1?.name || 'Player 1'}</span>
                  <span className="vs">{t('liveMatches.vs')}</span>
                  <span className="player-name">{match.player2?.name || 'Player 2'}</span>
                </div>
                <div 
                  className="match-status-badge"
                  style={{ backgroundColor: getMatchStatusColor() }}
                >
                  {getMatchStatusText()}
                </div>
              </div>

              <div className="match-tournament">
                <Trophy size={16} />
                <span>{match.group?.tournament?.name || 'Unknown Tournament'}</span>
              </div>

              <div className="match-score">
                <div className="player-score">
                  <div className="score-info">
                    <span className="current-score">{match.player1_current_score || 501}</span>
                    <span className="legs-won">{match.player1_legs || 0} legs</span>
                  </div>
                </div>
                <div className="vs">vs</div>
                <div className="player-score">
                  <div className="score-info">
                    <span className="current-score">{match.player2_current_score || 501}</span>
                    <span className="legs-won">{match.player2_legs || 0} legs</span>
                  </div>
                </div>
              </div>

              <div className="match-info">
                <div className="info-item">
                  <span className="info-label">{t('liveMatches.leg')}:</span>
                  <span className="info-value">{match.current_leg || 1}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('liveMatches.firstTo')}:</span>
                  <span className="info-value">{match.legs_to_win || 3}</span>
                </div>
                <div className="info-item">
                  <Clock size={14} />
                  <span className="info-value">{formatTimeAgo(match.last_activity_at)}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMatchesDashboard;

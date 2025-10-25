import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Users, Trophy, Target, Wifi, WifiOff, Eye, Trash2, CheckCircle, Settings } from 'lucide-react';
import { useLiveMatch } from '../contexts/LiveMatchContext';
import { useAdmin } from '../contexts/AdminContext';
import { useTournament } from '../contexts/TournamentContext';
import { useLanguage } from '../contexts/LanguageContext';

  // Generate unique ID for playoff matches (using crypto.randomUUID for proper UUIDs)
  const generateId = () => {
    return crypto.randomUUID();
  };

export function TournamentManagement({ tournament, onMatchStart, onBack, onDeleteTournament }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('groups'); // 'groups', 'matches', 'standings', 'playoffs'
  const [showEditSettings, setShowEditSettings] = useState(false);
  const [tournamentSettings, setTournamentSettings] = useState({
    legsToWin: tournament.legsToWin || 3,
    startingScore: tournament.startingScore || 501,
    groupSettings: {
      type: 'groups',
      value: 2
    },
    playoffSettings: tournament.playoffSettings || {
      enabled: false,
      playersPerGroup: 1,
      playoffLegsToWin: 3
    }
  });
  const { isMatchLive, isMatchLiveOnThisDevice, isMatchStartedByCurrentUser, getLiveMatchInfo } = useLiveMatch();

  // Simple function to check if match exists in localStorage (started on this device)
  const isMatchInLocalStorage = (matchId) => {
    const savedState = localStorage.getItem(`match-state-${matchId}`);
    return savedState !== null;
  };

  // Enhanced function to check if match should be considered "live" (either in live context or localStorage)
  const isMatchActuallyLive = (matchId) => {
    // First check if it's in the live matches context
    if (isMatchLive(matchId)) {
      return true;
    }
    
    // If not in live context, check if it exists in localStorage and is not completed
    const savedState = localStorage.getItem(`match-state-${matchId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Consider it live if it's not completed and has some progress
        return !parsed.matchComplete && (parsed.currentLeg > 1 || parsed.matchStarter !== null);
      } catch (error) {
        console.error('Error parsing saved match state:', error);
        return false;
      }
    }
    
    return false;
  };
  const { isAdmin, isAdminMode } = useAdmin();
  const { startPlayoffs: contextStartPlayoffs, updateTournamentSettings } = useTournament();

  // Generate playoff rounds if they don't exist
  const generatePlayoffRounds = useCallback((totalQualifiers) => {
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(totalQualifiers)));
    const rounds = [];
    let currentRoundSize = bracketSize;
    let roundNumber = 1;

    while (currentRoundSize > 1) {
      const round = {
        id: generateId(),
        name: getRoundName(currentRoundSize),
        matches: [],
        isComplete: false
      };

      // Create matches for this round
      for (let i = 0; i < currentRoundSize / 2; i++) {
        round.matches.push({
          id: generateId(),
          player1: null,
          player2: null,
          status: 'pending',
          result: null,
          isPlayoff: true,
          playoffRound: roundNumber,
          playoffMatchNumber: i + 1
        });
      }

      rounds.push(round);
      currentRoundSize = currentRoundSize / 2;
      roundNumber++;
    }

    return rounds;
  }, []);

  // Populate playoff bracket with qualifying players
  const populatePlayoffBracket = useCallback((qualifyingPlayers, rounds) => {
    console.log('populatePlayoffBracket called with:', { qualifyingPlayers, rounds });
    
    // If no rounds exist, generate them first
    if (!rounds || rounds.length === 0) {
      rounds = generatePlayoffRounds(qualifyingPlayers.length);
    }
    
    const updatedRounds = [...rounds];
    
    // Shuffle qualifying players for random bracket placement
    const shuffledPlayers = [...qualifyingPlayers].sort(() => Math.random() - 0.5);
    console.log('Shuffled players:', shuffledPlayers);
    
    // For 4 players or less, populate the final directly
    if (qualifyingPlayers.length <= 4) {
      console.log('Populating final for 4 or fewer players:', qualifyingPlayers.length);
      const finalRound = updatedRounds[updatedRounds.length - 1]; // Last round (final)
      if (finalRound && finalRound.matches.length > 0) {
        const finalMatch = finalRound.matches[0];
        finalMatch.player1 = shuffledPlayers[0] || null;
        finalMatch.player2 = shuffledPlayers[1] || null;
        finalMatch.status = (finalMatch.player1 && finalMatch.player2) ? 'pending' : 'pending';
        console.log('Final match populated:', {
          player1: finalMatch.player1?.name,
          player2: finalMatch.player2?.name,
          status: finalMatch.status
        });
      }
    } else {
      // For more than 4 players, populate first round matches
      const firstRound = updatedRounds[0];
      if (firstRound) {
        firstRound.matches.forEach((match, index) => {
          const player1Index = index * 2;
          const player2Index = player1Index + 1;
          
          match.player1 = shuffledPlayers[player1Index] || null;
          match.player2 = shuffledPlayers[player2Index] || null;
          match.status = (match.player1 && match.player2) ? 'pending' : 'pending';
        });
      }
    }
    
    return updatedRounds;
  }, [generatePlayoffRounds]);

  // Note: Removed automatic playoff player assignment - playoffs should only start when user clicks button

  // Check if group stage is complete
  const isGroupStageComplete = () => {
    if (!tournament || !tournament.groups) return false;
    return tournament.groups.every(group => 
      group.matches.every(match => match.status === 'completed')
    );
  };

  // Get qualifying players based on group standings
  const getQualifyingPlayers = () => {
    if (!tournament || !tournament.groups) return [];
    
    const qualifyingPlayers = [];
    const playersPerGroup = tournament.playoffSettings?.playersPerGroup || 2;
    
    tournament.groups.forEach(group => {
      if (group.standings && group.standings.length > 0) {
        // Sort standings by points (descending), then by leg difference
        const sortedStandings = [...group.standings].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return (b.legsWon - b.legsLost) - (a.legsWon - a.legsLost);
        });
        
        // Take top N players from each group
        const topPlayers = sortedStandings.slice(0, playersPerGroup);
        qualifyingPlayers.push(...topPlayers.map(standing => standing.player));
      }
    });
    
    return qualifyingPlayers;
  };

  // Start playoffs by populating the bracket with qualifying players
  const startPlayoffs = async () => {
    if (!tournament) return;
    
    if (!isGroupStageComplete()) {
      alert(t('management.groupStageMustBeCompleted'));
      return;
    }

    const qualifyingPlayers = getQualifyingPlayers();
    if (qualifyingPlayers.length === 0) {
      alert(t('management.noQualifyingPlayers'));
      return;
    }

    // Create updated playoffs data
    const updatedPlayoffs = {
      ...tournament.playoffs,
      qualifyingPlayers,
      currentRound: 1,
      rounds: populatePlayoffBracket(qualifyingPlayers, tournament.playoffs?.rounds || [])
    };

    // Update tournament through context (now async and saves to database)
    await contextStartPlayoffs(updatedPlayoffs);
    
    // Show success message
    alert(t('management.playoffsStartedSuccess', { count: qualifyingPlayers.length }));
  };

  const getRoundName = (roundSize) => {
    switch (roundSize) {
      case 2: return t('management.final');
      case 4: return t('management.semiFinals');
      case 8: return t('management.quarterFinals');
      case 16: return t('management.roundOf', { count: 16 });
      case 32: return t('management.roundOf', { count: 32 });
      case 64: return t('management.roundOf', { count: 64 });
      default: return t('management.roundOf', { count: roundSize });
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournament) return;
    
    if (!isAdmin) {
      alert(t('management.onlyAdminsCanDelete'));
      return;
    }

    const confirmMessage = t('management.confirmDeleteTournament', { name: tournament.name });
    
    if (window.confirm(confirmMessage)) {
      try {
        await onDeleteTournament(tournament.id);
        // Redirect to tournaments list after successful deletion
        onBack();
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert(t('management.failedToDeleteTournament'));
      }
    }
  };

  const updateSettings = async () => {
    try {
      await updateTournamentSettings(tournament.id, tournamentSettings);
      setShowEditSettings(false);
      alert(t('registration.settingsUpdatedSuccessfully'));
    } catch (error) {
      console.error('Error updating tournament settings:', error);
      alert(t('registration.failedToUpdateSettings'));
    }
  };

  // Show loading state if tournament is not loaded yet
  if (!tournament) {
    return (
      <div className="tournament-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const getMatchStatusText = (status, matchId) => {
    if (isMatchActuallyLive(matchId)) {
      if (isMatchInLocalStorage(matchId)) {
        return t('management.liveThisDevice');
      } else if (isAdmin) {
        return t('management.liveAdminAccess');
      } else {
        return t('management.liveOtherDevice');
      }
    }
    
    switch (status) {
      case 'completed': return t('common.completed');
      case 'in_progress': return t('management.inProgress');
      default: return t('management.pending');
    }
  };

  const getMatchStatusColor = (status, matchId) => {
    if (isMatchActuallyLive(matchId)) {
      if (isMatchInLocalStorage(matchId)) {
        return '#3b82f6'; // Blue for this device
      } else if (isAdmin) {
        return '#dc2626'; // Red for admin access
      } else {
        return '#f59e0b'; // Orange for other device
      }
    }
    
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderGroups = () => (
    <div className="groups-view">
      <h3>{t('management.tournamentGroups')}</h3>
      <div className="groups-grid">
        {tournament.groups.map(group => (
          <div key={group.id} className="group-card">
            <div className="group-header">
              <h4>{group.name}</h4>
              <span className="player-count">{group.players.length} {t('common.players')}</span>
            </div>
            <div className="group-players">
              {group.players.map(player => (
                <div key={player.id} className="player-name">
                  {player.name}
                </div>
              ))}
            </div>
            <div className="group-stats">
              <div className="stat">
                <Target size={16} />
                <span>{group.matches.length} {t('common.matches')}</span>
              </div>
              <div className="stat">
                <span>
                  {group.matches.filter(m => m.status === 'completed').length} {t('management.completed')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="matches-view">
      <h3>{t('management.allMatches')}</h3>
      <div className="matches-list">
        {tournament.groups.map(group => (
          <div key={group.id} className="group-matches">
            <h4>{group.name}</h4>
            <div className="matches-grid">
              {group.matches.map(match => (
                <div key={match.id} className="match-card">
                  <div className="match-players">
                    <span className="player">{match.player1?.name || 'Unknown Player'}</span>
                    <span className="vs">vs</span>
                    <span className="player">{match.player2?.name || 'Unknown Player'}</span>
                  </div>
                  <div className="match-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getMatchStatusColor(match.status, match.id) }}
                    >
                      {getMatchStatusText(match.status, match.id)}
                    </span>
                    {isMatchActuallyLive(match.id) && (
                      <div className="live-indicator">
                        {isMatchInLocalStorage(match.id) ? (
                          <Wifi size={14} className="live-icon this-device" />
                        ) : (
                          <Eye size={14} className="live-icon other-device" />
                        )}
                      </div>
                    )}
                  </div>
                  {match.status === 'pending' && !isMatchActuallyLive(match.id) && (
                    <button 
                      className="start-match-btn"
                      onClick={() => onMatchStart({ 
                        ...match,
                        groupId: group.id,
                        legsToWin: match.legsToWin || tournament.legsToWin,
                        startingScore: match.startingScore || tournament.startingScore
                      })}
                    >
                      <Play size={16} />
                      {t('management.startMatch')}
                    </button>
                  )}
                  {isMatchActuallyLive(match.id) && !isMatchInLocalStorage(match.id) && (
                    <button 
                      className={`view-match-btn ${isAdmin ? 'continue-match-btn' : ''}`}
                      onClick={() => onMatchStart({ 
                        ...match,
                        legsToWin: match.legsToWin || tournament.legsToWin,
                        startingScore: match.startingScore || tournament.startingScore
                      })}
                      disabled={!isAdmin}
                    >
                      <Eye size={16} />
                      {isAdmin ? t('management.continueMatch') : t('management.viewLiveMatch')}
                    </button>
                  )}
                  {isMatchActuallyLive(match.id) && isMatchInLocalStorage(match.id) && (
                    <button 
                      className="continue-match-btn"
                      onClick={() => onMatchStart({ 
                        ...match,
                        legsToWin: match.legsToWin || tournament.legsToWin,
                        startingScore: match.startingScore || tournament.startingScore
                      })}
                    >
                      <Play size={16} />
                      {t('management.continueMatch')}
                    </button>
                  )}
                  {match.status === 'completed' && match.result && (
                    <div className="match-result">
                      <div className="result-score">
                        {match.result.player1Legs} - {match.result.player2Legs}
                      </div>
                      <div className="result-averages">
                        <div className="player-average">
                          <span className="average-value">{match.result.player1Stats?.average ? match.result.player1Stats.average.toFixed(1) : '0.0'}</span>
                        </div>
                        <span className="avg-label">{t('management.avg')}</span>
                        <div className="player-average">
                          <span className="average-value">{match.result.player2Stats?.average ? match.result.player2Stats.average.toFixed(1) : '0.0'}</span>
                        </div>
                      </div>
                      <div className="result-winner">
                        {t('management.winner')}: {match.result.winner === match.player1?.id ? match.player1?.name || t('common.unknown') : match.player2?.name || t('common.unknown')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStandings = () => (
    <div className="standings-view">
      <h3>{t('management.groupStandings')}</h3>
      <div className="standings-list">
        {tournament.groups.map(group => {
          console.log('Rendering standings for group:', group.name, 'standings:', group.standings);
          return (
          <div key={group.id} className="group-standings">
            <h4>{group.name}</h4>
            <div className="standings-table">
              <div className="table-header">
                <span>{t('management.pos')}</span>
                <span>{t('management.player')}</span>
                <span>{t('management.played')}</span>
                <span>{t('management.won')}</span>
                <span>{t('management.lost')}</span>
                <span>{t('management.legsDiff')}</span>
                <span>{t('management.avg')}</span>
                <span>{t('management.pts')}</span>
              </div>
              {(group.standings || []).length > 0 ? (
                (group.standings || []).map((standing, index) => (
                  <div key={standing.player.id} className="table-row">
                    <span className="position">{index + 1}</span>
                    <span className="player-name">{standing.player.name}</span>
                    <span>{standing.matchesPlayed}</span>
                    <span>{standing.matchesWon}</span>
                    <span>{standing.matchesLost}</span>
                    <span className={standing.legsWon - standing.legsLost >= 0 ? 'positive' : 'negative'}>
                      {standing.legsWon - standing.legsLost > 0 ? '+' : ''}{standing.legsWon - standing.legsLost}
                    </span>
                    <span>{standing.average.toFixed(1)}</span>
                    <span className="points">{standing.points}</span>
                  </div>
                ))
              ) : (
                <div className="no-standings">
                  <p>{t('management.noMatchesPlayedYet')}</p>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );

  const renderPlayoffs = () => {
    // Check if playoffs are enabled
    if (!tournament.playoffSettings?.enabled) {
      return (
        <div className="playoffs-view">
          <div className="no-playoffs">
            <Trophy size={48} />
            <h3>{t('management.playoffsNotEnabled')}</h3>
            <p>{t('management.tournamentWithoutPlayoffs')}</p>
          </div>
        </div>
      );
    }

    // If playoffs object doesn't exist but playoffs are enabled, show group stage completion check
    if (!tournament.playoffs) {
      const groupStageComplete = isGroupStageComplete();
      if (groupStageComplete) {
        const qualifyingPlayers = getQualifyingPlayers();
        return (
          <div className="playoffs-view">
            <div className="start-playoffs-section">
              <div className="playoffs-header">
                <h3>{t('management.readyToStartPlayoffs')}</h3>
                <div className="playoff-info">
                  <span>{t('management.groupStageCompleted')}</span>
                  <span>{qualifyingPlayers.length} {t('management.playersQualified')}</span>
                </div>
              </div>

              <div className="qualifying-players">
                <h4>{t('management.qualifyingPlayers')}:</h4>
                <div className="players-grid">
                  {tournament.groups.map((group, groupIndex) => {
                    const playersPerGroup = tournament.playoffSettings?.playersPerGroup || 2;
                    const groupQualifiers = qualifyingPlayers.filter(player => 
                      group.players.some(groupPlayer => groupPlayer.id === player.id)
                    );
                    
                    return (
                      <div key={group.id} className="group-qualifiers">
                        <h5>{group.name}</h5>
                        <div className="qualifiers-list">
                          {groupQualifiers.slice(0, playersPerGroup).map((player, index) => (
                            <div key={player.id} className="qualifier">
                              <span className="position">{index + 1}</span>
                              <span className="player-name">{player.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="start-playoffs-actions">
                <button 
                  className="start-playoffs-btn"
                  onClick={startPlayoffs}
                >
                  <Trophy size={20} />
                  {t('management.startPlayoffs')}
                </button>
                <p className="playoffs-note">
                  {t('management.playoffsNote')}
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="playoffs-view">
            <div className="no-playoffs">
              <Trophy size={48} />
              <h3>{t('management.playoffsNotAvailable')}</h3>
              <p>{t('management.playoffsAvailableAfterGroups')}</p>
            </div>
          </div>
        );
      }
    }

    // Check if group stage is complete but playoffs haven't started
    const groupStageComplete = isGroupStageComplete();
    const hasQualifyingPlayers = tournament.playoffs?.qualifyingPlayers && tournament.playoffs.qualifyingPlayers.length > 0;
    const playersAssignedToMatches = tournament.playoffs?.rounds?.some(round => 
      round.matches.some(match => match.player1 && match.player2)
    );
    const playoffsStarted = hasQualifyingPlayers && playersAssignedToMatches;
    
    console.log('Playoff debug:', {
      groupStageComplete,
      hasQualifyingPlayers,
      playersAssignedToMatches,
      playoffsStarted,
      playoffSettings: tournament.playoffSettings,
      playoffs: tournament.playoffs,
      qualifyingPlayers: tournament.playoffs?.qualifyingPlayers
    });

    if (groupStageComplete && !playoffsStarted) {
      const qualifyingPlayers = getQualifyingPlayers();
      return (
        <div className="playoffs-view">
          <div className="start-playoffs-section">
            <div className="playoffs-header">
              <h3>Ready to Start Playoffs!</h3>
              <div className="playoff-info">
                <span>Group stage completed</span>
                <span>{qualifyingPlayers.length} players qualified</span>
              </div>
            </div>

            <div className="qualifying-players">
              <h4>Qualifying Players:</h4>
              <div className="players-grid">
                {tournament.groups.map((group, groupIndex) => {
                  const playersPerGroup = tournament.playoffSettings?.playersPerGroup || 2;
                  const groupQualifiers = qualifyingPlayers.filter(player => 
                    group.players.some(groupPlayer => groupPlayer.id === player.id)
                  );
                  
                  return (
                    <div key={group.id} className="group-qualifiers">
                      <h5>{group.name}</h5>
                      <div className="qualifiers-list">
                        {groupQualifiers.slice(0, playersPerGroup).map((player, index) => (
                          <div key={player.id} className="qualifier">
                            <span className="position">{index + 1}</span>
                            <span className="player-name">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="start-playoffs-actions">
              <button 
                className="start-playoffs-btn"
                onClick={startPlayoffs}
              >
                <Trophy size={20} />
                Start Playoffs
              </button>
              <p className="playoffs-note">
                Players will be randomly seeded in the bracket
              </p>
            </div>
          </div>
        </div>
      );
    }

    const { rounds, currentRound, qualifyingPlayers } = tournament.playoffs;
    const playoffMatches = tournament.playoffMatches || [];

    console.log('Rendering playoff bracket:', {
      rounds: rounds,
      currentRound: currentRound,
      qualifyingPlayers: qualifyingPlayers,
      playoffMatches: playoffMatches
    });

    // Check if players need to be assigned to matches
    const needsPlayerAssignment = rounds.some(round => 
      round.matches.some(match => !match.player1 || !match.player2)
    );

    return (
      <div className="playoffs-view">
        <div className="playoffs-header">
          <h3>Playoff Bracket</h3>
          <div className="playoff-info">
            <span>{qualifyingPlayers.length} players qualified</span>
            <span>Current Round: {rounds[currentRound - 1]?.name || 'Completed'}</span>
          </div>
        </div>

        <div className="bracket-container">
          {rounds.map((round, index) => (
            <div key={round.id} className={`bracket-round ${index + 1 === currentRound ? 'current' : ''}`}>
              <div className="round-header">
                <h4>{round.name}</h4>
                <span className="match-count">{round.matches.length} matches</span>
              </div>
              
              <div className="round-matches">
                {round.matches.map((bracketMatch) => {
                  // Find the actual database match for this bracket match
                  const match = playoffMatches.find(pm => pm.id === bracketMatch.id) || bracketMatch;
                  console.log('Rendering playoff match:', {
                    matchId: match.id,
                    player1: match.player1,
                    player2: match.player2,
                    status: match.status
                  });
                  return (
                  <div key={match.id} className={`playoff-match ${match.status}`}>
                    <div className="match-players">
                      <div className={`player ${match.result?.winner === match.player1?.id ? 'winner' : ''}`}>
                        <span className="player-name">
                          {match.player1?.name || 'TBD'}
                        </span>
                        {match.result && (
                          <span className="player-score">{match.result.player1Legs}</span>
                        )}
                      </div>
                      <div className="vs">vs</div>
                      <div className={`player ${match.result?.winner === match.player2?.id ? 'winner' : ''}`}>
                        <span className="player-name">
                          {match.player2?.name || 'TBD'}
                        </span>
                        {match.result && (
                          <span className="player-score">{match.result.player2Legs}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="match-actions">
                      {match.status === 'pending' && match.player1 && match.player2 && (
                        <button 
                          className="start-match-btn"
                          onClick={() => onMatchStart({ 
                            ...match,
                            legsToWin: tournament.playoffSettings.playoffLegsToWin,
                            startingScore: tournament.startingScore,
                            isPlayoff: true
                          })}
                        >
                          <Play size={16} />
                          Start Match
                        </button>
                      )}
                      {match.status === 'completed' && (
                        <div className="match-completed">
                          <CheckCircle size={16} />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="tournament-management">
      <div className="management-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('common.backToDashboard')}
        </button>
        <div className="tournament-title">
          <Trophy size={24} />
          <h2>{tournament.name}</h2>
        </div>
        <div className="tournament-overview">
          <div className="overview-stat">
            <Users size={20} />
            <span>{tournament.players?.length || tournament.groups?.reduce((total, group) => total + (group.players?.length || 0), 0) || 0} {t('common.players')}</span>
          </div>
          <div className="overview-stat">
            <span>{tournament.groups?.length || 0} {t('common.groups')}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="edit-settings-btn"
            onClick={() => setShowEditSettings(true)}
            title={t('registration.editTournamentSettings')}
          >
            <Settings size={18} />
            {t('registration.editSettings')}
          </button>
          {isAdmin && (
            <button 
              className="delete-tournament-btn"
              onClick={handleDeleteTournament}
              title={t('management.deleteTournamentAdminOnly')}
            >
              <Trash2 size={20} />
              {t('management.deleteTournament')}
            </button>
          )}
        </div>
      </div>

      <div className="management-tabs">
        <button 
          className={activeTab === 'groups' ? 'active' : ''}
          onClick={() => setActiveTab('groups')}
        >
          {t('management.groups')}
        </button>
        <button 
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          {t('management.matches')}
        </button>
        <button 
          className={activeTab === 'standings' ? 'active' : ''}
          onClick={() => setActiveTab('standings')}
        >
          {t('management.standings')}
        </button>
        {tournament.playoffSettings?.enabled && (
          <button 
            className={activeTab === 'playoffs' ? 'active' : ''}
            onClick={() => setActiveTab('playoffs')}
          >
            {t('management.playoffs')}
          </button>
        )}
      </div>

      <div className="management-content">
        {activeTab === 'groups' && renderGroups()}
        {activeTab === 'matches' && renderMatches()}
        {activeTab === 'standings' && renderStandings()}
        {activeTab === 'playoffs' && renderPlayoffs()}
      </div>

      {/* Edit Settings Modal */}
      {showEditSettings && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Tournament Settings</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditSettings(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="group-settings">
                <h4>Match Settings</h4>
                <div className="input-group">
                  <label>Legs to Win:</label>
                  <select 
                    value={tournamentSettings.legsToWin}
                    onChange={(e) => setTournamentSettings({
                      ...tournamentSettings,
                      legsToWin: parseInt(e.target.value)
                    })}
                  >
                    <option value={1}>First to 1</option>
                    <option value={2}>First to 2</option>
                    <option value={3}>First to 3</option>
                    <option value={4}>First to 4</option>
                    <option value={5}>First to 5</option>
                    <option value={7}>First to 7</option>
                    <option value={9}>First to 9</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Starting Score:</label>
                  <select 
                    value={tournamentSettings.startingScore}
                    onChange={(e) => setTournamentSettings({
                      ...tournamentSettings,
                      startingScore: parseInt(e.target.value)
                    })}
                  >
                    <option value={301}>301</option>
                    <option value={501}>501</option>
                    <option value={701}>701</option>
                  </select>
                </div>
              </div>

              <div className="group-settings">
                <h4>Group Settings</h4>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="groupType"
                      value="groups"
                      checked={tournamentSettings.groupSettings.type === 'groups'}
                      onChange={(e) => setTournamentSettings({
                        ...tournamentSettings,
                        groupSettings: {
                          ...tournamentSettings.groupSettings,
                          type: e.target.value
                        }
                      })}
                    />
                    Number of Groups
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="groupType"
                      value="playersPerGroup"
                      checked={tournamentSettings.groupSettings.type === 'playersPerGroup'}
                      onChange={(e) => setTournamentSettings({
                        ...tournamentSettings,
                        groupSettings: {
                          ...tournamentSettings.groupSettings,
                          type: e.target.value
                        }
                      })}
                    />
                    Players per Group
                  </label>
                </div>
                <div className="input-group">
                  <label>
                    {tournamentSettings.groupSettings.type === 'groups' ? 'Number of Groups:' : 'Players per Group:'}
                  </label>
                  <input
                    type="number"
                    min="2"
                    max={tournamentSettings.groupSettings.type === 'groups' ? '16' : '8'}
                    value={tournamentSettings.groupSettings.value}
                    onChange={(e) => setTournamentSettings({
                      ...tournamentSettings,
                      groupSettings: {
                        ...tournamentSettings.groupSettings,
                        value: parseInt(e.target.value) || 2
                      }
                    })}
                  />
                </div>
              </div>

              <div className="group-settings">
                <h4>Playoff Settings</h4>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={tournamentSettings.playoffSettings.enabled}
                      onChange={(e) => setTournamentSettings({
                        ...tournamentSettings,
                        playoffSettings: {
                          ...tournamentSettings.playoffSettings,
                          enabled: e.target.checked
                        }
                      })}
                    />
                    Enable Playoffs
                  </label>
                </div>
                
                {tournamentSettings.playoffSettings.enabled && (
                  <div className="playoff-options">
                    <div className="input-group">
                      <label>Players advancing per group:</label>
                      <select 
                        value={tournamentSettings.playoffSettings.playersPerGroup}
                        onChange={(e) => setTournamentSettings({
                          ...tournamentSettings,
                          playoffSettings: {
                            ...tournamentSettings.playoffSettings,
                            playersPerGroup: parseInt(e.target.value)
                          }
                        })}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Playoff legs to win:</label>
                      <select 
                        value={tournamentSettings.playoffSettings.playoffLegsToWin}
                        onChange={(e) => setTournamentSettings({
                          ...tournamentSettings,
                          playoffSettings: {
                            ...tournamentSettings.playoffSettings,
                            playoffLegsToWin: parseInt(e.target.value)
                          }
                        })}
                      >
                        <option value={1}>First to 1</option>
                        <option value={2}>First to 2</option>
                        <option value={3}>First to 3</option>
                        <option value={5}>First to 5</option>
                        <option value={7}>First to 7</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditSettings(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={updateSettings}
              >
                Update Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

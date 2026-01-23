import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Users, Settings, TrendingUp, Plus, Edit, Trash2, X, Check, Calendar, Save } from 'lucide-react';
import { useLeague } from '../contexts/LeagueContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function LeagueDetail({ leagueId, onBack, onCreateTournament, onSelectTournament }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentLeague, selectLeague, updateLeague, deleteLeague, addMembers, updateMemberStatus, removeMember, refreshLeaderboard } = useLeague();
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'tournaments', 'players', 'settings'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [scoringRules, setScoringRules] = useState([]);
  const [isSavingScoring, setIsSavingScoring] = useState(false);
  const [newPlacement, setNewPlacement] = useState({ position: '', points: '' });

  useEffect(() => {
    if (leagueId && (!currentLeague || currentLeague.id !== leagueId)) {
      selectLeague(leagueId);
    }
  }, [leagueId, currentLeague, selectLeague]);

  useEffect(() => {
    if (currentLeague && !isEditing) {
      setEditForm({
        name: currentLeague.name || '',
        description: currentLeague.description || ''
      });
    }
  }, [currentLeague, isEditing]);

  // Load scoring rules when league changes
  useEffect(() => {
    if (currentLeague?.scoringRules?.placementPoints) {
      const points = currentLeague.scoringRules.placementPoints;
      const rulesArray = Object.entries(points)
        .filter(([key]) => key !== 'default')
        .map(([position, pts]) => ({ position: parseInt(position), points: pts }))
        .sort((a, b) => a.position - b.position);
      
      // Add default if exists
      if (points.default !== undefined) {
        rulesArray.push({ position: 'default', points: points.default });
      }
      
      setScoringRules(rulesArray);
    }
  }, [currentLeague]);

  if (!currentLeague) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('leagues.loading')}</p>
      </div>
    );
  }

  const isManager = user && (
    currentLeague.createdBy === user.id || 
    (currentLeague.managerIds && currentLeague.managerIds.includes(user.id))
  );

  const handleUpdateLeague = async () => {
    try {
      await updateLeague(currentLeague.id, {
        name: editForm.name,
        description: editForm.description
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating league:', error);
      alert(t('leagues.failedToUpdateLeague'));
    }
  };

  const handleDeleteLeague = async () => {
    if (window.confirm(t('leagues.confirmDeleteLeague'))) {
      try {
        await deleteLeague(currentLeague.id);
        onBack();
      } catch (error) {
        console.error('Error deleting league:', error);
        alert(t('leagues.failedToDeleteLeague'));
      }
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    try {
      await addMembers(currentLeague.id, [{ name: newPlayerName.trim() }]);
      setNewPlayerName('');
      setIsAddingPlayer(false);
    } catch (error) {
      console.error('Error adding player:', error);
      alert(t('leagues.failedToAddPlayer'));
    }
  };

  const handleTogglePlayerActive = async (playerId, currentActive) => {
    try {
      await updateMemberStatus(currentLeague.id, playerId, {
        isActive: !currentActive
      });
    } catch (error) {
      console.error('Error updating player status:', error);
      alert(t('leagues.failedToUpdatePlayerStatus'));
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (window.confirm(t('leagues.confirmRemovePlayer'))) {
      try {
        await removeMember(currentLeague.id, playerId);
      } catch (error) {
        console.error('Error removing player:', error);
        alert(t('leagues.failedToRemovePlayer'));
      }
    }
  };

  const handleScoringRuleChange = (index, field, value) => {
    const updated = [...scoringRules];
    if (field === 'points') {
      updated[index].points = parseInt(value) || 0;
    }
    setScoringRules(updated);
  };

  const handleAddPlacement = () => {
    const position = newPlacement.position === 'default' ? 'default' : parseInt(newPlacement.position);
    const points = parseInt(newPlacement.points) || 0;
    
    if (position === '' || (position !== 'default' && (isNaN(position) || position < 1))) {
      alert(t('leagues.invalidPosition'));
      return;
    }
    
    // Check if position already exists
    if (scoringRules.some(r => r.position === position)) {
      alert(t('leagues.placementExists'));
      return;
    }
    
    const updated = [...scoringRules, { position, points }];
    // Sort: numeric positions first, then default
    updated.sort((a, b) => {
      if (a.position === 'default') return 1;
      if (b.position === 'default') return -1;
      return a.position - b.position;
    });
    
    setScoringRules(updated);
    setNewPlacement({ position: '', points: '' });
  };

  const handleRemovePlacement = (index) => {
    const updated = scoringRules.filter((_, i) => i !== index);
    setScoringRules(updated);
  };

  const handleSaveScoringRules = async () => {
    setIsSavingScoring(true);
    try {
      // Convert array back to object format
      const placementPoints = {};
      scoringRules.forEach(rule => {
        placementPoints[rule.position.toString()] = rule.points;
      });
      
      await updateLeague(currentLeague.id, {
        scoring_rules: {
          ...currentLeague.scoringRules,
          placementPoints
        }
      });
      
      alert(t('leagues.scoringSaved'));
    } catch (error) {
      console.error('Error saving scoring rules:', error);
      alert(t('leagues.scoringSaveFailed'));
    } finally {
      setIsSavingScoring(false);
    }
  };

  const getPlacementLabel = (position) => {
    if (position === 'default') return t('leagues.defaultOtherPlacements');
    if (position === 1) return `${t('leagues.1stPlace')} 🥇`;
    if (position === 2) return `${t('leagues.2ndPlace')} 🥈`;
    if (position === 3) return `${t('leagues.3rdPlace')} 🥉`;
    return `${position}. ${t('leagues.position').replace(':', '')}`;
  };

  return (
    <div className="tournament-management">
      <div className="management-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('leagues.backToLeagues')}
        </button>
        <div className="tournament-title">
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t('leagues.leagueName')}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t('leagues.descriptionOptional')}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="action-btn play"
                  onClick={handleUpdateLeague}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <Check size={16} />
                  {t('common.save')}
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <X size={16} />
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h2>{currentLeague.name}</h2>
                <span className={`status-badge ${currentLeague.status}`}>
                  {currentLeague.status}
                </span>
                {isManager && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button 
                      className="action-btn play"
                      onClick={() => setIsEditing(true)}
                      title={t('leagues.editLeague')}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={handleDeleteLeague}
                      title={t('leagues.deleteLeague')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {currentLeague.description && (
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {currentLeague.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <div className="stat">
                  <Users size={16} />
                  <span>{currentLeague.members?.length || 0} {t('leagues.members')}</span>
                </div>
                <div className="stat">
                  <Trophy size={16} />
                  <span>{currentLeague.tournaments?.length || 0} {t('leagues.tournaments')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="management-tabs">
        <button
          className={activeTab === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveTab('leaderboard')}
        >
          <TrendingUp size={18} />
          {t('leagues.leaderboard')}
        </button>
        <button
          className={activeTab === 'tournaments' ? 'active' : ''}
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy size={18} />
          {t('tournaments.title')}
        </button>
        <button
          className={activeTab === 'players' ? 'active' : ''}
          onClick={() => setActiveTab('players')}
        >
          <Users size={18} />
          {t('leagues.players')}
        </button>
        {isManager && (
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            {t('leagues.settings')}
          </button>
        )}
      </div>

      <div className="management-content">
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>{t('leagues.leaderboard')}</h2>
              {isManager && (
                <button 
                  className="create-tournament-btn" 
                  onClick={async () => {
                    try {
                      await refreshLeaderboard(currentLeague.id);
                      alert(t('leagues.recalculateSuccess'));
                    } catch (error) {
                      console.error('Error refreshing leaderboard:', error);
                      alert(t('leagues.recalculateFailed'));
                    }
                  }}
                  title={t('leagues.recalculate')}
                >
                  <TrendingUp size={18} />
                  {t('leagues.recalculate')}
                </button>
              )}
            </div>
            {currentLeague.leaderboard && currentLeague.leaderboard.length > 0 ? (
              <div className="group-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>{t('leagues.rank')}</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>{t('leagues.player')}</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>{t('leagues.points')}</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>{t('tournaments.title')}</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>{t('leagues.best')}</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>{t('leagues.avgPlacement')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeague.leaderboard.map((entry, index) => (
                      <tr key={entry.player?.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>{index + 1}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{entry.player?.name || t('common.unknown')}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>{entry.totalPoints || 0}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{entry.tournamentsPlayed || 0}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{entry.bestPlacement || '-'}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{entry.avgPlacement ? entry.avgPlacement.toFixed(1) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Trophy size={48} />
                <p>{t('leagues.noResultsYet')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>{t('tournaments.title')}</h2>
              {isManager && onCreateTournament && (
                <button className="create-tournament-btn" onClick={() => onCreateTournament(currentLeague)}>
                  <Plus size={18} />
                  {t('leagues.createTournament')}
                </button>
              )}
            </div>
            {currentLeague.tournaments && currentLeague.tournaments.length > 0 ? (
              <div className="tournaments-grid">
                {currentLeague.tournaments.map(tournament => (
                  <div key={tournament.id} className="tournament-card" onClick={() => onSelectTournament && onSelectTournament(tournament)}>
                    <div className="card-header">
                      <div className="tournament-info">
                        <h3>{tournament.name}</h3>
                        <span className={`status-badge ${tournament.status}`}>
                          {tournament.status}
                        </span>
                      </div>
                    </div>
                    <div className="tournament-stats">
                      <div className="stat">
                        <Calendar size={16} />
                        <span>{new Date(tournament.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Trophy size={48} />
                <p>{t('leagues.noTournamentsYet')}</p>
                {isManager && onCreateTournament && (
                  <button className="create-first-btn" onClick={() => onCreateTournament(currentLeague)}>
                    <Plus size={20} />
                    {t('leagues.createTournament')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>{t('leagues.players')}</h2>
              {isManager && (
                <>
                  {!isAddingPlayer ? (
                    <button className="create-tournament-btn" onClick={() => setIsAddingPlayer(true)}>
                      <Plus size={18} />
                      {t('leagues.addPlayer')}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder={t('leagues.playerName')}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                      />
                      <button className="action-btn play" onClick={handleAddPlayer}>
                        <Check size={16} />
                      </button>
                      <button className="action-btn delete" onClick={() => {
                        setIsAddingPlayer(false);
                        setNewPlayerName('');
                      }}>
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            {currentLeague.members && currentLeague.members.length > 0 ? (
              <div className="groups-grid">
                {currentLeague.members.map(member => (
                  <div key={member.player?.id || member.id} className="group-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                          {member.player?.name || t('common.unknown')}
                        </h3>
                        {member.role === 'manager' && (
                          <span className="status-badge active" style={{ fontSize: '0.75rem' }}>{t('leagues.manager')}</span>
                        )}
                      </div>
                      {isManager && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={member.isActive}
                              onChange={() => handleTogglePlayerActive(member.player.id, member.isActive)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('leagues.active')}</span>
                          </label>
                          <button
                            className="action-btn delete"
                            onClick={() => handleRemovePlayer(member.player.id)}
                            title={t('leagues.removePlayer')}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <p>{t('leagues.noPlayersYet')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && isManager && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('leagues.leagueSettings')}</h2>
            
            {/* Scoring Rules Editor */}
            <div className="group-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>{t('leagues.scoringRules')}</h3>
                <button 
                  className="create-tournament-btn"
                  onClick={handleSaveScoringRules}
                  disabled={isSavingScoring}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <Save size={16} />
                  {isSavingScoring ? t('common.saving') : t('leagues.saveChanges')}
                </button>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {t('leagues.scoringRulesDescription')}
              </p>
              
              {/* Scoring Rules List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {scoringRules.map((rule, index) => (
                  <div 
                    key={rule.position} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ 
                      flex: 1, 
                      color: 'var(--text-primary)',
                      fontWeight: rule.position <= 3 ? '600' : '400'
                    }}>
                      {getPlacementLabel(rule.position)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="0"
                        value={rule.points}
                        onChange={(e) => handleScoringRuleChange(index, 'points', e.target.value)}
                        style={{
                          width: '80px',
                          padding: '0.5rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>{t('common.pts')}</span>
                      <button
                        onClick={() => handleRemovePlacement(index)}
                        style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                        title={t('leagues.removePlacement')}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add New Placement */}
              <div style={{ 
                padding: '1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px dashed var(--border-color)'
              }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  {t('leagues.addNewPlacement')}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('leagues.position')}</label>
                    <input
                      type="text"
                      placeholder="e.g. 6"
                      value={newPlacement.position}
                      onChange={(e) => setNewPlacement({ ...newPlacement, position: e.target.value })}
                      style={{
                        width: '80px',
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('leagues.points')}:</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      value={newPlacement.points}
                      onChange={(e) => setNewPlacement({ ...newPlacement, points: e.target.value })}
                      style={{
                        width: '80px',
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <button 
                    className="action-btn play"
                    onClick={handleAddPlacement}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <Plus size={16} />
                    {t('common.add')}
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  {t('leagues.defaultPlacementTip')}
                </p>
              </div>
            </div>
            
            {/* Default Tournament Settings (read-only for now) */}
            {currentLeague.defaultTournamentSettings && (
              <div className="group-card">
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('leagues.defaultTournamentSettings')}</h3>
                <pre style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  overflow: 'auto',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}>
                  {JSON.stringify(currentLeague.defaultTournamentSettings, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


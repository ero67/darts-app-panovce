import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Users, Settings, TrendingUp, Plus, Edit, Trash2, X, Check, Calendar } from 'lucide-react';
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

  if (!currentLeague) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading league...</p>
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
      alert('Failed to update league');
    }
  };

  const handleDeleteLeague = async () => {
    if (window.confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
      try {
        await deleteLeague(currentLeague.id);
        onBack();
      } catch (error) {
        console.error('Error deleting league:', error);
        alert('Failed to delete league');
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
      alert('Failed to add player');
    }
  };

  const handleTogglePlayerActive = async (playerId, currentActive) => {
    try {
      await updateMemberStatus(currentLeague.id, playerId, {
        isActive: !currentActive
      });
    } catch (error) {
      console.error('Error updating player status:', error);
      alert('Failed to update player status');
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (window.confirm('Remove this player from the league?')) {
      try {
        await removeMember(currentLeague.id, playerId);
      } catch (error) {
        console.error('Error removing player:', error);
        alert('Failed to remove player');
      }
    }
  };

  return (
    <div className="tournament-management">
      <div className="management-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Leagues
        </button>
        <div className="tournament-title">
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="League name"
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
                placeholder="Description (optional)"
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
                  Save
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <X size={16} />
                  Cancel
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
                      title="Edit League"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={handleDeleteLeague}
                      title="Delete League"
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
                  <span>{currentLeague.members?.length || 0} members</span>
                </div>
                <div className="stat">
                  <Trophy size={16} />
                  <span>{currentLeague.tournaments?.length || 0} tournaments</span>
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
          Leaderboard
        </button>
        <button
          className={activeTab === 'tournaments' ? 'active' : ''}
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy size={18} />
          Tournaments
        </button>
        <button
          className={activeTab === 'players' ? 'active' : ''}
          onClick={() => setActiveTab('players')}
        >
          <Users size={18} />
          Players
        </button>
        {isManager && (
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            Settings
          </button>
        )}
      </div>

      <div className="management-content">
        {activeTab === 'leaderboard' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Leaderboard</h2>
            {currentLeague.leaderboard && currentLeague.leaderboard.length > 0 ? (
              <div className="group-card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>Rank</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>Player</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>Points</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>Tournaments</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>Best</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-primary)', fontWeight: '600' }}>Avg Placement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeague.leaderboard.map((entry, index) => (
                      <tr key={entry.player?.id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>{index + 1}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{entry.player?.name || 'Unknown'}</td>
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
                <p>No tournament results yet. Create tournaments to start tracking points.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>Tournaments</h2>
              {isManager && onCreateTournament && (
                <button className="create-tournament-btn" onClick={() => onCreateTournament(currentLeague)}>
                  <Plus size={18} />
                  Create Tournament
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
                <p>No tournaments yet. Create your first tournament for this league.</p>
                {isManager && onCreateTournament && (
                  <button className="create-first-btn" onClick={() => onCreateTournament(currentLeague)}>
                    <Plus size={20} />
                    Create Tournament
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)' }}>Players</h2>
              {isManager && (
                <>
                  {!isAddingPlayer ? (
                    <button className="create-tournament-btn" onClick={() => setIsAddingPlayer(true)}>
                      <Plus size={18} />
                      Add Player
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Player name"
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
                          {member.player?.name || 'Unknown'}
                        </h3>
                        {member.role === 'manager' && (
                          <span className="status-badge active" style={{ fontSize: '0.75rem' }}>Manager</span>
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
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active</span>
                          </label>
                          <button
                            className="action-btn delete"
                            onClick={() => handleRemovePlayer(member.player.id)}
                            title="Remove Player"
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
                <p>No players yet. Add players to the league.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && isManager && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>League Settings</h2>
            <div className="group-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Scoring Rules</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Placement-based points:</p>
              <pre style={{ 
                background: 'var(--bg-secondary)', 
                padding: '1rem', 
                borderRadius: '8px', 
                overflow: 'auto',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}>
                {JSON.stringify(currentLeague.scoringRules?.placementPoints || {}, null, 2)}
              </pre>
              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
                Points are awarded based on final tournament placement. Missing players receive no points (neutral).
              </p>
            </div>
            {currentLeague.defaultTournamentSettings && (
              <div className="group-card">
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Default Tournament Settings</h3>
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


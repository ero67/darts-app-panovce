import React, { useState } from 'react';
import { Crown, UserPlus, Mail, Check, X, AlertCircle, Loader, Users, RotateCcw, Settings, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { tournamentService } from '../services/tournamentService';

export function AdminPanel() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // View All Users
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Reset Match to Pending
  const [matchId, setMatchId] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  
  // Force Tournament Status
  const [tournamentId, setTournamentId] = useState('');
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [newStatus, setNewStatus] = useState('active');
  const [loadingTournament, setLoadingTournament] = useState(false);

  const setManagerRole = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Call Supabase RPC function to set manager role (secure version checks admin)
      const { data, error } = await supabase.rpc('set_user_role_secure', {
        user_email: email.trim().toLowerCase(),
        user_role: 'manager'
      });

      if (error) {
        console.error('Error setting manager role:', error);
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to set manager role. Make sure the user exists.' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Manager role successfully assigned to ${email}` 
        });
        setEmail('');
        // Refresh managers list
        loadManagers();
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const removeManagerRole = async (userEmail) => {
    if (!confirm(`Are you sure you want to remove manager role from ${userEmail}?`)) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase.rpc('set_user_role_secure', {
        user_email: userEmail,
        user_role: null
      });

      if (error) {
        console.error('Error removing manager role:', error);
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to remove manager role.' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Manager role removed from ${userEmail}` 
        });
        loadManagers();
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    setLoadingManagers(true);
    try {
      const { data, error } = await supabase.rpc('get_users_by_role', {
        role_name: 'manager'
      });

      if (error) {
        console.error('Error loading managers:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load managers list.' 
        });
      } else {
        setManagers(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingManagers(false);
    }
  };

  // Load all users
  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users');

      if (error) {
        console.error('Error loading users:', error);
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to load users. Make sure the get_all_users() function exists in the database.' 
        });
        setAllUsers([]);
      } else {
        setAllUsers(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load users.' 
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Search for match by ID
  const searchMatch = async () => {
    if (!matchId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a match ID' });
      return;
    }

    setLoadingMatch(true);
    setMatchInfo(null);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          player1_id,
          player2_id,
          player1_legs,
          player2_legs,
          tournament_id,
          is_playoff,
          created_at,
          updated_at,
          tournaments:tournament_id(name)
        `)
        .eq('id', matchId.trim())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setMessage({ type: 'error', text: 'Match not found' });
      } else {
        setMatchInfo(data);
      }
    } catch (err) {
      console.error('Error searching match:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to search for match.' 
      });
    } finally {
      setLoadingMatch(false);
    }
  };

  // Reset match to pending
  const resetMatchToPending = async () => {
    if (!matchInfo) {
      setMessage({ type: 'error', text: 'Please search for a match first' });
      return;
    }

    if (!confirm(`Are you sure you want to reset match ${matchInfo.id} to pending? This will clear all match data.`)) {
      return;
    }

    setLoadingMatch(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('matches')
        .update({
          status: 'pending',
          started_by_user_id: null,
          player1_legs: 0,
          player2_legs: 0,
          current_leg: 1,
          player1_current_score: null,
          player2_current_score: null,
          current_player: 0,
          live_device_id: null,
          live_started_at: null,
          winner_id: null,
          result: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchInfo.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMessage({ 
        type: 'success', 
        text: `Match ${matchInfo.id} has been reset to pending` 
      });
      setMatchInfo(null);
      setMatchId('');
    } catch (err) {
      console.error('Error resetting match:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to reset match.' 
      });
    } finally {
      setLoadingMatch(false);
    }
  };

  // Search for tournament by ID
  const searchTournament = async () => {
    if (!tournamentId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a tournament ID' });
      return;
    }

    setLoadingTournament(true);
    setTournamentInfo(null);
    setMessage({ type: '', text: '' });

    try {
      const tournament = await tournamentService.getTournament(tournamentId.trim());
      if (tournament) {
        setTournamentInfo(tournament);
        setNewStatus(tournament.status || 'active');
      } else {
        setMessage({ type: 'error', text: 'Tournament not found' });
      }
    } catch (err) {
      console.error('Error searching tournament:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to search for tournament.' 
      });
    } finally {
      setLoadingTournament(false);
    }
  };

  // Force tournament status
  const forceTournamentStatus = async () => {
    if (!tournamentInfo) {
      setMessage({ type: 'error', text: 'Please search for a tournament first' });
      return;
    }

    if (!confirm(`Are you sure you want to change tournament "${tournamentInfo.name}" status from "${tournamentInfo.status}" to "${newStatus}"?`)) {
      return;
    }

    setLoadingTournament(true);
    setMessage({ type: '', text: '' });

    try {
      await tournamentService.updateTournament(tournamentInfo.id, {
        status: newStatus
      });

      setMessage({ 
        type: 'success', 
        text: `Tournament status changed to ${newStatus}` 
      });
      setTournamentInfo(null);
      setTournamentId('');
    } catch (err) {
      console.error('Error updating tournament status:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to update tournament status.' 
      });
    } finally {
      setLoadingTournament(false);
    }
  };

  // Load managers on mount
  React.useEffect(() => {
    loadManagers();
  }, []);

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-header">
        <div className="admin-panel-title">
          <Crown size={24} />
          <h1>Admin Panel</h1>
        </div>
        <p className="admin-panel-subtitle">Manage users, tournaments, and matches</p>
      </div>

      <div className="admin-panel-content">
        {/* Set Manager Role Section */}
        <div className="admin-section">
          <div className="admin-section-header">
            <UserPlus size={20} />
            <h2>Assign Manager Role</h2>
          </div>
          <p className="admin-section-description">
            Managers can create tournaments. Enter a user's email address to grant manager permissions.
          </p>

          <div className="admin-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                onKeyPress={(e) => e.key === 'Enter' && !loading && setManagerRole()}
                disabled={loading}
              />
            </div>

            <button
              className="admin-button primary"
              onClick={setManagerRole}
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <Loader size={16} className="spinning" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Assign Manager Role
                </>
              )}
            </button>
          </div>

          {message.text && (
            <div className={`admin-message ${message.type}`}>
              {message.type === 'success' ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* Managers List Section */}
        <div className="admin-section">
          <div className="admin-section-header">
            <Crown size={20} />
            <h2>Current Managers</h2>
          </div>

          {loadingManagers ? (
            <div className="admin-loading">
              <Loader size={20} className="spinning" />
              <span>Loading managers...</span>
            </div>
          ) : managers.length === 0 ? (
            <div className="admin-empty">
              <p>No managers assigned yet.</p>
            </div>
          ) : (
            <div className="managers-list">
              {managers.map((manager) => (
                <div key={manager.id} className="manager-item">
                  <div className="manager-info">
                    <div className="manager-email">{manager.email}</div>
                    {manager.full_name && (
                      <div className="manager-name">{manager.full_name}</div>
                    )}
                  </div>
                  <button
                    className="admin-button danger small"
                    onClick={() => removeManagerRole(manager.email)}
                    disabled={loading}
                    title="Remove manager role"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Users Section */}
        <div className="admin-section">
          <div className="admin-section-header">
            <Users size={20} />
            <h2>View All Users</h2>
          </div>
          <p className="admin-section-description">
            View all registered users and their roles.
          </p>

          <button
            className="admin-button primary"
            onClick={loadAllUsers}
            disabled={loadingUsers}
          >
            {loadingUsers ? (
              <>
                <Loader size={16} className="spinning" />
                Loading...
              </>
            ) : (
              <>
                <Users size={16} />
                Load All Users
              </>
            )}
          </button>

          {loadingUsers && allUsers.length === 0 ? (
            <div className="admin-loading">
              <Loader size={20} className="spinning" />
              <span>Loading users...</span>
            </div>
          ) : allUsers.length > 0 ? (
            <div className="users-list" style={{ marginTop: '1.5rem' }}>
              <div className="users-table-header">
                <div>Email</div>
                <div>Name</div>
                <div>Role</div>
                <div>Created</div>
              </div>
              {allUsers.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-email">{user.email}</div>
                  <div className="user-name">{user.full_name || '-'}</div>
                  <div className="user-role-badge">
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="user-created">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Reset Match to Pending Section */}
        <div className="admin-section">
          <div className="admin-section-header">
            <RotateCcw size={20} />
            <h2>Reset Match to Pending</h2>
          </div>
          <p className="admin-section-description">
            Search for a match by ID and reset it to pending status. This will clear all match data.
          </p>

          <div className="admin-form">
            <div className="form-group">
              <label htmlFor="matchId">
                <Search size={16} />
                Match ID
              </label>
              <input
                id="matchId"
                type="text"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                placeholder="Enter match UUID"
                onKeyPress={(e) => e.key === 'Enter' && !loadingMatch && searchMatch()}
                disabled={loadingMatch}
              />
            </div>

            <button
              className="admin-button primary"
              onClick={searchMatch}
              disabled={loadingMatch || !matchId.trim()}
            >
              {loadingMatch ? (
                <>
                  <Loader size={16} className="spinning" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search Match
                </>
              )}
            </button>

            {matchInfo && (
              <div className="match-info" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Tournament:</strong> {matchInfo.tournaments?.name || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Status:</strong> <span className={`status-badge ${matchInfo.status}`}>{matchInfo.status}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Type:</strong> {matchInfo.is_playoff ? 'Playoff' : 'Group'}
                </div>
                {matchInfo.player1_legs !== null && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Score:</strong> {matchInfo.player1_legs} - {matchInfo.player2_legs}
                  </div>
                )}
                <button
                  className="admin-button danger"
                  onClick={resetMatchToPending}
                  disabled={loadingMatch || matchInfo.status === 'pending'}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {loadingMatch ? (
                    <>
                      <Loader size={16} className="spinning" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      Reset to Pending
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Force Tournament Status Section */}
        <div className="admin-section">
          <div className="admin-section-header">
            <Settings size={20} />
            <h2>Force Tournament Status</h2>
          </div>
          <p className="admin-section-description">
            Search for a tournament by ID and manually change its status.
          </p>

          <div className="admin-form">
            <div className="form-group">
              <label htmlFor="tournamentId">
                <Search size={16} />
                Tournament ID
              </label>
              <input
                id="tournamentId"
                type="text"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                placeholder="Enter tournament UUID"
                onKeyPress={(e) => e.key === 'Enter' && !loadingTournament && searchTournament()}
                disabled={loadingTournament}
              />
            </div>

            <button
              className="admin-button primary"
              onClick={searchTournament}
              disabled={loadingTournament || !tournamentId.trim()}
            >
              {loadingTournament ? (
                <>
                  <Loader size={16} className="spinning" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search Tournament
                </>
              )}
            </button>

            {tournamentInfo && (
              <div style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label htmlFor="newStatus">Current Status: <span className={`status-badge ${tournamentInfo.status}`}>{tournamentInfo.status}</span></label>
                  <label htmlFor="newStatus" style={{ marginTop: '1rem' }}>New Status:</label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="admin-form select"
                  >
                    <option value="open_for_registration">Open for Registration</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Tournament:</strong> {tournamentInfo.name}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Players:</strong> {tournamentInfo.players?.length || 0}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Groups:</strong> {tournamentInfo.groups?.length || 0}
                  </div>
                </div>

                <button
                  className="admin-button primary"
                  onClick={forceTournamentStatus}
                  disabled={loadingTournament || newStatus === tournamentInfo.status}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  {loadingTournament ? (
                    <>
                      <Loader size={16} className="spinning" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Settings size={16} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Users, Play, ArrowLeft, Settings } from 'lucide-react';
import { useTournament } from '../contexts/TournamentContext';
import { useLanguage } from '../contexts/LanguageContext';

export function TournamentRegistration({ tournament, onBack }) {
  const { t } = useLanguage();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showStartTournament, setShowStartTournament] = useState(false);
  const [showEditSettings, setShowEditSettings] = useState(false);
  const [groupSettings, setGroupSettings] = useState({
    type: 'groups', // 'groups' or 'playersPerGroup'
    value: 2
  });
  const [tournamentSettings, setTournamentSettings] = useState({
    legsToWin: tournament.legsToWin || 3,
    startingScore: tournament.startingScore || 501,
    groupSettings: groupSettings,
    playoffSettings: tournament.playoffSettings || {
      enabled: false,
      playersPerGroup: 1,
      playoffLegsToWin: 3
    }
  });
  const { addPlayerToTournament, startTournament, updateTournamentSettings } = useTournament();

  const addPlayer = async () => {
    if (!newPlayerName.trim()) {
      alert(t('registration.pleaseEnterPlayerName'));
      return;
    }

    if (tournament.players.length >= 64) {
      alert(t('registration.tournamentFull'));
      return;
    }

    try {
      await addPlayerToTournament(newPlayerName.trim());
      setNewPlayerName('');
    } catch (error) {
      console.error('Error adding player:', error);
      alert(t('registration.failedToAddPlayer'));
    }
  };

  const handleStartTournament = async () => {
    if (tournament.players.length < 2) {
      alert(t('registration.needsAtLeast2Players'));
      return;
    }

    try {
      await startTournament(groupSettings);
      setShowStartTournament(false);
    } catch (error) {
      console.error('Error starting tournament:', error);
      alert(t('registration.failedToStartTournament'));
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

  return (
    <div className="tournament-registration">
      <div className="registration-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('registration.backToTournaments')}
        </button>
        <h1>{tournament.name}</h1>
        <div className="header-actions">
          <button 
            className="edit-settings-btn"
            onClick={() => setShowEditSettings(true)}
            title={t('registration.editTournamentSettings')}
          >
            <Settings size={18} />
            {t('registration.editSettings')}
          </button>
          <div className="tournament-status">
            <span className="status-badge open">{t('registration.openForRegistration')}</span>
          </div>
        </div>
      </div>

      <div className="registration-content">
        <div className="players-section">
          <div className="section-header">
            <h2>
              <Users size={20} />
              {t('registration.players')} ({tournament.players.length})
            </h2>
            <div className="add-player-form">
              <input
                type="text"
                placeholder={t('registration.enterPlayerName')}
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                maxLength={50}
              />
              <button 
                className="add-player-btn"
                onClick={addPlayer}
                disabled={!newPlayerName.trim() || tournament.players.length >= 64}
              >
                <Plus size={16} />
                {t('registration.addPlayer')}
              </button>
            </div>
          </div>

          <div className="players-list">
            {tournament.players.length === 0 ? (
              <div className="no-players">
                <p>{t('registration.noPlayersYet')}</p>
              </div>
            ) : (
              <div className="players-grid">
                {tournament.players.map((player, index) => (
                  <div key={player.id} className="player-card">
                    <span className="player-number">{index + 1}</span>
                    <span className="player-name">{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {tournament.players.length >= 2 && (
          <div className="start-tournament-section">
            <button 
              className="start-tournament-btn"
              onClick={() => setShowStartTournament(true)}
            >
              <Play size={20} />
              {t('registration.startTournament')}
            </button>
          </div>
        )}
      </div>

      {showStartTournament && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t('registration.startTournament')}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowStartTournament(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p>{t('registration.configureGroupDivision')}:</p>
              
              <div className="group-settings">
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="groupType"
                      value="groups"
                      checked={groupSettings.type === 'groups'}
                      onChange={(e) => setGroupSettings({...groupSettings, type: e.target.value})}
                    />
                    {t('registration.numberOfGroups')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="groupType"
                      value="playersPerGroup"
                      checked={groupSettings.type === 'playersPerGroup'}
                      onChange={(e) => setGroupSettings({...groupSettings, type: e.target.value})}
                    />
                    {t('registration.playersPerGroup')}
                  </label>
                </div>
                
                <div className="input-group">
                  <input
                    type="number"
                    min="2"
                    max={groupSettings.type === 'groups' ? tournament.players.length : Math.ceil(tournament.players.length / 2)}
                    value={groupSettings.value}
                    onChange={(e) => setGroupSettings({...groupSettings, value: parseInt(e.target.value)})}
                  />
                  <span>
                    {groupSettings.type === 'groups' ? t('common.groups') : t('registration.playersPerGroup')}
                  </span>
                </div>
              </div>

              <div className="tournament-preview">
                <h4>{t('registration.tournamentPreview')}:</h4>
                <p><strong>{t('registration.players')}:</strong> {tournament.players.length}</p>
                <p><strong>{t('registration.groups')}:</strong> {
                  groupSettings.type === 'groups' 
                    ? groupSettings.value 
                    : Math.ceil(tournament.players.length / groupSettings.value)
                }</p>
                <p><strong>{t('registration.playersPerGroup')}:</strong> {
                  groupSettings.type === 'groups'
                    ? Math.ceil(tournament.players.length / groupSettings.value)
                    : groupSettings.value
                }</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowStartTournament(false)}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="confirm-btn"
                onClick={handleStartTournament}
              >
                {t('registration.startTournament')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Settings Modal */}
      {showEditSettings && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t('registration.editTournamentSettings')}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditSettings(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="group-settings">
                <h4>{t('registration.matchSettings')}</h4>
                <div className="input-group">
                  <label>{t('registration.legsToWin')}:</label>
                  <select 
                    value={tournamentSettings.legsToWin}
                    onChange={(e) => setTournamentSettings({
                      ...tournamentSettings,
                      legsToWin: parseInt(e.target.value)
                    })}
                  >
                    <option value={1}>{t('tournaments.firstToLeg', { count: 1 })}</option>
                    <option value={2}>{t('tournaments.firstToLegs', { count: 2 })}</option>
                    <option value={3}>{t('tournaments.firstToLegs', { count: 3 })}</option>
                    <option value={4}>{t('tournaments.firstToLegs', { count: 4 })}</option>
                    <option value={5}>{t('tournaments.firstToLegs', { count: 5 })}</option>
                    <option value={7}>{t('tournaments.firstToLegs', { count: 7 })}</option>
                    <option value={9}>{t('tournaments.firstToLegs', { count: 9 })}</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>{t('registration.startingScore')}:</label>
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
                <h4>{t('registration.groupSettings')}</h4>
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
                    {t('registration.numberOfGroups')}
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
                    {t('registration.playersPerGroup')}
                  </label>
                </div>
                <div className="input-group">
                  <label>
                    {tournamentSettings.groupSettings.type === 'groups' ? t('registration.numberOfGroups') : t('registration.playersPerGroup')}:
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
                <h4>{t('registration.playoffSettings')}</h4>
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
                    {t('registration.enablePlayoffs')}
                  </label>
                </div>
                
                {tournamentSettings.playoffSettings.enabled && (
                  <div className="playoff-options">
                    <div className="input-group">
                      <label>{t('registration.playersAdvancingPerGroup')}:</label>
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
                      <label>{t('registration.playoffLegsToWin')}:</label>
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
                        <option value={1}>{t('tournaments.firstToLeg', { count: 1 })}</option>
                        <option value={2}>{t('tournaments.firstToLegs', { count: 2 })}</option>
                        <option value={3}>{t('tournaments.firstToLegs', { count: 3 })}</option>
                        <option value={5}>{t('tournaments.firstToLegs', { count: 5 })}</option>
                        <option value={7}>{t('tournaments.firstToLegs', { count: 7 })}</option>
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
                {t('common.cancel')}
              </button>
              <button 
                className="confirm-btn"
                onClick={updateSettings}
              >
                {t('registration.updateSettings')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Generate unique ID for tournaments
const generateId = () => {
  return crypto.randomUUID();
};

export function TournamentCreation({ onTournamentCreated, onBack }) {
  const { t } = useLanguage();
  const [tournamentName, setTournamentName] = useState('');
  const [legsToWin, setLegsToWin] = useState(3);

  const createTournament = () => {
    if (!tournamentName.trim()) {
      alert(t('tournaments.pleaseEnterName'));
      return;
    }

    const tournament = {
      id: generateId(),
      name: tournamentName.trim(),
      players: [], // Players will be added after creation
      groups: [], // Groups will be generated when tournament starts
      legsToWin: legsToWin,
      startingScore: 501,
      playoffSettings: {
        enabled: false,
        playersPerGroup: 1,
        legsToWinByRound: {
          16: 3,  // Round of 16
          8: 3,   // Quarter-finals
          4: 3,   // Semi-finals
          2: 3    // Final
        }
      },
      standingsCriteriaOrder: ['matchesWon', 'legDifference', 'average', 'headToHead'],
      playoffs: null, // Playoffs will be created only when user clicks "Start Playoffs"
      createdAt: new Date().toISOString(),
      status: 'open_for_registration' // Tournament is open for player registration
    };

    onTournamentCreated(tournament);
  };



  return (
    <div className="tournament-creation">
      <div className="creation-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          {t('common.backToDashboard')}
        </button>
        <div className="header-content">
          <Trophy className="header-icon" />
          <h2>{t('tournaments.createNew')}</h2>
        </div>
      </div>

      <div className="creation-form">
        <div className="form-section">
          <label htmlFor="tournament-name">{t('tournaments.tournamentName')}</label>
          <input
            id="tournament-name"
            type="text"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder={t('tournaments.enterTournamentName')}
            maxLength={50}
          />
        </div>

        <div className="form-section">
          <label htmlFor="legs-to-win">{t('tournaments.defaultLegsToWin')}</label>
          <select
            id="legs-to-win"
            value={legsToWin}
            onChange={(e) => setLegsToWin(parseInt(e.target.value))}
            className="legs-selector"
          >
            <option value={1}>{t('tournaments.firstToLeg', { count: 1 })}</option>
            <option value={2}>{t('tournaments.firstToLegs', { count: 2 })}</option>
            <option value={3}>{t('tournaments.firstToLegs', { count: 3 })}</option>
            <option value={4}>{t('tournaments.firstToLegs', { count: 4 })}</option>
            <option value={5}>{t('tournaments.firstToLegs', { count: 5 })}</option>
          </select>
        </div>

        <div className="form-info">
          <p>{t('tournaments.afterCreatingYouCan')}:</p>
          <ul>
            <li>{t('tournaments.addPlayers')}</li>
            <li>{t('tournaments.configureGroupSettings')}</li>
            <li>{t('tournaments.setupPlayoffSettings')}</li>
            <li>{t('tournaments.startWhenReady')}</li>
          </ul>
        </div>




        <button 
          className="create-tournament-btn"
          onClick={createTournament}
          disabled={!tournamentName.trim()}
        >
          <Trophy size={20} />
          {t('tournaments.create')}
        </button>
      </div>
    </div>
  );
}

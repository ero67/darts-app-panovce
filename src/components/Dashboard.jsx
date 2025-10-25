import React from 'react';
import { Plus, Trophy, Users, Target, Calendar, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Dashboard({ tournaments, onCreateTournament, onSelectTournament }) {
  const { t } = useLanguage();
  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');
  
  const totalPlayers = tournaments.reduce((sum, t) => sum + t.players.length, 0);
  const totalMatches = tournaments.reduce((sum, t) => 
    sum + t.groups.reduce((groupSum, g) => groupSum + g.matches.length, 0), 0
  );

  const recentTournaments = tournaments
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('dashboard.title')}</h1>
        <button className="create-tournament-btn" onClick={onCreateTournament}>
          <Plus size={20} />
          {t('tournaments.create')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <h3>{tournaments.length}</h3>
            <p>{t('dashboard.totalTournaments')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h3>{activeTournaments.length}</h3>
            <p>{t('dashboard.activeTournaments')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalPlayers}</h3>
            <p>{t('dashboard.totalPlayers')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalMatches}</h3>
            <p>{t('dashboard.totalMatches')}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-tournaments">
          <h2>{t('dashboard.recentTournaments')}</h2>
          {recentTournaments.length > 0 ? (
            <div className="tournament-list">
              {recentTournaments.map(tournament => (
                <div key={tournament.id} className="tournament-card" onClick={() => onSelectTournament(tournament)}>
                  <div className="tournament-header">
                    <h3>{tournament.name}</h3>
                    <span className={`status-badge ${tournament.status}`}>
                      {tournament.status}
                    </span>
                  </div>
                  <div className="tournament-stats">
                    <div className="stat">
                      <Users size={16} />
                      <span>{tournament.players.length} {t('common.players')}</span>
                    </div>
                    <div className="stat">
                      <Trophy size={16} />
                      <span>{tournament.groups.length} {t('common.groups')}</span>
                    </div>
                    <div className="stat">
                      <Calendar size={16} />
                      <span>{new Date(tournament.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Trophy size={48} />
              <h3>{t('dashboard.noTournaments')}</h3>
              <p>{t('dashboard.createFirst')}</p>
              <button className="create-first-btn" onClick={onCreateTournament}>
                <Plus size={20} />
                {t('tournaments.create')}
              </button>
            </div>
          )}
        </div>

        {activeTournaments.length > 0 && (
          <div className="active-tournaments">
            <h2>{t('dashboard.activeTournaments')}</h2>
            <div className="tournament-list">
              {activeTournaments.map(tournament => (
                <div key={tournament.id} className="tournament-card active" onClick={() => onSelectTournament(tournament)}>
                  <div className="tournament-header">
                    <h3>{tournament.name}</h3>
                    <span className="status-badge active">{t('common.active')}</span>
                  </div>
                  <div className="tournament-stats">
                    <div className="stat">
                      <Users size={16} />
                      <span>{tournament.players.length} {t('common.players')}</span>
                    </div>
                    <div className="stat">
                      <Target size={16} />
                      <span>
                        {tournament.groups.reduce((sum, g) => 
                          sum + g.matches.filter(m => m.status === 'completed').length, 0
                        )} / {tournament.groups.reduce((sum, g) => sum + g.matches.length, 0)} {t('common.matches')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

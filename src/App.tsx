import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeTab } from './components/tabs/HomeTab';
import { LogMatchTab } from './components/tabs/LogMatchTab';
import { H2HStatsTab } from './components/tabs/H2HStatsTab';
import { MatchHistoryTab } from './components/tabs/MatchHistoryTab';
import { TournamentsTab } from './components/tabs/TournamentsTab';
import { LeaderboardTab } from './components/tabs/LeaderboardTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { PlayerStatsTab } from './components/tabs/PlayerStatsTab';
import { useCricketData } from './hooks/useCricketData';
import type { Player } from './types';
import type { Match } from './types';
import type { Tournament } from './types';


export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [viewingPlayerId, setViewingPlayerId] = useState<number | null>(null);

  const {
    players,
    matches,
    tournaments,
    trash,
    addPlayer,
    updatePlayer,
    logMatch,
    updateMatch,
    addTournament,
    deleteTournament,
    deleteToArchive,
    restoreFromArchive,
    deletePermanently,
    importData,
    exportData,
  } = useCricketData();

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleEditPlayer = useCallback((player: Player) => {
    setEditingPlayer(player);
    setActiveTab('home');
    window.scrollTo(0, 0);
  }, []);

  const handleViewStats = useCallback((playerId: number) => {
    setViewingPlayerId(playerId);
    setActiveTab('career-stats');
  }, []);
  
  const handleEditMatch = useCallback((match: Match) => {
    setEditingMatch(match);
    setActiveTab('log-match');
    window.scrollTo(0, 0);
  }, []);

  const resetEditingPlayer = useCallback(() => {
    setEditingPlayer(null);
  }, []);

  const resetEditingMatch = useCallback(() => {
    setEditingMatch(null);
  }, []);
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            players={players}
            matches={matches}
            editingPlayer={editingPlayer}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
            onEditPlayer={handleEditPlayer}
            onDeletePlayer={(id) => deleteToArchive('player', id)}
            onViewStats={handleViewStats}
            onResetEditingPlayer={resetEditingPlayer}
          />
        );
      case 'log-match':
        return (
          <LogMatchTab
            players={players}
            tournaments={tournaments}
            matches={matches}
            editingMatch={editingMatch}
            onLogMatch={logMatch}
            onUpdateMatch={updateMatch}
            onResetEditingMatch={resetEditingMatch}
          />
        );
      case 'h2h-stats':
        return <H2HStatsTab players={players} matches={matches} tournaments={tournaments} />;
      case 'match-history':
        return <MatchHistoryTab matches={matches} players={players} tournaments={tournaments} onEditMatch={handleEditMatch} onDeleteMatch={(id) => deleteToArchive('match', id)} />;
      case 'tournaments':
        return <TournamentsTab players={players} tournaments={tournaments} matches={matches} onAddTournament={addTournament} onDeleteTournament={deleteTournament} />;
      case 'leaderboard':
        return <LeaderboardTab players={players} matches={matches} tournaments={tournaments} />;
      case 'settings':
        return <SettingsTab trash={trash} onRestore={restoreFromArchive} onDeletePermanently={deletePermanently} onImportData={importData} onExportData={exportData} />;
      case 'career-stats':
        if (viewingPlayerId) {
          const player = players.find(p => p.id === viewingPlayerId);
          if(player) {
            return <PlayerStatsTab player={player} matches={matches} tournaments={tournaments} />;
          }
        }
        return null;
      default:
        return <HomeTab players={players} matches={matches} editingPlayer={editingPlayer} onAddPlayer={addPlayer} onUpdatePlayer={updatePlayer} onEditPlayer={handleEditPlayer} onDeletePlayer={(id) => deleteToArchive('player', id)} onViewStats={handleViewStats} onResetEditingPlayer={resetEditingPlayer}/>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-dark-text transition-colors duration-300">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}

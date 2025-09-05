import { useState, useEffect, useCallback } from 'react';
import type { Player, Match, Tournament, TrashItem, TrashItemType } from '../types';
import { ACHIEVEMENTS } from '../constants';

const DB_KEY = 'cricketAppDb';

interface CricketData {
    players: Player[];
    matches: Match[];
    tournaments: Tournament[];
    trash: TrashItem[];
}

const initialDb: CricketData = {
    players: [],
    matches: [],
    tournaments: [],
    trash: [],
};

export const useCricketData = () => {
    const [db, setDb] = useState<CricketData>(initialDb);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedDb = localStorage.getItem(DB_KEY);
            if (storedDb) {
                const parsedDb: CricketData = JSON.parse(storedDb);
                // Data validation/migration can go here
                parsedDb.players = parsedDb.players || [];
                parsedDb.matches = parsedDb.matches || [];
                parsedDb.tournaments = parsedDb.tournaments || [];
                parsedDb.trash = parsedDb.trash || [];
                parsedDb.players.forEach(p => {
                    if (!p.achievements) p.achievements = [];
                });
                setDb(parsedDb);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(DB_KEY, JSON.stringify(db));
            } catch (error) {
                console.error("Failed to save data to localStorage", error);
            }
        }
    }, [db, isLoaded]);

    const checkForNewAchievements = useCallback((updatedMatches: Match[], updatedPlayers: Player[]) => {
        // This function is complex to implement fully without the stats calculator
        // For now, we'll just return the players as is.
        // A full implementation would calculate stats and check achievement conditions.
        return updatedPlayers;
    }, []);

    const addPlayer = useCallback((player: Omit<Player, 'id' | 'achievements'>) => {
        setDb(prevDb => {
            const newPlayer: Player = { ...player, id: Date.now(), achievements: [] };
            return { ...prevDb, players: [...prevDb.players, newPlayer] };
        });
    }, []);
    
    const updatePlayer = useCallback((updatedPlayer: Player) => {
        setDb(prevDb => ({
            ...prevDb,
            players: prevDb.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
        }));
    }, []);

    const logMatch = useCallback((match: Omit<Match, 'id'>) => {
        setDb(prevDb => {
            const newMatch: Match = { ...match, id: Date.now() };
            newMatch.performances.forEach(p => p.matchId = newMatch.id);
            const updatedMatches = [...prevDb.matches, newMatch];
            const updatedPlayers = checkForNewAchievements(updatedMatches, prevDb.players);
            return { ...prevDb, matches: updatedMatches, players: updatedPlayers };
        });
    }, [checkForNewAchievements]);

    const updateMatch = useCallback((updatedMatch: Match) => {
        setDb(prevDb => {
            const updatedMatches = prevDb.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
            const updatedPlayers = checkForNewAchievements(updatedMatches, prevDb.players);
            return { ...prevDb, matches: updatedMatches, players: updatedPlayers };
        });
    }, [checkForNewAchievements]);

    const addTournament = useCallback((tournament: Omit<Tournament, 'id'>) => {
        setDb(prevDb => {
            const newTournament: Tournament = { ...tournament, id: Date.now() };
            return { ...prevDb, tournaments: [...prevDb.tournaments, newTournament] };
        });
    }, []);
    
    const deleteTournament = useCallback((tournamentId: number) => {
        setDb(prevDb => {
            const updatedMatches = prevDb.matches.map(m => 
                m.tournamentId === tournamentId ? { ...m, tournamentId: null } : m
            );
            const updatedTournaments = prevDb.tournaments.filter(t => t.id !== tournamentId);
            return { ...prevDb, matches: updatedMatches, tournaments: updatedTournaments };
        });
    }, []);

    const deleteToArchive = useCallback((type: TrashItemType, id: number) => {
        setDb(prevDb => {
            const newDb = { ...prevDb };
            let itemToMove: Player | Match | Tournament | undefined;

            if (type === 'player') {
                itemToMove = newDb.players.find(p => p.id === id);
                if (itemToMove) newDb.players = newDb.players.filter(p => p.id !== id);
            } else if (type === 'match') {
                itemToMove = newDb.matches.find(m => m.id === id);
                if (itemToMove) newDb.matches = newDb.matches.filter(m => m.id !== id);
            } else if (type === 'tournament') {
                itemToMove = newDb.tournaments.find(t => t.id === id);
                if (itemToMove) newDb.tournaments = newDb.tournaments.filter(t => t.id !== id);
            }

            if (itemToMove) {
                const trashItem: TrashItem = { type, data: itemToMove, deletedOn: new Date().toISOString() };
                newDb.trash = [trashItem, ...newDb.trash];
            }
            return newDb;
        });
    }, []);

    const restoreFromArchive = useCallback((itemToRestore: TrashItem) => {
        setDb(prevDb => {
            const newDb = { ...prevDb };
            const { type, data } = itemToRestore;

            if (type === 'player') newDb.players.push(data as Player);
            else if (type === 'match') newDb.matches.push(data as Match);
            else if (type === 'tournament') newDb.tournaments.push(data as Tournament);
            
            newDb.trash = newDb.trash.filter(item => item.data.id !== data.id || item.type !== type);
            return newDb;
        });
    }, []);

    const deletePermanently = useCallback((itemToDelete: TrashItem) => {
        setDb(prevDb => ({
            ...prevDb,
            trash: prevDb.trash.filter(item => item.data.id !== itemToDelete.data.id || item.type !== itemToDelete.type)
        }));
    }, []);

    const importData = useCallback((importedData: string) => {
         try {
            const parsedDb: CricketData = JSON.parse(importedData);
            if (parsedDb && Array.isArray(parsedDb.players) && Array.isArray(parsedDb.matches)) {
                if (window.confirm("This will overwrite all current data. Are you sure?")) {
                    setDb(parsedDb);
                    alert("Data imported successfully!");
                }
            } else {
                alert("Invalid data file format.");
            }
        } catch (error) {
            alert("Error reading file.");
        }
    }, []);

    const exportData = useCallback(() => {
        if (db.players.length === 0 && db.matches.length === 0) {
            alert("No data to export.");
            return;
        }
        const dataStr = JSON.stringify(db, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cricket_stats_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [db]);

    return {
        players: db.players,
        matches: db.matches,
        tournaments: db.tournaments,
        trash: db.trash,
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
        exportData
    };
};

import React, { useState, useMemo } from 'react';
import type { Player, Match, Tournament, CalculatedStats } from '../../types';
import { Card } from '../Card';
import { getPlayerStats } from '../../utils/statsCalculator';

interface H2HStatsTabProps {
    players: Player[];
    matches: Match[];
    tournaments: Tournament[];
}

export const H2HStatsTab: React.FC<H2HStatsTabProps> = ({ players, matches, tournaments }) => {
    const [selectedPlayers, setSelectedPlayers] = useState<(number | '')[]>(['', '', '']);
    const [filters, setFilters] = useState({ format: '', year: '', tournament: '' });

    const handlePlayerSelect = (index: number, playerId: string) => {
        const newSelection = [...selectedPlayers];
        newSelection[index] = playerId ? parseInt(playerId) : '';
        setSelectedPlayers(newSelection);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const comparedPlayerData = useMemo(() => {
        return selectedPlayers
            .filter((id): id is number => id !== '')
            .map(id => {
                const player = players.find(p => p.id === id);
                return player ? {
                    player,
                    stats: getPlayerStats(id, matches, tournaments, filters)
                } : null;
            })
            .filter((data): data is { player: Player, stats: CalculatedStats } => data !== null);
    }, [selectedPlayers, filters, players, matches, tournaments]);

    const availableFormats = useMemo(() => [...new Set(matches.map(m => m.format))], [matches]);
    const availableYears = useMemo(() => [...new Set(matches.map(m => new Date(m.date).getFullYear()))].sort((a, b) => b - a), [matches]);

    // Fix: Add `as const` to give TypeScript a more specific type for `row.key`,
    // ensuring that it only refers to keys with renderable primitive values.
    const statRows = [
        { label: "Matches", key: "matches" }, { label: "Batting Innings", key: "inningsBat" },
        { label: "Runs Scored", key: "runs" }, { label: "Highest Score", key: "highestScore" },
        { label: "Batting Average", key: "battingAvg" }, { label: "Batting SR", key: "battingSR" },
        { label: "50s", key: "fifties" }, { label: "25s", key: "twentyFives" }, { label: "Ducks", key: "ducks" },
        { label: "Bowling Innings", key: "inningsBowl" }, { label: "Wickets", key: "wickets" },
        { label: "Best Bowling", key: "bbi" }, { label: "Bowling Average", key: "bowlingAvg" },
        { label: "Economy", key: "economy" }, { label: "Bowling SR", key: "bowlingSR" },
        { label: "3-Wicket Hauls", key: "threeWicketHauls" }, { label: "MOTM Awards", key: "motm" },
        { label: "Catches", key: "catches" }
    ] as const;

    return (
        <Card title="Head-to-Head Comparison">
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPlayers.map((id, index) => (
                        <select key={index} value={id} onChange={e => handlePlayerSelect(index, e.target.value)} className="input-field">
                            <option value="">-- Select Player {index + 1} --</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select name="format" value={filters.format} onChange={handleFilterChange} className="input-field">
                        <option value="">All Formats</option>
                        {availableFormats.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select name="year" value={filters.year} onChange={handleFilterChange} className="input-field">
                        <option value="">All Years</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select name="tournament" value={filters.tournament} onChange={handleFilterChange} className="input-field">
                        <option value="">All Tournaments</option>
                        {tournaments.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            {comparedPlayerData.length < 2 ? (
                <p>Select at least two players to compare.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                        <thead className="bg-gray-50 dark:bg-dark-border">
                            <tr>
                                <th className="th-cell text-left">Stat</th>
                                {comparedPlayerData.map(({ player }) => <th key={player.id} className="th-cell text-center">{player.name}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                            {statRows.map(row => (
                                <tr key={row.key}>
                                    <td className="td-cell font-medium">{row.label}</td>
                                    {comparedPlayerData.map(({ player, stats }) => (
                                        <td key={player.id} className="td-cell text-center">{stats[row.key]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

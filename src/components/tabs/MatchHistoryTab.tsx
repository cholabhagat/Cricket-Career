import React, { useMemo } from 'react';
import type { Match, Player, Tournament } from '../../types';
import { Card } from '../Card';

interface MatchHistoryTabProps {
    matches: Match[];
    players: Player[];
    tournaments: Tournament[];
    onEditMatch: (match: Match) => void;
    onDeleteMatch: (id: number) => void;
}

export const MatchHistoryTab: React.FC<MatchHistoryTabProps> = ({ matches, players, tournaments, onEditMatch, onDeleteMatch }) => {
    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [matches]);

    const getPlayerName = (id: number | null) => players.find(p => p.id === id)?.name || '-';
    const getTournamentName = (id: number | null) => tournaments.find(t => t.id === id)?.name || '-';

    return (
        <Card title="Match History">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                    <thead className="bg-gray-50 dark:bg-dark-border">
                        <tr>
                            <th className="th-cell text-left">Date</th>
                            <th className="th-cell text-left">Format</th>
                            <th className="th-cell text-left">Tournament</th>
                            <th className="th-cell text-left">Players</th>
                            <th className="th-cell text-left">MOTM</th>
                            <th className="th-cell text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                        {sortedMatches.map(match => (
                            <tr key={match.id}>
                                <td className="td-cell">{match.date}</td>
                                <td className="td-cell">{match.format}</td>
                                <td className="td-cell">{getTournamentName(match.tournamentId)}</td>
                                <td className="td-cell text-sm">
                                    {match.performances.map(p => getPlayerName(p.playerId)).join(', ')}
                                </td>
                                <td className="td-cell">{getPlayerName(match.motmPlayerId)}</td>
                                <td className="td-cell">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => onEditMatch(match)} className="btn-sm btn-secondary">Edit</button>
                                        <button onClick={() => window.confirm('Are you sure?') && onDeleteMatch(match.id)} className="btn-sm btn-danger">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

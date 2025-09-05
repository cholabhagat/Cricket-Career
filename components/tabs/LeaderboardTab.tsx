
import React, { useState, useMemo } from 'react';
import type { Player, Match, Tournament, CalculatedStats } from '../../types';
import { Card } from '../Card';
import { getPlayerStats } from '../../utils/statsCalculator';

interface LeaderboardTabProps {
    players: Player[];
    matches: Match[];
    tournaments: Tournament[];
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ players, matches, tournaments }) => {
    const [filters, setFilters] = useState({ format: '', year: '', tournament: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const leaderboardData = useMemo(() => {
        return players.map(player => ({
            player,
            stats: getPlayerStats(player.id, matches, tournaments, filters)
        })).filter(data => data.stats.matches > 0);
    }, [players, matches, tournaments, filters]);

    const LeaderboardTable = ({ title, data, columns }: { title: string, data: any[], columns: { header: string, accessor: (item: any) => any }[] }) => (
        <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-dark-border">
                    <thead className="bg-gray-50 dark:bg-dark-border">
                        <tr>
                            <th className="th-cell text-left">#</th>
                            {columns.map(col => <th key={col.header} className="th-cell text-left">{col.header}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                        {data.slice(0, 10).map((item, index) => (
                            <tr key={item.player.id}>
                                <td className="td-cell">{index + 1}</td>
                                {columns.map(col => <td key={col.header} className="td-cell">{col.accessor(item)}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const availableFormats = useMemo(() => [...new Set(matches.map(m => m.format))], [matches]);
    const availableYears = useMemo(() => [...new Set(matches.map(m => new Date(m.date).getFullYear()))].sort((a, b) => b - a), [matches]);

    return (
        <Card title="Leaderboards">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeaderboardTable
                    title="Most Runs"
                    data={[...leaderboardData].sort((a, b) => b.stats.runs - a.stats.runs)}
                    columns={[
                        { header: 'Player', accessor: item => item.player.name },
                        { header: 'Matches', accessor: item => item.stats.matches },
                        { header: 'Runs', accessor: item => item.stats.runs },
                        { header: 'Avg', accessor: item => item.stats.battingAvg },
                        { header: 'SR', accessor: item => item.stats.battingSR },
                    ]}
                />
                <LeaderboardTable
                    title="Most Wickets"
                    data={[...leaderboardData].sort((a, b) => b.stats.wickets - a.stats.wickets)}
                    columns={[
                        { header: 'Player', accessor: item => item.player.name },
                        { header: 'Matches', accessor: item => item.stats.matches },
                        { header: 'Wickets', accessor: item => item.stats.wickets },
                        { header: 'Avg', accessor: item => item.stats.bowlingAvg },
                        { header: 'Econ', accessor: item => item.stats.economy },
                    ]}
                />
            </div>
        </Card>
    );
};

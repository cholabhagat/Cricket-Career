import React, { useState, useMemo } from 'react';
import type { Player, Match, Tournament } from '../../types';
import { Card } from '../Card';
import { getPlayerStats, calculateCareerProgression } from '../../utils/statsCalculator';
import { getAge } from '../../utils/helpers';
import { DEFAULT_AVATAR, ACHIEVEMENTS } from '../../constants';
import { RunsChart } from '../charts/RunsChart';
import { DismissalChart } from '../charts/DismissalChart';
import { CareerProgressionChart } from '../charts/CareerProgressionChart';

interface PlayerStatsTabProps {
    player: Player;
    matches: Match[];
    tournaments: Tournament[];
}

export const PlayerStatsTab: React.FC<PlayerStatsTabProps> = ({ player, matches, tournaments }) => {
    const [filters, setFilters] = useState({ format: '', year: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const stats = useMemo(() => {
        return getPlayerStats(player.id, matches, tournaments, filters);
    }, [player.id, matches, tournaments, filters]);

    const availableFormats = useMemo(() => [...new Set(matches.filter(m => m.performances.some(p => p.playerId === player.id)).map(m => m.format))], [matches, player.id]);
    const availableYears = useMemo(() => [...new Set(matches.filter(m => m.performances.some(p => p.playerId === player.id)).map(m => new Date(m.date).getFullYear()))].sort((a,b) => b-a), [matches, player.id]);

    const progressionData = useMemo(() => calculateCareerProgression(stats.performances, matches), [stats.performances, matches]);

    const unlockedAchievements = ACHIEVEMENTS.filter(ach => ach.condition({ ...player, stats }));

    const StatTable = ({ title, data }: { title: string; data: { [key: string]: string | number } }) => (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 dark:bg-dark-border">{Object.keys(data).map(key => <th key={key} className="p-2 text-left">{key}</th>)}</tr>
                </thead>
                <tbody>
                    <tr>{Object.values(data).map((val, i) => <td key={i} className="p-2 text-center border dark:border-dark-border">{val}</td>)}</tr>
                </tbody>
            </table>
        </div>
    );
    
    return (
        <Card>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <img src={player.avatarUrl || DEFAULT_AVATAR} alt={player.name} className="w-24 h-24 rounded-full object-cover" />
                <div>
                    <h2 className="text-3xl font-bold">{player.name}</h2>
                    <p>Age: {getAge(player.dob)}</p>
                    <p>Role: {player.role || 'N/A'}</p>
                    <p>Batting: {player.battingStyle || 'N/A'} | Bowling: {player.bowlingStyle || 'N/A'}</p>
                </div>
            </div>
            
            <div className="mb-4">
                <h3 className="font-semibold mb-2">Achievements</h3>
                <div className="flex flex-wrap gap-2">
                    {unlockedAchievements.length > 0 ? unlockedAchievements.map(ach => (
                        <span key={ach.id} title={ach.description} className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{ach.name}</span>
                    )) : <p>No achievements unlocked yet.</p>}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <select name="format" value={filters.format} onChange={handleFilterChange} className="input-field">
                    <option value="">Overall Career</option>
                    {availableFormats.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select name="year" value={filters.year} onChange={handleFilterChange} className="input-field">
                    <option value="">All Years</option>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            
            <div className="space-y-6">
                <StatTable title="Batting" data={{ M: stats.matches, I: stats.inningsBat, NO: stats.notOuts, Runs: stats.runs, HS: stats.highestScore, Avg: stats.battingAvg, BF: stats.ballsFaced, SR: stats.battingSR, Ducks: stats.ducks }} />
                <StatTable title="Bowling" data={{ M: stats.matches, I: stats.inningsBowl, Overs: stats.overs, Balls: stats.ballsBowled, Runs: stats.runsConceded, Wkts: stats.wickets, BBI: stats.bbi, Avg: stats.bowlingAvg, Econ: stats.economy, SR: stats.bowlingSR }} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatTable title="Milestones & Awards" data={{ '25s': stats.twentyFives, '50s': stats.fifties, '3W': stats.threeWicketHauls, '5W': stats.fiveWicketHauls, Hattrick: stats.hatTricks, MOTM: stats.motm }} />
                    <StatTable title="Fielding" data={{ Catches: stats.catches, Stumpings: stats.stumpings, "Run Outs": stats.runOuts }} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                 <div className="h-80"><RunsChart performances={stats.performances} /></div>
                 <div className="h-80"><DismissalChart dismissalTypes={stats.dismissalTypes} /></div>
                 <div className="h-80 lg:col-span-2"><CareerProgressionChart data={progressionData} /></div>
            </div>
        </Card>
    );
};

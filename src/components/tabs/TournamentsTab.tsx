import React, { useState } from 'react';
import type { Player, Tournament, Match } from '../../types';
import { Card } from '../Card';
import { getPlayerStats } from '../../utils/statsCalculator';

interface TournamentsTabProps {
    players: Player[];
    tournaments: Tournament[];
    matches: Match[];
    onAddTournament: (tournament: Omit<Tournament, 'id'>) => void;
    onDeleteTournament: (id: number) => void;
}

export const TournamentsTab: React.FC<TournamentsTabProps> = ({ players, tournaments, matches, onAddTournament, onDeleteTournament }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'solo' | 'team'>('team');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [participants, setParticipants] = useState<number[]>([]);
    const [team1Players, setTeam1Players] = useState<number[]>([]);
    const [team2Players, setTeam2Players] = useState<number[]>([]);
    const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);

    const resetForm = () => {
        setName('');
        setType('team');
        setStartDate('');
        setEndDate('');
        setParticipants([]);
        setTeam1Players([]);
        setTeam2Players([]);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tournamentData: Omit<Tournament, 'id'> = { name, type, startDate, endDate };
        if (type === 'solo') {
            tournamentData.participants = participants;
        } else {
            tournamentData.teams = [
                { id: 1, players: team1Players },
                { id: 2, players: team2Players },
            ];
        }
        onAddTournament(tournamentData);
        resetForm();
    };

    const handlePlayerTagAction = (setter: React.Dispatch<React.SetStateAction<number[]>>, playerId: number, action: 'add' | 'remove') => {
        if (action === 'add') {
            setter(prev => [...prev, playerId]);
        } else {
            setter(prev => prev.filter(id => id !== playerId));
        }
    };
    
    const TournamentLeaderboard = ({ tournament }: { tournament: Tournament }) => {
        const stats = players
            .map(p => ({
                player: p,
                stats: getPlayerStats(p.id, matches, tournaments, { tournament: tournament.name })
            }))
            .filter(data => data.stats.matches > 0);

        const topRunScorers = [...stats].sort((a, b) => b.stats.runs - a.stats.runs);
        const topWicketTakers = [...stats].sort((a, b) => b.stats.wickets - a.stats.wickets);

        return (
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Tournament Leaderboard: {tournament.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-2">Top Run Scorers</h4>
                        <table className="min-w-full text-sm">
                           <thead><tr><th>Player</th><th>M</th><th>Runs</th><th>Avg</th></tr></thead>
                           <tbody>{topRunScorers.map(({player, stats}) => <tr key={player.id}><td>{player.name}</td><td>{stats.matches}</td><td>{stats.runs}</td><td>{stats.battingAvg}</td></tr>)}</tbody>
                        </table>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Top Wicket Takers</h4>
                        <table className="min-w-full text-sm">
                           <thead><tr><th>Player</th><th>M</th><th>Wkts</th><th>Avg</th></tr></thead>
                           <tbody>{topWicketTakers.map(({player, stats}) => <tr key={player.id}><td>{player.name}</td><td>{stats.matches}</td><td>{stats.wickets}</td><td>{stats.bowlingAvg}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
                 <button onClick={() => setViewingTournament(null)} className="btn btn-secondary mt-4">Close Details</button>
            </div>
        );
    };


    return (
        <Card title="Tournaments">
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tournament Name" required className="input-field" />
                    <select value={type} onChange={e => setType(e.target.value as 'solo' | 'team')} className="input-field">
                        <option value="team">Team Play</option>
                        <option value="solo">Solo Play</option>
                    </select>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
                </div>
                {type === 'solo' ? (
                     <div>
                        <label className="font-semibold">Select Players</label>
                        <div className="p-2 border rounded-md dark:border-dark-border mt-2 min-h-[40px] flex flex-wrap gap-2">
                            {participants.map(id => <span key={id} className="tag">{players.find(p=>p.id===id)?.name} <button type="button" onClick={()=>handlePlayerTagAction(setParticipants, id, 'remove')}>x</button></span>)}
                        </div>
                        <select onChange={e => handlePlayerTagAction(setParticipants, Number(e.target.value), 'add')} className="input-field mt-2">
                            <option>-- Add Player --</option>
                            {players.filter(p => !participants.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Team 1 */}
                        <div>
                           <label className="font-semibold">Team 1</label>
                           <div className="p-2 border rounded-md dark:border-dark-border mt-2 min-h-[40px] flex flex-wrap gap-2">
                               {team1Players.map(id => <span key={id} className="tag">{players.find(p=>p.id===id)?.name} <button type="button" onClick={()=>handlePlayerTagAction(setTeam1Players, id, 'remove')}>x</button></span>)}
                           </div>
                           <select onChange={e => handlePlayerTagAction(setTeam1Players, Number(e.target.value), 'add')} className="input-field mt-2">
                               <option>-- Add Player to Team 1 --</option>
                               {players.filter(p => !team1Players.includes(p.id) && !team2Players.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                           </select>
                        </div>
                        {/* Team 2 */}
                        <div>
                           <label className="font-semibold">Team 2</label>
                           <div className="p-2 border rounded-md dark:border-dark-border mt-2 min-h-[40px] flex flex-wrap gap-2">
                               {team2Players.map(id => <span key={id} className="tag">{players.find(p=>p.id===id)?.name} <button type="button" onClick={()=>handlePlayerTagAction(setTeam2Players, id, 'remove')}>x</button></span>)}
                           </div>
                           <select onChange={e => handlePlayerTagAction(setTeam2Players, Number(e.target.value), 'add')} className="input-field mt-2">
                               <option>-- Add Player to Team 2 --</option>
                               {players.filter(p => !team1Players.includes(p.id) && !team2Players.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                           </select>
                        </div>
                    </div>
                )}
                <div className="text-right">
                    <button type="submit" className="btn btn-primary">Create Tournament</button>
                </div>
            </form>

            <table className="min-w-full">
                {/* table content */}
            </table>
            
             <h3 className="text-xl font-semibold border-t pt-4 dark:border-dark-border">Existing Tournaments</h3>
             <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                    <thead className="bg-gray-50 dark:bg-dark-border">
                        <tr>
                            <th className="th-cell text-left">Name</th>
                            <th className="th-cell text-left">Type</th>
                            <th className="th-cell text-left">Dates</th>
                            <th className="th-cell text-left">Matches</th>
                            <th className="th-cell text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                        {tournaments.map(t => (
                            <tr key={t.id}>
                                <td className="td-cell">{t.name}</td>
                                <td className="td-cell capitalize">{t.type}</td>
                                <td className="td-cell">{t.startDate} to {t.endDate}</td>
                                <td className="td-cell">{matches.filter(m => m.tournamentId === t.id).length}</td>
                                <td className="td-cell">
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => setViewingTournament(t)} className="btn-sm btn-secondary">View</button>
                                        <button onClick={() => window.confirm('Are you sure?') && onDeleteTournament(t.id)} className="btn-sm btn-danger">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {viewingTournament && <TournamentLeaderboard tournament={viewingTournament} />}
        </Card>
    );
};

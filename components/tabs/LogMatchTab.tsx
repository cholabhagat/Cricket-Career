
import React, { useState, useEffect } from 'react';
import type { Player, Match, Tournament, Performance } from '../../types';
import { Card } from '../Card';

interface LogMatchTabProps {
    players: Player[];
    tournaments: Tournament[];
    matches: Match[];
    editingMatch: Match | null;
    onLogMatch: (match: Omit<Match, 'id'>) => void;
    onUpdateMatch: (match: Match) => void;
    onResetEditingMatch: () => void;
}

const emptyPerformance = (players: Player[]): Omit<Performance, 'matchId'> => ({
    playerId: players.length > 0 ? players[0].id : 0,
    dnbBat: false,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    out: 'no',
    dismissalType: 'bowled',
    bowlerName: '',
    fielderName: '',
    dnbBowl: false,
    overs: '',
    runsCon: 0,
    wkts: 0,
    hatTrick: false,
    catches: 0,
    stumpings: 0,
    runOuts: 0,
});

export const LogMatchTab: React.FC<LogMatchTabProps> = ({ players, tournaments, editingMatch, onLogMatch, onUpdateMatch, onResetEditingMatch }) => {
    const [matchData, setMatchData] = useState({ date: '', format: 'T20', tournamentId: '', motmPlayerId: '' });
    const [performances, setPerformances] = useState<Omit<Performance, 'matchId'>[]>([]);

    useEffect(() => {
        if (editingMatch) {
            setMatchData({
                date: editingMatch.date,
                format: editingMatch.format,
                tournamentId: String(editingMatch.tournamentId || ''),
                motmPlayerId: String(editingMatch.motmPlayerId || ''),
            });
            setPerformances(editingMatch.performances);
        } else {
            resetForm();
        }
    }, [editingMatch, players]);

    const resetForm = () => {
        setMatchData({ date: new Date().toISOString().split('T')[0], format: 'T20', tournamentId: '', motmPlayerId: '' });
        setPerformances(players.length > 0 ? [emptyPerformance(players)] : []);
        onResetEditingMatch();
    };

    const handleMatchDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setMatchData({ ...matchData, [e.target.name]: e.target.value });
    };

    const handlePerformanceChange = (index: number, field: keyof Performance, value: any) => {
        const newPerformances = [...performances];
        (newPerformances[index] as any)[field] = value;
        setPerformances(newPerformances);
    };

    const addPerformanceRow = () => {
        if (players.length > 0) {
            setPerformances([...performances, emptyPerformance(players)]);
        } else {
            alert("Please add a player first on the Home tab.");
        }
    };
    
    const removePerformanceRow = (index: number) => {
        setPerformances(performances.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalMatchData = {
            ...matchData,
            tournamentId: matchData.tournamentId ? parseInt(matchData.tournamentId) : null,
            motmPlayerId: matchData.motmPlayerId ? parseInt(matchData.motmPlayerId) : null,
            performances: performances.map(p => ({
                ...p,
                // Fix: Add matchId to satisfy Performance type. It will be overwritten for new matches.
                matchId: editingMatch ? editingMatch.id : 0,
                runs: Number(p.runs),
                balls: Number(p.balls),
                fours: Number(p.fours),
                sixes: Number(p.sixes),
                runsCon: Number(p.runsCon),
                wkts: Number(p.wkts),
                catches: Number(p.catches),
                stumpings: Number(p.stumpings),
                runOuts: Number(p.runOuts),
            }))
        };

        if (editingMatch) {
            onUpdateMatch({ ...editingMatch, ...finalMatchData });
        } else {
            onLogMatch(finalMatchData);
        }
        resetForm();
    };

    return (
        <Card title={editingMatch ? `Editing Match from ${editingMatch.date}` : "Log a New Match"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="date" name="date" value={matchData.date} onChange={handleMatchDataChange} required className="input-field" />
                    <select name="format" value={matchData.format} onChange={handleMatchDataChange} className="input-field">
                        <option value="T20">T20</option>
                        <option value="ODI">ODI</option>
                        <option value="Test">Test</option>
                        <option value="10 Overs">10 Overs</option>
                        <option value="5 Overs">5 Overs</option>
                        <option value="Other">Other</option>
                    </select>
                    <select name="tournamentId" value={matchData.tournamentId} onChange={handleMatchDataChange} className="input-field">
                        <option value="">No Tournament</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select name="motmPlayerId" value={matchData.motmPlayerId} onChange={handleMatchDataChange} className="input-field">
                        <option value="">Man of the Match</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <h3 className="text-xl font-semibold border-t pt-4 dark:border-dark-border">Player Performances</h3>

                <div className="space-y-4">
                    {performances.map((perf, index) => (
                        <div key={index} className="p-4 border rounded-md dark:border-dark-border space-y-4 bg-gray-50 dark:bg-dark-border/20">
                            <div className="flex justify-between items-center">
                                <select value={perf.playerId} onChange={(e) => handlePerformanceChange(index, 'playerId', parseInt(e.target.value))} className="input-field w-1/3">
                                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button type="button" onClick={() => removePerformanceRow(index)} className="btn-sm btn-danger">Remove</button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Batting */}
                                <div className="space-y-2">
                                    <h4 className="font-bold text-primary">Batting</h4>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={perf.dnbBat} onChange={e => handlePerformanceChange(index, 'dnbBat', e.target.checked)} /> Did Not Bat</label>
                                    {!perf.dnbBat && <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" placeholder="Runs" value={perf.runs} onChange={e => handlePerformanceChange(index, 'runs', e.target.value)} className="input-field" />
                                            <input type="number" placeholder="Balls" value={perf.balls} onChange={e => handlePerformanceChange(index, 'balls', e.target.value)} className="input-field" />
                                            <input type="number" placeholder="4s" value={perf.fours} onChange={e => handlePerformanceChange(index, 'fours', e.target.value)} className="input-field" />
                                            <input type="number" placeholder="6s" value={perf.sixes} onChange={e => handlePerformanceChange(index, 'sixes', e.target.value)} className="input-field" />
                                        </div>
                                        <select value={perf.out} onChange={e => handlePerformanceChange(index, 'out', e.target.value)} className="input-field">
                                            <option value="no">Not Out</option><option value="yes">Out</option>
                                        </select>
                                        {perf.out === 'yes' && <div className="space-y-2 pt-2 border-t dark:border-dark-border">
                                           <select value={perf.dismissalType} onChange={e => handlePerformanceChange(index, 'dismissalType', e.target.value)} className="input-field">
                                                <option value="bowled">Bowled</option><option value="caught">Caught</option><option value="lbw">LBW</option><option value="run out">Run Out</option><option value="stumped">Stumped</option><option value="hit wicket">Hit Wicket</option><option value="other">Other</option>
                                           </select>
                                            <input type="text" placeholder="Bowler Name" value={perf.bowlerName} onChange={e => handlePerformanceChange(index, 'bowlerName', e.target.value)} className="input-field" />
                                            <input type="text" placeholder="Fielder Name" value={perf.fielderName} onChange={e => handlePerformanceChange(index, 'fielderName', e.target.value)} className="input-field" />
                                        </div>}
                                    </>}
                                </div>
                                {/* Bowling */}
                                <div className="space-y-2">
                                    <h4 className="font-bold text-primary">Bowling</h4>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={perf.dnbBowl} onChange={e => handlePerformanceChange(index, 'dnbBowl', e.target.checked)} /> Did Not Bowl</label>
                                    {!perf.dnbBowl && <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Overs (e.g. 4.0)" value={perf.overs} onChange={e => handlePerformanceChange(index, 'overs', e.target.value)} className="input-field" />
                                            <input type="number" placeholder="Runs Conceded" value={perf.runsCon} onChange={e => handlePerformanceChange(index, 'runsCon', e.target.value)} className="input-field" />
                                            <input type="number" placeholder="Wickets" value={perf.wkts} onChange={e => handlePerformanceChange(index, 'wkts', e.target.value)} className="input-field" />
                                        </div>
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={perf.hatTrick} onChange={e => handlePerformanceChange(index, 'hatTrick', e.target.checked)} /> Hat-trick</label>
                                    </>}
                                </div>
                                {/* Fielding */}
                                <div className="space-y-2">
                                    <h4 className="font-bold text-primary">Fielding</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="number" placeholder="Catches" value={perf.catches} onChange={e => handlePerformanceChange(index, 'catches', e.target.value)} className="input-field" />
                                        <input type="number" placeholder="Stumpings" value={perf.stumpings} onChange={e => handlePerformanceChange(index, 'stumpings', e.target.value)} className="input-field" />
                                        <input type="number" placeholder="Run Outs" value={perf.runOuts} onChange={e => handlePerformanceChange(index, 'runOuts', e.target.value)} className="input-field" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-dark-border">
                    <button type="button" onClick={addPerformanceRow} className="btn btn-secondary">Add Player Performance</button>
                    <div className="flex space-x-2">
                       {editingMatch && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
                        <button type="submit" className="btn btn-success">{editingMatch ? 'Update Match' : 'Save Match'}</button>
                    </div>
                </div>
            </form>
        </Card>
    );
};

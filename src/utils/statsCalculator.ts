import type { Player, Match, Performance, Tournament, CalculatedStats } from '../types';
import { parseOversToBalls, ballsToOvers } from './helpers';

export const getPlayerStats = (
    playerId: number,
    allMatches: Match[],
    allTournaments: Tournament[],
    filters: { format?: string; year?: string; tournament?: string }
): CalculatedStats => {
    
    let performances: (Performance & { date: string, format: string, motmPlayerId: number | null, tournamentId?: number | null })[] = allMatches.flatMap(match =>
        match.performances
            .filter(p => p.playerId === playerId)
            .map(p => ({ ...p, date: match.date, format: match.format, motmPlayerId: match.motmPlayerId, tournamentId: match.tournamentId }))
    );

    if (filters.format) performances = performances.filter(p => p.format === filters.format);
    if (filters.year) performances = performances.filter(p => p.date && new Date(p.date).getFullYear() == parseInt(filters.year));
    if (filters.tournament) {
        const tournament = allTournaments.find(t => t.name === filters.tournament);
        if (tournament) {
            performances = performances.filter(p => p.tournamentId === tournament.id);
        }
    }
    
    performances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const stats: CalculatedStats = {
        matches: 0, inningsBat: 0, notOuts: 0, runs: 0, highestScore: 0, ballsFaced: 0, 
        twentyFives: 0, fifties: 0, hundreds: 0, fours: 0, sixes: 0, inningsBowl: 0, 
        ballsBowled: 0, runsConceded: 0, wickets: 0, bestBBIWickets: 0, bestBBIRuns: Infinity,
        threeWicketHauls: 0, fiveWicketHauls: 0, hatTricks: 0, catches: 0, stumpings: 0, 
        runOuts: 0, motm: 0, performances: [], last5BattingScores: [], last5BowlingFigures: [],
        dismissalTypes: {}, dismissedByBowlers: {}, caughtByFielders: {}, ducks: 0,
        battingAvg: '0.00', battingSR: '0.00', overs: '0.0', bowlingAvg: '–', economy: '0.00', 
        bowlingSR: '–', bbi: '-'
    };

    const matchIds = new Set(performances.map(p => p.matchId));
    stats.matches = matchIds.size;

    performances.forEach(p => {
        stats.performances.push(p);
        
        if (!p.dnbBat) {
            stats.inningsBat++;
            if (p.out === 'no') stats.notOuts++;
            const runs = p.runs || 0;
            stats.runs += runs;
            stats.ballsFaced += p.balls || 0;
            stats.fours += p.fours || 0;
            stats.sixes += p.sixes || 0;
            if (runs > stats.highestScore) stats.highestScore = runs;
            if (runs >= 100) stats.hundreds++;
            else if (runs >= 50) stats.fifties++;
            else if (runs >= 25) stats.twentyFives++;
            stats.last5BattingScores.unshift(runs);
            if (p.out === 'yes') {
                const dismissalType = p.dismissalType || 'other';
                stats.dismissalTypes[dismissalType] = (stats.dismissalTypes[dismissalType] || 0) + 1;
                if (p.bowlerName) stats.dismissedByBowlers[p.bowlerName] = (stats.dismissedByBowlers[p.bowlerName] || 0) + 1;
                if (p.dismissalType === 'caught' && p.fielderName) stats.caughtByFielders[p.fielderName] = (stats.caughtByFielders[p.fielderName] || 0) + 1;
                if (runs === 0) stats.ducks++;
            }
        } else {
            stats.last5BattingScores.unshift(null);
        }

        if (!p.dnbBowl && p.overs) {
            stats.inningsBowl++;
            const balls = parseOversToBalls(p.overs);
            stats.ballsBowled += balls;
            stats.runsConceded += p.runsCon || 0;
            const wkts = p.wkts || 0;
            stats.wickets += wkts;
            if (wkts > stats.bestBBIWickets || (wkts === stats.bestBBIWickets && (p.runsCon || 0) < stats.bestBBIRuns)) {
                stats.bestBBIWickets = wkts;
                stats.bestBBIRuns = p.runsCon || 0;
            }
            if (wkts >= 5) stats.fiveWicketHauls++;
            else if (wkts >= 3) stats.threeWicketHauls++;
            if (p.hatTrick) stats.hatTricks++;
            stats.last5BowlingFigures.unshift(p.runsCon != null ? `${wkts}/${p.runsCon}` : `${wkts}/-`);
        } else {
            stats.last5BowlingFigures.unshift(null);
        }

        stats.catches += p.catches || 0;
        stats.stumpings += p.stumpings || 0;
        stats.runOuts += p.runOuts || 0;
        if (p.motmPlayerId === playerId) stats.motm++;
    });

    const timesOut = stats.inningsBat - stats.notOuts;
    stats.battingAvg = timesOut > 0 ? (stats.runs / timesOut).toFixed(2) : '∞';
    stats.battingSR = stats.ballsFaced > 0 ? (stats.runs / stats.ballsFaced * 100).toFixed(2) : '0.00';
    stats.overs = ballsToOvers(stats.ballsBowled);
    stats.bowlingAvg = stats.wickets > 0 ? (stats.runsConceded / stats.wickets).toFixed(2) : '–';
    stats.economy = stats.ballsBowled > 0 ? (stats.runsConceded / (stats.ballsBowled / 6)).toFixed(2) : '0.00';
    stats.bowlingSR = stats.wickets > 0 ? (stats.ballsBowled / stats.wickets).toFixed(2) : '–';
    stats.bbi = stats.bestBBIRuns === Infinity ? '-' : `${stats.bestBBIWickets}/${stats.bestBBIRuns}`;
    stats.last5BattingScores = stats.last5BattingScores.slice(0, 5);
    stats.last5BowlingFigures = stats.last5BowlingFigures.slice(0, 5);

    return stats;
};

export const calculateCareerProgression = (performances: Performance[], allMatches: Match[]) => {
    const progression: { match: number, battingAvg: string | number, bowlingAvg: string | number }[] = [];
    let cumulativeStats = { inningsBat: 0, notOuts: 0, runs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0 };

    const matchesInOrder = [...new Map(performances.map(p => [p.matchId, allMatches.find(m => m.id === p.matchId)]))
        .values()].filter((m): m is Match => !!m).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    matchesInOrder.forEach((match, index) => {
        const matchPerformances = performances.filter(p => p.matchId === match.id);
        
        matchPerformances.forEach(p => {
            if (!p.dnbBat) {
                cumulativeStats.inningsBat++;
                cumulativeStats.runs += p.runs || 0;
                if (p.out === 'no') cumulativeStats.notOuts++;
            }
            if (!p.dnbBowl && p.overs) {
                cumulativeStats.ballsBowled += parseOversToBalls(p.overs);
                cumulativeStats.runsConceded += p.runsCon || 0;
                cumulativeStats.wickets += p.wkts || 0;
            }
        });
        
        const timesOut = cumulativeStats.inningsBat - cumulativeStats.notOuts;
        progression.push({
            match: index + 1,
            battingAvg: timesOut > 0 ? parseFloat((cumulativeStats.runs / timesOut).toFixed(2)) : '∞',
            bowlingAvg: cumulativeStats.wickets > 0 ? parseFloat((cumulativeStats.runsConceded / cumulativeStats.wickets).toFixed(2)) : '–'
        });
    });
    return progression;
}

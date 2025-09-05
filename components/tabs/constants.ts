
import type { Achievement } from './types';
import { parseOversToBalls } from './utils/helpers';


export const ACHIEVEMENTS: Achievement[] = [
    { id: 'centurion', name: 'Centurion', description: 'Score a century (100+ runs)', condition: (player) => player.stats.hundreds > 0 },
    { id: 'half-centurion', name: 'Half-Centurion', description: 'Score a half-century (50+ runs)', condition: (player) => player.stats.fifties > 0 },
    { id: 'the-wall', name: 'The Wall', description: '3 consecutive scores of 25+ runs', condition: (player) => {
        const last5 = player.stats.last5BattingScores.slice(0, 3);
        return last5.length === 3 && last5.every(score => score !== null && score >= 25);
    }},
    { id: 'finisher', name: 'Finisher', description: 'Score 20+ runs with SR 200+', condition: (player) => {
        return player.stats.performances.some(p => p.runs && p.runs >= 20 && p.balls && p.balls > 0 && (p.runs / p.balls * 100) >= 200);
    }},
    { id: 'hat-trick', name: 'Hat-trick Hero', description: 'Take a hat-trick (3 wickets in 3 balls)', condition: (player) => {
        return player.stats.performances.some(p => p.hatTrick === true);
    }},
    { id: 'five-fer', name: 'Five-fer', description: 'Take 5 wickets in an innings', condition: (player) => player.stats.fiveWicketHauls > 0 },
    { id: 'three-fer', name: 'Three-fer', description: 'Take 3 wickets in an innings', condition: (player) => player.stats.threeWicketHauls > 0 },
    { id: 'all-rounder', name: 'All-Rounder', description: 'Score 25+ runs and take 2+ wickets in same match', 
    condition: (player) => {
        const matchPerformances: { [key: number]: { runs: number, wickets: number } } = {};
        player.stats.performances.forEach(p => {
            if (!matchPerformances[p.matchId]) matchPerformances[p.matchId] = { runs: 0, wickets: 0 };
            matchPerformances[p.matchId].runs += p.runs || 0;
            matchPerformances[p.matchId].wickets += p.wkts || 0;
        });
        return Object.values(matchPerformances).some(m => m.runs >= 25 && m.wickets >= 2);
    }},
    { id: 'miser', name: 'Miser', description: 'Economy rate under 3 in an innings (min 2 overs)', condition: (player) => {
        return player.stats.performances.some(p => {
            if (!p.overs || !p.runsCon) return false;
            const balls = parseOversToBalls(p.overs);
            return balls >= 12 && (p.runsCon / (balls / 6)) < 3;
        });
    }},
    { id: 'safe-hands', name: 'Safe Hands', description: 'Take 3 catches in a match', condition: (player) => {
        const matchCatches: { [key: number]: number } = {};
        player.stats.performances.forEach(p => {
            if (!matchCatches[p.matchId]) matchCatches[p.matchId] = 0;
            matchCatches[p.matchId] += p.catches || 0;
        });
        return Object.values(matchCatches).some(c => c >= 3);
    }},
    { id: 'duck', name: 'Duck', description: 'Get out for 0 runs', condition: (player) => player.stats.ducks > 0 }
];

export const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'log-match', label: 'Log Match' },
  { id: 'h2h-stats', label: 'H2H Stats' },
  { id: 'match-history', label: 'Match History' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'settings', label: 'Settings' },
];

export const DEFAULT_AVATAR = "https://www.gstatic.com/images/branding/product/1x/avatar_circle_grey_512dp.png";

export interface Player {
  id: number;
  name: string;
  dob?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  avatarUrl?: string | null;
  achievements: string[];
}

export interface Performance {
  playerId: number;
  matchId: number;
  dnbBat?: boolean;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  out?: 'yes' | 'no';
  dismissalType?: 'bowled' | 'caught' | 'lbw' | 'run out' | 'stumped' | 'hit wicket' | 'other';
  bowlerName?: string;
  fielderName?: string;
  dnbBowl?: boolean;
  overs?: string;
  runsCon?: number;
  wkts?: number;
  hatTrick?: boolean;
  catches?: number;
  stumpings?: number;
  runOuts?: number;
}

export interface Match {
  id: number;
  date: string;
  format: string;
  tournamentId?: number | null;
  motmPlayerId?: number | null;
  performances: Performance[];
}

export interface Team {
    id: number;
    players: number[];
}

export interface Tournament {
  id: number;
  name: string;
  type: 'solo' | 'team';
  startDate?: string;
  endDate?: string;
  participants?: number[];
  teams?: Team[];
}

export type TrashItemType = 'player' | 'match' | 'tournament';

export interface TrashItem {
    type: TrashItemType;
    data: Player | Match | Tournament;
    deletedOn: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: (player: Player & { stats: CalculatedStats }) => boolean;
}

export interface CalculatedStats {
    matches: number;
    inningsBat: number;
    notOuts: number;
    runs: number;
    highestScore: number;
    ballsFaced: number;
    twentyFives: number;
    fifties: number;
    hundreds: number;
    fours: number;
    sixes: number;
    inningsBowl: number;
    ballsBowled: number;
    runsConceded: number;
    wickets: number;
    bestBBIWickets: number;
    bestBBIRuns: number;
    threeWicketHauls: number;
    fiveWicketHauls: number;
    hatTricks: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    motm: number;
    performances: Performance[];
    last5BattingScores: (number | null)[];
    last5BowlingFigures: (string | null)[];
    dismissalTypes: { [key: string]: number };
    dismissedByBowlers: { [key: string]: number };
    caughtByFielders: { [key: string]: number };
    ducks: number;
    battingAvg: string | number;
    battingSR: string | number;
    overs: string;
    bowlingAvg: string | number;
    economy: string | number;
    bowlingSR: string | number;
    bbi: string;
}

export type Competition = string; // vem dinamicamente da API (ex: "Premier League", "Brasileirão")

export type MatchStatus = "upcoming" | "live" | "finished";

export interface Team {
  name: string;
  short: string;
  color: string; // accent hex for the crest chip (fallback quando não há escudo real)
  crestUrl?: string; // URL do escudo real, quando disponível (jogos reais via API)
}

export interface OneXTwoOdds {
  home: number;
  draw: number;
  away: number;
}

export interface OverUnderOdds {
  line: number; // e.g. 2.5
  over: number;
  under: number;
}

export interface BttsOdds {
  yes: number;
  no: number;
}

export interface Match {
  id: string;
  competition: Competition;
  home: Team;
  away: Team;
  kickoff: string; // ISO string
  status: MatchStatus;
  minute?: number; // live minute
  scoreHome?: number;
  scoreAway?: number;
  odds1x2: OneXTwoOdds;
  overUnder: OverUnderOdds;
  btts: BttsOdds;
  oddsTrend?: "up" | "down" | null; // for the "sua odd subiu" signal
}

export type MarketKey = "1x2-home" | "1x2-draw" | "1x2-away" | "over" | "under" | "btts-yes" | "btts-no";

export interface SelectionInput {
  matchId: string;
  market: MarketKey;
  label: string; // human readable, e.g. "Flamengo (Casa)"
  odd: number;
  matchLabel: string; // "Flamengo x Palmeiras"
}

export interface BetSlipItem extends SelectionInput {
  id: string;
}

export type BetResult = "won" | "lost" | "pending";

export interface BetHistoryEntry {
  id: string;
  date: string;
  selections: SelectionInput[];
  stake: number;
  totalOdd: number;
  potentialReturn: number;
  result: BetResult;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarColor: string;
  biggestWin: number;
  streak: number;
}

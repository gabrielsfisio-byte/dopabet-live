import type { LeaderboardUser, Match } from "./types";

const teams = {
  fla: { name: "Flamengo", short: "FLA", color: "#e11d2e" },
  pal: { name: "Palmeiras", short: "PAL", color: "#0e9748" },
  cor: { name: "Corinthians", short: "COR", color: "#0a0a0a" },
  sao: { name: "São Paulo", short: "SAO", color: "#c1121f" },
  gre: { name: "Grêmio", short: "GRE", color: "#0091d1" },
  int: { name: "Internacional", short: "INT", color: "#c1121f" },
  bot: { name: "Botafogo", short: "BOT", color: "#0a0a0a" },
  flu: { name: "Fluminense", short: "FLU", color: "#7a0026" },
  rma: { name: "Real Madrid", short: "RMA", color: "#f5f5f5" },
  mci: { name: "Man City", short: "MCI", color: "#6cabdd" },
  bay: { name: "Bayern", short: "BAY", color: "#dc052d" },
  psg: { name: "PSG", short: "PSG", color: "#004170" },
} as const;

export const MOCK_MATCHES_RAW: Omit<Match, "btts">[] = [
  {
    id: "m1",
    competition: "Brasileirão",
    home: teams.fla,
    away: teams.pal,
    kickoff: new Date().toISOString(),
    status: "live",
    minute: 63,
    scoreHome: 2,
    scoreAway: 1,
    odds1x2: { home: 1.85, draw: 3.4, away: 4.2 },
    overUnder: { line: 2.5, over: 1.95, under: 1.85 },
    oddsTrend: "up",
  },
  {
    id: "m2",
    competition: "Brasileirão",
    home: teams.cor,
    away: teams.sao,
    kickoff: new Date().toISOString(),
    status: "live",
    minute: 27,
    scoreHome: 0,
    scoreAway: 0,
    odds1x2: { home: 2.6, draw: 3.1, away: 2.9 },
    overUnder: { line: 2.5, over: 2.1, under: 1.72 },
    oddsTrend: "down",
  },
  {
    id: "m3",
    competition: "Champions League",
    home: teams.rma,
    away: teams.mci,
    kickoff: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    status: "upcoming",
    odds1x2: { home: 2.1, draw: 3.3, away: 3.2 },
    overUnder: { line: 2.5, over: 1.8, under: 2.0 },
  },
  {
    id: "m4",
    competition: "Brasileirão",
    home: teams.gre,
    away: teams.int,
    kickoff: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    status: "upcoming",
    odds1x2: { home: 2.3, draw: 3.0, away: 3.1 },
    overUnder: { line: 2.5, over: 1.9, under: 1.9 },
  },
  {
    id: "m5",
    competition: "Champions League",
    home: teams.bay,
    away: teams.psg,
    kickoff: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    status: "upcoming",
    odds1x2: { home: 1.95, draw: 3.5, away: 3.9 },
    overUnder: { line: 2.5, over: 1.7, under: 2.15 },
  },
  {
    id: "m6",
    competition: "Brasileirão",
    home: teams.bot,
    away: teams.flu,
    kickoff: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
    status: "finished",
    scoreHome: 1,
    scoreAway: 1,
    odds1x2: { home: 2.0, draw: 3.2, away: 3.6 },
    overUnder: { line: 2.5, over: 1.9, under: 1.9 },
  },
];

export const MOCK_MATCHES: Match[] = MOCK_MATCHES_RAW.map((m) => ({
  ...m,
  btts: { yes: 1.75, no: 2.0 },
}));

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: "u1", name: "Rafa_Certeiro", avatarColor: "#39ff88", biggestWin: 4820, streak: 7 },
  { id: "u2", name: "OddsMaster22", avatarColor: "#ff3b5c", biggestWin: 3110, streak: 4 },
  { id: "u3", name: "GolNoUltimo", avatarColor: "#39d0ff", biggestWin: 2650, streak: 5 },
  { id: "u4", name: "BeneVerde", avatarColor: "#ffd93b", biggestWin: 1980, streak: 3 },
  { id: "u5", name: "TorcidaFiel", avatarColor: "#b06bff", biggestWin: 1540, streak: 2 },
];

export const STARTING_BALANCE = 1000; // fictional credits, non-redeemable
export const MAX_BALANCE = 50000; // hard ceiling — no illusion of infinite top-ups

import type { Match, Team } from "./types";

const VIRTUAL_TEAMS: Team[] = [
  { name: "Fênix FC", short: "FEN", color: "#e11d2e" },
  { name: "Trovão United", short: "TRO", color: "#0091d1" },
  { name: "Águia Real", short: "AGR", color: "#f5c518" },
  { name: "Titãs FC", short: "TIT", color: "#0a0a0a" },
  { name: "Furacão AC", short: "FUR", color: "#6cabdd" },
  { name: "Leões do Norte", short: "LEO", color: "#c1121f" },
  { name: "Estrela Azul", short: "EAZ", color: "#004170" },
  { name: "Cobras FC", short: "COB", color: "#0e9748" },
  { name: "Tempestade EC", short: "TEM", color: "#7a0026" },
  { name: "Falcões United", short: "FAL", color: "#dc052d" },
  { name: "Panteras FC", short: "PAN", color: "#3a0ca3" },
  { name: "Vulcão AC", short: "VUL", color: "#ff6a00" },
];

function pickTwo(): [Team, Team] {
  const shuffled = [...VIRTUAL_TEAMS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export interface GoalEvent {
  minute: number;
  side: "home" | "away";
}

export interface VirtualRound {
  match: Match;
  events: GoalEvent[];
  finalScoreHome: number;
  finalScoreAway: number;
}

/** Gera uma rodada completa de futebol virtual: times, odds sintéticas e o roteiro de gols (0-90). */
export function generateVirtualRound(roundId: string): VirtualRound {
  const [home, away] = pickTwo();

  // Força relativa aleatória entre os dois times, usada tanto pras odds quanto pro roteiro de gols.
  const homeStrength = 0.8 + Math.random() * 0.9; // 0.8 - 1.7
  const awayStrength = 0.8 + Math.random() * 0.9;

  const homeGoals = poissonSample(homeStrength);
  const awayGoals = poissonSample(awayStrength);

  const events: GoalEvent[] = [];
  for (let i = 0; i < homeGoals; i++) events.push({ minute: 1 + Math.floor(Math.random() * 90), side: "home" });
  for (let i = 0; i < awayGoals; i++) events.push({ minute: 1 + Math.floor(Math.random() * 90), side: "away" });
  events.sort((a, b) => a.minute - b.minute);

  const totalStrength = homeStrength + awayStrength;
  const homeProb = homeStrength / totalStrength;
  const awayProb = awayStrength / totalStrength;
  const drawProb = Math.max(0.12, 1 - homeProb - awayProb + 0.12);

  const odds1x2 = {
    home: round2(Math.max(1.15, 1 / (homeProb * 0.92))),
    draw: round2(Math.max(2.4, 1 / drawProb)),
    away: round2(Math.max(1.15, 1 / (awayProb * 0.92))),
  };

  const expectedTotalGoals = homeStrength + awayStrength;
  const overProb = Math.min(0.85, Math.max(0.25, expectedTotalGoals / 4));
  const overUnder = {
    line: 2.5,
    over: round2(Math.max(1.3, 1 / overProb)),
    under: round2(Math.max(1.3, 1 / (1 - overProb))),
  };

  const bttsProb = Math.min(0.8, Math.max(0.25, (homeStrength * awayStrength) / 2));
  const btts = {
    yes: round2(Math.max(1.3, 1 / bttsProb)),
    no: round2(Math.max(1.3, 1 / (1 - bttsProb))),
  };

  const match: Match = {
    id: roundId,
    competition: "Futebol Virtual",
    home,
    away,
    kickoff: new Date().toISOString(),
    status: "upcoming",
    scoreHome: 0,
    scoreAway: 0,
    odds1x2,
    overUnder,
    btts,
    oddsTrend: null,
  };

  return { match, events, finalScoreHome: homeGoals, finalScoreAway: awayGoals };
}

/** Amostra simplificada estilo Poisson para gerar um número de gols plausível a partir de uma força de ataque. */
function poissonSample(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

import type { Match, MatchStatus, Team } from "./types";

const API_BASE = "https://api.football-data.org/v4";

// Competições cobertas pelo plano gratuito e permanente da football-data.org.
const COMPETITION_CODES = ["WC", "CL", "PL", "PD", "BL1", "SA", "FL1", "BSA", "EC"] as const;

const COMPETITION_LABELS: Record<string, string> = {
  WC: "Copa do Mundo",
  PL: "Premier League",
  PD: "La Liga",
  BL1: "Bundesliga",
  SA: "Serie A",
  FL1: "Ligue 1",
  CL: "Champions League",
  BSA: "Brasileirão",
  EC: "Eurocopa",
};

interface RawTeam {
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

interface RawMatch {
  id: number;
  utcDate: string;
  status: string;
  minute?: number;
  homeTeam: RawTeam | null;
  awayTeam: RawTeam | null;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
  competition: { code: string; name: string };
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministic pseudo-random number in [0,1) seeded by a string — keeps odds stable per match. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function teamColor(name: string) {
  const palette = ["#e11d2e", "#0e9748", "#0a0a0a", "#c1121f", "#0091d1", "#7a0026", "#004170", "#6cabdd", "#dc052d", "#f5c518"];
  return palette[hashSeed(name) % palette.length];
}

function toTeam(raw: RawTeam | null | undefined): Team {
  if (!raw || !raw.name) {
    return { name: "A definir", short: "TBD", color: "#4a4a4a" };
  }
  const short = raw.tla || raw.shortName?.slice(0, 3).toUpperCase() || raw.name.slice(0, 3).toUpperCase();
  return { name: raw.shortName || raw.name, short, color: teamColor(raw.name), crestUrl: raw.crest };
}

function mapStatus(apiStatus: string): MatchStatus {
  if (apiStatus === "IN_PLAY" || apiStatus === "PAUSED") return "live";
  if (apiStatus === "FINISHED") return "finished";
  return "upcoming";
}

/** Generates plausible, self-consistent synthetic odds seeded by the fixture id (no real bookmaker data used). */
function generateSyntheticOdds(matchId: string) {
  const seed = hashSeed(matchId);
  const homeStrength = 0.3 + seededRandom(seed) * 0.5; // 0.3 - 0.8
  const drawFactor = 0.18 + seededRandom(seed + 1) * 0.1;
  const awayStrength = Math.max(0.15, 1 - homeStrength - drawFactor);

  const home = round2(Math.max(1.1, 1 / homeStrength));
  const draw = round2(Math.max(2.2, 1 / drawFactor));
  const away = round2(Math.max(1.1, 1 / awayStrength));

  const overProb = 0.42 + seededRandom(seed + 2) * 0.25;
  const over = round2(Math.max(1.4, 1 / overProb));
  const under = round2(Math.max(1.4, 1 / (1 - overProb)));

  const bttsProb = 0.4 + seededRandom(seed + 3) * 0.3;
  const bttsYes = round2(Math.max(1.4, 1 / bttsProb));
  const bttsNo = round2(Math.max(1.4, 1 / (1 - bttsProb)));

  return {
    odds1x2: { home, draw, away },
    overUnder: { line: 2.5, over, under },
    btts: { yes: bttsYes, no: bttsNo },
  };
}

function mapMatch(raw: RawMatch): Match {
  const id = String(raw.id);
  const odds = generateSyntheticOdds(id);
  return {
    id,
    competition: COMPETITION_LABELS[raw.competition.code] ?? raw.competition.name,
    home: toTeam(raw.homeTeam),
    away: toTeam(raw.awayTeam),
    kickoff: raw.utcDate,
    status: mapStatus(raw.status),
    minute: raw.minute,
    scoreHome: raw.score.fullTime.home ?? undefined,
    scoreAway: raw.score.fullTime.away ?? undefined,
    ...odds,
    oddsTrend: null,
  };
}

/**
 * Busca partidas reais dos principais campeonatos via football-data.org (plano gratuito).
 * Se a chave de API não estiver configurada ou a requisição falhar, retorna null — quem
 * chamar esta função deve ter um fallback de dados fictícios para não quebrar a página.
 */
export async function fetchRealMatches(): Promise<Match[] | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return null;

  const dateFrom = new Date().toISOString().slice(0, 10);
  const dateTo = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    const results = await Promise.all(
      COMPETITION_CODES.map(async (code) => {
        const url = `${API_BASE}/competitions/${code}/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const res = await fetch(url, {
          headers: { "X-Auth-Token": apiKey },
          next: { revalidate: 60 }, // cache de 60s no servidor para não estourar o limite de requisições
        });
        if (!res.ok) {
          console.error(`football-data.org: ${code} respondeu ${res.status}`);
          return [];
        }
        const data = await res.json();
        return (data.matches ?? []) as RawMatch[];
      })
    );

    const allMatches = results.flat().map(mapMatch).filter((m) => m.home.short !== "TBD" && m.away.short !== "TBD");

    // Prioriza jogos ao vivo, depois os mais próximos, limitando a quantidade exibida.
    return allMatches
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
      .slice(0, 40);
  } catch (err) {
    console.error("Erro ao buscar partidas reais:", err);
    return null;
  }
}

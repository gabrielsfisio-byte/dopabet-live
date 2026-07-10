import { Trophy } from "lucide-react";
import { HeroBanner } from "@/components/hero-banner";
import { MatchesBoard } from "@/components/betting/matches-board";
import { MOCK_MATCHES, MOCK_LEADERBOARD } from "@/lib/mock-data";
import { fetchRealMatches } from "@/lib/football-data";
import { formatBRL } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  const realMatches = await fetchRealMatches();
  const matches = realMatches && realMatches.length > 0 ? realMatches : MOCK_MATCHES;
  const usingRealData = !!(realMatches && realMatches.length > 0);
  const topWinner = MOCK_LEADERBOARD[0];

  return (
    <div>
      <HeroBanner />

      {!usingRealData && (
        <div className="rounded-lg border border-live/30 bg-live/10 text-live text-xs px-3 py-2 mb-6">
          Mostrando jogos de demonstração — configure <code>FOOTBALL_DATA_API_KEY</code> para exibir jogos reais dos campeonatos atuais.
        </div>
      )}

      <MatchesBoard initialMatches={matches} />

      <div className="rounded-xl border border-border bg-surface p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center size-10 rounded-full font-bold text-background"
            style={{ backgroundColor: topWinner.avatarColor }}
          >
            <Trophy className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted">Maior vitória fictícia do dia</p>
            <p className="font-semibold">{topWinner.name}</p>
          </div>
        </div>
        <span className="scoreboard-number text-xl font-bold text-up">{formatBRL(topWinner.biggestWin)}</span>
      </div>
    </div>
  );
}

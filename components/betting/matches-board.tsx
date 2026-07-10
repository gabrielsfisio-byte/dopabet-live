"use client";

import { useEffect } from "react";
import { CalendarClock, Radio } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { MatchCard } from "@/components/betting/match-card";
import { useMatchesStore } from "@/lib/matches-store";
import type { Match } from "@/lib/types";

export function MatchesBoard({ initialMatches }: { initialMatches: Match[] }) {
  const matches = useMatchesStore((s) => s.matches);
  const setInitialMatches = useMatchesStore((s) => s.setInitialMatches);
  const driftOdds = useMatchesStore((s) => s.driftOdds);

  useEffect(() => {
    setInitialMatches(initialMatches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => driftOdds(), 6000);
    return () => clearInterval(interval);
  }, [driftOdds]);

  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches.filter((m) => m.status === "upcoming").slice(0, 12);

  return (
    <>
      <SectionHeader icon={Radio} title="Jogos ao vivo" live />
      {live.length === 0 ? (
        <p className="text-sm text-muted mb-10">Nenhum jogo ao vivo agora — confira os próximos abaixo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {live.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      <SectionHeader icon={CalendarClock} title="Próximos jogos" subtitle="Odds sujeitas a variação (fictícia)" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {upcoming.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </>
  );
}

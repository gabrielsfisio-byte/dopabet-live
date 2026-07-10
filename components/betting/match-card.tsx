"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ChevronDown, Radio } from "lucide-react";
import type { Match, Team } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { OddButton } from "./odd-button";
import { cn } from "@/lib/utils";

function TeamRow({ team, score, isLive }: { team: Team; score?: number; isLive: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {team.crestUrl ? (
          <span className="relative flex items-center justify-center size-6 shrink-0">
            <Image src={team.crestUrl} alt={team.name} fill sizes="24px" className="object-contain" unoptimized />
          </span>
        ) : (
          <span
            className="flex items-center justify-center size-6 rounded-full text-[10px] font-bold shrink-0"
            style={{ backgroundColor: team.color, color: "#0a0a0a" }}
          >
            {team.short.slice(0, 2)}
          </span>
        )}
        <span className="text-sm font-medium truncate">{team.name}</span>
      </div>
      {isLive && <span className="scoreboard-number text-lg font-bold">{score ?? 0}</span>}
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const slip = useAppStore((s) => s.slip);
  const addSelection = useAppStore((s) => s.addSelection);
  const [expanded, setExpanded] = useState(false);

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const selectedKey = slip.find((s) => s.matchId === match.id)?.market;

  const matchLabel = `${match.home.name} x ${match.away.name}`;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted font-medium">{match.competition}</span>
        {isLive ? (
          <span className="flex items-center gap-1.5 text-live font-semibold">
            <span className="live-dot size-1.5 rounded-full bg-live" />
            <Radio className="size-3" />
            {match.minute}&apos;
          </span>
        ) : isFinished ? (
          <span className="text-muted font-medium">Encerrado</span>
        ) : (
          <span className="text-muted font-medium">
            {new Date(match.kickoff).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <TeamRow team={match.home} score={match.scoreHome} isLive={isLive || isFinished} />
        <TeamRow team={match.away} score={match.scoreAway} isLive={isLive || isFinished} />
      </div>

      {!isFinished && (
        <>
          {match.oddsTrend && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 w-fit",
                match.oddsTrend === "up" ? "bg-up/10 text-up" : "bg-down/10 text-down"
              )}
            >
              {match.oddsTrend === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              Sua odd {match.oddsTrend === "up" ? "subiu" : "caiu"}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <OddButton
              label={match.home.short}
              value={match.odds1x2.home}
              active={selectedKey === "1x2-home"}
              onClick={() =>
                addSelection({
                  matchId: match.id,
                  market: "1x2-home",
                  label: `${match.home.name} (Casa)`,
                  odd: match.odds1x2.home,
                  matchLabel,
                })
              }
            />
            <OddButton
              label="Empate"
              value={match.odds1x2.draw}
              active={selectedKey === "1x2-draw"}
              onClick={() =>
                addSelection({
                  matchId: match.id,
                  market: "1x2-draw",
                  label: "Empate",
                  odd: match.odds1x2.draw,
                  matchLabel,
                })
              }
            />
            <OddButton
              label={match.away.short}
              value={match.odds1x2.away}
              active={selectedKey === "1x2-away"}
              onClick={() =>
                addSelection({
                  matchId: match.id,
                  market: "1x2-away",
                  label: `${match.away.name} (Fora)`,
                  odd: match.odds1x2.away,
                  matchLabel,
                })
              }
            />
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted hover:text-accent transition-colors"
          >
            {expanded ? "Menos mercados" : "Mais mercados"}
            <ChevronDown className={cn("size-3 transition-transform", expanded && "rotate-180")} />
          </button>

          {expanded && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">Total de gols (2.5)</p>
              <div className="grid grid-cols-2 gap-2">
                <OddButton
                  label="Mais de 2.5"
                  value={match.overUnder.over}
                  active={selectedKey === "over"}
                  onClick={() =>
                    addSelection({
                      matchId: match.id,
                      market: "over",
                      label: "Mais de 2.5 gols",
                      odd: match.overUnder.over,
                      matchLabel,
                    })
                  }
                />
                <OddButton
                  label="Menos de 2.5"
                  value={match.overUnder.under}
                  active={selectedKey === "under"}
                  onClick={() =>
                    addSelection({
                      matchId: match.id,
                      market: "under",
                      label: "Menos de 2.5 gols",
                      odd: match.overUnder.under,
                      matchLabel,
                    })
                  }
                />
              </div>

              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mt-1">Ambas as equipes marcam</p>
              <div className="grid grid-cols-2 gap-2">
                <OddButton
                  label="Sim"
                  value={match.btts.yes}
                  active={selectedKey === "btts-yes"}
                  onClick={() =>
                    addSelection({
                      matchId: match.id,
                      market: "btts-yes",
                      label: "Ambas marcam: Sim",
                      odd: match.btts.yes,
                      matchLabel,
                    })
                  }
                />
                <OddButton
                  label="Não"
                  value={match.btts.no}
                  active={selectedKey === "btts-no"}
                  onClick={() =>
                    addSelection({
                      matchId: match.id,
                      market: "btts-no",
                      label: "Ambas marcam: Não",
                      odd: match.btts.no,
                      matchLabel,
                    })
                  }
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

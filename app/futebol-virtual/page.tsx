"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Gamepad2 } from "lucide-react";
import { MatchCard } from "@/components/betting/match-card";
import { VirtualScoreboard } from "@/components/virtual/virtual-scoreboard";
import { generateVirtualRound, type GoalEvent, type VirtualRound } from "@/lib/virtual-football";
import { useAppStore } from "@/lib/store";
import type { Match } from "@/lib/types";

const BETTING_SECONDS = 20;
const MINUTES_PER_TICK = 3;
const TICK_MS = 500;

export default function FutebolVirtualPage() {
  const settleAgainstResult = useAppStore((s) => s.settleAgainstResult);

  const [round, setRound] = useState<VirtualRound>(() => generateVirtualRound(`vround-${Date.now()}`));
  const [displayMatch, setDisplayMatch] = useState<Match>(round.match);
  const [phase, setPhase] = useState<"betting" | "playing" | "result">("betting");
  const [secondsLeft, setSecondsLeft] = useState(BETTING_SECONDS);
  const [minute, setMinute] = useState(0);
  const [recentGoal, setRecentGoal] = useState<string | null>(null);

  const roundRef = useRef(round);
  const appliedEventsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    roundRef.current = round;
    setDisplayMatch(round.match);
    appliedEventsRef.current = new Set();
  }, [round]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (phase === "betting") {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setPhase("playing");
            setMinute(0);
            setDisplayMatch((m) => ({ ...m, status: "live", minute: 0 }));
            return BETTING_SECONDS;
          }
          return s - 1;
        });
      } else if (phase === "playing") {
        setMinute((prevMinute) => {
          const nextMinute = Math.min(90, prevMinute + MINUTES_PER_TICK);
          const events = roundRef.current.events;

          let scoreHome = 0;
          let scoreAway = 0;
          let latestGoalLabel: string | null = null;

          events.forEach((ev: GoalEvent, idx: number) => {
            if (ev.minute <= nextMinute) {
              if (ev.side === "home") scoreHome++;
              else scoreAway++;
              if (!appliedEventsRef.current.has(idx) && ev.minute <= nextMinute && ev.minute > prevMinute) {
                appliedEventsRef.current.add(idx);
                const team = ev.side === "home" ? roundRef.current.match.home : roundRef.current.match.away;
                latestGoalLabel = `GOL do ${team.name}! (${ev.minute}')`;
              }
            }
          });

          setDisplayMatch((m) => ({ ...m, minute: nextMinute, scoreHome, scoreAway }));
          if (latestGoalLabel) setRecentGoal(latestGoalLabel);

          if (nextMinute >= 90) {
            const finalMatch: Match = {
              ...roundRef.current.match,
              status: "finished",
              scoreHome: roundRef.current.finalScoreHome,
              scoreAway: roundRef.current.finalScoreAway,
            };
            setDisplayMatch(finalMatch);
            const { anyWin } = settleAgainstResult(roundRef.current.match.id, finalMatch);
            if (anyWin) {
              confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 }, colors: ["#39ff8a", "#39d0ff", "#ffd93b"] });
            }
            setPhase("result");
            setTimeout(() => {
              const newRound = generateVirtualRound(`vround-${Date.now()}`);
              setRound(newRound);
              setPhase("betting");
              setSecondsLeft(BETTING_SECONDS);
              setRecentGoal(null);
            }, 5000);
          }

          return nextMinute;
        });
      }
    }, phase === "playing" ? TICK_MS : 1000);

    return () => clearInterval(interval);
  }, [phase, settleAgainstResult]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Gamepad2 className="size-6 text-accent" />
        <div>
          <h1 className="font-display text-2xl font-bold">Futebol Virtual</h1>
          <p className="text-xs text-muted">Partidas 100% simuladas, times fictícios, rodadas a cada poucos minutos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VirtualScoreboard match={displayMatch} phase={phase} secondsLeft={secondsLeft} minute={minute} recentGoal={recentGoal} />

        <div className={phase !== "betting" ? "opacity-50 pointer-events-none" : ""}>
          <MatchCard match={displayMatch} />
        </div>
      </div>

      <p className="text-[11px] text-muted text-center mt-8">
        Simulação 100% fictícia e automática — os resultados não têm relação com nenhum jogo real.
      </p>
    </div>
  );
}

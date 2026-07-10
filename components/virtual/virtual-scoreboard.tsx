"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Radio, Timer } from "lucide-react";
import type { Match } from "@/lib/types";

export function VirtualScoreboard({
  match,
  phase,
  secondsLeft,
  minute,
  recentGoal,
}: {
  match: Match;
  phase: "betting" | "playing" | "result";
  secondsLeft: number;
  minute: number;
  recentGoal: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">Futebol Virtual</span>
        {phase === "betting" ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-accent">
            <Timer className="size-3.5" />
            Apostas encerram em {secondsLeft}s
          </span>
        ) : phase === "playing" ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-live">
            <span className="live-dot size-1.5 rounded-full bg-live" />
            <Radio className="size-3" />
            {minute}&apos;
          </span>
        ) : (
          <span className="text-xs font-bold text-muted">Encerrado — próxima rodada em breve</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span
            className="flex items-center justify-center size-10 rounded-full text-xs font-bold"
            style={{ backgroundColor: match.home.color, color: "#0a0a0a" }}
          >
            {match.home.short}
          </span>
          <span className="text-xs font-medium text-center">{match.home.name}</span>
        </div>

        <div className="scoreboard-number text-3xl font-bold px-4">
          {match.scoreHome ?? 0} : {match.scoreAway ?? 0}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <span
            className="flex items-center justify-center size-10 rounded-full text-xs font-bold"
            style={{ backgroundColor: match.away.color, color: "#0a0a0a" }}
          >
            {match.away.short}
          </span>
          <span className="text-xs font-medium text-center">{match.away.name}</span>
        </div>
      </div>

      <div className="h-6 relative">
        <AnimatePresence mode="wait">
          {recentGoal && (
            <motion.p
              key={recentGoal}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-center text-xs font-bold text-up"
            >
              ⚽ {recentGoal}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

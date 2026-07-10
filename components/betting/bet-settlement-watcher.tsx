"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import type { Match } from "@/lib/types";

const POLL_INTERVAL_MS = 90_000; // 90s — suficiente pra pegar mudanças sem estourar o limite da API gratuita

export function BetSettlementWatcher() {
  const settleAgainstResult = useAppStore((s) => s.settleAgainstResult);
  const knownFinishedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function checkForResults() {
      // Só vale a pena checar se existir alguma aposta pendente esperando.
      const pendingMatchIds = new Set(
        useAppStore
          .getState()
          .history.filter((h) => h.result === "pending")
          .flatMap((h) => h.selections.map((s) => s.matchId))
      );
      if (pendingMatchIds.size === 0) return;

      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const matches: Match[] = data.matches ?? [];

        matches.forEach((match) => {
          if (
            match.status === "finished" &&
            pendingMatchIds.has(match.id) &&
            !knownFinishedIds.current.has(match.id)
          ) {
            knownFinishedIds.current.add(match.id);
            settleAgainstResult(match.id, match);
          }
        });
      } catch {
        // Falha de rede momentânea — tenta de novo no próximo ciclo, sem quebrar a página.
      }
    }

    checkForResults();
    const interval = setInterval(checkForResults, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [settleAgainstResult]);

  return null;
}

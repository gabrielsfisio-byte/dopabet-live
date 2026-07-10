"use client";

import { create } from "zustand";
import type { Match } from "./types";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function drift(value: number, min: number): { value: number; trend: "up" | "down" | null } {
  const change = (Math.random() - 0.5) * 0.1; // ±0.05 por tick
  const next = round2(Math.max(min, value + change));
  if (next === value) return { value: next, trend: null };
  return { value: next, trend: next > value ? "up" : "down" };
}

interface MatchesState {
  matches: Match[];
  initialized: boolean;
  setInitialMatches: (matches: Match[]) => void;
  driftOdds: () => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  initialized: false,

  setInitialMatches: (matches) => {
    if (get().initialized) return; // evita sobrescrever depois que o usuário já começou a interagir
    set({ matches, initialized: true });
  },

  driftOdds: () => {
    const { matches } = get();
    const updated = matches.map((m) => {
      if (m.status === "finished") return m;

      const home = drift(m.odds1x2.home, 1.05);
      const draw = drift(m.odds1x2.draw, 1.8);
      const away = drift(m.odds1x2.away, 1.05);
      const over = drift(m.overUnder.over, 1.2);
      const under = drift(m.overUnder.under, 1.2);

      // Usa a variação da odd da casa como sinal geral de "sua odd subiu/caiu" no card.
      const trend = home.trend ?? draw.trend ?? away.trend ?? null;

      return {
        ...m,
        odds1x2: { home: home.value, draw: draw.value, away: away.value },
        overUnder: { ...m.overUnder, over: over.value, under: under.value },
        oddsTrend: trend,
      };
    });
    set({ matches: updated });
  },
}));

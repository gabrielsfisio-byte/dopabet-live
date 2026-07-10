"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BetHistoryEntry, BetResult, BetSlipItem, Match, SelectionInput } from "./types";
import { MAX_BALANCE, STARTING_BALANCE } from "./mock-data";

/** Avalia se uma seleção específica bateu, com base no placar final real de uma partida. */
export function evaluateSelection(selection: SelectionInput, finalMatch: Match): boolean {
  const home = finalMatch.scoreHome ?? 0;
  const away = finalMatch.scoreAway ?? 0;
  const total = home + away;

  switch (selection.market) {
    case "1x2-home":
      return home > away;
    case "1x2-draw":
      return home === away;
    case "1x2-away":
      return away > home;
    case "over":
      return total > 2.5;
    case "under":
      return total < 2.5;
    case "btts-yes":
      return home > 0 && away > 0;
    case "btts-no":
      return home === 0 || away === 0;
    default:
      return false;
  }
}

interface AppState {
  balance: number;
  slip: BetSlipItem[];
  history: BetHistoryEntry[];
  addCredits: (amount: number) => void;
  addSelection: (selection: SelectionInput) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
  placeBet: (stake: number, mode: "single" | "multiple") => BetHistoryEntry[] | null;
  settleBet: (entryIds: string[], win: boolean) => void;
  settleAgainstResult: (matchId: string, finalMatch: Match) => { entryIds: string[]; anyWin: boolean; creditedAmount: number };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      balance: STARTING_BALANCE,
      slip: [],
      history: [],

      addCredits: (amount) =>
        set((state) => ({
          balance: Math.min(MAX_BALANCE, state.balance + amount),
        })),

      addSelection: (selection) =>
        set((state) => {
          // one selection per match to keep the slip sane
          const withoutSameMatch = state.slip.filter((s) => s.matchId !== selection.matchId);
          return {
            slip: [...withoutSameMatch, { ...selection, id: `${selection.matchId}-${selection.market}` }],
          };
        }),

      removeSelection: (id) =>
        set((state) => ({ slip: state.slip.filter((s) => s.id !== id) })),

      clearSlip: () => set({ slip: [] }),

      placeBet: (stake, mode) => {
        const { balance, slip, history } = get();
        if (slip.length === 0 || stake <= 0 || stake > balance) return null;

        const entries: BetHistoryEntry[] = [];

        if (mode === "single") {
          slip.forEach((item) => {
            entries.push({
              id: `bet-${Date.now()}-${item.id}`,
              date: new Date().toISOString(),
              selections: [item],
              stake,
              totalOdd: item.odd,
              potentialReturn: Math.round(stake * item.odd * 100) / 100,
              result: "pending",
            });
          });
        } else {
          const totalOdd = slip.reduce((acc, s) => acc * s.odd, 1);
          entries.push({
            id: `bet-${Date.now()}`,
            date: new Date().toISOString(),
            selections: slip,
            stake,
            totalOdd: Math.round(totalOdd * 100) / 100,
            potentialReturn: Math.round(stake * totalOdd * 100) / 100,
            result: "pending",
          });
        }

        const totalStake = mode === "single" ? stake * slip.length : stake;

        set({
          balance: balance - totalStake,
          slip: [],
          history: [...entries, ...history],
        });

        return entries;
      },

      settleBet: (entryIds, win) => {
        const { history, balance } = get();
        let creditedAmount = 0;
        const updatedHistory = history.map((entry) => {
          if (!entryIds.includes(entry.id)) return entry;
          if (win) creditedAmount += entry.potentialReturn;
          return { ...entry, result: (win ? "won" : "lost") as BetResult };
        });
        set({
          history: updatedHistory,
          balance: win ? balance + creditedAmount : balance,
        });
      },

      settleAgainstResult: (matchId, finalMatch) => {
        const { history, balance } = get();
        let creditedAmount = 0;
        const settledIds: string[] = [];
        let anyWin = false;

        const updatedHistory = history.map((entry) => {
          if (entry.result !== "pending") return entry;
          const belongsToThisMatch = entry.selections.every((s) => s.matchId === matchId);
          if (!belongsToThisMatch) return entry;

          settledIds.push(entry.id);
          const allWin = entry.selections.every((s) => evaluateSelection(s, finalMatch));
          if (allWin) {
            creditedAmount += entry.potentialReturn;
            anyWin = true;
          }
          return { ...entry, result: (allWin ? "won" : "lost") as BetResult };
        });

        set({ history: updatedHistory, balance: balance + creditedAmount });
        return { entryIds: settledIds, anyWin, creditedAmount };
      },
    }),
    { name: "dopamine-bet-storage" }
  )
);

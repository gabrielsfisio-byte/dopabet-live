"use client";

import { useMemo, useState } from "react";
import { Trash2, Ticket, Clock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatBRL } from "@/lib/utils";

export function BetSlip() {
  const slip = useAppStore((s) => s.slip);
  const balance = useAppStore((s) => s.balance);
  const removeSelection = useAppStore((s) => s.removeSelection);
  const clearSlip = useAppStore((s) => s.clearSlip);
  const placeBet = useAppStore((s) => s.placeBet);

  const [mode, setMode] = useState<"single" | "multiple">("multiple");
  const [stake, setStake] = useState<number>(10);
  const [feedback, setFeedback] = useState<null | { count: number }>(null);

  const totalOdd = useMemo(() => slip.reduce((acc, s) => acc * s.odd, 1), [slip]);
  const totalStake = mode === "single" ? stake * slip.length : stake;
  const potentialReturn =
    mode === "single"
      ? slip.reduce((acc, s) => acc + stake * s.odd, 0)
      : stake * totalOdd;

  const canBet = slip.length > 0 && stake > 0 && totalStake <= balance;

  function handlePlaceBet() {
    if (!canBet) return;
    const entries = placeBet(stake, mode);
    if (!entries) return;

    // A aposta fica "pendente" de verdade — só resolve quando a partida real
    // (ou a rodada de Futebol Virtual) terminar. Ver components/betting/bet-settlement-watcher.tsx.
    setFeedback({ count: entries.length });
    setTimeout(() => setFeedback(null), 3200);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Ticket className="size-4 text-accent" />
          <h2 className="font-display font-semibold text-lg">Meu bilhete</h2>
        </div>
        {slip.length > 0 && (
          <button onClick={clearSlip} className="text-xs text-muted hover:text-down flex items-center gap-1">
            <Trash2 className="size-3.5" /> limpar
          </button>
        )}
      </div>

      {slip.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <Ticket className="size-8 text-muted" />
          <p className="text-sm text-muted">
            Clique em uma odd para adicionar sua seleção ao bilhete fictício.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-3">
            {slip.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-surface-2 p-3 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">{item.matchLabel}</p>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                  <button onClick={() => removeSelection(item.id)} className="text-muted hover:text-down shrink-0">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <span className="scoreboard-number text-sm font-bold text-accent self-end">
                  {item.odd.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4 flex flex-col gap-3">
            {slip.length > 1 && (
              <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
                <button
                  onClick={() => setMode("multiple")}
                  className={`flex-1 py-1.5 ${mode === "multiple" ? "bg-accent/15 text-accent" : "text-muted"}`}
                >
                  Múltipla
                </button>
                <button
                  onClick={() => setMode("single")}
                  className={`flex-1 py-1.5 ${mode === "single" ? "bg-accent/15 text-accent" : "text-muted"}`}
                >
                  Simples
                </button>
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Valor da aposta (fictício)</span>
              <input
                type="number"
                min={1}
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm scoreboard-number focus:outline-none focus:border-accent"
              />
            </label>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Odd total</span>
              <span className="scoreboard-number font-semibold">
                {mode === "multiple" ? totalOdd.toFixed(2) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Retorno potencial</span>
              <span className="scoreboard-number font-bold text-up">{formatBRL(potentialReturn)}</span>
            </div>

            <button
              onClick={handlePlaceBet}
              disabled={!canBet}
              className="w-full rounded-md bg-up text-background font-semibold py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              {totalStake > balance ? "Saldo fictício insuficiente" : "Confirmar aposta fictícia"}
            </button>
            <p className="text-[11px] text-muted text-center">
              Simulação apenas para entretenimento. Nenhum valor real envolvido.
            </p>
          </div>
        </>
      )}

      {feedback && (
        <div className="fixed sm:absolute inset-x-4 bottom-4 sm:inset-x-auto sm:right-4 sm:left-4 z-50 rounded-lg border p-4 shadow-xl animate-in bg-accent/15 border-accent text-accent">
          <p className="font-display font-bold text-lg flex items-center gap-2">
            <Clock className="size-4" />
            Aposta registrada!
          </p>
          <p className="text-sm opacity-90">
            {feedback.count === 1 ? "Sua aposta" : `Suas ${feedback.count} apostas`} ficaram pendentes — o
            resultado sai quando a partida terminar de verdade. Acompanhe no Histórico.
          </p>
        </div>
      )}
    </div>
  );
}

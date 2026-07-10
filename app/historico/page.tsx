"use client";

import Link from "next/link";
import { Award, CheckCircle2, Clock, History as HistoryIcon, Ticket, XCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function HistoricoPage() {
  const history = useAppStore((s) => s.history);

  const totalStaked = history.reduce((a, h) => a + h.stake, 0);
  const totalWon = history.filter((h) => h.result === "won").reduce((a, h) => a + h.potentialReturn, 0);
  const wins = history.filter((h) => h.result === "won").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
        <HistoryIcon className="size-7 text-up" />
        Histórico de apostas
      </h1>
      <p className="text-sm text-muted mb-8">Suas apostas fictícias, sem valor real.</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-muted mb-1">Apostas feitas</p>
          <p className="font-display font-bold text-lg">{history.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-muted mb-1">Vitórias</p>
          <p className="font-display font-bold text-lg text-up">{wins}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-xs text-muted mb-1">Ganho x apostado</p>
          <p className={cn("font-display font-bold text-lg", totalWon >= totalStaked ? "text-up" : "text-down")}>
            {formatBRL(totalWon - totalStaked)}
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center flex flex-col items-center gap-3">
          <Ticket className="size-8 text-muted" />
          <p className="text-sm text-muted">Você ainda não fez nenhuma aposta.</p>
          <Link href="/" className="rounded-lg bg-up text-background text-sm font-semibold px-4 py-2 hover:brightness-110 transition">
            Apostar agora
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((h) => (
            <div key={h.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {h.result === "won" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-up">
                      <CheckCircle2 className="size-3" /> Ganhou
                    </span>
                  )}
                  {h.result === "lost" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-down">
                      <XCircle className="size-3" /> Perdeu
                    </span>
                  )}
                  {h.result === "pending" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-muted">
                      <Clock className="size-3" /> Pendente
                    </span>
                  )}
                  <span className="text-[11px] text-muted">{new Date(h.date).toLocaleString("pt-BR")}</span>
                </div>
                <span className="scoreboard-number text-xs font-bold text-accent">Odd {h.totalOdd.toFixed(2)}</span>
              </div>

              <div className="flex flex-col gap-0.5">
                {h.selections.map((s, i) => (
                  <p key={i} className="text-xs text-muted">
                    {s.matchLabel} — <span className="text-foreground font-medium">{s.label}</span>
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <span className="text-xs text-muted">Apostado: {formatBRL(h.stake)}</span>
                <span
                  className={cn(
                    "text-sm font-bold flex items-center gap-1",
                    h.result === "won" ? "text-up" : h.result === "lost" ? "text-down" : "text-muted"
                  )}
                >
                  {h.result === "won" && <Award className="size-3.5" />}
                  {h.result === "won" ? `+${formatBRL(h.potentialReturn)}` : formatBRL(h.potentialReturn)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

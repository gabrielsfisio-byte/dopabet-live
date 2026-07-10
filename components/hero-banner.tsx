import { Flame } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-up/5 p-6 sm:p-10 mb-8">
      <div className="absolute -top-10 -right-10 size-56 rounded-full bg-up/10 blur-3xl" />
      <div className="absolute -bottom-16 left-10 size-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative z-10 max-w-xl">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-up bg-up/10 rounded-full px-3 py-1 mb-4">
          <Flame className="size-3.5" />
          Rodada fictícia em alta
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-3">
          Sinta o jogo. <span className="text-up">Sem risco real.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted">
          Monte seu bilhete, acompanhe placares ao vivo e suba no ranking — tudo com créditos
          fictícios, feito só para diversão.
        </p>
      </div>
    </div>
  );
}

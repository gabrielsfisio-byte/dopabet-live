"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Loader2, Palette, Volume2, LineChart, ShieldOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatBRL } from "@/lib/utils";

const PRICE = 29.9;

const BENEFITS = [
  { icon: Palette, text: "Temas visuais exclusivos e mais mercados de apostas visíveis" },
  { icon: Volume2, text: "Sons e animações exclusivas de vitória" },
  { icon: LineChart, text: "Estatísticas avançadas de todas as suas apostas" },
  { icon: ShieldOff, text: "Sem anúncios e histórico ilimitado" },
];

export default function PremiumPage() {
  const router = useRouter();
  const { user, isPremium, loading } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    if (!user) {
      router.push("/login");
      return;
    }
    setError(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Não foi possível iniciar o pagamento.");
        setCheckingOut(false);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setCheckingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center mb-8">
        <span className="inline-flex items-center justify-center size-14 rounded-2xl bg-accent/15 text-accent mb-4">
          <Crown className="size-7" />
        </span>
        <h1 className="font-display text-3xl font-extrabold mb-2">DopaBet Premium</h1>
        <p className="text-sm text-muted">Desbloqueie recursos extras — nunca mais créditos ou vantagem na aposta.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-baseline gap-1 mb-6">
          <span className="font-display text-4xl font-extrabold">{formatBRL(PRICE)}</span>
          <span className="text-sm text-muted">/mês</span>
        </div>

        <ul className="flex flex-col gap-3 mb-8">
          {BENEFITS.map((b) => (
            <li key={b.text} className="flex items-start gap-3 text-sm">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/15 text-primary shrink-0 mt-0.5">
                <Check className="size-3.5" />
              </span>
              {b.text}
            </li>
          ))}
        </ul>

        {error && <p className="text-xs text-danger mb-4 text-center">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="size-5 animate-spin text-muted" />
          </div>
        ) : isPremium ? (
          <div className="rounded-lg bg-primary/10 text-primary text-sm font-semibold text-center py-3">
            Você já é Premium! 🎉
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={checkingOut}
            className="w-full rounded-xl bg-primary text-white font-semibold py-3 text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checkingOut && <Loader2 className="size-4 animate-spin" />}
            {user ? "Assinar agora" : "Entrar para assinar"}
          </button>
        )}

        <p className="text-[11px] text-muted text-center mt-4">
          Cancele quando quiser, direto pela sua conta. Pagamento processado com segurança pelo Stripe.
        </p>
      </div>
    </div>
  );
}

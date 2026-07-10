"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, LogOut, Loader2, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ContaPage() {
  const { user, isPremium, loading, signOut } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <p className="text-sm text-muted mb-4">Você precisa entrar para ver sua conta.</p>
        <Link href="/login" className="rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:brightness-110 transition">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-2xl font-extrabold mb-6">Minha conta</h1>

      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
        <div>
          <p className="text-xs text-muted">E-mail</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          {isPremium ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/15 rounded-full px-3 py-1.5">
              <Crown className="size-3.5" /> Assinante Premium
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted bg-border rounded-full px-3 py-1.5">
              Plano gratuito
            </span>
          )}
        </div>

        {isPremium ? (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold py-2.5 hover:bg-card-hover transition disabled:opacity-50"
          >
            {portalLoading ? <Loader2 className="size-4 animate-spin" /> : <Settings className="size-4" />}
            Gerenciar assinatura
          </button>
        ) : (
          <Link
            href="/premium"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent text-background font-semibold py-2.5 text-sm hover:brightness-110 transition"
          >
            <ShieldCheck className="size-4" />
            Assinar Premium
          </Link>
        )}

        <button
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-danger py-2 hover:underline"
        >
          <LogOut className="size-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

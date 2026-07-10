"use client";

import Link from "next/link";
import { useState } from "react";
import { Coins, Crown, History, Home as HomeIcon, Menu, Plus, User, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatBRL } from "@/lib/utils";
import { MAX_BALANCE } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/historico", label: "Histórico", icon: History },
];

export function Navbar() {
  const balance = useAppStore((s) => s.balance);
  const addCredits = useAppStore((s) => s.addCredits);
  const [open, setOpen] = useState(false);
  const { user, isPremium, loading } = useAuth();

  const canAddCredits = balance < MAX_BALANCE;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              DOPA<span className="text-up">BET</span>
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-muted border border-border rounded px-1.5 py-0.5">
              fictício
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface"
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-surface border border-border rounded-full pl-3 pr-1 py-1">
            <Coins className="size-4 text-up" />
            <span className="scoreboard-number text-sm font-semibold">{formatBRL(balance)}</span>
            <button
              onClick={() => addCredits(500)}
              disabled={!canAddCredits}
              title={canAddCredits ? "Adicionar créditos fictícios" : "Limite fictício atingido"}
              className="flex items-center justify-center size-7 rounded-full bg-up/15 text-up hover:bg-up/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {!loading && (
            <>
              {isPremium ? (
                <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-accent bg-accent/15 rounded-full px-3 py-1.5">
                  <Crown className="size-3.5" /> Premium
                </span>
              ) : (
                <Link
                  href="/premium"
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-background bg-accent rounded-full px-3 py-1.5 hover:brightness-110 transition"
                >
                  <Crown className="size-3.5" /> Premium
                </Link>
              )}
              <Link
                href={user ? "/conta" : "/login"}
                className="hidden sm:flex items-center justify-center size-9 rounded-full border border-border hover:bg-surface transition"
              >
                <User className="size-4" />
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center size-9 rounded-md border border-border text-foreground"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          <div className="flex sm:hidden items-center justify-between gap-2 bg-surface border border-border rounded-full pl-3 pr-1 py-1 mb-2">
            <div className="flex items-center gap-2">
              <Coins className="size-4 text-up" />
              <span className="scoreboard-number text-sm font-semibold">{formatBRL(balance)}</span>
            </div>
            <button
              onClick={() => addCredits(500)}
              disabled={!canAddCredits}
              className="flex items-center justify-center size-7 rounded-full bg-up/15 text-up disabled:opacity-30"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <Link
            href="/premium"
            onClick={() => setOpen(false)}
            className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-background bg-accent rounded-full px-3 py-2 w-fit mb-2"
          >
            <Crown className="size-3.5" /> Premium
          </Link>
          <Link
            href={user ? "/conta" : "/login"}
            onClick={() => setOpen(false)}
            className="sm:hidden flex items-center gap-1.5 text-xs font-medium text-muted mb-2"
          >
            <User className="size-3.5" /> {user ? "Minha conta" : "Entrar"}
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground rounded-md hover:bg-surface"
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

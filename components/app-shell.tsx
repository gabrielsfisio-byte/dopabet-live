"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { Navbar } from "./navbar";
import { DisclaimerBanner } from "./disclaimer-banner";
import { BetSlip } from "./betting/bet-slip";
import { BetSettlementWatcher } from "./betting/bet-settlement-watcher";
import { useAppStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slipCount = useAppStore((s) => s.slip.length);

  return (
    <div className="flex flex-col min-h-screen">
      <BetSettlementWatcher />
      <DisclaimerBanner />
      <Navbar />

      <div className="flex-1 mx-auto max-w-7xl w-full flex gap-6 px-4 py-6">
        <main className="flex-1 min-w-0">{children}</main>

        <aside className="hidden lg:block w-[340px] shrink-0">
          <div className="sticky top-24 rounded-xl border border-border bg-surface h-[calc(100vh-7rem)] overflow-hidden">
            <BetSlip />
          </div>
        </aside>
      </div>

      {/* Mobile floating bet slip trigger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-accent text-background px-4 py-3 font-semibold shadow-lg shadow-accent/30"
      >
        <Ticket className="size-4" />
        Bilhete
        {slipCount > 0 && (
          <span className="flex items-center justify-center size-5 rounded-full bg-background text-accent text-xs font-bold">
            {slipCount}
          </span>
        )}
      </button>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-background border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-center py-2">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="flex-1 overflow-hidden">
              <BetSlip />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

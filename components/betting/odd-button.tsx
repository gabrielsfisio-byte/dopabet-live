"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OddButtonProps {
  label: string;
  value: number;
  active?: boolean;
  onClick: () => void;
}

export function OddButton({ label, value, active, onClick }: OddButtonProps) {
  const prev = useRef(value);
  const [pulse, setPulse] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value > prev.current) setPulse("up");
    else if (value < prev.current) setPulse("down");
    prev.current = value;
    if (pulse) {
      const t = setTimeout(() => setPulse(null), 450);
      return () => clearTimeout(t);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 min-w-0 transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-border bg-surface-2 text-foreground hover:border-accent/60"
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted truncate w-full text-center">
        {label}
      </span>
      <span
        className={cn(
          "scoreboard-number text-sm font-bold",
          pulse === "up" && "text-up odd-pulse",
          pulse === "down" && "text-down odd-pulse"
        )}
      >
        {value.toFixed(2)}
      </span>
    </button>
  );
}

import { LucideIcon } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  live,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-5 text-accent" />
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {live && (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-live bg-live/10 rounded-full px-2 py-0.5">
          <span className="live-dot size-1.5 rounded-full bg-live" />
          AO VIVO
        </span>
      )}
      {subtitle && <span className="text-xs text-muted ml-1">{subtitle}</span>}
    </div>
  );
}

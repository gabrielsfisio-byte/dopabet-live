import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="w-full bg-live/10 border-b border-live/30 text-live">
      <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center gap-2 text-xs sm:text-sm font-medium">
        <ShieldAlert className="size-3.5 shrink-0" />
        <p>
          Site 100% fictício, feito para entretenimento. Nenhum valor é real e nada aqui pode ser sacado.{" "}
          <span className="opacity-80">Não aposte dinheiro real.</span>
        </p>
      </div>
    </div>
  );
}

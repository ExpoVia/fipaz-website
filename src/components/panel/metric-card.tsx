import type { LucideIcon } from "lucide-react";

import { DemoBadge } from "@/components/shared/demo-badge";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /** Toda cifra del panel es de ejemplo salvo que se indique lo contrario. */
  demo?: boolean;
  tone?: "blue" | "violet" | "amber" | "rose" | "mint";
  className?: string;
}

const tones = {
  blue: "bg-[#e9f3ff] text-[#0878f9] dark:bg-[#16233D] dark:text-[#1479F5]",
  violet: "bg-[#f0edff] text-[#6851ea] dark:bg-[#16233D] dark:text-[#A9D0FF]",
  amber: "bg-[#fff3df] text-[#f2a407] dark:bg-[#16233D] dark:text-[#FFCA35]",
  rose: "bg-[#ffeaf0] text-[#ef4874] dark:bg-[#16233D] dark:text-[#f4a2c0]",
  mint: "bg-[#e4f8ef] text-[#11a778] dark:bg-[#16233D] dark:text-[#68d391]",
} as const;

export function MetricCard({ label, value, icon: Icon, hint, demo = true, tone = "blue", className = "" }: MetricCardProps) {
  return (
    <div className={`pixel-card flex min-w-0 flex-col gap-3 p-4 sm:p-5 dark:border-[#223354] dark:bg-[#101A2E] ${className}`}>
      {/* La etiqueta reserva 2 líneas para que las cifras de una misma fila queden alineadas aunque una etiqueta se parta. */}
      <div className="flex items-start gap-3 sm:gap-3.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-[13px] ${tones[tone]}`}><Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} /></span>
        <div className="min-w-0 flex-1 sm:pt-0.5">
          <p className="min-h-10 text-[13px] font-semibold leading-5 text-[#50658b] dark:text-[#B8C7E6]">{label}</p>
          <p className="mt-1 text-[clamp(1.6rem,2.4vw,2.1rem)] font-extrabold leading-none tracking-tight text-[#121d3c] dark:text-[#F5F9FF]">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-auto text-xs font-medium text-[#7a8daf] dark:text-[#B8C7E6]">{hint}</p>}
      {demo && <DemoBadge className="self-start" />}
    </div>
  );
}

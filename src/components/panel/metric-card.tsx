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
  blue: "bg-[#e9f3ff] text-[#0878f9]",
  violet: "bg-[#f0edff] text-[#6851ea]",
  amber: "bg-[#fff3df] text-[#f2a407]",
  rose: "bg-[#ffeaf0] text-[#ef4874]",
  mint: "bg-[#e4f8ef] text-[#11a778]",
} as const;

export function MetricCard({ label, value, icon: Icon, hint, demo = true, tone = "blue", className = "" }: MetricCardProps) {
  return (
    <div className={`pixel-card flex min-h-[138px] flex-col justify-between gap-4 p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3.5">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] ${tones[tone]}`}><Icon aria-hidden="true" className="h-6 w-6" strokeWidth={2.4} /></span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[13px] font-semibold leading-5 text-[#50658b]">{label}</p>
          <p className="mt-1 text-[clamp(1.6rem,2.4vw,2.1rem)] font-extrabold leading-none tracking-tight text-[#121d3c]">{value}</p>
        </div>
      </div>
      {hint && <p className="text-xs font-medium text-[#7a8daf]">{hint}</p>}
      {demo && <DemoBadge className="self-start" />}
    </div>
  );
}

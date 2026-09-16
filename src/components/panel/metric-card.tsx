import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}

export function MetricCard({ label, value, icon: Icon, hint }: MetricCardProps) {
  return (
    <div className="pixel-card flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="pixel-label text-slate-500">{label}</span>
        <Icon aria-hidden="true" className="h-4 w-4 text-[var(--expo-blue)]" />
      </div>
      <p className="text-2xl font-black text-[var(--expo-navy)]">{value}</p>
      {hint && <p className="text-xs font-medium text-slate-500">{hint}</p>}
    </div>
  );
}

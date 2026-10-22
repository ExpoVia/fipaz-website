import type { StandCheckin } from "@/lib/api/exhibitor";

function dayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/La_Paz", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function lastSevenDays(): { key: string; label: string }[] {
  const [year, month, day] = dayKey(new Date()).split("-").map(Number);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (6 - index)));
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short", timeZone: "UTC" }).format(date),
    };
  });
}

export function PanelVisitsChart({ visits }: { visits: StandCheckin[] }) {
  const days = lastSevenDays();
  const counts = days.map(({ key }) => visits.filter((visit) => dayKey(new Date(visit.acceptedAt)) === key).length);
  const maximum = Math.max(1, ...counts);
  const x = (index: number) => 42 + index * 104;
  const y = (count: number) => 182 - (count / maximum) * 145;
  const line = counts.map((count, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(count)}`).join(" ");
  const area = `${line} L ${x(6)} 182 L ${x(0)} 182 Z`;

  const summary = `Check-ins de los últimos siete días: ${counts.join(", ")}`;

  return (
    <div className="w-full">
      <div role="img" aria-label={summary} className="flex h-48 items-end justify-between gap-1.5 pt-5 sm:hidden">
        {counts.map((count, index) => <div key={days[index].key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[10px] font-bold text-[#60779f]">{count}</span>
          <span className="w-full rounded-t-md bg-[linear-gradient(180deg,#1689ff,#a8d4ff)]" style={{ height: `${Math.max(3, count / maximum * 122)}px` }} />
          <span className="whitespace-nowrap text-[9px] font-medium text-[#8092af]">{days[index].label.split(" ")[0]}</span>
        </div>)}
      </div>
      <svg viewBox="0 0 710 226" role="img" aria-label={summary} className="hidden h-auto w-full sm:block">
        <defs>
          <linearGradient id="panel-visits-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1889ff" stopOpacity="0.22" /><stop offset="100%" stopColor="#1889ff" stopOpacity="0.01" /></linearGradient>
        </defs>
        <g className="panel-chart-grid">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const lineY = 182 - fraction * 145;
            return <g key={fraction}><line x1="42" x2="666" y1={lineY} y2={lineY} /><text x="34" y={lineY + 4} textAnchor="end">{Math.round(maximum * fraction)}</text></g>;
          })}
          {days.map((day, index) => <text key={day.key} x={x(index)} y="210" textAnchor="middle">{day.label}</text>)}
        </g>
        <path d={area} fill="url(#panel-visits-fill)" />
        <path d={line} fill="none" stroke="#0878f9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {counts.map((count, index) => <circle key={days[index].key} cx={x(index)} cy={y(count)} r="5.5" fill="#0878f9" stroke="#fff" strokeWidth="2.5"><title>{days[index].label}: {count} check-ins</title></circle>)}
      </svg>
    </div>
  );
}

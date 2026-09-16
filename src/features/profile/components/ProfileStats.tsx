"use client";

import { Star, Trophy, MapPin } from "lucide-react";
import { LEVEL_COLORS, LEVEL_LABELS, LEVEL_THRESHOLDS } from "@/lib/demo-domain";

interface ProfileStatsProps {
  points: number;
  level: number;
  visitedCount: number;
}

export function ProfileStats({ points, level, visitedCount }: ProfileStatsProps) {
  const levelName = LEVEL_LABELS[level] ?? "Explorador";
  const levelColor = LEVEL_COLORS[level] ?? "var(--expo-blue)";

  return (
    <div className="w-full rounded-2xl border-2 border-[var(--expo-line)] bg-white p-4">
      <h2 className="sr-only">Estadísticas</h2>

      {/* Nivel */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="flex items-center justify-center rounded-full text-white font-black text-sm"
          style={{
            background: levelColor,
            width: 44,
            height: 44,
          }}
          aria-hidden="true"
        >
          {level}
        </span>
        <div>
          <p className="font-bold text-[var(--expo-navy)] text-sm">
            {levelName}
          </p>
          <p className="text-xs text-slate-400">Nivel {level} de 4</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Star size={18} className="text-[var(--expo-yellow)]" />}
          label="Puntos"
          value={points.toLocaleString("es-BO")}
        />
        <StatCard
          icon={<MapPin size={18} className="text-[var(--expo-blue)]" />}
          label="Stands visitados"
          value={visitedCount.toString()}
        />
      </div>

      {/* Barra de progreso al siguiente nivel */}
      <LevelProgress points={points} level={level} />
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--expo-bg)] px-3 py-2">
      <span aria-hidden="true">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-black text-[var(--expo-navy)]">{value}</p>
      </div>
    </div>
  );
}

function LevelProgress({
  points,
  level,
}: {
  points: number;
  level: number;
}) {
  const thresholds = LEVEL_THRESHOLDS;
  const nextThreshold = thresholds[level] ?? null;

  if (level >= 4 || nextThreshold === null) {
    return (
      <p className="mt-3 text-xs text-center text-[var(--expo-purple)] font-semibold">
        <Trophy size={12} className="inline mr-1" />
        Nivel máximo alcanzado
      </p>
    );
  }

  const currentThreshold = thresholds[level - 1] ?? 0;
  const range = nextThreshold - currentThreshold;
  const progress = Math.min(points - currentThreshold, range);
  const pct = Math.round((progress / range) * 100);

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Nivel {level + 1} en {nextThreshold - points} pts más</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 rounded-full bg-[var(--expo-line)] overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso al nivel ${level + 1}: ${pct}%`}
      >
        <div
          className="h-full rounded-full bg-[var(--expo-blue)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

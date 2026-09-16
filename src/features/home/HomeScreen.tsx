"use client";

import { useEffect, useState } from "react";
import { Compass, Map as MapIcon, ScanLine, Sparkles, Trophy } from "lucide-react";

import { PointsPill } from "@/components/pixel/PointsPill";
import type { DemoTab, FeatureScreenProps } from "@/config/navigation";
import { demoEvent, stands } from "@/data/demo-data";
import { LEVEL_LABELS } from "@/lib/demo-domain";
import { StandCard, StandDetailOverlay } from "@/features/stands";
import { useDemoStore } from "@/store/demo-store";
import {
  selectFavoriteStandIds,
  selectHasHydrated,
  selectLevel,
  selectPoints,
  selectSetActiveTab,
  selectToggleFavorite,
  selectVisitedStandIds,
} from "@/store/demo-selectors";

const QUICK_ACTIONS: readonly {
  tab: DemoTab;
  label: string;
  icon: typeof Compass;
  bg: string;
}[] = [
  { tab: "explore", label: "Explorar", icon: Compass, bg: "bg-[var(--expo-sky)]" },
  { tab: "map", label: "Mapa", icon: MapIcon, bg: "bg-[var(--expo-mint)]" },
  { tab: "scan", label: "Escanear", icon: ScanLine, bg: "bg-[#ffe7a0]" },
  { tab: "missions", label: "Misiones", icon: Trophy, bg: "bg-[#e3d2ef]" },
];

const featuredStands = stands.filter((stand) => stand.featured);

export function HomeScreen({ onNavigate }: FeatureScreenProps) {
  const hasHydrated = useDemoStore(selectHasHydrated);
  const points = useDemoStore(selectPoints);
  const level = useDemoStore(selectLevel);
  const visitedStandIds = useDemoStore(selectVisitedStandIds);
  const favoriteStandIds = useDemoStore(selectFavoriteStandIds);
  const toggleFavorite = useDemoStore(selectToggleFavorite);
  const setActiveTab = useDemoStore(selectSetActiveTab);

  const [openStandId, setOpenStandId] = useState<string | null>(null);

  useEffect(() => {
    if (!useDemoStore.persist.hasHydrated()) {
      void useDemoStore.persist.rehydrate();
    }
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-slate-400">Cargando ExpoVia&hellip;</span>
      </div>
    );
  }

  function goTo(tab: DemoTab) {
    setActiveTab(tab);
    onNavigate?.(tab);
  }

  const levelName = LEVEL_LABELS[level] ?? "Explorador";

  return (
    <>
      <StandDetailOverlay
        dismissId="stand-detail:home"
        standId={openStandId}
        onClose={() => setOpenStandId(null)}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col gap-5 px-4 py-5 pb-8">
        {/* Pasaporte digital / puntos */}
        <section className="pixel-panel relative overflow-hidden p-5 bg-[linear-gradient(135deg,var(--expo-blue),var(--expo-purple))] text-white">
          <span className="absolute -right-6 -top-6 size-28 rotate-12 border-8 border-white/20" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="pixel-label opacity-80">Pasaporte digital</p>
              <h1 className="mt-2 text-xl font-black leading-tight">{demoEvent.name}</h1>
              <p className="mt-1 text-xs font-bold opacity-80">{demoEvent.city}</p>
            </div>
            <PointsPill points={points} />
          </div>

          <div className="relative mt-4 flex items-center justify-between rounded-xl border-2 border-white/30 bg-white/10 px-3 py-2">
            <div>
              <p className="text-xs font-bold opacity-75">Nivel {level} de 4</p>
              <p className="font-black">{levelName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold opacity-75">Stands visitados</p>
              <p className="font-black">{visitedStandIds.length}</p>
            </div>
          </div>
        </section>

        {/* Accesos rápidos */}
        <section className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(({ tab, label, icon: Icon, bg }) => (
            <button
              key={tab}
              type="button"
              onClick={() => goTo(tab)}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-[var(--expo-navy)] bg-white p-2.5 shadow-[2px_2px_0_var(--expo-navy)] transition-transform active:scale-95"
              style={{ minHeight: 44 }}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] ${bg}`}
                aria-hidden="true"
              >
                <Icon size={16} className="text-[var(--expo-navy)]" strokeWidth={2.5} />
              </span>
              <span className="text-[0.65rem] font-black text-[var(--expo-navy)]">{label}</span>
            </button>
          ))}
        </section>

        {/* Destacados */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-bold text-[var(--expo-navy)]">
              <Sparkles size={15} className="text-[var(--expo-yellow)]" aria-hidden="true" />
              Destacados
            </h2>
            <button
              type="button"
              onClick={() => goTo("explore")}
              className="text-xs font-bold text-[var(--expo-blue)]"
            >
              Ver todo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredStands.map((stand) => (
              <StandCard
                key={stand.id}
                stand={stand}
                isFavorite={favoriteStandIds.includes(stand.id)}
                isVisited={visitedStandIds.includes(stand.id)}
                onOpen={() => setOpenStandId(stand.id)}
                onToggleFavorite={() => toggleFavorite(stand.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

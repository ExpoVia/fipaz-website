"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "@/store/demo-store";
import {
  selectFavoriteStandIds,
  selectHasHydrated,
  selectLevel,
  selectPoints,
  selectRecentVisits,
  selectResetDemo,
  selectToggleFavorite,
  selectVisitedStandIds,
} from "@/store/demo-selectors";
import { getStandById } from "@/lib/demo-domain";
import { StandCard, StandDetailOverlay } from "@/features/stands";
import { ProfileStats } from "./components/ProfileStats";
import { RecentVisits } from "./components/RecentVisits";
import { Heart, History, RotateCcw, User } from "lucide-react";
import type { FeatureScreenProps } from "@/config/navigation";

export function ProfileScreen({ onNavigate }: FeatureScreenProps) {
  // ── Store ──────────────────────────────────────────────────────────────────
  const hasHydrated = useDemoStore(selectHasHydrated);
  const points = useDemoStore(selectPoints);
  const level = useDemoStore(selectLevel);
  const visitedStandIds = useDemoStore(selectVisitedStandIds);
  const favoriteStandIds = useDemoStore(selectFavoriteStandIds);
  const recentVisits = useDemoStore(selectRecentVisits);
  const toggleFavorite = useDemoStore(selectToggleFavorite);
  const resetDemo = useDemoStore(selectResetDemo);

  const [openStandId, setOpenStandId] = useState<string | null>(null);

  useEffect(() => {
    if (!useDemoStore.persist.hasHydrated()) {
      void useDemoStore.persist.rehydrate();
    }
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleReset = () => {
    const confirmed = window.confirm(
      "¿Reiniciar la demostración?\n\nSe borrará tu progreso y se restaurará el estado inicial."
    );
    if (!confirmed) return;
    resetDemo();
    onNavigate?.("home");
  };

  // ── Carga inicial ──────────────────────────────────────────────────────────

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-slate-400">Cargando perfil&hellip;</span>
      </div>
    );
  }

  // ── Favoritos ──────────────────────────────────────────────────────────────

  const favoriteStands = favoriteStandIds
    .map((id) => getStandById(id))
    .filter(Boolean);

  return (
    <>
      <StandDetailOverlay
        dismissId="stand-detail:profile"
        standId={openStandId}
        onClose={() => setOpenStandId(null)}
        onNavigate={onNavigate}
      />

      <section className="flex flex-col gap-5 px-4 py-6">
        {/* Encabezado */}
      <header className="flex flex-col items-center gap-2 text-center">
        {/* Avatar genérico */}
        <div
          className="flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--expo-blue),var(--expo-lilac))] text-white shadow-md"
          style={{ width: 72, height: 72 }}
          aria-hidden="true"
        >
          <User size={36} strokeWidth={1.5} />
        </div>

        {/* Nombre */}
        <h1 className="text-lg font-black text-[var(--expo-navy)]">
          Explorador ExpoVia
        </h1>

        {/* Badge de simulación */}
        <span className="rounded-full border border-[var(--expo-lilac)] bg-[color-mix(in_srgb,var(--expo-lilac)_15%,white)] px-3 py-0.5 text-xs font-bold text-[var(--expo-purple)]">
          Datos simulados
        </span>
      </header>

      {/* Estadísticas */}
      <ProfileStats
        points={points}
        level={level}
        visitedCount={visitedStandIds.length}
      />

      {/* Historial de visitas */}
      <div>
        <h2 className="mb-2 font-bold text-[var(--expo-navy)] flex items-center gap-1.5">
          <History size={15} className="text-[var(--expo-blue)]" aria-hidden="true" />
          Visitas recientes
        </h2>
        <RecentVisits visits={recentVisits} />
      </div>

      {/* Favoritos */}
      <div>
        <h2 className="mb-2 font-bold text-[var(--expo-navy)] flex items-center gap-1.5">
          <Heart
            size={15}
            className="text-[var(--expo-pink)] fill-[var(--expo-pink)]"
            aria-hidden="true"
          />
          Favoritos
        </h2>

        {favoriteStands.length === 0 ? (
          <p className="text-sm text-slate-400 py-3 text-center">
            Aún no tienes favoritos. Agrega stands desde Explorar o Inicio.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3" aria-label="Stands favoritos">
            {favoriteStands.map((stand) => (
              <StandCard
                key={stand!.id}
                stand={stand!}
                isFavorite
                isVisited={visitedStandIds.includes(stand!.id)}
                onOpen={() => setOpenStandId(stand!.id)}
                onToggleFavorite={() => toggleFavorite(stand!.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reiniciar demo */}
      <div className="pt-2 border-t border-[var(--expo-line)]">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--expo-coral)] bg-white px-4 py-3 text-sm font-bold text-[var(--expo-coral)] transition-colors hover:bg-[color-mix(in_srgb,var(--expo-coral)_8%,white)]"
          style={{ minHeight: 44 }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reiniciar demostración
        </button>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Vuelve al estado inicial de la demo
        </p>
      </div>
      </section>
    </>
  );
}

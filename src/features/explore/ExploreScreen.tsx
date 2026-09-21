"use client";

import { useMemo, useState } from "react";
import { Heart, Search, SearchX } from "lucide-react";

import type { FeatureScreenProps } from "@/config/navigation";
import { categories, stands } from "@/data/demo-data";
import { StandCard, StandDetailOverlay } from "@/features/stands";
import { useDemoStore } from "@/store/demo-store";
import {
  selectFavoriteStandIds,
  selectHasHydrated,
  selectToggleFavorite,
  selectVisitedStandIds,
} from "@/store/demo-selectors";
import type { StandCategory } from "@/types/demo";

type CategoryFilter = "all" | StandCategory;

export function ExploreScreen({ onNavigate }: FeatureScreenProps) {
  const hasHydrated = useDemoStore(selectHasHydrated);
  const visitedStandIds = useDemoStore(selectVisitedStandIds);
  const favoriteStandIds = useDemoStore(selectFavoriteStandIds);
  const toggleFavorite = useDemoStore(selectToggleFavorite);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [openStandId, setOpenStandId] = useState<string | null>(null);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return stands.filter((stand) => {
      if (activeCategory !== "all" && stand.category !== activeCategory) return false;
      if (favoritesOnly && !favoriteStandIds.includes(stand.id)) return false;

      if (normalizedQuery) {
        const haystack = `${stand.name} ${stand.description} ${stand.tags.join(" ")}`.toLocaleLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [activeCategory, favoriteStandIds, favoritesOnly, query]);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-slate-400">Cargando directorio&hellip;</span>
      </div>
    );
  }

  return (
    <>
      <StandDetailOverlay
        dismissId="stand-detail:explore"
        standId={openStandId}
        onClose={() => setOpenStandId(null)}
        onNavigate={onNavigate}
      />

      {/* Mismo patrón que HomeScreen: flex flex-col + px-4 fijo */}
      <div className="flex flex-col gap-5 px-4 py-5 pb-8">

        {/* Encabezado */}
        <section className="pixel-panel relative overflow-hidden p-5 bg-[var(--expo-sky)] text-[var(--expo-navy)]">
          <span className="absolute -right-5 -top-5 size-24 rotate-12 border-8 border-white/30" aria-hidden="true" />
          <div className="relative">
            <p className="pixel-label opacity-75">Directorio de la feria</p>
            <h1 className="mt-2 text-2xl font-black leading-tight">Explorar</h1>
            <p className="mt-1 max-w-xs text-sm font-medium leading-6 opacity-80">
              Busca stands por nombre o categoría y encuentra tu próxima parada.
            </p>
          </div>
        </section>

        {/* Búsqueda */}
        <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-white px-3 py-2.5 shadow-[2px_2px_0_var(--expo-navy)]">
          <Search size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por nombre, tema o etiqueta"
            aria-label="Buscar stands"
            className="w-full bg-transparent text-sm font-medium text-[var(--expo-navy)] outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Filtros de categoría — scroll horizontal */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por categoría">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors ${
              activeCategory === "all"
                ? "border-[var(--expo-navy)] bg-[var(--expo-navy)] text-white"
                : "border-[var(--expo-line)] bg-white text-[var(--expo-navy)]"
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors ${
                activeCategory === category.id
                  ? "border-[var(--expo-navy)] bg-[var(--expo-navy)] text-white"
                  : "border-[var(--expo-line)] bg-white text-[var(--expo-navy)]"
              }`}
            >
              {category.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            aria-pressed={favoritesOnly}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors ${
              favoritesOnly
                ? "border-[var(--expo-pink)] bg-[var(--expo-pink)] text-white"
                : "border-[var(--expo-line)] bg-white text-[var(--expo-navy)]"
            }`}
          >
            <Heart size={12} strokeWidth={2.5} className={favoritesOnly ? "fill-white" : ""} aria-hidden="true" />
            Favoritos
          </button>
        </div>

        {/* Contador de resultados */}
        <p className="-mt-2 text-xs font-bold text-slate-400" aria-live="polite">
          {results.length} {results.length === 1 ? "stand encontrado" : "stands encontrados"}
        </p>

        {/* Grid de stands o estado vacío */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--expo-line)] bg-white py-10 text-center">
            <span
              className="flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-coral)] shadow-[3px_3px_0_var(--expo-navy)]"
              aria-hidden="true"
            >
              <SearchX size={28} className="text-white" strokeWidth={2.5} />
            </span>
            <p className="mt-3 font-black text-[var(--expo-navy)]">Sin resultados</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Prueba otra palabra clave o quita algún filtro para ver más stands.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map((stand) => (
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
        )}
      </div>
    </>
  );
}

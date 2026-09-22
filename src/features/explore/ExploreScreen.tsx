"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Search, SearchX, X } from "lucide-react";

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

const CHIP_BASE = "shrink-0 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors";
const CHIP_ACTIVE = "border-[var(--expo-navy)] bg-[var(--expo-navy)] text-white";
const CHIP_IDLE = "border-[var(--expo-line)] bg-white text-[var(--expo-navy)]";

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

      {/* Mismo patrón que HomeScreen: flex flex-col + px-4 fijo. min-w-0 evita que los hijos ensanchen la pantalla. */}
      <div className="flex min-w-0 flex-col gap-5 px-4 py-5 pb-8">

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
        <div className="group flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-white px-3 py-2.5 shadow-[2px_2px_0_var(--expo-navy)] transition-all duration-200 focus-within:-translate-y-0.5 focus-within:shadow-[4px_4px_0_var(--expo-blue)]">
          <Search
            size={17}
            className="shrink-0 text-slate-400 transition-colors group-focus-within:text-[var(--expo-blue)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por nombre, tema o etiqueta"
            aria-label="Buscar stands"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--expo-navy)] outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                key="clear-search"
                type="button"
                onClick={() => setQuery("")}
                aria-label="Borrar búsqueda"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.85 }}
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={13} strokeWidth={3} aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filtros de categoría — scroll horizontal */}
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filtrar por categoría"
        >
          <motion.button
            type="button"
            onClick={() => setActiveCategory("all")}
            whileTap={{ scale: 0.93 }}
            className={`${CHIP_BASE} ${activeCategory === "all" ? CHIP_ACTIVE : CHIP_IDLE}`}
          >
            Todos
          </motion.button>
          {categories.map((category) => (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              whileTap={{ scale: 0.93 }}
              className={`${CHIP_BASE} ${activeCategory === category.id ? CHIP_ACTIVE : CHIP_IDLE}`}
            >
              {category.label}
            </motion.button>
          ))}
          <motion.button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            aria-pressed={favoritesOnly}
            whileTap={{ scale: 0.93 }}
            className={`${CHIP_BASE} flex items-center gap-1.5 ${
              favoritesOnly
                ? "border-[var(--expo-pink)] bg-[var(--expo-pink)] text-white"
                : CHIP_IDLE
            }`}
          >
            <motion.span
              key={String(favoritesOnly)}
              className="flex"
              initial={{ scale: favoritesOnly ? 0.4 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
            >
              <Heart size={12} strokeWidth={2.5} className={favoritesOnly ? "fill-white" : ""} aria-hidden="true" />
            </motion.span>
            Favoritos
          </motion.button>
        </div>

        {/* Contador de resultados */}
        <p className="-mt-2 text-xs font-bold text-slate-400" aria-live="polite">
          <motion.span
            key={results.length}
            className="inline-block"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {results.length}
          </motion.span>{" "}
          {results.length === 1 ? "stand encontrado" : "stands encontrados"}
        </p>

        {/* Grid de stands o estado vacío */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--expo-line)] bg-white py-10 text-center">
            <motion.span
              className="flex size-14 items-center justify-center rounded-2xl border-2 border-[var(--expo-navy)] bg-[var(--expo-coral)] shadow-[3px_3px_0_var(--expo-navy)]"
              initial={{ scale: 0.5, rotate: -14 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              aria-hidden="true"
            >
              <SearchX size={28} className="text-white" strokeWidth={2.5} />
            </motion.span>
            <p className="mt-3 font-black text-[var(--expo-navy)]">Sin resultados</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Prueba otra palabra clave o quita algún filtro para ver más stands.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map((stand) => (
              // Solo se anima al aparecer al filtrar; al abrir la pestaña la transición de pantalla ya cubre la entrada.
              <motion.div
                key={stand.id}
                className="min-w-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <StandCard
                  className="h-full"
                  stand={stand}
                  isFavorite={favoriteStandIds.includes(stand.id)}
                  isVisited={visitedStandIds.includes(stand.id)}
                  onOpen={() => setOpenStandId(stand.id)}
                  onToggleFavorite={() => toggleFavorite(stand.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

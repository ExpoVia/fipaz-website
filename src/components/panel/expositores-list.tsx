"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Search, Star } from "lucide-react";

import { DEMO_PANEL_STANDS, listStands, type PanelStand } from "@/lib/panel-stands";
import type { StandListResponseDto } from "@/types/stands-api";
import { PanelPageHeader } from "./panel-page-header";

const PAGE_SIZE = 20;

export function ExpositoresList() {
  const [stands, setStands] = useState<StandListResponseDto | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStands = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStands(await listStands({ query: query || undefined, page, limit: PAGE_SIZE }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar el directorio de stands.");
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => { void loadStands(); }, [loadStands]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim().slice(0, 100));
  }

  return (
    <>
      <PanelPageHeader
        eyebrow="Organizador"
        title="Directorio de stands"
        description={DEMO_PANEL_STANDS ? "FIPAZ 2026: tres stands ficticios del guion. Datos locales sin sincronización." : "Stands registrados en ExpoVia 2026, cargados desde el servicio de stands."}
      />

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <label htmlFor="stands-search" className="sr-only">Buscar stands</label>
        <input
          id="stands-search"
          type="search"
          maxLength={100}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por nombre, empresa o etiqueta"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#d7e3f3] bg-white px-4 py-2.5 text-sm text-[#172344] outline-none transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-[#0878f9] focus:ring-2 focus:ring-[#0878f9]/15 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:placeholder:text-[#B8C7E6] dark:focus:border-[#1479F5]"
        />
        <button type="submit" aria-label="Buscar" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-[#0878f9] px-3.5 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[#0067d9] active:scale-[0.97] sm:px-5 dark:bg-[#1479F5]">
          <Search size={16} aria-hidden="true" /> <span className="hidden sm:inline">Buscar</span>
        </button>
      </form>

      {loading ? (
        <div role="status" aria-busy="true" className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden dark:divide-[#223354] dark:border-[#223354] dark:bg-[#101A2E]">
          <span className="sr-only">Cargando stands…</span>
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse bg-slate-100 dark:bg-[#16233D]" />)}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-5 text-sm font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          <p>{error}</p>
          <button type="button" onClick={() => void loadStands()} className="mt-3 underline underline-offset-2">Reintentar</button>
        </div>
      ) : stands?.items.length ? (
        <>
          <div className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden dark:divide-[#223354] dark:border-[#223354] dark:bg-[#101A2E]">
            {stands.items.map((stand) => (
              <Link
                key={stand.id}
                href={`/panel/expositores/${stand.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--expo-bg)] dark:hover:bg-[#16233D]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--expo-navy)] dark:text-[#F5F9FF]">{stand.displayName}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-[#B8C7E6]">{stand.company.displayName}</p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-[#B8C7E6]">
                    <MapPin size={12} /> {stand.boothCode}
                    {(stand as PanelStand).demoBlock && <span>· {(stand as PanelStand).demoBlock}</span>}
                    {stand.location?.zoneId && <span>· Zona {stand.location.zoneId}</span>}
                    {stand.location?.floorId && <span>· Piso {stand.location.floorId}</span>}
                    {stand.location && <span>· ({stand.location.x}, {stand.location.y})</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {stand.categories.map((category) => (
                    <span key={category.id} className="rounded-lg bg-[var(--expo-sky)] px-2 py-0.5 text-xs font-bold text-[var(--expo-navy)] dark:bg-[#16233D] dark:text-[#A9D0FF]">
                      {category.label}
                    </span>
                  ))}
                  {stand.featured && <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--expo-yellow)] px-2 py-0.5 text-xs font-black text-[var(--expo-navy)] dark:bg-[#FFCA35] dark:text-[#0B1220]"><Star size={12} fill="currentColor" /> Destacado</span>}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-[#B8C7E6]">
            <span>{stands.total === undefined ? `${stands.items.length} stands en esta página` : `${stands.total} stands`} · Página {stands.page}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="min-h-10 rounded-lg border border-[#d7e3f3] bg-white px-3.5 py-1.5 font-bold text-[#24436f] hover:bg-[#f4f8fd] disabled:opacity-40 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:hover:bg-[#1f3152]">Anterior</button>
              <button type="button" disabled={stands.items.length < PAGE_SIZE || (stands.total !== undefined && page * stands.limit >= stands.total)} onClick={() => setPage((current) => current + 1)} className="min-h-10 rounded-lg border border-[#d7e3f3] bg-white px-3.5 py-1.5 font-bold text-[#24436f] hover:bg-[#f4f8fd] disabled:opacity-40 dark:border-[#223354] dark:bg-[#16233D] dark:text-[#F5F9FF] dark:hover:bg-[#1f3152]">Siguiente</button>
            </div>
          </div>
        </>
      ) : (
        <div className="pixel-card px-6 py-12 text-center text-sm font-medium text-slate-500 dark:border-[#223354] dark:bg-[#101A2E] dark:text-[#B8C7E6]">
          No hay stands que coincidan con la búsqueda.
        </div>
      )}
    </>
  );
}

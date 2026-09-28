"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Search, Star } from "lucide-react";

import { listStands } from "@/lib/api/stands";
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
        description="Stands registrados en ExpoVia 2026, cargados desde el servicio de stands."
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
          className="min-w-0 flex-1 rounded-xl border-2 border-[var(--expo-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--expo-blue)]"
        />
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-blue)] px-4 py-2 text-sm font-black text-white shadow-[2px_2px_0_var(--expo-navy)]">
          <Search size={15} /> Buscar
        </button>
      </form>

      {loading ? (
        <div role="status" aria-busy="true" className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
          <span className="sr-only">Cargando stands…</span>
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse bg-slate-100" />)}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-5 text-sm font-bold text-rose-800">
          <p>{error}</p>
          <button type="button" onClick={() => void loadStands()} className="mt-3 underline underline-offset-2">Reintentar</button>
        </div>
      ) : stands?.items.length ? (
        <>
          <div className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
            {stands.items.map((stand) => (
              <Link
                key={stand.id}
                href={`/panel/expositores/${stand.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--expo-bg)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--expo-navy)]">{stand.displayName}</p>
                  <p className="truncate text-xs text-slate-500">{stand.company.displayName}</p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-xs text-slate-500">
                    <MapPin size={12} /> {stand.boothCode}
                    {stand.location?.zoneId && <span>· Zona {stand.location.zoneId}</span>}
                    {stand.location?.floorId && <span>· Piso {stand.location.floorId}</span>}
                    {stand.location && <span>· ({stand.location.x}, {stand.location.y})</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {stand.categories.map((category) => (
                    <span key={category.id} className="rounded-lg bg-[var(--expo-sky)] px-2 py-0.5 text-xs font-bold text-[var(--expo-navy)]">
                      {category.label}
                    </span>
                  ))}
                  {stand.featured && <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--expo-yellow)] px-2 py-0.5 text-xs font-black text-[var(--expo-navy)]"><Star size={12} fill="currentColor" /> Destacado</span>}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>{stands.total === undefined ? `${stands.items.length} stands en esta página` : `${stands.total} stands`} · Página {stands.page}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border-2 border-[var(--expo-line)] bg-white px-3 py-1.5 font-bold disabled:opacity-40">Anterior</button>
              <button type="button" disabled={stands.items.length < PAGE_SIZE || (stands.total !== undefined && page * stands.limit >= stands.total)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border-2 border-[var(--expo-line)] bg-white px-3 py-1.5 font-bold disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        </>
      ) : (
        <div className="pixel-card px-6 py-12 text-center text-sm font-medium text-slate-500">
          No hay stands que coincidan con la búsqueda.
        </div>
      )}
    </>
  );
}

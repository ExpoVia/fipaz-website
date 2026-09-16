"use client";

import { CalendarCheck, CheckCircle2, ExternalLink, Gift, Heart, MapPin, ScanLine, X } from "lucide-react";

import { PointsPill } from "@/components/pixel/PointsPill";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import type { DemoTab } from "@/config/navigation";
import { zones } from "@/data/demo-data";
import { getStandById } from "@/lib/demo-domain";
import { useDemoStore } from "@/store/demo-store";
import {
  selectFavoriteStandIds,
  selectSelectZone,
  selectSetActiveTab,
  selectStartNfcScan,
  selectToggleFavorite,
  selectVisitedStandIds,
} from "@/store/demo-selectors";

interface StandDetailScreenProps {
  standId: string;
  onClose: () => void;
  onNavigate?: (tab: DemoTab) => void;
}

/** Ficha detallada de un stand: info, favoritos y accesos a NFC/mapa. */
export function StandDetailScreen({ standId, onClose, onNavigate }: StandDetailScreenProps) {
  const stand = getStandById(standId);
  const favoriteStandIds = useDemoStore(selectFavoriteStandIds);
  const visitedStandIds = useDemoStore(selectVisitedStandIds);
  const toggleFavorite = useDemoStore(selectToggleFavorite);
  const startNfcScan = useDemoStore(selectStartNfcScan);
  const setActiveTab = useDemoStore(selectSetActiveTab);
  const selectZone = useDemoStore(selectSelectZone);

  if (!stand) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-slate-500">No encontramos este stand.</p>
        <button
          onClick={onClose}
          className="rounded-xl border-2 border-[var(--expo-blue)] px-6 font-bold text-[var(--expo-blue)]"
          style={{ minHeight: 44 }}
        >
          Cerrar
        </button>
      </div>
    );
  }

  const isFavorite = favoriteStandIds.includes(stand.id);
  const isVisited = visitedStandIds.includes(stand.id);
  const zone = zones.find((z) => z.id === stand.zoneId);

  function handleRegisterVisit() {
    if (isVisited) return;
    startNfcScan(stand!.id);
    setActiveTab("scan");
    onNavigate?.("scan");
    onClose();
  }

  function handleLocate() {
    selectZone(stand!.zoneId);
    setActiveTab("map");
    onNavigate?.("map");
    onClose();
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between gap-2 border-b-2 border-[var(--expo-line)] bg-white px-4 py-3">
        <button
          onClick={onClose}
          aria-label="Cerrar ficha de stand"
          className="flex size-9 items-center justify-center rounded-full border-2 border-[var(--expo-line)] text-[var(--expo-navy)]"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        <p className="pixel-label text-[var(--expo-purple)]">Ficha de stand</p>
        <button
          onClick={() => toggleFavorite(stand!.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="flex size-9 items-center justify-center rounded-full border-2 border-[var(--expo-line)]"
        >
          <Heart
            size={16}
            strokeWidth={2.5}
            className={isFavorite ? "fill-[var(--expo-pink)] text-[var(--expo-pink)]" : "text-slate-300"}
          />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <section className="pixel-panel relative overflow-hidden p-5 bg-[var(--expo-sky)] text-[var(--expo-navy)]">
          <span className="absolute -right-5 -top-5 size-24 rotate-12 border-8 border-white/30" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <StandCategoryBadge category={stand.category} className="bg-white/70" />
              <h1 className="mt-2 text-2xl font-black leading-tight">{stand.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold opacity-80">
                <MapPin size={13} aria-hidden="true" />
                {stand.boothCode} · {zone?.name ?? "Zona sin asignar"}
              </p>
            </div>
            <PointsPill points={stand.points} size="sm" />
          </div>

          {isVisited && (
            <div className="relative mt-4 flex items-center gap-2 rounded-xl border-2 border-[var(--expo-green)] bg-white/70 px-3 py-2">
              <CheckCircle2 size={16} className="text-[var(--expo-green)]" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-xs font-black">Ya visitaste este stand</span>
            </div>
          )}
        </section>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{stand.description}</p>

        {stand.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stand.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-[var(--expo-line)] bg-white px-2 py-0.5 text-xs font-bold text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {stand.activity && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-[var(--expo-line)] bg-white p-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] bg-[var(--expo-mint)] shadow-[2px_2px_0_var(--expo-navy)]"
              aria-hidden="true"
            >
              <CalendarCheck size={16} className="text-[var(--expo-navy)]" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[var(--expo-navy)]">
                Actividad destacada
              </p>
              <p className="mt-0.5 text-sm text-slate-600">{stand.activity}</p>
            </div>
          </div>
        )}

        {stand.promotion && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border-2 border-[var(--expo-yellow)] bg-[#fff8e1] p-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] shadow-[2px_2px_0_var(--expo-navy)]"
              aria-hidden="true"
            >
              <Gift size={16} className="text-[var(--expo-navy)]" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[var(--expo-navy)]">Promoción</p>
              <p className="mt-0.5 text-sm text-slate-600">{stand.promotion}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-[var(--expo-line)] bg-white p-4">
        <button
          onClick={handleRegisterVisit}
          disabled={isVisited}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-black transition-transform active:scale-95 ${
            isVisited
              ? "cursor-not-allowed border-[var(--expo-green)] bg-[var(--expo-green)]/10 text-[var(--expo-green)]"
              : "border-[var(--expo-navy)] bg-[var(--expo-blue)] text-white shadow-[4px_4px_0_var(--expo-navy)]"
          }`}
          style={{ minHeight: 44 }}
        >
          {isVisited ? (
            <>
              <CheckCircle2 size={18} strokeWidth={2.5} aria-hidden="true" />
              Visita registrada
            </>
          ) : (
            <>
              <ScanLine size={18} strokeWidth={2.5} aria-hidden="true" />
              Simular visita NFC
            </>
          )}
        </button>
        <button
          onClick={handleLocate}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--expo-navy)] px-4 py-3 text-sm font-bold text-[var(--expo-navy)] transition-transform active:scale-95"
          style={{ minHeight: 44 }}
        >
          <ExternalLink size={15} strokeWidth={2.5} aria-hidden="true" />
          Ver en el mapa
        </button>
      </div>
    </div>
  );
}

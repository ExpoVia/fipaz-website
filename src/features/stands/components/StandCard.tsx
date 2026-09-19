"use client";

import { CheckCircle2, Heart, MapPin } from "lucide-react";

import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import type { Stand } from "@/types/demo";

interface StandCardProps {
  stand: Stand;
  isFavorite: boolean;
  isVisited: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  className?: string;
}

/** Tarjeta compacta de stand reutilizada en Inicio, Explorar y Perfil (favoritos). */
export function StandCard({
  stand,
  isFavorite,
  isVisited,
  onOpen,
  onToggleFavorite,
  className = "",
}: StandCardProps) {
  return (
    <article className={`pixel-card relative flex min-w-0 flex-col gap-2 overflow-hidden p-3 text-left ${className}`}>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite ? `Quitar ${stand.name} de favoritos` : `Agregar ${stand.name} a favoritos`
        }
        className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-[1px_1px_0_var(--expo-navy)]"
      >
        <Heart
          size={15}
          strokeWidth={2}
          className={isFavorite ? "fill-[var(--expo-pink)] text-[var(--expo-pink)]" : "text-slate-300"}
        />
      </button>

      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden text-left">
        <div className="flex items-center justify-between gap-2 pr-8">
          <StandCategoryBadge category={stand.category} />
          {isVisited && (
            <CheckCircle2
              size={15}
              className="shrink-0 text-[var(--expo-green)]"
              strokeWidth={2.5}
              aria-label="Visitado"
            />
          )}
        </div>

        <div>
          <p className="truncate font-black leading-tight text-[var(--expo-navy)]">{stand.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={11} aria-hidden="true" />
            {stand.boothCode}
          </p>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{stand.description}</p>

        <span className="mt-auto inline-flex w-fit items-center rounded border border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-1.5 py-0.5 text-[0.65rem] font-black text-[var(--expo-navy)] shadow-[1px_1px_0_var(--expo-navy)]">
          +{stand.points} pts
        </span>
      </button>
    </article>
  );
}

"use client";

import Link from "next/link";

import { zones } from "@/data/demo-data";
import { usePanelStore } from "@/store/panel-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { PointsPill } from "@/components/pixel/PointsPill";
import { PanelPageHeader } from "./panel-page-header";

export function ExpositoresList() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const companies = usePanelStore((state) => state.companies);

  if (!hasHydrated) return null;

  return (
    <>
      <PanelPageHeader
        eyebrow="Organizador"
        title="Directorio de expositores"
        description="Todas las empresas que participan en ExpoVia 2026."
      />

      <div className="pixel-card divide-y divide-[var(--expo-line)] overflow-hidden">
        {companies.map((stand) => {
          const zone = zones.find((z) => z.id === stand.zoneId);
          return (
            <Link
              key={stand.id}
              href={`/panel/expositores/${stand.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--expo-bg)]"
            >
              <div>
                <p className="text-sm font-bold text-[var(--expo-navy)]">{stand.name}</p>
                <p className="font-mono text-xs text-slate-500">
                  Stand {stand.boothCode} · {zone?.name ?? stand.zoneId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StandCategoryBadge category={stand.category} />
                <PointsPill points={stand.points} size="sm" />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

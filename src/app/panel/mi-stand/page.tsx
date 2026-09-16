import type { Metadata } from "next";

import { zones, standsById } from "@/data/demo-data";
import { MOCK_EXHIBITOR_STAND_ID } from "@/data/panel-mock";
import { PanelPageHeader } from "@/components/panel";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { PointsPill } from "@/components/pixel/PointsPill";

export const metadata: Metadata = { title: "Mi stand" };

export default function MiStandPage() {
  const stand = standsById.get(MOCK_EXHIBITOR_STAND_ID);
  if (!stand) return null;

  const zone = zones.find((z) => z.id === stand.zoneId);

  return (
    <>
      <PanelPageHeader
        eyebrow="Mi stand"
        title="Perfil de marca"
        description="Así ven tu empresa los visitantes dentro de la app de ExpoVia."
      />

      <div className="pixel-card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[var(--expo-navy)]">{stand.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
              Stand {stand.boothCode} · {zone?.name ?? stand.zoneId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StandCategoryBadge category={stand.category} />
            <PointsPill points={stand.points} size="sm" />
          </div>
        </div>

        <p className="text-sm text-slate-700">{stand.description}</p>

        <div className="flex flex-wrap gap-2">
          {stand.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--expo-line)] bg-[var(--expo-bg)] px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {stand.activity && (
          <div className="rounded-xl border-2 border-[var(--expo-line)] p-3">
            <p className="pixel-label text-slate-500">Actividad programada</p>
            <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.activity}</p>
          </div>
        )}

        {stand.promotion && (
          <div className="rounded-xl border-2 border-[var(--expo-yellow)] bg-[var(--expo-yellow)]/15 p-3">
            <p className="pixel-label text-slate-500">Promoción vigente</p>
            <p className="mt-1 text-sm font-bold text-[var(--expo-navy)]">{stand.promotion}</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Datos de ejemplo — en la versión real este perfil se conecta a la cuenta de tu empresa.
      </p>
    </>
  );
}

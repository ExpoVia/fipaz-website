import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { standsById, zones } from "@/data/demo-data";
import { PanelPageHeader } from "@/components/panel";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { PointsPill } from "@/components/pixel/PointsPill";

export async function generateMetadata({
  params,
}: PageProps<"/panel/expositores/[standId]">): Promise<Metadata> {
  const { standId } = await params;
  const stand = standsById.get(standId);
  return { title: stand?.name ?? "Expositor" };
}

export default async function ExpositorDetailPage({
  params,
}: PageProps<"/panel/expositores/[standId]">) {
  const { standId } = await params;
  const stand = standsById.get(standId);
  if (!stand) notFound();

  const zone = zones.find((z) => z.id === stand.zoneId);

  return (
    <>
      <PanelPageHeader eyebrow="Expositor" title={stand.name} description={stand.description} />

      <div className="pixel-card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs font-bold text-slate-500">
            Stand {stand.boothCode} · {zone?.name ?? stand.zoneId}
          </p>
          <div className="flex items-center gap-2">
            <StandCategoryBadge category={stand.category} />
            <PointsPill points={stand.points} size="sm" />
          </div>
        </div>

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
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Vista de solo lectura para el equipo organizador.
      </p>
    </>
  );
}

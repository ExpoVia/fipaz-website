"use client";

import Link from "next/link";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { organizerApi, type MapVersion, type PublicEventMap } from "@/lib/api/organizer";
import { NoEventNotice, RemoteState, tokenColor, useOrganizerEvent } from "./organizer-event";
import { PanelPageHeader } from "./panel-page-header";

const STATUS_LABELS: Record<MapVersion["status"], string> = {
  draft: "Borrador",
  published: "Publicada",
  retired: "Retirada",
};

type Floor = PublicEventMap["floors"][number];

/** Celda de la tabla de versiones: fila "etiqueta · valor" en móvil, celda normal desde `md`. */
const CELL = "flex items-baseline justify-between gap-4 px-4 py-1.5 before:text-xs before:font-bold before:uppercase before:tracking-wide before:text-slate-500 before:content-[attr(data-label)] md:table-cell md:py-3 md:before:content-none";

function parseViewBox(viewBox: string | null): [number, number, number, number] {
  const parts = (viewBox ?? "").split(/[\s,]+/).map(Number);
  return parts.length === 4 && parts.every(Number.isFinite) ? [parts[0], parts[1], parts[2], parts[3]] : [0, 0, 1000, 700];
}

function FloorPreview({ floor }: { floor: Floor }) {
  const [minX, minY, width, height] = parseViewBox(floor.viewBox);
  return (
    <svg viewBox={`${minX} ${minY} ${width} ${height}`} role="img" aria-label={`Plano de ${floor.name}`} className="mx-auto h-auto w-full max-w-3xl rounded-xl border border-[#d9e5f5] bg-white">
      {floor.outline && <path d={floor.outline} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={3} />}
      {floor.zones.map((zone) => zone.path && (
        <path key={zone.id} d={zone.path} fill={tokenColor(zone.colorToken)} fillOpacity={0.25} stroke={tokenColor(zone.colorToken)} strokeWidth={2} />
      ))}
      {floor.stands.map((stand) => (
        <g key={stand.standId}>
          <circle cx={minX + stand.x * width} cy={minY + stand.y * height} r={10} fill="var(--expo-blue)" stroke="white" strokeWidth={3} />
          <text x={minX + stand.x * width} y={minY + stand.y * height - 16} textAnchor="middle" fontSize={18} fontWeight={800} fill="var(--expo-navy)">{stand.boothCode}</text>
        </g>
      ))}
    </svg>
  );
}

export function MapaEventoView() {
  const { eventId, eventName } = useOrganizerEvent();
  const mapData = useAsyncResource(`event-map:${eventId}`, async () => {
    if (!eventId) throw new Error("Sin evento");
    const [versions, published] = await Promise.all([
      organizerApi.getMapVersions(eventId),
      // Sin versión publicada el backend responde 404: se muestra solo la lista de versiones.
      organizerApi.getPublishedMap(eventId).catch(() => null),
    ]);
    return { versions: [...versions].sort((a, b) => b.version - a.version), published };
  });

  return (
    <>
      <PanelPageHeader eyebrow="Organizador" title="Mapa del evento" description={`Versiones del plano de ${eventName} y lo que ven hoy los visitantes.`} demo={false} />
      {!eventId ? <NoEventNotice /> : (
        <RemoteState resource={mapData} label="el mapa del evento">
          {({ versions, published }) => (
            <>
              <section className="pixel-card mb-6 overflow-hidden" aria-labelledby="versions-heading">
                <h2 id="versions-heading" className="px-4 pt-4 text-lg font-black text-[var(--expo-navy)]">Versiones del plano</h2>
                {versions.length === 0 ? <p className="p-4 text-sm text-slate-500">El evento aún no tiene versiones de mapa.</p> : (
                  <table className="mt-2 block w-full text-left text-sm md:table">
                    <thead className="hidden md:table-header-group">
                      <tr className="border-b border-[#e4ecf7] text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3 font-bold">Versión</th>
                        <th className="px-4 py-3 font-bold">Estado</th>
                        <th className="px-4 py-3 font-bold">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="block divide-y divide-[#e4ecf7] md:table-row-group">
                      {versions.map((version) => (
                        <tr key={version.id} className="block px-0 py-2 md:table-row md:py-0">
                          <td data-label="Versión" className={`${CELL} font-mono font-bold text-[var(--expo-navy)]`}>v{version.version}</td>
                          <td data-label="Estado" className={CELL}>{STATUS_LABELS[version.status]}</td>
                          <td data-label="Notas" className={`${CELL} text-slate-600`}>{version.notes ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {!published ? <p className="pixel-card p-5 text-sm text-slate-600">No hay una versión publicada: los visitantes todavía no ven ningún mapa.</p> : (
                <div className={`grid grid-cols-1 gap-4 ${published.floors.length > 1 ? "lg:grid-cols-2" : ""}`}>
                  {published.floors.map((floor) => (
                    <section key={floor.id} className="pixel-card flex flex-col gap-3 p-5" aria-label={floor.name}>
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-[var(--expo-navy)]">{floor.name}</h2>
                        <span className="font-mono text-xs font-black text-slate-500">{floor.stands.length} {floor.stands.length === 1 ? "stand ubicado" : "stands ubicados"}</span>
                      </div>
                      <FloorPreview floor={floor} />
                      <ul className="flex flex-wrap justify-center gap-2">
                        {floor.zones.map((zone) => (
                          <li key={zone.id} className="rounded-full px-2.5 py-1 text-xs font-bold text-[var(--expo-navy)]" style={{ background: `color-mix(in srgb, ${tokenColor(zone.colorToken)} 20%, white)` }}>
                            {zone.name}{zone.shortCode ? ` (${zone.shortCode})` : ""} · {floor.stands.filter((stand) => stand.zoneId === zone.id).length}
                          </li>
                        ))}
                        {floor.zones.length === 0 && <li className="text-xs text-slate-500">Sin zonas en este piso.</li>}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-slate-500">
                Nombres y códigos de zona se editan en <Link href="/panel/zonas-categorias" className="font-bold text-[var(--expo-blue)] underline">Zonas y categorías</Link>. El dibujo del plano y la ubicación de stands todavía no tienen editor en el panel.
              </p>
            </>
          )}
        </RemoteState>
      )}
    </>
  );
}

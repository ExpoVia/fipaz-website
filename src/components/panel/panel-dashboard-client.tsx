"use client";

import Link from "next/link";
import { Activity, Building2, ScanLine, Store, UsersRound, Zap } from "lucide-react";

import { categories, missions, zones } from "@/data/demo-data";
import { DEMO_FIXTURE } from "@/data/demo-fixture";
import { usePanelStore } from "@/store/panel-store";
import { getActivePanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { MetricCard } from "./metric-card";
import { PanelPageHeader } from "./panel-page-header";
import { useExhibitor } from "./exhibitor-context";
import { ExhibitorState } from "./exhibitor-state";

function ExpositorOverview() {
  const { company, stand, kpis, kpisError } = useExhibitor();

  return (
    <ExhibitorState requireStand={false}>
      <PanelPageHeader
        eyebrow="Resumen"
        title={`Hola, ${company?.displayName ?? "expositor"}`}
        description="Datos registrados para tu empresa en el evento."
        demo={false}
      />
      {kpis ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} demo={false} />
          <MetricCard label="Visitantes únicos" value={String(kpis.uniqueVisitors)} icon={UsersRound} demo={false} />
          <MetricCard label="Primeras visitas" value={String(kpis.firstVisits)} icon={Store} demo={false} />
          <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={Activity} demo={false} />
          <MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} demo={false} />
        </div>
      ) : <p role="status" className="text-sm text-slate-600">{kpisError ?? "Las métricas aparecerán cuando tu empresa tenga un stand asignado."}</p>}
      {stand && (
        <div className="pixel-card mt-6 flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--expo-navy)]">{stand.displayName}</h2>
            <span className="font-mono text-xs text-slate-500">{stand.boothCode}</span>
          </div>
          <p className="text-sm text-slate-600">{stand.description}</p>
          <Link href="/panel/mi-stand" className="mt-2 text-sm font-bold text-[var(--expo-blue)] hover:underline">
            Ver perfil completo del stand →
          </Link>
        </div>
      )}
      {!stand && <p className="pixel-card mt-6 p-5 text-sm text-slate-600">Tu empresa todavía no tiene un stand asignado en el evento.</p>}
    </ExhibitorState>
  );
}

function OrganizadorOverview() {
  const companies = usePanelStore((state) => state.companies);
  const featuredCompanies = companies.filter((company) => company.featured);

  return (
    <>
      <PanelPageHeader
        eyebrow="Resumen"
        title="Panorama del evento"
        description={`Vista consolidada de expositores, zonas y actividad de ${DEMO_FIXTURE.event.name}.`}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Expositores" value={String(companies.length)} icon={Building2} />
        <MetricCard label="Zonas" value={String(zones.length)} icon={Activity} />
        <MetricCard label="Categorías" value={String(categories.length)} icon={Zap} />
        <MetricCard label="Misiones activas" value={String(missions.length)} icon={UsersRound} />
      </div>
      <div className="pixel-card mt-6 p-5">
        <h2 className="text-lg font-black text-[var(--expo-navy)]">Expositores destacados</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {featuredCompanies.map((company) => (
            <li key={company.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-[var(--expo-navy)]">{company.name}</span>
              <StandCategoryBadge category={company.category} />
            </li>
          ))}
        </ul>
        <Link
          href="/panel/expositores"
          className="mt-3 inline-block text-sm font-bold text-[var(--expo-blue)] hover:underline"
        >
          Ver todos los expositores →
        </Link>
      </div>
      <section className="pixel-card mt-6 p-5" aria-labelledby="demo-fixture-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="demo-fixture-heading" className="text-lg font-black text-[var(--expo-navy)]">Stands del guion de demostración</h2>
            <p className="mt-1 text-sm text-slate-600">{DEMO_FIXTURE.mission.title}: {DEMO_FIXTURE.mission.description}</p>
          </div>
          <p className="rounded-lg border border-[var(--expo-blue)] bg-sky-50 px-3 py-2 text-xs font-bold text-[var(--expo-navy)]">
            {DEMO_FIXTURE.points.perNewVisit} puntos por visita nueva · {DEMO_FIXTURE.points.duplicateVisit} por duplicado
          </p>
        </div>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {DEMO_FIXTURE.stands.map((stand) => (
            <li key={stand.id} className="rounded-xl border border-[var(--expo-line)] bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-[var(--expo-navy)]">{stand.name}</h3>
                <span className="shrink-0 rounded bg-[var(--expo-sky)] px-2 py-1 text-xs font-bold text-[var(--expo-navy)]">
                  Bloque {stand.block} · {stand.boothCode}
                </span>
              </div>
              <StandCategoryBadge category={stand.category} />
              <p className="mt-1 text-sm text-slate-700">{stand.activity}</p>
              <p className="mt-2 text-xs text-slate-600">Promoción: {stand.promotion ?? "Sin promoción de ejemplo"}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function PanelDashboardClient() {
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  const authHydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const activePanel = useCompanyAuthStore((state) => getActivePanel(state.session));
  if (!authHydrated || !activePanel) return null;
  if (activePanel === "organizador" && !hasHydrated) return null;
  return activePanel === "expositor" ? <ExpositorOverview /> : <OrganizadorOverview />;
}

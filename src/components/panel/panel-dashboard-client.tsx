"use client";

import Link from "next/link";
import { Activity, Building2, ScanLine, Store, UsersRound, Zap } from "lucide-react";

import { categories, missions, zones } from "@/data/demo-data";
import { panelCheckIns, panelLeads, panelPromotions } from "@/data/panel-mock";
import { usePanelStore } from "@/store/panel-store";
import { StandCategoryBadge } from "@/components/pixel/StandCategoryBadge";
import { MetricCard } from "./metric-card";
import { PanelPageHeader } from "./panel-page-header";

function ExpositorOverview() {
  const activeCompanyId = usePanelStore((state) => state.activeCompanyId);
  const companies = usePanelStore((state) => state.companies);
  const stand = companies.find((company) => company.id === activeCompanyId);
  const checkIns = panelCheckIns.filter((c) => c.standId === activeCompanyId);
  const leads = panelLeads.filter((l) => l.standId === activeCompanyId);
  const activePromotion = panelPromotions.find(
    (promo) => promo.standId === activeCompanyId && promo.status === "activa",
  );

  return (
    <>
      <PanelPageHeader
        eyebrow="Resumen"
        title={`Hola, ${stand?.name ?? "expositor"}`}
        description="Así va tu participación en el evento hasta el momento."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Visitas NFC" value={String(checkIns.length)} icon={ScanLine} />
        <MetricCard label="Prospectos" value={String(leads.length)} icon={UsersRound} />
        <MetricCard
          label="Promoción activa"
          value={activePromotion ? activePromotion.discountLabel : "Ninguna"}
          icon={Zap}
          hint={activePromotion?.title}
        />
        <MetricCard label="Puntos por visita" value={String(stand?.points ?? 0)} icon={Store} />
      </div>
      {stand && (
        <div className="pixel-card mt-6 flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--expo-navy)]">{stand.name}</h2>
            <StandCategoryBadge category={stand.category} />
          </div>
          <p className="text-sm text-slate-600">{stand.description}</p>
          <Link href="/panel/mi-stand" className="mt-2 text-sm font-bold text-[var(--expo-blue)] hover:underline">
            Ver perfil completo del stand →
          </Link>
        </div>
      )}
    </>
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
        description="Vista consolidada de expositores, zonas y actividad de ExpoVia 2026."
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
    </>
  );
}

export function PanelDashboardClient() {
  const activeRole = usePanelStore((state) => state.activeRole);
  const hasHydrated = usePanelStore((state) => state.hasHydrated);
  if (!hasHydrated) return null;
  return activeRole === "expositor" ? <ExpositorOverview /> : <OrganizadorOverview />;
}

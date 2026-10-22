"use client";

import Link from "next/link";
import { Activity, ArrowRight, BarChart3, Building2, CalendarDays, Map, Pencil, ScanLine, Star, Store, UsersRound, Zap } from "lucide-react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { exhibitorApi, type StandCheckin } from "@/lib/api/exhibitor";
import { organizerApi } from "@/lib/api/organizer";
import { canEditCompany, getActivePanel } from "@/lib/panel-access";
import { useCompanyAuthStore } from "@/store/company-auth-store";
import { MetricCard } from "./metric-card";
import { PanelVisitsChart } from "./panel-visits-chart";
import { useExhibitor } from "./exhibitor-context";
import { ExhibitorState } from "./exhibitor-state";
import { NoEventNotice, RemoteState, useOrganizerEvent } from "./organizer-event";

function DashboardHero({ title, description, label, detail, href }: { title: string; description: string; label: string; detail: string; href: string }) {
  return (
    <section className="panel-hero mb-5 flex flex-col justify-between gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-end lg:px-9">
      <div className="max-w-2xl">
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#0878f9]">Tu espacio de trabajo</p>
        <h1 className="text-balance text-[clamp(2rem,3.2vw,3rem)] font-extrabold leading-[1.1] tracking-tight text-[#111b39]">{title}</h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[#536991] sm:text-base">{description}</p>
      </div>
      <Link href={href} className="flex min-w-[190px] shrink-0 items-center justify-between gap-4 rounded-2xl border border-[#deebfa] bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgb(38_88_145_/_8%)] transition-transform hover:-translate-y-0.5">
        <span><span className="block text-xs font-semibold text-[#6c7fa1]">{label}</span><span className="mt-1 block text-lg font-extrabold text-[#142146]">{detail}</span></span>
        <ArrowRight aria-hidden="true" className="h-5 w-5 text-[#0878f9]" />
      </Link>
    </section>
  );
}

const methodLabel: Record<StandCheckin["method"], string> = {
  nfc: "NFC", qr: "QR", manual: "Manual", system: "Sistema",
};

function RecentActivity({ visits, reload }: { visits: ReturnType<typeof useAsyncResource<StandCheckin[]>>; reload: () => void }) {
  return (
    <section className="panel-surface min-w-0 p-5 sm:p-6" aria-labelledby="recent-activity-title">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9]"><Activity aria-hidden="true" className="h-5 w-5" /></span><div><h2 id="recent-activity-title" className="text-lg font-extrabold text-[#172344]">Actividad reciente</h2><p className="text-xs text-[#7588a9]">Visitas confirmadas en el stand</p></div></div>
        <Link href="/panel/visitas" className="shrink-0 text-xs font-bold text-[#0878f9] hover:underline">Ver todas</Link>
      </div>
      {visits.status === "loading" && <p role="status" className="py-7 text-sm text-[#7184a6]">Cargando actividad…</p>}
      {visits.status === "error" && <div role="alert" className="py-5 text-sm text-rose-700">No se pudo cargar la actividad. <button type="button" onClick={reload} className="font-bold underline">Reintentar</button></div>}
      {visits.status === "success" && (visits.data.length === 0 ? <p className="py-7 text-sm text-[#7184a6]">Todavía no hay visitas registradas.</p> : <ul className="divide-y divide-[#edf1f8]">
        {visits.data.slice(0, 5).map((visit) => <li key={visit.id} className="flex items-center gap-3 py-3 first:pt-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9]"><ScanLine aria-hidden="true" className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[#1b2949]">Nuevo check-in</span><span className="block text-xs text-[#798baa]">Validado por {methodLabel[visit.method]}</span></span>
          <time dateTime={visit.acceptedAt} className="shrink-0 text-[11px] font-medium text-[#8495b3]">{new Date(visit.acceptedAt).toLocaleString("es-BO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time>
        </li>)}
      </ul>)}
    </section>
  );
}

function ExpositorOverview() {
  const { company, stand, kpis, kpisError } = useExhibitor();
  const editable = useCompanyAuthStore((state) => canEditCompany(state.session));
  const visits = useAsyncResource(`dashboard-visits:${stand?.id ?? "none"}`, () => stand ? exhibitorApi.getCheckins(stand.id) : Promise.resolve([]));

  return (
    <ExhibitorState requireStand={false}>
      <DashboardHero
        title={`Hola, ${company?.displayName ?? "expositor"}\u00A0👋`}
        description={`Consulta la actividad verificada de tu empresa${stand ? ` en ${stand.eventName}` : ""} y mantén tu stand al día.`}
        label={stand ? "Tu stand" : "Participación"}
        detail={stand ? `${stand.boothCode} · ${stand.status === "active" ? "Activo" : stand.status}` : "Sin stand asignado"}
        href={stand ? "/panel/mi-stand" : "/panel/empresa"}
      />
      {kpis ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 xl:grid-cols-5">
        <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} tone="blue" demo={false} hint="Visitas registradas" className="sm:col-span-2 xl:col-span-1" />
        <MetricCard label="Visitantes únicos" value={String(kpis.uniqueVisitors)} icon={UsersRound} tone="violet" demo={false} hint="Personas distintas" className="sm:col-span-2 xl:col-span-1" />
        <MetricCard label="Primeras visitas" value={String(kpis.firstVisits)} icon={Star} tone="amber" demo={false} hint="En tu empresa" className="sm:col-span-2 xl:col-span-1" />
        <MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} tone="rose" demo={false} hint="Confirmados" className="sm:col-span-3 xl:col-span-1" />
        <MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={Activity} tone="mint" demo={false} hint="Participación registrada" className="col-span-2 sm:col-span-3 xl:col-span-1" />
      </div> : <div role="status" className="panel-surface p-5 text-sm text-[#617599]">{kpisError ?? "Las métricas aparecerán cuando tu empresa tenga un stand asignado."}</div>}

      {stand && <>
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.85fr)]">
          <section className="panel-surface min-w-0 p-5 sm:p-6" aria-labelledby="visits-chart-title">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9]"><BarChart3 aria-hidden="true" className="h-5 w-5" /></span><div><h2 id="visits-chart-title" className="text-lg font-extrabold text-[#172344]">Visitas por día</h2><p className="text-xs text-[#7588a9]">Últimos 7 días · hasta 200 registros recientes</p></div></div>
              <span className="rounded-lg border border-[#e2eaf6] px-3 py-2 text-xs font-semibold text-[#60769e]">{stand.boothCode}</span>
            </div>
            {visits.status === "success" ? <PanelVisitsChart visits={visits.data} /> : visits.status === "loading" ? <p role="status" className="py-20 text-center text-sm text-[#7184a6]">Cargando visitas…</p> : <p role="alert" className="py-20 text-center text-sm text-rose-700">No se pudo cargar la gráfica. <button type="button" onClick={visits.reload} className="font-bold underline">Reintentar</button></p>}
          </section>
          <RecentActivity visits={visits} reload={visits.reload} />
        </div>
        <section className="panel-surface mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6" aria-label="Resumen del stand">
          <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dceeff,#f1f6ff_60%,#dce7ff)] text-[#0878f9] sm:w-32"><Store aria-hidden="true" className="h-12 w-12" strokeWidth={1.4} /></div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-extrabold text-[#172344]">{stand.displayName}</h2><span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-xs font-bold text-[#0878f9]">{stand.boothCode}</span></div><p className="mt-1 line-clamp-2 text-sm leading-5 text-[#64799e]">{stand.description || "Añade una descripción para que los visitantes conozcan tu stand."}</p>{stand.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{stand.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-[#f0f5fc] px-2.5 py-1 text-[11px] font-semibold text-[#5f759b]">{tag}</span>)}</div>}</div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[170px]"><Link href="/panel/mi-stand" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0878f9] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0067da]">Ver perfil del stand <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>{editable && <Link href="/panel/mi-stand/editar" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cadbf1] bg-white px-4 py-2.5 text-xs font-bold text-[#24436f] hover:bg-[#f4f8fd]"><Pencil aria-hidden="true" className="h-3.5 w-3.5" />Editar stand</Link>}</div>
        </section>
      </>}
      {!stand && <p className="panel-surface mt-4 p-5 text-sm text-[#617599]">Tu empresa está registrada. Cuando el organizador le asigne un stand, aparecerá aquí.</p>}
    </ExhibitorState>
  );
}

function OrganizadorOverview() {
  const { eventId, eventName } = useOrganizerEvent();
  const overview = useAsyncResource(`overview:${eventId}`, async () => {
    if (!eventId) throw new Error("Sin evento");
    const [kpis, companies] = await Promise.all([organizerApi.getKpis(eventId), organizerApi.getCompanies(eventId)]);
    return { kpis, companies };
  });

  return <>
    <DashboardHero title={`Panorama de ${eventName}`} description="Sigue los datos registrados del evento y accede a las herramientas de organización." label="Evento activo" detail={eventName} href="/panel/eventos" />
    {!eventId ? <NoEventNotice /> : <RemoteState resource={overview} label="el resumen del evento">{({ kpis, companies }) => <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Participantes" value={String(kpis.totalParticipants)} icon={UsersRound} tone="blue" demo={false} hint="Registrados" />
        <MetricCard label="Check-ins" value={String(kpis.totalCheckins)} icon={ScanLine} tone="violet" demo={false} hint="Confirmados" />
        <MetricCard label="Stands activos" value={String(kpis.activeStands)} icon={Store} tone="amber" demo={false} hint="Publicados" />
        <MetricCard label="Puntos emitidos" value={String(kpis.pointsIssued)} icon={Star} tone="mint" demo={false} hint="En el evento" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <section className="panel-surface p-5 sm:p-6" aria-labelledby="event-companies-title"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 id="event-companies-title" className="text-lg font-extrabold text-[#172344]">Empresas participantes</h2><p className="text-xs text-[#7588a9]">{companies.length} registradas en este evento</p></div><Link href="/panel/expositores" className="shrink-0 text-xs font-bold text-[#0878f9] hover:underline">Ver todas</Link></div>{companies.length === 0 ? <p className="py-8 text-sm text-[#7184a6]">Todavía no hay empresas inscritas.</p> : <ul className="divide-y divide-[#edf1f8]">{companies.slice(0, 6).map((company) => <li key={company.id} className="flex items-center gap-3 py-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0878f9]"><Building2 aria-hidden="true" className="h-5 w-5" /></span><span className="min-w-0 flex-1 truncate text-sm font-bold text-[#1b2949]">{company.displayName}</span><span className="text-xs text-[#788aab]">{company.standCount} {company.standCount === 1 ? "stand" : "stands"}</span></li>)}</ul>}</section>
        <section className="panel-surface p-5 sm:p-6" aria-labelledby="organizer-tools-title"><h2 id="organizer-tools-title" className="mb-5 text-lg font-extrabold text-[#172344]">Gestionar evento</h2><div className="space-y-2"><Link href="/panel/mapa-evento" className="flex items-center gap-3 rounded-xl bg-[#f4f8fe] p-3.5 text-sm font-bold text-[#284573] hover:bg-[#eaf3ff]"><Map aria-hidden="true" className="h-5 w-5 text-[#0878f9]" />Mapa y zonas <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></Link><Link href="/panel/gamificacion" className="flex items-center gap-3 rounded-xl bg-[#f4f8fe] p-3.5 text-sm font-bold text-[#284573] hover:bg-[#eaf3ff]"><Star aria-hidden="true" className="h-5 w-5 text-[#e6a109]" />Misiones y premios <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></Link><Link href="/panel/metricas-evento" className="flex items-center gap-3 rounded-xl bg-[#f4f8fe] p-3.5 text-sm font-bold text-[#284573] hover:bg-[#eaf3ff]"><CalendarDays aria-hidden="true" className="h-5 w-5 text-[#10a778]" />Métricas del evento <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></Link></div></section>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><MetricCard label="Visitas únicas a stands" value={String(kpis.uniqueVisits)} icon={Activity} tone="blue" demo={false} /><MetricCard label="Asistentes a actividades" value={String(kpis.activityAttendees)} icon={UsersRound} tone="mint" demo={false} /><MetricCard label="Canjes validados" value={String(kpis.redemptionsValidated)} icon={Zap} tone="rose" demo={false} className="col-span-2 sm:col-span-1" /></div>
    </>}</RemoteState>}
  </>;
}

export function PanelDashboardClient() {
  const authHydrated = useCompanyAuthStore((state) => state.hasHydrated);
  const activePanel = useCompanyAuthStore((state) => getActivePanel(state.session));
  if (!authHydrated || !activePanel) return null;
  return activePanel === "expositor" ? <ExpositorOverview /> : <OrganizadorOverview />;
}

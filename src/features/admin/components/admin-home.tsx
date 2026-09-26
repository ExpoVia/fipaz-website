import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Boxes, CalendarDays, Gift, Sparkles } from "lucide-react";

import { AdminPageHeader } from "@/components/admin";
import { adminRoutes } from "@/config/admin-routes";
import { API_MODE } from "@/lib/api/config";
import type { EventSummary, StandSummary } from "../admin-scope";

interface ModuleLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

function ModuleCard({ title, description, href, icon: Icon }: ModuleLink) {
  return (
    <Link
      href={href}
      className="pixel-card group flex items-start gap-4 p-4 transition-transform hover:-translate-y-0.5"
    >
      <span
        aria-hidden="true"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[var(--expo-navy)] bg-[var(--expo-yellow)] text-[var(--expo-navy)]"
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-black text-[var(--expo-navy)]">{title}</span>
        <span className="mt-0.5 block text-sm font-medium text-slate-600">{description}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="mt-1 h-5 w-5 shrink-0 text-[var(--expo-blue)] transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

interface AdminHomeProps {
  stand: StandSummary;
  event: EventSummary;
}

/** Punto de entrada del módulo: agrupa los accesos por stand y por evento. */
export function AdminHome({ stand, event }: AdminHomeProps) {
  return (
    <>
      <AdminPageHeader
        breadcrumbs={[{ label: "Administración" }]}
        title="Administración de tu participación"
        description="Configura las dinámicas, premios, inventario y actividades con las que los visitantes interactúan durante el evento."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="admin-stand-title">
          <p className="pixel-label text-[var(--expo-blue)]">Stand</p>
          <h2 id="admin-stand-title" className="mt-1 text-xl font-black text-[var(--expo-navy)]">
            {stand.name}
            {stand.boothCode && <span className="ml-2 font-mono text-sm text-slate-600">Stand {stand.boothCode}</span>}
          </h2>
          <div className="mt-4 grid gap-3">
            <ModuleCard
              title="Dinámicas"
              description="Trivias, juegos, escaneos QR y retos que suman puntos en tu stand."
              href={adminRoutes.dynamics(stand.id)}
              icon={Sparkles}
            />
            <ModuleCard
              title="Actividades y asistencia"
              description="Agenda de talleres y charlas, cupos y confirmación de asistentes."
              href={adminRoutes.activities(stand.id)}
              icon={CalendarDays}
            />
          </div>
        </section>

        <section aria-labelledby="admin-event-title">
          <p className="pixel-label text-[var(--expo-blue)]">Evento</p>
          <h2 id="admin-event-title" className="mt-1 text-xl font-black text-[var(--expo-navy)]">
            {event.name}
            {event.city && <span className="ml-2 text-sm font-bold text-slate-600">{event.city}</span>}
          </h2>
          <div className="mt-4 grid gap-3">
            <ModuleCard
              title="Premios"
              description="Catálogo de recompensas que los visitantes canjean con sus puntos."
              href={adminRoutes.rewards(event.id)}
              icon={Gift}
            />
            <ModuleCard
              title="Inventario"
              description="Stock físico, reservas, entregas y ajustes de cada premio."
              href={adminRoutes.inventory(event.id)}
              icon={Boxes}
            />
          </div>
        </section>
      </div>

      {API_MODE === "mock" && (
        <p className="mt-10 rounded-xl border-2 border-dashed border-[var(--expo-line)] bg-white p-4 text-sm font-medium text-slate-600">
          Estás en modo demostración: los datos son simulados y se conservan solo durante esta sesión del navegador.
          Puedes probar los estados de error y restablecer la información desde el menú lateral.
        </p>
      )}
    </>
  );
}

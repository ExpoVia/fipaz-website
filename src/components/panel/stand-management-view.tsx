"use client";

import Link from "next/link";
import { CalendarDays, ScanLine, Sparkles } from "lucide-react";

import { adminRoutes } from "@/config/admin-routes";
import { ExhibitorState } from "./exhibitor-state";
import { useExhibitor } from "./exhibitor-context";
import { PanelPageHeader } from "./panel-page-header";

export function StandManagementView() {
  const { stand } = useExhibitor();
  const links = stand ? [
    { href: adminRoutes.dynamics(stand.id), label: "Dinámicas", icon: Sparkles },
    { href: adminRoutes.activities(stand.id), label: "Actividades y asistencia", icon: CalendarDays },
    { href: adminRoutes.scan(stand.id), label: "Escáner QR", icon: ScanLine },
  ] : [];
  return (
    <ExhibitorState>
      <PanelPageHeader eyebrow="Gestión" title="Herramientas de mi stand" description="Trabaja sobre el stand asignado a tu empresa." demo={false} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="pixel-card flex items-center gap-3 p-5 text-sm font-black text-[var(--expo-navy)]"><Icon className="h-5 w-5 text-[var(--expo-blue)]" />{label}</Link>)}
      </div>
    </ExhibitorState>
  );
}

import type { LucideIcon } from "lucide-react";
import { Boxes, CalendarDays, Gift, LayoutDashboard, Sparkles } from "lucide-react";

import { adminRoutes } from "@/config/admin-routes";
import type { AdminScope } from "@/features/admin/admin-scope";

export interface AdminNavigationItem {
  id: string;
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Prefijos de ruta que también marcan este ítem como activo (p. ej. la asistencia cuelga de actividades). */
  activePrefixes: readonly string[];
}

/** Ítems del menú administrativo resueltos para el stand y evento actuales. */
export function getAdminNavigation({ standId, eventId }: AdminScope): AdminNavigationItem[] {
  return [
    {
      id: "resumen",
      href: adminRoutes.home(),
      label: "Resumen",
      description: "Accesos a todos los módulos",
      icon: LayoutDashboard,
      activePrefixes: [],
    },
    {
      id: "dinamicas",
      href: adminRoutes.dynamics(standId),
      label: "Dinámicas",
      description: "Juegos, trivias y retos del stand",
      icon: Sparkles,
      activePrefixes: [],
    },
    {
      id: "actividades",
      href: adminRoutes.activities(standId),
      label: "Actividades",
      description: "Agenda y asistencia del stand",
      icon: CalendarDays,
      activePrefixes: ["/admin/activities/"],
    },
    {
      id: "premios",
      href: adminRoutes.rewards(eventId),
      label: "Premios",
      description: "Catálogo de recompensas del evento",
      icon: Gift,
      activePrefixes: [],
    },
    {
      id: "inventario",
      href: adminRoutes.inventory(eventId),
      label: "Inventario",
      description: "Stock, reservas y ajustes",
      icon: Boxes,
      activePrefixes: [],
    },
  ];
}

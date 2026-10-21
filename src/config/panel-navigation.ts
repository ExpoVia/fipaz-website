import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Building2,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Map,
  QrCode,
  Settings2,
  ScanLine,
  Store,
  Trophy,
  Zap,
} from "lucide-react";

export type PanelRole = "expositor" | "organizador";

export interface PanelNavigationItem {
  id: string;
  role: PanelRole;
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const PANEL_NAVIGATION: readonly PanelNavigationItem[] = [
  // ─── Expositor ──────────────────────────────────────────────────────────
  {
    id: "expositor-resumen",
    role: "expositor",
    href: "/panel",
    label: "Resumen",
    description: "Vista general de tu participación en el evento",
    icon: LayoutDashboard,
  },
  {
    id: "expositor-mi-stand",
    role: "expositor",
    href: "/panel/mi-stand",
    label: "Mi stand",
    description: "Perfil de marca visible para los visitantes",
    icon: Store,
  },
  {
    id: "expositor-visitas",
    role: "expositor",
    href: "/panel/visitas",
    label: "Visitas verificadas",
    description: "Check-ins confirmados en tu stand",
    icon: ScanLine,
  },
  {
    id: "expositor-qr",
    role: "expositor",
    href: "/panel/mi-stand/qr",
    label: "QR de validación",
    description: "Genera y gestiona códigos QR para check-in",
    icon: QrCode,
  },
  {
    id: "expositor-promociones",
    role: "expositor",
    href: "/panel/promociones",
    label: "Promoción del stand",
    description: "Texto promocional publicado en tu stand",
    icon: Zap,
  },
  {
    id: "expositor-metricas",
    role: "expositor",
    href: "/panel/metricas-stand",
    label: "Métricas de mi stand",
    description: "Check-ins y visitantes medidos por el servidor",
    icon: BarChart3,
  },
  {
    id: "expositor-gestion",
    role: "expositor",
    href: "/panel/gestion",
    label: "Gestión del stand",
    description: "Dinámicas, actividades y escáner QR",
    icon: Settings2,
  },
  {
    id: "expositor-company-profile",
    role: "expositor",
    href: "/panel/empresa",
    label: "Perfil de empresa",
    description: "Datos públicos y configuración de tu empresa",
    icon: Building2,
  },
  // ─── Organizador ────────────────────────────────────────────────────────
  {
    id: "organizador-resumen",
    role: "organizador",
    href: "/panel",
    label: "Resumen",
    description: "Vista general del evento",
    icon: LayoutDashboard,
  },
  {
    id: "organizador-expositores",
    role: "organizador",
    href: "/panel/expositores",
    label: "Expositores",
    description: "Directorio de empresas participantes",
    icon: Building2,
  },
  {
    id: "organizador-mapa",
    role: "organizador",
    href: "/panel/mapa-evento",
    label: "Mapa del evento",
    description: "Versiones del plano y mapa publicado",
    icon: Map,
  },
  {
    id: "organizador-zonas",
    role: "organizador",
    href: "/panel/zonas-categorias",
    label: "Zonas y categorías",
    description: "Administración de pabellones y rubros",
    icon: LayoutGrid,
  },
  {
    id: "organizador-gamificacion",
    role: "organizador",
    href: "/panel/gamificacion",
    label: "Gamificación",
    description: "Misiones y recompensas del evento",
    icon: Trophy,
  },
  {
    id: "organizador-metricas",
    role: "organizador",
    href: "/panel/metricas-evento",
    label: "Métricas del evento",
    description: "Check-ins, puntos y ranking medidos por el servidor",
    icon: Activity,
  },
  {
    id: "organizador-eventos",
    role: "organizador",
    href: "/panel/eventos",
    label: "Eventos",
    description: "Eventos que administra tu cuenta",
    icon: Globe,
  },
] as const;

export function isPanelRole(value: string | null | undefined): value is PanelRole {
  return value === "expositor" || value === "organizador";
}

export function getPanelNavigationForRole(role: PanelRole): PanelNavigationItem[] {
  return PANEL_NAVIGATION.filter((item) => item.role === role);
}

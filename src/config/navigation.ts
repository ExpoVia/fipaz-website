import type { LucideIcon } from "lucide-react";
import { Compass, House, Map, ScanLine, Trophy, UserRound } from "lucide-react";

export type DemoTab =
  | "home"
  | "explore"
  | "map"
  | "scan"
  | "missions"
  | "profile";

export interface FeatureScreenProps {
  onNavigate?: (tab: DemoTab) => void;
}

export interface DemoNavigationItem {
  id: DemoTab;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Botón central elevado de la barra inferior (NFC). */
  featured?: boolean;
  /**
   * Dónde se muestra el acceso. `bar` (por defecto) va en la barra inferior;
   * `header` va en la barra superior. La barra inferior es simétrica: necesita
   * una cantidad par de pestañas a los lados del botón central.
   */
  placement?: "bar" | "header";
}

export const DEMO_NAVIGATION: readonly DemoNavigationItem[] = [
  {
    id: "home",
    label: "Inicio",
    shortLabel: "Inicio",
    title: "ExpoVia",
    description: "Resumen del evento y recomendaciones",
    icon: House,
  },
  {
    id: "explore",
    label: "Explorar",
    shortLabel: "Explorar",
    title: "Explorar",
    description: "Busca y filtra los stands de la feria",
    icon: Compass,
  },
  {
    id: "map",
    label: "Mapa",
    shortLabel: "Mapa",
    title: "Mapa de la feria",
    description: "Zonas, stands y puntos de interés",
    icon: Map,
  },
  {
    id: "scan",
    label: "Escanear NFC",
    shortLabel: "NFC",
    title: "Escanear NFC",
    description: "Registra una visita presencial simulada",
    icon: ScanLine,
    featured: true,
  },
  {
    id: "missions",
    label: "Misiones",
    shortLabel: "Misiones",
    title: "Misiones",
    description: "Completa recorridos y gana puntos",
    icon: Trophy,
  },
  {
    id: "profile",
    label: "Perfil",
    shortLabel: "Perfil",
    title: "Tu recorrido",
    description: "Puntos, favoritos y visitas recientes",
    icon: UserRound,
    placement: "header",
  },
] as const;

export const DEFAULT_DEMO_TAB: DemoTab = "home";

export function isDemoTab(value: string | null): value is DemoTab {
  return DEMO_NAVIGATION.some((item) => item.id === value);
}

export function getDemoNavigationItem(tab: DemoTab): DemoNavigationItem {
  return (
    DEMO_NAVIGATION.find((item) => item.id === tab) ?? DEMO_NAVIGATION[0]
  );
}

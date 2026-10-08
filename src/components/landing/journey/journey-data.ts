import { Gift, Map, Navigation, Search, Smartphone, Users } from "lucide-react";

export const journeyCopy = {
  eyebrow: "PRUEBA EL RECORRIDO · FEXPO",
  title: "Del descubrimiento a la conexión, en un solo recorrido.",
  accentWord: "conexión,",
  subtitle: "Explora cada paso y descubre cómo una visita se convierte en una oportunidad.",
};

export const journeySteps = [
  { id: "search", number: "01", title: "Buscar", color: "#1687E8", icon: Search, description: "Encuentra tu próxima oportunidad.", demoTitle: "Buscar empresas", demoDescription: "Encuentra expositores por categoría, nombre o rubro." },
  { id: "map", number: "02", title: "Ver mapa", color: "#8B4FC7", icon: Map, description: "Ubica cada stand en el recinto.", demoTitle: "Tu feria, en un mapa", demoDescription: "Ubica tu próximo destino y traza el recorrido." },
  { id: "route", number: "03", title: "Llegar", color: "#D86BAC", icon: Navigation, description: "Sigue el camino hasta tu destino.", demoTitle: "Ruta hacia tu destino", demoDescription: "Sigue la ruta paso a paso para llegar a tu stand de forma rápida y sencilla." },
  { id: "nfc", number: "04", title: "Tocar NFC", color: "#82D6BF", icon: Smartphone, description: "Acerca tu teléfono. Registra tu visita.", demoTitle: "Un toque, una visita", demoDescription: "Acerca el teléfono al punto del stand." },
  { id: "reward", number: "05", title: "Ganar", color: "#FFBD18", icon: Gift, description: "Completa misiones y suma puntos.", demoTitle: "Cada visita cuenta", demoDescription: "Explora la feria y completa una misión." },
  { id: "connect", number: "06", title: "Conectar", color: "#F27C68", icon: Users, description: "Guarda empresas y sigue en contacto.", demoTitle: "La conexión sigue", demoDescription: "Lleva tus descubrimientos contigo." },
] as const;

export type JourneyStepId = (typeof journeySteps)[number]["id"];
export type JourneyStep = (typeof journeySteps)[number];
export const journeyOverlayQuery = "(min-width: 1101px) and (min-height: 740px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

// Order matters: demoCompanies[1] is the default company for the map, route and later steps. `tags` feed the search demo
// (what a visitor might type besides the name), `tint` and `ink` colour the avatar.
export const demoCompanies = [
  { id: "andean", name: "Andean Tech", category: "Tecnología · Software", stand: "A-12", initials: "AT", tint: "#dcebfd", ink: "#1c5fb0", tags: ["tecnología", "software", "nube"] },
  { id: "innovacion", name: "Innovación Bolivia", category: "Hardware", stand: "B-04", initials: "IB", tint: "#ece2f8", ink: "#6d34a8", tags: ["tecnología", "dispositivos"] },
  { id: "nova", name: "Nova Labs", category: "IA y Datos", stand: "C-20", initials: "NL", tint: "#fbe2ed", ink: "#a8316a", tags: ["tecnología", "inteligencia artificial"] },
  { id: "pixel", name: "Pixel Forge", category: "Videojuegos · Gaming", stand: "A-05", initials: "PF", tint: "#fff0cf", ink: "#8a5d00", tags: ["tecnología", "gaming", "realidad virtual"] },
  { id: "verde", name: "Verde Energía", category: "Energía · Sostenibilidad", stand: "B-17", initials: "VE", tint: "#dcf3e6", ink: "#1d6b43", tags: ["energía", "solar", "sostenible"] },
  { id: "cobalto", name: "Cobalto Fintech", category: "Finanzas · Pagos", stand: "C-08", initials: "CF", tint: "#ffe5df", ink: "#a8412a", tags: ["finanzas", "pagos"] },
] as const;
export type DemoCompany = (typeof demoCompanies)[number];

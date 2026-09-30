import type {
  Activity,
  Category,
  DemoEvent,
  DemoNotification,
  Mission,
  Reward,
  Stand,
  Zone,
} from "@/types/demo";
import { DEMO_FIXTURE } from "@/data/demo-fixture";

// ─── Evento ───────────────────────────────────────────────────────────────────

export const demoEvent: DemoEvent = {
  id: DEMO_FIXTURE.event.id,
  name: DEMO_FIXTURE.event.name,
  city: DEMO_FIXTURE.event.city,
  startsAt: DEMO_FIXTURE.event.startsAt,
  endsAt: DEMO_FIXTURE.event.endsAt,
  isSimulated: true,
};

// ─── Categorías ───────────────────────────────────────────────────────────────

export const categories: readonly Category[] = [
  {
    id: "technology",
    label: "Tecnología",
    colorToken: "var(--expo-blue)",
  },
  {
    id: "health",
    label: "Salud",
    colorToken: "var(--expo-green)",
  },
  {
    id: "finance",
    label: "Finanzas",
    colorToken: "var(--expo-yellow)",
  },
  {
    id: "gastronomy",
    label: "Gastronomía",
    colorToken: "var(--expo-coral)",
  },
  {
    id: "education",
    label: "Educación",
    colorToken: "var(--expo-lilac)",
  },
  {
    id: "startups",
    label: "Startups",
    colorToken: "var(--expo-purple)",
  },
  {
    id: "other",
    label: "Otro",
    colorToken: "var(--expo-navy)",
  },
] as const;

// ─── Zonas ────────────────────────────────────────────────────────────────────

export const zones: readonly Zone[] = [
  {
    id: "zone-red",
    name: "Bloque Rojo",
    shortCode: "R",
    categoryIds: ["health"],
  },
  {
    id: "zone-blue",
    name: "Zona Azul — Innovación",
    shortCode: "A",
    categoryIds: ["technology", "startups"],
  },
  {
    id: "zone-green",
    name: "Bloque Verde",
    shortCode: "G",
    categoryIds: ["gastronomy"],
  },
  {
    id: "zone-yellow",
    name: "Bloque Amarillo",
    shortCode: "A/B",
    categoryIds: ["technology", "finance"],
  },
  {
    id: "zone-purple",
    name: "Zona Violeta — Conocimiento",
    shortCode: "D",
    categoryIds: ["education"],
  },
] as const;

// ─── Stands ───────────────────────────────────────────────────────────────────

export const stands: readonly Stand[] = [
  // Stands ficticios del guion FIPAZ y del catálogo general.
  DEMO_FIXTURE.stands[0],
  DEMO_FIXTURE.stands[1],
  {
    id: "stand-semilla-capital",
    name: "Semilla Capital",
    category: "finance",
    description: "Microcréditos digitales para emprendedores sin historial bancario.",
    zoneId: "zone-yellow",
    boothCode: "C-01",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["finanzas", "microcrédito", "inclusión"],
    promotion: "Simula tu crédito en 2 minutos",
    points: 50,
  },
  DEMO_FIXTURE.stands[2],
  {
    id: "stand-aula-nube",
    name: "Aula Nube",
    category: "education",
    description: "LMS accesible para escuelas rurales sin conexión permanente.",
    zoneId: "zone-purple",
    boothCode: "D-01",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["educación", "offline", "accesibilidad"],
    activity: "Taller de creación de contenido offline",
    points: 50,
    featured: true,
  },
  {
    id: "stand-chaski-robotics",
    name: "Chaski Robotics",
    category: "startups",
    description: "Drones de última milla para zonas de difícil acceso.",
    zoneId: "zone-blue",
    boothCode: "A-02",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["drones", "logística", "last-mile"],
    activity: "Vuelo de demostración en patio exterior",
    points: 50,
  },
  {
    id: "stand-pukara-data",
    name: "Pukara Data",
    category: "technology",
    description: "Análisis de datos agrícolas con sensores IoT y satélite.",
    zoneId: "zone-blue",
    boothCode: "A-03",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["IoT", "agricultura", "data"],
    promotion: "Primer mes de datos gratis",
    points: 50,
  },
  {
    id: "stand-inti-solar",
    name: "Inti Solar",
    category: "technology",
    description: "Paneles solares de bajo costo para comunidades rurales.",
    zoneId: "zone-blue",
    boothCode: "A-04",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["energía", "solar", "rural"],
    points: 50,
  },
  {
    id: "stand-verde-vida",
    name: "Verde Vida",
    category: "health",
    description: "Suplementos nutricionales a base de superalimentos bolivianos.",
    zoneId: "zone-green",
    boothCode: "B-03",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["salud", "nutrición", "superfoods"],
    promotion: "Kit de bienvenida por visita",
    points: 50,
  },
  {
    id: "stand-nexo-pagos",
    name: "Nexo Pagos",
    category: "finance",
    description: "Billetera digital interoperable para Bolivia y Perú.",
    zoneId: "zone-yellow",
    boothCode: "C-02",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["pagos", "fintech", "bilateral"],
    activity: "Transferencia de demostración con QR",
    points: 50,
  },
  {
    id: "stand-quipu-ed",
    name: "Quipu Ed",
    category: "education",
    description: "Plataforma de capacitación en habilidades digitales para adultos.",
    zoneId: "zone-purple",
    boothCode: "D-02",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["educación", "adultos", "digital skills"],
    points: 50,
  },
  {
    id: "stand-wayra-connect",
    name: "Wayra Connect",
    category: "startups",
    description: "Internet satelital comunitario de baja latencia para el altiplano.",
    zoneId: "zone-blue",
    boothCode: "A-05",
    logoPath: "/assets/stands/placeholder.svg",
    tags: ["internet", "comunidades", "satélite"],
    activity: "Demo de velocidad en tiempo real",
    points: 50,
    featured: true,
  },
] as const;

// ─── Mapa de lookup stands (fuera del store para no duplicar catálogo) ─────────

export const standsById: ReadonlyMap<string, Stand> = new Map(
  stands.map((s) => [s.id, s])
);

// ─── Misiones ─────────────────────────────────────────────────────────────────

export const missions: readonly Mission[] = [
  {
    id: DEMO_FIXTURE.mission.id,
    title: DEMO_FIXTURE.mission.title,
    description: DEMO_FIXTURE.mission.description,
    standIds: [...DEMO_FIXTURE.mission.standIds],
    requiredVisits: DEMO_FIXTURE.mission.requiredVisits,
    rewardId: "reward-explorer-badge",
    featured: true,
  },
  {
    id: "mission-tech-pioneer",
    title: "Pionero Tecnológico",
    description:
      "Conoce todas las soluciones de tecnología presentes en la feria.",
    standIds: [
      "stand-altura-labs",
      "stand-pukara-data",
      "stand-inti-solar",
      "stand-wayra-connect",
    ],
    requiredVisits: 4,
    rewardId: "reward-tech-pin",
  },
  {
    id: "mission-health-champion",
    title: "Campeón de Salud",
    description: "Descubre las propuestas de bienestar y salud en ExpoVia.",
    standIds: ["stand-kawsay-salud", "stand-verde-vida"],
    requiredVisits: 2,
    rewardId: "reward-wellness-voucher",
  },
  {
    id: "mission-finance-guru",
    title: "Gurú Financiero",
    description: "Explora el ecosistema fintech e inclusión financiera.",
    standIds: ["stand-semilla-capital", "stand-nexo-pagos"],
    requiredVisits: 2,
    rewardId: "reward-finance-guide",
  },
  {
    id: "mission-food-lover",
    title: "Amante de la Gastronomía",
    description: "Vive la experiencia gastronómica boliviana.",
    standIds: ["stand-sabor-andino"],
    requiredVisits: 1,
    rewardId: "reward-gastro-voucher",
  },
  {
    id: "mission-knowledge-seeker",
    title: "Buscador del Conocimiento",
    description: "Visita los stands educativos y potencia tus habilidades.",
    standIds: ["stand-aula-nube", "stand-quipu-ed"],
    requiredVisits: 2,
    rewardId: "reward-course-access",
  },
] as const;

// ─── Premios ──────────────────────────────────────────────────────────────────

export const rewards: readonly Reward[] = [
  {
    id: "reward-explorer-badge",
    name: "Insignia Explorador",
    description: "Propuesta de reconocimiento al completar la Ruta FIPAZ.",
    requiredPoints: 250,
  },
  {
    id: "reward-tech-pin",
    name: "Pin Tecnológico",
    description: "Propuesta de pin coleccionable ExpoVia Tech.",
    requiredPoints: 200,
  },
  {
    id: "reward-wellness-voucher",
    name: "Voucher Bienestar",
    description: "Propuesta de descuento en productos Verde Vida.",
    requiredPoints: 100,
  },
  {
    id: "reward-finance-guide",
    name: "Guía Fintech Bolivia",
    description: "Propuesta de guía digital del ecosistema financiero boliviano.",
    requiredPoints: 100,
  },
  {
    id: "reward-gastro-voucher",
    name: "Voucher Gastronómico",
    description: "Propuesta de cortesía gastronómica en Sabor Andino.",
    requiredPoints: 50,
  },
  {
    id: "reward-course-access",
    name: "Acceso Curso Digital",
    description: "Propuesta de acceso temporal a un curso de Quipu Ed.",
    requiredPoints: 100,
  },
] as const;

// ─── Actividades ──────────────────────────────────────────────────────────────

export const activities: readonly Activity[] = [
  {
    id: "activity-altura-demo",
    standId: "stand-altura-labs",
    title: "Demo en vivo de asistente de voz en quechua",
    startsAt: "2026-10-28T16:00:00-04:00",
  },
  {
    id: "activity-kawsay-check",
    standId: "stand-kawsay-salud",
    title: "Consulta rápida de bienestar",
    startsAt: "2026-10-28T11:00:00-04:00",
  },
  {
    id: "activity-aula-taller",
    standId: "stand-aula-nube",
    title: "Taller contenido offline",
    startsAt: "2026-09-10T14:00:00-04:00",
  },
  {
    id: "activity-chaski-vuelo",
    standId: "stand-chaski-robotics",
    title: "Vuelo de demostración",
    startsAt: "2026-09-11T10:30:00-04:00",
  },
  {
    id: "activity-sabor-degustacion",
    standId: "stand-sabor-andino",
    title: "Degustación de singani de altura",
    startsAt: "2026-10-28T11:00:00-04:00",
  },
  {
    id: "activity-nexo-transferencia",
    standId: "stand-nexo-pagos",
    title: "Demo de transferencia QR",
    startsAt: "2026-09-12T09:00:00-04:00",
  },
] as const;

// ─── Notificaciones ───────────────────────────────────────────────────────────

export const notifications: readonly DemoNotification[] = [
  {
    id: "notif-welcome",
    title: "¡Bienvenido a ExpoVia 2026!",
    message:
      "Escanea stands con NFC para ganar puntos y completar misiones.",
    createdAt: "2026-09-10T09:00:00-04:00",
  },
  {
    id: "notif-chaski-flight",
    title: "Vuelo de drones — Zona Azul",
    message:
      "Chaski Robotics hará una demostración de vuelo hoy a las 10:30.",
    createdAt: "2026-09-11T09:30:00-04:00",
  },
  {
    id: "notif-last-chance",
    title: "Última jornada",
    message:
      "Hoy es el último día. ¡Completa tus misiones antes de las 20:00!",
    createdAt: "2026-09-12T08:00:00-04:00",
  },
] as const;

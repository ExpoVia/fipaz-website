import type { Stand } from "@/types/demo";

/** Contrato local de contenido para alinear las superficies de demostración. */
export const DEMO_FIXTURE = {
  event: {
    id: "event-fipaz-2026",
    name: "FIPAZ 2026",
    city: "La Paz, Bolivia",
    venue: "Campo Ferial Chuquiago Marka",
    startsAt: "2026-10-28T09:00:00-04:00",
    endsAt: "2026-11-08T21:00:00-04:00",
    dateLabel: "28 oct – 8 nov 2026 (ejemplo)",
    dateStatus: "Fechas sujetas a confirmación",
    venueStatus: "Recinto sujeto a confirmación",
  },
  points: {
    perNewVisit: 50,
    duplicateVisit: 0,
  },
  mission: {
    id: "explorador-expovia",
    title: "Ruta FIPAZ",
    description:
      "Visita Altura Labs, Kawsay Salud y Sabor Andino. Cada stand distinto cuenta una sola vez.",
    standIds: ["stand-altura-labs", "stand-kawsay-salud", "stand-sabor-andino"],
    requiredVisits: 3,
  },
  stands: [
    {
      id: "stand-altura-labs",
      name: "Altura Labs",
      boothCode: "B-117",
      block: "B",
      category: "technology",
      description:
        "Plataforma de desarrollo de apps móviles con IA para el mercado andino.",
      zoneId: "zone-yellow",
      logoPath: "/assets/stands/placeholder.svg",
      tags: ["IA", "apps", "móvil"],
      activity: "Demo en vivo de asistente de voz en quechua · 16:00",
      promotion: "30 % de descuento en plan Starter",
      points: 50,
      featured: true,
    },
    {
      id: "stand-kawsay-salud",
      name: "Kawsay Salud",
      boothCode: "R-24",
      block: "R",
      category: "health",
      description:
        "Telemedicina rural con diagnóstico asistido por imágenes médicas.",
      zoneId: "zone-red",
      logoPath: "/assets/stands/placeholder.svg",
      tags: ["salud", "telemedicina", "rural"],
      activity: "Consulta rápida de bienestar",
      promotion: "Control de presión sin costo",
      points: 50,
      featured: true,
    },
    {
      id: "stand-sabor-andino",
      name: "Sabor Andino",
      boothCode: "G-08",
      block: "G",
      category: "gastronomy",
      description:
        "Cocina fusión de alta gama con ingredientes de origen boliviano.",
      zoneId: "zone-green",
      logoPath: "/assets/stands/placeholder.svg",
      tags: ["gastronomía", "fusión", "Bolivia"],
      activity: "Degustación de singani de altura",
      promotion: "Degustación 11:00 a 13:00",
      points: 50,
    },
  ] satisfies readonly Stand[],
} as const;

export const DEMO_FIXTURE_STANDS = DEMO_FIXTURE.stands;

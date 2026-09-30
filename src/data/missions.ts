import type { Mission } from "@/lib/types";
import { DEMO_FIXTURE } from "@/data/demo-fixture";

export const MISSIONS: Mission[] = [
  // ── VISIBLES (8) ─────────────────────────────────────────────────────────

  {
    id: "primer-contacto",
    title: "Primer contacto",
    shortDescription: "Visita un stand con NFC",
    fullDescription:
      "Da el primer paso. Acércate a cualquier stand que tenga placa NFC, registra tu visita y gana tus primeros puntos ExpoVia.",
    category: "general",
    target: 1,
    rewardPoints: 50,
    standIds: ["stand-a1"],
    emoji: "nfc",
    color: "bg-sky-100",
    accentColor: "text-[var(--expo-blue)]",
  },
  {
    id: "ruta-tecnologica",
    title: "Ruta tecnológica",
    shortDescription: "Visita 3 stands de Tecnología",
    fullDescription:
      "Recorre el sector de innovación y descubre las empresas tecnológicas que están transformando Bolivia. Visita 3 stands del área Tecnología.",
    category: "tecnologia",
    target: 3,
    rewardPoints: 150,
    standIds: ["stand-a1", "stand-a2", "stand-a3"],
    emoji: "cpu",
    color: "bg-blue-100",
    accentColor: "text-[var(--expo-blue)]",
  },
  {
    id: DEMO_FIXTURE.mission.id,
    title: DEMO_FIXTURE.mission.title,
    shortDescription: "Visita los tres stands de ejemplo",
    fullDescription:
      DEMO_FIXTURE.mission.description,
    category: "general",
    target: DEMO_FIXTURE.mission.requiredVisits,
    rewardPoints: 0,
    standIds: [...DEMO_FIXTURE.mission.standIds],
    emoji: "map",
    color: "bg-green-100",
    accentColor: "text-[var(--expo-green)]",
  },
  {
    id: "sabores-feria",
    title: "Sabores de la feria",
    shortDescription: "Visita 2 stands gastronómicos",
    fullDescription:
      "La feria también se disfruta con el paladar. Pásate por los stands de gastronomía, conoce lo que ofrecen y regístrate con NFC.",
    category: "gastronomia",
    target: 2,
    rewardPoints: 100,
    standIds: ["stand-g1", "stand-g2"],
    emoji: "utensils",
    color: "bg-orange-100",
    accentColor: "text-[var(--expo-coral)]",
  },
  {
    id: "agenda-activa",
    title: "Agenda activa",
    shortDescription: "Abre una actividad destacada",
    fullDescription:
      "Las charlas y actividades de la feria son parte de la experiencia. Abre el detalle de una actividad destacada en tu pantalla de Inicio.",
    category: "general",
    target: 1,
    rewardPoints: 25,
    specialAction: "agenda",
    emoji: "calendar",
    color: "bg-yellow-100",
    accentColor: "text-[var(--expo-yellow)]",
  },
  {
    id: "red-finanzas",
    title: "Red de Finanzas",
    shortDescription: "Visita 3 stands del sector financiero",
    fullDescription:
      "Conoce a los actores del ecosistema financiero de Bolivia. Visita stands de bancos, fintech y servicios financieros presentes en la feria y descubre sus propuestas.",
    category: "finanzas",
    target: 3,
    rewardPoints: 150,
    standIds: ["stand-f1", "stand-f2", "stand-f3"],
    emoji: "banknote",
    color: "bg-yellow-50",
    accentColor: "text-[var(--expo-yellow)]",
  },
  {
    id: "embajador-expovia",
    title: "Embajador ExpoVia",
    shortDescription: "Comparte tu pasaporte en redes",
    fullDescription:
      "Comparte el pasaporte digital de ejemplo de ExpoVia y muestra tu recorrido simulado por FIPAZ 2026.",
    category: "general",
    target: 1,
    specialAction: "share",
    rewardPoints: 100,
    emoji: "share",
    color: "bg-purple-100",
    accentColor: "text-[var(--expo-purple)]",
  },
  {
    id: "selfie-stand",
    title: "Selfie con el stand",
    shortDescription: "Saca una foto en tu stand favorito",
    fullDescription:
      "Congela el momento. Entra al perfil de tu stand favorito, activa la cámara y saca una foto de recuerdo. Tu visita quedará marcada con una estrella especial.",
    category: "general",
    target: 1,
    specialAction: "selfie",
    rewardPoints: 75,
    emoji: "camera",
    color: "bg-pink-100",
    accentColor: "text-[var(--expo-pink)]",
  },

  // ── BLOQUEADAS — se desbloquean al completar otra misión ──────────────────

  {
    id: "maestro-mapa",
    title: "Maestro del Mapa",
    shortDescription: "Encuentra stands en distintos bloques",
    fullDescription:
      "Demuestra que dominas la feria. Usa el mapa interactivo para localizar y visitar 3 stands ubicados en bloques diferentes. Rojo, Amarillo y Verde te esperan.",
    category: "general",
    target: 3,
    rewardPoints: 200,
    standIds: ["stand-a1", "stand-b2", "stand-c1"],
    unlockedBy: "primer-contacto",
    emoji: "mappin",
    color: "bg-teal-100",
    accentColor: "text-[var(--expo-mint)]",
  },
  {
    id: "ruta-startups",
    title: "Galaxia Startups",
    shortDescription: "Visita 3 stands de emprendimientos",
    fullDescription:
      "Las ideas que cambiarán Bolivia están aquí. Visita 3 stands del sector Startups y conecta con los emprendedores que construyen el futuro.",
    category: "startups",
    target: 3,
    rewardPoints: 175,
    standIds: ["stand-s1", "stand-s2", "stand-s3"],
    unlockedBy: "explorador-expovia",
    emoji: "rocket",
    color: "bg-green-50",
    accentColor: "text-[var(--expo-green)]",
  },
];

export const INITIAL_VISIBLE_MISSION_IDS = MISSIONS.slice(0, 8).map((m) => m.id);

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

/** Friendly label for each stand demo ID */
export const STAND_NAMES: Record<string, string> = {
  "stand-altura-labs": `${DEMO_FIXTURE.stands[0].name} · Stand ${DEMO_FIXTURE.stands[0].boothCode}`,
  "stand-kawsay-salud": `${DEMO_FIXTURE.stands[1].name} · Stand ${DEMO_FIXTURE.stands[1].boothCode}`,
  "stand-sabor-andino": `${DEMO_FIXTURE.stands[2].name} · Stand ${DEMO_FIXTURE.stands[2].boothCode}`,
  "stand-a1": "TechBolivia · Stand A-01",
  "stand-a2": "InnovaLab · Stand A-02",
  "stand-a3": "SoftPaz · Stand A-03",
  "stand-b1": "BioMed Solutions · Stand B-01",
  "stand-b2": "EduTech Bolivia · Stand B-02",
  "stand-c1": "Sabores Andinos · Stand C-01",
  "stand-c2": "FoodieLab · Stand C-02",
  "stand-g1": "Café Illimani · Stand G-01",
  "stand-g2": "Delicias del Altiplano · Stand G-02",
  "stand-f1": "BancoSur Digital · Stand F-01",
  "stand-f2": "FinTech Paceña · Stand F-02",
  "stand-f3": "Coop Horizonte · Stand F-03",
  "stand-s1": "StartupNest · Stand S-01",
  "stand-s2": "VentureHub Bolivia · Stand S-02",
  "stand-s3": "LaunchPad Lpz · Stand S-03",
};

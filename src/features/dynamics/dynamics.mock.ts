import { createMockCollection } from "@/lib/mock/mock-collection";
import { ADMIN_DEFAULT_STAND_ID } from "@/features/admin/admin-scope";
import type { Dynamic } from "./types";

const STAND_ID = ADMIN_DEFAULT_STAND_ID;

/** Datos semilla: cubren todos los tipos y estados para probar filtros y badges. */
function createDynamicsSeed(): Dynamic[] {
  return [
    {
      id: "dyn-001",
      standId: STAND_ID,
      name: "Trivia Andina Tech",
      description: "Diez preguntas rápidas sobre innovación y tecnología en Bolivia. Suma puntos por cada acierto.",
      type: "trivia",
      points: 30,
      status: "active",
      createdAt: "2026-09-08T09:15:00-04:00",
      updatedAt: "2026-09-08T09:15:00-04:00",
    },
    {
      id: "dyn-002",
      standId: STAND_ID,
      name: "Caza del código QR",
      description: "Encuentra los códigos escondidos en el stand y escanéalos con tu teléfono.",
      type: "qr_scan",
      points: 20,
      status: "active",
      createdAt: "2026-09-08T10:40:00-04:00",
      updatedAt: "2026-09-09T08:05:00-04:00",
    },
    {
      id: "dyn-003",
      standId: STAND_ID,
      name: "Reto de automatización",
      description: "Arma un flujo de trabajo automatizado en menos de tres minutos.",
      type: "game",
      points: 50,
      status: "inactive",
      createdAt: "2026-09-08T11:20:00-04:00",
      updatedAt: "2026-09-09T08:10:00-04:00",
    },
    {
      id: "dyn-004",
      standId: STAND_ID,
      name: "Encuesta de innovación",
      description: "Cuéntanos qué herramientas digitales usa tu empresa hoy.",
      type: "survey",
      points: 10,
      status: "active",
      createdAt: "2026-09-08T14:00:00-04:00",
      updatedAt: "2026-09-08T14:00:00-04:00",
    },
    {
      id: "dyn-005",
      standId: STAND_ID,
      name: "Registro de prospectos",
      description: "Deja tus datos para recibir una demo personalizada de Altura Labs.",
      type: "registration",
      points: 15,
      status: "active",
      createdAt: "2026-09-09T09:30:00-04:00",
      updatedAt: "2026-09-09T09:30:00-04:00",
    },
    {
      id: "dyn-006",
      standId: STAND_ID,
      name: "Demo guiada en vivo",
      type: "activity",
      points: 40,
      status: "active",
      createdAt: "2026-09-09T10:10:00-04:00",
      updatedAt: "2026-09-09T10:10:00-04:00",
    },
    {
      id: "dyn-007",
      standId: STAND_ID,
      name: "Misión especial ExpoVia",
      description: "Completa tres dinámicas del stand para desbloquear un bono de puntos.",
      type: "custom",
      points: 100,
      status: "inactive",
      createdAt: "2026-09-09T12:45:00-04:00",
      updatedAt: "2026-09-09T12:45:00-04:00",
    },
    {
      id: "dyn-008",
      standId: "stand-kawsay-salud",
      name: "Quiz de hábitos saludables",
      description: "Pon a prueba lo que sabes sobre bienestar y prevención.",
      type: "trivia",
      points: 25,
      status: "active",
      createdAt: "2026-09-08T09:00:00-04:00",
      updatedAt: "2026-09-08T09:00:00-04:00",
    },
    {
      id: "dyn-009",
      standId: "stand-kawsay-salud",
      name: "Control de presión gratuito",
      type: "activity",
      points: 15,
      status: "active",
      createdAt: "2026-09-08T09:30:00-04:00",
      updatedAt: "2026-09-08T09:30:00-04:00",
    },
  ];
}

export const dynamicsStore = createMockCollection<Dynamic>("dynamics", createDynamicsSeed);

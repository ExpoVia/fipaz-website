import { ADMIN_DEFAULT_STAND_ID } from "@/features/admin/admin-scope";
import { createMockCollection } from "@/lib/mock/mock-collection";
import { normalizeText } from "@/lib/text";
import type { Activity, ActivityStatus, AttendanceRecord } from "./types";

const STAND_ID = ADMIN_DEFAULT_STAND_ID;

const PEOPLE: ReadonlyArray<readonly [id: string, name: string]> = [
  ["usr-001", "Camila Rojas"],
  ["usr-002", "Marco Quispe"],
  ["usr-003", "Fátima Choque"],
  ["usr-004", "Diego Mamani"],
  ["usr-005", "Lucía Fernández"],
  ["usr-006", "Sebastián Condori"],
  ["usr-007", "Valeria Aliaga"],
  ["usr-008", "Andrés Copa"],
  ["usr-009", "Noelia Vargas"],
  ["usr-010", "Rodrigo Flores"],
  ["usr-011", "Daniela Poma"],
  ["usr-012", "Gabriel Nina"],
  ["usr-013", "Mariana Callisaya"],
  ["usr-014", "Kevin Huanca"],
  ["usr-015", "Paola Limachi"],
];

interface SeedActivity {
  id: string;
  standId: string;
  name: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  capacity: number;
  points: number;
  status: ActivityStatus;
  createdAt: string;
  /**
   * Un carácter por participante: R = registrado (sin asistencia), P = presente,
   * A = ausente, C = registro cancelado.
   */
  participants: string;
}

/** Datos semilla: distintos estados de actividad y de asistencia para probar filtros y badges. */
const SEEDS: SeedActivity[] = [
  {
    id: "act-001",
    standId: STAND_ID,
    name: "Taller de automatización con IA",
    description: "Aprende a automatizar tareas repetitivas de tu empresa con herramientas de inteligencia artificial.",
    date: "2026-09-10",
    startTime: "10:00",
    endTime: "11:30",
    capacity: 30,
    points: 40,
    status: "finished",
    createdAt: "2026-09-05T09:00:00-04:00",
    participants: "PPPPPAPPAPPPCPP",
  },
  {
    id: "act-002",
    standId: STAND_ID,
    name: "Demo en vivo: integraciones API",
    description: "Recorrido en vivo por las integraciones de Altura Labs con sistemas de facturación y logística.",
    date: "2026-09-11",
    startTime: "15:00",
    endTime: "16:00",
    capacity: 25,
    points: 30,
    status: "in_progress",
    createdAt: "2026-09-05T09:30:00-04:00",
    participants: "PPPRPRRAPRRC",
  },
  {
    id: "act-003",
    standId: STAND_ID,
    name: "Charla: IA para pymes bolivianas",
    description: "Casos reales de pymes que ya usan IA para vender más y reducir costos.",
    date: "2026-09-11",
    startTime: "17:00",
    endTime: "18:00",
    capacity: 40,
    points: 25,
    status: "scheduled",
    createdAt: "2026-09-06T10:00:00-04:00",
    participants: "RRRRRRRRRRRRRC",
  },
  {
    id: "act-004",
    standId: STAND_ID,
    name: "Networking de cierre",
    description: "Espacio abierto para conocer al equipo y a otras empresas del evento.",
    date: "2026-09-12",
    startTime: "18:30",
    endTime: "20:00",
    capacity: 20,
    points: 15,
    status: "scheduled",
    createdAt: "2026-09-06T10:30:00-04:00",
    participants: "RRRRRRRRRR",
  },
  {
    id: "act-005",
    standId: STAND_ID,
    name: "Sesión de preguntas con el equipo",
    description: "Preguntas y respuestas abiertas con el equipo técnico.",
    date: "2026-09-12",
    startTime: "12:00",
    endTime: "12:45",
    capacity: 30,
    points: 20,
    status: "cancelled",
    createdAt: "2026-09-06T11:00:00-04:00",
    participants: "RRRRRRRRRCC",
  },
  {
    id: "act-006",
    standId: STAND_ID,
    name: "Taller de prototipado rápido",
    description: "Borrador: falta confirmar sala y materiales.",
    date: "2026-09-12",
    startTime: "09:00",
    capacity: 50,
    points: 35,
    status: "draft",
    createdAt: "2026-09-07T08:00:00-04:00",
    participants: "",
  },
  {
    id: "act-007",
    standId: "stand-kawsay-salud",
    name: "Chequeo de bienestar",
    description: "Medición de presión, glucosa y recomendaciones de hábitos saludables.",
    date: "2026-09-10",
    startTime: "11:00",
    endTime: "13:00",
    capacity: 40,
    points: 20,
    status: "scheduled",
    createdAt: "2026-09-05T12:00:00-04:00",
    participants: "RRRRPPRR",
  },
];

function toEmail(name: string): string {
  return `${normalizeText(name).replace(/\s+/g, ".")}@example.com`;
}

/** Suma minutos a una hora `HH:mm` (sin pasar de las 23:59). */
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function buildAttendance(seed: SeedActivity, seedIndex: number): AttendanceRecord[] {
  return seed.participants.split("").map((code, index) => {
    // Cada actividad arranca en un punto distinto de la lista para variar los nombres.
    const [participantId, participantName] = PEOPLE[(index + seedIndex * 3) % PEOPLE.length];
    const present = code === "P";
    const absent = code === "A";
    const cancelled = code === "C";

    return {
      id: `${seed.id}-${participantId}`,
      activityId: seed.id,
      participantId,
      participantName,
      participantEmail: toEmail(participantName),
      registrationStatus: cancelled ? "cancelled" : "registered",
      attendanceStatus: present ? "present" : absent ? "absent" : "pending",
      registeredAt: `2026-09-0${8 + (index % 2)}T${String(10 + (index % 8)).padStart(2, "0")}:15:00-04:00`,
      arrivedAt: present ? `${seed.date}T${addMinutes(seed.startTime, (index * 2) % 25)}:00-04:00` : undefined,
      pointsAwarded: present ? seed.points : 0,
    };
  });
}

function createAttendanceSeed(): AttendanceRecord[] {
  return SEEDS.flatMap((seed, index) => buildAttendance(seed, index));
}

/** Los contadores de la actividad salen de los mismos registros de asistencia, para que coincidan. */
function createActivitiesSeed(): Activity[] {
  return SEEDS.map((seed, index) => {
    const records = buildAttendance(seed, index);
    return {
      id: seed.id,
      standId: seed.standId,
      name: seed.name,
      description: seed.description,
      date: seed.date,
      startTime: seed.startTime,
      endTime: seed.endTime,
      capacity: seed.capacity,
      points: seed.points,
      status: seed.status,
      createdAt: seed.createdAt,
      registered: records.filter((record) => record.registrationStatus === "registered").length,
      attendees: records.filter((record) => record.attendanceStatus === "present").length,
      updatedAt: seed.createdAt,
    };
  });
}

export const activitiesStore = createMockCollection<Activity>("activities", createActivitiesSeed);
export const attendanceStore = createMockCollection<AttendanceRecord>("attendance", createAttendanceSeed);

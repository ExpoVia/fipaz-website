import type { Dynamic, DynamicInput, DynamicType } from "@/features/dynamics/types";
import type { Activity, ActivityInput, ActivityStatus, AttendanceRecord } from "@/features/activities/types";
import type { RewardInput, RewardType, RewardWithStock } from "@/features/rewards/types";
import type { InventoryItem } from "@/features/inventory/types";

interface BackendDynamic {
  id: string;
  standId: string;
  title: string;
  description?: string | null;
  type: string;
  config?: Record<string, unknown>;
  pointsReward: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendActivity {
  id: string;
  standId: string | null;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  capacity?: number | null;
  registeredCount?: number;
  attendedCount?: number;
  pointsReward: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendAttendance {
  id: string;
  activityId: string;
  userId: string;
  status: string;
  registeredAt: string;
  attendedAt: string | null;
  pointsAwarded: number;
}

interface BackendReward {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  type: string;
  costPoints: number;
  imagePath?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  inventoryId?: string | null;
  onHand?: number;
  reserved?: number;
  available?: number;
  delivered?: number;
}

interface BackendInventory {
  id: string;
  eventId: string;
  rewardId: string;
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
  delivered: number;
  updatedAt: string;
  rewardName: string;
  rewardImagePath?: string | null;
  rewardActive: boolean;
}

const FALLBACK_DATE = "1970-01-01T00:00:00.000Z";
const EVENT_TIMEZONE = "America/La_Paz";

function localParts(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00-04:00`).toISOString();
}

function dynamicType(value: string, config?: Record<string, unknown>): DynamicType {
  if (config && typeof config.kind === "string" && ["trivia", "qr_scan", "registration", "activity"].includes(config.kind)) return config.kind as DynamicType;
  if (value === "challenge") return "trivia";
  if (value === "demo") return "activity";
  if (value === "survey" || value === "game") return value;
  return "custom";
}

export function fromDynamic(raw: BackendDynamic): Dynamic {
  return {
    id: raw.id, standId: raw.standId, name: raw.title, description: raw.description ?? undefined,
    type: dynamicType(raw.type, raw.config), points: raw.pointsReward,
    status: raw.isActive === false ? "inactive" : "active",
    createdAt: raw.createdAt ?? FALLBACK_DATE, updatedAt: raw.updatedAt ?? raw.createdAt ?? FALLBACK_DATE,
  };
}

export function toDynamic(input: DynamicInput) {
  const type = input.type === "trivia" ? "challenge" : input.type === "activity" ? "demo" :
    input.type === "game" || input.type === "survey" ? input.type : "custom";
  return {
    title: input.name, description: input.description ?? null, type,
    config: type === "custom" ? { kind: input.type } : {}, pointsReward: input.points,
    isActive: input.status === "active",
  };
}

function activityStatus(value: string): ActivityStatus {
  if (value === "completed") return "finished";
  if (value === "cancelled" || value === "draft") return value;
  return "scheduled";
}

export function fromActivity(raw: BackendActivity): Activity {
  const start = localParts(raw.startsAt);
  return {
    id: raw.id, standId: raw.standId ?? "", name: raw.title, description: raw.description ?? undefined,
    date: start.date, startTime: start.time,
    endTime: raw.endsAt ? localParts(raw.endsAt).time : undefined,
    capacity: raw.capacity ?? 0, registered: raw.registeredCount ?? 0,
    attendees: raw.attendedCount ?? 0, points: raw.pointsReward,
    status: activityStatus(raw.status),
    createdAt: raw.createdAt ?? FALLBACK_DATE, updatedAt: raw.updatedAt ?? raw.createdAt ?? FALLBACK_DATE,
  };
}

export function toActivity(input: ActivityInput) {
  return {
    title: input.name, description: input.description ?? null,
    startsAt: toIso(input.date, input.startTime),
    endsAt: input.endTime ? toIso(input.date, input.endTime) : null,
    capacity: input.capacity > 0 ? input.capacity : null,
    // El panel gestiona cupo y registrados; la base solo permite registrarse si esto es true.
    requiresRegistration: true,
    pointsReward: input.points,
    status: input.status === "finished" ? "completed" : input.status === "in_progress" ? "scheduled" : input.status,
  };
}

export function fromAttendance(raw: BackendAttendance): AttendanceRecord {
  return {
    id: raw.id, activityId: raw.activityId, participantId: raw.userId,
    participantName: `Visitante ${raw.userId.slice(0, 8)}`, participantEmail: "",
    registrationStatus: raw.status === "cancelled" ? "cancelled" : "registered",
    attendanceStatus: raw.status === "attended" ? "present" : "pending",
    registeredAt: raw.registeredAt, arrivedAt: raw.attendedAt ?? undefined,
    pointsAwarded: raw.pointsAwarded,
  };
}

function rewardType(value: string): RewardType {
  if (value === "badge" || value === "voucher" || value === "merch" || value === "experience" || value === "other") return value;
  if (value === "offer" || value === "promotion") return "voucher";
  if (value === "course") return "experience";
  return "other";
}

export function fromReward(raw: BackendReward): RewardWithStock {
  return {
    id: raw.id, eventId: raw.eventId, name: raw.name, description: raw.description ?? undefined,
    type: rewardType(raw.type), costPoints: raw.costPoints,
    imageUrl: raw.imagePath ?? undefined, status: raw.isActive ? "active" : "inactive",
    createdAt: raw.createdAt, updatedAt: raw.updatedAt,
    stock: raw.inventoryId ? { inventoryId: raw.inventoryId, onHand: raw.onHand ?? 0,
      reserved: raw.reserved ?? 0, available: raw.available ?? 0, delivered: raw.delivered ?? 0 } : null,
  };
}

export function toReward(input: RewardInput) {
  return {
    name: input.name, description: input.description ?? null,
    type: input.type === "product" ? "merch" : input.type,
    costPoints: input.costPoints, imagePath: input.imageUrl ?? null,
    isActive: input.status === "active",
  };
}

export function fromInventory(raw: BackendInventory): InventoryItem {
  return {
    id: raw.id, eventId: raw.eventId, rewardId: raw.rewardId, sku: raw.sku,
    onHand: raw.onHand, reserved: raw.reserved, available: raw.available,
    delivered: raw.delivered, updatedAt: raw.updatedAt,
    rewardName: raw.rewardName, rewardImageUrl: raw.rewardImagePath ?? undefined,
    rewardStatus: raw.rewardActive ? "active" : "inactive",
  };
}

export type { BackendDynamic, BackendActivity, BackendAttendance, BackendReward, BackendInventory };

import { z } from "zod";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/http-client";

const kpisSchema = z.object({
  activeStands: z.number(),
  pointsIssued: z.number(),
  uniqueVisits: z.number(),
  totalCheckins: z.number(),
  activityAttendees: z.number(),
  totalParticipants: z.number(),
  redemptionsValidated: z.number(),
});

const companySchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  displayName: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  standCount: z.number(),
});

const categorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  label: z.string(),
  colorToken: z.string().nullable(),
  sortOrder: z.number(),
});

const zoneSchema = z.object({
  id: z.string().uuid(),
  floorId: z.string().uuid(),
  name: z.string(),
  shortCode: z.string().nullable(),
  description: z.string().nullable(),
  colorToken: z.string().nullable(),
});

const floorSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  sortOrder: z.number(),
});

const mapVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.number(),
  status: z.enum(["draft", "published", "retired"]),
  notes: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

const publicMapSchema = z.object({
  version: z.number(),
  floors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    viewBox: z.string().nullable(),
    outline: z.string().nullable(),
    zones: z.array(z.object({
      id: z.string(),
      name: z.string(),
      shortCode: z.string().nullable(),
      colorToken: z.string().nullable(),
      path: z.string().nullable(),
    })),
    stands: z.array(z.object({
      standId: z.string(),
      boothCode: z.string(),
      displayName: z.string(),
      zoneId: z.string().nullable(),
      x: z.number(),
      y: z.number(),
    })),
  })),
});

export const MISSION_MODES = ["any_stand", "specific_stands", "categories", "special_action"] as const;

const missionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  mode: z.enum(MISSION_MODES),
  targetCount: z.number(),
  pointsReward: z.number(),
  isActive: z.boolean(),
  featured: z.boolean(),
});

const rewardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  costPoints: z.number(),
  isActive: z.boolean(),
});

const leaderboardSchema = z.object({
  position: z.number(),
  userId: z.string(),
  displayName: z.string().nullable(),
  rankingScore: z.number(),
  level: z.number(),
});

export type EventKpis = z.infer<typeof kpisSchema>;
export type EventCompany = z.infer<typeof companySchema>;
export type EventCategory = z.infer<typeof categorySchema>;
export type MapZone = z.infer<typeof zoneSchema>;
export type MapFloor = z.infer<typeof floorSchema>;
export type MapVersion = z.infer<typeof mapVersionSchema>;
export type PublicEventMap = z.infer<typeof publicMapSchema>;
export type EventMission = z.infer<typeof missionSchema>;
export type MissionMode = EventMission["mode"];
export type EventReward = z.infer<typeof rewardSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardSchema>;

export interface FloorWithZones extends MapFloor {
  zones: MapZone[];
}

const eventPath = (eventId: string, path = "") => `/events/${encodeURIComponent(eventId)}${path}`;

/** "Zona Gastronómica" → "zona-gastronomica": el backend exige un slug por categoría. */
export function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const organizerApi = {
  async getKpis(eventId: string): Promise<EventKpis> {
    return kpisSchema.parse(await apiGet(eventPath(eventId, "/kpis")));
  },
  async getCompanies(eventId: string): Promise<EventCompany[]> {
    return z.array(companySchema).parse(await apiGet(eventPath(eventId, "/companies")));
  },
  async getCategories(eventId: string): Promise<EventCategory[]> {
    return z.array(categorySchema).parse(await apiGet(eventPath(eventId, "/categories")));
  },
  async createCategory(eventId: string, input: { label: string; colorToken: string | null }): Promise<EventCategory> {
    return categorySchema.parse(await apiPost(eventPath(eventId, "/categories"), { ...input, slug: slugify(input.label) }));
  },
  async updateCategory(eventId: string, categoryId: string, patch: { label?: string; colorToken?: string | null }): Promise<EventCategory> {
    return categorySchema.parse(await apiPatch(eventPath(eventId, `/categories/${encodeURIComponent(categoryId)}`), patch));
  },
  async deleteCategory(eventId: string, categoryId: string): Promise<void> {
    await apiDelete(eventPath(eventId, `/categories/${encodeURIComponent(categoryId)}`));
  },
  async getMapVersions(eventId: string): Promise<MapVersion[]> {
    return z.array(mapVersionSchema).parse(await apiGet(eventPath(eventId, "/map/versions")));
  },
  /** Pisos y zonas de una versión del mapa, en el orden del plano. */
  async getFloorsWithZones(eventId: string, versionId: string): Promise<FloorWithZones[]> {
    const floors = z.array(floorSchema).parse(await apiGet(eventPath(eventId, `/map/versions/${encodeURIComponent(versionId)}/floors`)));
    const sorted = [...floors].sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(sorted.map(async (floor) => ({
      ...floor,
      zones: z.array(zoneSchema).parse(await apiGet(eventPath(eventId, `/map/floors/${encodeURIComponent(floor.id)}/zones`))),
    })));
  },
  async updateZone(eventId: string, zoneId: string, patch: { name?: string; shortCode?: string | null; description?: string | null }): Promise<MapZone> {
    return zoneSchema.parse(await apiPatch(eventPath(eventId, `/map/zones/${encodeURIComponent(zoneId)}`), patch));
  },
  /** Mapa publicado tal como lo ven los visitantes (con stands ubicados). */
  async getPublishedMap(eventId: string): Promise<PublicEventMap> {
    return publicMapSchema.parse(await apiGet(eventPath(eventId, "/map")));
  },
  async getMissions(eventId: string): Promise<EventMission[]> {
    return z.array(missionSchema).parse(await apiGet(eventPath(eventId, "/missions")));
  },
  async createMission(eventId: string, input: {
    title: string;
    description: string | null;
    targetCount: number;
    pointsReward: number;
    categoryIds: string[];
  }): Promise<EventMission> {
    const { categoryIds, ...rest } = input;
    const body = categoryIds.length > 0 ? { ...rest, mode: "categories", categoryIds } : { ...rest, mode: "any_stand" };
    return missionSchema.parse(await apiPost(eventPath(eventId, "/missions"), body));
  },
  async setMissionActive(eventId: string, missionId: string, isActive: boolean): Promise<EventMission> {
    return missionSchema.parse(await apiPatch(eventPath(eventId, `/missions/${encodeURIComponent(missionId)}`), { isActive }));
  },
  async deleteMission(eventId: string, missionId: string): Promise<void> {
    await apiDelete(eventPath(eventId, `/missions/${encodeURIComponent(missionId)}`));
  },
  async getRewards(eventId: string): Promise<EventReward[]> {
    return z.array(rewardSchema).parse(await apiGet(eventPath(eventId, "/rewards")));
  },
  async getLeaderboard(eventId: string): Promise<LeaderboardEntry[]> {
    return z.array(leaderboardSchema).parse(await apiGet(eventPath(eventId, "/leaderboard")));
  },
};

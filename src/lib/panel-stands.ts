import { categories, zones } from "@/data/demo-data";
import { DEMO_FIXTURE } from "@/data/demo-fixture";
import { getStandById as getApiStand, listStands as listApiStands, StandsApiError } from "@/lib/api/stands";
import type { ListStandsQueryDto, StandListItemDto, StandResponseDto } from "@/types/stands-api";

/** Opt-in: backend errors never silently switch the panel to demo data. */
export const DEMO_PANEL_STANDS = process.env.NEXT_PUBLIC_DEMO_PANEL_STANDS === "true";

export type PanelStand = StandResponseDto & { demoBlock?: string };

const demoStands: (StandListItemDto & PanelStand)[] = DEMO_FIXTURE.stands.map((stand) => ({
  id: stand.id,
  boothCode: stand.boothCode,
  displayName: stand.name,
  description: stand.description,
  company: { id: `company-${stand.id}`, displayName: stand.name },
  categories: [{ id: stand.category, slug: stand.category, label: categories.find((item) => item.id === stand.category)!.label }],
  tags: [...stand.tags],
  featured: "featured" in stand && stand.featured === true,
  activityHighlight: stand.activity,
  promotionHighlight: stand.promotion,
  location: null,
  demoBlock: zones.find((zone) => zone.id === stand.zoneId)!.name,
  relevance: 1,
}));

export async function listStands(query: ListStandsQueryDto = {}) {
  if (!DEMO_PANEL_STANDS) return listApiStands(query);
  if ((query.query?.length ?? 0) > 100) throw new StandsApiError("La búsqueda no puede superar los 100 caracteres.");
  const text = query.query?.trim().toLocaleLowerCase() ?? "";
  const filtered = demoStands.filter((stand) =>
    `${stand.displayName} ${stand.boothCode} ${stand.tags.join(" ")}`.toLocaleLowerCase().includes(text)
    && (!query.categoryId || stand.categories.some((item) => item.id === query.categoryId))
    && (query.featured === undefined || stand.featured === query.featured)
    && (!query.zoneId || DEMO_FIXTURE.stands.find((item) => item.id === stand.id)?.zoneId === query.zoneId)
    && !query.floorId,
  );
  const page = Math.max(1, Math.trunc(query.page || 1));
  const limit = Math.max(1, Math.min(100, Math.trunc(query.limit || 20)));
  return { items: filtered.slice((page - 1) * limit, page * limit), page, limit, total: filtered.length };
}

export async function getStandById(id: string): Promise<PanelStand> {
  if (!DEMO_PANEL_STANDS) return getApiStand(id);
  const stand = demoStands.find((item) => item.id === id);
  if (!stand) throw new StandsApiError("Stand de demostración no encontrado.", 404);
  return stand;
}

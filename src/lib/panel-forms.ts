import { zones } from "@/data/demo-data";
import type { StandCategory, Zone } from "@/types/demo";
import type { ExhibitorProfile } from "@/types/panel";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

/** Genera un id único de empresa a partir del nombre, evitando colisiones con las existentes. */
export function createCompanyId(name: string, existing: readonly ExhibitorProfile[]): string {
  const base = `stand-${slugify(name) || "empresa"}`;
  if (!existing.some((company) => company.id === base)) return base;

  let suffix = 2;
  while (existing.some((company) => company.id === `${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

/** Asigna la zona cuyo rubro coincide con la categoría elegida (fallback: la primera zona). */
export function assignZoneForCategory(category: StandCategory): Zone {
  return zones.find((zone) => zone.categoryIds.includes(category)) ?? zones[0];
}

/** Genera el siguiente código de stand disponible dentro de una zona. */
export function generateBoothCode(zone: Zone, existing: readonly ExhibitorProfile[]): string {
  const countInZone = existing.filter((company) => company.zoneId === zone.id).length;
  return `${zone.shortCode}-${String(countInZone + 1).padStart(2, "0")}`;
}

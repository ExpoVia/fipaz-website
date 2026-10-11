import { expoStands } from "@/features/map/data/expoMapData";
import { STANDS } from "./catalog";

/** Apply the Expo demo catalog to existing numbered lots without changing geometry. */
export const mobileMapStands = expoStands.map((space) => {
  const stand = STANDS.find((item) => item.planId === space.planId && item.boothCode.replace(/^[A-Z]-/, "") === space.code);
  if (!stand) return space;
  return {
    ...space, id: stand.id, name: stand.name, shortName: stand.name, category: stand.category,
    summary: `${stand.description} Expositor ficticio; ubicación de demostración.`, demo: true,
    logoText: stand.name.split(" ").map((part) => part[0]).join(""),
  };
});

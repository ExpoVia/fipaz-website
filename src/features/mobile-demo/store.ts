"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import { STANDS } from "./catalog";
import { MISSIONS } from "./missions";
import { REWARDS } from "./rewards";

const savedSchema = z.object({
  visits: z.array(z.object({ standId: z.string(), at: z.string().datetime(), reference: z.string() })).max(6),
  favorites: z.array(z.string()).max(6), redeemed: z.array(z.string()).max(3),
  theme: z.enum(["system", "light", "dark"]), signedIn: z.boolean(),
});
type SavedState = z.infer<typeof savedSchema>;
interface MobileState extends SavedState {
  hydrated: boolean;
  visit: (id: string) => "confirmed" | "duplicate" | "invalid";
  toggleFavorite: (id: string) => void;
  redeem: (id: string) => boolean;
  setTheme: (theme: SavedState["theme"]) => void;
  setSignedIn: (signedIn: boolean) => void;
  reset: () => void;
}
const initial: SavedState = { visits: [], favorites: [], redeemed: [], theme: "system", signedIn: true };
export function pointsFor(state: Pick<SavedState, "visits" | "redeemed">) {
  return state.visits.length * 50 - REWARDS.filter((reward) => state.redeemed.includes(reward.id)).reduce((sum, reward) => sum + reward.cost, 0);
}
export function missionProgress(mission: (typeof MISSIONS)[number], ids: string[]) {
  if (mission.standIds) return mission.standIds.filter((id) => ids.includes(id)).length;
  if (mission.category === "general") return Math.min(ids.length, mission.target);
  return Math.min(STANDS.filter((stand) => ids.includes(stand.id) && stand.category === mission.category).length, mission.target);
}
/** Separate persistence keeps the landing's older fixtures and admin demo intact. */
export const useMobileDemo = create<MobileState>()(persist((set, get) => ({
  ...initial, hydrated: false,
  visit(id) {
    const state = get();
    if (!state.signedIn || !STANDS.some((stand) => stand.id === id)) return "invalid";
    if (state.visits.some((visit) => visit.standId === id)) return "duplicate";
    set({ visits: [...state.visits, { standId: id, at: new Date().toISOString(), reference: `FX-${crypto.randomUUID().slice(0, 10).toUpperCase()}` }] });
    return "confirmed";
  },
  toggleFavorite(id) {
    if (!STANDS.some((stand) => stand.id === id)) return;
    set((state) => ({ favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id] }));
  },
  redeem(id) {
    const state = get(); const reward = REWARDS.find((item) => item.id === id);
    if (!state.signedIn || !reward || state.redeemed.includes(id) || pointsFor(state) < reward.cost) return false;
    set({ redeemed: [...state.redeemed, id] }); return true;
  },
  setTheme: (theme) => set({ theme }), setSignedIn: (signedIn) => set({ signedIn }),
  reset: () => set((state) => ({ ...initial, theme: state.theme })),
}), {
  name: "fexpo-mobile-demo:v1", version: 1, skipHydration: true,
  storage: createJSONStorage(() => localStorage),
  partialize: ({ visits, favorites, redeemed, theme, signedIn }) => ({ visits, favorites, redeemed, theme, signedIn }),
  merge(saved, current) {
    const parsed = savedSchema.safeParse(saved);
    if (!parsed.success) return current;
    const data = parsed.data;
    const ids = new Set<string>();
    const visits = data.visits.filter((visit) => {
      if (ids.has(visit.standId) || !STANDS.some((stand) => stand.id === visit.standId)) return false;
      ids.add(visit.standId); return true;
    });
    const redeemed = [...new Set(data.redeemed)].filter((id) => REWARDS.some((reward) => reward.id === id));
    return { ...current, ...data, visits, favorites: [...new Set(data.favorites)].filter((id) => ids.has(id) || STANDS.some((stand) => stand.id === id)), redeemed: pointsFor({ visits, redeemed }) >= 0 ? redeemed : [] };
  },
  onRehydrateStorage: () => () => useMobileDemo.setState({ hydrated: true }),
}));

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { DemoTab } from "@/config/navigation";
import { standsById } from "@/data/demo-data";
import { INITIAL_VISIBLE_MISSION_IDS, MISSIONS } from "@/data/missions";
import { getLevelForPoints, resolveTargetStand } from "@/lib/demo-domain";
import {
  clearPersistedState,
  cloneInitialPersistedState,
  parsePersistedState,
  safeDemoStorage,
  STORAGE_KEY,
  VISIT_POINTS,
} from "@/lib/demo-storage";
import type {
  DemoState,
  DemoStore,
  NfcStage,
  PersistedDemoStateV1,
  StandCategory,
  Visit,
} from "@/types/demo";

const INITIAL_EPHEMERAL = {
  activeTab: "home" as DemoTab,
  nfcStage: "idle" as NfcStage,
  hasHydrated: false,
} satisfies Pick<DemoState, "activeTab" | "nfcStage" | "hasHydrated">;

function buildInitialState(hasHydrated = false): DemoState {
  return {
    ...cloneInitialPersistedState(),
    ...INITIAL_EPHEMERAL,
    hasHydrated,
  };
}

const missionCategoryByStandCategory: Partial<Record<StandCategory, string>> = {
  technology: "tecnologia",
  finance: "finanzas",
  gastronomy: "gastronomia",
  startups: "startups",
};

function unlockDependents(
  missionId: string,
  progress: number,
  state: Pick<DemoState, "specialActionsDone" | "unlockedMissionIds">,
): string[] {
  const mission = MISSIONS.find((candidate) => candidate.id === missionId);
  if (!mission) return state.unlockedMissionIds;

  const isComplete =
    progress >= mission.target ||
    (Boolean(mission.specialAction) &&
      state.specialActionsDone.includes(missionId));

  if (!isComplete) return state.unlockedMissionIds;

  const dependents = MISSIONS.filter(
    (candidate) =>
      candidate.unlockedBy === missionId &&
      !state.unlockedMissionIds.includes(candidate.id),
  ).map((candidate) => candidate.id);

  return [...new Set([...state.unlockedMissionIds, ...dependents])];
}

function progressMissionsForVisit(
  state: DemoStore,
  standId: string,
  category?: StandCategory,
): Pick<DemoState, "missionProgress" | "unlockedMissionIds"> {
  const matchingMissionIds = new Set<string>();
  const missionCategory = category
    ? missionCategoryByStandCategory[category]
    : undefined;

  for (const mission of MISSIONS) {
    if (
      mission.standIds?.includes(standId) ||
      (missionCategory && mission.category === missionCategory)
    ) {
      matchingMissionIds.add(mission.id);
    }
  }

  if (state.visitedStandIds.length === 0) {
    matchingMissionIds.add("primer-contacto");
  }

  const missionProgress = { ...state.missionProgress };
  let unlockedMissionIds = [...state.unlockedMissionIds];

  for (const missionId of matchingMissionIds) {
    const mission = MISSIONS.find((candidate) => candidate.id === missionId);
    if (!mission || mission.specialAction) continue;

    const previous = missionProgress[missionId] ?? 0;
    const next = Math.min(previous + 1, mission.target);
    missionProgress[missionId] = next;
    unlockedMissionIds = unlockDependents(missionId, next, {
      specialActionsDone: state.specialActionsDone,
      unlockedMissionIds,
    });
  }

  return { missionProgress, unlockedMissionIds };
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      setHasHydrated: () => set({ hasHydrated: true }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      selectStand: (standId) => set({ selectedStandId: standId }),
      selectZone: (zoneId) => set({ selectedZoneId: zoneId }),

      toggleFavorite: (standId) =>
        set((state) => {
          if (!standsById.has(standId)) return {};

          const isFavorite = state.favoriteStandIds.includes(standId);
          return {
            favoriteStandIds: isFavorite
              ? state.favoriteStandIds.filter((id) => id !== standId)
              : [...state.favoriteStandIds, standId],
          };
        }),

      visitStand: (standId, standName) =>
        set((state) => {
          if (state.visitedStandIds.includes(standId)) return {};

          const points = state.points + VISIT_POINTS;
          const gamification = progressMissionsForVisit(state, standId);
          const visit: Visit = {
            id: `visit-${standId}-${Date.now()}`,
            standId,
            standName,
            visitedAt: new Date().toISOString(),
            pointsAwarded: VISIT_POINTS,
          };

          return {
            ...gamification,
            visitedStandIds: [...state.visitedStandIds, standId],
            recentVisits: [visit, ...state.recentVisits].slice(0, 10),
            points,
            level: getLevelForPoints(points),
          };
        }),

      completeMissionSpecialAction: (missionId) =>
        set((state) => {
          if (state.specialActionsDone.includes(missionId)) return {};

          const mission = MISSIONS.find((candidate) => candidate.id === missionId);
          if (!mission?.specialAction) return {};

          const specialActionsDone = [...state.specialActionsDone, missionId];
          const missionProgress = {
            ...state.missionProgress,
            [missionId]: mission.target,
          };
          const unlockedMissionIds = unlockDependents(
            missionId,
            mission.target,
            {
              specialActionsDone,
              unlockedMissionIds: state.unlockedMissionIds,
            },
          );
          const points = state.points + mission.rewardPoints;

          return {
            specialActionsDone,
            missionProgress,
            unlockedMissionIds,
            points,
            level: getLevelForPoints(points),
          };
        }),

      getMissionProgress: (missionId) => get().missionProgress[missionId] ?? 0,
      getVisibleMissionIds: () => [
        ...new Set([
          ...INITIAL_VISIBLE_MISSION_IDS,
          ...get().unlockedMissionIds,
        ]),
      ],

      redeemReward: (rewardId, cost) => {
        const state = get();
        if (cost < 0 || state.points < cost) return null;
        if (state.redeemedRewardIds.includes(rewardId)) return null;

        const code = `DEMO-${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`;
        const points = state.points - cost;

        set({
          points,
          level: getLevelForPoints(points),
          redeemedRewardIds: [...state.redeemedRewardIds, rewardId],
        });

        return code;
      },

      startNfcScan: (standId) => {
        const state = get();

        if (standId && !standsById.has(standId)) {
          set({ nfcStage: "error", selectedStandId: null });
          return;
        }

        const reusableSelectedStandId =
          state.selectedStandId &&
          !state.visitedStandIds.includes(state.selectedStandId)
            ? state.selectedStandId
            : null;
        const target = resolveTargetStand(
          standId,
          reusableSelectedStandId,
          state.visitedStandIds,
        );

        if (!target) {
          set({ nfcStage: "error", selectedStandId: null });
          return;
        }

        set({ nfcStage: "searching", selectedStandId: target.id });
      },

      markNfcDetected: () =>
        set((state) =>
          state.nfcStage === "searching" ? { nfcStage: "detected" } : {},
        ),
      beginNfcConfirmation: () =>
        set((state) =>
          state.nfcStage === "detected" ? { nfcStage: "confirming" } : {},
        ),

      confirmVisit: (standId) =>
        set((state) => {
          const stand = standsById.get(standId);
          if (!stand) return { nfcStage: "error" };
          if (state.visitedStandIds.includes(standId)) {
            return { nfcStage: "duplicate" };
          }

          const points = state.points + VISIT_POINTS;
          const gamification = progressMissionsForVisit(
            state,
            standId,
            stand.category,
          );
          const visit: Visit = {
            id: `visit-${standId}-${Date.now()}`,
            standId,
            standName: stand.name,
            visitedAt: new Date().toISOString(),
            pointsAwarded: VISIT_POINTS,
          };

          return {
            ...gamification,
            visitedStandIds: [...state.visitedStandIds, standId],
            recentVisits: [visit, ...state.recentVisits].slice(0, 10),
            points,
            level: getLevelForPoints(points),
            selectedStandId: standId,
            nfcStage: "success",
          };
        }),

      failNfcScan: () => set({ nfcStage: "error" }),
      setNfcStage: (stage) => set({ nfcStage: stage }),
      resetNfcFlow: () => set({ nfcStage: "idle" }),

      resetDemo: () => {
        set(buildInitialState(true));
        clearPersistedState();
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => safeDemoStorage),
      partialize: (state): PersistedDemoStateV1 => ({
        points: state.points,
        level: state.level,
        selectedStandId: state.selectedStandId,
        selectedZoneId: state.selectedZoneId,
        visitedStandIds: state.visitedStandIds,
        favoriteStandIds: state.favoriteStandIds,
        recentVisits: state.recentVisits,
        lastKnownLocation: state.lastKnownLocation,
        missionProgress: state.missionProgress,
        specialActionsDone: state.specialActionsDone,
        unlockedMissionIds: state.unlockedMissionIds,
        redeemedRewardIds: state.redeemedRewardIds,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...parsePersistedState(persistedState),
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    },
  ),
);

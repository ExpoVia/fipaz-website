"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PANEL_ROLE, isPanelRole, type PanelRole } from "@/config/panel-navigation";

interface PanelStore {
  activeRole: PanelRole;
  setActiveRole: (role: PanelRole) => void;
}

export const usePanelStore = create<PanelStore>()(
  persist(
    (set) => ({
      activeRole: DEFAULT_PANEL_ROLE,
      setActiveRole: (role) => set({ activeRole: role }),
    }),
    {
      name: "expovia-panel:v1",
      merge: (persisted, current) => {
        const role = (persisted as Partial<PanelStore> | undefined)?.activeRole;
        return isPanelRole(role) ? { ...current, activeRole: role } : current;
      },
    },
  ),
);

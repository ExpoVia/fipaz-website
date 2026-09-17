"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PANEL_ROLE, isPanelRole, type PanelRole } from "@/config/panel-navigation";
import { stands } from "@/data/demo-data";
import { MOCK_EXHIBITOR_STAND_ID } from "@/data/panel-mock";
import { assignZoneForCategory, createCompanyId, generateBoothCode } from "@/lib/panel-forms";
import type { CompanyProfileInput, CompanyRegistrationInput, ExhibitorProfile } from "@/types/panel";

function seedCompanies(): ExhibitorProfile[] {
  // Copia propia: no debe mutar el catálogo estático que usa la demo del visitante.
  return stands.map((stand) => ({ ...stand }));
}

interface PanelStore {
  activeRole: PanelRole;
  activeCompanyId: string;
  companies: ExhibitorProfile[];
  hasHydrated: boolean;
  setActiveRole: (role: PanelRole) => void;
  setHasHydrated: () => void;
  registerCompany: (input: CompanyRegistrationInput) => string;
  updateCompany: (id: string, patch: CompanyProfileInput) => void;
}

export const usePanelStore = create<PanelStore>()(
  persist(
    (set, get) => ({
      activeRole: DEFAULT_PANEL_ROLE,
      activeCompanyId: MOCK_EXHIBITOR_STAND_ID,
      companies: seedCompanies(),
      hasHydrated: false,
      setActiveRole: (role) => set({ activeRole: role }),
      setHasHydrated: () => set({ hasHydrated: true }),
      registerCompany: (input) => {
        const { companies } = get();
        const zone = assignZoneForCategory(input.category);
        const newCompany: ExhibitorProfile = {
          id: createCompanyId(input.name, companies),
          name: input.name,
          category: input.category,
          description: input.description,
          zoneId: zone.id,
          boothCode: generateBoothCode(zone, companies),
          logoPath: "/assets/stands/placeholder.svg",
          tags: [],
          points: 50,
          featured: false,
          contactEmail: input.contactEmail,
        };
        set({
          companies: [...companies, newCompany],
          activeRole: "expositor",
          activeCompanyId: newCompany.id,
        });
        return newCompany.id;
      },
      updateCompany: (id, patch) => {
        set({
          companies: get().companies.map((company) =>
            company.id === id
              ? {
                  ...company,
                  name: patch.name,
                  category: patch.category,
                  description: patch.description,
                  contactEmail: patch.contactEmail,
                  tags: patch.tags,
                  activity: patch.activity,
                  promotion: patch.promotion,
                }
              : company,
          ),
        });
      },
    }),
    {
      name: "expovia-panel:v1",
      partialize: (state) => ({
        activeRole: state.activeRole,
        activeCompanyId: state.activeCompanyId,
        companies: state.companies,
      }),
      merge: (persisted, current) => {
        const data = persisted as Partial<PanelStore> | undefined;
        return {
          ...current,
          activeRole: isPanelRole(data?.activeRole) ? data!.activeRole : current.activeRole,
          activeCompanyId:
            typeof data?.activeCompanyId === "string" ? data.activeCompanyId : current.activeCompanyId,
          companies: Array.isArray(data?.companies) ? data.companies : current.companies,
        };
      },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(),
    },
  ),
);

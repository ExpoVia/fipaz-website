"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PANEL_ROLE, isPanelRole, type PanelRole } from "@/config/panel-navigation";
import { stands } from "@/data/demo-data";
import { MOCK_EXHIBITOR_STAND_ID } from "@/data/panel-mock";
import { assignZoneForCategory, createCompanyId, generateBoothCode } from "@/lib/panel-forms";
import type { CompanyProfileInput, CompanyRegistrationInput, ExhibitorProfile, QrToken } from "@/types/panel";

function seedCompanies(): ExhibitorProfile[] {
  return stands.map((stand) => ({ ...stand }));
}

function generateQrId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

interface PanelStore {
  activeRole: PanelRole;
  activeCompanyId: string;
  companies: ExhibitorProfile[];
  hasHydrated: boolean;
  /** Tokens QR activos/históricos — no se persisten (efímeros por diseño) */
  qrTokens: QrToken[];
  setActiveRole: (role: PanelRole) => void;
  setHasHydrated: () => void;
  registerCompany: (input: CompanyRegistrationInput, serverId?: string) => string;
  updateCompany: (id: string, patch: CompanyProfileInput) => void;
  generateQr: (standId: string, ttl: number, maxScans: number) => QrToken;
  revokeQr: (qrId: string) => void;
  expireQr: (qrId: string) => void;
}

export const usePanelStore = create<PanelStore>()(
  persist(
    (set, get) => ({
      activeRole: DEFAULT_PANEL_ROLE,
      activeCompanyId: MOCK_EXHIBITOR_STAND_ID,
      companies: seedCompanies(),
      hasHydrated: false,
      qrTokens: [],

      setActiveRole: (role) => set({ activeRole: role }),
      setHasHydrated: () => set({ hasHydrated: true }),

      registerCompany: (input, serverId) => {
        const { companies } = get();
        const zone = assignZoneForCategory(input.category);
        const newCompany: ExhibitorProfile = {
          id: serverId ?? createCompanyId(input.name, companies),
          name: input.name,
          category: input.category,
          customCategory: input.customCategory,
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
                  customCategory: patch.customCategory,
                  description: patch.description,
                  contactEmail: patch.contactEmail,
                  logoPath: patch.logoPath ?? company.logoPath,
                  websiteUrl: patch.websiteUrl,
                  tags: patch.tags,
                  activity: patch.activity,
                  promotion: patch.promotion,
                }
              : company,
          ),
        });
      },

      generateQr: (standId, ttl, maxScans) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttl * 1000);
        const token: QrToken = {
          id: generateQrId(),
          standId,
          ttl,
          maxScans,
          scansUsed: 0,
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          status: "active",
        };
        set({ qrTokens: [token, ...get().qrTokens] });
        return token;
      },

      revokeQr: (qrId) => {
        set({
          qrTokens: get().qrTokens.map((t) =>
            t.id === qrId ? { ...t, status: "revoked" } : t,
          ),
        });
      },

      expireQr: (qrId) => {
        set({
          qrTokens: get().qrTokens.map((t) =>
            t.id === qrId ? { ...t, status: "expired" } : t,
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
        // qrTokens excluido — son efímeros
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

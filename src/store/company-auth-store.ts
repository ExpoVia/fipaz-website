"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  authenticateCompanyWithGoogle,
  companyUserHasAdminRole,
  fetchCompanyUser,
  normalizeCompanyUser,
  refreshCompanyTokens,
  type CompanyAuthTokens,
} from "@/lib/api/company-auth";
import { setAccessTokenProvider, setUnauthorizedHandler } from "@/lib/api/http-client";

export type CompanyAuthRole = "company_admin" | "guest";

export interface CompanySession {
  companyId: string;
  companyName: string;
  email: string;
  googleSub: string;
  role: CompanyAuthRole;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
}

interface CompanyAuthStore {
  session: CompanySession | null;
  hasHydrated: boolean;
  setHasHydrated: () => void;
  loginWithGoogle: (idToken: string) => Promise<void>;
  setCompanyIdentity: (companyId: string, companyName: string) => void;
  refreshAccessToken: () => Promise<boolean>;
  verifySession: () => Promise<SessionVerificationResult>;
  logout: () => void;
}

export type SessionVerificationResult = "valid" | "invalid" | "unavailable";

let refreshInFlight: Promise<boolean> | null = null;

function getDeviceId(): string {
  const key = "expovia-company-device-id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

function expiration(seconds: number | undefined, fallbackSeconds: number): string {
  return new Date(Date.now() + (seconds ?? fallbackSeconds) * 1000).toISOString();
}

function errorStatus(error: unknown): number | undefined {
  return error instanceof Error && "status" in error && typeof error.status === "number"
    ? error.status
    : undefined;
}

function isAuthenticationFailure(error: unknown): boolean {
  return [400, 401, 403].includes(errorStatus(error) ?? 0);
}

function sessionFrom(user: ReturnType<typeof normalizeCompanyUser>, tokens: CompanyAuthTokens, role: CompanyAuthRole): CompanySession {
  return {
    ...user,
    role,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: expiration(tokens.expiresIn, 15 * 60),
    refreshExpiresAt: expiration(tokens.refreshExpiresIn, 30 * 24 * 60 * 60),
  };
}

export const useCompanyAuthStore = create<CompanyAuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      loginWithGoogle: async (idToken) => {
        const { tokens, user } = await authenticateCompanyWithGoogle(idToken, getDeviceId());
        set({ session: sessionFrom(normalizeCompanyUser(user), tokens, companyUserHasAdminRole(user) ? "company_admin" : "guest") });
      },

      setCompanyIdentity: (companyId, companyName) => {
        const session = get().session;
        if (session) set({ session: { ...session, companyId, companyName } });
      },

      refreshAccessToken: async () => {
        if (refreshInFlight) return refreshInFlight;
        refreshInFlight = (async () => {
          const current = get().session;
          const refreshExpiry = current ? Date.parse(current.refreshExpiresAt) : Number.NaN;
          if (!current?.refreshToken || !Number.isFinite(refreshExpiry) || refreshExpiry <= Date.now()) {
            set({ session: null });
            return false;
          }
          try {
            const tokens = await refreshCompanyTokens(current.refreshToken);
            set({ session: { ...current, ...tokens, expiresAt: expiration(tokens.expiresIn, 15 * 60), refreshExpiresAt: expiration(tokens.refreshExpiresIn, 30 * 24 * 60 * 60) } });
            return true;
          } catch (error) {
            if (error instanceof Error && "status" in error && [400, 401, 403].includes(Number(error.status))) {
              set({ session: null });
            }
            return false;
          } finally {
            refreshInFlight = null;
          }
        })();
        return refreshInFlight;
      },

      verifySession: async () => {
        let current = get().session;
        if (!current) return "invalid";
        if (Date.parse(current.expiresAt) <= Date.now()) {
          if (!await get().refreshAccessToken()) {
            return get().session ? "unavailable" : "invalid";
          }
          current = get().session;
        }
        if (!current?.accessToken) return "invalid";
        try {
          const user = await fetchCompanyUser(current.accessToken);
          if (!companyUserHasAdminRole(user)) {
            set({ session: null });
            return "invalid";
          }
          const identity = normalizeCompanyUser(user);
          set({ session: {
            ...current,
            ...identity,
            companyId: identity.companyId || current.companyId,
            companyName: identity.companyName || current.companyName,
            email: identity.email || current.email,
            googleSub: identity.googleSub || current.googleSub,
            role: "company_admin",
          } });
          return "valid";
        } catch (error) {
          if (errorStatus(error) === 401) {
            if (await get().refreshAccessToken()) {
              const refreshed = get().session;
              if (!refreshed) return "invalid";
              try {
                const user = await fetchCompanyUser(refreshed.accessToken);
                if (companyUserHasAdminRole(user)) {
                  const identity = normalizeCompanyUser(user);
                  set({ session: {
                    ...refreshed,
                    ...identity,
                    companyId: identity.companyId || refreshed.companyId,
                    companyName: identity.companyName || refreshed.companyName,
                    email: identity.email || refreshed.email,
                    googleSub: identity.googleSub || refreshed.googleSub,
                    role: "company_admin",
                  } });
                  return "valid";
                }
                set({ session: null });
                return "invalid";
              } catch (retryError) {
                if (isAuthenticationFailure(retryError)) {
                  set({ session: null });
                  return "invalid";
                }
                return "unavailable";
              }
            }
            return get().session ? "unavailable" : "invalid";
          }
          if (isAuthenticationFailure(error)) {
            set({ session: null });
            return "invalid";
          }
          return "unavailable";
        }
      },

      logout: () => set({ session: null }),
    }),
    {
      name: "expovia-company-auth:v3",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(),
    },
  ),
);

setAccessTokenProvider(() => useCompanyAuthStore.getState().session?.accessToken ?? null);
setUnauthorizedHandler(() => useCompanyAuthStore.getState().refreshAccessToken());

/** La identidad y el rol provienen de la validación del backend. */
export function isSessionValid(session: CompanySession | null): boolean {
  if (!session || session.role !== "company_admin" || !session.accessToken || !session.refreshToken) return false;
  const expiry = Date.parse(session.expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

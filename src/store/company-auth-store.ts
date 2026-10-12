"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  authenticateWithGoogle,
  fetchAuthMe,
  refreshCompanyTokens,
  revokeAllServerSessions,
  revokeServerSession,
  type AuthMe,
  type CompanyAuthTokens,
  type RoleAssignment,
} from "@/lib/api/company-auth";
import { setAccessTokenProvider, setUnauthorizedHandler } from "@/lib/api/http-client";

/** Una cuenta puede tener varios roles de empresa o evento; el backend valida cada permiso. */
export interface CompanySession {
  userId: string;
  email: string;
  displayName: string;
  roles: RoleAssignment[];
  activeRoleId: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
}

export type SessionVerificationResult = "valid" | "invalid" | "unavailable";

interface CompanyAuthStore {
  session: CompanySession | null;
  hasHydrated: boolean;
  setHasHydrated: () => void;
  loginWithGoogle: (idToken: string) => Promise<AuthMe>;
  setActiveRole: (roleId: string) => void;
  refreshAccessToken: () => Promise<boolean>;
  /** Actualiza los roles; conserva la sesión si el servicio está temporalmente caído. */
  verifySession: () => Promise<SessionVerificationResult>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const ACCESS_TOKEN_FALLBACK_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 30 * 24 * 60 * 60;
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

function isPast(isoDate: string): boolean {
  const time = Date.parse(isoDate);
  return !Number.isFinite(time) || time <= Date.now();
}

function isAuthenticationFailure(error: unknown): boolean {
  return error instanceof Error && "status" in error &&
    [400, 401, 403].includes(Number(error.status));
}

function sessionFrom(me: AuthMe, tokens: CompanyAuthTokens): CompanySession {
  return {
    userId: me.id,
    email: me.email,
    displayName: me.displayName,
    roles: me.roles,
    activeRoleId: me.roles[0]?.id ?? null,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: expiration(tokens.expiresIn, ACCESS_TOKEN_FALLBACK_SECONDS),
    refreshExpiresAt: expiration(undefined, REFRESH_TOKEN_SECONDS),
  };
}

export const useCompanyAuthStore = create<CompanyAuthStore>()(
  persist(
    (set, get) => {
      function applyIdentity(me: AuthMe): void {
        const current = get().session;
        if (!current) return;
        const stillActive = me.roles.some((role) => role.id === current.activeRoleId);
        set({
          session: {
            ...current,
            userId: me.id,
            email: me.email,
            displayName: me.displayName,
            roles: me.roles,
            activeRoleId: stillActive ? current.activeRoleId : (me.roles[0]?.id ?? null),
          },
        });
      }

      async function endSession(
        revoke: (tokens: CompanyAuthTokens, accessTokenExpired: boolean) => Promise<void>,
      ): Promise<void> {
        const current = get().session;
        set({ session: null });
        if (!current || isPast(current.refreshExpiresAt)) return;
        await revoke(
          { accessToken: current.accessToken, refreshToken: current.refreshToken },
          isPast(current.expiresAt),
        );
      }

      return {
        session: null,
        hasHydrated: false,

        setHasHydrated: () => set({ hasHydrated: true }),

        loginWithGoogle: async (idToken) => {
          const { tokens, me } = await authenticateWithGoogle(idToken, getDeviceId());
          set({ session: sessionFrom(me, tokens) });
          return me;
        },

        setActiveRole: (roleId) => {
          const current = get().session;
          if (current?.roles.some((role) => role.id === roleId)) {
            set({ session: { ...current, activeRoleId: roleId } });
          }
        },

        refreshAccessToken: async () => {
          if (refreshInFlight) return refreshInFlight;
          refreshInFlight = (async () => {
            const current = get().session;
            if (!current?.refreshToken || isPast(current.refreshExpiresAt)) {
              set({ session: null });
              return false;
            }
            try {
              const tokens = await refreshCompanyTokens(current.refreshToken);
              const latest = get().session;
              if (!latest || latest.refreshToken !== current.refreshToken) return false;
              set({
                session: {
                  ...latest,
                  accessToken: tokens.accessToken,
                  refreshToken: tokens.refreshToken,
                  expiresAt: expiration(tokens.expiresIn, ACCESS_TOKEN_FALLBACK_SECONDS),
                  refreshExpiresAt: expiration(undefined, REFRESH_TOKEN_SECONDS),
                },
              });
              return true;
            } catch (error) {
              if (isAuthenticationFailure(error)) set({ session: null });
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
          if (isPast(current.expiresAt)) {
            if (!await get().refreshAccessToken()) {
              return get().session ? "unavailable" : "invalid";
            }
            current = get().session;
          }
          if (!current?.accessToken) return "invalid";

          try {
            applyIdentity(await fetchAuthMe(current.accessToken));
            return "valid";
          } catch (error) {
            if (error instanceof Error && "status" in error && error.status === 401) {
              if (await get().refreshAccessToken()) {
                const refreshed = get().session;
                if (!refreshed) return "invalid";
                try {
                  applyIdentity(await fetchAuthMe(refreshed.accessToken));
                  return "valid";
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

        logout: () => endSession(revokeServerSession),
        logoutAll: () => endSession(revokeAllServerSessions),
      };
    },
    {
      name: "expovia-company-auth:v4",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(),
    },
  ),
);

setAccessTokenProvider(() => useCompanyAuthStore.getState().session?.accessToken ?? null);
setUnauthorizedHandler(() => useCompanyAuthStore.getState().refreshAccessToken());

/** Comprueba los tokens locales; las vistas protegidas confirman roles con el backend. */
export function isSessionValid(session: CompanySession | null): session is CompanySession {
  return !!session && !!session.accessToken && !!session.refreshToken && !isPast(session.expiresAt);
}

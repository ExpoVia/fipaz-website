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

/**
 * Sesión del panel. Una sola sesión (cuenta de Google) puede tener varios roles reales
 * (`GET /auth/me`): expositor de una o más empresas y/o organizador de eventos.
 * El rol activo decide en qué panel está trabajando; los permisos siempre los valida el backend.
 */
export interface CompanySession {
  userId: string;
  email: string;
  displayName: string;
  roles: RoleAssignment[];
  /** Id de la asignación de `user_roles` con la que se opera ahora. */
  activeRoleId: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
}

interface CompanyAuthStore {
  session: CompanySession | null;
  hasHydrated: boolean;
  setHasHydrated: () => void;
  /** Inicia sesión y devuelve la identidad con sus roles, para que quien llama decida a dónde ir. */
  loginWithGoogle: (idToken: string) => Promise<AuthMe>;
  /** Cambia el rol con el que se opera (p. ej. de una empresa a otra, o de expositor a organizador). */
  setActiveRole: (roleId: string) => void;
  refreshAccessToken: () => Promise<boolean>;
  /**
   * Renueva el token si hace falta y vuelve a leer `/auth/me`, de modo que los roles reflejen
   * al instante cualquier alta o revocación. Devuelve `false` si la sesión ya no es válida.
   */
  verifySession: () => Promise<boolean>;
  /** Cierra la sesión local de inmediato e invalida la del servidor (`POST /auth/logout`). */
  logout: () => Promise<void>;
  /** Como `logout`, pero invalida todos los dispositivos (`POST /auth/logout-all`). */
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

function hasStatus(error: unknown, status: number): boolean {
  return error instanceof Error && "status" in error && error.status === status;
}

export const useCompanyAuthStore = create<CompanyAuthStore>()(
  persist(
    (set, get) => {
      /** Aplica la identidad recién leída conservando el rol activo si todavía existe. */
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
        // Primero lo local: el cierre no puede depender de que el backend responda.
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
              const latest = get().session ?? current;
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
            } catch {
              set({ session: null });
              return false;
            } finally {
              refreshInFlight = null;
            }
          })();
          return refreshInFlight;
        },

        verifySession: async () => {
          const initial = get().session;
          if (!initial) return false;
          if (isPast(initial.expiresAt) && !(await get().refreshAccessToken())) return false;

          const current = get().session;
          if (!current) return false;

          try {
            applyIdentity(await fetchAuthMe(current.accessToken));
            return true;
          } catch (error) {
            // Un 401 puede ser solo un access token vencido: se renueva y se reintenta una vez.
            if (hasStatus(error, 401) && (await get().refreshAccessToken())) {
              const refreshed = get().session;
              if (refreshed) {
                try {
                  applyIdentity(await fetchAuthMe(refreshed.accessToken));
                  return true;
                } catch {
                  // La sesión se cierra abajo si la API la rechaza otra vez.
                }
              }
            }
            set({ session: null });
            return false;
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

/** La sesión tiene tokens y el access token no ha vencido (el rol y los permisos los valida el backend). */
export function isSessionValid(session: CompanySession | null): session is CompanySession {
  return !!session && !!session.accessToken && !!session.refreshToken && !isPast(session.expiresAt);
}

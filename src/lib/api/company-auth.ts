import { z } from "zod";

import { readApiErrorMessage, unwrapEnvelope } from "@/lib/api/api-envelope";
import { companyApiUrl } from "@/lib/api/company-api-url";

/** Roles elevados de `public.app_role`. `visitor` es implícito (sin roles). */
export const APP_ROLES = ["super_admin", "event_admin", "company_admin", "company_staff"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as readonly string[]).includes(value);
}

export interface CompanyAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

/** Asignación vigente de `user_roles`, acotada a una empresa o a un evento. */
export interface RoleAssignment {
  id: string;
  role: AppRole;
  companyId: string | null;
  companyName: string | null;
  eventId: string | null;
  eventName: string | null;
}

/** Identidad devuelta por `GET /auth/me`. */
export interface AuthMe {
  id: string;
  email: string;
  displayName: string;
  roles: RoleAssignment[];
}

export class CompanyAuthError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "CompanyAuthError";
  }
}

const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().optional(),
});

const roleSchema = z.object({
  id: z.string(),
  role: z.string(),
  companyId: z.string().nullable(),
  companyName: z.string().nullable(),
  eventId: z.string().nullable(),
  eventName: z.string().nullable(),
});

const meSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  profile: z.object({ displayName: z.string().nullable() }),
  roles: z.array(roleSchema),
});

async function postJson(path: string, body: unknown, accessToken?: string): Promise<Response> {
  try {
    return await fetch(companyApiUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new CompanyAuthError("No se pudo conectar con el servicio de autenticación.");
  }
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null) as Promise<unknown>;
}

async function postForTokens(path: string, body: unknown, fallbackError: string): Promise<CompanyAuthTokens> {
  const response = await postJson(path, body);
  const payload = await readJson(response);
  if (!response.ok) {
    throw new CompanyAuthError(readApiErrorMessage(payload, fallbackError), response.status);
  }
  const parsed = tokensSchema.safeParse(unwrapEnvelope(payload));
  if (!parsed.success) {
    throw new CompanyAuthError("El backend no devolvió los tokens de sesión esperados.");
  }
  return parsed.data;
}

function toAuthMe(data: z.infer<typeof meSchema>): AuthMe {
  const roles: RoleAssignment[] = [];
  for (const entry of data.roles) {
    // Un rol desconocido (backend más nuevo que el cliente) se ignora en lugar de romper el login.
    if (isAppRole(entry.role)) roles.push({ ...entry, role: entry.role });
  }
  return {
    id: data.id,
    email: data.email ?? "",
    displayName: data.profile.displayName ?? data.email ?? "Usuario",
    roles,
  };
}

/** `GET /auth/me`: identidad y roles vigentes. Se consulta en cada verificación de sesión. */
export async function fetchAuthMe(accessToken: string): Promise<AuthMe> {
  let response: Response;
  try {
    response = await fetch(companyApiUrl("/auth/me"), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new CompanyAuthError("No se pudo validar la sesión con el backend.");
  }
  const payload = await readJson(response);
  if (!response.ok) {
    throw new CompanyAuthError(readApiErrorMessage(payload, "La sesión ya no es válida."), response.status);
  }
  const parsed = meSchema.safeParse(unwrapEnvelope(payload));
  if (!parsed.success) {
    throw new CompanyAuthError("El backend devolvió una identidad con un formato inesperado.");
  }
  return toAuthMe(parsed.data);
}

export async function authenticateWithGoogle(idToken: string, deviceId: string) {
  const tokens = await postForTokens(
    "/auth/google",
    { idToken, device: { id: deviceId, platform: "web" } },
    "No se pudo iniciar sesión con Google.",
  );
  const me = await fetchAuthMe(tokens.accessToken);
  return { tokens, me };
}

export function refreshCompanyTokens(refreshToken: string): Promise<CompanyAuthTokens> {
  // El backend rechaza campos extra: solo acepta `refreshToken`.
  return postForTokens("/auth/refresh", { refreshToken }, "No se pudo renovar la sesión.");
}

/**
 * Invalida la sesión en el servidor (`POST /auth/logout`, 204). Es de mejor esfuerzo: el cierre local
 * nunca debe depender de que el backend responda, así que no lanza errores.
 * Si el access token ya venció, el endpoint exige uno vigente: se renueva antes de cerrar.
 */
export async function revokeServerSession(tokens: CompanyAuthTokens, accessTokenExpired: boolean): Promise<void> {
  try {
    let current = tokens;
    if (accessTokenExpired) current = await refreshCompanyTokens(tokens.refreshToken);
    await postJson("/auth/logout", { refreshToken: current.refreshToken }, current.accessToken);
  } catch {
    // Sin red o token ya revocado: la sesión local se cierra de todos modos.
  }
}

/** Invalida todas las sesiones del usuario (`POST /auth/logout-all`, 204). Mismo criterio de mejor esfuerzo. */
export async function revokeAllServerSessions(tokens: CompanyAuthTokens, accessTokenExpired: boolean): Promise<void> {
  try {
    const current = accessTokenExpired ? await refreshCompanyTokens(tokens.refreshToken) : tokens;
    await postJson("/auth/logout-all", undefined, current.accessToken);
  } catch {
    // Ver revokeServerSession.
  }
}

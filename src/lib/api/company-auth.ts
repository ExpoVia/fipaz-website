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

function authErrorMessage(payload: unknown, status: number, fallback: string): string {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : null;
  const error = root?.error && typeof root.error === "object"
    ? root.error as Record<string, unknown>
    : root;
  const code = typeof error?.code === "string" ? error.code : undefined;
  if (code === "DATABASE_UNAVAILABLE" || status >= 500) {
    return "El servicio de datos está temporalmente no disponible. Intenta nuevamente en unos minutos.";
  }
  if (code === "INVALID_GOOGLE_TOKEN") {
    return "Google no pudo validar esta cuenta. Intenta iniciar sesión nuevamente.";
  }
  if (code === "INVALID_REFRESH_TOKEN" || code === "SESSION_REVOKED") {
    return "Tu sesión expiró. Inicia sesión nuevamente.";
  }
  if (code === "INVALID_CREDENTIALS") {
    return "Correo o contraseña incorrectos.";
  }
  if (code === "EMAIL_IN_USE") {
    return "Ese correo ya tiene una cuenta. Inicia sesión con el método que usaste al crearla.";
  }
  if (code === "TOO_MANY_REQUESTS" || status === 429) {
    return "Demasiados intentos. Espera un minuto y vuelve a intentarlo.";
  }
  if (code === "PASSWORD_AUTH_DISABLED") {
    return "El acceso con correo y contraseña no está habilitado en este entorno.";
  }
  return readApiErrorMessage(payload, fallback);
}

async function postForTokens(path: string, body: unknown, fallbackError: string): Promise<CompanyAuthTokens> {
  const response = await postJson(path, body);
  const payload = await readJson(response);
  if (!response.ok) {
    throw new CompanyAuthError(authErrorMessage(payload, response.status, fallbackError), response.status);
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
    throw new CompanyAuthError(authErrorMessage(payload, response.status, "La sesión ya no es válida."), response.status);
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

/** `POST /auth/login`: misma sesión que con Google, para cuentas creadas con correo y contraseña. */
export async function authenticateWithPassword(email: string, password: string, deviceId: string) {
  let tokens: CompanyAuthTokens;
  try {
    tokens = await postForTokens(
      "/auth/login",
      { email: email.trim(), password, device: { id: deviceId, platform: "web" } },
      "No se pudo iniciar sesión.",
    );
  } catch (error) {
    // El backend también valida la longitud al iniciar sesión (400, con el detalle en inglés):
    // para quien entra, una contraseña corta es simplemente incorrecta.
    if (error instanceof CompanyAuthError && error.status === 400) {
      throw new CompanyAuthError("Correo o contraseña incorrectos.", 400);
    }
    throw error;
  }
  const me = await fetchAuthMe(tokens.accessToken);
  return { tokens, me };
}

/** `POST /auth/register`: crea la cuenta (sin roles) y devuelve su sesión. */
export async function registerWithPassword(
  input: { email: string; password: string; displayName: string },
  deviceId: string,
) {
  const tokens = await postForTokens(
    "/auth/register",
    {
      email: input.email.trim(),
      password: input.password,
      displayName: input.displayName.trim(),
      device: { id: deviceId, platform: "web" },
    },
    "No se pudo crear la cuenta.",
  );
  const me = await fetchAuthMe(tokens.accessToken);
  return { tokens, me };
}

/** Reglas del backend para la contraseña: se validan antes de enviar para dar el error en el formulario. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  if (password.length > PASSWORD_MAX_LENGTH) return `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`;
  return null;
}

/** El acceso con correo y contraseña se muestra solo cuando el entorno lo habilita. */
export function isPasswordLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED === "true";
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

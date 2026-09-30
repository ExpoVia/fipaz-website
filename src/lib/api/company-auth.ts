import { companyApiUrl } from "@/lib/api/company-api-url";

export interface CompanyAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
}

export interface AuthenticatedCompanyUser {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  displayName?: string;
  companyId?: string;
  company?: { id?: string; name?: string; displayName?: string };
  role?: string;
  roles?: Array<string | { role?: string; name?: string }>;
  user?: AuthenticatedCompanyUser;
  data?: AuthenticatedCompanyUser;
}

export class CompanyAuthError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "CompanyAuthError";
  }
}

function unwrap<T>(value: T | { data?: T }): T {
  return value && typeof value === "object" && "data" in value && value.data
    ? value.data
    : value as T;
}

async function request<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(companyApiUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CompanyAuthError("No se pudo conectar con el servicio de autenticación.");
  }

  const result = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const payload = result as { message?: string; code?: string } | null;
    throw new CompanyAuthError(
      payload?.message ?? payload?.code ?? `Error de autenticación (${response.status}).`,
      response.status,
    );
  }
  return unwrap(result as T);
}

function readTokens(response: unknown): CompanyAuthTokens {
  const payload = unwrap(response as Record<string, unknown>) as Record<string, unknown>;
  const tokens = (payload.tokens && typeof payload.tokens === "object" ? payload.tokens : payload) as Record<string, unknown>;
  if (typeof tokens.accessToken !== "string" || typeof tokens.refreshToken !== "string") {
    throw new CompanyAuthError("El backend no devolvió los tokens de sesión esperados.");
  }
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: typeof tokens.expiresIn === "number" ? tokens.expiresIn : undefined,
    refreshExpiresIn: typeof tokens.refreshExpiresIn === "number" ? tokens.refreshExpiresIn : undefined,
  };
}

export async function authenticateCompanyWithGoogle(idToken: string, deviceId: string) {
  const response = await request<unknown>("/auth/google", {
    idToken,
    device: { id: deviceId, platform: "web" },
  });
  const tokens = readTokens(response);
  const userResponse = await fetch(companyApiUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  const userPayload = await userResponse.json().catch(() => null) as unknown;
  if (!userResponse.ok) {
    throw new CompanyAuthError("Google validó la cuenta, pero no se pudo confirmar el acceso de empresa.", userResponse.status);
  }
  return { tokens, user: unwrap(userPayload as AuthenticatedCompanyUser) };
}

export async function refreshCompanyTokens(refreshToken: string, deviceId: string) {
  const response = await request<unknown>("/auth/refresh", {
    refreshToken,
    device: { id: deviceId, platform: "web" },
  });
  return readTokens(response);
}

export async function fetchCompanyUser(accessToken: string): Promise<AuthenticatedCompanyUser> {
  let response: Response;
  try {
    response = await fetch(companyApiUrl("/auth/me"), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new CompanyAuthError("No se pudo validar la sesión con el backend.");
  }
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    throw new CompanyAuthError("La sesión ya no es válida.", response.status);
  }
  return unwrap(payload as AuthenticatedCompanyUser);
}

export function companyUserHasAdminRole(user: AuthenticatedCompanyUser): boolean {
  const normalized = user.user ?? user;
  const roles = [normalized.role, ...(normalized.roles ?? []).map((role) =>
    typeof role === "string" ? role : role.role ?? role.name ?? "",
  )];
  return roles.some((role) => role?.toLowerCase() === "company_admin");
}

export function normalizeCompanyUser(user: AuthenticatedCompanyUser) {
  const normalized = user.user ?? user;
  return {
    companyId: normalized.companyId ?? normalized.company?.id ?? "",
    companyName: normalized.company?.displayName ?? normalized.company?.name ?? normalized.displayName ?? normalized.name ?? "Mi empresa",
    email: normalized.email ?? "",
    googleSub: normalized.sub ?? normalized.id ?? "",
  };
}

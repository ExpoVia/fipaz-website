import type { Page, Route } from "@playwright/test";

type AppRole = "company_admin" | "company_staff" | "event_admin" | "super_admin";

export interface FakeRole {
  id: string;
  role: AppRole;
  companyId: string | null;
  companyName: string | null;
  eventId: string | null;
  eventName: string | null;
  grantedAt: string;
}

export interface FakeUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  roles: FakeRole[];
}

export interface RecordedCall {
  method: string;
  path: string;
  body: unknown;
  authorization: string | null;
}

const GRANTED_AT = "2026-10-01T00:00:00.000Z";
let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${++sequence}`;

export function companyRole(role: "company_admin" | "company_staff", companyId: string, companyName: string): FakeRole {
  return { id: nextId("role"), role, companyId, companyName, eventId: null, eventName: null, grantedAt: GRANTED_AT };
}

export function eventAdminRole(eventId: string, eventName: string): FakeRole {
  return { id: nextId("role"), role: "event_admin", companyId: null, companyName: null, eventId, eventName, grantedAt: GRANTED_AT };
}

const ok = (data: unknown) => ({ success: true, data, meta: null });
const fail = (code: string, message = code) => ({ success: false, error: { code, message, details: null } });

/**
 * Backend de autenticación en memoria con el contrato de `fexpo-backend`: login y registro con
 * contraseña, `/auth/me`, refresh con rotación, logout y alta de empresa. Registra cada llamada.
 */
export class FakeBackend {
  readonly calls: RecordedCall[] = [];
  private readonly users: FakeUser[] = [];
  private readonly accessTokens = new Map<string, string>();
  private readonly refreshTokens = new Map<string, string>();

  addUser(user: Omit<FakeUser, "id" | "roles"> & { roles?: FakeRole[] }): FakeUser {
    const created: FakeUser = { id: nextId("user"), roles: [], ...user };
    this.users.push(created);
    return created;
  }

  /** Simula que el servidor revocó todas las sesiones (p. ej. logout-all desde otro equipo). */
  revokeAllSessions(): void {
    this.refreshTokens.clear();
    this.accessTokens.clear();
  }

  /** Refresh tokens que el servidor todavía acepta. */
  liveRefreshTokens(): string[] {
    return [...this.refreshTokens.keys()];
  }

  async install(page: Page): Promise<void> {
    // El botón de Google no se usa en estas pruebas: su script externo se bloquea.
    await page.route("https://accounts.google.com/**", (route) => route.abort());
    await page.route("**/api/v1/**", (route) => this.handle(route));
  }

  private issueTokens(user: FakeUser) {
    const accessToken = nextId("access");
    const refreshToken = nextId("refresh");
    this.accessTokens.set(accessToken, user.id);
    this.refreshTokens.set(refreshToken, user.id);
    return { accessToken, refreshToken, expiresIn: 900, user: { id: user.id, displayName: user.displayName, avatarUrl: null } };
  }

  private userFromBearer(authorization: string | null): FakeUser | undefined {
    const token = authorization?.replace(/^Bearer /, "") ?? "";
    const userId = this.accessTokens.get(token);
    return this.users.find((user) => user.id === userId);
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1/, "");
    const method = request.method();
    const authorization = (await request.headerValue("authorization")) ?? null;
    let body: unknown = undefined;
    try { body = request.postDataJSON(); } catch { body = request.postData(); }
    this.calls.push({ method, path, body, authorization });

    const input = (body ?? {}) as Record<string, string>;
    const reply = (status: number, payload?: unknown) =>
      route.fulfill(payload === undefined
        ? { status }
        : { status, contentType: "application/json", body: JSON.stringify(payload) });

    if (method === "POST" && path === "/auth/login") {
      const user = this.users.find((candidate) => candidate.email.toLowerCase() === String(input.email).toLowerCase());
      if (!user || user.password !== input.password) return reply(401, fail("INVALID_CREDENTIALS", "Invalid credentials."));
      return reply(200, ok(this.issueTokens(user)));
    }

    if (method === "POST" && path === "/auth/register") {
      if (this.users.some((candidate) => candidate.email.toLowerCase() === String(input.email).toLowerCase())) {
        return reply(409, fail("EMAIL_IN_USE", "Email already in use."));
      }
      const user = this.addUser({ email: input.email, password: input.password, displayName: input.displayName });
      return reply(201, ok(this.issueTokens(user)));
    }

    if (method === "POST" && path === "/auth/refresh") {
      const userId = this.refreshTokens.get(input.refreshToken);
      const user = this.users.find((candidate) => candidate.id === userId);
      if (!user) return reply(401, fail("INVALID_REFRESH_TOKEN", "Invalid refresh token."));
      this.refreshTokens.delete(input.refreshToken);
      return reply(200, ok(this.issueTokens(user)));
    }

    if (method === "GET" && path === "/auth/me") {
      const user = this.userFromBearer(authorization);
      if (!user) return reply(401, fail("AUTH_REQUIRED", "Authentication required."));
      return reply(200, ok({
        id: user.id,
        email: user.email,
        profile: { displayName: user.displayName, avatarUrl: null },
        roles: user.roles,
      }));
    }

    if (method === "POST" && path === "/auth/logout") {
      if (!this.userFromBearer(authorization)) return reply(401, fail("AUTH_REQUIRED"));
      this.refreshTokens.delete(input.refreshToken);
      return reply(204);
    }

    if (method === "POST" && path === "/auth/logout-all") {
      const user = this.userFromBearer(authorization);
      if (!user) return reply(401, fail("AUTH_REQUIRED"));
      for (const [token, userId] of this.refreshTokens) if (userId === user.id) this.refreshTokens.delete(token);
      return reply(204);
    }

    if (method === "POST" && path === "/companies") {
      const user = this.userFromBearer(authorization);
      if (!user) return reply(401, fail("AUTH_REQUIRED"));
      const company = { id: nextId("company"), displayName: input.displayName };
      user.roles.push(companyRole("company_admin", company.id, company.displayName));
      return reply(201, ok(company));
    }

    if (method === "PATCH" && path.startsWith("/companies/")) return reply(200, ok({}));

    // El resto del panel (stands, métricas…) no es parte de estas pruebas: listas vacías.
    if (method === "GET") return reply(200, ok([]));
    return reply(404, fail("NOT_FOUND"));
  }
}

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
  private readonly companies = new Map<string, Record<string, unknown>>();
  private readonly stands = new Map<string, Record<string, unknown>>();

  addUser(user: Omit<FakeUser, "id" | "roles"> & { roles?: FakeRole[] }): FakeUser {
    const created: FakeUser = { id: nextId("user"), roles: [], ...user };
    this.users.push(created);
    for (const role of created.roles) {
      if (!role.companyId || this.companies.has(role.companyId)) continue;
      this.companies.set(role.companyId, {
        id: role.companyId, displayName: role.companyName, description: "Empresa de prueba",
        logoPath: null, website: null, contactEmail: "contacto@fexpo.test",
      });
      const standId = "5a000000-0000-4000-8000-000000000001";
      this.stands.set(standId, {
        id: standId, companyId: role.companyId,
        eventId: "e0000000-0000-4000-8000-000000000001", eventName: "FIPAZ 2026",
        boothCode: "A-01", displayName: role.companyName, description: "Stand de prueba",
        tags: ["tecnología"], activityHighlight: null, promotionHighlight: null,
        visitPoints: 50, status: "active",
      });
    }
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
      const company = { id: crypto.randomUUID(), displayName: input.displayName };
      user.roles.push(companyRole("company_admin", company.id, company.displayName));
      this.companies.set(company.id, { ...company, description: input.description ?? null, logoPath: null, website: null, contactEmail: null });
      return reply(201, ok(company));
    }

    const user = this.userFromBearer(authorization);
    const companyMatch = path.match(/^\/companies\/([^/]+)(?:\/(stands|kpis))?$/);
    if (companyMatch && user) {
      const [, companyId, resource] = companyMatch;
      if (!user.roles.some((role) => role.companyId === companyId)) return reply(403, fail("INSUFFICIENT_PERMISSIONS"));
      const company = this.companies.get(companyId);
      if (!company) return reply(404, fail("COMPANY_NOT_FOUND"));
      if (method === "GET" && resource === "stands") return reply(200, ok([...this.stands.values()].filter((stand) => stand.companyId === companyId)));
      if (method === "GET" && resource === "kpis") return reply(200, ok({ activeStands: 1, uniqueVisitors: 2, totalCheckins: 3, firstVisits: 2, activityAttendees: 0, redemptionsValidated: 0, unitsDelivered: 0 }));
      if (method === "GET" && !resource) return reply(200, ok(company));
      if (method === "PATCH" && !resource) {
        if (!user.roles.some((role) => role.companyId === companyId && role.role === "company_admin")) return reply(403, fail("INSUFFICIENT_PERMISSIONS"));
        Object.assign(company, input);
        for (const account of this.users) {
          for (const role of account.roles) {
            if (role.companyId === companyId) role.companyName = String(company.displayName);
          }
        }
        return reply(200, ok(company));
      }
    }

    const standMatch = path.match(/^\/stands\/([^/]+)(?:\/(check-ins|qr))?$/);
    if (standMatch && user) {
      const [, standId, resource] = standMatch;
      const stand = this.stands.get(standId);
      if (!stand) return reply(404, fail("STAND_NOT_FOUND"));
      if (!user.roles.some((role) => role.companyId === stand.companyId)) return reply(403, fail("INSUFFICIENT_PERMISSIONS"));
      if (method === "PATCH" && !resource) {
        if (!user.roles.some((role) => role.companyId === stand.companyId && role.role === "company_admin")) return reply(403, fail("INSUFFICIENT_PERMISSIONS"));
        Object.assign(stand, input);
        return reply(200, ok(stand));
      }
      if (method === "GET" && resource === "check-ins") return reply(200, ok([]));
      if (method === "POST" && resource === "qr") return reply(201, ok({ qrId: crypto.randomUUID(), token: nextId("stand-qr"), expiresAt: new Date(Date.now() + Number(input.ttlSeconds ?? 60) * 1000).toISOString() }));
    }
    if (method === "DELETE" && /^\/qr\/[0-9a-f-]+$/.test(path) && user) return reply(204);

    // El resto de módulos no forma parte de estas pruebas.
    if (method === "GET") return reply(200, ok([]));
    return reply(404, fail("NOT_FOUND"));
  }
}

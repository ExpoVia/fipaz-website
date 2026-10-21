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

    const eventMatch = path.match(/^\/events\/([^/]+)(\/.*)$/);
    if (eventMatch && user) {
      const [, eventId, rest] = eventMatch;
      if (!user.roles.some((role) => role.eventId === eventId)) return reply(403, fail("INSUFFICIENT_PERMISSIONS"));
      const result = this.handleEvent(method, rest, body as Record<string, unknown> | undefined);
      if (result) return reply(result[0], result[1]);
    }

    // El resto de módulos no forma parte de estas pruebas.
    if (method === "GET") return reply(200, ok([]));
    return reply(404, fail("NOT_FOUND"));
  }

  /** Datos del evento del organizador: KPIs, empresas, mapa, categorías, misiones y premios. */
  readonly event = {
    kpis: { activeStands: 2, pointsIssued: 520, uniqueVisits: 8, totalCheckins: 9, activityAttendees: 1, totalParticipants: 4, redemptionsValidated: 0 },
    companies: [
      { id: "ec000000-0000-4000-8000-000000000001", companyId: "c0000000-0000-4000-8000-000000000001", displayName: "Altura Labs", description: null, status: "active", standCount: 1 },
      { id: "ec000000-0000-4000-8000-000000000002", companyId: "c0000000-0000-4000-8000-000000000002", displayName: "Cafe Altiplano", description: null, status: "active", standCount: 1 },
    ],
    categories: [
      { id: "ca000000-0000-4000-8000-000000000001", slug: "gastronomia", label: "Gastronomía", colorToken: null, sortOrder: 1 },
    ] as Record<string, unknown>[],
    zones: [
      { id: "b0000000-0000-4000-8000-000000000001", floorId: "f0000000-0000-4000-8000-000000000001", name: "Bloque Rojo", shortCode: "R", description: "Pabellón I", colorToken: "red" },
    ] as Record<string, unknown>[],
    missions: [] as Record<string, unknown>[],
    rewards: [
      { id: "fe000000-0000-4000-8000-000000000001", name: "Taza FIPAZ", type: "merch", costPoints: 100, isActive: true },
    ],
  };

  private handleEvent(method: string, rest: string, input: Record<string, unknown> = {}): [number, unknown] | null {
    const event = this.event;
    const version = { id: "d0000000-0000-4000-8000-000000000001", version: 1, status: "published", notes: "Plano local", publishedAt: GRANTED_AT };
    const floor = { id: "f0000000-0000-4000-8000-000000000001", code: "PB", name: "Planta Baja", sortOrder: 1 };
    const byId = (list: Record<string, unknown>[], id: string) => list.find((item) => item.id === id);

    if (method === "GET") {
      switch (rest) {
        case "/kpis": return [200, ok(event.kpis)];
        case "/companies": return [200, ok(event.companies)];
        case "/categories": return [200, ok(event.categories)];
        case "/missions": return [200, ok(event.missions)];
        case "/rewards": return [200, ok(event.rewards)];
        case "/leaderboard": return [200, ok([{ position: 1, userId: "u-1", displayName: "Saúl Prueba", avatarUrl: null, rankingScore: 130, level: 2 }])];
        case "/map/versions": return [200, ok([version])];
        case `/map/versions/${version.id}/floors`: return [200, ok([floor])];
        case `/map/floors/${floor.id}/zones`: return [200, ok(event.zones)];
        case "/map": return [200, ok({
          version: 1,
          floors: [{
            ...floor, viewBox: "0 0 800 600", outline: "M0 0H800V600H0Z",
            zones: event.zones.map((zone) => ({ ...zone, path: "M20 20H400V300H20Z" })),
            stands: [{ standId: "5a000000-0000-4000-8000-000000000001", boothCode: "A-01", displayName: "Altura Labs", zoneId: event.zones[0]?.id ?? null, x: 0.25, y: 0.3 }],
          }],
        })];
      }
    }

    if (method === "POST" && rest === "/categories") {
      const category = { id: crypto.randomUUID(), slug: input.slug, label: input.label, colorToken: input.colorToken ?? null, sortOrder: 0 };
      event.categories.push(category);
      return [201, ok(category)];
    }
    const categoryMatch = rest.match(/^\/categories\/([^/]+)$/);
    if (categoryMatch) {
      const category = byId(event.categories, categoryMatch[1]);
      if (!category) return [404, fail("CATEGORY_NOT_FOUND")];
      if (method === "PATCH") return [200, ok(Object.assign(category, input))];
      if (method === "DELETE") { event.categories.splice(event.categories.indexOf(category), 1); return [204, undefined]; }
    }
    const zoneMatch = rest.match(/^\/map\/zones\/([^/]+)$/);
    if (zoneMatch && method === "PATCH") {
      const zone = byId(event.zones, zoneMatch[1]);
      return zone ? [200, ok(Object.assign(zone, input))] : [404, fail("ZONE_NOT_FOUND")];
    }

    if (method === "POST" && rest === "/missions") {
      if (input.mode === "categories" && !(input.categoryIds as unknown[] | undefined)?.length) return [400, fail("VALIDATION_ERROR")];
      const mission = {
        id: crypto.randomUUID(), title: input.title, description: input.description ?? null, mode: input.mode,
        targetCount: input.targetCount ?? 1, pointsReward: input.pointsReward ?? 0, isActive: true, featured: false,
      };
      event.missions.push(mission);
      return [201, ok(mission)];
    }
    const missionMatch = rest.match(/^\/missions\/([^/]+)$/);
    if (missionMatch) {
      const mission = byId(event.missions, missionMatch[1]);
      if (!mission) return [404, fail("MISSION_NOT_FOUND")];
      if (method === "PATCH") return [200, ok(Object.assign(mission, input))];
      if (method === "DELETE") { event.missions.splice(event.missions.indexOf(mission), 1); return [204, undefined]; }
    }
    return null;
  }
}

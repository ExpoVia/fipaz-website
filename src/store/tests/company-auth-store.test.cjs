/* eslint-disable @typescript-eslint/no-require-imports -- Runner `node:test` sobre TypeScript (ver test-utils/register-ts.cjs). */
require("../../test-utils/register-ts.cjs");

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

/** Almacenamiento web mínimo: zustand persiste la sesión en sessionStorage y el panel en localStorage. */
function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: (key) => { data.delete(key); },
    clear: () => data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    get length() { return data.size; },
  };
}

globalThis.localStorage = memoryStorage();
globalThis.sessionStorage = memoryStorage();
globalThis.window = { localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };

const { useCompanyAuthStore } = require("@/store/company-auth-store");
const { usePanelStore } = require("@/store/panel-store");

const ME = {
  id: "user-1",
  email: "ana@example.com",
  profile: { displayName: "Ana Rojas", avatarUrl: null },
  roles: [
    { id: "role-1", role: "company_admin", companyId: "company-1", companyName: "Cafe Altiplano", eventId: null, eventName: null, grantedAt: "2026-10-01T00:00:00.000Z" },
  ],
};

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function mockFetch(routes) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const path = String(url).replace(/^.*\/api\/v1/, "");
    const call = { path, method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ? JSON.parse(init.body) : undefined };
    calls.push(call);
    const handler = routes[`${call.method} ${path}`];
    if (!handler) throw new Error(`Ruta no simulada: ${call.method} ${path}`);
    return handler(call);
  };
  return calls;
}

const LOGIN_ROUTES = {
  "POST /auth/login": () => json(200, { success: true, data: { accessToken: "access-1", refreshToken: "refresh-1", expiresIn: 900 } }),
  "POST /auth/register": () => json(201, { success: true, data: { accessToken: "access-1", refreshToken: "refresh-1", expiresIn: 900 } }),
  "GET /auth/me": () => json(200, { success: true, data: ME }),
};

beforeEach(() => {
  useCompanyAuthStore.setState({ session: null });
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});

test("loginWithPassword guarda la sesión con los roles de /auth/me y el primero como activo", async () => {
  mockFetch(LOGIN_ROUTES);
  const me = await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");

  const session = useCompanyAuthStore.getState().session;
  assert.equal(me.id, "user-1");
  assert.equal(session.accessToken, "access-1");
  assert.equal(session.refreshToken, "refresh-1");
  assert.equal(session.activeRoleId, "role-1");
  assert.ok(Date.parse(session.expiresAt) > Date.now());
  // Persiste en sessionStorage para sobrevivir a una recarga.
  assert.match(globalThis.sessionStorage.getItem("expovia-company-auth:v4"), /refresh-1/);
});

test("loginWithPassword usa siempre el mismo id de dispositivo del navegador", async () => {
  const calls = mockFetch(LOGIN_ROUTES);
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  const devices = calls.filter((call) => call.path === "/auth/login").map((call) => call.body.device.id);
  assert.equal(devices[0], devices[1]);
  assert.match(devices[0], /^[0-9a-f-]{36}$/);
});

test("setActiveRole con el rol que ya está activo no cambia la sesión (evita bucles de render)", async () => {
  mockFetch(LOGIN_ROUTES);
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  const before = useCompanyAuthStore.getState().session;
  let notifications = 0;
  const unsubscribe = useCompanyAuthStore.subscribe(() => { notifications += 1; });

  useCompanyAuthStore.getState().setActiveRole("role-1");
  useCompanyAuthStore.getState().setActiveRole("rol-que-no-existe");
  unsubscribe();

  assert.equal(useCompanyAuthStore.getState().session, before);
  assert.equal(notifications, 0);
});

test("un login fallido no deja sesión", async () => {
  mockFetch({ "POST /auth/login": () => json(401, { success: false, error: { code: "INVALID_CREDENTIALS", message: "x" } }) });
  await assert.rejects(useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "mala"));
  assert.equal(useCompanyAuthStore.getState().session, null);
});

test("registerWithPassword deja la sesión iniciada aunque todavía no tenga roles", async () => {
  mockFetch({ ...LOGIN_ROUTES, "GET /auth/me": () => json(200, { success: true, data: { ...ME, roles: [] } }) });
  await useCompanyAuthStore.getState().registerWithPassword({ email: "ana@example.com", password: "secreto123", displayName: "Ana" });
  const session = useCompanyAuthStore.getState().session;
  assert.equal(session.email, "ana@example.com");
  assert.deepEqual(session.roles, []);
  assert.equal(session.activeRoleId, null);
});

test("logout invalida el refresh token en el servidor y limpia la sesión", async () => {
  const calls = mockFetch({ ...LOGIN_ROUTES, "POST /auth/logout": () => json(204) });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");

  await useCompanyAuthStore.getState().logout();

  const logout = calls.find((call) => call.path === "/auth/logout");
  assert.deepEqual(logout.body, { refreshToken: "refresh-1" });
  assert.equal(logout.headers.Authorization, "Bearer access-1");
  assert.equal(useCompanyAuthStore.getState().session, null);
  assert.doesNotMatch(globalThis.sessionStorage.getItem("expovia-company-auth:v4") ?? "", /refresh-1/);
});

test("logout limpia la sesión local aunque el backend no responda", async () => {
  mockFetch({ ...LOGIN_ROUTES, "POST /auth/logout": () => { throw new TypeError("fetch failed"); } });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  await useCompanyAuthStore.getState().logout();
  assert.equal(useCompanyAuthStore.getState().session, null);
});

test("logout con el access token vencido lo renueva antes de cerrar en el servidor", async () => {
  const calls = mockFetch({
    ...LOGIN_ROUTES,
    "POST /auth/refresh": () => json(200, { success: true, data: { accessToken: "access-2", refreshToken: "refresh-2", expiresIn: 900 } }),
    "POST /auth/logout": () => json(204),
  });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  const session = useCompanyAuthStore.getState().session;
  useCompanyAuthStore.setState({ session: { ...session, expiresAt: new Date(Date.now() - 1000).toISOString() } });

  await useCompanyAuthStore.getState().logout();

  const logout = calls.find((call) => call.path === "/auth/logout");
  assert.deepEqual(logout.body, { refreshToken: "refresh-2" });
  assert.equal(logout.headers.Authorization, "Bearer access-2");
});

test("logoutAll cierra todas las sesiones de la cuenta", async () => {
  const calls = mockFetch({ ...LOGIN_ROUTES, "POST /auth/logout-all": () => json(204) });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  await useCompanyAuthStore.getState().logoutAll();
  assert.ok(calls.some((call) => call.path === "/auth/logout-all" && call.headers.Authorization === "Bearer access-1"));
  assert.equal(useCompanyAuthStore.getState().session, null);
});

test("si el refresh es rechazado (sesión expirada) la sesión se cierra", async () => {
  mockFetch({
    ...LOGIN_ROUTES,
    "POST /auth/refresh": () => json(401, { success: false, error: { code: "INVALID_REFRESH_TOKEN", message: "x" } }),
  });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  assert.equal(await useCompanyAuthStore.getState().refreshAccessToken(), false);
  assert.equal(useCompanyAuthStore.getState().session, null);
});

test("si el refresh falla por red la sesión se conserva para reintentar", async () => {
  mockFetch({ ...LOGIN_ROUTES, "POST /auth/refresh": () => { throw new TypeError("fetch failed"); } });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  assert.equal(await useCompanyAuthStore.getState().refreshAccessToken(), false);
  assert.notEqual(useCompanyAuthStore.getState().session, null);
});

test("al terminar la sesión se vacía el estado guardado del panel", async () => {
  mockFetch({ ...LOGIN_ROUTES, "POST /auth/logout": () => json(204) });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  const seeded = usePanelStore.getState().companies.length;
  usePanelStore.getState().registerCompany(
    { name: "Mi Empresa", category: "technology", contactEmail: "a@b.co", description: "Descripción de prueba suficiente" },
    "company-nueva",
  );
  assert.equal(usePanelStore.getState().activeCompanyId, "company-nueva");
  assert.match(globalThis.localStorage.getItem("expovia-panel:v1"), /company-nueva/);

  await useCompanyAuthStore.getState().logout();

  assert.equal(usePanelStore.getState().companies.length, seeded);
  assert.notEqual(usePanelStore.getState().activeCompanyId, "company-nueva");
  assert.doesNotMatch(globalThis.localStorage.getItem("expovia-panel:v1") ?? "", /company-nueva/);
});

test("el refresh rechazado también vacía el estado del panel", async () => {
  mockFetch({
    ...LOGIN_ROUTES,
    "POST /auth/refresh": () => json(401, { success: false, error: { code: "SESSION_REVOKED", message: "x" } }),
  });
  await useCompanyAuthStore.getState().loginWithPassword("ana@example.com", "secreto123");
  usePanelStore.getState().registerCompany(
    { name: "Otra", category: "technology", contactEmail: "a@b.co", description: "Descripción de prueba suficiente" },
    "company-otra",
  );
  await useCompanyAuthStore.getState().refreshAccessToken();
  assert.ok(!usePanelStore.getState().companies.some((company) => company.id === "company-otra"));
});

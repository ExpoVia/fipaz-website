/* eslint-disable @typescript-eslint/no-require-imports -- Runner `node:test` sobre TypeScript (ver test-utils/register-ts.cjs). */
require("../../../test-utils/register-ts.cjs");

const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const {
  authenticateWithPassword,
  registerWithPassword,
  passwordProblem,
  isPasswordLoginEnabled,
  CompanyAuthError,
} = require("@/lib/api/company-auth");
const { canEditCompany } = require("@/lib/panel-access");

const DEVICE_ID = "11111111-1111-4111-8111-111111111111";
const TOKENS = { accessToken: "access-1", refreshToken: "refresh-1", expiresIn: 900 };
const ME = {
  id: "user-1",
  email: "ana@example.com",
  profile: { displayName: "Ana Rojas", avatarUrl: null },
  roles: [
    { id: "role-1", role: "company_admin", companyId: "company-1", companyName: "Cafe Altiplano", eventId: null, eventName: null, grantedAt: "2026-10-01T00:00:00.000Z" },
    { id: "role-x", role: "visitor_plus", companyId: null, companyName: null, eventId: null, eventName: null, grantedAt: "2026-10-01T00:00:00.000Z" },
  ],
};

function envelope(data) {
  return { success: true, data, meta: null };
}

function failure(code, message = code) {
  return { success: false, error: { code, message, details: null } };
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Reemplaza `fetch` por respuestas por ruta y registra cada llamada. */
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

const originalFetch = globalThis.fetch;
const originalFlag = process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED;
beforeEach(() => { delete process.env.NEXT_PUBLIC_AGENT_BACKEND_URL; });
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED;
  else process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED = originalFlag;
});

test("login con contraseña: envía credenciales y dispositivo web, y luego pide /auth/me con el token", async () => {
  const calls = mockFetch({
    "POST /auth/login": () => json(200, envelope(TOKENS)),
    "GET /auth/me": () => json(200, envelope(ME)),
  });

  const { tokens, me } = await authenticateWithPassword("  ana@example.com ", "secreto123", DEVICE_ID);

  assert.deepEqual(calls[0].body, { email: "ana@example.com", password: "secreto123", device: { id: DEVICE_ID, platform: "web" } });
  assert.equal(calls[1].headers.Authorization, "Bearer access-1");
  assert.deepEqual(tokens, TOKENS);
  assert.equal(me.displayName, "Ana Rojas");
  // Los roles salen de roles[] y un rol desconocido se ignora sin romper el login.
  assert.deepEqual(me.roles.map((role) => [role.role, role.companyId, role.companyName]), [["company_admin", "company-1", "Cafe Altiplano"]]);
});

test("login con contraseña: no envía espacios de más ni toca la contraseña", async () => {
  const calls = mockFetch({
    "POST /auth/login": () => json(200, envelope(TOKENS)),
    "GET /auth/me": () => json(200, envelope(ME)),
  });
  await authenticateWithPassword("ana@example.com", "  con espacios  ", DEVICE_ID);
  assert.equal(calls[0].body.password, "  con espacios  ");
});

test("login con contraseña: credenciales inválidas dan un mensaje claro y no consultan /auth/me", async () => {
  const calls = mockFetch({ "POST /auth/login": () => json(401, failure("INVALID_CREDENTIALS", "Invalid credentials.")) });

  await assert.rejects(authenticateWithPassword("ana@example.com", "mala", DEVICE_ID), (error) => {
    assert.ok(error instanceof CompanyAuthError);
    assert.equal(error.status, 401);
    assert.equal(error.message, "Correo o contraseña incorrectos.");
    return true;
  });
  assert.equal(calls.length, 1);
});

test("login con contraseña: un 400 de validación (contraseña corta) se muestra como credenciales incorrectas", async () => {
  mockFetch({
    "POST /auth/login": () => json(400, { success: false, error: { code: "VALIDATION_ERROR", message: "Parámetros inválidos.", details: ["password must be longer than or equal to 8 characters"] } }),
  });
  await assert.rejects(authenticateWithPassword("ana@example.com", "corta", DEVICE_ID), (error) => {
    assert.equal(error.message, "Correo o contraseña incorrectos.");
    assert.equal(error.status, 400);
    return true;
  });
});

test("login con contraseña: 429 avisa que hay que esperar aunque el backend no mande código", async () => {
  mockFetch({ "POST /auth/login": () => json(429, { statusCode: 429, message: "ThrottlerException: Too Many Requests" }) });
  await assert.rejects(authenticateWithPassword("ana@example.com", "x", DEVICE_ID), /Demasiados intentos/);
});

test("login con contraseña: el entorno puede tenerlo deshabilitado", async () => {
  mockFetch({ "POST /auth/login": () => json(404, failure("PASSWORD_AUTH_DISABLED")) });
  await assert.rejects(authenticateWithPassword("ana@example.com", "secreto123", DEVICE_ID), /no está habilitado/);
});

test("login con contraseña: sin conexión con el backend da un error legible", async () => {
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(authenticateWithPassword("ana@example.com", "secreto123", DEVICE_ID), /No se pudo conectar/);
});

test("login con contraseña: tokens incompletos se rechazan", async () => {
  mockFetch({ "POST /auth/login": () => json(200, envelope({ accessToken: "solo-access" })) });
  await assert.rejects(authenticateWithPassword("ana@example.com", "secreto123", DEVICE_ID), /tokens de sesión/);
});

test("registro con contraseña: envía nombre y correo sin espacios y devuelve la sesión sin roles", async () => {
  const calls = mockFetch({
    "POST /auth/register": () => json(201, envelope(TOKENS)),
    "GET /auth/me": () => json(200, envelope({ ...ME, roles: [] })),
  });

  const { me } = await registerWithPassword({ email: " ana@example.com", password: "secreto123", displayName: " Ana Rojas " }, DEVICE_ID);

  assert.deepEqual(calls[0].body, {
    email: "ana@example.com",
    password: "secreto123",
    displayName: "Ana Rojas",
    device: { id: DEVICE_ID, platform: "web" },
  });
  assert.deepEqual(me.roles, []);
});

test("registro con contraseña: un correo ya registrado se explica en el formulario", async () => {
  mockFetch({ "POST /auth/register": () => json(409, failure("EMAIL_IN_USE", "Email already in use.")) });
  await assert.rejects(
    registerWithPassword({ email: "ana@example.com", password: "secreto123", displayName: "Ana" }, DEVICE_ID),
    (error) => error.status === 409 && /ya tiene una cuenta/.test(error.message),
  );
});

test("registro con contraseña: los errores de validación del backend llegan con su detalle", async () => {
  mockFetch({
    "POST /auth/register": () => json(400, { success: false, error: { code: "VALIDATION_ERROR", message: "Datos inválidos.", details: ["password must be longer than or equal to 8 characters"] } }),
  });
  await assert.rejects(
    registerWithPassword({ email: "ana@example.com", password: "corta", displayName: "Ana" }, DEVICE_ID),
    /Datos inválidos\. password must be longer/,
  );
});

test("passwordProblem aplica los mismos límites que el backend (8 a 128)", () => {
  assert.match(passwordProblem("1234567"), /al menos 8/);
  assert.equal(passwordProblem("12345678"), null);
  assert.equal(passwordProblem("x".repeat(128)), null);
  assert.match(passwordProblem("x".repeat(129)), /128/);
});

test("isPasswordLoginEnabled solo se activa con NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED=true", () => {
  delete process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED;
  assert.equal(isPasswordLoginEnabled(), false);
  process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED = "1";
  assert.equal(isPasswordLoginEnabled(), false);
  process.env.NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED = "true";
  assert.equal(isPasswordLoginEnabled(), true);
});

test("canEditCompany: el admin de la empresa edita, el personal no", () => {
  const admin = { id: "a", role: "company_admin", companyId: "c1", companyName: "C1", eventId: null, eventName: null };
  const staff = { id: "s", role: "company_staff", companyId: "c2", companyName: "C2", eventId: null, eventName: null };

  assert.equal(canEditCompany({ roles: [admin], activeRoleId: "a" }), true);
  assert.equal(canEditCompany({ roles: [staff], activeRoleId: "s" }), false);
  // Con los dos roles manda el que está activo.
  assert.equal(canEditCompany({ roles: [admin, staff], activeRoleId: "s" }), false);
  assert.equal(canEditCompany({ roles: [admin, staff], activeRoleId: "a" }), true);
  assert.equal(canEditCompany(null), false);
});

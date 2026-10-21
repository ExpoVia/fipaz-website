import { expect, test, type Page } from "@playwright/test";

import { companyRole, eventAdminRole, FakeBackend } from "./support/fake-backend";

const PASSWORD = "Prueba1234!";
const SEED_COMPANY_ID = "c0000000-0000-4000-8000-000000000001";

function createBackend() {
  const backend = new FakeBackend();
  backend.addUser({
    email: "expositor@fexpo.test", password: PASSWORD, displayName: "Expositor Prueba",
    roles: [companyRole("company_admin", SEED_COMPANY_ID, "Altura Labs")],
  });
  backend.addUser({
    email: "personal@fexpo.test", password: PASSWORD, displayName: "Personal Prueba",
    roles: [companyRole("company_staff", SEED_COMPANY_ID, "Altura Labs")],
  });
  backend.addUser({
    email: "organizador@fexpo.test", password: PASSWORD, displayName: "Organizador Prueba",
    roles: [eventAdminRole("e0000000-0000-4000-8000-000000000001", "FIPAZ 2026")],
  });
  backend.addUser({ email: "sinrol@fexpo.test", password: PASSWORD, displayName: "Sin Rol" });
  return backend;
}

async function loginWithPassword(page: Page, email: string, password = PASSWORD, panel = "expositor") {
  await page.goto(`/acceso?panel=${panel}`);
  const form = page.getByRole("form", { name: "Iniciar sesión" });
  await form.getByLabel("Correo").fill(email);
  await form.getByLabel("Contraseña", { exact: true }).fill(password);
  await form.getByRole("button", { name: "Iniciar sesión" }).click();
}

let backend: FakeBackend;

test.beforeEach(async ({ page }) => {
  backend = createBackend();
  await backend.install(page);
});

test.describe("acceso con correo y contraseña", () => {
  test("el expositor entra a su panel y ve su empresa", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");

    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("button", { name: /Expositor · Altura Labs/ })).toBeVisible();
    await expect(page.getByText("Datos de demostración.")).toHaveCount(0);
    await expect(page.getByText("Check-ins", { exact: true })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Navegación del panel" }).getByRole("link", { name: "Mi stand", exact: true })).toBeVisible();

    const login = backend.calls.find((call) => call.path === "/auth/login");
    expect(login?.body).toMatchObject({ email: "expositor@fexpo.test", password: PASSWORD, device: { platform: "web" } });
  });

  test("una contraseña incorrecta muestra el error y no abre sesión", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test", "otra-clave");

    await expect(page.getByRole("form", { name: "Iniciar sesión" }).getByRole("alert")).toHaveText("Correo o contraseña incorrectos.");
    await expect(page).toHaveURL(/\/acceso/);
    const stored = await page.evaluate(() => sessionStorage.getItem("expovia-company-auth:v4"));
    expect(stored === null || JSON.parse(stored).state.session === null).toBe(true);
  });

  test("valida el correo antes de llamar al backend", async ({ page }) => {
    await loginWithPassword(page, "no-es-un-correo");

    await expect(page.getByRole("form", { name: "Iniciar sesión" }).getByRole("alert")).toHaveText("Ingresa un correo válido.");
    expect(backend.calls.some((call) => call.path === "/auth/login")).toBe(false);
  });

  test("el botón del ojo muestra y oculta la contraseña", async ({ page }) => {
    await page.goto("/acceso?panel=expositor");
    const password = page.getByLabel("Contraseña", { exact: true });
    await password.fill("secreta");
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Ocultar contraseña" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test("recargar la página mantiene la sesión", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.reload();
    await expect(page.getByRole("button", { name: /Expositor · Altura Labs/ })).toBeVisible();
    await expect(page).toHaveURL(/\/panel$/);
  });
});

test.describe("paneles separados por rol", () => {
  test("el organizador entra a su panel con su propia navegación", async ({ page }) => {
    await loginWithPassword(page, "organizador@fexpo.test", PASSWORD, "organizador");

    await expect(page).toHaveURL(/\/panel$/);
    const nav = page.getByRole("complementary", { name: "Navegación del panel" });
    await expect(nav.getByRole("link", { name: "Expositores" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Mi stand", exact: true })).toHaveCount(0);
  });

  test("el organizador vuelve a su panel al abrir una ruta del expositor", async ({ page }) => {
    await loginWithPassword(page, "organizador@fexpo.test", PASSWORD, "organizador");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/mi-stand");
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("complementary", { name: "Navegación del panel" }).getByRole("link", { name: "Expositores" })).toBeVisible();
  });

  test("el expositor vuelve a su panel al abrir una ruta del organizador", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/expositores");
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("complementary", { name: "Navegación del panel" }).getByRole("link", { name: "Mi stand", exact: true })).toBeVisible();
  });

  test("al iniciar sesión desde el enlace del otro panel entra al suyo", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test", PASSWORD, "organizador");
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("button", { name: /Expositor · Altura Labs/ })).toBeVisible();
  });

  test("el organizador también entra al suyo desde el enlace de expositor", async ({ page }) => {
    await loginWithPassword(page, "organizador@fexpo.test", PASSWORD, "expositor");
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("complementary", { name: "Navegación del panel" }).getByRole("link", { name: "Expositores" })).toBeVisible();
  });

  test("una cuenta sin rol no ve ningún panel y se le ofrece registrar su empresa", async ({ page }) => {
    await loginWithPassword(page, "sinrol@fexpo.test");

    await expect(page.getByRole("heading", { name: "Sin acceso al panel" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrar mi empresa" })).toHaveAttribute("href", "/registro-empresa");
  });

  test("sin sesión, /panel lleva a la pantalla de acceso sin mostrar contenido protegido", async ({ page }) => {
    await page.goto("/panel/mi-stand");
    await expect(page).toHaveURL(/\/acceso\?panel=expositor/);
    await expect(page.getByRole("heading", { name: "Acceso de expositor" })).toBeVisible();
  });

  test("el personal de la empresa ve el perfil en solo lectura", async ({ page }) => {
    await loginWithPassword(page, "personal@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/mi-stand");
    await expect(page.getByRole("link", { name: "Gestionar QR" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Editar perfil" })).toHaveCount(0);

    await page.goto("/admin/company/profile");
    await expect(page.getByRole("note")).toContainText("Solo lectura");
    await expect(page.getByRole("button", { name: "Guardar cambios" })).toHaveCount(0);
    expect(backend.calls.some((call) => call.method === "PATCH")).toBe(false);
  });

  test("el admin de la empresa sí puede editar el perfil", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/mi-stand");
    await expect(page.getByRole("link", { name: "Editar perfil" })).toBeVisible();
    await page.goto("/admin/company/profile");
    await expect(page.getByRole("button", { name: "Guardar cambios" })).toBeVisible();
  });
});

test.describe("panel real de expositor", () => {
  test("el stand se guarda en el backend y persiste tras recargar", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/mi-stand/editar");
    await page.getByLabel("Nombre visible").fill("Altura Labs Renovado");
    await page.getByLabel("Descripción").fill("Nuevo texto del stand");
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page).toHaveURL(/\/panel\/mi-stand$/);
    await expect(page.getByRole("heading", { name: "Altura Labs Renovado" })).toBeVisible();
    await expect(page.getByText("Nuevo texto del stand")).toBeVisible();
    expect(backend.calls.find((call) => call.method === "PATCH" && call.path === "/stands/5a000000-0000-4000-8000-000000000001")?.body)
      .toMatchObject({ displayName: "Altura Labs Renovado", description: "Nuevo texto del stand" });

    await page.reload();
    await expect(page.getByRole("heading", { name: "Altura Labs Renovado" })).toBeVisible();
  });

  test("la empresa se guarda en el backend y persiste tras recargar", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/empresa");
    await page.getByLabel("Nombre de la empresa").fill("Altura Labs Bolivia");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("status")).toContainText("Cambios guardados en el servidor.");
    await expect(page.getByRole("button", { name: /Expositor · Altura Labs Bolivia/ })).toBeVisible();
    expect(backend.calls.find((call) => call.method === "PATCH" && call.path === `/companies/${SEED_COMPANY_ID}`)?.body)
      .toMatchObject({ displayName: "Altura Labs Bolivia" });

    await page.reload();
    await expect(page.getByLabel("Nombre de la empresa")).toHaveValue("Altura Labs Bolivia");
  });

  test("el QR se emite y revoca usando el backend", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.goto("/panel/mi-stand/qr");
    await page.getByRole("button", { name: "Generar QR" }).click();
    await expect(page.getByRole("button", { name: "Revocar QR" })).toBeVisible();
    const issue = backend.calls.find((call) => call.method === "POST" && call.path === "/stands/5a000000-0000-4000-8000-000000000001/qr");
    expect(issue?.body).toMatchObject({ ttlSeconds: 60, maxScans: 10 });
    expect(issue?.authorization).toMatch(/^Bearer /);

    await page.getByRole("button", { name: "Revocar QR" }).click();
    await expect(page.getByRole("button", { name: "Revocar QR" })).toHaveCount(0);
    expect(backend.calls.some((call) => call.method === "DELETE" && /^\/qr\/[0-9a-f-]+$/.test(call.path))).toBe(true);
  });
});

test.describe("panel real de organizador", () => {
  const EVENT_PATH = "/events/e0000000-0000-4000-8000-000000000001";

  async function enterAsOrganizer(page: Page) {
    await loginWithPassword(page, "organizador@fexpo.test", PASSWORD, "organizador");
    await expect(page).toHaveURL(/\/panel$/);
  }

  test("el resumen muestra KPIs y empresas del backend, sin aviso de demostración", async ({ page }) => {
    await enterAsOrganizer(page);
    await expect(page.getByRole("heading", { name: "Panorama del evento" })).toBeVisible();
    await expect(page.getByText("Participantes", { exact: true })).toBeVisible();
    await expect(page.getByText("Cafe Altiplano")).toBeVisible();
    await expect(page.getByText("Datos de demostración.")).toHaveCount(0);
    expect(backend.calls.some((call) => call.path === `${EVENT_PATH}/kpis` && call.authorization?.startsWith("Bearer "))).toBe(true);
  });

  test("las métricas muestran stands por zona y el ranking", async ({ page }) => {
    await enterAsOrganizer(page);
    await page.goto("/panel/metricas-evento");
    await expect(page.getByText("Bloque Rojo")).toBeVisible();
    await expect(page.getByText("Saúl Prueba")).toBeVisible();
  });

  test("el mapa lista las versiones y dibuja el piso publicado", async ({ page }) => {
    await enterAsOrganizer(page);
    await page.goto("/panel/mapa-evento");
    await expect(page.getByRole("cell", { name: "Publicada" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Plano de Planta Baja" })).toBeVisible();
  });

  test("se crea, renombra y elimina una categoría, y se edita una zona", async ({ page }) => {
    await enterAsOrganizer(page);
    await page.goto("/panel/zonas-categorias");

    await page.getByLabel("Nueva categoría").fill("Tecnología Verde");
    await page.getByRole("button", { name: "Agregar categoría" }).click();
    const input = page.getByLabel("Nombre de la categoría Tecnología Verde");
    await expect(input).toBeVisible();
    expect(backend.calls.find((call) => call.method === "POST" && call.path === `${EVENT_PATH}/categories`)?.body)
      .toMatchObject({ label: "Tecnología Verde", slug: "tecnologia-verde" });

    await input.fill("Tecnología Limpia");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Guardar", exact: true })).toHaveCount(0);
    expect(backend.event.categories.some((category) => category.label === "Tecnología Limpia")).toBe(true);

    await page.getByRole("button", { name: "Eliminar categoría Tecnología Limpia" }).click();
    await page.getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(page.getByLabel("Nombre de la categoría Tecnología Limpia")).toHaveCount(0);
    expect(backend.event.categories).toHaveLength(1);

    await page.getByRole("button", { name: "Editar zona Bloque Rojo" }).click();
    await page.getByLabel("Nombre", { exact: true }).fill("Pabellón Rojo");
    await page.getByRole("button", { name: "Guardar zona" }).click();
    await expect(page.getByText("Pabellón Rojo")).toBeVisible();
    expect(backend.calls.find((call) => call.method === "PATCH" && call.path.endsWith("/map/zones/b0000000-0000-4000-8000-000000000001"))?.body)
      .toMatchObject({ name: "Pabellón Rojo", shortCode: "R" });
  });

  test("se crea, pausa y elimina una misión, y se ven los premios", async ({ page }) => {
    await enterAsOrganizer(page);
    await page.goto("/panel/gamificacion");
    await expect(page.getByText("Taza FIPAZ")).toBeVisible();

    await page.getByLabel("Título").fill("Ruta del café");
    await page.getByLabel("Visitas requeridas").fill("2");
    await page.getByLabel("Gastronomía").check();
    await page.getByRole("button", { name: "Crear misión" }).click();
    const card = page.getByRole("article", { name: "Misión Ruta del café" });
    await expect(card).toContainText("Por categorías · 2 visitas");
    expect(backend.calls.find((call) => call.method === "POST" && call.path === `${EVENT_PATH}/missions`)?.body)
      .toMatchObject({ title: "Ruta del café", mode: "categories", targetCount: 2, categoryIds: ["ca000000-0000-4000-8000-000000000001"] });

    await card.getByRole("button", { name: "Pausar" }).click();
    await expect(card).toContainText("Pausada");
    await card.getByRole("button", { name: "Eliminar" }).click();
    await card.getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(card).toHaveCount(0);
    expect(backend.event.missions).toHaveLength(0);
  });

  test("eventos muestra el evento activo con sus cifras", async ({ page }) => {
    await enterAsOrganizer(page);
    await page.goto("/panel/eventos");
    await expect(page.getByText("Evento activo")).toBeVisible();
    await expect(page.getByText("4 participantes · 9 check-ins · 2 stands activos")).toBeVisible();
  });
});

test.describe("cierre de sesión", () => {
  test("cerrar sesión invalida el refresh token en el servidor y vacía el estado guardado", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);
    expect(backend.liveRefreshTokens()).toHaveLength(1);

    await page.getByRole("button", { name: /Expositor · Altura Labs/ }).click();
    await page.getByRole("menuitem", { name: "Cerrar sesión", exact: true }).click();

    await expect(page).toHaveURL(/\/acceso\?panel=expositor/);
    await expect.poll(() => backend.liveRefreshTokens()).toHaveLength(0);
    const logout = backend.calls.find((call) => call.path === "/auth/logout");
    expect(logout?.authorization).toMatch(/^Bearer /);
    expect(await page.evaluate(() => sessionStorage.getItem("expovia-company-auth:v4") ?? "")).not.toMatch(/refresh-/);
  });

  test("cerrar sesión en todos los dispositivos usa /auth/logout-all", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    await page.getByRole("button", { name: /Expositor · Altura Labs/ }).click();
    await page.getByRole("menuitem", { name: "Cerrar sesión en todos los dispositivos" }).click();

    await expect(page).toHaveURL(/\/acceso\?panel=expositor/);
    await expect.poll(() => backend.calls.some((call) => call.path === "/auth/logout-all")).toBe(true);
  });

  test("el drawer móvil también permite cerrar sesión", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginWithPassword(page, "organizador@fexpo.test", PASSWORD, "organizador");
    await expect(page).toHaveURL(/\/panel$/);

    await page.getByRole("button", { name: "Abrir navegación del panel" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cerrar sesión", exact: true }).click();

    await expect(page).toHaveURL(/\/acceso\?panel=organizador/);
    await expect.poll(() => backend.liveRefreshTokens()).toHaveLength(0);
  });

  test("si el servidor rechaza el refresh, la sesión vencida vuelve a la pantalla de acceso", async ({ page }) => {
    await loginWithPassword(page, "expositor@fexpo.test");
    await expect(page).toHaveURL(/\/panel$/);

    // Access token vencido en el navegador y sesiones revocadas en el servidor.
    await page.evaluate(() => {
      const key = "expovia-company-auth:v4";
      const stored = JSON.parse(sessionStorage.getItem(key) ?? "{}");
      stored.state.session.expiresAt = new Date(Date.now() - 60_000).toISOString();
      sessionStorage.setItem(key, JSON.stringify(stored));
    });
    backend.revokeAllSessions();

    await page.reload();
    await expect(page).toHaveURL(/\/acceso\?panel=expositor/);
    await expect(page.getByRole("heading", { name: "Acceso de expositor" })).toBeVisible();
  });
});

test.describe("registro de empresa con correo y contraseña", () => {
  async function fillCompanyStep(page: Page) {
    await page.goto("/registro-empresa");
    await page.locator("#company-name").fill("Mi Empresa Nueva");
    await page.getByRole("button", { name: "Tecnología" }).click();
    await page.locator("#company-email").fill("contacto@miempresa.com");
    await page.locator("#company-description").fill("Empresa de prueba creada desde el registro con contraseña.");
    await page.getByRole("button", { name: /Siguiente paso/ }).click();
  }

  test("crea la cuenta, registra la empresa y entra al panel de expositor", async ({ page }) => {
    await fillCompanyStep(page);

    const form = page.getByRole("form", { name: "Crear cuenta y registrar empresa" });
    await expect(form.getByLabel("Correo")).toHaveValue("contacto@miempresa.com");
    await form.getByLabel("Tu nombre").fill("Ana Rojas");
    await form.getByLabel("Correo").fill("ana@miempresa.com");
    await form.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
    await form.getByRole("button", { name: "Crear cuenta y registrar empresa" }).click();

    await expect(page.getByRole("heading", { name: "¡Empresa registrada!" })).toBeVisible();
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("button", { name: /Expositor · Mi Empresa Nueva/ })).toBeVisible();

    const paths = backend.calls.map((call) => `${call.method} ${call.path}`);
    expect(paths).toEqual(expect.arrayContaining(["POST /auth/register", "POST /companies"]));
    expect(paths.indexOf("POST /auth/register")).toBeLessThan(paths.indexOf("POST /companies"));
    expect(backend.calls.find((call) => call.path === "/auth/register")?.body)
      .toMatchObject({ email: "ana@miempresa.com", displayName: "Ana Rojas", device: { platform: "web" } });
  });

  test("una contraseña corta se rechaza en el formulario", async ({ page }) => {
    await fillCompanyStep(page);
    const form = page.getByRole("form", { name: "Crear cuenta y registrar empresa" });
    await form.getByLabel("Tu nombre").fill("Ana Rojas");
    await form.getByLabel("Contraseña", { exact: true }).fill("corta");
    await form.getByRole("button", { name: "Crear cuenta y registrar empresa" }).click();

    await expect(form.getByRole("alert")).toHaveText("La contraseña debe tener al menos 8 caracteres.");
    expect(backend.calls.some((call) => call.path === "/auth/register")).toBe(false);
  });

  test("un correo ya registrado muestra el error del backend", async ({ page }) => {
    await fillCompanyStep(page);
    const form = page.getByRole("form", { name: "Crear cuenta y registrar empresa" });
    await form.getByLabel("Tu nombre").fill("Otra Persona");
    await form.getByLabel("Correo").fill("expositor@fexpo.test");
    await form.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
    await form.getByRole("button", { name: "Crear cuenta y registrar empresa" }).click();

    await expect(form.getByRole("alert")).toContainText("ya tiene una cuenta");
    expect(backend.calls.some((call) => call.path === "/companies")).toBe(false);
  });

  test("una cuenta existente sin empresa puede iniciar sesión y registrarla", async ({ page }) => {
    await fillCompanyStep(page);
    await page.getByRole("button", { name: "Inicia sesión" }).click();

    const form = page.getByRole("form", { name: "Iniciar sesión y registrar empresa" });
    await form.getByLabel("Correo").fill("sinrol@fexpo.test");
    await form.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
    await form.getByRole("button", { name: "Iniciar sesión y registrar empresa" }).click();

    await expect(page).toHaveURL(/\/panel$/);
    expect(backend.calls.some((call) => call.path === "/auth/login")).toBe(true);
    expect(backend.calls.some((call) => call.path === "/companies")).toBe(true);
  });
});

import { expect, test, type Page } from "@playwright/test";

/**
 * Contra fexpo-backend real (puerto 3000, proxy /api/v1 de Next) y la BD local de
 * fexpo_database/local-dev, con las cuentas de prueba creadas por `scripts/set-password.mjs`.
 * Solo corre con `E2E_REAL_BACKEND=1`: `E2E_REAL_BACKEND=1 pnpm test:e2e real-backend`.
 */
test.skip(process.env.E2E_REAL_BACKEND !== "1", "Requiere el backend y la BD local levantados.");

const PASSWORD = process.env.E2E_PASSWORD ?? "Prueba1234!";

async function login(page: Page, email: string, panel: "expositor" | "organizador") {
  await page.route("https://accounts.google.com/**", (route) => route.abort());
  await page.goto(`/acceso?panel=${panel}`);
  const form = page.getByRole("form", { name: "Iniciar sesión" });
  await form.getByLabel("Correo").fill(email);
  await form.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await form.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/panel$/);
}

function storedRefreshToken(page: Page): Promise<string> {
  return page.evaluate(() => JSON.parse(sessionStorage.getItem("expovia-company-auth:v4") ?? "{}").state?.session?.refreshToken ?? "");
}

test("expositor real: entra con contraseña y al cerrar sesión su refresh token deja de servir", async ({ page }) => {
  await login(page, "expositor@fexpo.test", "expositor");
  await expect(page.getByRole("button", { name: /Expositor · / })).toBeVisible();
  const refreshToken = await storedRefreshToken(page);
  expect(refreshToken).not.toBe("");

  await page.getByRole("button", { name: /Expositor · / }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/acceso\?panel=expositor/);

  // Criterio de aceptación de la #58: POST /auth/refresh con ese token da error.
  await expect.poll(async () => (await page.request.post("/api/v1/auth/refresh", { data: { refreshToken } })).status()).toBe(401);
});

test("organizador real: entra a su panel y vuelve a él desde rutas del expositor", async ({ page }) => {
  await login(page, "organizador@fexpo.test", "organizador");
  await expect(page.getByRole("complementary", { name: "Navegación del panel" }).getByRole("link", { name: "Expositores" })).toBeVisible();

  await page.goto("/panel/mi-stand");
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.getByRole("complementary", { name: "Navegación del panel" }).getByRole("link", { name: "Expositores" })).toBeVisible();
});

test("cuenta real sin rol: ve 'Sin acceso' con la opción de registrar su empresa", async ({ page }) => {
  await page.route("https://accounts.google.com/**", (route) => route.abort());
  await page.goto("/acceso?panel=expositor");
  const form = page.getByRole("form", { name: "Iniciar sesión" });
  await form.getByLabel("Correo").fill("sinrol@fexpo.test");
  await form.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await form.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByRole("heading", { name: "Sin acceso al panel" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Registrar mi empresa" })).toBeVisible();
});

test("contraseña incorrecta contra el backend real", async ({ page }) => {
  await page.route("https://accounts.google.com/**", (route) => route.abort());
  await page.goto("/acceso?panel=expositor");
  const form = page.getByRole("form", { name: "Iniciar sesión" });
  await form.getByLabel("Correo").fill("expositor@fexpo.test");
  await form.getByLabel("Contraseña", { exact: true }).fill("no-es-la-clave");
  await form.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(form.getByRole("alert")).toHaveText("Correo o contraseña incorrectos.");
});

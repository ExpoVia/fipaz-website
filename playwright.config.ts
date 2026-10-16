import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de navegador del acceso y los paneles. El backend se simula en cada prueba
 * (`e2e/support/fake-backend.ts`), así que no hace falta tenerlo levantado.
 *
 * Usa el `next dev` del puerto 3001 si ya está corriendo; si no, lo levanta. Requiere
 * `NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED=true` (en `.env.local` o en el entorno).
 */
const port = Number(process.env.E2E_PORT ?? 3001);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    // Como los scripts de `scripts/`: Edge instalado, sin descargar navegadores. `E2E_CHANNEL=chromium` usa el de Playwright.
    channel: process.env.E2E_CHANNEL ?? "msedge",
  },
  webServer: {
    command: `pnpm exec next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: { NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED: "true" },
  },
});

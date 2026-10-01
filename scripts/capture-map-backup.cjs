/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * capture-map-backup.cjs
 * Genera capturas de respaldo del mapa FIPAZ 2026 en /demo/map.
 * Valida los 3 stands del guion (issue #51N tarea 10).
 *
 * Uso: node scripts/capture-map-backup.cjs
 * Prerequisito: dev server corriendo en http://localhost:3000
 *
 * Selectores basados en el análisis de ExpoMapSvg.tsx y ExpoInteractiveMap.tsx:
 *  - Plan buttons: role="button" con aria-label del nombre del plan
 *  - Stand elements: role="button" con aria-label="Espacio <código>, <nombre>"
 *  - Los stands demo del guion tienen IDs: stand-kawsay-salud, stand-altura-labs, stand-sabor-andino
 */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = 'coverage/map';

/** Stands del guion (demo-fixture-30-sep.md §Stands del guion) */
const DEMO_STANDS = [
  {
    id: 'stand-kawsay-salud',
    name: 'Kawsay Salud',
    code: '24',
    planId: 'red-lower',
    planLabel: 'Internacional I',      // aria-label del botón de plan
  },
  {
    id: 'stand-altura-labs',
    name: 'Altura Labs',
    code: '117',
    planId: 'yellow-upper',
    planLabel: 'Pabellon Bolivia',
  },
  {
    id: 'stand-sabor-andino',
    name: 'Sabor Andino',
    code: '8',
    planId: 'green-upper',
    planLabel: 'Pabellon Americano',
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  let allPassed = true;

  try {
    for (const width of [390, 1440]) {
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        recordVideo: width === 1440 ? { dir: OUT_DIR, size: { width: 1440, height: 900 } } : undefined,
      });
      const page = await ctx.newPage();
      page.setDefaultNavigationTimeout(60000);
      const renderErrors = [];
      page.on('pageerror', (err) => renderErrors.push(err.message));

      // ── 1. Vista general del mapa ─────────────────────────────────────────
      console.log(`\n[${width}px] Cargando ${BASE_URL}/demo/map …`);
      await page.goto(`${BASE_URL}/demo/map`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // esperar animaciones iniciales

      // Confirmar que NO hay mapa HuaynaFEX
      const bodyText = await page.locator('body').innerText();
      const hasHuaynaFex = /huayna|huaynafex/i.test(bodyText);
      if (hasHuaynaFex) {
        console.error(`  ✗ ERROR: se encontró texto HuaynaFEX`);
        allPassed = false;
      } else {
        console.log(`  ✓ Sin HuaynaFEX`);
      }

      await page.screenshot({
        path: path.join(OUT_DIR, `${width}-01-map-overview.png`),
        fullPage: true,
      });
      console.log(`  ✓ Vista general capturada`);

      // ── 2. Captura de cada stand del guion ───────────────────────────────
      for (let i = 0; i < DEMO_STANDS.length; i++) {
        const stand = DEMO_STANDS[i];
        await page.goto(`${BASE_URL}/demo/map`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        let planClicked = false;
        let standClicked = false;
        let fichaVisible = false;

        // Hacer clic en el botón del plan (aria-label contiene el nombre del plan)
        // El SVG tiene g[role="button"] con aria-label="<plan.name>, <level>"
        const planBtn = page.locator(`[role="button"][aria-label*="${stand.planLabel}"]`).first();
        if (await planBtn.count() > 0) {
          await planBtn.click();
          planClicked = true;
          await page.waitForTimeout(1000);
          console.log(`  ✓ Plan "${stand.planLabel}" clickado`);
        } else {
          console.log(`  ✗ Plan "${stand.planLabel}" NO encontrado`);
        }

        // Intentar hacer clic en el stand por aria-label "Espacio <código>, <nombre>"
        const standByAriaLabel = page.locator(`[aria-label*="Espacio ${stand.code},"]`).first();
        const standByAriaName = page.locator(`[aria-label*="${stand.name}"]`).first();

        if (await standByAriaLabel.count() > 0) {
          await standByAriaLabel.click();
          standClicked = true;
          await page.waitForTimeout(1000);
        } else if (await standByAriaName.count() > 0) {
          await standByAriaName.click();
          standClicked = true;
          await page.waitForTimeout(1000);
        }

        if (!standClicked) {
          console.log(`  ✗ Stand "${stand.name}" (código ${stand.code}) NO encontrado en el DOM`);
        }

        await page.screenshot({
          path: path.join(OUT_DIR, `${width}-0${i + 2}-stand-${stand.id}.png`),
          fullPage: true,
        });

        // Verificar que el nombre del stand sea visible (en ficha o en página)
        fichaVisible = (await page.locator('body').innerText()).includes(stand.name);
        results.push({
          width,
          stand: stand.name,
          planClicked,
          standClicked,
          fichaVisible,
        });

        const icon = fichaVisible ? '✓' : '✗';
        console.log(`  ${icon} ${stand.name} | planClick=${planClicked} standClick=${standClicked} ficha=${fichaVisible}`);
        if (standClicked && !fichaVisible) allPassed = false;
      }

      // ── 3. Screenshot de overview final (desktop) ────────────────────────
      if (width === 1440) {
        await page.goto(`${BASE_URL}/demo/map`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: path.join(OUT_DIR, `1440-06-overview-final.png`),
          fullPage: true,
        });
      }

      if (renderErrors.length > 0) {
        console.warn(`  Errores JS detectados (${renderErrors.length}):`, renderErrors.slice(0, 3));
      }

      await ctx.close(); // cierra y guarda el video si corresponde
    }
  } finally {
    await browser.close();
  }

  // ── Reporte final ────────────────────────────────────────────────────────
  const artifacts = fs.readdirSync(OUT_DIR).map((f) => path.join(OUT_DIR, f));
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    allPassed,
    artifacts,
  };
  const reportPath = path.join(OUT_DIR, 'backup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

  console.log('\n── Reporte final ─────────────────────────────────────');
  console.table(results);
  console.log(`\nArtifacts (${artifacts.length}):`, artifacts.join(', '));
  console.log(
    allPassed
      ? '\nPASS ✓ Todos los stands del guion localizados.'
      : '\nWARN ✗ Algunos stands no se localizaron automáticamente — revisar screenshots manualmente.',
  );
  if (!allPassed) process.exitCode = 1;
}

main().catch((err) => { console.error(err); process.exitCode = 1; });

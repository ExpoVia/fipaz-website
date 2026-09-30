/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('../node_modules/.cache/map-verify/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  fs.mkdirSync('coverage/demo-fixture', { recursive: true });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(120000);
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (request.url().includes('/api/v1/stands')) errors.push('Unexpected backend stand request');
      });
      await page.goto('http://127.0.0.1:3100/panel/expositores');
      await page.getByRole('heading', { name: 'Directorio de stands' }).waitFor();
      for (const name of ['Altura Labs', 'Kawsay Salud', 'Sabor Andino']) await page.getByRole('link').filter({ hasText: name }).waitFor();
      await page.screenshot({ path: `coverage/demo-fixture/${width}-directory.png`, fullPage: true });
      for (const [id, name, code, block, promotion] of [
        ['stand-altura-labs', 'Altura Labs', 'B-117', 'Bloque Amarillo', '30 % de descuento en plan Starter'],
        ['stand-kawsay-salud', 'Kawsay Salud', 'R-24', 'Bloque Rojo', 'Control de presión sin costo'],
        ['stand-sabor-andino', 'Sabor Andino', 'G-08', 'Bloque Verde', 'Degustación 11:00 a 13:00'],
      ]) {
        await page.goto(`http://127.0.0.1:3100/panel/expositores/${id}`);
        await page.getByRole('heading', { name, exact: true }).waitFor();
        await page.getByText(promotion, { exact: true }).waitFor();
        const body = await page.locator('main').innerText();
        assert.ok(body.includes(code) && body.includes(block));
        await page.screenshot({ path: `coverage/demo-fixture/${width}-${id}.png`, fullPage: true });
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log('PASS: panel directory and all three details at 390/1440px, no backend calls or browser errors.');
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const output = '.next/journey-checks';
mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.JOURNEY_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => { const section = document.querySelector('#problema'); window.scrollTo({ top: section.getBoundingClientRect().top + scrollY + innerHeight * 4.25, behavior: 'instant' }); });
  await page.waitForTimeout(2300);
  const journey = page.locator('[data-journey="overlay"]');
  await page.screenshot({ path: `${output}/desktop-idle.png` });
  const cards = journey.locator('[data-journey-card]');
  await expect(cards).toHaveCount(6);
  await cards.nth(0).hover();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${output}/desktop-search.png` });
  const panel = journey.locator('[data-demo-panel]');
  await expect(panel).toBeVisible();
  const layout = await journey.evaluate(root => ({
    header: root.querySelector('header').getBoundingClientRect().bottom,
    panel: root.querySelector('[data-demo-panel]').getBoundingClientRect().toJSON(),
    cards: root.querySelector('ol').getBoundingClientRect().toJSON(),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  console.log('desktop layout', layout);
  assert.ok(layout.panel.top >= layout.header, 'Panel overlaps heading');
  assert.ok(layout.panel.bottom <= layout.cards.top - 8, 'Panel overlaps cards');
  assert.equal(layout.overflow, false);
  await panel.evaluate(node => node.dataset.testIdentity = 'persistent');
  await cards.nth(1).hover();
  await expect(panel.locator('h3')).toHaveText('Tu feria, en un mapa');
  await expect(panel).toHaveAttribute('data-test-identity', 'persistent');
  // Returning quickly to the first preview must restore its content, even mid-transition.
  const positions = await journey.locator('ol > li').evaluateAll(nodes => nodes.map(node => { const rect = node.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; }));
  for (const index of [0, 1, 0]) { await page.mouse.move(positions[index].x, positions[index].y); await page.waitForTimeout(40); }
  await expect(panel.locator('h3')).toHaveText('Buscar empresas');
  await page.waitForTimeout(500);
  assert.equal(await panel.locator('h3').evaluate(node => Number(getComputedStyle(node.parentElement.parentElement).opacity)), 1);
  assert.equal(await journey.locator('ol').evaluate(node => node.getBoundingClientRect().top), layout.cards.top, 'Hover changed layout');
  await cards.nth(0).click();
  await expect(panel.locator('input')).toBeVisible();
  await cards.nth(1).hover();
  await expect(panel.locator('h3')).toHaveText('Buscar empresas');
  await panel.locator('input').fill('Nova');
  await expect(panel.getByRole('button', { name: /Nova Labs/ })).toBeVisible();
  await expect(panel.getByRole('button', { name: /Andean Tech/ })).toHaveCount(0);
  await panel.getByRole('button', { name: /Nova Labs/ }).click();
  await expect(panel.getByText('Stand C-20', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Cómo llegar' }).click();
  await expect(panel.getByRole('status')).toHaveText('Llegaste al Stand C-20', { timeout: 6000 });
  await panel.getByRole('button', { name: 'Probar check-in' }).click();
  await expect(panel.getByRole('status')).toHaveText('Check-in realizado', { timeout: 5000 });
  await panel.getByRole('button', { name: 'Ver mi misión' }).click();
  await expect(panel.locator('[data-points-total]')).toHaveText('430', { timeout: 5000 });
  await panel.getByRole('button', { name: 'Conectar con la empresa' }).click();
  await expect(panel.getByText('Nova Labs', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Guardar empresa' }).click();
  await expect(panel.getByRole('button', { name: 'Empresa guardada' })).toHaveAttribute('aria-pressed', 'true');
  await panel.getByRole('button', { name: 'Ver contacto' }).click();
  await expect(panel.getByText(/maria@nova.example/)).toBeVisible();
  await page.screenshot({ path: `${output}/desktop-connect.png` });
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(cards.nth(5)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('button', { name: 'Empresa guardada' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await cards.nth(0).focus();
  await page.keyboard.press('Space');
  await expect(panel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.getByRole('button', { name: 'Cerrar demo' })).toBeFocused();
  await page.keyboard.press('Escape');
  await cards.nth(0).click();
  await journey.locator('h2').click();
  await expect(panel).toHaveCount(0);
  // A preference change tears down the pin and the single Lenis instance, keeping demos usable.
  await cards.nth(2).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const staticJourney = page.locator('[data-journey="standalone"]');
  await expect(journey).toBeHidden();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), false);
  await staticJourney.locator('[data-journey-card]').nth(4).click();
  await expect(staticJourney.locator('[data-points-total]')).toHaveText('430');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(staticJourney).toBeHidden();
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.evaluate(() => { const section = document.querySelector('#problema'); const spacer = section.parentElement; window.scrollTo({ top: spacer.getBoundingClientRect().top + scrollY + innerHeight * 4.25, behavior: 'instant' }); });
  await page.waitForTimeout(1800);
  await cards.nth(0).click();
  await expect(panel.locator('input')).toBeVisible();
  await page.keyboard.press('Escape');
  assert.deepEqual(errors, []);
  console.log('desktop interaction checks passed');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const output = '.next/journey-checks';
mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  for (const scenario of [
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 834, height: 1112, touch: true },
    { name: 'mobile', width: 390, height: 844, touch: true },
    { name: 'small', width: 320, height: 740, touch: true },
    { name: 'reduced', width: 1440, height: 900, reduced: true },
    { name: 'short', width: 1366, height: 650 },
  ]) {
    if (process.argv[2] && process.argv[2] !== scenario.name) continue;
    const page = await browser.newPage({ viewport: { width: scenario.width, height: scenario.height }, hasTouch: !!scenario.touch, isMobile: !!scenario.touch, reducedMotion: scenario.reduced ? 'reduce' : 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.JOURNEY_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    const overlay = scenario.name === 'laptop';
    const journey = page.locator(`[data-journey="${overlay ? 'overlay' : 'standalone'}"]`);
    if (overlay) {
      await page.evaluate(() => { const section = document.querySelector('#problema'); window.scrollTo({ top: section.getBoundingClientRect().top + scrollY + innerHeight * 4.25, behavior: 'instant' }); });
    } else {
      await page.evaluate(() => { const section = document.querySelector('[data-journey="standalone"]'); window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }); });
    }
    await page.waitForTimeout(1800);
    const cards = journey.locator('[data-journey-card]');
    const panel = journey.locator('[data-demo-panel]');
    await cards.nth(0).click();
    await expect(panel.locator('input')).toBeVisible();
    if (scenario.touch || scenario.name === 'short') {
      assert.equal(await panel.evaluate(node => !!node.closest('li')), true);
      await panel.locator('input').fill('Andean');
      await expect(panel.getByRole('button', { name: /Andean Tech/ })).toBeVisible();
      await expect(panel.getByRole('button', { name: /Nova Labs/ })).toHaveCount(0);
      await panel.getByRole('button', { name: /Andean Tech/ }).click();
      await expect(panel.getByText('Stand A-12', { exact: true })).toBeVisible();
      await expect(panel).toHaveCount(1);
    } else {
      const bounds = await journey.evaluate(root => ({ head: root.querySelector('header').getBoundingClientRect().bottom, panel: root.querySelector('[data-demo-panel]').getBoundingClientRect().toJSON(), cards: root.querySelector('ol').getBoundingClientRect().top }));
      console.log(scenario.name, bounds);
      await page.screenshot({ path: `${output}/${scenario.name}.png` });
      assert.ok(bounds.panel.top >= bounds.head, `${scenario.name}: panel overlaps title`);
      assert.ok(bounds.panel.bottom <= bounds.cards - 8, `${scenario.name}: panel overlaps cards`);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${output}/${scenario.name}.png` });
    if (scenario.reduced) {
      for (const [index, text] of [[2, 'Llegaste al Stand B-04'], [3, 'Check-in realizado']]) {
        await cards.nth(index).click();
        await expect(panel.getByRole('status')).toHaveText(text);
      }
      await cards.nth(4).click();
      await expect(panel.locator('[data-points-total]')).toHaveText('430');
      assert.equal(await page.locator('.pin-spacer').count(), 0);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${scenario.name}: horizontal overflow`);
    assert.deepEqual(errors, []);
    console.log(`${scenario.name}: passed`);
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

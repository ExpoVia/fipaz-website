/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.DEMO_TEST_URL || 'http://127.0.0.1:3100';
const output = 'coverage/mobile-demo';
async function run() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(120000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().includes('/api/v1/')) errors.push(`Unexpected backend request: ${request.url()}`); });
    page.on('response', response => { if (response.status() >= 400 && response.url().includes('/assets/mobile/')) errors.push(`Asset ${response.status()}: ${response.url()}`); });
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    const screenshot = name => page.screenshot({ path: `${output}/${name}.png` });
    await page.goto(`${base}/demo`);
    await expect(page.getByRole('button', { name: '0 puntos', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stands', exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await screenshot('390-home');
    await nav.getByRole('button', { name: 'Mapa', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Vista general' })).toBeVisible();
    await screenshot('390-map-overview');
    for (const [block, floors] of [['Bloque Rojo', ['Planta baja', 'Planta alta']], ['Bloque Amarillo', ['Planta baja', 'Planta alta']], ['Bloque Verde', ['Planta alta']]]) {
      await page.getByRole('button', { name: new RegExp(block) }).click();
      for (const floor of floors) {
        await page.getByRole('button', { name: floor, exact: true }).click();
        await expect(page.getByRole('group', { name: /Mapa demostrativo FIPAZ/ })).toBeVisible();
        await screenshot(`390-${block.replaceAll(' ', '-')}-${floor.replaceAll(' ', '-')}`);
        await page.getByRole('button', { name: 'Acercar', exact: true }).click();
        await expect(page.getByTestId('map-zoom')).not.toHaveText('1.0x');
        await page.getByRole('button', { name: 'Centrar', exact: true }).click();
        await expect(page.getByTestId('map-zoom')).toHaveText('1.0x');
      }
      await page.getByRole('button', { name: 'Volver al recinto' }).click();
    }
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Tecnologia (demo)', exact: true }).uncheck();
    await expect(page.getByRole('checkbox', { name: 'Tecnologia (demo)', exact: true })).not.toBeChecked();
    await page.getByRole('button', { name: 'Restablecer', exact: true }).click();
    await page.getByRole('button', { name: 'Cerrar panel', exact: true }).click();
    for (const name of ['Plaza Akapana', 'Patio de comidas']) {
      await page.getByRole('button', { name: new RegExp(name) }).click();
      await expect(page.getByRole('group', { name: /Mapa demostrativo FIPAZ/ })).toBeVisible();
      await page.getByRole('button', { name: 'Volver al recinto' }).click();
    }
    for (const [id, name] of [['stand-illimani-capital', 'Illimani Capital'], ['stand-yatiri-edu', 'Yatiri Educa'], ['stand-pachamama-tech', 'Pachamama Tech']]) {
      await page.goto(`${base}/demo/stands/${id}`);
      await page.getByRole('button', { name: 'Ver en el mapa', exact: true }).click();
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Volver al recinto', exact: true }).click();
    await page.getByRole('button', { name: 'Buscar espacios', exact: true }).click();
    await page.getByRole('textbox', { name: 'Numero o expositor' }).fill('Altiplano');
    await page.getByRole('button', { name: /12 Altiplano Tech/ }).click();
    await page.getByRole('button', { name: 'Como llegar', exact: true }).click();
    await expect(page.locator('[aria-label="Ruta aproximada de demostracion"]')).toBeVisible();
    await page.getByRole('button', { name: 'Ver expositor', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Altiplano Tech', exact: true }).last()).toBeVisible();
    await nav.getByRole('button', { name: 'Mapa', exact: true }).click();
    await page.getByRole('button', { name: 'Buscar espacios', exact: true }).click();
    await page.getByRole('textbox', { name: 'Numero o expositor' }).fill('Altura');
    await page.getByRole('button', { name: /117 Altura Labs/ }).click();
    await expect(page.getByRole('heading', { name: 'Altura Labs', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Ver expositor', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Altura Labs', exact: true }).last()).toBeVisible();
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await screenshot('390-stand');
    await page.getByRole('button', { name: 'Volver', exact: true }).click();
    await page.getByRole('textbox', { name: 'Buscar stands', exact: true }).fill('sabor');
    await expect(page.getByRole('button', { name: /Sabor Andino/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Altura Labs/ })).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Buscar stands', exact: true }).fill('no-such-company');
    await expect(page.getByRole('heading', { name: 'Sin resultados' })).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await screenshot('390-stands');
    await nav.getByRole('button', { name: 'Check-in', exact: true }).click();
    await screenshot('390-checkin');
    await page.getByRole('button', { name: 'Simular lectura NFC' }).click();
    await page.getByRole('button', { name: 'Cancelar lectura' }).click();
    await page.waitForTimeout(1800);
    await expect(page.getByRole('button', { name: '0 puntos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Simular lectura NFC' }).click();
    const receipt = page.getByRole('dialog', { name: 'Comprobante de visita' });
    await expect(receipt).toBeVisible();
    await expect(receipt.getByText('Check-in exitoso', { exact: true })).toBeVisible();
    await screenshot('390-receipt');
    await receipt.getByRole('button', { name: 'Listo' }).click();
    await expect(page.getByRole('button', { name: '50 puntos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Leer otro tag (demo)' }).click();
    await expect(receipt.getByText('Visita ya registrada', { exact: true })).toBeVisible();
    await receipt.getByRole('button', { name: 'Listo' }).click();
    await expect(page.getByRole('button', { name: '50 puntos', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: '50 puntos', exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'Misiones', exact: true }).click();
    await expect(page.getByText('misiones completadas', { exact: true })).toBeVisible();
    await screenshot('390-missions');
    await nav.getByRole('button', { name: 'Perfil', exact: true }).click();
    await screenshot('390-profile');
    await page.getByRole('button', { name: 'Oscuro', exact: true }).click();
    await expect(page.getByTestId('mobile-demo')).toHaveAttribute('data-theme', 'dark');
    await screenshot('390-profile-dark');
    await nav.getByRole('button', { name: 'Inicio', exact: true }).click();
    await screenshot('390-home-dark');
    await nav.getByRole('button', { name: 'Mapa', exact: true }).click();
    await screenshot('390-map-dark');
    await page.reload();
    await expect(page.getByTestId('mobile-demo')).toHaveAttribute('data-theme', 'dark');
    await nav.getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.getByRole('button', { name: 'Sistema', exact: true }).click();
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByTestId('mobile-demo')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.getByTestId('mobile-demo')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: 'Mi código QR', exact: true }).click();
    await expect(page.getByRole('img', { name: 'Código QR de demostración sin validez de acceso' })).toBeVisible();
    await screenshot('390-qr');
    await page.getByRole('button', { name: 'Actualizar QR', exact: true }).click();
    await expect(page.getByText('Vence en 60 s', { exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'Inicio', exact: true }).click();
    await page.getByRole('button', { name: /Banner HuaynaFEX/ }).click();
    await screenshot('390-event');
    await expect(page.getByText('Contenido de la feria próximamente.')).toBeVisible();
    await nav.getByRole('button', { name: 'Check-in', exact: true }).click();
    for (const id of ['stand-kawsay-salud', 'stand-sabor-andino', 'stand-illimani-capital', 'stand-yatiri-edu', 'stand-pachamama-tech']) {
      await page.getByRole('combobox', { name: 'Stand de prueba' }).selectOption(id);
      await page.getByRole('button', { name: /Simular lectura NFC|Leer otro tag/ }).click();
      await expect(receipt).toBeVisible();
      await receipt.getByRole('button', { name: 'Listo' }).click();
    }
    await expect(page.getByRole('button', { name: '300 puntos', exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'Perfil', exact: true }).click();
    await expect(page.getByText('Nivel 3', { exact: false })).toBeVisible();
    await nav.getByRole('button', { name: 'Misiones', exact: true }).click();
    await page.getByRole('button', { name: /Cafe de cortesia/ }).click();
    await page.getByRole('button', { name: 'Confirmar canje demo' }).click();
    await expect(page.getByText('Premio canjeado', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: '50 puntos', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: /Cafe de cortesia/ }).click();
    await expect(page.getByText('Premio canjeado', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await nav.getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await page.getByRole('button', { name: 'Mi código QR', exact: true }).click();
    await expect(page.getByText('Inicia la sesión de demostración para mostrar tu QR.')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar como visitante demo' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Continuar como visitante demo' }).click();
    await expect(page.getByRole('img', { name: 'Código QR de demostración sin validez de acceso' })).toBeVisible();
    await nav.getByRole('button', { name: 'Perfil', exact: true }).click();
    await page.getByRole('button', { name: 'Reiniciar demostración', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Reiniciar demostración', exact: true }).click();
    await expect(page.getByRole('button', { name: '0 puntos', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 320, height: 568 });
    await nav.getByRole('button', { name: 'Check-in', exact: true }).click();
    assert.equal(await page.locator('#mobile-demo-content').evaluate(element => element.scrollHeight <= element.clientHeight + 1), true, 'Check-in must fit a short mobile viewport');
    assert.equal(await page.getByText('NFC de demostración', { exact: true }).evaluate(element => { const bounds = element.getBoundingClientRect(); const hero = element.parentElement.getBoundingClientRect(); return bounds.top >= hero.top && bounds.bottom <= hero.bottom; }), true, 'NFC status must remain fully inside its hero');
    await screenshot('320-short-checkin');
    for (const width of [320, 360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/demo', '/demo/map', '/demo/scan', '/demo/missions', '/demo/profile', '/demo/stands', '/demo/my-qr', '/demo/rewards', '/demo/events/event-fipaz-2026', '/demo/stands/stand-altura-labs']) {
        await page.goto(base + route);
        await expect(page.getByTestId('mobile-demo')).toBeVisible();
        await expect(page.getByText('Preparando tu experiencia…')).toHaveCount(0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Overflow at ${width} ${route}`);
        if ([320, 1440].includes(width) && ['/demo', '/demo/map', '/demo/scan'].includes(route)) await screenshot(`${width}-${route.split('/').at(-1)}`);
      }
    }
    await page.goto(base + '/demo?tab=missions');
    await expect(nav.getByRole('button', { name: 'Misiones' })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('button', { name: 'Perfil' }).click(); await page.goBack();
    await expect(nav.getByRole('button', { name: 'Misiones' })).toHaveAttribute('aria-current', 'page');
    await page.goto(base + '/');
    await expect(page.getByRole('link', { name: 'Probar demo', exact: true }).first()).toBeVisible();
    await screenshot('1440-landing');
    assert.deepEqual(errors, []);
    console.log('PASS: all demo screens, 7 plans, all 6 catalog/map links, filters/search/zoom/route, NFC cancel/success/duplicate, persisted visits/theme/reward, system theme, QR, sign-in/out, reset, history, short mobile and 320/360/390/768/1440px layouts. No backend calls or browser errors.');
    await context.close();
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });

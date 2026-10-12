# Demo web alineada con Fexpo Expo

La experiencia pública en `/demo` reproduce la aplicación visitante de
`fexpo-expo-app`: Inter/Poppins, iconos Material Symbols, imágenes de accesos,
banners y tokens de los modos claro y oscuro. Los recursos se copian desde
Expo a `public/assets/mobile`; sus licencias están en `fonts/`.

## Pantallas

| Ruta | Contenido |
| --- | --- |
| `/demo` | Ferias, seis accesos ilustrados, nivel, Ruta FIPAZ y destacados |
| `/demo/map` | Vista general, tres bloques, siete planos, filtros, directorio, zoom y rutas de ejemplo |
| `/demo/scan` | NFC simulado, selección de stand, cancelación y comprobante |
| `/demo/missions` | Las cinco misiones de Expo y carrusel de premios |
| `/demo/profile` | Estadísticas, visitas, sesión demo, apariencia y reinicio |
| `/demo/stands` | Catálogo de seis stands, búsqueda, categorías y favoritos |
| `/demo/stands/[id]` | Detalle, promoción, actividad, mapa y check-in de los stands del catálogo |
| `/demo/my-qr` | Pase QR de demostración con vencimiento y actualización manual |
| `/demo/rewards` | Premios, saldo, canje y código de ejemplo |
| `/demo/events/[id]` | Portadas de HuaynaFEX, FIPAZ y FEIPOBOL |

Se conservan los enlaces antiguos `/demo?tab=...`. La navegación actualiza la
URL y admite el botón Atrás del navegador. Las rutas de detalle pueden abrirse
directamente; los identificadores desconocidos devuelven 404.

## Estado de demostración

`src/features/mobile-demo` concentra esta experiencia sin modificar los
contratos de administración. El catálogo, las misiones y los premios reflejan
los de Expo. La clave `fexpo-mobile-demo:v1` guarda visitas, favoritos, canjes,
sesión de demostración y preferencia visual; no sustituye el estado anterior
del panel. Se valida el contenido guardado antes de hidratarlo.

- Cada uno de los seis stands puede sumar 50 puntos una sola vez.
- Cancelar la lectura no registra visitas. Una lectura repetida muestra un
  comprobante de duplicado y suma cero puntos.
- Las misiones se calculan a partir de las visitas; el canje descuenta el costo
  una sola vez y persiste su estado.
- Cerrar sesión conserva el recorrido. Reiniciar la demostración borra visitas,
  favoritos y canjes y conserva la preferencia de apariencia.
- El QR y los comprobantes se identifican como demostrativos. No hay acceso,
  autenticación Google, lectura física NFC ni transacciones con el backend.

## Integración del mapa

La pestaña usa `ExpoInteractiveMap`, el mismo componente que ya existía en
`/demo/map`. `OverviewComponent` permite presentar la vista general de Expo
con miniaturas SVG de los planos reales. El modo `embedded` adapta el marco
a los temas de la app; la presentación usada en la landing sigue disponible.

`map-catalog.ts` enlaza los seis expositores ficticios con los espacios
numerados existentes. Mantiene coordenadas, superficies y numeración. El
mapa continúa siendo una referencia de demostración, no una asignación
oficial de expositores.

## Verificación

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start --port 3100
node scripts/check-mobile-demo.cjs
node --test src/features/map/tests/data.test.cjs
node scripts/check-demo-fixture.cjs
```

El script de navegador utiliza `@playwright/test` y Edge instalado. Puede
apuntar a otro servidor con `DEMO_TEST_URL`. Guarda capturas en
`coverage/mobile-demo` (ignorado por Git), comprueba los recorridos de visitas,
duplicados, cancelación, canje, QR, sesión, temas, enlaces y navegación, y
verifica ausencia de desbordamiento horizontal en 320, 360, 390, 768 y 1440 px.

El lint global tiene errores preexistentes en componentes de administración,
panel y `scripts/check-demo-fixture.cjs`. Para revisar el alcance de esta entrega:

```bash
pnpm exec eslint src/features/mobile-demo src/features/missions/DemoAppClient.tsx src/app/demo src/features/map/components/ExpoInteractiveMap.tsx src/features/map/data/expoMapData.ts src/features/map/types.ts src/features/map/tests/data.test.cjs scripts/check-mobile-demo.cjs
```

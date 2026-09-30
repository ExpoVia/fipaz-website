# Fixture demo FIPAZ 2026 — guía de ejecución

**Estado:** alineado con el contrato `fexpo_global_docs/demo-fixture-30-sep.md`. Los datos son ficticios y no constituyen una confirmación oficial de FIPAZ.

**Evento:** `event-fipaz-2026` · **FIPAZ 2026** · La Paz, Bolivia. En la interfaz, fechas y recinto aparecen como **sujetos a confirmación**. El código web contiene horarios de ejemplo para actividades; esos horarios no son una confirmación de FIPAZ.

## Fixture propuesto

Los tres stands seleccionados son ficticios. Sus códigos, bloques, categorías, actividades y promociones coinciden con el mock móvil.

| Stand | Código | Bloque propuesto | Categoría | Actividad de ejemplo | Promoción de ejemplo |
| --- | --- | --- | --- | --- | --- |
| Altura Labs | B-117 | B · Amarillo | Tecnología | Demo en vivo de asistente de voz en quechua · 16:00 | 30 % de descuento en plan Starter |
| Kawsay Salud | R-24 | R · Rojo | Salud | Consulta rápida de bienestar | Control de presión sin costo |
| Sabor Andino | G-08 | G · Verde | Gastronomía | Degustación de singani de altura | Degustación 11:00 a 13:00 |

**Misión de ejemplo:** Ruta FIPAZ — visitar Altura Labs, Kawsay Salud y Sabor Andino una vez cada uno.

**Regla de puntos:** una visita nueva y única suma 50 puntos; repetir el check-in del mismo stand suma 0 puntos. Completar la Ruta FIPAZ no añade un bono aparte; los puntos ya se acreditan por las visitas. El estado web de inicio representa dos visitas de ejemplo: 2 de 3 stands y 100 puntos. Al visitar el tercer stand: 3 de 3 y 150 puntos.

## Sincronización por superficie

| Dato | Web `/demo` | Panel `/panel` | App móvil | ¿Se sincroniza en vivo? |
| --- | --- | --- | --- | --- |
| Evento e `eventId` | `event-fipaz-2026`, fixture local | Mismo ID como contexto local de panel | El ID comunicado para sus mocks es `event-fipaz-2026` | No |
| Stands, códigos, categoría, actividad y promoción | Catálogo local `src/data/demo-fixture.ts` | Directorio y detalle usan el fixture con `NEXT_PUBLIC_DEMO_PANEL_STANDS=true`; sin el flag usan API. Otras vistas conservan su store propio | Mock móvil contrastado mediante pruebas locales | No |
| Misión y puntos | Store de demo del navegador | Catálogo y métricas de panel de ejemplo | Store/backend simulado móvil según el contrato recibido | No |
| Visitas y progreso | Estado persistido en el navegador | Check-ins y métricas del mock de panel | Estado local/mock de la app | No |
| Premios | Catálogo ilustrativo; la acción de canje es una simulación local | Datos de panel de ejemplo | No verificado contra el repositorio móvil | No |
| Fechas y recinto | No se anuncian como confirmados | Se marcan sujetos a confirmación | Portada con aviso de confirmación | No |

El panel y la app tienen estados separados. Compartir el mismo identificador o copiar el fixture no transmite visitas, puntos, premios ni cambios de perfil entre superficies. No existe un puente web↔móvil implementado y probado en este alcance.

## Frase para presentación

> “Esta es una demostración con stands ficticios: cada primera visita suma 50 puntos y repetir el check-in suma cero. Los premios son propuestas; las fechas y el recinto de FIPAZ 2026 están sujetos a confirmación.”

## Preparación y pruebas

- Configurar `NEXT_PUBLIC_DEMO_PANEL_STANDS=true` en `.env.local` y reiniciar dev, o configurar antes del build. No activa simulación en autenticación, altas de empresa ni QR. Los errores de API no cambian automáticamente a mocks.
- Abrir el panel en un perfil nuevo, sin sesión de empresa, conservando el perfil habitual y sus empresas editadas. Visitar `/panel/expositores` y las fichas de los tres stands.
- Reiniciar `/demo`: dos visitas y 100 puntos; Sabor lleva a 150 y 3/3. Un navegador nuevo también inicia con dos visitas, no con cero.
- En móvil mock, iniciar con cero. El check-in se confirma localmente; la cola pendiente del flujo API se prueba por separado y no acredita puntos antes de confirmar.
- Ejecutar `node scripts/check-demo-fixture.cjs` desde la raíz web con dependencias instaladas y `../fexpo-expo-app` disponible. Verifica fixtures, panel demo/API, búsqueda, paginación, puntos, duplicados, misión y pendientes con almacenamiento de dispositivo simulado.

## Resultado de la validación local

- `node scripts/check-demo-fixture.cjs`: aprobado; fixtures, separación demo/API, duplicados, puntos, misión y pendientes.
- TypeScript (`tsc --noEmit`): aprobado.
- Edge sin ventana, 390 y 1440 px: directorio y fichas de los tres stands aprobados, sin errores JavaScript ni solicitudes al backend de stands. Capturas locales en `coverage/demo-fixture/`.
- Para repetir navegador: instalar Playwright en `node_modules/.cache/map-verify`, iniciar Next en `127.0.0.1:3100` con el flag de demo y ejecutar `node scripts/check-demo-browser.cjs` (requiere Edge).
- ESLint del adaptador nuevo: aprobado. Los componentes del directorio y detalle conservan dos errores preexistentes `react-hooks/set-state-in-effect`; no se presentan como un lint global aprobado.

# Recorrido interactivo

`journey-data.ts` reúne textos, colores, iconos y empresas de ejemplo. `InteractiveJourneySection` comparte el panel entre las seis tarjetas en escritorio; en pantallas táctiles, estrechas o bajas muestra un solo acordeón abierto. El estado activo se deriva de `pinnedStep ?? hoveredStep`.

`FexpoParallax` conserva la única instancia de Lenis y su conexión a ScrollTrigger. Su segundo acto revela las tarjetas una sola vez. `SolutionSection` usa los mismos componentes en el flujo normal de la página cuando no hay espacio para el panel o se prefiere movimiento reducido. Las demos se cargan al abrir el panel y sus timelines se limpian al cambiar de contenido.

La búsqueda filtra datos de ejemplo y lleva la empresa elegida a los siguientes pasos. El guardado vive en React durante la sesión de la sección; NFC, puntos y contacto son simulaciones sin llamadas a servicios externos.

Con el servidor de desarrollo activo, ejecutar desde la raíz (requiere Chrome y la dependencia de Playwright ya incluida):

```sh
node scripts/verify-journey-interactions.mjs
node scripts/verify-journey-responsive.mjs
```

Las verificaciones cubren continuidad del panel, búsqueda, recorrido completo, guardado, Escape, Enter, Space, Tab, ausencia de desplazamientos de layout por hover, seis tamaños de pantalla y movimiento reducido. Guardan capturas en `.next/journey-checks/`. Se puede indicar otro servidor con `JOURNEY_URL`.

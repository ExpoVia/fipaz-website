# Entrada continua a Fexpo

La secuencia usa las capas existentes de section2. En escritorio prolonga la misma timeline y el mismo pin de FexpoParallax después de Prueba el recorrido. En pantallas pequeñas se sitúa después del recorrido en flujo normal. Lenis sigue teniendo una sola instancia, gestionada por FexpoParallax.

## Composición

- Puerta: centro (50%, 59.2%), ancho 3.75%, alto 2.9% del PNG original de 1672 × 941.
- El marco y el detalle comparten el overscan 1.06 de la capa de suelo.
- El detalle de fachada se registra en el recorte (626, 413, 420, 300) de p2-img5 y sus bordes se funden con una máscara estática.
- Un único interior permanece montado detrás de las hojas. La escala inversa compensa la cámara exterior para que el pasillo conserve profundidad durante el cruce.
- Las hojas se deslizan, la apertura recorta el interior y el resplandor nace en esa apertura. No hay sustitución de la imagen interior ni un corte de pantalla completa.
- El estado se puede recorrer en ambos sentidos. Movimiento reducido muestra una escena estática; el enlace de teclado permite saltar la entrada.

## Assets generados

Herramienta: image_gen integrada, sin CLI. Resoluciones reales de salida (los prompts solicitan mayor resolución, pero estas son las entregadas por la herramienta):

| Archivo en public/img/landing/entrance | Resolución | Uso |
| --- | --- | --- |
| interior-main.png | 1672 × 941 | Interior continuo, vista previa y llegada |
| entrance-frame.png | 1902 × 827 | Marco con centro transparente |
| facade-detail.png | 1484 × 1060 | Detalle de la misma fachada durante el acercamiento |

Next/Image sirve versiones optimizadas; sizes contempla el recorte vertical de móviles. Los PNG originales de section2 permanecen intactos.

## Verificación

- TypeScript, ESLint de archivos modificados, git diff --check y compilación de producción correctos.
- Capturas de aproximación, apertura, interior visible, resplandor, llegada y scroll inverso en Chrome (1440 × 900).
- Móvil 390 × 844 sin desbordamiento horizontal; images sizes contempla el recorte vertical.
- Movimiento reducido sin pin-spacers; escena interior estática.
- Cambio de breakpoint: dos pins en pantalla pequeña y uno al regresar a escritorio, sin pins duplicados.
- Navegación con rueda real, foco de teclado en Saltar entrada y Enter: llegada a #como-funciona respetando su margen de 96 px.
- Sin errores de JavaScript durante la revisión en navegador.

## Prompts finales

### Interior

Use case: stylized-concept. Create a production background for a continuous camera entrance into Fexpo. Input image is the interior style and architecture reference. Generate a very high quality 3840x2160 16:9 crisp detailed version of this same interior viewed straight ahead from its entrance, centered one-point perspective, vanishing point at x50% y55%. Preserve bright white round columns, two-storey mezzanine, enormous blue cylindrical overhead FEXPO sign, blue/yellow banners, polished white tile and blue central carpet, small reception desk in distance, visitors walking on BOTH SIDES leaving the central passage clear, expo technology booths and plants. Clean illustrated 3D architectural aesthetic matching reference, high detail faces and anatomy, clear natural daylight. Frame slightly wider with NO close-up glass door panels or doorway frame along the image edges: camera just inside the open doorway. The interior will be revealed through an opening then fill the screen, so all architecture must align on the center corridor and central point of fuga. Only text FEXPO and its white diamond grid logo on banners, no invented small text or extra slogans, no robots, no neon, no blur, no UI, no watermark. Keep all essential architecture visible in the middle 60% so mobile crop works.

Referencia: codex-clipboard-e42e165a-7f26-47c5-9d52-9c9115809f9a.png proporcionada por el usuario.

### Marco

Use case: background-extraction / stylized-concept. Production transparent architectural overlay for the exact CENTRAL SMALL ENTRANCE of the white curved-roof blue-glass exhibition pavilion in the reference. Generate ONLY a close-up frontal rectangular white aluminium automatic sliding-door surround, no building facade, no roof, no floor, no landscape, no people, no letters. Landscape ratio 2.3:1, sharp high resolution at least 2048 pixels wide. The frame tightly touches the 4 image borders without transparent outer margins: very slender white/silver jambs occupying only the leftmost and rightmost 3% of width, a horizontal white transom occupying the topmost 5% of height, extremely thin silver threshold at the bottom. Entire large rectangular CENTER MUST BE TRULY TRANSPARENT (no glass inside the opening, no door panels). Straight front-on geometry, no tilted perspective. Small realistic inset grooves and sunlight on white metal, subtle soft blue reflected light consistent with the supplied pavilion; crisp illustrated 3D materials matching reference. This asset will overlay the tiny central blue door and enlarge as camera enters; exact clean rectangle aperture is essential. Fully transparent background and fully transparent center, not a checkerboard painted into the image.

Referencia: public/img/landing/section2/p2-img5.png.

### Detalle de fachada

Use case: precise-object-edit. This is an exact cropped region of our EXISTING parallax exterior. Reconstruct this SAME IMAGE as a very high resolution 2800x2000 architectural detail plate, preserving the exact same composition, perspective, pixel-relative object positions, building outline and aspect ratio 1.4:1. It will be registered back over the original image, so do NOT reframe or redesign. Preserve the low curved white roof, blue grid-glass central facade, white central diamond logo, identical number/spacing white vertical pillars, smaller wings, yellow flags, trees, steps and people positions. Central automatic doorway is precisely centered at x50%, y48% of this cropped canvas: doorway aperture extends x42.5% to57.5%, y43.5% to52.5%. Make that exact entrance a crisp white/silver-framed BLUE GLASS double automatic door with a fine vertical center seam. Refine all materials and details without changing architecture. Visitors in front of the door should be small and on either side of the doorway, leaving its central opening unobstructed. Same bright illustrated 3D style with blue yellow white colors. The upper area outside the silhouette of buildings must remain TRANSPARENT, as in the reference, no sky. Other surfaces opaque. Main goal extremely sharp detailed blue glass facade and real doorway at their exact existing positions, not a newly designed building. No added text or logos.

Referencia: recorte de análisis (626, 413, 420, 300) de p2-img5.png, sin retocar el original.


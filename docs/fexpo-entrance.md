# Entrada continua a Fexpo

La secuencia usa las capas existentes de section2. En escritorio prolonga la misma timeline y el mismo pin de FexpoParallax después de Prueba el recorrido. En pantallas pequeñas se sitúa después del recorrido en flujo normal. Lenis sigue teniendo una sola instancia, gestionada por FexpoParallax.

## Composición

- Puerta: centro (50%, 59.2%), ancho 3.75%, alto 2.9% del PNG original de 1672 × 941.
- El marco y el detalle comparten el overscan 1.06 de la capa de suelo.
- El detalle de fachada se registra en el recorte (626, 413, 420, 300) de p2-img5 y sus bordes se funden con una máscara estática.
- Dos capas PNG transparentes, una del suelo completo y otra del tramo cercano, quedan delante del marco y de las hojas. El centro del suelo completo tiene una máscara suave donde se registra el detalle cercano para evitar figuras duplicadas. Ambas desaparecen durante el cruce.
- La cámara se mantiene en una escala moderada mientras el público es visible y acelera al cruzar la puerta. Nunca supera `cameraCeiling` (4.6): el zoom de ~35x que había antes obligaba a rasterizar ~12 capas compuestas a esa escala y la GPU las pintaba a trozos (parches azules y capas desalineadas).
- Un único interior permanece montado detrás de las hojas. La escala inversa compensa la cámara exterior para que el pasillo conserve profundidad durante el cruce.
- Las hojas se deslizan, la apertura recorta el interior y el resplandor nace en esa apertura.
- En el umbral el relevo lo toma el «iris» (`data-entrance-iris`, en `FairScene`): el mismo interior en espacio de pantalla, recortado con `clip-path` al rectángulo exacto de la apertura y abierto hasta el encuadre completo. El relevo es píxel a píxel (se mide con `getBoundingClientRect` de ambos interiores) y el final es el interior a pantalla completa.
- Desde que se abren las puertas la fachada llena el encuadre; `data-entrance-deep` oculta cielo, nubes, skyline y dirigible para que dejen de rasterizarse.
- El estado se puede recorrer en ambos sentidos. Movimiento reducido muestra una escena estática; el enlace de teclado permite saltar la entrada.

## Assets generados

Herramienta: image_gen integrada, sin CLI. Resoluciones reales de salida (los prompts solicitan mayor resolución, pero estas son las entregadas por la herramienta):

| Archivo en public/img/landing/entrance | Resolución | Uso |
| --- | --- | --- |
| interior-main.png | 1672 × 941 | Interior continuo, vista previa y llegada |
| entrance-frame.png | 1902 × 827 | Marco con centro transparente |
| facade-detail.png | 1484 × 1060 | Detalle de la misma fachada durante el acercamiento |
| people-ground-wide.png | 1671 × 941 | Suelo y visitantes a lo ancho del parallax, alfa transparente fuera del primer plano |
| people-ground-near.png | 1484 × 1060 | Escaleras y visitantes cercanos, registrados sobre el detalle de fachada |

Next/Image sirve versiones optimizadas del edificio y el interior; las capas transparentes de personas se entregan sin recomprimir para conservar el borde alfa. `sizes` contempla el recorte vertical de móviles. Los PNG originales de section2 permanecen intactos.

## Verificación

- TypeScript, ESLint de archivos modificados, git diff --check y compilación de producción correctos.
- Capturas de aproximación, apertura, interior visible, resplandor, llegada y scroll inverso en Chrome (1440 × 900).
- Móvil 390 × 844 sin desbordamiento horizontal; images sizes contempla el recorte vertical.
- Movimiento reducido sin pin-spacers; escena interior estática.
- Cambio de breakpoint: dos pins en pantalla pequeña y uno al regresar a escritorio, sin pins duplicados.
- Navegación con rueda real, foco de teclado en Saltar entrada y Enter: llegada a #como-funciona respetando su margen de 96 px.
- Sin errores de JavaScript durante la revisión en navegador.
- Se compararon los estados de puerta, umbral e interior en 1900 × 906 y móvil 390 × 844 con las personas delante del marco; sin errores de JavaScript.

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

### Suelo y visitantes, ancho completo

Use case: background-extraction + precise-object-edit. Asset for the Fexpo landing parallax: a high quality transparent foreground plate that registers EXACTLY over the first supplied source image p2-img5. The second image shows the blurry zoom that this plate must repair. KEEP THE FULL ORIGINAL 16:9 CANVAS, its camera perspective, exact horizon and vanishing point at x50%, y59%, and pixel-relative placement and size of every figure, planter and floor line. Isolate and finely reconstruct only the broad white tiled walkway, central ascending steps, flowers/low planters touching the walkway, and ALL visitors walking up toward the center entrance across the lower half of the original scene. People at distant center remain small; nearest visitors at left and right retain their positions and sizes. Enhance crisp detail, anatomically coherent people and clean tile edges in the same vivid polished 3D illustration style, blue yellow white palette. The upper facade, glass doors, skyline, sky, trees, upper vegetation, banners and everything behind the people and ground must be REAL TRANSPARENT ALPHA. Crucially the area above and including the door opening at x48%-52%, y57%-60% MUST BE TRANSPARENT; only visitors and their individual legs in front of it may remain. The ground starts below the doorway and extends to the bottom edge, with clean natural cutout edges around the people and plants. No new architecture, no change to crowd arrangement, no extra text or logos, no painted black/white background or checkerboard, no shadows floating in transparent regions. This output is superimposed on the reference as a depth layer, so alignment is critical. Do not crop or reposition any subject. Produce a sharp high-resolution transparent PNG.

Referencia: public/img/landing/section2/p2-img5.png y la captura codex-clipboard-2fae106c-d300-42f2-8b47-7f8b0e59f00f.png.

### Suelo y visitantes, tramo cercano

Use case: background-extraction / precise-object-edit. Edit the supplied close-up Fexpo pavilion detail into a perfectly registered transparent foreground plate. Keep EXACTLY the same image canvas and camera view: white central staircase, tiled walkway, all small visitors going upward toward the center door, nearer people at both edges, low white planters and bright yellow/green flowers touching the stairs. Preserve the positions, poses, sizes, spacing and converging tile/step lines of these existing objects; enhance the sharpness and coherent detail of faces, clothing, legs, blue backpacks and flowers, in exactly the same premium colorful clean 3D illustration style. Crucial transparency: remove the entire sky, curved blue-and-white building, glass facade, white door frame, glass doors, fixed glass panes, upper trees and banners. Only stairs, floor, people, and low planters/flowers in front of the doorway remain opaque. The door opening at the canvas center around x50%, y45–51% stays transparent, EXCEPT where an actual visitor's silhouette crosses it. The distant entrance visitors must not be cut horizontally by a rectangular boundary: preserve whole bodies and feet, alpha around individual silhouettes. Upper 40% of canvas fully transparent. Ground continues naturally to image bottom and both image edges, preserving its exact perspective. No extra subjects or altered architecture, no background color, no black, white, or checkerboard fill: genuine transparent PNG. This is a high-detail depth layer laid on the unchanged source at exact coordinates, so registration is more important than aesthetic reinterpretation.

Referencia: public/img/landing/entrance/facade-detail.png y la misma captura del usuario.


## Llegada: «Cómo funciona» mientras el interior se abre

En escritorio (misma condición que `journeyOverlayQuery`) el texto y las cuatro tarjetas de «Cómo funciona» viven dentro de la escena fija (`ArrivalOverlay`, en `HowItWorksSection.tsx`) y los conduce la misma timeline de la entrada: el velo blanco entra en entrance+1.36, el encabezado en +1.40 y las tarjetas en cascada desde +1.48, es decir, mientras el iris todavía se está abriendo (+1.31 a +1.79). Después el pin sostiene la escena un viewport más (`arrivalOverlap`) para dar tiempo de lectura antes de soltarse.

`HowItWorksSection` se queda en el documento solo como ancla de `#como-funciona` (altura cero, invisible, un viewport por encima de la liberación del pin) para que la navegación y «Saltar entrada» aterricen con todo ya visible. En pantallas pequeñas, táctiles o con movimiento reducido el overlay no existe y la sección es la franja blanca de siempre.

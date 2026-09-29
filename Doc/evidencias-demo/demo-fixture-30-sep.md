# Fixture demo FIPAZ 2026 — borrador web

**Estado:** propuesta local para revisión de web, móvil y documentación global. No publicar como dato confirmado hasta contrastarla con el issue dependiente.

**Evento:** `event-fipaz-2026` · **FIPAZ 2026** · La Paz, Bolivia. En la interfaz, fechas y recinto aparecen como **sujetos a confirmación**. El código web contiene horarios de ejemplo para actividades; esos horarios no son una confirmación de FIPAZ.

## Fixture propuesto

Los tres stands seleccionados para contar el recorrido son ficticios. Categorías, actividades y promoción reflejan la propuesta actual del mock web. Los bloques se infieren de la primera letra del código y deben confirmarse con el equipo móvil antes de declararlos compartidos.

| Stand | Código | Bloque propuesto | Categoría | Actividad de ejemplo | Promoción de ejemplo |
| --- | --- | --- | --- | --- | --- |
| Altura Labs | B-117 | B | Tecnología | Demo en vivo de asistente de voz en quechua | 30 % de descuento en plan Starter |
| Kawsay Salud | R-24 | R | Salud | Consulta rápida de bienestar | Sin promoción de ejemplo |
| Sabor Andino | G-08 | G | Gastronomía | Degustación de singani de altura | Sin promoción de ejemplo |

**Misión de ejemplo:** Ruta FIPAZ — visitar Altura Labs, Kawsay Salud y Sabor Andino una vez cada uno.

**Regla de puntos:** una visita nueva y única suma 50 puntos; repetir el check-in del mismo stand suma 0 puntos. Completar la Ruta FIPAZ no añade un bono aparte; los puntos ya se acreditan por las visitas. El estado web de inicio representa dos visitas de ejemplo: 2 de 3 stands y 100 puntos. Al visitar el tercer stand: 3 de 3 y 150 puntos.

## Sincronización por superficie

| Dato | Web `/demo` | Panel `/panel` | App móvil | ¿Se sincroniza en vivo? |
| --- | --- | --- | --- | --- |
| Evento e `eventId` | `event-fipaz-2026`, fixture local | Mismo ID como contexto local de panel | El ID comunicado para sus mocks es `event-fipaz-2026` | No |
| Stands, códigos, categoría, actividad y promoción | Catálogo local `src/data/demo-fixture.ts`; el panel inicia su catálogo desde ese mock web | Estado de panel propio; el rol empresa ve su stand, el organizador tiene el catálogo | Mocks separados en el repositorio móvil, no disponible en este checkout para comparar | No |
| Misión y puntos | Store de demo del navegador | Catálogo y métricas de panel de ejemplo | Store/backend simulado móvil según el contrato recibido | No |
| Visitas y progreso | Estado persistido en el navegador | Check-ins y métricas del mock de panel | Estado local/mock de la app | No |
| Premios | Catálogo ilustrativo; la acción de canje es una simulación local | Datos de panel de ejemplo | No verificado contra el repositorio móvil | No |
| Fechas y recinto | No se anuncian como confirmados | Se marcan sujetos a confirmación | Pendiente de contrastar | No |

El panel y la app tienen estados separados. Compartir el mismo identificador o copiar el fixture no transmite visitas, puntos, premios ni cambios de perfil entre superficies. No existe un puente web↔móvil implementado y probado en este alcance.

## Frase para presentación

> “Esta es una demostración con stands ficticios: cada primera visita suma 50 puntos y repetir el check-in suma cero. Los premios son propuestas; las fechas y el recinto de FIPAZ 2026 están sujetos a confirmación.”

## Validaciones pendientes antes de publicar en `fexpo_global_docs`

- Contrastar actividad, promoción y bloque con el mock de móvil y actualizar ambos repositorios con los mismos valores.
- Leer el issue [fexpo_global_docs#1](https://github.com/ExpoVia/fexpo_global_docs/issues/1) para registrar fechas y recinto que FIPAZ haya confirmado.
- Trasladar este borrador al repositorio `fexpo_global_docs` y comunicar el fixture final a las personas responsables de web y móvil.

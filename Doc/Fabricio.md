# Fabricio — Investigación Visual y Formularios B2B
> ExpoVia · FIPAZ 2026 | Actualizado: 2026-09-18 |

---

## Tarjeta #17 — Estilos y Assets 

### Tokens de identidad visual (propuesta para compartir entre web, app móvil y panel B2B)

```css
/* ── Paleta principal ─────────────────────────────────────────────── */
--expo-navy:    #2f2d4c;   /* Texto principal, bordes duros */
--expo-blue:    #1677b8;   /* Acciones primarias, topbar */
--expo-lilac:   #b984b6;   /* Topbar gradiente, acentos suaves */
--expo-sky:     #82b5e3;   /* Headers de sección, NFC feedback */
--expo-yellow:  #ffc21a;   /* Puntos, highlights, botones de acción */
--expo-coral:   #f28a72;   /* Alertas, error suave, estado vacío */
--expo-green:   #62be5a;   /* Éxito, completado, stands visitados */
--expo-purple:  #8357a5;   /* Misiones, tab activo gamificación */
--expo-pink:    #f4a2c0;   /* Selfie, cámara, corazones favoritos */
--expo-mint:    #9ed8c9;   /* Stands visitados, mapa */
--expo-bg:      #f4fafc;   /* Fondo neutro general */
--expo-card:    #ffffff;   /* Fondo de cards */
--expo-line:    #d8e5ec;   /* Separadores, bordes suaves */

/* ── Tipografía ──────────────────────────────────────────────────── */
--font-display: var(--font-geist-sans), system-ui;
--font-mono:    var(--font-geist-mono), monospace;  /* Pixel-label, códigos */

/* ── Sombras pixel-art ───────────────────────────────────────────── */
--shadow-card:  3px 3px 0 color-mix(in srgb, var(--expo-navy) 10%, transparent);
--shadow-panel: 4px 4px 0 color-mix(in srgb, var(--expo-navy) 22%, transparent);
--shadow-btn:   2px 2px 0 var(--expo-navy);

/* ── Radios ──────────────────────────────────────────────────────── */
--radius-card:  14px;
--radius-panel: 16px;
--radius-btn:   12px;
--radius-badge: 6px;
```

---

### Análisis pixel-art vs. legibilidad en contexto feria

| Elemento | ✅ Funciona bien | ⚠️ Riesgo en campo |
|---|---|---|
| Bordes sólidos 2px (`pixel-panel`) | Distingue cards a plena luz solar | Bajo contraste en AMOLED oscuro si bg es claro |
| Tipografía `font-black` ≥14px | Lectura rápida en movimiento | Tamaños <12px difíciles en pantallas de baja DPI |
| Paleta saturada (blue, coral, yellow) | Identidad fuerte, memorable | Posible fallo WCAG AA si se combina mal con blancos |
| Sombras cartesianas (4px 4px 0) | Profundidad retro, 0 impacto en rendimiento | — |
| Imágenes PNG reales en premios/misiones | Credibilidad B2B, reconocimiento inmediato | Requieren compresión ≤100KB para carga rápida en evento |

**Decisión:** Mantener el vocabulario pixel (bordes duros, sombras, tipografía bold) como base. Usar imágenes PNG reales para iconos de productos/misiones — dan calidez y reconocimiento visual sin perder la identidad.

---

### Inventario completo de Assets

#### Premios (`/public/assets/rewards/`)

| Archivo | Premio | Licencia | Estado |
|---|---|---|---|
| `coffee.png` | Café de cortesía | Ilustración interna FIPAZ | ✅ OK |
| `backpack-removebg-preview.png` | Kit Explorador | Foto con bg eliminado — **verificar origen** | ⚠️ Confirmar |
| `llavero.png` | Llavero coleccionable | Ilustración interna FIPAZ | ✅ OK |
| `poster.png` | Póster digital FIPAZ | Diseño interno | ✅ OK |
| `ticket.png` | Sticker ExpoVia | Diseño interno | ✅ OK |
| `tomatodo.png` | Tomatodo ExpoVia | Foto de producto — **verificar derechos** | ⚠️ Confirmar |
| `reward-items.jpg` | (Genérico — ya no se usa) | — | 🗑️ Deprecado |

#### Misiones (`/public/assets/missions/`)

| Archivo | Misión asignada | Licencia | Estado |
|---|---|---|---|
| `stand.png` | Primer contacto (NFC stand) | Ilustración interna | ✅ Implementada |
| `mapa.png` | Explorador ExpoVia | Ilustración interna | ✅ Implementada |
| `food.png` | Sabores de la feria | Ilustración interna | ✅ Implementada |
| `education.png` | Agenda activa | Ilustración interna | ✅ Implementada |
| `money.png` | Red de Finanzas | Ilustración interna | ✅ Implementada |
| `redes-sociales.png` | Embajador ExpoVia (compartir en redes) | Ilustración interna | ✅ Implementada |
| `camara.png` | Selfie con el stand | Ilustración interna | ✅ Implementada |
| `ubicacion.png` | Maestro del Mapa | Ilustración interna | ✅ Implementada |
| `startup.png` | Ruta Tecnológica + Galaxia Startups | Ilustración interna | ✅ Implementada |

> **Nota técnica:** El archivo `redes sociales.png` fue renombrado a `redes-sociales.png` para evitar problemas de codificación URL en producción.

#### Assets faltantes (pendiente de producir)

| Asset | Uso | Prioridad |
|---|---|---|
| Logo ExpoVia SVG | Header web, app shell, emails | 🔴 Alta |
| Iconos de stands reales (por empresa) | StandCard avatars | 🟡 Media |
| Mapa base de la feria (SVG/PNG) | Módulo de mapa interactivo (Franco) | 🟡 Media |
| Ilustración estado vacío "sin puntos" | RewardsScreen estado 0 pts | 🟢 Baja |

---

### Animaciones implementadas

Todas las imágenes de premios y misiones tienen animación de **levitación suave** (float):

```typescript
// Configuración compartida (motion/react)
const floatTransition: Transition = {
  duration: 2.6 – 2.8,   // segundos por ciclo
  repeat: Infinity,
  repeatType: "mirror",   // sube → baja → sube (seamless)
  ease: "easeInOut",      // suave, sin borde duro
};

// Rango de movimiento: y: [0, -7, 0] px (premios) / y: [0, -3, 0] (misiones)
```

> **Pendiente de accesibilidad:** Agregar `useReducedMotion()` para detener las animaciones cuando el sistema operativo tiene `prefers-reduced-motion: reduce` activo.

---

### Checklist de Accesibilidad WCAG 2.1 AA

- [x] `aria-hidden="true"` en iconos decorativos
- [x] `aria-label` en botones sin texto visible
- [x] `<button>` nativo en todos los elementos interactivos
- [x] `alt` descriptivo en imágenes de misiones/premios
- [x] `line-clamp-2` + `truncate` en textos que pueden crecer
- [ ] Contraste texto/fondo ≥ 4.5:1 — **pendiente auditoría**
- [ ] Focus visible en todos los elementos (actualmente solo `:focus-visible`)
- [ ] `prefers-reduced-motion` en animaciones de levitación — **pendiente**

---

## Tarjeta #36 — Setup React y Maquetado B2B · Backlog (con Jhamil)

### Roles y pantallas prioritarias

| Rol | Tareas frecuentes | Pantallas clave |
|---|---|---|
| **Organizador** | Crear evento, importar stands CSV, aprobar empresas | Dashboard, Lista empresas, Editor evento |
| **Staff/Soporte** | Validar canje en tiempo real, ver métricas | Panel de canje, Estadísticas |
| **Empresa/Expositor** | Editar perfil, gestionar oferta, ver visitas | Perfil empresa, Métricas stand |
| **Gestor de stand** | Actualizar actividad del día, confirmar canjes | Panel stand (mobile-first) |

### Mapa de navegación B2B (propuesta)

```
/panel
├── /dashboard              ← solo organizador
├── /empresas
│   ├── /lista              ← tabla filtrable (organizador/staff)
│   └── /[id]/editar        ← formulario empresa
├── /stands
│   ├── /lista              ← mapa + lista
│   └── /[id]               ← detalle + actividad
├── /canjes/validar         ← escáner QR móvil
└── /metricas               ← analytics básico
```

### Preguntas pendientes para Jhamil y Erick

1. ¿RBAC usa roles fijos o permisos granulares? → impacta navegación lateral
2. ¿Primera versión es mono-evento o multi-evento?
3. ¿El gestor de stand accede solo desde móvil → App o PWA?
4. ¿Cómo se valida autorización por empresa sin depender de ocultar botones? (definir con Erick)

---

## Tarjeta #37 — Formularios de Empresa y Perfiles · Backlog (con Jhamil)

### Esquema de campos — Perfil de Empresa Global

| Campo | Tipo | Req. | Validación | Visibilidad |
|---|---|---|---|---|
| Nombre legal | text | ✅ | ≤120 chars, único | Público |
| NIT/RUC | text | ✅ | Formato boliviano | Solo FIPAZ |
| Rubro/Categoría | select | ✅ | Lista cerrada | Público |
| Logo | image | ✅ | PNG/JPG ≤2MB, ≥200×200px | Público |
| Descripción corta | textarea | ✅ | ≤280 chars | Público |
| Descripción larga | richtext | ❌ | ≤2000 chars | Público |
| Web | url | ❌ | https válida | Público |
| Email de contacto | email | ✅ | Válido + consentimiento | Solo sesión iniciada |
| Teléfono | tel | ❌ | Formato BO (+591) | Solo sesión iniciada |

### Esquema de campos — Participación en Evento/Stand

| Campo | Tipo | Req. | Validación |
|---|---|---|---|
| Código de stand | text | ✅ | Único por evento |
| Ubicación en mapa | coord | ✅ | Punto válido en plano |
| Oferta especial | textarea | ❌ | ≤140 chars |
| Premio disponible | select | ❌ | Del catálogo del evento |
| Estado verificación | enum | ✅ | borrador/pendiente/publicado/rechazado |
| Razón de rechazo | text | condicional | Solo si estado = rechazado |

### Flujo de estados del perfil

```
borrador → pendiente_verificación → publicado
                                 ↘ rechazado → (empresa corrige) → pendiente_verificación
```

### Datos que requieren consentimiento legal

- Email visible para visitantes → consentimiento explícito (ley boliviana de protección de datos)
- Teléfono → consentimiento explícito
- Leads generados en stand → aviso de privacidad + responsable de datos

> **Importante:** FIPAZ debe validar el texto del checkbox con asesoría legal antes de activar la captura de leads en producción.

---

## Trabajo implementado en esta sesión (Fabricio)

### Cambios de código

| Archivo | Cambio |
|---|---|
| `src/data/rewards.ts` | Cada premio apunta a su PNG específico |
| `src/features/rewards/RewardsScreen.tsx` | Imágenes flotantes en cards y modal de canje |
| `src/features/missions/MissionsScreen.tsx` | `MISSION_IMAGES` completo (10/10 misiones), `PixelIcon` con soporte de imagen animada |
| `src/features/explore/ExploreScreen.tsx` | Layout corregido (grid 2 columnas), filtros con scroll horizontal |
| `src/features/stands/components/StandCard.tsx` | `min-w-0`, `overflow-hidden`, `truncate` en nombre del stand |
| `src/app/globals.css` | `overflow-x: hidden` en `.app-screen-stack` (revertido de `clip`) |

### Assets añadidos o renombrados

| Acción | Archivo |
|---|---|
| Renombrado | `redes sociales.png` → `redes-sociales.png` |
| Asignado | `stand.png` → misión "Primer contacto" |
| Asignado | `mapa.png` → misión "Explorador ExpoVia" |
| Asignado | `redes-sociales.png` → misión "Embajador ExpoVia" |
| Asignado | `camara.png` → misión "Selfie con el stand" |
| Asignado | `ubicacion.png` → misión "Maestro del Mapa" |

### Checklist de cierre

- [x] Investigar identidad visual reutilizable para ExpoVia
- [x] Documentar tokens de color y tipografía
- [x] Inventario completo de assets con origen y licencias
- [x] Implementar animaciones de levitación en premios (6/6)
- [x] Implementar animaciones de levitación en misiones (10/10)
- [x] Corregir layout de pantalla Explorar (grid 2 columnas)
- [x] Documentar esquema de campos B2B (#36, #37)
- [ ] `prefers-reduced-motion` en animaciones — próxima sesión
- [ ] Auditoría de contraste WCAG — próxima sesión
- [ ] Acordar RBAC con Erick para navegación B2B

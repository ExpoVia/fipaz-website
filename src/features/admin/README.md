# Módulo de administración (`/admin`)

Panel para que una empresa gestione **dinámicas**, **premios**, **inventario**, **actividades**,
**asistencia** y el **escáner de check-in** de su stand. Por defecto funciona con **datos
simulados**; con `NEXT_PUBLIC_API_MODE=http` llama al backend (`fexpo-backend`). Ver
[Conexión con el backend](#conexión-con-el-backend).

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/admin` | Resumen: accesos por stand y por evento |
| `/admin/stands/:standId/dynamics` | Dinámicas del stand |
| `/admin/stands/:standId/activities` | Actividades del stand |
| `/admin/stands/:standId/scan` | Escáner de QR de visitantes (check-in con la cámara del operador) |
| `/admin/activities/:activityId/attendance` | Asistencia (`?status=registered\|present\|absent\|cancelled`) |
| `/admin/events/:eventId/rewards` | Catálogo de premios |
| `/admin/events/:eventId/inventory` | Inventario (`?reward=:rewardId` filtra por premio) |

Ejemplo con datos: `/admin/stands/stand-altura-labs/dynamics`, `/admin/events/event-fipaz-2026/rewards`.
Se llega desde el panel del expositor (ítem **Administración**).

## Arquitectura

```text
app/admin/**/page.tsx          páginas (server): resuelven params y nombres de stand/evento
        ↓
features/<módulo>/components   pantallas y modales (client)
        ↓
features/<módulo>/hooks        estado de carga + mutaciones (useAsyncResource)
        ↓
features/<módulo>/*.service.ts selector: elige mock o http según NEXT_PUBLIC_API_MODE
        ↓                                   ↓
*.mock-service.ts (+ *.mock.ts)      *.http-service.ts → lib/api/http-client.ts → backend
datos simulados en memoria           (misma interfaz, mismos tipos)
```

Regla: **los componentes nunca importan `*.mock.ts`, `lib/mock` ni `lib/api`**. Solo hablan con el
servicio a través de un hook.

Cada feature (`dynamics`, `rewards`, `inventory`, `activities`, `check-ins`) tiene:

- `types.ts` — entidades, inputs y la interfaz del servicio (`DynamicsService`, …).
- `constants.ts` — etiquetas en español, opciones de selects y límites de validación.
- `validation.ts` — esquema Zod del formulario (mensajes en español).
- `*.mock.ts` — datos de prueba de todos los estados.
- `*.service.ts` — selector mock/http (lo único que importan los hooks).
- `*.mock-service.ts` y `*.http-service.ts` — las dos implementaciones de la misma interfaz.
- `hooks/` y `components/`.

Piezas compartidas: `components/admin/` (tabla responsive, modal, toasts, formularios, estados),
`hooks/` (`useAsyncResource`, `useZodForm`, `useBusyIds`), `lib/validation/fields.ts` (enteros y
textos estrictos), `lib/mock/` (latencia, persistencia de sesión, fallo simulado),
`lib/api/` (`config.ts`, `http-client.ts`, `service-error.ts`, `endpoints.ts`: rutas del backend) y
`config/admin-routes.ts` (rutas de la app).

## Conexión con el backend

### Cómo activarla

1. Copia `.env.example` a `.env.local`, pon `NEXT_PUBLIC_API_MODE=http` y configura `BACKEND_URL` con el origen público del backend (sin `/api/v1`).
2. Levanta el backend (`fexpo-backend`, puerto 3000 por defecto) y el frontend en **otro puerto**:
   `pnpm dev -p 3001`. Reinicia `next dev` cada vez que cambies las variables.
3. Sin `NEXT_PUBLIC_API_MODE=http` todo sigue funcionando con datos simulados.

Los componentes y hooks no cambian entre modos: solo cambia qué servicio entrega `*.service.ts`.

### Qué hace `lib/api/http-client.ts`

Habla el contrato del backend: éxito `{ success: true, data, meta }` y error
`{ success: false, error: { code, message, details } }`; base `/api/v1`; JWT en `Authorization: Bearer`.

- **Proxy, no CORS.** El backend no habilita CORS, así que el navegador no puede llamarlo directo.
  `next.config.ts` reenvía `/api/v1/*` a `BACKEND_URL` y el navegador solo habla con su propio origen.
  Las llamadas de autenticación y stands de empresa usan el mismo proxy.
  Las páginas de servidor (nombre del stand) sí llaman directo a `BACKEND_URL`.
- **Paginación.** El backend pagina (20 por defecto, máximo 100). `apiGetAll` pide la primera página sin
  parámetros y recorre el resto con el `limit` que devuelve `meta`, porque las tablas filtran en cliente.
- **Cuerpos.** El backend usa `forbidNonWhitelisted`: una propiedad de más es un 400. Por eso no se envían
  `standId`/`eventId` (van en la URL) ni `initialStock` al editar.
- **Errores en español.** Varios mensajes del backend llegan en inglés (`INTERNAL_ERROR`, autenticación, los
  `details` de validación), así que se traducen por `code` y, si no se conoce, por estado HTTP. Solo se
  reenvía el texto de `RESOURCE_NOT_FOUND` y `PG_ERROR`, cuyo mensaje nace en SQL y está en español.

  | Backend | `ServiceError` | Mensaje al usuario |
  | --- | --- | --- |
  | 401 `AUTH_REQUIRED` | `UNAUTHORIZED` | Tu sesión expiró o no has iniciado sesión… |
  | 403 `FORBIDDEN` / `INSUFFICIENT_PERMISSIONS` | `FORBIDDEN` | No tienes permisos para realizar esta acción. |
  | 404 `STAND_NOT_FOUND`, `EVENT_NOT_FOUND`… | `NOT_FOUND` | No encontramos el stand/evento solicitado. |
  | 404 genérico | `NOT_FOUND` | El de la entidad (p. ej. «No encontramos la dinámica solicitada.») |
  | 400 / 422 (`VALIDATION_ERROR`…) | `VALIDATION` | Algunos datos no son válidos. Revisa el formulario… |
  | 409 `CONFLICT` | `CONFLICT` | La operación no se pudo completar porque el registro cambió… |
  | 503 `DATABASE_UNAVAILABLE` | `NETWORK` | El servicio de datos está temporalmente no disponible… |
  | otros 5xx, sin red, tiempo agotado (15 s) | `NETWORK` | No pudimos conectar con el servidor… |

### Estado frente a `fexpo-backend`

El backend actual expone `GET /health` (consulta PostgreSQL), `GET /events/:eventId/stands` y
`GET /stands/:standId`. Los issues #13 y #14 se cerraron en el commit `2435b6f`: refresh inválido y
evento inexistente se clasifican como `401` y `404`; fallas de PostgreSQL como `503 DATABASE_UNAVAILABLE`.
La conexión de producción debe devolver `database: up` en health para confirmar que la BD también responde.
Además:

- **Ids UUID.** El backend valida `standId`/`eventId` con `ParseUUIDPipe`. Los ids de la demo
  (`stand-altura-labs`, `event-fipaz-2026`) darán 400 en modo `http`; hay que navegar con UUID reales.
  `adminScopeService.getEvent` sigue usando el catálogo estático (no existe `GET /events/:id`).
- **Autenticación.** El frontend obtiene tokens con Google, verifica `/auth/me` y renueva una vez tras un
  `401`; el refresh envía solo `{ refreshToken }`, como exige el DTO backend. El servicio HTTP toma el JWT
  desde la sesión persistida.
- **Bloqueo pendiente de backend.** En el commit `2435b6f`, `/auth/me` todavía devuelve `roles: []` y no
  existe `POST /companies`; por ello no se puede completar ni verificar el flujo `company_admin` y registro
  de empresa contra producción.
- **Stands del evento.** El directorio llama `GET /events/:eventId/stands`; configura
  `NEXT_PUBLIC_FIPAZ_EVENT_ID` con el UUID real. El id demostrativo `event-fipaz-2026` no es un UUID y no
  debe enviarse a la API.
- **Cambiar estado.** `toggleDynamicStatus` / `toggleRewardStatus` leen el estado vigente (`GET`) y envían el
  contrario en `PATCH …/status { status }`. Si backend prefiere alternar por su cuenta, se simplifica en
  `*.http-service.ts`.

### Endpoints

Confirmados en el enunciado:

```http
GET    /stands/:standId/dynamics
POST   /stands/:standId/dynamics
PUT    /dynamics/:dynamicId
DELETE /dynamics/:dynamicId
PATCH  /dynamics/:dynamicId/status

GET    /events/:eventId/rewards
POST   /events/:eventId/rewards
GET    /rewards/:rewardId
PUT    /rewards/:rewardId
DELETE /rewards/:rewardId

GET    /events/:eventId/inventory
GET    /inventory/:inventoryId
POST   /inventory/:inventoryId/adjustments
GET    /inventory/:inventoryId/adjustments
```

**Propuestos** (no estaban definidos; acordar con backend):

```http
PATCH  /rewards/:rewardId/status                       activar/desactivar premio
GET    /stands/:standId/activities                     listar
POST   /stands/:standId/activities                     crear
GET    /activities/:activityId                         detalle
PUT    /activities/:activityId                         editar
POST   /activities/:activityId/cancel                  cancelar
GET    /activities/:activityId/attendance              participantes
PUT    /activities/:activityId/attendance/:participantId   { status: "present" | "absent" | "pending" }
POST   /stands/:standId/check-ins                      { method: "qr" | "nfc", credential, requestKey } (visitante autenticado)
POST   /stands/:standId/manual-check-ins               { userId | userQrToken, requestKey } (staff autenticado)
```

### Contratos que el backend debe respetar

- `GET /events/:eventId/rewards` devuelve cada premio con su resumen de stock
  (`stock: { inventoryId, onHand, reserved, available, delivered } | null`). Si no, la lista de premios
  necesitaría una segunda llamada por fila.
- `POST /events/:eventId/rewards` acepta `initialStock` (opcional) y crea el registro de inventario.
  `DELETE /rewards/:id` debe eliminar también su inventario e historial (el mock lo hace).
- `GET /events/:eventId/inventory` devuelve cada fila con `rewardName`, `rewardImageUrl`, `rewardStatus`.
- **Inventario:** `available = onHand − reserved`; `delivered` es un acumulado aparte. El backend debe
  **volver a validar** los ajustes con la misma regla que `features/inventory/adjustments.ts`
  (el stock físico no puede quedar por debajo de lo reservado) y responder 422.
  Tipos de ajuste: `increment`, `decrement`, `correction` (fija el stock físico), `restock`, `damage_loss`.
- **Actividades:** `registered` y `attendees` deben calcularse en servidor a partir de las inscripciones;
  al cambiar la asistencia la respuesta devuelve `{ record, activity }` con contadores al día.
  La capacidad no puede quedar por debajo de los registrados (422). Con la actividad cancelada,
  cambiar asistencia responde 409.
- **Check-ins:** `POST /stands/:standId/check-ins` valida el token del QR del visitante (`credential`) y
  responde con el check-in y sus puntos. Si el visitante ya registró presencia hoy en ese stand, el
  backend **no debe responder con error**: debe devolver 200/201 con el check-in existente y
  `status: "duplicate"`, para que el panel muestre un aviso amigable en vez de un error rojo (ver
  criterios de aceptación de la tarjeta). Rechazos con `code`: `QR_INVALID` (token inexistente o mal
  formado), `QR_EXPIRED` (token vencido), `PARTICIPANT_NOT_ACTIVE` (inscripción cancelada o visitante
  suspendido) y `STAND_NOT_ACTIVE`; `lib/api/http-client.ts` ya los traduce a mensajes en español.
- Fechas: `date` es `YYYY-MM-DD` y `startTime`/`endTime` son `HH:mm` (sin zona horaria). El resto son ISO 8601.

## Modo demostración (`NEXT_PUBLIC_API_MODE=mock`, por defecto)

En modo `http` estas herramientas y el aviso de la pantalla de inicio no se muestran.

- Los datos se guardan en `sessionStorage` (sobreviven a recargas de la pestaña, no a una sesión nueva).
- En el menú lateral: **Simular error del servidor** (fuerza el estado de error de todas las pantallas)
  y **Restablecer datos**.
- Cada llamada simulada tarda 250–550 ms para que se vean los estados de carga.
- **Escáner QR:** no hay un backend real emitiendo tokens, así que `features/check-ins/check-ins.mock.ts`
  trae un directorio de credenciales de prueba (p. ej. `FIPAZ-VISITANTE-4821`). Genera un QR con ese
  texto (cualquier generador sirve) para probar la cámara de punta a punta, o pégalo en el campo
  manual de la pantalla. `QR-EXPIRADO` y `QR-STAND-INACTIVO` fuerzan esos errores a propósito.

## Escáner de check-in (`/admin/stands/:standId/scan`)

Usa `@zxing/browser` (`BrowserQRCodeReader`) para leer el QR con la cámara del dispositivo del
operador (prioriza la trasera vía `facingMode: "environment"`) en modo continuo: no hay que recargar
ni reabrir la cámara entre visitantes. `features/check-ins/hooks/use-qr-scanner.ts` solo captura el
texto del QR; `features/check-ins/hooks/use-check-in-scanner.ts` decide qué hacer con él (deduplica
lecturas repetidas del mismo QR en menos de un segundo, evita envíos simultáneos y lleva el contador
de check-ins de la sesión). Requiere permiso de cámara del navegador (HTTPS o `localhost`); sin
cámara disponible, el campo de código manual cubre el mismo flujo.

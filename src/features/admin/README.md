# Módulo de administración (`/admin`)

Panel para que una empresa gestione **dinámicas**, **premios**, **inventario**, **actividades** y
**asistencia**. Hoy funciona **solo con datos simulados**: no hay llamadas HTTP al backend.

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/admin` | Resumen: accesos por stand y por evento |
| `/admin/stands/:standId/dynamics` | Dinámicas del stand |
| `/admin/stands/:standId/activities` | Actividades del stand |
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
features/<módulo>/*.service.ts ÚNICA capa que toca datos      ← se reemplaza al integrar
        ↓
features/<módulo>/*.mock.ts    datos semilla + "base de datos" en memoria
```

Regla: **los componentes nunca importan `*.mock.ts` ni `lib/mock`**. Solo hablan con el servicio a
través de un hook.

Cada feature (`dynamics`, `rewards`, `inventory`, `activities`) tiene:

- `types.ts` — entidades, inputs y la interfaz del servicio (`DynamicsService`, …).
- `constants.ts` — etiquetas en español, opciones de selects y límites de validación.
- `validation.ts` — esquema Zod del formulario (mensajes en español).
- `*.mock.ts` — datos de prueba de todos los estados.
- `*.service.ts` — implementación simulada del servicio.
- `hooks/` y `components/`.

Piezas compartidas: `components/admin/` (tabla responsive, modal, toasts, formularios, estados),
`hooks/` (`useAsyncResource`, `useZodForm`, `useBusyIds`), `lib/validation/fields.ts` (enteros y
textos estrictos), `lib/mock/` (latencia, persistencia de sesión, fallo simulado),
`lib/api/endpoints.ts` (rutas del backend) y `config/admin-routes.ts` (rutas de la app).

## Cómo conectar el backend

Solo hay que cambiar **los `*.service.ts`**: cada método debe seguir devolviendo lo mismo
(la interfaz del servicio está en `types.ts`).

1. En `<módulo>.service.ts`, sustituir el cuerpo de cada método por una llamada HTTP a la ruta
   indicada en su comentario (`API_ENDPOINTS` en `lib/api/endpoints.ts`).
2. Traducir los errores HTTP a `ServiceError` (`lib/api/service-error.ts`):
   404 → `NOT_FOUND`, 409 → `CONFLICT`, 422 → `VALIDATION`, red/5xx → `NETWORK`.
   La UI ya muestra su mensaje en formularios, diálogos y toasts.
3. Borrar el `*.mock.ts` del módulo y, al final, `lib/mock/`, `components/admin/mock-controls.tsx` y
   `adminScopeService` (que pasa a `GET /stands/:id` y `GET /events/:id`; las páginas ya hacen `await`).

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
- Fechas: `date` es `YYYY-MM-DD` y `startTime`/`endTime` son `HH:mm` (sin zona horaria). El resto son ISO 8601.

## Modo demostración

- Los datos se guardan en `sessionStorage` (sobreviven a recargas de la pestaña, no a una sesión nueva).
- En el menú lateral: **Simular error del servidor** (fuerza el estado de error de todas las pantallas)
  y **Restablecer datos**.
- Cada llamada simulada tarda 250–550 ms para que se vean los estados de carga.

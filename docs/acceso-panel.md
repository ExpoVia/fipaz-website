# Acceso a los paneles

El panel de expositor y el de organizador comparten la pantalla `/acceso`. La cuenta es la misma
en los dos; los roles de `GET /auth/me` deciden a qué panel entra cada persona:

| Rol (backend) | Panel | Notas |
| --- | --- | --- |
| `company_admin` | Expositor | Puede editar los datos de la empresa. |
| `company_staff` | Expositor | Ve el perfil de empresa en solo lectura (el backend responde 403 al editarla). |
| `event_admin`, `super_admin` | Organizador | |
| sin roles | ninguno | Ve "Sin acceso al panel" y se le ofrece registrar su empresa. |

## Formas de entrar

- **Google**: `POST /auth/google`. El Client ID Web (`NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`) debe tener el
  origen del sitio (por ejemplo `http://localhost:3001`) en "Orígenes de JavaScript autorizados".
- **Correo y contraseña**: `POST /auth/login` y, al registrar una empresa, `POST /auth/register`.
  Se muestra solo con `NEXT_PUBLIC_PASSWORD_LOGIN_ENABLED=true`, y el backend tiene que tener
  `AUTH_PASSWORD_ENABLED=true`. Todavía no hay verificación de correo ni recuperación de contraseña,
  así que en producción debe seguir desactivado.

Cerrar sesión (menú de cuenta o drawer móvil) llama a `POST /auth/logout` o `/auth/logout-all`,
borra la sesión de `sessionStorage` y vacía el estado del panel guardado en `localStorage`. Lo mismo
pasa si el servidor rechaza el refresh (sesión vencida o revocada).

## Desarrollo local

1. Base de datos: `fexpo_database/local-dev` (`docker compose up -d`, puerto 54329).
2. Backend en el puerto 3000, desde `fexpo-backend/`:
   `node --env-file=../fexpo_database/local-dev/backend.env dist/main.js`
3. Sitio en el puerto 3001: `pnpm exec next dev -p 3001`, con `BACKEND_URL=http://localhost:3000`
   en `.env.local`.

Cuentas de prueba de la base local (contraseña `Prueba1234!`, puesta con
`fexpo-backend/scripts/set-password.mjs`): `expositor@fexpo.test` (company_admin),
`organizador@fexpo.test` (event_admin) y `sinrol@fexpo.test` (sin roles).

## Pruebas

```bash
pnpm test                                   # unitarias (node:test): API de auth, store, permisos
pnpm test:e2e                               # navegador (Playwright + Edge) con el backend simulado
E2E_REAL_BACKEND=1 pnpm test:e2e real-backend   # contra el backend y la BD locales
```

Las pruebas de navegador usan el `next dev` del puerto 3001 si ya está corriendo; si no, lo levantan.
Simulan el backend con `e2e/support/fake-backend.ts`, que sigue el contrato de `fexpo-backend`.
El backend limita el login a 5 intentos por minuto y por IP: si se repite `real-backend` seguido,
puede responder 429.

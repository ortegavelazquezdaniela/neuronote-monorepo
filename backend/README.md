# backend — API REST (Node.js + Express 5)

```bash
npm install
cp .env.example .env      # completa JWT_SECRET (y las claves de Supabase/MongoDB si las tienes)
npm run dev               # http://localhost:4000/api/health
npm test                  # Vitest + Supertest (repositorios en memoria)
```

## Documentación interactiva

| Qué | Dónde |
|---|---|
| **Swagger UI** (leer y probar) | <http://localhost:4000/api/docs> · producción: `https://<tu-api>.onrender.com/api/docs` |
| **OpenAPI 3.1** (JSON) | `/api/openapi.json` — se importa directo en Postman, Insomnia o Bruno |
| **Colección de Postman** | [`docs/neuronote-api.postman_collection.json`](docs/neuronote-api.postman_collection.json) |

La especificación vive en `src/docs/openapi.js`. Los cuerpos y parámetros de entrada se generan desde los **mismos esquemas zod** que valida el servidor, y una prueba compara la lista de rutas de Express con la documentada: si se agrega una ruta sin documentar, la CI falla.

Para regenerar la colección después de cambiar la especificación (la CI comprueba que esté al día):

```bash
npm run postman
```

En Postman: **Import** → el archivo → en la colección, variable `baseUrl` (local o tu URL de Render) y `token` (pégalo después de "Iniciar sesión"). El archivo nunca guarda un token real.

## Monitoreo de errores (Sentry, opcional)

Si `SENTRY_DSN` está definido, los errores **inesperados** (500) se envían a Sentry. Los 4xx y los 502/503 previstos (motor PHP dormido, API externa caída) no se reportan. Antes de enviar se quitan IP, cabeceras (token), cookies, cuerpo, query (coordenadas), usuario, nombre del servidor y breadcrumbs: Sentry solo ve el tipo de error, el stack trace y la ruta patrón (`DELETE /api/me/notes/:id`). Sin `SENTRY_DSN`, no se carga nada de Sentry.

1. Crea una cuenta en <https://sentry.io/signup/> y elige el plan **Developer** (gratis, 1 persona). No agregues tarjeta; si te la pide, no la pongas y usa solo los logs de Render.
2. **Create Project** → plataforma **Node.js** → alertas por defecto.
3. Copia el **DSN** (`https://…@o….ingest.sentry.io/…`). No es una contraseña, pero tampoco lo publiques: pégalo solo en Render → `neuronote-api` → **Environment** → `SENTRY_DSN`.
4. En Sentry → **Settings → Security & Privacy**, activa **Prevent Storing of IP Addresses** y **Data Scrubber** (segunda capa de protección).

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | — | Estado y tipo de almacenamiento |
| POST | `/api/auth/register` | — | Crear cuenta (bcrypt 12 rondas) → `{ token, user }` |
| POST | `/api/auth/login` | — | Iniciar sesión (10 intentos fallidos / 15 min) |
| GET / DELETE | `/api/auth/me` | Bearer | Ver / borrar la cuenta y sus notas |
| GET / PUT | `/api/me/profile` | Bearer | Perfil sensorial (PostgreSQL) |
| GET / POST / DELETE | `/api/me/favorites[/:osmId]` | Bearer | Oasis favoritos |
| GET / POST / PUT / DELETE | `/api/me/notes[/:id]` | Bearer | Sensory Notes (MongoDB): CRUD completo, con `?page&limit&q&from&to` |
| POST | `/api/telemetry/crisis` | — | Telemetría anónima del SOS (20/h por IP) |
| GET | `/api/telemetry/crisis/summary` | Bearer + rol `admin` | Activaciones por hora |
| GET | `/api/psychologists` | — | Solo profesionales con cédula verificada y aprobados |
| GET | `/api/proxy/weather?lat&lon` | — | Open-Meteo con caché de 15 min |
| GET | `/api/proxy/countries` | — | REST Countries con la clave del servidor, caché 24 h |
| GET | `/api/havens/:osmId/certification` | — | Consulta el sello en el motor PHP |
| GET | `/api/openapi.json` | — | Especificación OpenAPI 3.1 |
| GET | `/api/docs` | — | Swagger UI |

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/routes/` | `auth.js`, `me.js`, `public.js` |
| `src/controllers/` | Lógica de cada recurso |
| `src/middleware/` | `verifyToken.js` (JWT + roles), `rateLimiter.js`, `validate.js`, `errorHandler.js` |
| `src/models/` | `SensoryNote.js`, `CrisisEvent.js` (Mongoose) |
| `src/services/` | Repositorios Supabase / MongoDB / memoria, caché |
| `src/validation/` | Esquemas zod |
| `src/docs/` | Especificación OpenAPI (generada en parte desde zod) |
| `src/monitoring.js` | Sentry opcional con limpieza de datos personales |
| `scripts/` | `build-postman.js` (colección de Postman) |
| `docs/` | Colección de Postman generada |
| `db/supabase/` | Migraciones SQL aplicadas al proyecto `neuronote` |
| `tests/` | Supertest |

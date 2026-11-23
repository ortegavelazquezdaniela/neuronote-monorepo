# backend — API REST (Node.js + Express 5)

```bash
npm install
cp .env.example .env      # completa JWT_SECRET (y las claves de Supabase/MongoDB si las tienes)
npm run dev               # http://localhost:4000/api/health
npm test                  # Vitest + Supertest (repositorios en memoria)
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | — | Estado y tipo de almacenamiento |
| POST | `/api/auth/register` | — | Crear cuenta (bcrypt 12 rondas) → `{ token, user }` |
| POST | `/api/auth/login` | — | Iniciar sesión (10 intentos fallidos / 15 min) |
| GET / DELETE | `/api/auth/me` | Bearer | Ver / borrar la cuenta y sus notas |
| GET / PUT | `/api/me/profile` | Bearer | Perfil sensorial (PostgreSQL) |
| GET / POST / DELETE | `/api/me/favorites[/:osmId]` | Bearer | Oasis favoritos |
| GET / POST / DELETE | `/api/me/notes[/:id]` | Bearer | Sensory Notes (MongoDB) con `?page&limit&q&from&to` |
| POST | `/api/telemetry/crisis` | — | Telemetría anónima del SOS (20/h por IP) |
| GET | `/api/telemetry/crisis/summary` | Bearer + rol `admin` | Activaciones por hora |
| GET | `/api/psychologists` | — | Solo profesionales con cédula verificada y aprobados |
| GET | `/api/proxy/weather?lat&lon` | — | Open-Meteo con caché de 15 min |
| GET | `/api/proxy/countries` | — | REST Countries con la clave del servidor, caché 24 h |
| GET | `/api/havens/:osmId/certification` | — | Consulta el sello en el motor PHP |

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/routes/` | `auth.js`, `me.js`, `public.js` |
| `src/controllers/` | Lógica de cada recurso |
| `src/middleware/` | `verifyToken.js` (JWT + roles), `rateLimiter.js`, `validate.js`, `errorHandler.js` |
| `src/models/` | `SensoryNote.js`, `CrisisEvent.js` (Mongoose) |
| `src/services/` | Repositorios Supabase / MongoDB / memoria, caché |
| `src/validation/` | Esquemas zod |
| `db/supabase/` | Migraciones SQL aplicadas al proyecto `neuronote` |
| `tests/` | Supertest |

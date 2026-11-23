# backend — API REST (Node.js + Express)

Se implementa en la **Fase 4**. Estructura reservada según la propuesta técnica:

| Carpeta | Contenido previsto |
|---|---|
| `src/routes/` | `auth.js`, `havens.js`, `psychologists.js`, `sensory.js` |
| `src/controllers/` | Lógica de cada recurso |
| `src/middleware/` | `verifyToken.js` (JWT), `rateLimiter.js`, `errorHandler.js` |
| `src/models/` | `SensoryNote.js` (Mongoose) |
| `src/services/` | Proxy con caché hacia Open-Meteo, clientes de Supabase y MongoDB |
| `tests/` | Pruebas de integración con Supertest |

Variables de entorno: ver `.env.example`.

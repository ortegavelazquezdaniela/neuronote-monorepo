import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config as defaultConfig } from './config.js';
import { createLimiters } from './middleware/rateLimiter.js';
import { errorHandler, notFound, HttpError } from './middleware/errorHandler.js';
import { createCache } from './services/cache.js';
import { authRoutes } from './routes/auth.js';
import { meRoutes } from './routes/me.js';
import { publicRoutes } from './routes/public.js';

/**
 * Crea la aplicación Express. Los repositorios se inyectan, así las pruebas
 * (Supertest) usan repositorios en memoria y el servidor real usa Supabase/MongoDB.
 */
export function createApp({ repos, config = defaultConfig, fetchImpl, limits = {} }) {
  const app = express();
  const limiters = createLimiters(limits);
  const cache = createCache();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // detrás de Render/Vercel: IP real para el rate limiting
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Sin origen (curl, servidor a servidor) o un origen permitido
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(new HttpError(403, 'Origen no permitido'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '10kb' }));
  app.use('/api', limiters.general);

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, service: 'neuronote-api', storage: repos.kind ?? { users: 'supabase', notes: 'mongodb' } }),
  );
  app.use('/api/auth', authRoutes({ repos, limiters }));
  app.use('/api/me', meRoutes({ repos }));
  app.use('/api', publicRoutes({ repos, limiters, cache, config, fetchImpl }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

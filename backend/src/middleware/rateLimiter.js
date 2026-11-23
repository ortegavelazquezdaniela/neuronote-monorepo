import { rateLimit } from 'express-rate-limit';

/**
 * Límites de peticiones por IP (en memoria del proceso). Se crean por app
 * para que cada prueba tenga sus propios contadores.
 * - general: 300 peticiones / 15 min
 * - auth: 10 intentos fallidos / 15 min (frena ataques de fuerza bruta)
 * - telemetry: 20 / hora
 */
export function createLimiters({ authLimit = 10 } = {}) {
  const base = { standardHeaders: 'draft-8', legacyHeaders: false };
  const message = (error) => ({ error });
  return {
    general: rateLimit({
      ...base,
      windowMs: 15 * 60_000,
      limit: 300,
      message: message('Demasiadas peticiones. Espera unos minutos.'),
    }),
    auth: rateLimit({
      ...base,
      windowMs: 15 * 60_000,
      limit: authLimit,
      skipSuccessfulRequests: true,
      message: message('Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.'),
    }),
    telemetry: rateLimit({
      ...base,
      windowMs: 60 * 60_000,
      limit: 20,
      message: message('Límite de registros alcanzado.'),
    }),
  };
}

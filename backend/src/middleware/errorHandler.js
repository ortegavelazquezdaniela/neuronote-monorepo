import { ZodError } from 'zod';

/** Error con código HTTP y mensaje seguro para mostrar. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.path}`));
}

/**
 * Manejo seguro de errores: nunca devuelve stack traces ni mensajes internos
 * de la base de datos. Los detalles técnicos solo se registran en el servidor.
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos no válidos',
      fields: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'La petición es demasiado grande' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON mal formado' });

  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);
  res.status(status).json({
    error: status >= 500 ? 'Error interno. Inténtalo de nuevo más tarde.' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}

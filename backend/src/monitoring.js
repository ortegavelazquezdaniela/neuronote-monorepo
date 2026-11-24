/**
 * Monitoreo de errores con Sentry (plan Developer gratuito), opcional:
 * solo se activa si SENTRY_DSN está definido.
 *
 * Privacidad (requisito de NEURONOTE): Sentry recibe únicamente el tipo de error,
 * el stack trace, el método y la RUTA PATRÓN (p. ej. /api/me/notes/:id).
 * Nunca recibe IP, cabeceras (token), cookies, cuerpo, query (coordenadas),
 * usuario ni breadcrumbs. Solo se reportan errores 5xx: los 4xx son uso normal.
 */
let sentry = null;

export async function initMonitoring({ dsn, environment, release } = {}) {
  if (!dsn) return false;
  sentry = await import('@sentry/node');
  sentry.init({
    dsn,
    environment,
    release,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeSend: scrubEvent,
  });
  return true;
}

/** Quita cualquier dato que pueda identificar a una persona o su ubicación. */
export function scrubEvent(event) {
  delete event.user;
  delete event.breadcrumbs;
  delete event.server_name;
  if (event.request) {
    const { method, url } = event.request;
    event.request = { method, url: url ? String(url).split('?')[0] : undefined };
  }
  if (event.contexts) {
    delete event.contexts.device;
    delete event.contexts.culture;
  }
  return event;
}

/** Ruta con parámetros genéricos (/api/me/notes/:id), nunca la URL real. */
function routePattern(req) {
  return req.route?.path ? `${req.baseUrl}${req.route.path}` : 'ruta-no-encontrada';
}

export function reportError(err, req) {
  if (!sentry) return;
  sentry.withScope((scope) => {
    scope.setTag('route', `${req.method} ${routePattern(req)}`);
    scope.setContext('request', { method: req.method, route: routePattern(req) });
    sentry.captureException(err);
  });
}

/** Solo para pruebas. */
export function _setSentryForTests(fake) {
  sentry = fake;
}

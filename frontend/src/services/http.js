import { readJSON, writeJSON } from './storage';

/**
 * Cliente HTTP común para las APIs externas gratuitas.
 * - Tiempo límite con AbortController.
 * - Reintentos con espera creciente ante fallos de red o errores 5xx/429.
 * - Caché en sessionStorage (TTL) para no repetir peticiones: respetamos las
 *   políticas de uso de servicios gratuitos (OpenStreetMap, Overpass, etc.).
 */

export class ApiError extends Error {
  constructor(message, { status = 0, kind = 'network' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind; // network | timeout | http | config
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const memory = new Map();

/** Vacía la caché en memoria (usado por las pruebas). */
export const clearMemoryCache = () => memory.clear();

function readCache(key) {
  const hit = memory.get(key) ?? readJSON(`nn-cache:${key}`, null, 'session');
  if (hit && hit.expires > Date.now()) return hit.value;
  return undefined;
}

function writeCache(key, value, ttl) {
  const entry = { value, expires: Date.now() + ttl };
  memory.set(key, entry);
  writeJSON(`nn-cache:${key}`, entry, 'session');
}

/**
 * @param {string} url
 * @param {object} opts
 * @param {RequestInit} [opts.init]
 * @param {number} [opts.timeout=12000]
 * @param {number} [opts.retries=2]
 * @param {string} [opts.cacheKey]
 * @param {number} [opts.ttl=600000] 10 min
 * @param {AbortSignal} [opts.signal]
 * @param {boolean} [opts.cacheOnly=false] solo devuelve lo que haya en caché (si no, lanza ApiError 'cache')
 */
export async function fetchJSON(
  url,
  { init = {}, timeout = 12_000, retries = 2, cacheKey, ttl = 600_000, signal, cacheOnly = false } = {},
) {
  if (cacheKey) {
    const cached = readCache(cacheKey);
    if (cached !== undefined) return cached;
  }
  if (cacheOnly) throw new ApiError('cache-miss', { kind: 'cache' });

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), timeout);
    const onAbort = () => controller.abort('cancelled');
    signal?.addEventListener('abort', onAbort);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) {
        const retryable = res.status >= 500 || res.status === 429;
        lastError = new ApiError(`HTTP ${res.status}`, { status: res.status, kind: 'http' });
        if (!retryable) throw lastError;
      } else {
        const data = await res.json();
        if (cacheKey) writeCache(cacheKey, data, ttl);
        return data;
      }
    } catch (err) {
      if (signal?.aborted) throw err; // el componente se desmontó: no reintentar
      if (err instanceof ApiError && err.kind === 'http' && !(err.status >= 500 || err.status === 429)) throw err;
      lastError =
        err instanceof ApiError
          ? err
          : new ApiError(err?.message ?? 'network', {
              kind: controller.signal.reason === 'timeout' ? 'timeout' : 'network',
            });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }

    if (attempt < retries) await sleep(600 * 2 ** attempt);
  }
  throw lastError;
}

/** Mensaje claro para mostrar a la persona según el tipo de error. */
export function describeError(err) {
  if (!navigator.onLine) return 'Parece que no tienes conexión a internet.';
  if (err?.kind === 'timeout') return 'El servicio tardó demasiado en responder.';
  if (err?.kind === 'config') return err.message;
  if (err?.kind === 'http' && err.status < 500 && err.status !== 429 && err.message && !/^HTTP \d/.test(err.message))
    return err.message;
  if (err?.status === 429) return 'El servicio recibió demasiadas consultas. Intenta en unos minutos.';
  // Sin respuesta, o 502/503 del proxy: lo más común es que el servidor gratuito esté despertando
  if (err?.kind === 'network' || err?.status === 502 || err?.status === 503)
    return 'No pudimos conectar con el servidor. Si nadie lo usó en un rato, tarda hasta un minuto en despertar: inténtalo de nuevo en unos segundos.';
  return 'El servicio no está disponible en este momento.';
}

import { fetchJSON } from './http';
import { HAVEN_TYPES, typeFromCategory, makeHaven } from '../utils/havenTypes';

/**
 * Nominatim (https://nominatim.openstreetmap.org) — el buscador oficial de
 * OpenStreetMap. Gratuito, sin key y con CORS. Fuente PRINCIPAL de los oasis.
 *
 * Política de uso (https://operations.osmfoundation.org/policies/nominatim/):
 * - Como máximo 1 petición por segundo → cola con 1.1 s entre peticiones.
 * - Resultados en caché → 6 h por zona.
 * - Nada de autocompletado ni consultas masivas: solo cuando se abre una vista.
 * - El navegador envía la cabecera Referer que identifica la aplicación.
 */

const BASE = 'https://nominatim.openstreetmap.org';
const MIN_GAP_MS = 1100;
let queue = Promise.resolve();
let lastRequest = 0;

/** Serializa las peticiones respetando el límite de 1 por segundo. */
function throttled(task) {
  const run = queue.then(async () => {
    const wait = lastRequest + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequest = Date.now();
    return task();
  });
  queue = run.catch(() => {});
  return run;
}

/** Busca en caché primero: solo pasa por la cola si realmente hay que pedirlo. */
const get = (url, cacheKey, signal) =>
  fetchJSON(url, { cacheKey, ttl: 6 * 60 * 60_000, retries: 1, timeout: 10_000, signal, cacheOnly: true }).catch(() =>
    throttled(() => fetchJSON(url, { cacheKey, ttl: 6 * 60 * 60_000, retries: 1, timeout: 10_000, signal })),
  );

export function viewbox({ lat, lon }, radius) {
  const dLat = radius / 111_320;
  const dLon = radius / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [lon - dLon, lat + dLat, lon + dLon, lat - dLat].map((n) => n.toFixed(4)).join(',');
}

const fromResult = (r) =>
  makeHaven({
    osmType: r.osm_type,
    osmId: r.osm_id,
    name: r.name,
    type: typeFromCategory(r.category, r.type),
    lat: r.lat,
    lon: r.lon,
    tags: r.extratags ?? {},
    address: r.address ? [r.address.road, r.address.house_number].filter(Boolean).join(' ') : null,
  });

// Consulta por tipo: "special phrases" de Nominatim ([park], [museum]…)
const QUERY = {
  park: 'q=%5Bpark%5D',
  garden: 'q=%5Bgarden%5D',
  library: 'amenity=library',
  museum: 'q=%5Bmuseum%5D',
};

export async function nominatimHavens(point, { radius, signal }) {
  const vb = viewbox(point, radius);
  const results = [];
  for (const type of Object.keys(HAVEN_TYPES)) {
    const url = `${BASE}/search?${QUERY[type]}&format=jsonv2&viewbox=${vb}&bounded=1&limit=25&extratags=1&addressdetails=1&accept-language=es`;
    const data = await get(url, `nom:${type}:${vb}`, signal);
    results.push(...data.map(fromResult));
  }
  const seen = new Set();
  return results.filter((h) => h.type && h.name && !seen.has(h.id) && seen.add(h.id));
}

const LOOKUP_PREFIX = { node: 'N', way: 'W', relation: 'R' };

export async function nominatimHaven(osmType, osmId, { signal }) {
  const url = `${BASE}/lookup?osm_ids=${LOOKUP_PREFIX[osmType]}${osmId}&format=jsonv2&extratags=1&addressdetails=1&accept-language=es`;
  const data = await get(url, `nom:${osmType}-${osmId}`, signal);
  return data[0] ? fromResult(data[0]) : null;
}

/** Búsqueda libre acotada a una zona (p. ej. «salud mental»), con la misma cola y caché. */
export function nominatimSearch(text, point, radius, { signal } = {}) {
  const vb = viewbox(point, radius);
  const q = encodeURIComponent(text);
  const url = `${BASE}/search?q=${q}&format=jsonv2&viewbox=${vb}&bounded=1&limit=20&extratags=1&addressdetails=1&accept-language=es`;
  return get(url, `nom:q:${text}:${vb}`, signal);
}

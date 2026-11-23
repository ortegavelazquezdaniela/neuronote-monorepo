import { fetchJSON, ApiError } from './http';
import { HAVEN_TYPES, typeFromTags, makeHaven } from '../utils/havenTypes';

/**
 * Overpass API (datos de OpenStreetMap, ODbL) — gratuita, sin key.
 * Fuente de RESPALDO de los oasis: sus servidores públicos se saturan con
 * frecuencia, así que se consulta solo si Nominatim falla (ver services/havens.js).
 */

const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

async function query(ql, { cacheKey, signal }) {
  let lastError;
  for (const server of SERVERS) {
    try {
      return await fetchJSON(server, {
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: ql }),
        },
        timeout: 12_000,
        retries: 0,
        cacheKey,
        ttl: 6 * 60 * 60_000,
        signal,
      });
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }
  throw lastError ?? new ApiError('overpass', { kind: 'network' });
}

const fromElement = (el) =>
  makeHaven({
    osmType: el.type,
    osmId: el.id,
    name: el.tags?.name,
    type: typeFromTags(el.tags),
    lat: el.lat ?? el.center?.lat,
    lon: el.lon ?? el.center?.lon,
    tags: el.tags,
  });

export async function overpassHavens({ lat, lon }, { radius, signal }) {
  const around = `(around:${radius},${lat.toFixed(3)},${lon.toFixed(3)})`;
  const selectors = Object.values(HAVEN_TYPES)
    .map((t) => `nwr["${t.key}"="${t.value}"]["name"]${around};`)
    .join('\n  ');
  const ql = `[out:json][timeout:20];\n(\n  ${selectors}\n);\nout center tags 80;`;
  const data = await query(ql, { cacheKey: `ovp:${lat.toFixed(3)},${lon.toFixed(3)},${radius}`, signal });
  return data.elements.map(fromElement).filter((h) => h.type && Number.isFinite(h.lat));
}

export async function overpassHaven(osmType, osmId, { signal }) {
  const data = await query(`[out:json][timeout:20];${osmType}(${osmId});out center tags;`, {
    cacheKey: `ovp:${osmType}-${osmId}`,
    signal,
  });
  const el = data.elements[0];
  return el ? fromElement(el) : null;
}

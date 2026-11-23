import { ApiError } from './http';
import { readJSON, writeJSON } from './storage';
import { nominatimHavens, nominatimHaven } from './nominatim';
import { overpassHavens, overpassHaven } from './overpass';
import { distanceMeters } from '../utils/geo';

/**
 * Oasis candidatos con varias fuentes de datos abiertos, en orden:
 *   1. Nominatim (buscador oficial de OSM: rápido y estable)
 *   2. Overpass (consulta más completa, pero sus servidores públicos se saturan)
 *   3. Respaldo: la última respuesta buena guardada en este navegador (≤ 7 días)
 * Todos son lugares REALES de OpenStreetMap y se muestran "Sin verificar".
 * Devuelve { items, fetchedAt, stale, source }.
 */

const BACKUP_TTL = 7 * 24 * 60 * 60_000; // datos públicos de lugares, no personales

async function withFallback(key, sources, signal) {
  let lastError;
  for (const [source, load] of sources) {
    try {
      const items = await load();
      if (items == null) continue; // la fuente no conoce el lugar: probar la siguiente
      const fetchedAt = new Date().toISOString();
      writeJSON(`nn-osm:${key}`, { items, fetchedAt, source });
      return { items, fetchedAt, stale: false, source };
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }
  const backup = readJSON(`nn-osm:${key}`);
  if (backup?.items && Date.now() - new Date(backup.fetchedAt).getTime() < BACKUP_TTL) {
    return { ...backup, stale: true };
  }
  throw lastError ?? new ApiError('No encontrado', { kind: 'http', status: 404 });
}

/** Lugares candidatos a menos de `radius` metros del punto, ordenados por cercanía. */
export async function getHavenCandidates(point, { radius = 1500, signal } = {}) {
  const key = `havens:${point.lat.toFixed(3)},${point.lon.toFixed(3)},${radius}`;
  const res = await withFallback(
    key,
    [
      ['nominatim', () => nominatimHavens(point, { radius, signal })],
      ['overpass', () => overpassHavens(point, { radius, signal })],
    ],
    signal,
  );
  const items = res.items
    .map((h) => ({ ...h, distance: distanceMeters(point, h) }))
    .filter((h) => h.distance <= radius * 1.05)
    .sort((a, b) => a.distance - b.distance);
  return { ...res, items };
}

/** Un lugar por su id ("node-123", "way-456" o "relation-789"). */
export async function getHavenById(id, { signal } = {}) {
  const match = /^(node|way|relation)-(\d+)$/.exec(id);
  if (!match) throw new ApiError('Identificador no válido', { kind: 'http', status: 404 });
  const [, osmType, osmId] = match;
  const res = await withFallback(
    `haven:${id}`,
    [
      ['nominatim', () => nominatimHaven(osmType, osmId, { signal })],
      ['overpass', () => overpassHaven(osmType, osmId, { signal })],
    ],
    signal,
  );
  if (!res.items) throw new ApiError('No encontrado', { kind: 'http', status: 404 });
  return res.items;
}

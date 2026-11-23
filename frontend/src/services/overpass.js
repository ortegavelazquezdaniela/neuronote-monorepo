import { fetchJSON, ApiError } from './http';
import { readJSON, writeJSON } from './storage';

/**
 * Overpass API (datos de OpenStreetMap, ODbL) — gratuita, sin key.
 * Se usa para encontrar LUGARES PÚBLICOS REALES (parques, jardines, bibliotecas,
 * museos) que podrían funcionar como oasis sensoriales. Ninguno está verificado
 * por NEURONOTE: la interfaz los presenta como "candidatos sin verificar".
 * Política de uso: consultas pequeñas, en caché y con servidores alternativos.
 */

const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

export const HAVEN_TYPES = {
  park: { label: 'Parque', match: (t) => t.leisure === 'park' },
  garden: { label: 'Jardín', match: (t) => t.leisure === 'garden' },
  library: { label: 'Biblioteca', match: (t) => t.amenity === 'library' },
  museum: { label: 'Museo', match: (t) => t.tourism === 'museum' },
};

function typeOf(tags) {
  return Object.entries(HAVEN_TYPES).find(([, t]) => t.match(tags))?.[0] ?? null;
}

function toHaven(el) {
  const tags = el.tags ?? {};
  return {
    id: `${el.type}-${el.id}`,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    name: tags.name,
    type: typeOf(tags),
    lat: el.lat ?? el.center?.lat,
    lon: el.lon ?? el.center?.lon,
    wheelchair: tags.wheelchair ?? null, // yes | limited | no
    openingHours: tags.opening_hours ?? null,
    website: tags.website ?? tags['contact:website'] ?? null,
    address: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null,
    verified: false,
  };
}

const BACKUP_TTL = 7 * 24 * 60 * 60_000; // respaldo de 7 días (datos públicos, no personales)

/**
 * Consulta con servidor alternativo y respaldo: Overpass es gratuito y a veces
 * se satura. Si ningún servidor responde, devolvemos la última respuesta buena
 * guardada (indicando su fecha) en lugar de dejar la pantalla vacía.
 * Devuelve { data, fetchedAt, stale }.
 */
async function query(ql, { cacheKey, signal }) {
  let lastError;
  for (const server of SERVERS) {
    try {
      const data = await fetchJSON(server, {
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: ql }),
        },
        timeout: 15_000,
        retries: 0,
        cacheKey,
        ttl: 6 * 60 * 60_000, // los lugares cambian poco: 6 h
        signal,
      });
      const fetchedAt = new Date().toISOString();
      writeJSON(`nn-osm:${cacheKey}`, { data, fetchedAt });
      return { data, fetchedAt, stale: false };
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }
  const backup = readJSON(`nn-osm:${cacheKey}`);
  if (backup && Date.now() - new Date(backup.fetchedAt).getTime() < BACKUP_TTL) {
    return { ...backup, stale: true };
  }
  throw lastError ?? new ApiError('overpass', { kind: 'network' });
}

/** Lugares candidatos dentro de un radio (m) alrededor de un punto. */
export async function getHavenCandidates({ lat, lon }, { radius = 1500, limit = 60, signal } = {}) {
  const la = lat.toFixed(3);
  const lo = lon.toFixed(3);
  const around = `(around:${radius},${la},${lo})`;
  const ql = `[out:json][timeout:20];
(
  nwr["leisure"~"^(park|garden)$"]["name"]${around};
  nwr["amenity"="library"]["name"]${around};
  nwr["tourism"="museum"]["name"]${around};
);
out center tags ${limit};`;
  const res = await query(ql, { cacheKey: `havens:${la},${lo},${radius}`, signal });
  return {
    items: res.data.elements.map(toHaven).filter((h) => h.lat != null && h.type),
    fetchedAt: res.fetchedAt,
    stale: res.stale,
  };
}

/** Un lugar por su id ("node-123", "way-456" o "relation-789"). */
export async function getHavenById(id, { signal } = {}) {
  const match = /^(node|way|relation)-(\d+)$/.exec(id);
  if (!match) throw new ApiError('Identificador no válido', { kind: 'http', status: 404 });
  const [, type, osmId] = match;
  const res = await query(`[out:json][timeout:20];${type}(${osmId});out center tags;`, {
    cacheKey: `haven:${id}`,
    signal,
  });
  const el = res.data.elements[0];
  if (!el) throw new ApiError('No encontrado', { kind: 'http', status: 404 });
  return toHaven(el);
}

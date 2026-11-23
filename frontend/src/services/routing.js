import { fetchJSON } from './http';

/**
 * Rutas peatonales con el servidor OSRM público de FOSSGIS
 * (routing.openstreetmap.de, el mismo que usa openstreetmap.org).
 * Gratuito y sin key, con uso razonable: solo calculamos cuando la persona lo pide.
 * Devuelve hasta 3 alternativas con distancia y duración REALES del cálculo.
 */

const BASE = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

export async function getWalkingRoutes(from, to, { signal } = {}) {
  const coords = `${from.lon.toFixed(5)},${from.lat.toFixed(5)};${to.lon.toFixed(5)},${to.lat.toFixed(5)}`;
  const params = new URLSearchParams({ alternatives: '2', overview: 'full', geometries: 'geojson' });
  const data = await fetchJSON(`${BASE}/${coords}?${params}`, {
    cacheKey: `route:${coords}`,
    ttl: 30 * 60_000,
    timeout: 15_000,
    signal,
  });
  if (data.code !== 'Ok' || !data.routes?.length) return [];
  return data.routes.map((r, i) => ({
    id: `r${i}`,
    distance: r.distance, // metros
    duration: r.duration, // segundos
    // GeoJSON usa [lon, lat]; Leaflet usa [lat, lon]
    path: r.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
  }));
}

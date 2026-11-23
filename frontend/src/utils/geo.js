/** Utilidades geoespaciales puras (probadas en Fase 5). */

/** Centro por defecto: Zócalo de la Ciudad de México. Se usa si no hay permiso de ubicación. */
export const DEFAULT_CENTER = { lat: 19.4326, lon: -99.1332, label: 'Centro Histórico, CDMX' };

const R = 6_371_000; // radio terrestre en metros
const toRad = (d) => (d * Math.PI) / 180;

/** Distancia en metros entre dos puntos (fórmula de Haversine). */
export function distanceMeters(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(m) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatDuration(seconds) {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

/**
 * Qué tan cerca pasa una ruta de lugares tranquilos: cuántos candidatos
 * quedan a menos de `radius` metros de algún punto de la ruta.
 * Es una ESTIMACIÓN basada en datos de OpenStreetMap, no una medición de ruido.
 */
export function nearbyCalmPlaces(path, places, radius = 120) {
  const step = Math.max(1, Math.floor(path.length / 120)); // muestreo para no recorrer miles de puntos
  const sampled = path.filter((_, i) => i % step === 0).map(([lat, lon]) => ({ lat, lon }));
  return places.filter((p) => sampled.some((pt) => distanceMeters(pt, p) <= radius)).length;
}

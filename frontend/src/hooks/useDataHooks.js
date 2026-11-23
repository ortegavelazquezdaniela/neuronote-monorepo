import { useAsync } from './useAsync';
import { getWeather } from '../services/openMeteo';
import { getHavenCandidates, getHavenById } from '../services/overpass';
import { getWalkingRoutes } from '../services/routing';
import { getCountries } from '../services/restCountries';

/** Clima y microclima de Open-Meteo para un punto. */
export function useWeather(point) {
  const key = point ? `${point.lat.toFixed(2)},${point.lon.toFixed(2)}` : null;
  return useAsync((signal) => getWeather(point, { signal }), [key], { enabled: !!point });
}

/** Lugares candidatos a oasis (OpenStreetMap) alrededor de un punto. */
/** data: lista de lugares · meta: { fetchedAt, stale } (stale = respaldo guardado). */
export function useHavens(point, radius = 1500, enabled = true) {
  const key = point ? `${point.lat.toFixed(3)},${point.lon.toFixed(3)}` : null;
  const q = useAsync((signal) => getHavenCandidates(point, { radius, signal }), [key, radius], {
    enabled: enabled && !!point,
  });
  return { ...q, data: q.data?.items ?? null, meta: q.data };
}

export function useHaven(id) {
  return useAsync((signal) => getHavenById(id, { signal }), [id], { enabled: !!id });
}

/** Rutas peatonales alternativas entre dos puntos (nombre de la propuesta técnica). */
export function useSensoryRoute(from, to) {
  const key = from && to ? `${from.lat},${from.lon};${to.lat},${to.lon}` : null;
  return useAsync((signal) => getWalkingRoutes(from, to, { signal }), [key], { enabled: !!(from && to) });
}

export function useCountries(enabled = true) {
  return useAsync((signal) => getCountries({ signal }), [], { enabled });
}

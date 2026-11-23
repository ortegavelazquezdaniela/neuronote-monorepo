import { fetchJSON } from './http';

/**
 * Open-Meteo (https://open-meteo.com) — gratuito para uso no comercial, sin API key,
 * con CORS. Los valores son PRONÓSTICOS de modelos meteorológicos, no mediciones
 * de una estación cercana: así se etiquetan en la interfaz.
 */

const BASE = 'https://api.open-meteo.com/v1/forecast';

export async function getWeather({ lat, lon }, { signal } = {}) {
  // Redondear a 2 decimales (~1 km): mejora la caché y no envía la ubicación exacta.
  const la = lat.toFixed(2);
  const lo = lon.toFixed(2);
  const params = new URLSearchParams({
    latitude: la,
    longitude: lo,
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,weather_code,uv_index,is_day,wind_speed_10m',
    hourly: 'temperature_2m,surface_pressure,uv_index',
    past_hours: '6',
    forecast_hours: '18',
    timezone: 'auto',
  });
  const data = await fetchJSON(`${BASE}?${params}`, { cacheKey: `meteo:${la},${lo}`, ttl: 15 * 60_000, signal });

  const hours = data.hourly.time.map((time, i) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    pressure: data.hourly.surface_pressure[i],
    uv: data.hourly.uv_index[i],
  }));

  return {
    timezone: data.timezone,
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparent: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      uv: data.current.uv_index,
      wind: data.current.wind_speed_10m,
      isDay: data.current.is_day === 1,
      code: data.current.weather_code,
    },
    hours,
  };
}

/** Códigos WMO → descripción en español. */
export const WEATHER_CODES = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  66: 'Lluvia helada',
  67: 'Lluvia helada intensa',
  71: 'Nieve ligera',
  73: 'Nieve',
  75: 'Nieve intensa',
  80: 'Chubascos ligeros',
  81: 'Chubascos',
  82: 'Chubascos fuertes',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta fuerte con granizo',
};

/** Índice UV → categoría de la OMS. */
export function uvCategory(uv) {
  if (uv == null) return null;
  if (uv < 3) return 'Bajo';
  if (uv < 6) return 'Moderado';
  if (uv < 8) return 'Alto';
  if (uv < 11) return 'Muy alto';
  return 'Extremo';
}

/**
 * Cambio de presión en las últimas 3 horas (hPa). Algunas personas relacionan
 * cambios rápidos de presión con molestias; es información, no un diagnóstico.
 */
export function pressureTrend(hours, nowIso) {
  const now = new Date(nowIso).getTime();
  const past = hours.filter((h) => new Date(h.time).getTime() <= now);
  if (past.length < 4) return null;
  const last = past[past.length - 1].pressure;
  const before = past[past.length - 4].pressure;
  return Math.round((last - before) * 10) / 10;
}

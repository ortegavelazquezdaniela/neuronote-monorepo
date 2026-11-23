import { fetchJSON, ApiError } from './http';
import { API_URL } from './api';

/**
 * REST Countries v5 (https://restcountries.com).
 * Requiere una clave gratuita (plan Free: 1,000 consultas/mes).
 * Desde la Fase 4 la consulta pasa por el backend (/api/proxy/countries), que
 * guarda la clave y cachea 24 h. La llamada directa con VITE_RESTCOUNTRIES_KEY
 * queda solo como respaldo para desarrollo sin backend.
 */

const BASE = 'https://api.restcountries.com/countries/v5';
const FIELDS = 'names.common,names.translations.spa,codes.alpha_2,calling_codes,flag.emoji,languages,currencies';

export const restCountriesKey = import.meta.env.VITE_RESTCOUNTRIES_KEY?.trim() || '';

// La API entrega los nombres de moneda en inglés; el navegador los traduce por código ISO 4217.
const currencyNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['es'], { type: 'currency' }) : null;
const currencyName = (c) => {
  try {
    return currencyNames?.of(c.code) ?? c.name;
  } catch {
    return c.name;
  }
};

function toCountry(o) {
  const currencies = Array.isArray(o.currencies) ? o.currencies : o.currencies ? [o.currencies] : [];
  return {
    code: o.codes?.alpha_2,
    name: o.names?.translations?.spa?.common ?? o.names?.common,
    flag: o.flag?.emoji ?? '',
    callingCodes: o.calling_codes ?? [],
    languages: (o.languages ?? []).map((l) => l.native_name ?? l.name),
    currencies: currencies.map((c) => `${currencyName(c)} (${c.code})`),
  };
}

const sortCountries = (list) =>
  list.filter((c) => c.code && c.callingCodes.length).sort((a, b) => a.name.localeCompare(b.name, 'es'));

export async function getCountries({ signal } = {}) {
  // Preferido (Fase 4): el backend guarda la clave y cachea 24 h → la clave no llega al navegador
  if (API_URL) {
    try {
      const data = await fetchJSON(`${API_URL}/proxy/countries`, { cacheKey: 'countries:proxy', ttl: 24 * 60 * 60_000, retries: 1, signal });
      return sortCountries(data.data.objects.map(toCountry));
    } catch (err) {
      if (signal?.aborted || !restCountriesKey) throw err; // sin clave local no hay respaldo
    }
  }
  if (!restCountriesKey) {
    if (import.meta.env.DEV) console.info('REST Countries: falta VITE_RESTCOUNTRIES_KEY en frontend/.env.local');
    throw new ApiError('La lista de países todavía no está configurada.', { kind: 'config' });
  }
  const all = [];
  // Paginación: el plan gratuito permite hasta 100 resultados por página (~250 países → 3 páginas).
  for (let offset = 0; offset < 400; offset += 100) {
    const params = new URLSearchParams({ response_fields: FIELDS, limit: '100', offset: String(offset) });
    const data = await fetchJSON(`${BASE}?${params}`, {
      init: { headers: { Authorization: `Bearer ${restCountriesKey}` } },
      cacheKey: `countries:${offset}`,
      ttl: 24 * 60 * 60_000,
      retries: 1,
      signal,
    });
    all.push(...data.data.objects.map(toCountry));
    if (!data.data.meta?.more) break;
  }
  return sortCountries(all);
}

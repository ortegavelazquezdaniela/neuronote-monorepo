import { fetchJSON, ApiError } from './http';

/**
 * REST Countries v5 (https://restcountries.com).
 * Desde 2026 la API requiere una clave gratuita (plan Free: 1,000 consultas/mes,
 * sin tarjeta según su documentación). En el navegador solo funciona si el
 * hostname (p. ej. localhost) está en los "allowed origins" de la clave.
 * En la Fase 4 esta llamada pasará por el backend para que la clave no viaje
 * al navegador. Cacheamos 24 h: los datos de países casi no cambian.
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

export async function getCountries({ signal } = {}) {
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
  return all.filter((c) => c.code && c.callingCodes.length).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

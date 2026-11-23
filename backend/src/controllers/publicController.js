import { HttpError } from '../middleware/errorHandler.js';

/**
 * Endpoints públicos: telemetría anónima, psicólogos verificados y proxy con
 * caché hacia APIs externas (Open-Meteo, REST Countries, motor PHP).
 */
export function createPublicController({ telemetry, psychologists, cache, config, fetchImpl = fetch }) {
  async function getJSON(url, init) {
    const res = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new HttpError(502, 'El servicio externo no respondió correctamente');
    return res.json();
  }

  return {
    async recordCrisis(req, res) {
      await telemetry.record(req.body);
      res.status(202).json({ ok: true });
    },

    async crisisSummary(_req, res) {
      res.json({ byHour: await telemetry.summaryByHour() });
    },

    async listPsychologists(_req, res) {
      res.json({ items: await psychologists.listApproved() });
    },

    async weather(req, res) {
      const lat = req.validQuery.lat.toFixed(2);
      const lon = req.validQuery.lon.toFixed(2);
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,weather_code,uv_index,is_day,wind_speed_10m',
        hourly: 'temperature_2m,surface_pressure,uv_index',
        past_hours: '6',
        forecast_hours: '18',
        timezone: 'auto',
      });
      const { value, cached } = await cache.getOrSet(`meteo:${lat},${lon}`, 15 * 60_000, () =>
        getJSON(`https://api.open-meteo.com/v1/forecast?${params}`),
      );
      res.set('X-Cache', cached ? 'HIT' : 'MISS').json(value);
    },

    /** La clave de REST Countries vive aquí, no en el navegador. */
    async countries(_req, res) {
      if (!config.restCountriesKey) throw new HttpError(503, 'La lista de países no está configurada');
      const fields = 'names.common,names.translations.spa,codes.alpha_2,calling_codes,flag.emoji,languages,currencies';
      const { value, cached } = await cache.getOrSet('countries:all', 24 * 60 * 60_000, async () => {
        const all = [];
        for (let offset = 0; offset < 400; offset += 100) {
          const params = new URLSearchParams({ response_fields: fields, limit: '100', offset: String(offset) });
          const data = await getJSON(`https://api.restcountries.com/countries/v5?${params}`, {
            headers: { Authorization: `Bearer ${config.restCountriesKey}` },
          });
          all.push(...data.data.objects);
          if (!data.data.meta?.more) break;
        }
        return { data: { objects: all, meta: { more: false, total: all.length } } };
      });
      res.set('X-Cache', cached ? 'HIT' : 'MISS').json(value);
    },

    /** Consulta al motor PHP si un lugar tiene auditoría/sello vigente. */
    async certification(req, res) {
      if (!config.auditEngineUrl) throw new HttpError(503, 'El motor de auditoría no está configurado');
      const osmId = req.params.osmId;
      if (!/^(node|way|relation)-\d{1,15}$/.test(osmId)) throw new HttpError(400, 'Identificador no válido');
      const { value } = await cache.getOrSet(`cert:${osmId}`, 10 * 60_000, () =>
        getJSON(`${config.auditEngineUrl}/src/verify.php?osm_id=${encodeURIComponent(osmId)}`),
      );
      res.json(value);
    },
  };
}

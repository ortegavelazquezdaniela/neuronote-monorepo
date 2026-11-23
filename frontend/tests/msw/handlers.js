import { http, HttpResponse } from 'msw';

/**
 * Respuestas simuladas de las APIs (Mock Service Worker). Son datos de PRUEBA
 * con la forma real de cada servicio; nunca se muestran en la app.
 */
export const API = 'http://api.test/api';

const hours = Array.from({ length: 24 }, (_, i) => `2026-11-22T${String(i).padStart(2, '0')}:00`);

export const meteoResponse = {
  timezone: 'America/Mexico_City',
  current: {
    time: '2026-11-22T14:00',
    temperature_2m: 21.4,
    apparent_temperature: 20.1,
    relative_humidity_2m: 48,
    surface_pressure: 780.2,
    weather_code: 2,
    uv_index: 5.6,
    is_day: 1,
    wind_speed_10m: 7.2,
  },
  hourly: {
    time: hours,
    temperature_2m: hours.map((_, i) => 12 + i * 0.5),
    surface_pressure: hours.map((_, i) => 782 - i * 0.2),
    uv_index: hours.map((_, i) => (i > 7 && i < 17 ? 4 : 0)),
  },
};

export const nominatimResults = {
  park: [
    { osm_type: 'way', osm_id: 1001, name: 'Parque de Prueba', category: 'leisure', type: 'park', lat: '19.4330', lon: '-99.1330', extratags: { wheelchair: 'yes' } },
  ],
  library: [
    { osm_type: 'node', osm_id: 2002, name: 'Biblioteca de Prueba', category: 'amenity', type: 'library', lat: '19.4340', lon: '-99.1340', extratags: { opening_hours: 'Mo-Fr 09:00-18:00' }, address: { road: 'Calle Uno', house_number: '5' } },
  ],
};

export const handlers = [
  http.get('https://api.open-meteo.com/v1/forecast', () => HttpResponse.json(meteoResponse)),

  http.get('https://nominatim.openstreetmap.org/search', ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('amenity') === 'library') return HttpResponse.json(nominatimResults.library);
    if ((url.searchParams.get('q') ?? '').includes('park')) return HttpResponse.json(nominatimResults.park);
    return HttpResponse.json([]);
  }),
  http.get('https://nominatim.openstreetmap.org/lookup', ({ request }) => {
    const ids = new URL(request.url).searchParams.get('osm_ids');
    return HttpResponse.json(ids === 'N2002' ? nominatimResults.library : []);
  }),
  http.post('https://overpass-api.de/api/interpreter', () => HttpResponse.json({ elements: [] })),
  http.post('https://overpass.kumi.systems/api/interpreter', () => HttpResponse.json({ elements: [] })),

  http.get('https://routing.openstreetmap.de/routed-foot/route/v1/foot/:coords', () =>
    HttpResponse.json({
      code: 'Ok',
      routes: [
        { distance: 1400, duration: 1080, geometry: { coordinates: [[-99.133, 19.433], [-99.138, 19.434], [-99.144, 19.436]] } },
        { distance: 1700, duration: 1260, geometry: { coordinates: [[-99.133, 19.433], [-99.14, 19.43], [-99.144, 19.436]] } },
      ],
    }),
  ),

  http.get(`${API}/proxy/countries`, () =>
    HttpResponse.json({
      data: {
        objects: [
          { names: { common: 'Mexico', translations: { spa: { common: 'México' } } }, codes: { alpha_2: 'MX' }, calling_codes: ['52'], flag: { emoji: '🇲🇽' }, languages: [{ name: 'Spanish', native_name: 'español' }], currencies: { code: 'MXN', name: 'Mexican peso' } },
          { names: { common: 'Argentina' }, codes: { alpha_2: 'AR' }, calling_codes: ['54'], flag: { emoji: '🇦🇷' }, languages: [], currencies: [] },
        ],
        meta: { more: false },
      },
    }),
  ),
  http.get(`${API}/psychologists`, () => HttpResponse.json({ items: [] })),
  http.get(`${API}/havens/:id/certification`, () => HttpResponse.json({ certified: false })),
  http.post(`${API}/telemetry/crisis`, () => HttpResponse.json({ ok: true }, { status: 202 })),
];

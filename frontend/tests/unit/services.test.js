import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../setup';
import { API, meteoResponse } from '../msw/handlers';
import { fetchJSON, describeError, ApiError } from '../../src/services/http';
import { getWeather, uvCategory, pressureTrend, WEATHER_CODES } from '../../src/services/openMeteo';
import { getHavenCandidates, getHavenById } from '../../src/services/havens';
import { getWalkingRoutes } from '../../src/services/routing';
import { getCountries } from '../../src/services/restCountries';
import { api, session, setUnauthorizedHandler } from '../../src/services/api';
import { notesApiStore } from '../../src/services/notesApiStore';
import { reportCrisisOpen } from '../../src/services/telemetry';
import { readJSON, writeJSON, removeKey, isStorageAvailable } from '../../src/services/storage';
import { loadPrefs, persistPrefs, sanitizePrefs, DEFAULT_PREFS, PREFS_KEY } from '../../src/services/preferencesStore';
import { notesStore } from '../../src/services/notesStore';
import { trustedContactStore } from '../../src/services/trustedContactStore';

describe('fetchJSON', () => {
  it('reintenta ante errores 5xx y luego responde', async () => {
    let calls = 0;
    server.use(
      http.get('https://flaky.test/data', () => {
        calls += 1;
        return calls < 2 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({ ok: true });
      }),
    );
    await expect(fetchJSON('https://flaky.test/data', { retries: 2 })).resolves.toEqual({ ok: true });
    expect(calls).toBe(2);
  });

  it('no reintenta errores 4xx y usa la caché', async () => {
    let calls = 0;
    server.use(
      http.get('https://x.test/404', () => {
        calls += 1;
        return new HttpResponse(null, { status: 404 });
      }),
      http.get('https://x.test/ok', () => {
        calls += 1;
        return HttpResponse.json({ n: calls });
      }),
    );
    await expect(fetchJSON('https://x.test/404', { retries: 3 })).rejects.toMatchObject({ status: 404 });
    expect(calls).toBe(1);
    const a = await fetchJSON('https://x.test/ok', { cacheKey: 'k1' });
    const b = await fetchJSON('https://x.test/ok', { cacheKey: 'k1' });
    expect(a).toEqual(b);
    await expect(fetchJSON('https://x.test/nada', { cacheKey: 'sin-cache', cacheOnly: true })).rejects.toMatchObject({ kind: 'cache' });
  });

  it('corta por tiempo límite', async () => {
    server.use(http.get('https://slow.test/x', async () => {
      await delay(500);
      return HttpResponse.json({});
    }));
    await expect(fetchJSON('https://slow.test/x', { timeout: 50, retries: 0 })).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('describe los errores en lenguaje claro', () => {
    expect(describeError(new ApiError('t', { kind: 'timeout' }))).toMatch(/tardó/);
    expect(describeError(new ApiError('Falta X', { kind: 'config' }))).toBe('Falta X');
    expect(describeError(new ApiError('x', { status: 429, kind: 'http' }))).toMatch(/demasiadas/);
    expect(describeError(new ApiError('Correo o contraseña incorrectos', { status: 401, kind: 'http' }))).toBe('Correo o contraseña incorrectos');
    expect(describeError(new ApiError('HTTP 500', { status: 500, kind: 'http' }))).toMatch(/no está disponible/);
  });
});

describe('Open-Meteo', () => {
  it('transforma la respuesta y redondea la ubicación', async () => {
    let url;
    server.use(http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json(meteoResponse);
    }));
    const w = await getWeather({ lat: 19.43261, lon: -99.13321 });
    expect(url.searchParams.get('latitude')).toBe('19.43');
    expect(w.current).toMatchObject({ temperature: 21.4, pressure: 780.2, uv: 5.6, code: 2, isDay: true });
    expect(w.hours).toHaveLength(24);
    expect(WEATHER_CODES[w.current.code]).toBe('Parcialmente nublado');
  });

  it('clasifica el UV y la tendencia de presión', () => {
    expect([uvCategory(1), uvCategory(4), uvCategory(7), uvCategory(9), uvCategory(12), uvCategory(null)]).toEqual([
      'Bajo', 'Moderado', 'Alto', 'Muy alto', 'Extremo', null,
    ]);
    const hours = [0, 1, 2, 3].map((i) => ({ time: `2026-11-22T1${i}:00`, pressure: 780 - i }));
    expect(pressureTrend(hours, '2026-11-22T13:00')).toBe(-3);
    expect(pressureTrend(hours.slice(0, 2), '2026-11-22T13:00')).toBeNull();
  });
});

describe('Oasis: Nominatim → Overpass → respaldo', () => {
  const point = { lat: 19.433, lon: -99.133 };

  it('usa Nominatim, filtra por radio y ordena por distancia', async () => {
    const res = await getHavenCandidates(point, { radius: 1500 });
    expect(res.source).toBe('nominatim');
    expect(res.items.map((h) => h.name)).toEqual(['Parque de Prueba', 'Biblioteca de Prueba']);
    expect(res.items[0].wheelchair).toBe('yes');
  });

  it('cae a Overpass si Nominatim falla', async () => {
    server.use(
      http.get('https://nominatim.openstreetmap.org/search', () => new HttpResponse(null, { status: 503 })),
      http.post('https://overpass-api.de/api/interpreter', () =>
        HttpResponse.json({ elements: [{ type: 'way', id: 7, center: { lat: 19.4331, lon: -99.1331 }, tags: { name: 'Jardín OSM', leisure: 'garden' } }] }),
      ),
    );
    const res = await getHavenCandidates({ lat: 19.5, lon: -99.2 }, { radius: 100000 });
    expect(res.source).toBe('overpass');
    expect(res.items[0]).toMatchObject({ id: 'way-7', type: 'garden' });
  });

  it('usa la última respuesta guardada si todo falla, marcándola como antigua', async () => {
    const key = 'havens:19.600,-99.300,1500';
    localStorage.setItem(`nn-osm:${key}`, JSON.stringify({ items: [{ id: 'node-1', name: 'Guardado', lat: 19.6, lon: -99.3, type: 'park' }], fetchedAt: new Date().toISOString(), source: 'nominatim' }));
    server.use(
      http.get('https://nominatim.openstreetmap.org/search', () => HttpResponse.error()),
      http.post('https://overpass-api.de/api/interpreter', () => HttpResponse.error()),
      http.post('https://overpass.kumi.systems/api/interpreter', () => HttpResponse.error()),
    );
    const res = await getHavenCandidates({ lat: 19.6, lon: -99.3 }, { radius: 1500 });
    expect(res.stale).toBe(true);
    expect(res.items[0].name).toBe('Guardado');
  });

  it('busca un lugar por id y rechaza ids mal formados', async () => {
    const h = await getHavenById('node-2002');
    expect(h).toMatchObject({ name: 'Biblioteca de Prueba', openingHours: 'Mo-Fr 09:00-18:00', address: 'Calle Uno 5' });
    await expect(getHavenById('hola')).rejects.toMatchObject({ status: 404 });
  });
});

describe('Rutas y países', () => {
  it('convierte la geometría GeoJSON a [lat, lon]', async () => {
    const routes = await getWalkingRoutes({ lat: 19.433, lon: -99.133 }, { lat: 19.436, lon: -99.144 });
    expect(routes).toHaveLength(2);
    expect(routes[0].path[0]).toEqual([19.433, -99.133]);
  });

  it('obtiene los países a través del backend, en español y ordenados', async () => {
    const list = await getCountries();
    expect(list.map((c) => c.name)).toEqual(['Argentina', 'México']);
    const mx = list.find((c) => c.code === 'MX');
    expect(mx.currencies[0]).toMatch(/peso mexicano \(MXN\)/);
  });
});

describe('Cliente de la API y sesión', () => {
  it('envía el token y cierra la sesión si la API responde 401', async () => {
    session.set({ token: 'tok', user: { id: '1' } });
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    let auth;
    server.use(http.get(`${API}/me/profile`, ({ request }) => {
      auth = request.headers.get('authorization');
      return HttpResponse.json({ error: 'Tu sesión expiró' }, { status: 401 });
    }));
    await expect(api('/me/profile')).rejects.toMatchObject({ status: 401, message: 'Tu sesión expiró' });
    expect(auth).toBe('Bearer tok');
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it('expone los errores por campo y maneja respuestas 204', async () => {
    server.use(
      http.post(`${API}/auth/register`, () => HttpResponse.json({ error: 'Datos no válidos', fields: [{ field: 'email', message: 'x' }] }, { status: 400 })),
      http.delete(`${API}/me/notes/abc`, () => new HttpResponse(null, { status: 204 })),
    );
    const err = await api('/auth/register', { method: 'POST', body: {}, auth: false }).catch((e) => e);
    expect(err.fields[0].field).toBe('email');
    await expect(api('/me/notes/abc', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('notesApiStore pagina hasta traer todas las notas', async () => {
    server.use(http.get(`${API}/me/notes`, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page'));
      return HttpResponse.json({ items: [{ id: `n${page}` }], pages: 2 });
    }), http.post(`${API}/me/notes`, () => HttpResponse.json({ item: { id: 'nuevo' } }, { status: 201 })), http.delete(`${API}/me/notes`, () => HttpResponse.json({ deleted: 2 })));
    expect((await notesApiStore.list()).map((n) => n.id)).toEqual(['n1', 'n2']);
    expect((await notesApiStore.add({})).id).toBe('nuevo');
    await expect(notesApiStore.clear()).resolves.toBeUndefined();
  });

  it('la telemetría es anónima y respeta "No rastrear"', async () => {
    let body;
    server.use(http.post(`${API}/telemetry/crisis`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ ok: true }, { status: 202 });
    }));
    reportCrisisOpen('fab');
    await vi.waitFor(() => expect(body).toBeDefined());
    expect(Object.keys(body).sort()).toEqual(['hour', 'source', 'weekday']);

    body = undefined;
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    reportCrisisOpen('fab');
    await new Promise((r) => setTimeout(r, 50));
    expect(body).toBeUndefined();
    Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true });
  });
});

describe('Almacenamiento local con consentimiento', () => {
  it('lee y escribe JSON de forma segura', () => {
    expect(isStorageAvailable()).toBe(true);
    expect(writeJSON('k', { a: 1 })).toBe(true);
    expect(readJSON('k')).toEqual({ a: 1 });
    localStorage.setItem('roto', '{no-json');
    expect(readJSON('roto', 'def')).toBe('def');
    removeKey('k');
    expect(readJSON('k')).toBeNull();
  });

  it('solo guarda preferencias con permiso y descarta valores alterados', () => {
    persistPrefs({ ...DEFAULT_PREFS, theme: 'night', remember: false });
    expect(localStorage.getItem(PREFS_KEY)).toBeNull();
    persistPrefs({ ...DEFAULT_PREFS, theme: 'night', remember: true });
    expect(loadPrefs().theme).toBe('night');
    expect(sanitizePrefs({ theme: 'hackeado', textScale: 9, intro: 'sí' })).toEqual(DEFAULT_PREFS);
  });

  it('notas locales: agregar, ordenar, borrar', async () => {
    await notesStore.add({ place: 'A', when: '2026-11-01T00:00:00.000Z' });
    const b = await notesStore.add({ place: 'B', when: '2026-11-05T00:00:00.000Z' });
    expect((await notesStore.list()).map((n) => n.place)).toEqual(['B', 'A']);
    await notesStore.remove(b.id);
    expect(await notesStore.list()).toHaveLength(1);
    await notesStore.clear();
    expect(await notesStore.list()).toEqual([]);
  });

  it('contacto de confianza: valida lo que lee', () => {
    trustedContactStore.save({ country: 'MX', callingCode: '+52', phone: '55-1234-5678', name: 'Mamá' });
    expect(trustedContactStore.load()).toEqual({ country: 'MX', callingCode: '52', phone: '5512345678', name: 'Mamá' });
    localStorage.setItem('nn-trusted-contact', JSON.stringify({ phone: '' }));
    expect(trustedContactStore.load()).toBeNull();
    trustedContactStore.clear();
  });
});

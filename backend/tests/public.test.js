import { describe, it, expect, vi } from 'vitest';
import { makeApp, registerAndLogin } from './helpers.js';
import { SensoryNote } from '../src/models/SensoryNote.js';
import { CrisisEvent } from '../src/models/CrisisEvent.js';

const jsonResponse = (data, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => data });

describe('Salud, seguridad y errores', () => {
  it('responde /api/health con el tipo de almacenamiento', async () => {
    const { api } = makeApp();
    const res = await api.get('/api/health');
    expect(res.body).toMatchObject({ ok: true, storage: { users: 'memory', notes: 'memory' } });
  });

  it('aplica cabeceras de seguridad (helmet) y oculta X-Powered-By', async () => {
    const { api } = makeApp();
    const res = await api.get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('bloquea orígenes CORS no permitidos', async () => {
    const { api } = makeApp();
    const res = await api.get('/api/health').set('Origin', 'https://sitio-malicioso.example');
    expect(res.status).toBe(403);
    const ok = await api.get('/api/health').set('Origin', 'http://localhost:5173');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('devuelve 404 en JSON y rechaza cuerpos enormes o JSON roto', async () => {
    const { api } = makeApp();
    expect((await api.get('/api/no-existe')).status).toBe(404);
    const big = await api.post('/api/auth/login').set('Content-Type', 'application/json').send(`{"email":"${'a'.repeat(20000)}"}`);
    expect(big.status).toBe(413);
    const broken = await api.post('/api/auth/login').set('Content-Type', 'application/json').send('{roto');
    expect(broken.status).toBe(400);
  });
});

describe('Telemetría anónima del SOS (MongoDB)', () => {
  it('registra solo campos anónimos y descarta cualquier dato personal extra', async () => {
    const { api, repos } = makeApp();
    const res = await api
      .post('/api/telemetry/crisis')
      .send({ hour: 14, weekday: 2, temperature: 24.5, weatherCode: 3, source: 'fab', email: 'x@y.z', lat: 19.4 });
    expect(res.status).toBe(202);
    const summary = await repos.telemetry.summaryByHour();
    expect(summary[14].count).toBe(1);
  });

  it('el resumen solo es visible para el rol admin', async () => {
    const { api, repos } = makeApp();
    const { token } = await registerAndLogin(api);
    const res = await api.get('/api/telemetry/crisis/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(repos).toBeTruthy();
  });

  it('valida la telemetría', async () => {
    const { api } = makeApp();
    expect((await api.post('/api/telemetry/crisis').send({ hour: 30, weekday: 1, source: 'fab' })).status).toBe(400);
  });
});

describe('Psicólogos verificados', () => {
  it('lista solo profesionales aprobados', async () => {
    const { api, repos } = makeApp();
    repos._seedPsychologist({ id: '1', displayName: 'Prueba Aprobada', status: 'approved' });
    repos._seedPsychologist({ id: '2', displayName: 'Prueba Pendiente', status: 'pending' });
    const res = await api.get('/api/psychologists');
    expect(res.body.items.map((p) => p.id)).toEqual(['1']);
  });
});

describe('Proxy con caché hacia APIs externas', () => {
  it('cachea el clima de Open-Meteo y redondea la ubicación a ~1 km', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ current: { temperature_2m: 20 } }));
    const { api } = makeApp({ fetchImpl });
    const a = await api.get('/api/proxy/weather?lat=19.43261&lon=-99.13321');
    const b = await api.get('/api/proxy/weather?lat=19.43299&lon=-99.13349');
    expect(a.headers['x-cache']).toBe('MISS');
    expect(b.headers['x-cache']).toBe('HIT');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toContain('latitude=19.43&longitude=-99.13');
  });

  it('valida coordenadas y traduce fallos externos a 502', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, false));
    const { api } = makeApp({ fetchImpl });
    expect((await api.get('/api/proxy/weather?lat=200&lon=0')).status).toBe(400);
    expect((await api.get('/api/proxy/weather?lat=19&lon=-99')).status).toBe(502);
  });

  it('REST Countries: 503 sin clave; con clave la envía solo desde el servidor', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ data: { objects: [{ codes: { alpha_2: 'MX' } }], meta: { more: false } } }));
    const noKey = makeApp({ fetchImpl, configOverrides: { restCountriesKey: '' } });
    expect((await noKey.api.get('/api/proxy/countries')).status).toBe(503);

    const withKey = makeApp({ fetchImpl, configOverrides: { restCountriesKey: 'clave-de-prueba' } });
    const res = await withKey.api.get('/api/proxy/countries');
    expect(res.status).toBe(200);
    expect(res.body.data.objects).toHaveLength(1);
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer clave-de-prueba');
    expect(JSON.stringify(res.body)).not.toContain('clave-de-prueba');
  });

  it('certificación: valida el id y consulta el motor PHP', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ certified: false }));
    const { api } = makeApp({ fetchImpl, configOverrides: { auditEngineUrl: 'http://localhost:8080' } });
    expect((await api.get('/api/havens/abc/certification')).status).toBe(400);
    const res = await api.get('/api/havens/way-123/certification');
    expect(res.body).toEqual({ certified: false });
    expect(fetchImpl.mock.calls[0][0]).toBe('http://localhost:8080/src/verify.php?osm_id=way-123');
  });
});

describe('Modelos Mongoose', () => {
  it('SensoryNote valida rangos y longitudes', async () => {
    const doc = new SensoryNote({ userId: 'u', place: 'x', when: new Date(), noise: 7, comfort: 3 });
    const err = await doc.validate().catch((e) => e);
    expect(Object.keys(err.errors)).toEqual(expect.arrayContaining(['place', 'noise']));
  });

  it('CrisisEvent no tiene campos de identidad ni ubicación', () => {
    const paths = Object.keys(CrisisEvent.schema.paths);
    expect(paths).not.toEqual(expect.arrayContaining(['userId']));
    ['userId', 'email', 'ip', 'lat', 'lon'].forEach((p) => expect(paths).not.toContain(p));
  });
});

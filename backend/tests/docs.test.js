import { describe, it, expect, beforeEach } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { makeApp } from './helpers.js';
import { buildOpenApi } from '../src/docs/openapi.js';
import { scrubEvent, reportError, _setSentryForTests } from '../src/monitoring.js';

/** Recorre el router de Express 5 y devuelve "METHOD /api/ruta" de cada endpoint real. */
function listRoutes(app) {
  const out = [];
  (function walk(stack, prefix) {
    for (const layer of stack) {
      if (layer.route) {
        for (const m of Object.keys(layer.route.methods)) out.push(`${m.toUpperCase()} ${prefix}${layer.route.path}`);
      } else if (layer.handle?.stack) {
        // Router montado: rawPath es su prefijo (/api, /api/auth, /api/me…)
        walk(layer.handle.stack, prefix + (layer.rawPath && layer.rawPath !== '/' ? layer.rawPath : ''));
      }
    }
  })(app.router.stack, '');
  // Swagger UI (archivos estáticos) no es un endpoint de la API.
  return out.filter((r) => !r.includes('/api/docs')).map((r) => r.replace(/:(\w+)/g, '{$1}'));
}

describe('Documentación OpenAPI', () => {
  it('es una especificación OpenAPI 3.1 válida', async () => {
    const spec = structuredClone(buildOpenApi());
    await expect(SwaggerParser.validate(spec)).resolves.toBeTruthy();
  });

  it('documenta exactamente las rutas que existen en Express', () => {
    const { app } = makeApp();
    const real = listRoutes(app).sort();
    const spec = buildOpenApi();
    const documented = Object.entries(spec.paths)
      .flatMap(([path, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} /api${path}`))
      .concat(['GET /api/openapi.json'])
      .sort();
    expect(documented).toEqual(real);
  });

  it('marca como protegidas las rutas que exigen token', async () => {
    const { api } = makeApp();
    const spec = buildOpenApi();
    for (const [path, ops] of Object.entries(spec.paths)) {
      for (const [method, op] of Object.entries(ops)) {
        if (!op.security) continue;
        const url = '/api' + path.replace('{osmId}', 'way-1').replace('{id}', 'x');
        const res = await api[method](url);
        expect(res.status, `${method.toUpperCase()} ${path}`).toBe(401);
      }
    }
  });

  it('sirve el JSON y Swagger UI', async () => {
    const { api } = makeApp();
    const json = await api.get('/api/openapi.json');
    expect(json.status).toBe(200);
    expect(json.body.openapi).toBe('3.1.0');
    const ui = await api.get('/api/docs/');
    expect(ui.status).toBe(200);
    expect(ui.text).toContain('NEURONOTE API');
  });

  it('genera los cuerpos desde zod: las reglas de la contraseña y del texto están documentadas', () => {
    const body = buildOpenApi().paths['/auth/register'].post.requestBody.content['application/json'].schema;
    expect(body.properties.password).toMatchObject({ type: 'string', minLength: 10, maxLength: 128 });
    expect(body.properties.displayName).toMatchObject({ type: 'string', minLength: 2, maxLength: 40 });
    expect(body.required).toEqual(expect.arrayContaining(['email', 'password', 'displayName']));
  });
});

describe('Monitoreo de errores (Sentry)', () => {
  let captured;
  beforeEach(() => {
    captured = [];
    _setSentryForTests({
      withScope: (fn) =>
        fn({ setTag: (k, v) => captured.push(['tag', k, v]), setContext: (k, v) => captured.push(['ctx', k, v]) }),
      captureException: (e) => captured.push(['error', e.message]),
    });
  });

  it('quita IP, token, cuerpo, coordenadas, usuario y breadcrumbs antes de enviar', () => {
    const event = scrubEvent({
      user: { ip_address: '201.1.2.3', id: 'u1' },
      breadcrumbs: [{ message: 'GET /api/proxy/weather?lat=19.43&lon=-99.13' }],
      server_name: 'srv-render-123',
      request: {
        method: 'GET',
        url: 'https://api.example/api/proxy/weather?lat=19.43&lon=-99.13',
        headers: { authorization: 'Bearer secreto' },
        cookies: { a: 'b' },
        data: { password: 'x' },
        query_string: 'lat=19.43&lon=-99.13',
      },
      exception: { values: [{ type: 'Error' }] },
    });
    expect(event).toEqual({
      request: { method: 'GET', url: 'https://api.example/api/proxy/weather' },
      exception: { values: [{ type: 'Error' }] },
    });
  });

  it('reporta los errores inesperados con la ruta patrón, nunca la URL real', () => {
    reportError(new Error('fallo'), { method: 'DELETE', baseUrl: '/api/me', route: { path: '/notes/:id' }, originalUrl: '/api/me/notes/abc' });
    expect(captured).toContainEqual(['tag', 'route', 'DELETE /api/me/notes/:id']);
    expect(captured).toContainEqual(['error', 'fallo']);
    expect(JSON.stringify(captured)).not.toContain('abc');
  });

  it('no reporta los 4xx ni los 502/503 previstos de servicios externos', async () => {
    const failingFetch = async () => ({ ok: false, json: async () => ({}) });
    const { api } = makeApp({ fetchImpl: failingFetch, configOverrides: { auditEngineUrl: 'http://motor' } });
    await api.get('/api/me/profile'); // 401
    await api.post('/api/auth/login').send({}); // 400
    await api.get('/api/havens/way-1/certification'); // 502 previsto
    expect(captured.filter(([t]) => t === 'error')).toEqual([]);
  });
});

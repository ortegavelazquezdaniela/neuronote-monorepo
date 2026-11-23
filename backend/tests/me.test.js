import { describe, it, expect, beforeEach } from 'vitest';
import { makeApp, registerAndLogin } from './helpers.js';

let api;
let auth;

beforeEach(async () => {
  ({ api } = makeApp());
  const { token } = await registerAndLogin(api);
  auth = { Authorization: `Bearer ${token}` };
});

const note = (over = {}) => ({
  place: 'Biblioteca Vasconcelos',
  when: '2026-11-20T10:00:00.000Z',
  noise: 2,
  comfort: 4,
  light: 'suave',
  ...over,
});

describe('Sensory Notes (MongoDB) — CRUD, paginación y filtros', () => {
  it('crea notas limpiando el texto y las lista de la más reciente a la más antigua', async () => {
    const created = await api.post('/api/me/notes').set(auth).send(note({ place: '  Parque   México  ' }));
    expect(created.status).toBe(201);
    expect(created.body.item.place).toBe('Parque México');
    await api.post('/api/me/notes').set(auth).send(note({ when: '2026-11-21T10:00:00.000Z', place: 'Museo' }));

    const res = await api.get('/api/me/notes').set(auth);
    expect(res.body.total).toBe(2);
    expect(res.body.items[0].place).toBe('Museo');
  });

  it('pagina y filtra por texto', async () => {
    for (let i = 0; i < 5; i += 1) {
      await api.post('/api/me/notes').set(auth).send(note({ place: i % 2 ? `Parque ${i}` : `Café ${i}` }));
    }
    const page = await api.get('/api/me/notes?limit=2&page=2').set(auth);
    expect(page.body).toMatchObject({ page: 2, limit: 2, total: 5, pages: 3 });
    expect(page.body.items).toHaveLength(2);

    const filtered = await api.get('/api/me/notes?q=parque').set(auth);
    expect(filtered.body.total).toBe(2);
  });

  it('rechaza notas inválidas o con fecha futura', async () => {
    const res = await api.post('/api/me/notes').set(auth).send(note({ noise: 9, when: '2099-01-01T00:00:00.000Z' }));
    expect(res.status).toBe(400);
    expect(res.body.fields.map((f) => f.field)).toEqual(expect.arrayContaining(['noise', 'when']));
  });

  it('cada persona solo ve y borra sus propias notas', async () => {
    const created = await api.post('/api/me/notes').set(auth).send(note());
    const other = await registerAndLogin(api, { email: 'otra@neuronote.test', password: 'otraclave2026', displayName: 'Otra' });
    const otherAuth = { Authorization: `Bearer ${other.token}` };

    expect((await api.get('/api/me/notes').set(otherAuth)).body.total).toBe(0);
    expect((await api.delete(`/api/me/notes/${created.body.item.id}`).set(otherAuth)).status).toBe(404);
    expect((await api.delete(`/api/me/notes/${created.body.item.id}`).set(auth)).status).toBe(204);
  });

  it('borra todas las notas', async () => {
    await api.post('/api/me/notes').set(auth).send(note());
    await api.post('/api/me/notes').set(auth).send(note());
    const res = await api.delete('/api/me/notes').set(auth);
    expect(res.body.deleted).toBe(2);
  });
});

describe('Perfil sensorial y favoritos (PostgreSQL)', () => {
  it('guarda y lee el perfil sensorial', async () => {
    expect((await api.get('/api/me/profile').set(auth)).body.profile).toBeNull();
    const profile = { noiseSensitivity: 5, lightSensitivity: 3, crowdSensitivity: 4, heatSensitivity: 2, routePriority: 'calm' };
    const res = await api.put('/api/me/profile').set(auth).send(profile);
    expect(res.status).toBe(200);
    expect((await api.get('/api/me/profile').set(auth)).body.profile).toMatchObject(profile);
  });

  it('valida el perfil', async () => {
    const res = await api.put('/api/me/profile').set(auth).send({ noiseSensitivity: 0 });
    expect(res.status).toBe(400);
  });

  it('agrega, lista y quita oasis favoritos', async () => {
    const fav = { osmId: 'way-4758957', name: 'Alameda Central', lat: 19.4357, lon: -99.144 };
    expect((await api.post('/api/me/favorites').set(auth).send(fav)).status).toBe(201);
    expect((await api.get('/api/me/favorites').set(auth)).body.items).toHaveLength(1);
    expect((await api.delete('/api/me/favorites/way-4758957').set(auth)).status).toBe(204);
    expect((await api.delete('/api/me/favorites/way-4758957').set(auth)).status).toBe(404);
  });

  it('rechaza identificadores de OpenStreetMap mal formados', async () => {
    const res = await api.post('/api/me/favorites').set(auth).send({ osmId: 'drop table', name: 'x', lat: 0, lon: 0 });
    expect(res.status).toBe(400);
  });
});

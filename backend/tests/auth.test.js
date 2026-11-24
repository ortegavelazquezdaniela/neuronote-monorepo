import { describe, it, expect } from 'vitest';
import { makeApp, validUser, registerAndLogin } from './helpers.js';

describe('API de autenticación (JWT + bcrypt)', () => {
  it('registra una cuenta, guarda la contraseña cifrada y devuelve un token', async () => {
    const { api, repos } = makeApp();
    const res = await api.post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(res.body.user).toMatchObject({ email: validUser.email, displayName: 'Ana', role: 'user' });
    expect(res.body.user.passwordHash).toBeUndefined();

    const stored = await repos.users.findByEmail(validUser.email);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$12\$/); // bcrypt, 12 rondas
    expect(stored.passwordHash).not.toContain(validUser.password);
  });

  it('normaliza el correo y rechaza duplicados', async () => {
    const { api } = makeApp();
    await api.post('/api/auth/register').send(validUser);
    const res = await api.post('/api/auth/register').send({ ...validUser, email: '  ANA@neuronote.test ' });
    expect(res.status).toBe(409);
  });

  it('valida la contraseña y el correo', async () => {
    const { api } = makeApp();
    const res = await api.post('/api/auth/register').send({ email: 'no-es-correo', password: 'corta', displayName: 'A' });
    expect(res.status).toBe(400);
    const fields = res.body.fields.map((f) => f.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password', 'displayName']));
  });

  it('responde en español aunque falte un campo', async () => {
    const { api } = makeApp();
    const res = await api.post('/api/auth/register').send({ email: 'ana@example.com', password: 'segura12345' });
    expect(res.status).toBe(400);
    expect(res.body.fields).toEqual([{ field: 'displayName', message: 'Escribe un nombre de 2 a 40 caracteres' }]);
    const login = await api.post('/api/auth/login').send({});
    expect(login.status).toBe(400);
    for (const f of login.body.fields) expect(f.message).not.toMatch(/Invalid|expected/);
  });

  it('inicia sesión con credenciales correctas y rechaza las incorrectas sin revelar cuál falló', async () => {
    const { api } = makeApp();
    await api.post('/api/auth/register').send(validUser);

    const ok = await api.post('/api/auth/login').send({ email: validUser.email, password: validUser.password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();

    const badPass = await api.post('/api/auth/login').send({ email: validUser.email, password: 'otra-cosa-123' });
    const noUser = await api.post('/api/auth/login').send({ email: 'nadie@neuronote.test', password: 'otra-cosa-123' });
    expect(badPass.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(badPass.body.error).toBe(noUser.body.error);
  });

  it('protege /me con el token Bearer', async () => {
    const { api } = makeApp();
    const { token } = await registerAndLogin(api);
    expect((await api.get('/api/auth/me')).status).toBe(401);
    expect((await api.get('/api/auth/me').set('Authorization', 'Bearer token.falso.x')).status).toBe(401);
    const me = await api.get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(validUser.email);
  });

  it('limita los intentos fallidos de inicio de sesión (rate limiting)', async () => {
    const { api } = makeApp({ limits: { authLimit: 3 } });
    for (let i = 0; i < 3; i += 1) {
      await api.post('/api/auth/login').send({ email: 'x@neuronote.test', password: 'mala-clave-1' });
    }
    const res = await api.post('/api/auth/login').send({ email: 'x@neuronote.test', password: 'mala-clave-1' });
    expect(res.status).toBe(429);
  });

  it('borra la cuenta y sus notas (derecho de cancelación)', async () => {
    const { api, repos } = makeApp();
    const { token, user } = await registerAndLogin(api);
    await api
      .post('/api/me/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ place: 'Parque', when: new Date().toISOString(), noise: 2, comfort: 4 });
    const res = await api.delete('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
    expect(await repos.users.findById(user.id)).toBeNull();
    expect((await repos.notes.list(user.id, { page: 1, limit: 10 })).total).toBe(0);
  });
});

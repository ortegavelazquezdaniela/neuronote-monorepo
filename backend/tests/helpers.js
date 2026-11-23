import request from 'supertest';
import { createApp } from '../src/app.js';
import { createMemoryRepos } from '../src/services/memoryRepos.js';
import { config } from '../src/config.js';

export function makeApp({ fetchImpl, configOverrides = {}, limits } = {}) {
  const repos = createMemoryRepos();
  const app = createApp({ repos, config: { ...config, ...configOverrides }, fetchImpl, limits });
  return { app, repos, api: request(app) };
}

export const validUser = { email: 'ana@neuronote.test', password: 'calma2026segura', displayName: 'Ana' };

export async function registerAndLogin(api, user = validUser) {
  const res = await api.post('/api/auth/register').send(user);
  return { token: res.body.token, user: res.body.user };
}

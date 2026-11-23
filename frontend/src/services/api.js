import { ApiError } from './http';
import { readJSON, writeJSON, removeKey } from './storage';

/**
 * Cliente de la API NEURONOTE (Express). Si VITE_API_URL no está definida,
 * las funciones que dependen del backend se desactivan con un mensaje claro.
 *
 * Sesión: el token JWT se guarda en sessionStorage (se borra al cerrar la
 * pestaña) — menor exposición que localStorage. Nunca se guarda la contraseña.
 */

export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
export const apiEnabled = () => Boolean(API_URL);

const SESSION_KEY = 'nn-session';

export const session = {
  get: () => readJSON(SESSION_KEY, null, 'session'),
  set: (value) => writeJSON(SESSION_KEY, value, 'session'),
  clear: () => removeKey(SESSION_KEY, 'session'),
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

/** Petición JSON a la API con token, tiempo límite y errores en español. */
export async function api(path, { method = 'GET', body, auth = true, signal } = {}) {
  if (!API_URL) throw new ApiError('La API de NEURONOTE no está configurada.', { kind: 'config' });
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? session.get()?.token : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal ?? AbortSignal.timeout(15_000),
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError('No pudimos conectar con el servidor de NEURONOTE.', { kind: 'network' });
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const err = new ApiError(data.error ?? `Error ${res.status}`, { status: res.status, kind: 'http' });
    err.fields = data.fields ?? [];
    throw err;
  }
  return data;
}

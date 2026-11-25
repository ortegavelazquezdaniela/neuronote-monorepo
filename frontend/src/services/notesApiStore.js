import { api } from './api';

/**
 * Sensory Notes en la cuenta (API → MongoDB Atlas). Misma interfaz que
 * notesStore (local), así NotesPage funciona igual con o sin sesión.
 */
export const notesApiStore = {
  async list() {
    const all = [];
    for (let page = 1; page <= 20; page += 1) {
      const res = await api(`/me/notes?limit=50&page=${page}`);
      all.push(...res.items);
      if (page >= res.pages) break;
    }
    return all;
  },
  async add(data) {
    return (await api('/me/notes', { method: 'POST', body: data })).item;
  },
  async update(id, data) {
    return (await api(`/me/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: data })).item;
  },
  async remove(id) {
    await api(`/me/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  async clear() {
    await api('/me/notes', { method: 'DELETE' });
  },
};

import { readJSON, writeJSON, removeKey, isStorageAvailable } from './storage';

/**
 * Sensory Notes — almacenamiento local (Fase 2).
 * Las notas viven solo en este navegador. En la Fase 4 se sincronizarán, con
 * consentimiento, con la API (MongoDB Atlas). Interfaz asíncrona a propósito:
 * las páginas ya manejan estados de carga y error como si fuera una API.
 */

const KEY = 'nn-notes';

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `n-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const notesStore = {
  available: () => isStorageAvailable(),

  async list() {
    if (!isStorageAvailable()) throw new Error('storage-unavailable');
    const notes = readJSON(KEY, []);
    return Array.isArray(notes) ? notes.sort((a, b) => b.when.localeCompare(a.when)) : [];
  },

  async add(data) {
    const notes = await this.list();
    const note = { id: newId(), createdAt: new Date().toISOString(), ...data };
    if (!writeJSON(KEY, [note, ...notes])) throw new Error('storage-write-failed');
    return note;
  },

  async remove(id) {
    const notes = await this.list();
    if (!writeJSON(KEY, notes.filter((n) => n.id !== id))) throw new Error('storage-write-failed');
  },

  async clear() {
    removeKey(KEY);
  },
};

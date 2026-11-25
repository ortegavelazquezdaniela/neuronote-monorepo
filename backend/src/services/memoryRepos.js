import crypto from 'node:crypto';

/**
 * Repositorios EN MEMORIA. Se usan en las pruebas y como modo de demostración
 * cuando Supabase o MongoDB no están configurados. Los datos se pierden al
 * reiniciar el servidor (la API lo avisa en /api/health).
 */
export function createMemoryRepos() {
  const users = new Map();
  const profiles = new Map();
  const favorites = new Map();
  const notes = new Map();
  const events = [];
  const audit = [];
  const psychologists = [];

  return {
    kind: { users: 'memory', notes: 'memory' },
    users: {
      async findByEmail(email) {
        return [...users.values()].find((u) => u.email === email) ?? null;
      },
      async findById(id) {
        return users.get(id) ?? null;
      },
      async create({ email, passwordHash, displayName, role = 'user' }) {
        const user = { id: crypto.randomUUID(), email, passwordHash, displayName, role, createdAt: new Date().toISOString() };
        users.set(user.id, user);
        return user;
      },
      async remove(id) {
        users.delete(id);
        profiles.delete(id);
        favorites.delete(id);
      },
      async logAccess(userId, action) {
        audit.push({ userId, action, at: new Date().toISOString() });
      },
    },
    profiles: {
      async get(userId) {
        return profiles.get(userId) ?? null;
      },
      async upsert(userId, data) {
        const p = { ...data, updatedAt: new Date().toISOString() };
        profiles.set(userId, p);
        return p;
      },
    },
    favorites: {
      async list(userId) {
        return [...(favorites.get(userId)?.values() ?? [])];
      },
      async add(userId, fav) {
        if (!favorites.has(userId)) favorites.set(userId, new Map());
        const item = { ...fav, createdAt: new Date().toISOString() };
        favorites.get(userId).set(fav.osmId, item);
        return item;
      },
      async remove(userId, osmId) {
        return favorites.get(userId)?.delete(osmId) ?? false;
      },
    },
    psychologists: {
      async listApproved() {
        return psychologists.filter((p) => p.status === 'approved');
      },
    },
    notes: {
      async list(userId, { page, limit, q, from, to }) {
        let list = [...(notes.get(userId)?.values() ?? [])];
        if (q) list = list.filter((n) => `${n.place} ${n.text}`.toLowerCase().includes(q.toLowerCase()));
        if (from) list = list.filter((n) => n.when >= from);
        if (to) list = list.filter((n) => n.when <= to);
        list.sort((a, b) => b.when.localeCompare(a.when));
        return { items: list.slice((page - 1) * limit, page * limit), total: list.length };
      },
      async create(userId, data) {
        if (!notes.has(userId)) notes.set(userId, new Map());
        const note = { id: crypto.randomUUID(), ...data, when: new Date(data.when).toISOString(), createdAt: new Date().toISOString() };
        notes.get(userId).set(note.id, note);
        return note;
      },
      /** Reemplaza el contenido de una nota propia; null si no existe o es de otra persona. */
      async update(userId, id, data) {
        const current = notes.get(userId)?.get(id);
        if (!current) return null;
        const note = {
          ...current,
          light: null,
          crowd: null,
          ...data,
          when: new Date(data.when).toISOString(),
          updatedAt: new Date().toISOString(),
        };
        notes.get(userId).set(id, note);
        return note;
      },
      async remove(userId, id) {
        return notes.get(userId)?.delete(id) ?? false;
      },
      async removeAll(userId) {
        const n = notes.get(userId)?.size ?? 0;
        notes.delete(userId);
        return n;
      },
    },
    telemetry: {
      async record(event) {
        events.push({ ...event, at: new Date().toISOString() });
      },
      async summaryByHour() {
        const counts = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
        events.forEach((e) => (counts[e.hour].count += 1));
        return counts;
      },
    },
    // Solo para pruebas
    _seedPsychologist(p) {
      psychologists.push(p);
    },
  };
}

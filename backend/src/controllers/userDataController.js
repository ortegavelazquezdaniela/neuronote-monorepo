import { HttpError } from '../middleware/errorHandler.js';

/** Perfil sensorial y favoritos (PostgreSQL). */
export function createUserDataController({ profiles, favorites }) {
  return {
    async getProfile(req, res) {
      res.json({ profile: await profiles.get(req.user.id) });
    },
    async putProfile(req, res) {
      res.json({ profile: await profiles.upsert(req.user.id, req.body) });
    },
    async listFavorites(req, res) {
      res.json({ items: await favorites.list(req.user.id) });
    },
    async addFavorite(req, res) {
      res.status(201).json({ item: await favorites.add(req.user.id, req.body) });
    },
    async removeFavorite(req, res) {
      const ok = await favorites.remove(req.user.id, req.params.osmId);
      if (!ok) throw new HttpError(404, 'Ese lugar no estaba en tus favoritos');
      res.status(204).end();
    },
  };
}

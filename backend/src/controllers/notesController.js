import { HttpError } from '../middleware/errorHandler.js';

/** Sensory Notes (MongoDB) con paginación y filtros. */
export function createNotesController({ notes }) {
  return {
    async list(req, res) {
      const { page, limit, q, from, to } = req.validQuery;
      const { items, total } = await notes.list(req.user.id, { page, limit, q, from, to });
      res.json({ items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
    },
    async create(req, res) {
      res.status(201).json({ item: await notes.create(req.user.id, req.body) });
    },
    async update(req, res) {
      const item = await notes.update(req.user.id, req.params.id, req.body);
      if (!item) throw new HttpError(404, 'Nota no encontrada');
      res.json({ item });
    },
    async remove(req, res) {
      const ok = await notes.remove(req.user.id, req.params.id);
      if (!ok) throw new HttpError(404, 'Nota no encontrada');
      res.status(204).end();
    },
    async removeAll(req, res) {
      res.json({ deleted: await notes.removeAll(req.user.id) });
    },
  };
}

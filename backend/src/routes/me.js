import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { profileSchema, favoriteSchema, noteSchema, notesQuerySchema } from '../validation/schemas.js';
import { createUserDataController } from '../controllers/userDataController.js';
import { createNotesController } from '../controllers/notesController.js';

/** Rutas protegidas de la persona usuaria: perfil, favoritos y notas. */
export function meRoutes({ repos }) {
  const u = createUserDataController(repos);
  const n = createNotesController(repos);
  const r = Router();
  r.use(verifyToken);

  r.get('/profile', u.getProfile);
  r.put('/profile', validateBody(profileSchema), u.putProfile);

  r.get('/favorites', u.listFavorites);
  r.post('/favorites', validateBody(favoriteSchema), u.addFavorite);
  r.delete('/favorites/:osmId', u.removeFavorite);

  r.get('/notes', validateQuery(notesQuerySchema), n.list);
  r.post('/notes', validateBody(noteSchema), n.create);
  r.delete('/notes', n.removeAll);
  r.put('/notes/:id', validateBody(noteSchema), n.update);
  r.delete('/notes/:id', n.remove);
  return r;
}

import { Router } from 'express';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { verifyToken, requireRole } from '../middleware/verifyToken.js';
import { crisisSchema, coordsSchema } from '../validation/schemas.js';
import { createPublicController } from '../controllers/publicController.js';

/** /api/telemetry, /api/psychologists, /api/proxy/* y /api/havens/:osmId/certification */
export function publicRoutes({ repos, limiters, cache, config, fetchImpl }) {
  const c = createPublicController({ ...repos, cache, config, fetchImpl });
  const r = Router();
  r.post('/telemetry/crisis', limiters.telemetry, validateBody(crisisSchema), c.recordCrisis);
  r.get('/telemetry/crisis/summary', verifyToken, requireRole('admin'), c.crisisSummary);
  r.get('/psychologists', c.listPsychologists);
  r.get('/proxy/weather', validateQuery(coordsSchema), c.weather);
  r.get('/proxy/countries', c.countries);
  r.get('/havens/:osmId/certification', c.certification);
  return r;
}

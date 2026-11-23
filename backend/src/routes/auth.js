import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';
import { createAuthController } from '../controllers/authController.js';

/** /api/auth — registro, inicio de sesión, sesión actual y borrado de cuenta. */
export function authRoutes({ repos, limiters }) {
  const c = createAuthController(repos);
  const r = Router();
  r.post('/register', limiters.auth, validateBody(registerSchema), c.register);
  r.post('/login', limiters.auth, validateBody(loginSchema), c.login);
  r.get('/me', verifyToken, c.me);
  r.delete('/me', verifyToken, (req, res) => c.deleteAccount(req, res, repos.notes));
  return r;
}

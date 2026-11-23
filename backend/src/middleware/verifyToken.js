import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from './errorHandler.js';

/** Exige "Authorization: Bearer <JWT>" válido y deja el usuario en req.user. */
export function verifyToken(req, _res, next) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(new HttpError(401, 'Inicia sesión para continuar'));
  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'], issuer: 'neuronote-api' });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.'));
  }
}

/** Control de acceso por roles: requireRole('admin'), requireRole('psychologist', 'admin'). */
export const requireRole =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user?.role) ? next() : next(new HttpError(403, 'No tienes permiso para esta acción'));

export function signToken(user) {
  return jwt.sign({ role: user.role }, config.jwt.secret, {
    subject: user.id,
    expiresIn: config.jwt.expiresIn,
    issuer: 'neuronote-api',
    algorithm: 'HS256',
  });
}

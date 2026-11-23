import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/verifyToken.js';
import { HttpError } from '../middleware/errorHandler.js';

const BCRYPT_ROUNDS = 12;
// Hash ficticio para comparar aunque el correo no exista (evita revelar qué correos están registrados por el tiempo de respuesta)
const DUMMY_HASH = bcrypt.hashSync('neuronote-dummy-password', BCRYPT_ROUNDS);

const publicUser = (u) => ({ id: u.id, email: u.email, displayName: u.displayName, role: u.role, createdAt: u.createdAt });

export function createAuthController({ users }) {
  return {
    async register(req, res) {
      const { email, password, displayName } = req.body;
      if (await users.findByEmail(email)) throw new HttpError(409, 'Ya existe una cuenta con ese correo');
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = await users.create({ email, passwordHash, displayName, role: 'user' });
      await users.logAccess(user.id, 'register');
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    },

    async login(req, res) {
      const { email, password } = req.body;
      const user = await users.findByEmail(email);
      const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !ok) throw new HttpError(401, 'Correo o contraseña incorrectos');
      await users.logAccess(user.id, 'login');
      res.json({ token: signToken(user), user: publicUser(user) });
    },

    async me(req, res) {
      const user = await users.findById(req.user.id);
      if (!user) throw new HttpError(404, 'La cuenta ya no existe');
      res.json({ user: publicUser(user) });
    },

    /** Derecho de cancelación: borra la cuenta y sus datos relacionados. */
    async deleteAccount(req, res, notes) {
      await notes?.removeAll(req.user.id);
      await users.remove(req.user.id);
      res.status(204).end();
    },
  };
}

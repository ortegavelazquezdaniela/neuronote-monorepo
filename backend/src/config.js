/**
 * Configuración desde variables de entorno (node --env-file=.env).
 * Nunca se escriben secretos en el código.
 */
import crypto from 'node:crypto';

const env = process.env;

const isProd = env.NODE_ENV === 'production';
let jwtSecret = env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (isProd) throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción.');
  // Desarrollo/pruebas: secreto aleatorio por proceso (los tokens dejan de valer al reiniciar)
  jwtSecret = crypto.randomBytes(48).toString('base64url');
}

export const config = {
  port: Number(env.PORT) || 4000,
  isProd,
  isTest: env.NODE_ENV === 'test' || Boolean(env.VITEST),
  corsOrigins: (env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwt: { secret: jwtSecret, expiresIn: env.JWT_EXPIRES_IN || '2h' },
  supabase: { url: env.SUPABASE_URL || '', secretKey: env.SUPABASE_SECRET_KEY || '' },
  mongoUri: env.MONGODB_URI || '',
  restCountriesKey: env.RESTCOUNTRIES_KEY || '',
  auditEngineUrl: env.AUDIT_ENGINE_URL || '',
};

export const hasSupabase = () => Boolean(config.supabase.url && config.supabase.secretKey);
export const hasMongo = () => Boolean(config.mongoUri);

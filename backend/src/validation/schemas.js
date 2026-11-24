import { z } from 'zod';

// Mensajes por defecto de zod en español (respaldo para los campos sin mensaje propio).
z.config(z.locales.es());

/**
 * Esquemas de validación (zod). El servidor nunca confía en el cliente:
 * repite las reglas del frontend y limpia el texto antes de guardarlo.
 */

/** Quita caracteres de control y espacios repetidos. */
export const clean = (s) =>
  String(s ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();

const text = (min, max, message) =>
  z
    .string(message ? { error: message } : undefined)
    .transform(clean)
    .pipe(z.string().min(min, message).max(max, message));

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo no válido').max(254),
  password: z
    .string()
    .min(10, 'La contraseña debe tener al menos 10 caracteres')
    .max(128)
    .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), 'Usa letras y al menos un número'),
  displayName: text(2, 40, 'Escribe un nombre de 2 a 40 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

const level = z.number().int().min(1).max(5);

export const profileSchema = z.object({
  noiseSensitivity: level,
  lightSensitivity: level,
  crowdSensitivity: level,
  heatSensitivity: level,
  routePriority: z.enum(['calm', 'fast']),
});

export const favoriteSchema = z.object({
  osmId: z.string().regex(/^(node|way|relation)-\d{1,15}$/),
  name: text(1, 120),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const noteSchema = z.object({
  place: text(2, 80),
  when: z.iso.datetime({ offset: true }).refine((d) => new Date(d).getTime() <= Date.now() + 60_000, {
    message: 'La fecha no puede estar en el futuro',
  }),
  noise: level,
  comfort: level,
  light: z.enum(['suave', 'normal', 'intensa']).nullable().optional(),
  crowd: z.enum(['poca', 'moderada', 'mucha']).nullable().optional(),
  text: text(0, 500).optional().default(''),
});

export const notesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().max(80).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
});

/** Telemetría ANÓNIMA: sin usuario, sin ubicación, sin texto libre. */
export const crisisSchema = z.object({
  hour: z.number().int().min(0).max(23),
  weekday: z.number().int().min(0).max(6),
  temperature: z.number().min(-40).max(60).nullable().optional(),
  weatherCode: z.number().int().min(0).max(99).nullable().optional(),
  noiseLevel: z.number().int().min(1).max(5).nullable().optional(),
  source: z.enum(['fab', 'shortcut', 'page']),
});

export const coordsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

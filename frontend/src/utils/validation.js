/**
 * Validación y sanitización de Sensory Notes (función pura, fácil de probar en Fase 5).
 * El backend (Fase 4) repetirá estas reglas: la validación del cliente es ayuda, no seguridad.
 */

export const NOTE_LIMITS = { placeMin: 2, placeMax: 80, textMax: 500 };

export const NOISE_LEVELS = [1, 2, 3, 4, 5];
export const COMFORT_LEVELS = [1, 2, 3, 4, 5];
export const LIGHT_OPTIONS = ['suave', 'normal', 'intensa'];
export const CROWD_OPTIONS = ['poca', 'moderada', 'mucha'];

/** Quita caracteres de control y espacios repetidos. React ya escapa el HTML al renderizar. */
export function cleanText(value) {
  return String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Devuelve { ok, errors, data } — errors es un objeto { campo: mensaje }. */
export function validateNote(input, now = new Date()) {
  const errors = {};
  const place = cleanText(input.place);
  const text = cleanText(input.text);

  if (!place) errors.place = 'Escribe el lugar o el trayecto.';
  else if (place.length < NOTE_LIMITS.placeMin) errors.place = 'Usa al menos 2 caracteres.';
  else if (place.length > NOTE_LIMITS.placeMax) errors.place = `Usa como máximo ${NOTE_LIMITS.placeMax} caracteres.`;

  if (!input.when) {
    errors.when = 'Indica la fecha y la hora.';
  } else {
    const date = new Date(input.when);
    if (Number.isNaN(date.getTime())) errors.when = 'La fecha no es válida.';
    else if (date.getTime() > now.getTime() + 60_000) errors.when = 'La fecha no puede estar en el futuro.';
  }

  if (!NOISE_LEVELS.includes(input.noise)) errors.noise = 'Elige cuánto ruido percibiste.';
  if (!COMFORT_LEVELS.includes(input.comfort)) errors.comfort = 'Elige cómo te sentiste.';
  if (input.light && !LIGHT_OPTIONS.includes(input.light)) errors.light = 'Opción no válida.';
  if (input.crowd && !CROWD_OPTIONS.includes(input.crowd)) errors.crowd = 'Opción no válida.';
  if (text.length > NOTE_LIMITS.textMax) errors.text = `Usa como máximo ${NOTE_LIMITS.textMax} caracteres.`;

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    data: ok
      ? {
          place,
          when: new Date(input.when).toISOString(),
          noise: input.noise,
          comfort: input.comfort,
          light: input.light || null,
          crowd: input.crowd || null,
          text,
        }
      : null,
  };
}

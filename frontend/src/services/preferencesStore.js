import { readJSON, writeJSON, removeKey } from './storage';

/**
 * Preferencias de accesibilidad.
 * Privacidad: solo se escriben en el dispositivo si la persona activa
 * "Recordar en este dispositivo" (remember = true). Si lo desactiva, se borran.
 */

export const PREFS_KEY = 'nn-prefs';

export const DEFAULT_PREFS = {
  theme: 'default', // default | calm | contrast | night
  textScale: 1, // 1 | 1.125 | 1.25 | 1.5
  font: 'atkinson', // atkinson | opendyslexic | system
  motion: 'system', // system | reduced | full
  intro: true, // mostrar la introducción de bienvenida
  remember: false, // consentimiento para guardar en este dispositivo
};

const ALLOWED = {
  theme: ['default', 'calm', 'contrast', 'night'],
  textScale: [1, 1.125, 1.25, 1.5],
  font: ['atkinson', 'opendyslexic', 'system'],
  motion: ['system', 'reduced', 'full'],
};

/** Acepta solo valores conocidos; cualquier dato alterado vuelve al valor por defecto. */
export function sanitizePrefs(input) {
  const out = { ...DEFAULT_PREFS };
  if (!input || typeof input !== 'object') return out;
  for (const [key, allowed] of Object.entries(ALLOWED)) {
    if (allowed.includes(input[key])) out[key] = input[key];
  }
  if (typeof input.intro === 'boolean') out.intro = input.intro;
  if (typeof input.remember === 'boolean') out.remember = input.remember;
  return out;
}

export function loadPrefs() {
  const stored = readJSON(PREFS_KEY);
  return stored ? sanitizePrefs({ ...stored, remember: true }) : { ...DEFAULT_PREFS };
}

/** Guarda o borra según el consentimiento. Devuelve false si no se pudo guardar. */
export function persistPrefs(prefs) {
  if (!prefs.remember) {
    removeKey(PREFS_KEY);
    return true;
  }
  return writeJSON(PREFS_KEY, prefs);
}

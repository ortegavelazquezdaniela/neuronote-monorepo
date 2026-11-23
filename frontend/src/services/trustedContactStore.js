import { readJSON, writeJSON, removeKey } from './storage';

/**
 * Persona de confianza para el SOS. Se guarda SOLO si la persona lo autoriza
 * y solo en este navegador. Nunca se envía a ningún servidor.
 */
const KEY = 'nn-trusted-contact';

export const trustedContactStore = {
  load() {
    const c = readJSON(KEY);
    if (!c || typeof c !== 'object') return null;
    const cc = String(c.callingCode ?? '').replace(/\D/g, '');
    const phone = String(c.phone ?? '').replace(/\D/g, '');
    if (!cc || !phone) return null;
    return { country: String(c.country ?? ''), callingCode: cc, phone, name: String(c.name ?? '').slice(0, 40) };
  },
  save(contact) {
    return writeJSON(KEY, contact);
  },
  clear() {
    removeKey(KEY);
  },
};

/**
 * Envoltorio seguro de localStorage / sessionStorage.
 * En modo privado o con el almacenamiento bloqueado, el acceso puede lanzar
 * excepciones: nunca dejamos que eso rompa la interfaz.
 */

function getStore(kind) {
  try {
    const store = kind === 'session' ? window.sessionStorage : window.localStorage;
    const probe = '__nn_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

export function isStorageAvailable(kind = 'local') {
  return getStore(kind) !== null;
}

export function readJSON(key, fallback = null, kind = 'local') {
  const store = getStore(kind);
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Devuelve true si se guardó; false si el almacenamiento no está disponible. */
export function writeJSON(key, value, kind = 'local') {
  const store = getStore(kind);
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key, kind = 'local') {
  const store = getStore(kind);
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* sin acción: el dato simplemente no existía o no es accesible */
  }
}

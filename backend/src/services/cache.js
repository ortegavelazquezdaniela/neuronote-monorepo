/**
 * Caché en memoria con TTL para el proxy de APIs externas.
 * Reduce peticiones a servicios gratuitos (y cuida cuotas como la de REST Countries).
 */
export function createCache() {
  const store = new Map();
  return {
    async getOrSet(key, ttlMs, loader) {
      const hit = store.get(key);
      if (hit && hit.expires > Date.now()) return { value: hit.value, cached: true };
      const value = await loader();
      store.set(key, { value, expires: Date.now() + ttlMs });
      if (store.size > 500) store.delete(store.keys().next().value); // límite simple
      return { value, cached: false };
    },
  };
}

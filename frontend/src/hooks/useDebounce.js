import { useEffect, useState } from 'react';

/** Devuelve `value` solo después de `delay` ms sin cambios (búsquedas, mover el mapa). */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

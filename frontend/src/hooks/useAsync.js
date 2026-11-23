import { useCallback, useEffect, useEffectEvent, useState } from 'react';

/**
 * Ejecuta una función asíncrona cuando cambian sus dependencias.
 * Devuelve { status: 'idle'|'loading'|'success'|'error', data, error, retry }.
 * Cancela la petición anterior (AbortController) si las dependencias cambian
 * o el componente se desmonta. `enabled = false` no ejecuta nada.
 */
export function useAsync(fn, deps, { enabled = true } = {}) {
  const [state, setState] = useState({ status: enabled ? 'loading' : 'idle', data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const run = useEffectEvent((signal) => fn(signal));

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- inicio de una carga externa
    setState((s) => ({ ...s, status: 'loading', error: null }));
    run(controller.signal)
      .then((data) => !controller.signal.aborted && setState({ status: 'success', data, error: null }))
      .catch((error) => !controller.signal.aborted && setState((s) => ({ ...s, status: 'error', error })));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ...state, retry };
}

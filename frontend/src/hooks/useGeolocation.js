import { useCallback, useState } from 'react';

/**
 * Ubicación SOLO bajo petición explícita (botón "Usar mi ubicación").
 * Nunca se solicita al cargar la página y nunca se guarda: vive en memoria
 * mientras la pestaña está abierta.
 * status: 'idle' | 'asking' | 'granted' | 'denied' | 'unavailable'
 */
export function useGeolocation() {
  const [state, setState] = useState({ status: 'idle', position: null, accuracy: null });

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable', position: null, accuracy: null });
      return;
    }
    setState((s) => ({ ...s, status: 'asking' }));
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: 'granted',
          position: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          accuracy: Math.round(pos.coords.accuracy),
        }),
      (err) =>
        setState({
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
          position: null,
          accuracy: null,
        }),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  }, []);

  const forget = useCallback(() => setState({ status: 'idle', position: null, accuracy: null }), []);

  return { ...state, request, forget };
}

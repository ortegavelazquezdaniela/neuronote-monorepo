import { useCallback, useEffect, useRef, useState } from 'react';
import { parseHeartRate, isPlausibleBpm, demoBpm } from '../utils/heartRate';

const WINDOW_MS = 5 * 60_000; // se conservan solo los últimos 5 minutos, en memoria
const DEMO_TICK_MS = 250; // la demostración avanza 4 veces más rápido que el tiempo real

export const bluetoothSupported = () =>
  typeof navigator !== 'undefined' && 'bluetooth' in navigator && typeof window !== 'undefined' && window.isSecureContext;

/**
 * Lee el pulso de un dispositivo Bluetooth con el perfil estándar «Heart Rate».
 * - Solo se conecta cuando la persona pulsa el botón y elige el dispositivo
 *   en el selector del navegador (el navegador pide el permiso).
 * - Las lecturas viven en memoria: no se guardan ni se envían a ningún servidor.
 * status: 'idle' | 'unsupported' | 'connecting' | 'connected' | 'demo' | 'disconnected' | 'error'
 */
export function useHeartRateMonitor() {
  const [state, setState] = useState({
    status: bluetoothSupported() ? 'idle' : 'unsupported',
    bpm: null,
    contact: null,
    deviceName: null,
    error: null,
    samples: [],
  });
  const deviceRef = useRef(null);
  const charRef = useRef(null);
  const demoRef = useRef(null);

  const push = useCallback((bpm, contact, t = Date.now()) => {
    if (!isPlausibleBpm(bpm)) return;
    setState((s) => ({
      ...s,
      bpm,
      contact,
      samples: [...s.samples.filter((x) => t - x.t <= WINDOW_MS), { t, bpm }],
    }));
  }, []);

  const onValue = useCallback(
    (e) => {
      const { bpm, contact } = parseHeartRate(e.target.value);
      push(bpm, contact);
    },
    [push],
  );

  const onDisconnected = useCallback(() => {
    setState((s) => (s.status === 'connected' ? { ...s, status: 'disconnected' } : s));
  }, []);

  const stopDemo = useCallback(() => {
    clearInterval(demoRef.current);
    demoRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    stopDemo();
    charRef.current?.removeEventListener('characteristicvaluechanged', onValue);
    deviceRef.current?.removeEventListener('gattserverdisconnected', onDisconnected);
    if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect();
    deviceRef.current = null;
    charRef.current = null;
    setState((s) => ({
      ...s,
      status: bluetoothSupported() ? 'idle' : 'unsupported',
      bpm: null,
      contact: null,
      deviceName: null,
      samples: [],
    }));
  }, [onValue, onDisconnected, stopDemo]);

  const connect = useCallback(async () => {
    if (!bluetoothSupported()) return;
    stopDemo();
    setState((s) => ({ ...s, status: 'connecting', error: null, samples: [], bpm: null }));
    try {
      const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
      device.addEventListener('gattserverdisconnected', onDisconnected);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      characteristic.addEventListener('characteristicvaluechanged', onValue);
      await characteristic.startNotifications();
      deviceRef.current = device;
      charRef.current = characteristic;
      setState((s) => ({ ...s, status: 'connected', deviceName: device.name || 'Dispositivo sin nombre' }));
    } catch (err) {
      // NotFoundError = la persona cerró el selector sin elegir: no es un error
      const cancelled = err?.name === 'NotFoundError';
      setState((s) => ({
        ...s,
        status: cancelled ? 'idle' : 'error',
        error: cancelled
          ? null
          : 'No pudimos leer el pulso de ese dispositivo. Revisa que esté transmitiendo con el perfil estándar de frecuencia cardiaca.',
      }));
    }
  }, [onValue, onDisconnected, stopDemo]);

  const startDemo = useCallback(
    (threshold) => {
      disconnect();
      let step = 0;
      let t = Date.now();
      setState((s) => ({ ...s, status: 'demo', deviceName: 'Demostración', error: null }));
      demoRef.current = setInterval(() => {
        t += 1000; // cada tic equivale a 1 s simulado
        push(demoBpm(step, threshold), true, t);
        step += 1;
        if (step > 150) step = 0;
      }, DEMO_TICK_MS);
    },
    [disconnect, push],
  );

  useEffect(() => () => {
    clearInterval(demoRef.current);
    if (deviceRef.current?.gatt?.connected) deviceRef.current.gatt.disconnect();
  }, []);

  return { ...state, connect, disconnect, startDemo };
}

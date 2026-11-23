import { api, apiEnabled } from './api';

/**
 * Telemetría ANÓNIMA de activaciones del SOS. Solo envía la hora del día,
 * el día de la semana y cómo se abrió (botón, atajo o página). Sin cuenta,
 * sin ubicación, sin texto. Nunca bloquea ni retrasa la ayuda: si falla, se ignora.
 */
export function reportCrisisOpen(source) {
  if (!apiEnabled() || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const now = new Date();
  api('/telemetry/crisis', {
    method: 'POST',
    auth: false,
    body: { hour: now.getHours(), weekday: now.getDay(), source },
  }).catch(() => {});
}

/**
 * Utilidades del monitor de pulso (extensión experimental).
 *
 * Usa el perfil estándar de Bluetooth «Heart Rate» (servicio 0x180D,
 * característica 0x2A37), el mismo que emiten bandas de pecho y relojes que
 * «transmiten el pulso» (Polar, Garmin, Wear OS con una app de transmisión).
 *
 * NEURONOTE NO es un dispositivo médico: no diagnostica ni detecta emergencias.
 */

/**
 * Decodifica una lectura de la característica Heart Rate Measurement.
 * Byte 0 = banderas; bit 0: 0 → pulso en 1 byte, 1 → en 2 bytes (little endian).
 * Bits 1–2: estado del contacto con la piel (si el sensor lo reporta).
 */
export function parseHeartRate(view) {
  const flags = view.getUint8(0);
  const wide = (flags & 0x01) === 0x01;
  const bpm = wide ? view.getUint16(1, true) : view.getUint8(1);
  const contactSupported = (flags & 0x04) === 0x04;
  const contact = contactSupported ? (flags & 0x02) === 0x02 : null;
  return { bpm, contact };
}

/** Rango que aceptamos como lectura válida (descarta ruido del sensor). */
export const isPlausibleBpm = (bpm) => Number.isFinite(bpm) && bpm >= 25 && bpm <= 240;

/**
 * ¿El pulso lleva al menos `seconds` segundos por encima de `threshold`?
 * samples: [{ t: milisegundos, bpm }] en orden. Si hay un hueco de lectura
 * mayor a 10 s, la cuenta se reinicia (no sabemos qué pasó en medio).
 * Devuelve { sustained, since } (since = cuándo empezó a estar arriba).
 */
export function sustainedAbove(samples, threshold, seconds, now = samples.at(-1)?.t ?? 0) {
  if (!threshold || samples.length === 0) return { sustained: false, since: null };
  let since = null;
  let prev = null;
  for (const s of samples) {
    const gap = prev ? s.t - prev.t > 10_000 : false;
    if (s.bpm > threshold && !gap) since ??= s.t;
    else if (s.bpm > threshold && gap) since = s.t;
    else since = null;
    prev = s;
  }
  return { sustained: since !== null && now - since >= seconds * 1000, since };
}

/**
 * Serie de demostración: empieza en reposo, sube por encima del umbral y baja.
 * Solo sirve para mostrar cómo funciona la alerta sin un dispositivo.
 */
export function demoBpm(step, threshold = 100) {
  const rest = Math.max(60, threshold - 30);
  if (step < 10) return rest + (step % 3);
  if (step < 20) return Math.round(rest + ((threshold + 15 - rest) * (step - 10)) / 10);
  if (step < 110) return threshold + 12 + (step % 4);
  return Math.max(rest, threshold + 12 - (step - 110) * 2);
}

/**
 * WhatsApp Deep-Link (https://wa.me) — protocolo gratuito, sin WhatsApp Business API.
 * El enlace abre WhatsApp con el mensaje escrito; la persona decide si lo envía.
 * NEURONOTE no envía, lee ni guarda conversaciones.
 */

export const DEFAULT_SOS_MESSAGE =
  'Hola, estoy usando NEURONOTE y estoy pasando por un momento de sobrecarga o ansiedad. ¿Puedes acompañarme o llamarme cuando puedas?';

/** Solo dígitos. Quita espacios, guiones, paréntesis y el "+". */
export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');

/**
 * Valida un número internacional E.164: código de país + número, 8 a 15 dígitos.
 * Devuelve null si es válido o un mensaje de error.
 */
export function validatePhone(callingCode, localNumber) {
  const cc = digitsOnly(callingCode);
  const local = digitsOnly(localNumber);
  if (!cc) return 'Elige el país del número.';
  if (!local) return 'Escribe el número de teléfono.';
  const total = cc.length + local.length;
  if (total < 8 || total > 15) return 'El número no parece completo. Revisa los dígitos.';
  return null;
}

/** https://wa.me/<código+número>?text=<mensaje codificado> */
export function buildWhatsAppLink(callingCode, localNumber, message = DEFAULT_SOS_MESSAGE) {
  const phone = `${digitsOnly(callingCode)}${digitsOnly(localNumber)}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

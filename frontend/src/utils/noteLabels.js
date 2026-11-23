/** Etiquetas compartidas entre el formulario y el historial de Sensory Notes. */

export const NOISE_LABELS = {
  1: 'Muy tranquilo',
  2: 'Tranquilo',
  3: 'Moderado',
  4: 'Ruidoso',
  5: 'Muy ruidoso',
};

export const COMFORT_LABELS = {
  1: 'Muy incómodo',
  2: 'Incómodo',
  3: 'Neutral',
  4: 'Cómodo',
  5: 'Muy cómodo',
};

export const LIGHT_LABELS = { suave: 'Suave', normal: 'Normal', intensa: 'Intensa' };
export const CROWD_LABELS = { poca: 'Poca gente', moderada: 'Moderada', mucha: 'Mucha gente' };

export const scaleOptions = (labels) =>
  Object.entries(labels).map(([value, description]) => ({
    value: Number(value),
    label: value,
    description,
  }));

/** Opciones de lista con "Sin indicar" para que un campo opcional se pueda desmarcar. */
export const listOptions = (labels) => [
  { value: '', label: 'Sin indicar' },
  ...Object.entries(labels).map(([value, label]) => ({ value, label })),
];

/** Fecha local para <input type="datetime-local"> (AAAA-MM-DDTHH:mm). */
export function toLocalInput(date = new Date()) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
}

export const formatWhen = (iso) =>
  new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

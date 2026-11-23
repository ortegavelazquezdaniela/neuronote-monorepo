import styles from './DataBadge.module.css';

/**
 * Etiqueta de procedencia del dato. Regla del proyecto:
 * nunca mostrar un valor sin decir si es medido, estimado, reportado o de demostración.
 */
const KINDS = {
  real: { label: 'Medido', title: 'Dato medido por una fuente abierta (p. ej. Open-Meteo)' },
  estimated: { label: 'Estimado', title: 'Valor calculado a partir de otras variables' },
  reported: { label: 'Reportado', title: 'Información aportada por la comunidad' },
  demo: { label: 'Demostración', title: 'Dato ficticio usado solo para ilustrar la interfaz' },
};

export function DataBadge({ kind = 'demo', className = '' }) {
  const k = KINDS[kind] ?? KINDS.demo;
  return (
    <span className={`${styles.badge} ${styles[kind]} ${className}`} title={k.title}>
      <span className={styles.dot} aria-hidden="true" />
      {k.label}
    </span>
  );
}

export const DATA_KINDS = KINDS;

import styles from './LayerToggle.module.css';

/** Botón conmutador de capa del mapa (aria-pressed). */
export function LayerToggle({ pressed, onToggle, swatch, children }) {
  return (
    <button type="button" className={styles.toggle} aria-pressed={pressed} onClick={onToggle}>
      <span className={`${styles.swatch} ${styles[swatch]}`} aria-hidden="true" />
      {children}
      <span className={styles.state} aria-hidden="true">
        {pressed ? 'Visible' : 'Oculta'}
      </span>
    </button>
  );
}

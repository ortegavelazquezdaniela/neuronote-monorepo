import { useId } from 'react';
import styles from './Switch.module.css';

/** Interruptor accesible (role="switch") con etiqueta y descripción visibles. */
export function Switch({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span id={`${id}-label`} className={styles.label}>
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className={styles.desc}>
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        className={styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
        <span className={styles.state} aria-hidden="true">
          {checked ? 'Sí' : 'No'}
        </span>
      </button>
    </div>
  );
}

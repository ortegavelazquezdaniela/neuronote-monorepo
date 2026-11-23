import styles from './Logo.module.css';

/**
 * Símbolo NEURONOTE: un trayecto curvo y sereno entre dos puntos
 * (origen rosa claro → destino aqua) dentro de una forma suave.
 */
export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" fill="var(--nn-deep-blue)" />
      <path
        d="M8 22c3 0 4-3 6-6s3.5-6 10-6"
        fill="none"
        stroke="var(--nn-sage)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="22" r="2.6" fill="var(--nn-rose-light)" />
      <circle cx="24" cy="10" r="2.6" fill="var(--nn-aqua)" />
    </svg>
  );
}

export function Logo({ inverted = false }) {
  return (
    <span className={`${styles.logo} ${inverted ? styles.inverted : ''}`}>
      <LogoMark />
      <span className={styles.word}>
        NEURO<span className={styles.light}>NOTE</span>
      </span>
    </span>
  );
}

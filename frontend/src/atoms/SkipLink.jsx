import styles from './SkipLink.module.css';

/** Primer elemento enfocable: salta directo al contenido (WCAG 2.4.1). */
export function SkipLink({ target = '#contenido' }) {
  return (
    <a className={styles.skip} href={target}>
      Saltar al contenido principal
    </a>
  );
}

import styles from './PanelSection.module.css';

/** Bloque titulado dentro del panel lateral de las páginas con mapa. */
export function PanelSection({ title, id, children, actions }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.head}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

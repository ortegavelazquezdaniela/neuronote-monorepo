import styles from './SensoryDashboardLayout.module.css';

/**
 * Plantilla de las páginas geoespaciales: encabezado, panel de controles
 * y mapa. En escritorio el mapa queda fijo a la derecha; en móvil va primero,
 * con altura contenida, y el panel debajo.
 */
export function SensoryDashboardLayout({ title, englishName, intro, panel, map }) {
  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="dash-title">
      <header className={styles.header}>
        <h1 id="dash-title" className={styles.title}>
          {title}
          {englishName && (
            <span className={styles.en} lang="en">
              {englishName}
            </span>
          )}
        </h1>
        {intro && <p className={styles.intro}>{intro}</p>}
      </header>
      <div className={styles.grid}>
        <div className={styles.mapCol}>
          <div className={styles.mapFrame}>{map}</div>
        </div>
        <div className={styles.panel}>{panel}</div>
      </div>
    </section>
  );
}

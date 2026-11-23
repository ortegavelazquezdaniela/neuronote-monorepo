import { DataBadge } from '../atoms/DataBadge';
import styles from './RouteCompare.module.css';

/**
 * Comparador compacto de dos rutas. En Fase 1 usa valores de demostración
 * (siempre etiquetados); en Fase 3 recibirá datos de useSensoryRoute.
 */
const DEMO_ROUTES = [
  {
    id: 'calm',
    name: 'Ruta de calma',
    minutes: 18,
    noise: 'Bajo',
    shade: 'Sombra en 60 % del trayecto',
  },
  {
    id: 'busy',
    name: 'Ruta directa',
    minutes: 14,
    noise: 'Alto',
    shade: 'Avenida abierta, sin sombra',
  },
];

export function RouteCompare({ routes = DEMO_ROUTES, demo = true }) {
  return (
    <section className={styles.panel} aria-label="Comparación de rutas de ejemplo">
      <header className={styles.head}>
        <p className={styles.title}>A → B · a pie</p>
        {demo && <DataBadge kind="demo" />}
      </header>
      <ul className={styles.list}>
        {routes.map((r) => (
          <li key={r.id} className={`${styles.row} ${styles[r.id]}`}>
            <span className={styles.swatch} aria-hidden="true" />
            <div className={styles.body}>
              <p className={styles.name}>
                {r.name}
                <span className={styles.time}>{r.minutes} min</span>
              </p>
              <p className={styles.meta}>
                Ruido reportado: <strong>{r.noise}</strong>
                <span className={styles.sep} aria-hidden="true">
                  ·
                </span>
                {r.shade}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

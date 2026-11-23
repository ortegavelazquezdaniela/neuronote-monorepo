import { Link } from 'react-router';
import { ArrowRight, Footprints, Leaf, CloudSun, NotebookPen, LifeBuoy, Phone } from 'lucide-react';
import { MODULES } from '../utils/modules';
import { HELPLINES } from '../utils/helplines';
import styles from './ModulesSection.module.css';

const ICONS = {
  routes: Footprints,
  havens: Leaf,
  microclimate: CloudSun,
  notes: NotebookPen,
  sos: LifeBuoy,
};

export function ModulesSection() {
  const linea = HELPLINES.lineaDeLaVida;
  return (
    <section className={styles.section} aria-labelledby="modulos-title" id="modulos">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.intro}>
          <h2 id="modulos-title" className={styles.title}>
            Cinco herramientas para recorrer la ciudad a tu ritmo
          </h2>
          <p className={styles.text}>
            Cada módulo resuelve una necesidad concreta. Úsalos juntos o por separado; ninguno te pide
            más información de la necesaria.
          </p>
        </div>

        <ul className={styles.list}>
          {MODULES.map((m) => {
            const Icon = ICONS[m.id];
            return (
              <li key={m.id} className={`${styles.item} ${styles[m.tone]}`}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon />
                </span>
                <div className={styles.body}>
                  <h3 className={styles.name}>
                    <span lang="en">{m.name}</span>
                    <span className={styles.label}>{m.label}</span>
                  </h3>
                  <p className={styles.summary}>{m.summary}</p>
                  <p className={styles.detail} data-calm-hide>{m.detail}</p>
                  <div className={styles.links}>
                    <Link to={m.path} className={styles.more}>
                      Abrir {m.label}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                    {m.id === 'sos' && (
                      <a href={linea.tel} className={styles.more}>
                        <Phone aria-hidden="true" />
                        {linea.name}: {linea.display}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

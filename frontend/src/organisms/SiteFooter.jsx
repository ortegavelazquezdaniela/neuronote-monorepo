import { Link } from 'react-router';
import { Logo } from '../atoms/Logo';
import { MODULES } from '../utils/modules';
import { HELPLINES } from '../utils/helplines';
import styles from './SiteFooter.module.css';

/** Panel pericial del motor de auditoría (PHP). Se cambia con VITE_AUDIT_URL. */
const AUDIT_PANEL_URL = import.meta.env.VITE_AUDIT_URL || 'https://neuronote-audit.onrender.com/';

export function SiteFooter() {
  const { lineaDeLaVida, emergencias } = HELPLINES;
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo inverted />
          <p className={styles.tagline} lang="en">
            Find your calm. Find your way.
          </p>
          <p className={styles.note}>
            Proyecto académico FullStack de código abierto, desarrollado con herramientas gratuitas.
          </p>
        </div>

        <nav aria-label="Módulos" className={styles.col}>
          <h2 className={styles.colTitle}>Plataforma</h2>
          <ul>
            <li>
              <Link to="/mapa">Explorar mapa</Link>
            </li>
            {MODULES.filter((m) => m.id !== 'sos').map((m) => (
              <li key={m.id}>
                <Link to={m.path}>{m.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/pulso">Monitor de pulso (experimental)</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Proyecto" className={styles.col}>
          <h2 className={styles.colTitle}>Proyecto</h2>
          <ul>
            <li>
              <Link to="/acerca">Acerca de NEURONOTE</Link>
            </li>
            <li>
              <Link to="/privacidad">Privacidad</Link>
            </li>
            <li>
              <Link to="/declaracion-accesibilidad">Declaración de accesibilidad</Link>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
            <li>
              {/* Panel pericial (motor PHP): protegido con usuario y contraseña de auditor */}
              <a href={AUDIT_PANEL_URL} rel="nofollow">
                Acceso para auditores
                {' '}
                <span className={styles.hint}>(requiere contraseña)</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className={styles.colTitle}>Si necesitas ayuda ahora</h2>
          <ul>
            <li>
              <a href={lineaDeLaVida.tel}>
                {lineaDeLaVida.name}: <strong>{lineaDeLaVida.display}</strong>
              </a>
            </li>
            <li>
              <a href={emergencias.tel}>
                {emergencias.name}: <strong>{emergencias.display}</strong>
              </a>
            </li>
            <li>
              <Link to="/auxilio-inmediato">Recursos de regulación</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={`wrap ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} NEURONOTE · Licencia MIT</p>
        <p>NEURONOTE no sustituye atención médica, psicológica ni servicios de emergencia.</p>
      </div>
    </footer>
  );
}

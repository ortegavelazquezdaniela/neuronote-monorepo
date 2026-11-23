import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router';
import { Accessibility, LifeBuoy, Menu, UserRound, X } from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { NAV_LINKS } from '../utils/modules';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef(null);

  // Cerrar el menú al cambiar de ruta
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Escape cierra y devuelve el foco al botón; bloquear scroll del fondo
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkClass = ({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`;

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label="NEURONOTE, ir a inicio">
          <Logo />
        </Link>

        <nav className={styles.primary} aria-label="Principal">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.path}>
                <NavLink to={l.path} end={l.path === '/'} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.tools}>
          <NavLink to="/auxilio-inmediato" className={styles.sos}>
            <LifeBuoy aria-hidden="true" />
            Ayuda SOS
          </NavLink>
          <NavLink to="/accesibilidad" className={styles.iconLink}>
            <Accessibility aria-hidden="true" />
            <span className={styles.iconLabel}>Preferencias de accesibilidad</span>
          </NavLink>
          <NavLink to="/perfil" className={styles.iconLink}>
            <UserRound aria-hidden="true" />
            <span className={styles.iconLabel}>Perfil</span>
          </NavLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span>{open ? 'Cerrar' : 'Menú'}</span>
        </button>
      </div>

      <div id="menu-movil" className={styles.drawer} hidden={!open}>
        <nav className="wrap" aria-label="Menú móvil">
          <ul className={styles.drawerList}>
            {NAV_LINKS.map((l) => (
              <li key={l.path}>
                <NavLink to={l.path} end={l.path === '/'} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/perfil" className={linkClass}>
                Perfil
              </NavLink>
            </li>
            <li>
              <NavLink to="/accesibilidad" className={linkClass}>
                Preferencias de accesibilidad
              </NavLink>
            </li>
          </ul>
          <Link to="/auxilio-inmediato" className={`${styles.sos} ${styles.drawerSos}`}>
            <LifeBuoy aria-hidden="true" />
            Ayuda SOS
          </Link>
        </nav>
      </div>
    </header>
  );
}

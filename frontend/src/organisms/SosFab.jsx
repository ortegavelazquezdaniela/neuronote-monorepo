import { Link, useLocation } from 'react-router';
import { LifeBuoy } from 'lucide-react';
import styles from './SosFab.module.css';

/**
 * Botón flotante SOS — discreto, permanente, en verde petróleo (nunca rojo).
 * Fase 1: enlaza a /auxilio-inmediato.
 * Fase 2: abrirá el CrisisModal (<dialog>) y responderá al atajo Alt + C.
 */
export function SosFab() {
  const { pathname } = useLocation();
  if (pathname === '/auxilio-inmediato') return null;

  return (
    <Link to="/auxilio-inmediato" className={styles.fab}>
      <LifeBuoy aria-hidden="true" />
      <span>Ayuda SOS</span>
    </Link>
  );
}

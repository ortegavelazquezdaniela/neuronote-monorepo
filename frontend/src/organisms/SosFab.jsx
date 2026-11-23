import { useLocation } from 'react-router';
import { LifeBuoy } from 'lucide-react';
import { useSos } from '../hooks/useSos';
import styles from './SosFab.module.css';

/**
 * Botón flotante SOS — discreto, permanente, en verde petróleo (nunca rojo).
 * Abre el modal de apoyo; también disponible con Alt + C.
 */
export function SosFab() {
  const { pathname } = useLocation();
  const { openSos } = useSos();
  if (pathname === '/auxilio-inmediato') return null;

  return (
    <button
      type="button"
      className={styles.fab}
      onClick={openSos}
      aria-haspopup="dialog"
      aria-keyshortcuts="Alt+C"
    >
      <LifeBuoy aria-hidden="true" />
      <span>Ayuda SOS</span>
      <kbd className={styles.kbd} aria-hidden="true">
        Alt C
      </kbd>
    </button>
  );
}

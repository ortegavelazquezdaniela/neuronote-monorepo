import { useEffect, useState } from 'react';
import styles from './PageLoader.module.css';

/**
 * Estado de carga de página. Aparece solo si la carga tarda más de 300 ms
 * (evita destellos) y no usa animaciones en bucle: un texto y una barra fija.
 */
export function PageLoader({ label = 'Cargando la página…' }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`wrap ${styles.loader}`} role="status" aria-live="polite">
      {visible && (
        <>
          <span className={styles.bar} aria-hidden="true" />
          <p>{label}</p>
        </>
      )}
    </div>
  );
}

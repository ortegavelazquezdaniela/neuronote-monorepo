import { useEffect, useState } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { readJSON, writeJSON } from '../services/storage';
import styles from './BrandIntro.module.css';

const SEEN_KEY = 'nn-intro-seen';
const TOTAL_MS = 1800; // dentro del rango pedido: 1.5–2 s
const EXIT_MS = 320;

/**
 * Introducción de marca (primera visita de la sesión):
 * fondo cálido → símbolo que se dibuja → nombre → eslogan → desvanecido.
 * - Nunca se muestra con movimiento reducido, en Modo Calma o si se desactivó.
 * - Se omite con el botón, con Escape o con un clic.
 * - No se repite al navegar ni al recargar en la misma sesión.
 * - El contenido de la página ya está cargado debajo: no retrasa el acceso.
 */
export function BrandIntro() {
  const { prefs, reducedMotion } = usePreferences();
  const [phase, setPhase] = useState(() => {
    const seen = readJSON(SEEN_KEY, false, 'session') || (prefs.remember && readJSON(SEEN_KEY, false));
    return !prefs.intro || reducedMotion || seen ? 'done' : 'playing';
  });

  useEffect(() => {
    if (phase === 'done') return undefined;
    writeJSON(SEEN_KEY, true, 'session');
    if (prefs.remember) writeJSON(SEEN_KEY, true);
    if (phase === 'leaving') {
      const t = setTimeout(() => setPhase('done'), EXIT_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('leaving'), TOTAL_MS - EXIT_MS);
    const onKey = (e) => e.key === 'Escape' && setPhase('done');
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [phase, prefs.remember]);

  if (phase === 'done') return null;

  return (
    <div
      className={`${styles.intro} ${phase === 'leaving' ? styles.leaving : ''}`}
      onClick={() => setPhase('done')}
    >
      <div className={styles.brand} aria-hidden="true">
        <svg className={styles.mark} viewBox="0 0 32 32" width="72" height="72">
          <rect width="32" height="32" rx="9" fill="var(--nn-deep-blue)" />
          <path
            className={styles.path}
            d="M8 22c3 0 4-3 6-6s3.5-6 10-6"
            fill="none"
            stroke="var(--nn-sage)"
            strokeWidth="2.6"
            strokeLinecap="round"
            pathLength="1"
          />
          <circle className={styles.dotA} cx="8" cy="22" r="2.6" fill="var(--nn-rose-light)" />
          <circle className={styles.dotB} cx="24" cy="10" r="2.6" fill="var(--nn-aqua)" />
        </svg>
        <p className={styles.name}>
          NEURO<span>NOTE</span>
        </p>
        <p className={styles.slogan} lang="en">
          Find your calm. Find your way.
        </p>
      </div>
      <button type="button" className={styles.skip} onClick={() => setPhase('done')}>
        Omitir introducción
      </button>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './SectionPage.module.css';

/**
 * Página de sección en construcción. Es honesta: explica qué hará el módulo
 * y en qué fase se implementa, sin simular funcionalidad que aún no existe.
 */
export function SectionPage({ title, englishName, intro, points = [], phase }) {
  useDocumentTitle(title);
  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="page-title">
      <h1 id="page-title" className={styles.title}>
        {title}
        {englishName && (
          <span className={styles.en} lang="en">
            {englishName}
          </span>
        )}
      </h1>
      <p className={styles.intro}>{intro}</p>

      {points.length > 0 && (
        <>
          <h2 className={styles.subtitle}>Qué incluirá</h2>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {phase && (
        <p className={styles.status} role="note">
          Este módulo se implementa en la <strong>Fase {phase}</strong> del desarrollo. Todavía no
          muestra datos.
        </p>
      )}

      <Button to="/" variant="secondary" icon={ArrowLeft} iconPosition="start">
        Volver al inicio
      </Button>
    </section>
  );
}

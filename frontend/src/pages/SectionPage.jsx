import { ArrowLeft } from 'lucide-react';
import { Button } from '../atoms/Button';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from './SectionPage.module.css';

/**
 * Página informativa de texto (acerca, privacidad, declaración, contacto y 404).
 */
export function SectionPage({ title, englishName, intro, points = [], noindex = false }) {
  usePageMeta({ title, description: intro, noindex });
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
          <h2 className={styles.subtitle}>En resumen</h2>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}

      <Button to="/" variant="secondary" icon={ArrowLeft} iconPosition="start" className={styles.back}>
        Volver al inicio
      </Button>
    </section>
  );
}

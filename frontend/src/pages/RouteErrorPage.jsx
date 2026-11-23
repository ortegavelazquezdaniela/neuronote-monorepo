import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { HELPLINES } from '../utils/helplines';
import styles from './SectionPage.module.css';

/**
 * Error inesperado de una página. Explica qué pasó en lenguaje claro,
 * ofrece cómo recuperarse y mantiene visible la ayuda de crisis.
 * No muestra detalles técnicos (manejo seguro de errores).
 */
export function RouteErrorPage() {
  const error = useRouteError();
  useDocumentTitle('Algo no salió bien');
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env.DEV) console.error(error);

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="error-title">
      <h1 id="error-title" className={styles.title}>
        {notFound ? 'Esta página no existe' : 'Algo no salió bien'}
      </h1>
      <p className={styles.intro}>
        {notFound
          ? 'Puede que el enlace haya cambiado.'
          : 'Esta parte de NEURONOTE no pudo cargarse. No es algo que hayas hecho tú. Puedes intentarlo de nuevo o volver al inicio.'}
      </p>
      <p className={styles.status}>
        Si necesitas ayuda ahora, la {HELPLINES.lineaDeLaVida.name} atiende 24 horas:{' '}
        <a href={HELPLINES.lineaDeLaVida.tel}>{HELPLINES.lineaDeLaVida.display}</a>.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {!notFound && (
          <Button icon={RotateCcw} iconPosition="start" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        )}
        <Button href="/" variant="secondary" icon={Home} iconPosition="start">
          Volver al inicio
        </Button>
      </div>
    </section>
  );
}

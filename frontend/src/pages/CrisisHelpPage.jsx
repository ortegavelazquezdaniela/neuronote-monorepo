import { Phone, Siren, UserCheck } from 'lucide-react';
import { EmptyState } from '../molecules/EmptyState';
import { TrustedContact } from '../organisms/TrustedContact';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { HELPLINES } from '../utils/helplines';
import styles from './CrisisHelpPage.module.css';

/**
 * /auxilio-inmediato — funcional desde la Fase 1:
 * enlaces telefónicos reales y un recurso de regulación sin animaciones.
 * WhatsApp y profesionales verificados llegan en Fases 3–4.
 */
export function CrisisHelpPage() {
  useDocumentTitle('Ayuda SOS');
  const { lineaDeLaVida, emergencias } = HELPLINES;

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="sos-title">
      <h1 id="sos-title" className={styles.title}>
        Estás en un lugar seguro para pausar
      </h1>
      <p className={styles.intro}>
        No tienes que hacer nada de esto en orden. Elige solo lo que te sirva ahora.
      </p>

      <div className={styles.grid}>
        <div className={styles.calls}>
          <h2 className={styles.h2}>Hablar con alguien</h2>
          <a href={lineaDeLaVida.tel} className={styles.call}>
            <Phone aria-hidden="true" />
            <span>
              <strong>{lineaDeLaVida.name}</strong>
              <span className={styles.number}>{lineaDeLaVida.display}</span>
              <span className={styles.desc}>{lineaDeLaVida.description}</span>
            </span>
          </a>
          <a href={emergencias.tel} className={`${styles.call} ${styles.emergency}`}>
            <Siren aria-hidden="true" />
            <span>
              <strong>{emergencias.name}</strong>
              <span className={styles.number}>{emergencias.display}</span>
              <span className={styles.desc}>{emergencias.description}</span>
            </span>
          </a>
          <h2 className={`${styles.h2} ${styles.spaced}`}>Escribir a alguien de confianza</h2>
          <TrustedContact />

          <h2 className={`${styles.h2} ${styles.spaced}`}>Profesionales verificados</h2>
          <EmptyState icon={UserCheck} title="Aún no hay profesionales registrados">
            Solo publicaremos psicólogas y psicólogos con cédula profesional validada, y su
            disponibilidad real en ese momento. No inventamos contactos ni horarios.
          </EmptyState>
        </div>

        <div className={styles.ground}>
          <h2 className={styles.h2}>Respirar a tu ritmo</h2>
          <ol className={styles.steps}>
            <li>Si puedes, apoya la espalda o los pies en algo firme.</li>
            <li>Inhala por la nariz mientras cuentas hasta 4.</li>
            <li>Sostén el aire suavemente durante 4.</li>
            <li>Exhala despacio contando hasta 6.</li>
            <li>Repite las veces que quieras. No hay una forma correcta.</li>
          </ol>
          <h2 className={styles.h2}>Bajar el estímulo</h2>
          <ul className={styles.steps}>
            <li>Busca un muro, una sombra o una esquina con menos paso de gente.</li>
            <li>Usa audífonos o tapones si los llevas contigo.</li>
            <li>Baja el brillo de tu pantalla o mira un punto fijo cercano.</li>
          </ul>
        </div>
      </div>

      <p className={styles.disclaimer}>
        NEURONOTE no sustituye atención médica, psicológica ni servicios de emergencia. No guardamos
        conversaciones.
      </p>
    </section>
  );
}

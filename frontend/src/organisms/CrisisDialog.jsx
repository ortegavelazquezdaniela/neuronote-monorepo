import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Phone, Siren, X } from 'lucide-react';
import { HELPLINES } from '../utils/helplines';
import { TrustedContact } from './TrustedContact';
import styles from './CrisisDialog.module.css';

/**
 * Modal SOS con <dialog> nativo: atrapa el foco, se cierra con Escape y
 * devuelve el foco al elemento que lo abrió. Sin animación: en una crisis
 * la respuesta debe ser inmediata (y se abre también por teclado).
 *
 * Privacidad: no registra nada. La telemetría anónima (Fase 4) solo guardará
 * hora y condiciones del entorno, nunca datos personales ni conversaciones.
 */
export function CrisisDialog({ open, onClose }) {
  const ref = useRef(null);
  const headingRef = useRef(null);
  const { lineaDeLaVida, emergencias } = HELPLINES;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      headingRef.current?.focus(); // foco en el título: evita activar una llamada por accidente
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="sos-dialog-title"
      aria-describedby="sos-dialog-desc"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="sos-dialog-title" ref={headingRef} tabIndex={-1} className={styles.title}>
            Estás aquí. Vamos un paso a la vez.
          </h2>
          <button type="button" className={styles.close} onClick={onClose}>
            <X aria-hidden="true" />
            <span>Cerrar</span>
          </button>
        </header>
        <p id="sos-dialog-desc" className={styles.desc}>
          Elige solo lo que te sirva. Puedes cerrar esta ventana cuando quieras con Escape.
        </p>

        <div className={styles.calls}>
          <a href={lineaDeLaVida.tel} className={styles.call}>
            <Phone aria-hidden="true" />
            <span>
              <strong>Llamar a la {lineaDeLaVida.name}</strong>
              <span className={styles.number}>{lineaDeLaVida.display}</span>
              <span className={styles.small}>Gratuita y confidencial, 24 horas.</span>
            </span>
          </a>
          <a href={emergencias.tel} className={`${styles.call} ${styles.emergency}`}>
            <Siren aria-hidden="true" />
            <span>
              <strong>Emergencias</strong>
              <span className={styles.number}>{emergencias.display}</span>
              <span className={styles.small}>Si hay riesgo inmediato para tu vida.</span>
            </span>
          </a>
        </div>

        <section className={styles.breathe} aria-labelledby="sos-breathe">
          <h3 id="sos-breathe" className={styles.h3}>
            Si quieres, respira a tu ritmo
          </h3>
          <ol>
            <li>Inhala por la nariz contando hasta 4.</li>
            <li>Sostén el aire suavemente durante 4.</li>
            <li>Exhala despacio contando hasta 6.</li>
          </ol>
        </section>

        <section className={styles.whatsapp} aria-labelledby="sos-wa">
          <h3 id="sos-wa" className={styles.h3}>
            Escribir a alguien de confianza
          </h3>
          {open && <TrustedContact compact />}
        </section>

        <p className={styles.note}>
          Profesionales verificados por WhatsApp: todavía no hay psicólogas o psicólogos con cédula
          validada en NEURONOTE. No mostramos disponibilidad que no podamos confirmar.
        </p>

        <Link to="/auxilio-inmediato" className={styles.more} onClick={onClose}>
          Ver todos los recursos de regulación
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </dialog>
  );
}

import { MessageCircle, UserCheck } from 'lucide-react';
import { EmptyState } from '../molecules/EmptyState';
import { usePsychologist } from '../hooks/usePsychologist';
import { buildWhatsAppLink } from '../utils/whatsapp';
import styles from './PsychologistList.module.css';

const PRO_MESSAGE =
  'Hola, estoy usando NEURONOTE y experimento una crisis de sobrecarga/ansiedad. Requiero contención psicológica.';

/** Profesionales con cédula verificada; "en línea" se actualiza en tiempo real. */
/** hideWhenEmpty: no muestra nada (ni el encabezado `heading`) si aún no hay profesionales verificados. */
export function PsychologistList({ hideWhenEmpty = false, heading = null }) {
  const { items, status, enabled, live } = usePsychologist();

  if (!enabled || status === 'error' || (status === 'success' && items.length === 0)) {
    if (hideWhenEmpty) return null;
    return (
      <EmptyState icon={UserCheck} title="Aún no hay profesionales verificados">
        Solo publicaremos psicólogas y psicólogos con cédula profesional validada, y su disponibilidad
        real en ese momento. No inventamos contactos ni horarios.
      </EmptyState>
    );
  }
  if (status !== 'success') return hideWhenEmpty ? null : <p role="status">Buscando profesionales disponibles…</p>;

  return (
    <>
      {heading}
      <ul className={styles.list}>
        {items.map((p) => (
          <li key={p.id} className={styles.card}>
            <div>
              <p className={styles.name}>{p.displayName}</p>
              {p.specialty && <p className={styles.meta}>{p.specialty}</p>}
              <p className={`${styles.status} ${p.online ? styles.on : ''}`}>
                <span aria-hidden="true" /> {p.online ? 'En línea ahora' : 'No disponible en este momento'}
              </p>
            </div>
            {p.whatsapp && (
              <a className={styles.wa} href={buildWhatsAppLink('', p.whatsapp, PRO_MESSAGE)} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" /> Escribir por WhatsApp
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className={styles.meta} aria-live="polite">
        {live ? 'La disponibilidad se actualiza en tiempo real.' : 'Disponibilidad al cargar la página.'}
      </p>
    </>
  );
}

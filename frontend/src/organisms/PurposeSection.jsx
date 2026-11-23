import styles from './PurposeSection.module.css';

const PRINCIPLES = [
  {
    title: 'Adaptar la ciudad, no a las personas',
    text: 'NEURONOTE no busca corregir ni normalizar la neurodivergencia. Ofrece herramientas para que cada quien ajuste su recorrido a lo que necesita.',
  },
  {
    title: 'Datos honestos',
    text: 'Distinguimos lo medido, lo estimado y lo reportado. Si no sabemos algo, lo decimos. Ninguna ruta es tranquila para todas las sensibilidades.',
  },
  {
    title: 'Tu información es tuya',
    text: 'Pedimos permiso antes de usar tu ubicación, no guardamos conversaciones y la telemetría es anónima. Puedes borrar tus datos cuando quieras.',
  },
  {
    title: 'Acompañamiento, no sustitución',
    text: 'La plataforma complementa, pero no reemplaza, la atención médica, psicológica o los servicios de emergencia.',
  },
];

export function PurposeSection() {
  return (
    <section className={styles.section} aria-labelledby="proposito-title" id="proposito">
      <div className="wrap">
        <h2 id="proposito-title" className="visually-hidden">
          Nuestro propósito
        </h2>
        <blockquote className={styles.quote}>
          <p>Un espacio donde moverte por el mundo no tenga que significar sobrecargarte.</p>
        </blockquote>

        <ul className={styles.principles}>
          {PRINCIPLES.map((p) => (
            <li key={p.title}>
              <h3 className={styles.pTitle}>{p.title}</h3>
              <p className={styles.pText}>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

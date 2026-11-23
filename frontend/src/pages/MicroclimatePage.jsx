import { LocationControl } from '../molecules/LocationControl';
import { MicroclimatePanel } from '../organisms/MicroclimatePanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGeolocation } from '../hooks/useGeolocation';
import { DEFAULT_CENTER } from '../utils/geo';
import styles from './SectionPage.module.css';

export function MicroclimatePage() {
  useDocumentTitle('Microclima');
  const geo = useGeolocation();
  const point = geo.position ?? DEFAULT_CENTER;

  return (
    <section className="wrap" style={{ paddingBlock: 'var(--space-8) var(--space-section)' }} aria-labelledby="mc-title">
      <h1 id="mc-title" className={styles.title}>
        Microclima
        <span className={styles.en} lang="en">
          Microclimate
        </span>
      </h1>
      <p className={styles.intro}>
        Temperatura, presión barométrica y radiación UV de las últimas 6 horas y las próximas 18,
        para decidir cuándo y por dónde salir.
      </p>
      <div style={{ display: 'grid', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <LocationControl geo={geo} />
        <MicroclimatePanel point={point} placeLabel={geo.position ? 'Tu zona' : DEFAULT_CENTER.label} />
      </div>
    </section>
  );
}

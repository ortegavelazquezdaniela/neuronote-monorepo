import { lazy, Suspense, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { ArrowRight } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge, DATA_KINDS } from '../atoms/DataBadge';
import { LayerToggle } from '../molecules/LayerToggle';
import { LocationControl } from '../molecules/LocationControl';
import { useGeolocation } from '../hooks/useGeolocation';
import { useHavens } from '../hooks/useDataHooks';
import { DEFAULT_CENTER } from '../utils/geo';
import styles from './MapPreview.module.css';

// Leaflet (~150 kB) se descarga solo cuando esta sección se acerca a la pantalla
const MapViewLeaflet = lazy(() => import('./MapViewLeaflet').then((m) => ({ default: m.MapViewLeaflet })));

/**
 * Vista previa del mapa real (Leaflet + OpenStreetMap) en la página principal.
 * El mapa y los lugares solo se cargan cuando la sección entra en pantalla.
 */
export function MapPreview() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);
  const geo = useGeolocation();
  const [showHavens, setShowHavens] = useState(true);
  const point = geo.position ?? DEFAULT_CENTER;
  const havens = useHavens(point, 1200, inView);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="mapa-title" id="mapa-preview">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copy}>
          <h2 id="mapa-title" className={styles.title}>
            Un mapa que te dice de dónde viene cada dato
          </h2>
          <p className={styles.text}>
            Activa solo las capas que te sirvan. Menos información en pantalla también es una
            preferencia válida.
          </p>

          <div className={styles.toggles} role="group" aria-label="Capas del mapa">
            <LayerToggle swatch="havens" pressed={showHavens} onToggle={() => setShowHavens((v) => !v)}>
              Oasis candidatos
            </LayerToggle>
          </div>

          <h3 className={styles.legendTitle}>Procedencia de los datos</h3>
          <dl className={styles.legend}>
            {Object.entries(DATA_KINDS).map(([kind, k]) => (
              <div key={kind} className={styles.legendRow}>
                <dt>
                  <DataBadge kind={kind} />
                </dt>
                <dd>{k.title}.</dd>
              </div>
            ))}
          </dl>

          <div className={styles.location}>
            <LocationControl geo={geo} />
          </div>

          <Button to="/mapa" icon={ArrowRight} className={styles.cta}>
            Explorar el mapa
          </Button>
        </div>

        <div className={styles.visual}>
          <div className={styles.frame}>
            {inView && (
              <Suspense fallback={<p className={styles.mapLoading}>Cargando el mapa…</p>}>
                <MapViewLeaflet
                  center={point}
                  zoom={15}
                  havens={showHavens ? havens.data ?? [] : []}
                  user={geo.position}
                  label="Vista previa del mapa con oasis sensoriales candidatos"
                />
              </Suspense>
            )}
          </div>
          {havens.status === 'error' && (
            <p className={styles.mapNote} role="status">
              No pudimos cargar los lugares en este momento; el mapa sigue disponible.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

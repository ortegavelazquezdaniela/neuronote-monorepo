import { useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge, DATA_KINDS } from '../atoms/DataBadge';
import { LayerToggle } from '../molecules/LayerToggle';
import { CityMap } from './CityMap';
import styles from './MapPreview.module.css';

const LAYERS = [
  { id: 'routes', label: 'Rutas' },
  { id: 'havens', label: 'Oasis' },
  { id: 'climate', label: 'Zonas cálidas' },
];

/**
 * Vista previa del mapa.
 * Fase 1: mapa esquemático con capas conmutables (funcionales).
 * Fase 3: se sustituye <CityMap> por <MapViewLeaflet> con OpenStreetMap,
 * ubicación del usuario (con consentimiento) y datos de Open-Meteo.
 */
export function MapPreview() {
  const [layers, setLayers] = useState({ routes: true, havens: true, climate: true });
  const toggle = (id) => setLayers((l) => ({ ...l, [id]: !l[id] }));

  return (
    <section className={styles.section} aria-labelledby="mapa-title" id="mapa-preview">
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
            {LAYERS.map((l) => (
              <LayerToggle
                key={l.id}
                swatch={l.id}
                pressed={layers[l.id]}
                onToggle={() => toggle(l.id)}
              >
                {l.label}
              </LayerToggle>
            ))}
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

          <p className={styles.privacy}>
            <MapPin aria-hidden="true" />
            Tu ubicación solo se usa si la autorizas, y nunca se guarda sin tu permiso.
          </p>

          <Button to="/mapa" icon={ArrowRight} className={styles.cta}>
            Explorar el mapa
          </Button>
        </div>

        <div className={styles.visual}>
          <div className={styles.frame}>
            <CityMap layers={layers} title="Mapa esquemático con capas de rutas, oasis y zonas cálidas" />
            <DataBadge kind="demo" className={styles.demoBadge} />
          </div>
        </div>
      </div>
    </section>
  );
}

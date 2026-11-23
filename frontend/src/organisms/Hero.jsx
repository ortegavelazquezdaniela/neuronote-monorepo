import { ArrowRight, Thermometer } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge } from '../atoms/DataBadge';
import { RouteCompare } from '../molecules/RouteCompare';
import { CityMap } from './CityMap';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.title} lang="en" data-enter style={{ '--enter-i': 0 }}>
            Find your calm.
            <br />
            <span className={styles.second}>Find your way.</span>
          </h1>
          <p className={styles.lead} lang="en" data-enter style={{ '--enter-i': 1 }}>
            Discover quieter routes, calming spaces and a more comfortable way to experience the city.
          </p>
          <p className={styles.leadEs} data-enter style={{ '--enter-i': 2 }}>
            Rutas peatonales con menos ruido, calor y aglomeración, elegidas según tus propias
            preferencias sensoriales.
          </p>
          <div className={styles.actions} data-enter style={{ '--enter-i': 3 }}>
            <Button to="/rutas" size="lg" icon={ArrowRight} lang="en">
              Explore sensory routes
            </Button>
            <Button to="/oasis" size="lg" variant="secondary" lang="en">
              Discover calm spaces
            </Button>
          </div>
        </div>

        <div className={styles.visual} data-enter style={{ '--enter-i': 2 }}>
          <div className={styles.mapFrame}>
            <CityMap title="Vista de demostración: ruta directa frente a ruta de calma" />
            <div className={styles.climateChip}>
              <Thermometer aria-hidden="true" />
              <span>
                <strong>Avenida</strong> más cálida
              </span>
              <DataBadge kind="estimated" />
            </div>
          </div>
          <div className={styles.compare}>
            <RouteCompare />
          </div>
        </div>
      </div>
    </section>
  );
}

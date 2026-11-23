import { useParams } from 'react-router';
import { Accessibility, ArrowLeft, Clock, ExternalLink, Route } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge } from '../atoms/DataBadge';
import { StatusMessage } from '../atoms/StatusMessage';
import { MapViewLeaflet } from '../organisms/MapViewLeaflet';
import { MicroclimatePanel } from '../organisms/MicroclimatePanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useHaven } from '../hooks/useDataHooks';
import { HAVEN_TYPES } from '../utils/havenTypes';
import { describeError } from '../services/http';
import styles from './HavenDetailPage.module.css';

const WHEELCHAIR = {
  yes: 'Accesible en silla de ruedas',
  limited: 'Accesibilidad limitada',
  no: 'Sin acceso en silla de ruedas',
};

/** Solo enlaces http(s): evita esquemas peligrosos en datos de terceros. */
const safeUrl = (url) => (/^https?:\/\//i.test(url ?? '') ? url : null);

export function HavenDetailPage() {
  const { id } = useParams();
  const query = useHaven(id);
  const haven = query.data;
  useDocumentTitle(haven?.name ?? 'Oasis sensorial');

  if (query.status === 'loading') {
    return (
      <p className={`wrap ${styles.state}`} role="status">
        Cargando la ficha del lugar…
      </p>
    );
  }

  if (query.status === 'error') {
    const notFound = query.error?.status === 404;
    return (
      <section className={`wrap ${styles.state}`}>
        <StatusMessage tone="error" title={notFound ? 'No encontramos este lugar' : 'No pudimos cargar la ficha'}>
          <p>{notFound ? 'Puede que se haya eliminado de OpenStreetMap.' : describeError(query.error)}</p>
        </StatusMessage>
        <Button to="/oasis" variant="secondary" icon={ArrowLeft} iconPosition="start">
          Volver a los oasis
        </Button>
      </section>
    );
  }

  const website = safeUrl(haven.website);
  const routeLink = `/rutas?to=${haven.lat.toFixed(5)},${haven.lon.toFixed(5)}&name=${encodeURIComponent(haven.name)}`;

  return (
    <article className={`wrap ${styles.page}`} aria-labelledby="haven-title">
      <Button to="/oasis" variant="ghost" size="sm" icon={ArrowLeft} iconPosition="start">
        Todos los oasis
      </Button>

      <header className={styles.header}>
        <p className={styles.type}>{HAVEN_TYPES[haven.type]?.label ?? 'Lugar público'}</p>
        <h1 id="haven-title" className={styles.title}>
          {haven.name}
        </h1>
        <DataBadge kind="unverified" />
      </header>

      <div className={styles.grid}>
        <div className={styles.info}>
          <dl className={styles.facts}>
            {haven.address && (
              <div>
                <dt>Dirección</dt>
                <dd>{haven.address}</dd>
              </div>
            )}
            <div>
              <dt>
                <Clock aria-hidden="true" /> Horario
              </dt>
              <dd>{haven.openingHours ?? 'No registrado en OpenStreetMap'}</dd>
            </div>
            <div>
              <dt>
                <Accessibility aria-hidden="true" /> Accesibilidad
              </dt>
              <dd>{WHEELCHAIR[haven.wheelchair] ?? 'Sin información'}</dd>
            </div>
            <div>
              <dt>Características ambientales</dt>
              <dd>Sin documentar todavía (ruido, luz, aforo).</dd>
            </div>
            <div>
              <dt>Nivel de confort</dt>
              <dd>Sin auditoría. Se calculará con el Índice de Confort Acústico y Sensorial (Fase 4).</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Button to={routeLink} icon={Route} iconPosition="start">
              Planear ruta hasta aquí
            </Button>
            {website && (
              <Button href={website} variant="secondary" icon={ExternalLink} target="_blank" rel="noopener noreferrer">
                Sitio web
              </Button>
            )}
          </div>

          <p className={styles.source}>
            Fuente:{' '}
            <a href={haven.osmUrl} target="_blank" rel="noopener noreferrer">
              OpenStreetMap
            </a>{' '}
            (ODbL). Si algún dato está mal, puedes corregirlo ahí.
          </p>

          <section aria-labelledby="haven-climate" className={styles.climate}>
            <h2 id="haven-climate" className={styles.h2}>
              Clima en la zona
            </h2>
            <MicroclimatePanel point={haven} compact />
          </section>
        </div>

        <div className={styles.map}>
          <MapViewLeaflet
            center={haven}
            zoom={16}
            havens={[haven]}
            selectedHavenId={haven.id}
            label={`Ubicación de ${haven.name}`}
          />
        </div>
      </div>
    </article>
  );
}

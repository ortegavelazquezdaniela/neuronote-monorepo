import { useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, LocateFixed, MapPin, Phone, Route, Stethoscope } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge } from '../atoms/DataBadge';
import { StatusMessage } from '../atoms/StatusMessage';
import { EmptyState } from '../molecules/EmptyState';
import { useAsync } from '../hooks/useAsync';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyClinics, mapsSearchUrl } from '../services/clinics';
import { describeError } from '../services/http';
import { DEFAULT_CENTER, formatDistance } from '../utils/geo';
import styles from './NearbyClinics.module.css';

/**
 * Clínicas y servicios de salud mental cercanos (OpenStreetMap).
 * La ubicación se pide solo al pulsar el botón y no se guarda.
 * Nada se presenta como recomendación: son lugares reales sin verificar.
 */
export function NearbyClinics() {
  const geo = useGeolocation();
  const [useCenter, setUseCenter] = useState(false);
  const point = geo.position ?? (useCenter ? DEFAULT_CENTER : null);
  const key = point ? `${point.lat.toFixed(2)},${point.lon.toFixed(2)}` : null;
  const q = useAsync((signal) => getNearbyClinics(point, { signal }), [key], { enabled: !!point });
  const placeLabel = geo.position ? 'tu ubicación' : DEFAULT_CENTER.label;

  if (!point) {
    return (
      <div className={styles.ask}>
        <p>
          Para mostrarte clínicas y consultorios de salud mental cercanos necesitamos tu ubicación. Solo se usa
          mientras esta pestaña esté abierta y no se guarda.
        </p>
        <div className={styles.actions}>
          <Button
            size="sm"
            icon={LocateFixed}
            iconPosition="start"
            onClick={geo.request}
            disabled={geo.status === 'asking'}
          >
            {geo.status === 'asking' ? 'Esperando tu permiso…' : 'Buscar cerca de mí'}
          </Button>
          <Button size="sm" variant="ghost" icon={MapPin} iconPosition="start" onClick={() => setUseCenter(true)}>
            Buscar en {DEFAULT_CENTER.label}
          </Button>
        </div>
        {(geo.status === 'denied' || geo.status === 'unavailable') && (
          <StatusMessage tone="info" title="No pudimos usar tu ubicación">
            Puedes buscar en {DEFAULT_CENTER.label} o abrir la búsqueda en tu app de mapas.
          </StatusMessage>
        )}
      </div>
    );
  }

  const more = (
    <p className={styles.more}>
      <a href={mapsSearchUrl(point)} target="_blank" rel="noopener noreferrer">
        Buscar más clínicas en Google Maps <ExternalLink aria-hidden="true" />
        {' '}
                <span className="visually-hidden">(se abre en otra pestaña)</span>
      </a>
      <span className={styles.note}> Google recibirá tu zona aproximada (~1 km).</span>
    </p>
  );

  if (q.status === 'loading' || q.status === 'idle') {
    return <p role="status">Buscando clínicas cerca de {placeLabel}…</p>;
  }

  if (q.status === 'error') {
    return (
      <>
        <StatusMessage tone="error" title="No pudimos consultar OpenStreetMap">
          {describeError(q.error)}
        </StatusMessage>
        <Button size="sm" variant="secondary" onClick={q.retry} className={styles.retry}>
          Intentar de nuevo
        </Button>
        {more}
      </>
    );
  }

  const { items, stale, fetchedAt } = q.data;

  if (items.length === 0) {
    return (
      <>
        <EmptyState icon={Stethoscope} title="No encontramos clínicas registradas cerca">
          OpenStreetMap todavía tiene pocos servicios de salud mental registrados. Eso no significa que no
          existan: prueba la búsqueda en tu app de mapas o llama a la Línea de la Vida.
        </EmptyState>
        {more}
      </>
    );
  }

  return (
    <>
      <p className={styles.source} aria-live="polite">
        {items.length} {items.length === 1 ? 'lugar' : 'lugares'} a menos de 10 km de {placeLabel}, según
        OpenStreetMap. Confirma por teléfono el horario y el tipo de atención antes de ir.
        {stale &&
          ` OpenStreetMap no respondió: es la última búsqueda guardada en este navegador (${new Date(fetchedAt).toLocaleDateString('es-MX')}).`}
      </p>
      <ul className={styles.list}>
        {items.map((c) => (
          <li key={c.id} className={styles.card}>
            <div className={styles.head}>
              <h3 className={styles.name}>{c.name}</h3>
              <DataBadge kind="unverified" />
            </div>
            <p className={styles.meta}>
              {c.kind} · a {formatDistance(c.distance)}
              {c.address ? ` · ${c.address}` : ''}
            </p>
            {c.openingHours && <p className={styles.meta}>Horario registrado: {c.openingHours}</p>}
            <div className={styles.actions}>
              {c.phoneHref && (
                <a className={styles.link} href={c.phoneHref}>
                  <Phone aria-hidden="true" /> Llamar
                  {' '}
                <span className="visually-hidden">a {c.name}</span>
                </a>
              )}
              <Link
                className={styles.link}
                to={`/rutas?to=${c.lat.toFixed(5)},${c.lon.toFixed(5)}&name=${encodeURIComponent(c.name)}`}
              >
                <Route aria-hidden="true" /> Cómo llegar
                {' '}
                <span className="visually-hidden">a {c.name}</span>
              </Link>
              <a className={styles.link} href={c.osmUrl} target="_blank" rel="noopener noreferrer">
                Ver en OpenStreetMap
                {' '}
                <span className="visually-hidden">(se abre en otra pestaña)</span>
              </a>
            </div>
          </li>
        ))}
      </ul>
      {more}
    </>
  );
}

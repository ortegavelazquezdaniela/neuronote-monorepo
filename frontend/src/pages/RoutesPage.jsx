import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LocateFixed, MapPin, RotateCcw, Route } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatusMessage } from '../atoms/StatusMessage';
import { ChoiceGroup } from '../molecules/ChoiceGroup';
import { EmptyState } from '../molecules/EmptyState';
import { PanelSection } from '../molecules/PanelSection';
import { MapViewLeaflet } from '../organisms/MapViewLeaflet';
import { RouteOptions } from '../organisms/RouteOptions';
import { SensoryDashboardLayout } from '../templates/SensoryDashboardLayout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGeolocation } from '../hooks/useGeolocation';
import { useHavens, useSensoryRoute } from '../hooks/useDataHooks';
import { describeError } from '../services/http';
import { DEFAULT_CENTER, distanceMeters } from '../utils/geo';
import { enrichRoutes, sortRoutes } from '../utils/routeScoring';
import styles from './RoutesPage.module.css';

const PRIORITIES = [
  { value: 'calm', label: 'Más tranquila', description: 'Cerca de parques y bibliotecas' },
  { value: 'fast', label: 'Más rápida', description: 'Menor tiempo a pie' },
];

/** Lee ?to=lat,lon&name=... (enlace "Planear ruta hasta aquí" de un oasis). */
function parseTarget(params) {
  const [lat, lon] = (params.get('to') ?? '').split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, name: params.get('name')?.slice(0, 80) ?? 'Destino' };
}

export function RoutesPage() {
  useDocumentTitle('Rutas de calma');
  const [params] = useSearchParams();
  const geo = useGeolocation();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(() => parseTarget(params));
  const [picking, setPicking] = useState(() => (parseTarget(params) ? 'origin' : 'destination'));
  const [priority, setPriority] = useState('calm');
  const [selectedId, setSelectedId] = useState(null);

  const from = origin ?? geo.position ?? DEFAULT_CENTER;
  const fromLabel = origin ? 'Punto elegido en el mapa' : geo.position ? 'Tu ubicación' : DEFAULT_CENTER.label;

  const tooFar = destination && distanceMeters(from, destination) > 12_000;
  const routeQuery = useSensoryRoute(tooFar ? null : from, tooFar ? null : destination);
  const havensQuery = useHavens(from, 2500);

  const routes = useMemo(
    () => sortRoutes(enrichRoutes(routeQuery.data ?? [], havensQuery.data ?? []), priority),
    [routeQuery.data, havensQuery.data, priority],
  );
  const activeId = routes.some((r) => r.id === selectedId) ? selectedId : routes[0]?.id ?? null;

  const handleMapClick = (pt) => {
    if (picking === 'origin') {
      setOrigin(pt);
      setPicking('destination');
    } else {
      setDestination({ ...pt, name: 'Punto elegido en el mapa' });
    }
    setSelectedId(null);
  };

  return (
    <SensoryDashboardLayout
      title="Rutas de calma"
      englishName="Sensory Routes"
      intro="Compara caminos a pie según su tiempo y qué tan cerca pasan de lugares tranquilos. Ninguna ruta es tranquila para todas las personas: tú decides."
      map={
        <MapViewLeaflet
          center={destination ?? from}
          zoom={14}
          routes={routes}
          selectedRouteId={activeId}
          onSelectRoute={setSelectedId}
          origin={from}
          destination={destination}
          user={geo.position}
          onMapClick={handleMapClick}
          label="Mapa para elegir origen y destino de la ruta"
        />
      }
      panel={
        <>
          <PanelSection id="route-points" title="Origen y destino">
            <ol className={styles.points}>
              <li className={picking === 'origin' ? styles.active : ''}>
                <span className={styles.pin}>A</span>
                <div>
                  <p className={styles.pointLabel}>Origen</p>
                  <p className={styles.pointValue}>{fromLabel}</p>
                  <div className={styles.pointActions}>
                    {geo.status !== 'granted' && (
                      <Button size="sm" variant="secondary" icon={LocateFixed} iconPosition="start" onClick={geo.request}>
                        Usar mi ubicación
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={MapPin}
                      iconPosition="start"
                      aria-pressed={picking === 'origin'}
                      onClick={() => setPicking('origin')}
                    >
                      Elegir en el mapa
                    </Button>
                  </div>
                </div>
              </li>
              <li className={picking === 'destination' ? styles.active : ''}>
                <span className={`${styles.pin} ${styles.pinB}`}>B</span>
                <div>
                  <p className={styles.pointLabel}>Destino</p>
                  <p className={styles.pointValue}>{destination ? destination.name : 'Haz clic en el mapa'}</p>
                  <div className={styles.pointActions}>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={MapPin}
                      iconPosition="start"
                      aria-pressed={picking === 'destination'}
                      onClick={() => setPicking('destination')}
                    >
                      Elegir en el mapa
                    </Button>
                  </div>
                </div>
              </li>
            </ol>
            <p className={styles.hint} role="status">
              {picking === 'origin' ? 'Haz clic en el mapa para marcar el origen.' : 'Haz clic en el mapa para marcar el destino.'}
            </p>
            {geo.status === 'denied' && (
              <StatusMessage tone="info" title="No compartiste tu ubicación">
                Puedes marcar el origen haciendo clic en el mapa.
              </StatusMessage>
            )}
          </PanelSection>

          <PanelSection id="route-priority" title="¿Qué prefieres hoy?">
            <ChoiceGroup
              legend="Prioridad de la ruta"
              name="priority"
              variant="segmented"
              options={PRIORITIES}
              value={priority}
              onChange={setPriority}
            />
          </PanelSection>

          <PanelSection id="route-results" title="Rutas">
            {!destination && (
              <EmptyState icon={Route} title="Elige un destino">
                Haz clic en el mapa o abre la ficha de un oasis y pulsa «Planear ruta hasta aquí».
              </EmptyState>
            )}
            {tooFar && (
              <StatusMessage tone="info" title="El destino está a más de 12 km">
                Para recorridos largos a pie, elige un destino más cercano o divide el trayecto.
              </StatusMessage>
            )}
            {destination && !tooFar && routeQuery.status === 'loading' && (
              <p role="status" className={styles.hint}>
                Calculando rutas a pie…
              </p>
            )}
            {routeQuery.status === 'error' && (
              <StatusMessage tone="error" title="No pudimos calcular la ruta">
                <p>{describeError(routeQuery.error)}</p>
                <Button size="sm" variant="secondary" icon={RotateCcw} iconPosition="start" onClick={routeQuery.retry}>
                  Intentar de nuevo
                </Button>
              </StatusMessage>
            )}
            {routeQuery.status === 'success' && routes.length === 0 && (
              <EmptyState icon={Route} title="No encontramos un camino a pie">
                Prueba con puntos sobre calles o banquetas.
              </EmptyState>
            )}
            {routes.length > 0 && (
              <RouteOptions
                routes={routes}
                selectedId={activeId}
                onSelect={setSelectedId}
                priority={priority}
                calmAvailable={havensQuery.status === 'success'}
              />
            )}
            {havensQuery.status === 'loading' && routes.length > 0 && (
              <p className={styles.hint} role="status">
                Buscando lugares tranquilos cerca de las rutas…
              </p>
            )}
            {havensQuery.status === 'error' && routes.length > 0 && (
              <p className={styles.hint}>
                OpenStreetMap no respondió con los lugares tranquilos: por ahora la comparación usa solo
                distancia y tiempo.{' '}
                <button type="button" className={styles.linkBtn} onClick={havensQuery.retry}>
                  Intentar de nuevo
                </button>
              </p>
            )}
            <p className={styles.small}>
              Rutas calculadas con OSRM sobre OpenStreetMap (servidor de FOSSGIS). Revisa siempre las
              condiciones reales del camino.
            </p>
          </PanelSection>
        </>
      }
    />
  );
}

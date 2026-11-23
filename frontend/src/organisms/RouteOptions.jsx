import { DataBadge } from '../atoms/DataBadge';
import { formatDistance, formatDuration } from '../utils/geo';
import styles from './RouteOptions.module.css';

/**
 * Comparación honesta de rutas alternativas:
 * - Distancia y tiempo: calculados por OSRM sobre OpenStreetMap.
 * - Lugares tranquilos cercanos: ESTIMACIÓN (ver utils/routeScoring.js).
 * - Ruido: aún sin reportes comunitarios (llegan con el backend, Fase 4).
 */
export function RouteOptions({ routes, selectedId, onSelect, priority, calmAvailable = true }) {
  const firstTitle = priority === 'calm' && calmAvailable ? 'Más cerca de espacios tranquilos' : 'Más rápida';
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {routes.length === 1 ? 'Ruta encontrada' : `${routes.length} rutas encontradas`}
      </legend>
      {routes.map((r, i) => {
        const checked = r.id === selectedId;
        return (
          <label key={r.id} className={`${styles.option} ${checked ? styles.checked : ''}`}>
            <input
              type="radio"
              name="route"
              className={styles.input}
              checked={checked}
              onChange={() => onSelect(r.id)}
            />
            <span className={styles.body}>
              <span className={styles.title}>
                {i === 0 ? firstTitle : `Alternativa ${i}`}
                <span className={styles.time}>{formatDuration(r.duration)}</span>
              </span>
              <span className={styles.facts}>
                <span>
                  {formatDistance(r.distance)} a pie <DataBadge kind="real" />
                </span>
                <span>
                  {!calmAvailable
                    ? 'Lugares tranquilos cercanos: sin datos en este momento'
                    : r.calm === 0
                      ? 'Sin parques ni bibliotecas cerca del trayecto'
                      : `Pasa cerca de ${r.calm} ${r.calm === 1 ? 'lugar tranquilo' : 'lugares tranquilos'}`}{' '}
                  {calmAvailable && <DataBadge kind="estimated" />}
                </span>
                <span>
                  Ruido: aún sin reportes de la comunidad <DataBadge kind="reported" />
                </span>
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

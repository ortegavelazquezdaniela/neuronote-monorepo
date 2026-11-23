import { useId } from 'react';
import styles from './CityMap.module.css';

/**
 * Mapa esquemático de una ciudad (SVG propio, sin datos reales).
 * Se usa en la Fase 1 para mostrar el concepto. En la Fase 3 la vista
 * previa se reemplaza por Leaflet + OpenStreetMap con datos verificables.
 *
 * Capas: `routes`, `havens`, `climate` (booleanos).
 */

const COLS = [
  [20, 76],
  [104, 196],
  [224, 316],
  [344, 436],
  [464, 580],
];
const ROWS = [
  [20, 76],
  [104, 186],
  [214, 296],
  [324, 396],
  [424, 460],
];

// Manzana fusionada que funciona como parque (columnas 2–3, fila 2)
const isPark = (c, r) => r === 2 && (c === 2 || c === 3);

const HAVENS = [
  { x: 270, y: 255, label: 'Parque' },
  { x: 404, y: 140, label: 'Biblioteca' },
  { x: 150, y: 360, label: 'Sala tranquila' },
];

export function CityMap({ layers = { routes: true, havens: true, climate: true }, title, className = '' }) {
  const id = useId();
  return (
    <svg
      className={`${styles.map} ${className}`}
      viewBox="0 0 600 480"
      role="img"
      aria-labelledby={`${id}-t ${id}-d`}
    >
      <title id={`${id}-t`}>{title ?? 'Mapa esquemático con dos rutas peatonales'}</title>
      <desc id={`${id}-d`}>
        Ilustración de demostración: una ruta directa por una avenida con más estímulo y una ruta de
        calma que atraviesa un parque, con tres oasis sensoriales de ejemplo.
      </desc>

      <rect width="600" height="480" className={styles.ground} />

      {/* Manzanas */}
      <g>
        {ROWS.map(([y1, y2], r) =>
          COLS.map(([x1, x2], c) => {
            if (isPark(c, r)) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={x1}
                y={y1}
                width={x2 - x1}
                height={y2 - y1}
                rx="6"
                className={styles.block}
              />
            );
          }),
        )}
        {/* Parque */}
        <rect x="224" y="214" width="212" height="82" rx="10" className={styles.park} />
        <path d="M236 290 C 270 280, 300 250, 330 222" className={styles.trail} />
        <circle cx="300" cy="244" r="7" className={styles.tree} />
        <circle cx="366" cy="262" r="9" className={styles.tree} />
        <circle cx="404" cy="236" r="6" className={styles.tree} />
        <circle cx="252" cy="236" r="6" className={styles.tree} />
      </g>

      {/* Avenida principal */}
      <rect x="0" y="190" width="600" height="20" className={styles.avenue} />
      <text x="548" y="204" className={styles.streetLabel} textAnchor="end">
        Avenida
      </text>

      {/* Capa: zonas de calor estimadas */}
      {layers.climate && (
        <g className={styles.climate}>
          <circle cx="470" cy="200" r="70" />
          <circle cx="520" cy="372" r="46" />
        </g>
      )}

      {/* Capa: rutas */}
      {layers.routes && (
        <g>
          <path d="M90 440 V200 H450 V90" className={styles.routeBusy} />
          <path
            d="M90 440 V410 H210 V300 C 250 290, 300 262, 330 210 V90 H450"
            className={styles.routeCalmHalo}
          />
          <path
            d="M90 440 V410 H210 V300 C 250 290, 300 262, 330 210 V90 H450"
            className={styles.routeCalm}
          />
        </g>
      )}

      {/* Capa: oasis sensoriales */}
      {layers.havens && (
        <g>
          {HAVENS.map((h) => (
            <g key={h.label} transform={`translate(${h.x} ${h.y})`}>
              <circle r="13" className={styles.havenRing} />
              <circle r="5" className={styles.havenDot} />
            </g>
          ))}
        </g>
      )}

      {/* Origen y destino */}
      <g transform="translate(90 440)">
        <circle r="11" className={styles.pinA} />
        <text y="4.5" textAnchor="middle" className={styles.pinText}>
          A
        </text>
      </g>
      <g transform="translate(450 90)">
        <circle r="11" className={styles.pinB} />
        <text y="4.5" textAnchor="middle" className={styles.pinTextLight}>
          B
        </text>
      </g>
    </svg>
  );
}

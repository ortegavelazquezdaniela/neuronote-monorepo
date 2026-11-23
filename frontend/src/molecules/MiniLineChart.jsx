import { useId, useMemo, useState } from 'react';
import styles from './MiniLineChart.module.css';

/**
 * Gráfico de línea pequeño (una sola serie, sin doble eje).
 * - Línea de 2 px, rejilla discreta, marca "Ahora".
 * - Interactivo: cursor o flechas del teclado muestran el valor de cada hora.
 * - Alternativa accesible: tabla con todos los valores.
 * - Sin animación de entrada.
 */
const W = 320;
const H = 132;
const PAD = { top: 12, right: 12, bottom: 24, left: 40 };

const hourLabel = (iso) => `${iso.slice(11, 13)} h`;

export function MiniLineChart({ title, data, unit, decimals = 1, nowTime }) {
  const id = useId();
  const [active, setActive] = useState(null);

  const { points, yTicks, xTicks, nowX, path } = useMemo(() => {
    const values = data.map((d) => d.value).filter((v) => v != null);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max - min < 1) {
      min -= 0.5;
      max += 0.5;
    }
    const pad = (max - min) * 0.12;
    min -= pad;
    max += pad;
    const x = (i) => PAD.left + (i / Math.max(1, data.length - 1)) * (W - PAD.left - PAD.right);
    const y = (v) => PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);
    const pts = data.map((d, i) => ({ ...d, x: x(i), y: d.value == null ? null : y(d.value) }));
    const nowIdx = nowTime ? data.findIndex((d) => d.time >= nowTime.slice(0, 13)) : -1;
    return {
      points: pts,
      path: pts
        .filter((p) => p.y != null)
        .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(''),
      yTicks: [min + pad, (min + max) / 2, max - pad].map((v) => ({ v, y: y(v) })),
      xTicks: pts.filter((_, i) => i % 6 === 0),
      nowX: nowIdx >= 0 ? x(nowIdx) : null,
    };
  }, [data, nowTime]);

  const fmt = (v) => (v == null ? '—' : `${v.toFixed(decimals).replace('.', ',')}${unit ? ` ${unit}` : ''}`);
  const current = active != null ? points[active] : null;

  const onPointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((rel - PAD.left) / (W - PAD.left - PAD.right)) * (data.length - 1));
    setActive(Math.min(data.length - 1, Math.max(0, i)));
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      setActive((a) => Math.min(data.length - 1, Math.max(0, (a ?? 0) + delta)));
    } else if (e.key === 'Escape') {
      setActive(null);
    }
  };

  return (
    <figure className={styles.figure}>
      <figcaption id={`${id}-t`} className={styles.title}>
        {title}
      </figcaption>
      <div className={styles.plot}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          role="img"
          aria-labelledby={`${id}-t`}
          aria-describedby={`${id}-hint`}
          tabIndex={0}
          onPointerMove={onPointer}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          {yTicks.map((t) => (
            <g key={t.v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} className={styles.grid} />
              <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" className={styles.axis}>
                {t.v.toFixed(decimals > 0 && Math.abs(t.v) < 10 ? 1 : 0).replace('.', ',')}
              </text>
            </g>
          ))}
          {xTicks.map((p) => (
            <text key={p.time} x={p.x} y={H - 6} textAnchor="middle" className={styles.axis}>
              {hourLabel(p.time)}
            </text>
          ))}
          {nowX != null && (
            <g>
              <line x1={nowX} x2={nowX} y1={PAD.top} y2={H - PAD.bottom} className={styles.now} />
              <text x={nowX + 4} y={PAD.top + 8} className={styles.nowLabel}>
                Ahora
              </text>
            </g>
          )}
          <path d={path} className={styles.line} />
          {current && current.y != null && (
            <g>
              <line x1={current.x} x2={current.x} y1={PAD.top} y2={H - PAD.bottom} className={styles.cross} />
              <circle cx={current.x} cy={current.y} r="4.5" className={styles.dot} />
            </g>
          )}
        </svg>
        {current && (
          <div
            className={styles.tooltip}
            style={{ left: `${(current.x / W) * 100}%` }}
            aria-hidden="true"
          >
            <strong>{fmt(current.value)}</strong>
            <span>{hourLabel(current.time)}</span>
          </div>
        )}
      </div>
      <p id={`${id}-hint`} className="visually-hidden">
        Usa las flechas izquierda y derecha para recorrer las horas.
      </p>
      <p className={styles.live} aria-live="polite">
        {current ? `${hourLabel(current.time)}: ${fmt(current.value)}` : ''}
      </p>
      <details className={styles.table}>
        <summary>Ver como tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Hora</th>
              <th scope="col">{title}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.time}>
                <td>{hourLabel(d.time)}</td>
                <td>{fmt(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

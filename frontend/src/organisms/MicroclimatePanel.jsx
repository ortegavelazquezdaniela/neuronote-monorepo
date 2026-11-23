import { CloudSun, RotateCcw } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge } from '../atoms/DataBadge';
import { StatusMessage } from '../atoms/StatusMessage';
import { MiniLineChart } from '../molecules/MiniLineChart';
import { useWeather } from '../hooks/useDataHooks';
import { describeError } from '../services/http';
import { WEATHER_CODES, uvCategory, pressureTrend } from '../services/openMeteo';
import styles from './MicroclimatePanel.module.css';

const num = (v, d = 0) => (v == null ? '—' : v.toFixed(d).replace('.', ','));

function trendText(delta) {
  if (delta == null) return 'Sin datos suficientes';
  if (Math.abs(delta) < 1) return 'Estable en las últimas 3 h';
  return `${delta > 0 ? 'Subió' : 'Bajó'} ${num(Math.abs(delta), 1)} hPa en 3 h`;
}

/**
 * Panel de microclima con datos de Open-Meteo.
 * `compact` muestra solo los valores actuales (vista previa y mapa).
 */
export function MicroclimatePanel({ point, placeLabel, compact = false }) {
  const weather = useWeather(point);

  if (weather.status === 'loading' || weather.status === 'idle') {
    return (
      <p className={styles.loading} role="status">
        Consultando el clima de la zona…
      </p>
    );
  }

  if (weather.status === 'error') {
    return (
      <StatusMessage tone="error" title="No pudimos consultar el clima">
        <p>{describeError(weather.error)} El resto de NEURONOTE sigue funcionando.</p>
        <Button size="sm" variant="secondary" icon={RotateCcw} iconPosition="start" onClick={weather.retry}>
          Intentar de nuevo
        </Button>
      </StatusMessage>
    );
  }

  const { current, hours } = weather.data;
  const delta = pressureTrend(hours, current.time);
  const uvCat = uvCategory(current.uv);

  return (
    <section className={`${styles.panel} ${compact ? styles.compact : ''}`} aria-label="Microclima">
      <header className={styles.head}>
        <p className={styles.place}>
          <CloudSun aria-hidden="true" />
          <span>
            {placeLabel && <strong>{placeLabel} · </strong>}
            {WEATHER_CODES[current.code] ?? 'Condición desconocida'}
          </span>
        </p>
        <DataBadge kind="forecast" />
      </header>

      <dl className={styles.stats}>
        <div className={styles.hero}>
          <dt>Temperatura</dt>
          <dd>
            {num(current.temperature)} °C
            <span className={styles.sub}>Sensación de {num(current.apparent)} °C</span>
          </dd>
        </div>
        <div>
          <dt>Presión</dt>
          <dd>
            {num(current.pressure)} hPa
            <span className={styles.sub}>{trendText(delta)}</span>
          </dd>
        </div>
        <div>
          <dt>Radiación UV</dt>
          <dd>
            {num(current.uv, 1)}
            <span className={styles.sub}>{uvCat ? `Nivel ${uvCat.toLowerCase()}` : 'Sin dato'}</span>
          </dd>
        </div>
        {!compact && (
          <>
            <div>
              <dt>Humedad</dt>
              <dd>{num(current.humidity)} %</dd>
            </div>
            <div>
              <dt>Viento</dt>
              <dd>{num(current.wind)} km/h</dd>
            </div>
          </>
        )}
      </dl>

      {!compact && (
        <div className={styles.charts}>
          <MiniLineChart
            title="Temperatura (°C)"
            unit="°C"
            data={hours.map((h) => ({ time: h.time, value: h.temperature }))}
            nowTime={current.time}
          />
          <MiniLineChart
            title="Presión superficial (hPa)"
            unit="hPa"
            decimals={0}
            data={hours.map((h) => ({ time: h.time, value: h.pressure }))}
            nowTime={current.time}
          />
          <MiniLineChart
            title="Índice UV"
            decimals={1}
            data={hours.map((h) => ({ time: h.time, value: h.uv }))}
            nowTime={current.time}
          />
        </div>
      )}

      <p className={styles.note}>
        Pronóstico de modelos meteorológicos para la zona (≈1 km), no medición de una estación. Es
        información ambiental: no es un diagnóstico médico ni predice migrañas.
      </p>
    </section>
  );
}

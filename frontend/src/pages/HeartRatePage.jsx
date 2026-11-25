import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Bluetooth, HeartPulse, PlayCircle, PowerOff, Siren, Vibrate } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge } from '../atoms/DataBadge';
import { StatusMessage } from '../atoms/StatusMessage';
import { Switch } from '../atoms/Switch';
import { TextField } from '../atoms/TextField';
import { ChoiceGroup } from '../molecules/ChoiceGroup';
import { useHeartRateMonitor } from '../hooks/useHeartRateMonitor';
import { usePageMeta } from '../hooks/usePageMeta';
import { sustainedAbove, canVibrate, vibrateOnce } from '../utils/heartRate';
import { HELPLINES } from '../utils/helplines';
import styles from './HeartRatePage.module.css';

const DURATIONS = [
  { value: '30', label: '30 segundos' },
  { value: '60', label: '1 minuto' },
  { value: '120', label: '2 minutos' },
];
const SNOOZE_MS = 5 * 60_000;
const durationText = (s) => DURATIONS.find((d) => d.value === String(s))?.label ?? `${s} s`;

/**
 * /pulso — Monitor de pulso (extensión experimental).
 * Avisa con calma cuando el pulso se mantiene por encima del umbral que la
 * persona eligió (idealmente con su médica o médico) y sugiere cómo regularse.
 * No es un dispositivo médico, no diagnostica y no guarda ni envía lecturas.
 */
export function HeartRatePage() {
  usePageMeta({
    title: 'Monitor de pulso',
    description:
      'Extensión experimental: conecta una banda o reloj que transmita tu pulso por Bluetooth y recibe un aviso tranquilo para tomar un descanso. No es un dispositivo médico.',
  });
  const { emergencias } = HELPLINES;
  const hr = useHeartRateMonitor();
  const [thresholdText, setThresholdText] = useState('');
  const [duration, setDuration] = useState('60');
  const [vibrate, setVibrate] = useState(false);
  const [vibrationTest, setVibrationTest] = useState(null);
  const [snoozedUntil, setSnoozedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const threshold = Number(thresholdText);
  const thresholdValid = Number.isInteger(threshold) && threshold >= 60 && threshold <= 200;
  const thresholdError =
    thresholdText && !thresholdValid ? 'Escribe un número entero entre 60 y 200 latidos por minuto.' : undefined;

  const live = hr.status === 'connected' || hr.status === 'demo';
  const lastT = hr.samples.at(-1)?.t ?? 0;
  const { sustained } = useMemo(
    () => (thresholdValid ? sustainedAbove(hr.samples, threshold, Number(duration), lastT) : { sustained: false }),
    [hr.samples, threshold, thresholdValid, duration, lastT],
  );
  // En la demostración el tiempo corre 4× más rápido: el reloj del aviso usa el tiempo de las lecturas
  const clock = hr.status === 'demo' ? lastT : now;
  const alerting = live && sustained && clock >= snoozedUntil;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  // Una vibración suave por cada aviso, solo si la persona lo activó. Si activa el
  // interruptor con el aviso ya en pantalla, también vibra (antes no lo hacía).
  const vibratedThisAlert = useRef(false);
  useEffect(() => {
    if (!alerting) {
      vibratedThisAlert.current = false;
      return;
    }
    if (vibrate && !vibratedThisAlert.current) {
      vibratedThisAlert.current = true;
      vibrateOnce();
    }
  }, [alerting, vibrate]);

  const testVibration = () =>
    setVibrationTest(
      vibrateOnce()
        ? 'Listo. Si no sentiste nada, revisa que tu celular no esté en silencio ni en «No molestar»: en esos modos el sistema no vibra.'
        : 'El navegador no permitió vibrar. Deja esta página a la vista (con la pantalla encendida) e inténtalo de nuevo.',
    );

  const recent = hr.samples.map((s) => s.bpm);
  const min = recent.length ? Math.min(...recent) : null;
  const max = recent.length ? Math.max(...recent) : null;

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="hr-title">
      <h1 id="hr-title" className={styles.title}>
        Monitor de pulso
        <span className={styles.en} lang="en">
          Heart Rate Monitor · experimental
        </span>
      </h1>
      <p className={styles.intro}>
        Si usas una banda o un reloj que transmite tu pulso por Bluetooth, NEURONOTE puede avisarte con calma cuando
        tu pulso se mantenga alto, para que hagas una pausa y te regules.
      </p>

      <div className={styles.safety} role="note">
        <p>
          <strong>NEURONOTE no es un dispositivo médico.</strong> No diagnostica, no detecta emergencias cardiacas y
          puede fallar si el sensor se desconecta. No cambies tu tratamiento por lo que veas aquí.
        </p>
        <p>
          Si sientes <strong>dolor u opresión en el pecho, falta de aire, mareo intenso o desmayo</strong>, llama ahora:
        </p>
        <a href={emergencias.tel} className={styles.call}>
          <Siren aria-hidden="true" /> {emergencias.name}: {emergencias.display}
        </a>
      </div>

      <div className={styles.grid}>
        <div className={styles.setup}>
          <h2 className={styles.h2}>1. Cuándo avisarte</h2>
          <TextField
            label="Avisarme si mi pulso pasa de (latidos por minuto)"
            hint="Pregúntale a tu médica o médico qué valor te conviene. Sin un valor no hay avisos."
            inputMode="numeric"
            value={thresholdText}
            onChange={(e) => setThresholdText(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
            error={thresholdError}
          />
          <ChoiceGroup
            legend="Durante al menos"
            name="duration"
            options={DURATIONS}
            value={duration}
            onChange={setDuration}
          />
          {canVibrate() ? (
            <div className={styles.vibration}>
              <Switch
                label="Vibrar al avisar"
                description="Dos pulsos cortos cuando aparece el aviso. Desactivado por defecto."
                checked={vibrate}
                onChange={setVibrate}
              />
              <Button size="sm" variant="ghost" icon={Vibrate} iconPosition="start" onClick={testVibration}>
                Probar vibración
              </Button>
              {vibrationTest && (
                <p className={styles.meta} role="status">
                  {vibrationTest}
                </p>
              )}
            </div>
          ) : (
            <p className={styles.meta}>
              Tu navegador no permite vibrar (por ejemplo, Safari en iPhone). El aviso se muestra en pantalla.
            </p>
          )}

          <h2 className={`${styles.h2} ${styles.spaced}`}>2. Conectar tu dispositivo</h2>
          {hr.status === 'unsupported' && (
            <StatusMessage tone="info" title="Tu navegador no puede conectarse por Bluetooth">
              Funciona en Chrome o Edge para Android y en computadoras. En iPhone no está disponible. Puedes probar cómo
              funciona con datos de demostración.
            </StatusMessage>
          )}
          {hr.error && (
            <StatusMessage tone="error" title="No se pudo conectar">
              {hr.error}
            </StatusMessage>
          )}
          {hr.status === 'disconnected' && (
            <StatusMessage tone="error" title="Se perdió la conexión">
              El dispositivo se desconectó, así que no hay lecturas ni avisos. Vuelve a conectarlo.
            </StatusMessage>
          )}
          <div className={styles.actions}>
            {live ? (
              <Button variant="secondary" icon={PowerOff} iconPosition="start" onClick={hr.disconnect}>
                {hr.status === 'demo' ? 'Detener demostración' : 'Desconectar'}
              </Button>
            ) : (
              <>
                {hr.status !== 'unsupported' && (
                  <Button
                    icon={Bluetooth}
                    iconPosition="start"
                    onClick={hr.connect}
                    disabled={hr.status === 'connecting'}
                  >
                    {hr.status === 'connecting' ? 'Conectando…' : 'Conectar dispositivo'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  icon={PlayCircle}
                  iconPosition="start"
                  onClick={() => hr.startDemo(thresholdValid ? threshold : 100)}
                >
                  Probar con datos de demostración
                </Button>
              </>
            )}
          </div>

          <details className={styles.devices}>
            <summary>¿Qué dispositivos funcionan?</summary>
            <ul>
              <li>
                <strong>Sí:</strong> bandas de pecho y relojes que «transmiten la frecuencia cardiaca» por Bluetooth
                (por ejemplo, varios modelos de Polar y Garmin).
              </li>
              <li>
                <strong>Con una app extra:</strong> relojes Samsung Galaxy Watch con Wear OS, usando una app que
                transmita el pulso por Bluetooth (como «Heart for Bluetooth»).
              </li>
              <li>
                <strong>No:</strong> el anillo Samsung Galaxy Ring y el Apple Watch, porque no transmiten el pulso con
                el estándar de Bluetooth. Samsung Health tampoco comparte sus datos con páginas web.
              </li>
            </ul>
            <p>Tus lecturas se quedan en este dispositivo: no se guardan ni se envían a ningún servidor.</p>
          </details>
        </div>

        <div className={styles.reading}>
          <h2 className={styles.h2}>3. Tu pulso ahora</h2>
          {live && hr.bpm ? (
            <div className={styles.meter}>
              <HeartPulse aria-hidden="true" />
              <p>
                <span className={styles.bpm}>{hr.bpm}</span> <span className={styles.unit}>latidos por minuto</span>
              </p>
              <DataBadge kind={hr.status === 'demo' ? 'demo' : 'measured'} />
              <p className={styles.meta}>
                {hr.status === 'demo'
                  ? 'Datos ficticios que avanzan 4 veces más rápido, solo para mostrar el aviso.'
                  : `Desde: ${hr.deviceName}`}
                {min !== null && ` · Últimos minutos: ${min}–${max} lpm`}
              </p>
              {hr.contact === false && (
                <p className={styles.meta}>El sensor no detecta contacto con la piel: la lectura puede no ser real.</p>
              )}
              {!thresholdValid && <p className={styles.meta}>Escribe tu umbral para activar los avisos.</p>}
            </div>
          ) : (
            <p className={styles.meta}>{live ? 'Esperando la primera lectura…' : 'Sin dispositivo conectado.'}</p>
          )}

          {alerting && (
            <div className={styles.alert} role="alert">
              <p className={styles.alertTitle}>
                Tu pulso lleva {durationText(duration)} por encima de {threshold} lpm. Si puedes, haz una pausa.
              </p>
              <ol className={styles.steps}>
                <li>Detente. Siéntate o apoya la espalda en algo firme.</li>
                <li>Respira: inhala contando 4, sostén 4 y exhala despacio contando 6.</li>
                <li>Afloja los hombros y la mandíbula.</li>
                <li>Si puedes, bebe agua y busca un lugar fresco y con menos ruido.</li>
                <li>
                  Si aparece dolor en el pecho, falta de aire o mareo, llama al <strong>{emergencias.display}</strong>.
                </li>
              </ol>
              <div className={styles.actions}>
                <Button onClick={() => setSnoozedUntil(clock + SNOOZE_MS)}>Ya estoy descansando</Button>
                <Button to="/auxilio-inmediato" variant="secondary">
                  Abrir Ayuda SOS
                </Button>
              </div>
              <p className={styles.meta}>Si sigue alto, te volveremos a avisar en 5 minutos.</p>
            </div>
          )}
        </div>
      </div>

      <p className={styles.disclaimer}>
        Esta extensión es experimental y no sustituye la atención médica. ¿Necesitas apoyo ahora?{' '}
        <Link to="/auxilio-inmediato">Ve a Ayuda SOS</Link>.
      </p>
    </section>
  );
}

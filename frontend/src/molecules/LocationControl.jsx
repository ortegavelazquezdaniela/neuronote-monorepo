import { LocateFixed, MapPinOff } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatusMessage } from '../atoms/StatusMessage';
import { DEFAULT_CENTER } from '../utils/geo';
import styles from './LocationControl.module.css';

/**
 * Pide la ubicación solo cuando la persona pulsa el botón, explicando antes
 * para qué se usa. Muestra el estado y permite "olvidarla".
 */
export function LocationControl({ geo }) {
  const { status, accuracy, request, forget } = geo;

  return (
    <div className={styles.box}>
      {status === 'granted' ? (
        <div className={styles.row}>
          <p className={styles.text}>
            <strong>Usando tu ubicación</strong> (precisión aproximada: {accuracy} m). No se guarda.
          </p>
          <Button size="sm" variant="ghost" icon={MapPinOff} iconPosition="start" onClick={forget}>
            Dejar de usarla
          </Button>
        </div>
      ) : (
        <>
          <p className={styles.text}>
            Mostrando <strong>{DEFAULT_CENTER.label}</strong>. Si quieres ver lo que hay cerca de ti,
            podemos usar tu ubicación solo mientras esta pestaña esté abierta.
          </p>
          <Button
            size="sm"
            variant="secondary"
            icon={LocateFixed}
            iconPosition="start"
            onClick={request}
            disabled={status === 'asking'}
          >
            {status === 'asking' ? 'Esperando tu permiso…' : 'Usar mi ubicación'}
          </Button>
        </>
      )}

      {status === 'denied' && (
        <StatusMessage tone="info" title="No compartiste tu ubicación">
          Está bien. Puedes seguir explorando el mapa o hacer clic en él para elegir un punto.
        </StatusMessage>
      )}
      {status === 'unavailable' && (
        <StatusMessage tone="error" title="No pudimos obtener tu ubicación">
          Tu dispositivo no la proporcionó. Puedes elegir un punto haciendo clic en el mapa.
        </StatusMessage>
      )}
    </div>
  );
}

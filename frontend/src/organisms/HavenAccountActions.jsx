import { useState } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Star, StarOff } from 'lucide-react';
import { Button } from '../atoms/Button';
import { DataBadge } from '../atoms/DataBadge';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { api, apiEnabled } from '../services/api';
import { describeError } from '../services/http';
import styles from './HavenAccountActions.module.css';

/**
 * Ficha de oasis: sello del motor de auditoría (vía API) y botón de favoritos.
 * Sin backend configurado, no muestra nada que no pueda comprobar.
 */
export function HavenAccountActions({ haven }) {
  const { status } = useAuth();
  const logged = status === 'authenticated';
  const cert = useAsync((signal) => api(`/havens/${haven.id}/certification`, { auth: false, signal }), [haven.id], {
    enabled: apiEnabled(),
  });
  const favs = useAsync((signal) => api('/me/favorites', { signal }), [logged], { enabled: logged });
  const [msg, setMsg] = useState(null);
  const isFav = favs.data?.items?.some((f) => f.osmId === haven.id);

  const toggle = async () => {
    setMsg(null);
    try {
      if (isFav) await api(`/me/favorites/${haven.id}`, { method: 'DELETE' });
      else await api('/me/favorites', { method: 'POST', body: { osmId: haven.id, name: haven.name, lat: haven.lat, lon: haven.lon } });
      favs.retry();
      setMsg(isFav ? 'Quitado de tus favoritos.' : 'Guardado en tus favoritos.');
    } catch (err) {
      setMsg(describeError(err));
    }
  };

  if (!apiEnabled()) return null;

  return (
    <div className={styles.box}>
      {cert.status === 'success' && cert.data.certified ? (
        <p className={styles.cert}>
          <BadgeCheck aria-hidden="true" />
          <span>
            <strong>Sensory Haven Certified</strong> · ICAS {cert.data.icas} / 100 · folio {cert.data.folio} · vigente
            hasta {cert.data.expiresAt}
          </span>
        </p>
      ) : (
        cert.status === 'success' && (
          <p className={styles.note}>
            <DataBadge kind="unverified" /> Sin auditoría de NEURONOTE todavía.
          </p>
        )
      )}

      {logged ? (
        <Button variant="secondary" size="sm" icon={isFav ? StarOff : Star} iconPosition="start" onClick={toggle} disabled={favs.status !== 'success'}>
          {isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        </Button>
      ) : (
        <p className={styles.note}>
          <Link to={`/entrar?volver=/oasis/${haven.id}`}>Inicia sesión</Link> para guardar este lugar en tus favoritos.
        </p>
      )}
      {msg && (
        <p className={styles.note} role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router';
import { LogOut, Save, Star, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatusMessage } from '../atoms/StatusMessage';
import { ChoiceGroup } from '../molecules/ChoiceGroup';
import { EmptyState } from '../molecules/EmptyState';
import { PanelSection } from '../molecules/PanelSection';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { api } from '../services/api';
import { describeError } from '../services/http';
import styles from './ProfilePage.module.css';

const LEVELS = [1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }));
const SENSES = [
  ['noiseSensitivity', 'Sensibilidad al ruido'],
  ['lightSensitivity', 'Sensibilidad a la luz'],
  ['crowdSensitivity', 'Sensibilidad a las multitudes'],
  ['heatSensitivity', 'Sensibilidad al calor'],
];
const DEFAULT_PROFILE = {
  noiseSensitivity: 3,
  lightSensitivity: 3,
  crowdSensitivity: 3,
  heatSensitivity: 3,
  routePriority: 'calm',
};

function SensoryProfileForm({ initial }) {
  const [profile, setProfile] = useState(initial ?? DEFAULT_PROFILE);
  const [status, setStatus] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    setStatus({ tone: 'info', text: 'Guardando…' });
    try {
      await api('/me/profile', { method: 'PUT', body: profile });
      setStatus({ tone: 'success', text: 'Perfil guardado.' });
    } catch (err) {
      setStatus({ tone: 'error', text: describeError(err) });
    }
  };
  return (
    <form onSubmit={save} className={styles.form}>
      <p className={styles.hint}>1 = me afecta poco · 5 = me afecta mucho. Sirve para ordenar las rutas a tu medida.</p>
      {SENSES.map(([key, label]) => (
        <ChoiceGroup
          key={key}
          legend={label}
          name={key}
          variant="scale"
          options={LEVELS}
          scaleLabels={['Poco', 'Mucho']}
          value={profile[key]}
          onChange={(v) => setProfile((p) => ({ ...p, [key]: v }))}
        />
      ))}
      <ChoiceGroup
        legend="Ruta preferida por defecto"
        name="routePriority"
        variant="segmented"
        options={[
          { value: 'calm', label: 'Más tranquila' },
          { value: 'fast', label: 'Más rápida' },
        ]}
        value={profile.routePriority}
        onChange={(v) => setProfile((p) => ({ ...p, routePriority: v }))}
      />
      {status && <StatusMessage tone={status.tone} title={status.text} />}
      <div>
        <Button type="submit" icon={Save} iconPosition="start">
          Guardar perfil
        </Button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  usePageMeta({ title: 'Perfil', noindex: true });
  const { user, logout, deleteAccount } = useAuth();
  const profile = useAsync((signal) => api('/me/profile', { signal }), []);
  const favorites = useAsync((signal) => api('/me/favorites', { signal }), []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const removeFavorite = async (osmId) => {
    await api(`/me/favorites/${osmId}`, { method: 'DELETE' });
    favorites.retry();
  };

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="profile-title">
      <header className={styles.header}>
        <h1 id="profile-title" className={styles.title}>
          Hola, {user.displayName}
        </h1>
        <p className={styles.meta}>{user.email}</p>
        <Button variant="secondary" size="sm" icon={LogOut} iconPosition="start" onClick={logout}>
          Cerrar sesión
        </Button>
      </header>

      <div className={styles.grid}>
        <PanelSection id="p-sensory" title="Perfil sensorial">
          {profile.status === 'loading' && <p role="status">Cargando tu perfil…</p>}
          {profile.status === 'error' && (
            <StatusMessage tone="error" title="No pudimos cargar tu perfil">
              {describeError(profile.error)}
            </StatusMessage>
          )}
          {profile.status === 'success' && <SensoryProfileForm initial={profile.data.profile} />}
        </PanelSection>

        <div className={styles.side}>
          <PanelSection id="p-favs" title="Oasis favoritos">
            {favorites.status === 'success' && favorites.data.items.length === 0 && (
              <EmptyState icon={Star} title="Aún no guardas oasis">
                Abre la ficha de un lugar en <Link to="/oasis">Oasis sensoriales</Link> y pulsa «Guardar en favoritos».
              </EmptyState>
            )}
            {favorites.status === 'error' && (
              <StatusMessage tone="error" title="No pudimos cargar tus favoritos">
                {describeError(favorites.error)}
              </StatusMessage>
            )}
            {favorites.status === 'success' && favorites.data.items.length > 0 && (
              <ul className={styles.favs}>
                {favorites.data.items.map((f) => (
                  <li key={f.osmId}>
                    <Link to={`/oasis/${f.osmId}`}>{f.name}</Link>
                    <Button size="sm" variant="ghost" onClick={() => removeFavorite(f.osmId)} aria-label={`Quitar ${f.name} de favoritos`}>
                      Quitar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </PanelSection>

          <PanelSection id="p-notes" title="Notas sensoriales">
            <p className={styles.hint}>
              Con tu sesión iniciada, tus notas se guardan en tu cuenta. <Link to="/notas">Ir a mis notas</Link>
            </p>
          </PanelSection>

          <PanelSection id="p-data" title="Tus datos">
            <p className={styles.hint}>
              Puedes borrar tu cuenta cuando quieras: se eliminan tu perfil, tus favoritos y tus notas
              sincronizadas. No se puede deshacer.
            </p>
            {deleteError && <StatusMessage tone="error" title={deleteError} />}
            {confirmDelete ? (
              <div className={styles.row}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    try {
                      await deleteAccount();
                    } catch (err) {
                      setDeleteError(describeError(err));
                    }
                  }}
                >
                  Sí, borrar mi cuenta
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" icon={Trash2} iconPosition="start" onClick={() => setConfirmDelete(true)}>
                Borrar mi cuenta
              </Button>
            )}
          </PanelSection>
        </div>
      </div>
    </section>
  );
}

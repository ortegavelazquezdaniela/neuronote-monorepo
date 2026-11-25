import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CloudUpload, ShieldCheck } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatusMessage } from '../atoms/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { notesStore } from '../services/notesStore';
import { notesApiStore } from '../services/notesApiStore';
import { describeError } from '../services/http';
import { SensoryNoteForm } from '../organisms/SensoryNoteForm';
import { NotesHistory } from '../organisms/NotesHistory';
import styles from './NotesPage.module.css';

/**
 * Sin sesión: notas solo en este navegador.
 * Con sesión: notas en la cuenta (MongoDB), con opción de subir las locales.
 */
export function NotesPage() {
  usePageMeta({
    title: 'Notas sensoriales',
    description:
      'Anota cómo te sentiste en cada lugar: ruido, luz, gente y comodidad. Tus notas se quedan en tu navegador o en tu cuenta; tú decides.',
  });
  const { status: authStatus } = useAuth();
  const synced = authStatus === 'authenticated';
  const store = synced ? notesApiStore : notesStore;

  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [localCount, setLocalCount] = useState(0);
  const [upload, setUpload] = useState(null);
  const [editing, setEditing] = useState(null); // nota abierta en el formulario, o null
  const [notice, setNotice] = useState(null);
  const formHeadingRef = useRef(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setNotes(await store.list());
      setStatus('ready');
      if (synced) setLocalCount((await notesStore.list().catch(() => [])).length);
    } catch {
      setStatus('error');
    }
  }, [store, synced]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos externos
    load();
  }, [load]);

  const handleSave = async (data) => {
    if (editing) {
      const updated = await store.update(editing.id, data);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)).sort((a, b) => b.when.localeCompare(a.when)));
      setEditing(null);
      setNotice(`Se guardaron los cambios de «${updated.place}».`);
      return;
    }
    const note = await store.add(data);
    setNotes((prev) => [note, ...prev].sort((a, b) => b.when.localeCompare(a.when)));
    setNotice(null);
    setStatus('ready');
  };

  /** Abre la nota en el formulario y lleva el foco a su título (el formulario está arriba). */
  const handleEdit = (note) => {
    setNotice(null);
    setEditing(note);
    requestAnimationFrame(() => {
      formHeadingRef.current?.scrollIntoView({ block: 'start' });
      formHeadingRef.current?.focus({ preventScroll: true });
    });
  };

  const handleDelete = async (id) => {
    try {
      await store.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (editing?.id === id) setEditing(null); // se borró la nota que estaba abierta
    } catch {
      setStatus('error');
    }
  };

  const handleClearAll = async () => {
    await store.clear();
    setNotes([]);
  };

  /** Sube las notas locales a la cuenta y, si todo salió bien, las quita del navegador. */
  const uploadLocal = async () => {
    setUpload({ tone: 'info', text: 'Subiendo tus notas…' });
    try {
      const local = await notesStore.list();
      for (const { place, when, noise, comfort, light, crowd, text } of local) {
        await notesApiStore.add({ place, when, noise, comfort, light, crowd, text });
      }
      await notesStore.clear();
      setLocalCount(0);
      setUpload({ tone: 'success', text: `${local.length} notas subidas a tu cuenta.` });
      load();
    } catch (err) {
      setUpload({ tone: 'error', text: `No se pudieron subir todas: ${describeError(err)}` });
    }
  };

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="notes-title">
      <header className={styles.header}>
        <h1 id="notes-title" className={styles.title}>
          Notas sensoriales
          <span className={styles.en} lang="en">
            Sensory Notes
          </span>
        </h1>
        <p className={styles.intro}>
          Registra cómo se sintió un lugar o un trayecto. Con el tiempo, tus notas te ayudan a elegir
          dónde y cuándo moverte.
        </p>
        <p className={styles.privacy}>
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>Privadas por defecto.</strong>{' '}
            {synced ? (
              'Se guardan en tu cuenta: solo tú puedes verlas, desde cualquier dispositivo.'
            ) : (
              <>
                Se guardan solo en este navegador. <Link to="/entrar?volver=/notas">Inicia sesión</Link> para
                sincronizarlas.
              </>
            )}
          </span>
        </p>
        {synced && localCount > 0 && (
          <div className={styles.upload}>
            <p>
              Tienes {localCount} {localCount === 1 ? 'nota guardada' : 'notas guardadas'} solo en este navegador.
            </p>
            <Button size="sm" variant="secondary" icon={CloudUpload} iconPosition="start" onClick={uploadLocal}>
              Subirlas a mi cuenta
            </Button>
          </div>
        )}
        {upload && <StatusMessage tone={upload.tone} title={upload.text} />}
      </header>

      <div className={styles.grid}>
        <div className={styles.formCol}>
          {notice && (
            <StatusMessage tone="success" title="Nota actualizada">
              {notice}
            </StatusMessage>
          )}
          <SensoryNoteForm
            key={editing?.id ?? 'nueva'}
            editing={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            synced={synced}
            headingRef={formHeadingRef}
          />
        </div>
        <NotesHistory
          notes={notes}
          status={status}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onClearAll={handleClearAll}
          onRetry={load}
        />
      </div>
    </section>
  );
}

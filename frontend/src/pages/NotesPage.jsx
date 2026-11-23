import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { notesStore } from '../services/notesStore';
import { SensoryNoteForm } from '../organisms/SensoryNoteForm';
import { NotesHistory } from '../organisms/NotesHistory';
import styles from './NotesPage.module.css';

export function NotesPage() {
  useDocumentTitle('Notas sensoriales');
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setNotes(await notesStore.list());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos externos
    load();
  }, [load]);

  const handleSave = async (data) => {
    const note = await notesStore.add(data);
    setNotes((prev) => [note, ...prev].sort((a, b) => b.when.localeCompare(a.when)));
    setStatus('ready');
  };

  const handleDelete = async (id) => {
    try {
      await notesStore.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setStatus('error');
    }
  };

  const handleClearAll = async () => {
    await notesStore.clear();
    setNotes([]);
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
            <strong>Privadas por defecto.</strong> Por ahora tus notas se guardan solo en este
            navegador. Puedes descargarlas o borrarlas cuando quieras.
          </span>
        </p>
      </header>

      <div className={styles.grid}>
        <SensoryNoteForm onSave={handleSave} />
        <NotesHistory
          notes={notes}
          status={status}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          onRetry={load}
        />
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Download, NotebookPen, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatusMessage } from '../atoms/StatusMessage';
import { EmptyState } from '../molecules/EmptyState';
import { NOISE_LABELS, COMFORT_LABELS, LIGHT_LABELS, CROWD_LABELS, formatWhen } from '../utils/noteLabels';
import styles from './NotesHistory.module.css';

function exportNotes(notes) {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neuronote-notas-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function NoteItem({ note, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className={styles.item}>
      <article aria-labelledby={`note-${note.id}`}>
        <h3 id={`note-${note.id}`} className={styles.place}>
          {note.place}
        </h3>
        <p className={styles.when}>
          <time dateTime={note.when}>{formatWhen(note.when)}</time>
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Ruido</dt>
            <dd>{NOISE_LABELS[note.noise]}</dd>
          </div>
          <div>
            <dt>Confort</dt>
            <dd>{COMFORT_LABELS[note.comfort]}</dd>
          </div>
          {note.light && (
            <div>
              <dt>Luz</dt>
              <dd>{LIGHT_LABELS[note.light]}</dd>
            </div>
          )}
          {note.crowd && (
            <div>
              <dt>Gente</dt>
              <dd>{CROWD_LABELS[note.crowd]}</dd>
            </div>
          )}
        </dl>
        {note.text && <p className={styles.text}>{note.text}</p>}

        <div className={styles.itemActions}>
          {confirming ? (
            <>
              <span className={styles.confirmText} role="status">
                ¿Borrar esta nota? No se puede deshacer.
              </span>
              <Button size="sm" variant="danger" onClick={() => onDelete(note.id)}>
                Sí, borrar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Pencil}
                  iconPosition="start"
                  onClick={() => onEdit(note)}
                  aria-label={`Editar la nota de ${note.place}`}
                >
                  Editar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                icon={Trash2}
                iconPosition="start"
                onClick={() => setConfirming(true)}
                aria-label={`Borrar la nota de ${note.place}`}
              >
                Borrar
              </Button>
            </>
          )}
        </div>
      </article>
    </li>
  );
}

/**
 * Historial de notas con búsqueda, descarga, edición y borrado.
 * status: 'loading' | 'ready' | 'error'
 */
export function NotesHistory({ notes, status, onDelete, onEdit, onClearAll, onRetry }) {
  const [query, setQuery] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);

  const q = query.trim().toLocaleLowerCase('es');
  const visible = q
    ? notes.filter((n) => `${n.place} ${n.text}`.toLocaleLowerCase('es').includes(q))
    : notes;

  return (
    <section className={styles.history} aria-labelledby="history-title" aria-busy={status === 'loading'}>
      <div className={styles.head}>
        <h2 id="history-title" className={styles.title}>
          Tu historial
        </h2>
        {status === 'ready' && notes.length > 0 && (
          <p className={styles.count}>
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
          </p>
        )}
      </div>

      {status === 'loading' && <p className={styles.loading}>Cargando tus notas…</p>}

      {status === 'error' && (
        <StatusMessage tone="error" title="No pudimos leer tus notas">
          <p>Este navegador no permite acceder al almacenamiento (por ejemplo, en modo privado).</p>
          <Button size="sm" variant="secondary" onClick={onRetry} className={styles.retry}>
            Intentar de nuevo
          </Button>
        </StatusMessage>
      )}

      {status === 'ready' && notes.length === 0 && (
        <EmptyState icon={NotebookPen} title="Todavía no tienes notas">
          Cuando guardes la primera, aparecerá aquí. Solo tú puedes verla.
        </EmptyState>
      )}

      {status === 'ready' && notes.length > 0 && (
        <>
          <div className={styles.tools}>
            <label htmlFor="notes-search" className={styles.searchLabel}>
              Buscar en tus notas
            </label>
            <div className={styles.search}>
              <Search aria-hidden="true" />
              <input
                id="notes-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lugar o palabra"
                autoComplete="off"
              />
            </div>
          </div>

          <p className={styles.results} role="status">
            {q ? `${visible.length} ${visible.length === 1 ? 'resultado' : 'resultados'}` : ''}
          </p>

          {visible.length === 0 ? (
            <EmptyState icon={Search} title="Sin coincidencias">
              Prueba con otra palabra o borra la búsqueda.
            </EmptyState>
          ) : (
            <ul className={styles.list}>
              {visible.map((n) => (
                <NoteItem key={n.id} note={n} onDelete={onDelete} onEdit={onEdit} />
              ))}
            </ul>
          )}

          <div className={styles.dataActions}>
            <h3 className={styles.dataTitle}>Tus datos</h3>
            <div className={styles.row}>
              <Button
                size="sm"
                variant="secondary"
                icon={Download}
                iconPosition="start"
                onClick={() => exportNotes(notes)}
              >
                Descargar mis notas (JSON)
              </Button>
              {confirmAll ? (
                <>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onClearAll();
                      setConfirmAll(false);
                    }}
                  >
                    Sí, borrar las {notes.length}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmAll(false)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="danger" onClick={() => setConfirmAll(true)}>
                  Borrar todas
                </Button>
              )}
            </div>
            {confirmAll && (
              <p className={styles.confirmText} role="status">
                Se borrarán todas tus notas de este dispositivo. No se puede deshacer.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

import { useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../atoms/Button';
import { TextField } from '../atoms/TextField';
import { StatusMessage } from '../atoms/StatusMessage';
import { ChoiceGroup } from '../molecules/ChoiceGroup';
import { validateNote, NOTE_LIMITS } from '../utils/validation';
import {
  NOISE_LABELS,
  COMFORT_LABELS,
  LIGHT_LABELS,
  CROWD_LABELS,
  scaleOptions,
  listOptions,
  toLocalInput,
} from '../utils/noteLabels';
import styles from './SensoryNoteForm.module.css';

const FIELD_IDS = {
  place: 'note-place',
  when: 'note-when',
  noise: 'note-noise',
  comfort: 'note-comfort',
  light: 'note-light',
  crowd: 'note-crowd',
  text: 'note-text',
};

const FIELD_NAMES = {
  place: 'Lugar o trayecto',
  when: 'Fecha y hora',
  noise: 'Ruido percibido',
  comfort: 'Cómo te sentiste',
  light: 'Iluminación',
  crowd: 'Cantidad de gente',
  text: 'Nota',
};

const emptyForm = () => ({
  place: '',
  when: toLocalInput(),
  noise: null,
  comfort: null,
  light: '',
  crowd: '',
  text: '',
});

/** Lleva el foco al campo con error (el primer radio si es un grupo). */
function focusField(key) {
  const el = document.getElementById(FIELD_IDS[key]);
  const target = el?.tagName === 'FIELDSET' ? el.querySelector('input') : el;
  target?.focus();
}

export function SensoryNoteForm({ onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const summaryRef = useRef(null);

  const set = (key) => (value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (status === 'saved') setStatus(null);
    if (attempted) setErrors(validateNote(next).errors); // revalidación en vivo tras el primer intento
  };
  const onInput = (key) => (e) => set(key)(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const result = validateNote(form);
    setErrors(result.errors);
    if (!result.ok) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus('saving');
    try {
      await onSave(result.data);
      setForm(emptyForm());
      setAttempted(false);
      setErrors({});
      setStatus('saved');
    } catch {
      setStatus('error'); // el formulario conserva lo escrito
    }
  };

  const errorKeys = Object.keys(errors);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby="note-form-title">
      <h2 id="note-form-title" className={styles.title}>
        Nueva nota
      </h2>

      {errorKeys.length > 0 && (
        <StatusMessage
          ref={summaryRef}
          tabIndex={-1}
          tone="error"
          title={`Revisa ${errorKeys.length === 1 ? '1 campo' : `${errorKeys.length} campos`} antes de guardar`}
        >
          <ul>
            {errorKeys.map((k) => (
              <li key={k}>
                <a
                  href={`#${FIELD_IDS[k]}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    focusField(k);
                  }}
                >
                  {FIELD_NAMES[k]}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </StatusMessage>
      )}

      <TextField
        id={FIELD_IDS.place}
        label={FIELD_NAMES.place}
        hint="Por ejemplo: «Biblioteca central» o «Trayecto de casa a la escuela»."
        required
        maxLength={NOTE_LIMITS.placeMax}
        value={form.place}
        onChange={onInput('place')}
        error={errors.place}
        autoComplete="off"
      />

      <TextField
        id={FIELD_IDS.when}
        type="datetime-local"
        label={FIELD_NAMES.when}
        required
        max={toLocalInput()}
        value={form.when}
        onChange={onInput('when')}
        error={errors.when}
        className={styles.narrow}
      />

      <ChoiceGroup
        id={FIELD_IDS.noise}
        legend={FIELD_NAMES.noise}
        name="noise"
        variant="scale"
        options={scaleOptions(NOISE_LABELS)}
        scaleLabels={['Muy tranquilo', 'Muy ruidoso']}
        value={form.noise}
        onChange={set('noise')}
        error={errors.noise}
        required
      />

      <ChoiceGroup
        id={FIELD_IDS.comfort}
        legend={FIELD_NAMES.comfort}
        name="comfort"
        variant="scale"
        options={scaleOptions(COMFORT_LABELS)}
        scaleLabels={['Muy incómodo', 'Muy cómodo']}
        value={form.comfort}
        onChange={set('comfort')}
        error={errors.comfort}
        required
      />

      <div className={styles.pair}>
        <ChoiceGroup
          id={FIELD_IDS.light}
          legend={FIELD_NAMES.light}
          name="light"
          variant="segmented"
          options={listOptions(LIGHT_LABELS)}
          value={form.light}
          onChange={set('light')}
          error={errors.light}
          required={false}
        />
        <ChoiceGroup
          id={FIELD_IDS.crowd}
          legend={FIELD_NAMES.crowd}
          name="crowd"
          variant="segmented"
          options={listOptions(CROWD_LABELS)}
          value={form.crowd}
          onChange={set('crowd')}
          error={errors.crowd}
          required={false}
        />
      </div>

      <TextField
        id={FIELD_IDS.text}
        label={FIELD_NAMES.text}
        hint="Lo que quieras recordar: olores, luces, música, qué te ayudó."
        multiline
        maxLength={NOTE_LIMITS.textMax}
        value={form.text}
        onChange={onInput('text')}
        error={errors.text}
      />

      {status === 'error' && (
        <StatusMessage tone="error" title="No se pudo guardar la nota">
          Este navegador no permite guardar datos (por ejemplo, en modo privado). Lo que escribiste
          sigue en el formulario.
        </StatusMessage>
      )}
      {status === 'saved' && (
        <StatusMessage tone="success" title="Nota guardada">
          Se guardó solo en este dispositivo. La verás en tu historial.
        </StatusMessage>
      )}

      <div className={styles.actions}>
        <Button type="submit" icon={Save} iconPosition="start" disabled={status === 'saving'}>
          {status === 'saving' ? 'Guardando…' : 'Guardar nota'}
        </Button>
      </div>
    </form>
  );
}

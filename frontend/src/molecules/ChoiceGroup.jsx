import { useId } from 'react';
import fieldStyles from '../atoms/Field.module.css';
import styles from './ChoiceGroup.module.css';

/**
 * Grupo de opciones con <fieldset> + radios nativos (teclado con flechas incluido).
 * variant: 'cards' (opciones con descripción/preview), 'segmented' (fila compacta)
 * o 'scale' (escala numérica con etiquetas de extremos).
 */
export function ChoiceGroup({
  legend,
  hint,
  name,
  options,
  value,
  onChange,
  error,
  required, // true → "(obligatorio)", false → "(opcional)", sin definir → sin marca
  variant = 'cards',
  scaleLabels,
  id,
}) {
  const autoId = useId();
  const groupId = id ?? autoId;
  const hintId = hint ? `${groupId}-hint` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset
      id={groupId}
      className={`${styles.group} ${error ? fieldStyles.hasError : ''}`}
      aria-labelledby={`${groupId}-legend`}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend id={`${groupId}-legend`} className={fieldStyles.legend}>
        {legend}
        {required === true && <> <span className={fieldStyles.req}>(obligatorio)</span></>}
        {required === false && <> <span className={fieldStyles.opt}>(opcional)</span></>}
      </legend>
      {hint && (
        <p id={hintId} className={fieldStyles.hint}>
          {hint}
        </p>
      )}

      <div className={`${styles.options} ${styles[variant]}`}>
        {options.map((opt) => {
          const optId = `${groupId}-${String(opt.value).replace('.', '_')}`;
          const checked = value === opt.value;
          return (
            <label key={opt.value} htmlFor={optId} className={`${styles.option} ${checked ? styles.checked : ''}`}>
              <input
                id={optId}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className={styles.input}
              />
              {opt.preview && (
                <span className={styles.preview} aria-hidden="true">
                  {opt.preview}
                </span>
              )}
              <span className={styles.text}>
                <span className={styles.optLabel} style={opt.labelStyle}>
                  {opt.label}
                </span>
                {opt.description && <span className={styles.desc}>{opt.description}</span>}
              </span>
            </label>
          );
        })}
      </div>

      {variant === 'scale' && scaleLabels && (
        <div className={styles.scaleEnds} aria-hidden="true">
          <span>{scaleLabels[0]}</span>
          <span>{scaleLabels[1]}</span>
        </div>
      )}

      {error && (
        <p id={errorId} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

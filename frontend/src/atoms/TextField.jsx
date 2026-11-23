import { useId } from 'react';
import styles from './Field.module.css';

/**
 * Campo de texto accesible: etiqueta visible, pista, error vinculado con
 * aria-describedby y contador opcional. `multiline` lo convierte en <textarea>.
 */
export function TextField({
  id,
  label,
  hint,
  error,
  required = false,
  multiline = false,
  maxLength,
  value = '',
  className = '',
  ...rest
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : null;
  const errorId = error ? `${fieldId}-error` : null;
  const countId = maxLength ? `${fieldId}-count` : null;
  const describedBy = [hintId, errorId, countId].filter(Boolean).join(' ') || undefined;
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''} ${className}`}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.req}> (obligatorio)</span>
        ) : (
          <span className={styles.opt}> (opcional)</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <Tag
        id={fieldId}
        className={styles.control}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        maxLength={maxLength}
        value={value}
        rows={multiline ? 4 : undefined}
        {...rest}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {maxLength && (
        <p id={countId} className={styles.count} aria-live="polite">
          {value.length} de {maxLength} caracteres
        </p>
      )}
    </div>
  );
}

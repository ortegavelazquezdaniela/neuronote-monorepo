import styles from './EmptyState.module.css';

/** Estado vacío: explica qué falta y qué se puede hacer, sin dramatizar. */
export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className={styles.empty}>
      {Icon && (
        <span className={styles.icon} aria-hidden="true">
          <Icon />
        </span>
      )}
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}

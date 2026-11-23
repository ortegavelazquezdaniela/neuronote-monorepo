import { forwardRef } from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import styles from './StatusMessage.module.css';

const ICONS = { info: Info, success: CircleCheck, error: CircleAlert };

/**
 * Mensaje de estado. Los errores usan role="alert" (se anuncian de inmediato);
 * éxito e información usan role="status" (se anuncian sin interrumpir).
 */
export const StatusMessage = forwardRef(function StatusMessage(
  { tone = 'info', title, children, className = '', ...rest },
  ref,
) {
  const Icon = ICONS[tone];
  return (
    <div
      ref={ref}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`${styles.msg} ${styles[tone]} ${className}`}
      {...rest}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
    </div>
  );
});

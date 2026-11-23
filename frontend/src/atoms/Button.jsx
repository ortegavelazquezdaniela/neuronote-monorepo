import { Link } from 'react-router';
import styles from './Button.module.css';

/**
 * Botón accesible y polimórfico.
 * - `to`   → enlace interno (React Router)
 * - `href` → enlace externo / tel: / wa.me
 * - sin ambos → <button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon: Icon,
  iconPosition = 'end',
  className = '',
  children,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(' ');
  const content = (
    <>
      {Icon && iconPosition === 'start' && <Icon className={styles.icon} aria-hidden="true" />}
      <span>{children}</span>
      {Icon && iconPosition === 'end' && <Icon className={styles.icon} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}

import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { TextField } from '../atoms/TextField';
import { StatusMessage } from '../atoms/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { usePageMeta } from '../hooks/usePageMeta';
import { describeError } from '../services/http';
import styles from './AuthPage.module.css';

const FIELD_ERRORS = {
  email: 'Escribe un correo válido.',
  password: 'La contraseña debe tener al menos 10 caracteres, con letras y al menos un número.',
  displayName: 'Escribe un nombre o apodo de 2 a 40 caracteres.',
};

/** Validación local (el servidor vuelve a validar todo). */
function validate(mode, f) {
  const e = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = FIELD_ERRORS.email;
  if (mode === 'register') {
    if (f.password.length < 10 || !/[a-zA-Z]/.test(f.password) || !/\d/.test(f.password)) e.password = FIELD_ERRORS.password;
    if (f.displayName.trim().length < 2 || f.displayName.trim().length > 40) e.displayName = FIELD_ERRORS.displayName;
  } else if (!f.password) {
    e.password = 'Escribe tu contraseña.';
  }
  return e;
}

/** /entrar y /registro */
export function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  usePageMeta({
    title: isRegister ? 'Crear cuenta' : 'Iniciar sesión',
    description: 'Tu cuenta de NEURONOTE guarda tu perfil sensorial, tus oasis favoritos y tus notas para usarlos en cualquier dispositivo.',
    noindex: true,
  });
  const { login, register, status, enabled } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const back = params.get('volver')?.startsWith('/') ? params.get('volver') : '/perfil';
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const alertRef = useRef(null);

  if (status === 'authenticated') return <Navigate to={back} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(mode, form);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length) {
      document.getElementById(`auth-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    // Si tarda, casi siempre es el servidor gratuito despertando: se avisa en vez de dejar la duda
    const slowTimer = setTimeout(() => setSlow(true), 5_000);
    try {
      if (isRegister) await register({ ...form, email: form.email.trim(), displayName: form.displayName.trim() });
      else await login(form.email.trim(), form.password);
      navigate(back, { replace: true });
    } catch (err) {
      const fieldErrors = Object.fromEntries((err.fields ?? []).map((f) => [f.field, FIELD_ERRORS[f.field] ?? f.message]));
      setErrors(fieldErrors);
      setServerError(describeError(err));
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setBusy(false);
    }
  };

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="auth-title">
      <h1 id="auth-title" className={styles.title}>
        {isRegister ? 'Crear tu cuenta' : 'Iniciar sesión'}
      </h1>
      <p className={styles.intro}>
        {isRegister
          ? 'Con una cuenta puedes guardar tu perfil sensorial, tus oasis favoritos y sincronizar tus notas. NEURONOTE funciona igual sin cuenta.'
          : 'Entra para ver tu perfil sensorial, tus favoritos y tus notas sincronizadas.'}
      </p>

      {!enabled && (
        <StatusMessage tone="info" title="Las cuentas no están disponibles en esta versión">
          El servidor de NEURONOTE no está configurado. Puedes usar todo lo demás sin cuenta.
        </StatusMessage>
      )}

      <form className={styles.form} onSubmit={submit} noValidate>
        {serverError && (
          <StatusMessage ref={alertRef} tabIndex={-1} tone="error" title={isRegister ? 'No pudimos crear la cuenta' : 'No pudimos iniciar sesión'}>
            {serverError}
          </StatusMessage>
        )}
        {isRegister && (
          <TextField
            id="auth-displayName"
            label="Nombre o apodo"
            hint="Así te saludaremos. No tiene que ser tu nombre real."
            required
            maxLength={40}
            autoComplete="nickname"
            value={form.displayName}
            onChange={set('displayName')}
            error={errors.displayName}
          />
        )}
        <TextField
          id="auth-email"
          type="email"
          label="Correo"
          required
          maxLength={254}
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <TextField
          id="auth-password"
          type="password"
          label="Contraseña"
          hint={isRegister ? 'Al menos 10 caracteres, con letras y un número.' : undefined}
          required
          maxLength={128}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />
        {slow && (
          <StatusMessage tone="info" title="Despertando el servidor">
            El servidor gratuito se duerme cuando nadie lo usa y tarda hasta un minuto en arrancar. No cierres esta
            página: seguimos esperando.
          </StatusMessage>
        )}
        <Button type="submit" icon={isRegister ? UserPlus : LogIn} iconPosition="start" disabled={busy || !enabled}>
          {busy ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Entrar'}
        </Button>
      </form>

      <p className={styles.switch}>
        {isRegister ? '¿Ya tienes cuenta? ' : '¿Todavía no tienes cuenta? '}
        <Link to={`${isRegister ? '/entrar' : '/registro'}${params.get('volver') ? `?volver=${encodeURIComponent(back)}` : ''}`}>
          {isRegister ? 'Inicia sesión' : 'Crea una cuenta'}
        </Link>
      </p>
      <p className={styles.privacy}>
        Tu contraseña se guarda cifrada con bcrypt; nadie del equipo puede leerla. Tu sesión se cierra al
        cerrar la pestaña.
      </p>
    </section>
  );
}

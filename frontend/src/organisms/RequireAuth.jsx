import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

/** Ruta protegida: sin sesión, lleva a /entrar y luego regresa aquí. */
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status !== 'authenticated') {
    return <Navigate to={`/entrar?volver=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return children;
}

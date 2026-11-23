import { useContext } from 'react';
import { AuthContext } from '../providers/contexts';

/** { user, enabled, status, login, register, logout, deleteAccount } */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

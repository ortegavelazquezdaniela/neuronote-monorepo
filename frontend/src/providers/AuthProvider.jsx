import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './contexts';
import { api, apiEnabled, session, setUnauthorizedHandler } from '../services/api';

/**
 * Sesión de la persona usuaria (JWT emitido por la API Express).
 * status: 'anonymous' | 'authenticated'
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.get()?.user ?? null);

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout); // token vencido → cerrar sesión limpia
  }, [logout]);

  const start = useCallback(({ token, user: u }) => {
    session.set({ token, user: u });
    setUser(u);
    return u;
  }, []);

  const login = useCallback(
    async (email, password) => start(await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })),
    [start],
  );

  const register = useCallback(
    async (data) => start(await api('/auth/register', { method: 'POST', body: data, auth: false })),
    [start],
  );

  const deleteAccount = useCallback(async () => {
    await api('/auth/me', { method: 'DELETE' });
    logout();
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      enabled: apiEnabled(),
      status: user ? 'authenticated' : 'anonymous',
      login,
      register,
      logout,
      deleteAccount,
    }),
    [user, login, register, logout, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

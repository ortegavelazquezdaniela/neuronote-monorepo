import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { PreferencesProvider } from '../src/providers/PreferencesProvider';
import { AuthProvider } from '../src/providers/AuthProvider';
import { SosProvider } from '../src/providers/SosProvider';

/**
 * Renderiza con los mismos proveedores que la app real (preferencias, sesión,
 * SOS y router en memoria). `routes` agrega otras páginas para probar navegación.
 */
export function renderApp(ui, { route = '/', path = '*', routes = [] } = {}) {
  const wrap = (element) => <SosProvider>{element}</SosProvider>;
  const router = createMemoryRouter(
    [{ path, element: wrap(ui) }, ...routes.map((r) => ({ path: r.path, element: wrap(r.element) }))],
    { initialEntries: [route] },
  );
  const utils = render(
    <PreferencesProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </PreferencesProvider>,
  );
  return { ...utils, router };
}

/** Inicia una sesión simulada (como si la API hubiera respondido al login). */
export function fakeSession(user = { id: 'u1', email: 'prueba@neuronote.test', displayName: 'Prueba', role: 'user' }) {
  sessionStorage.setItem('nn-session', JSON.stringify({ token: 'jwt.de.prueba', user }));
  return user;
}

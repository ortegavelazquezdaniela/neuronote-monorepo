import { lazy } from 'react';
import { MainLayout } from './templates/MainLayout';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';
import { SECTION_PAGES } from './utils/sectionPages';
import { RequireAuth } from './organisms/RequireAuth';
// Ayuda SOS va en el paquete principal: en una crisis la página debe aparecer sin una segunda descarga.
import { CrisisHelpPage } from './pages/CrisisHelpPage';

// Carga diferida: estas páginas (y Leaflet) solo se descargan cuando se visitan.
const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const AccessibilityPage = named(() => import('./pages/AccessibilityPage'), 'AccessibilityPage');
const NotesPage = named(() => import('./pages/NotesPage'), 'NotesPage');
const MapPage = named(() => import('./pages/MapPage'), 'MapPage');
const RoutesPage = named(() => import('./pages/RoutesPage'), 'RoutesPage');
const HavensPage = named(() => import('./pages/HavensPage'), 'HavensPage');
const HavenDetailPage = named(() => import('./pages/HavenDetailPage'), 'HavenDetailPage');
const MicroclimatePage = named(() => import('./pages/MicroclimatePage'), 'MicroclimatePage');
const AuthPage = named(() => import('./pages/AuthPage'), 'AuthPage');
const ProfilePage = named(() => import('./pages/ProfilePage'), 'ProfilePage');
const HeartRatePage = named(() => import('./pages/HeartRatePage'), 'HeartRatePage');

/** Rutas de la app (también las usa la prueba que valida el sitemap). */
export const routes = [
  {
    element: <MainLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'auxilio-inmediato', element: <CrisisHelpPage /> },
          { path: 'accesibilidad', element: <AccessibilityPage /> },
          { path: 'notas', element: <NotesPage /> },
          { path: 'mapa', element: <MapPage /> },
          { path: 'rutas', element: <RoutesPage /> },
          { path: 'oasis', element: <HavensPage /> },
          { path: 'oasis/:id', element: <HavenDetailPage /> },
          { path: 'microclima', element: <MicroclimatePage /> },
          { path: 'pulso', element: <HeartRatePage /> },
          { path: 'entrar', element: <AuthPage mode="login" /> },
          { path: 'registro', element: <AuthPage mode="register" /> },
          {
            path: 'perfil',
            element: (
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            ),
          },
          ...SECTION_PAGES.map(({ path, ...props }) => ({
            path: path.slice(1),
            element: <SectionPage {...props} />,
          })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

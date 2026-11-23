import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { MainLayout } from './templates/MainLayout';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';
import { SECTION_PAGES } from './utils/sectionPages';

// Carga diferida: estas páginas (y Leaflet) solo se descargan cuando se visitan.
const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const CrisisHelpPage = named(() => import('./pages/CrisisHelpPage'), 'CrisisHelpPage');
const AccessibilityPage = named(() => import('./pages/AccessibilityPage'), 'AccessibilityPage');
const NotesPage = named(() => import('./pages/NotesPage'), 'NotesPage');
const MapPage = named(() => import('./pages/MapPage'), 'MapPage');
const RoutesPage = named(() => import('./pages/RoutesPage'), 'RoutesPage');
const HavensPage = named(() => import('./pages/HavensPage'), 'HavensPage');
const HavenDetailPage = named(() => import('./pages/HavenDetailPage'), 'HavenDetailPage');
const MicroclimatePage = named(() => import('./pages/MicroclimatePage'), 'MicroclimatePage');

const router = createBrowserRouter([
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
          ...SECTION_PAGES.map(({ path, ...props }) => ({
            path: path.slice(1),
            element: <SectionPage {...props} />,
          })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { MainLayout } from './templates/MainLayout';
import { HomePage } from './pages/HomePage';
import { SectionPage } from './pages/SectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';
import { SECTION_PAGES } from './utils/sectionPages';

// Carga diferida: estas páginas solo se descargan cuando se visitan.
const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const CrisisHelpPage = named(() => import('./pages/CrisisHelpPage'), 'CrisisHelpPage');
const AccessibilityPage = named(() => import('./pages/AccessibilityPage'), 'AccessibilityPage');
const NotesPage = named(() => import('./pages/NotesPage'), 'NotesPage');

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

import { createBrowserRouter, RouterProvider } from 'react-router';
import { MainLayout } from './templates/MainLayout';
import { HomePage } from './pages/HomePage';
import { CrisisHelpPage } from './pages/CrisisHelpPage';
import { SectionPage } from './pages/SectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SECTION_PAGES } from './utils/sectionPages';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auxilio-inmediato', element: <CrisisHelpPage /> },
      ...SECTION_PAGES.map(({ path, ...props }) => ({
        path: path.slice(1),
        element: <SectionPage {...props} />,
      })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

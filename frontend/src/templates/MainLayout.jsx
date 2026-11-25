import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SkipLink } from '../atoms/SkipLink';
import { PageLoader } from '../atoms/PageLoader';
import { SiteHeader } from '../organisms/SiteHeader';
import { SiteFooter } from '../organisms/SiteFooter';
import { SosFab } from '../organisms/SosFab';
import { BrandIntro } from '../organisms/BrandIntro';
import { SosProvider } from '../providers/SosProvider';
import { wakeApi } from '../services/api';

/**
 * Plantilla común: intro → skip link → header → <main> → footer, FAB SOS y modal SOS.
 * Al navegar, el foco pasa al <main> para que los lectores de pantalla
 * anuncien la nueva página (patrón SPA accesible).
 */
export function MainLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const first = useRef(true);

  // La API gratuita duerme tras 15 min: se despierta en segundo plano al abrir la app
  useEffect(() => {
    wakeApi();
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <SosProvider>
      <BrandIntro />
      <SkipLink />
      <SiteHeader />
      <main id="contenido" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <SosFab />
    </SosProvider>
  );
}

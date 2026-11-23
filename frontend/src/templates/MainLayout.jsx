import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { SkipLink } from '../atoms/SkipLink';
import { SiteHeader } from '../organisms/SiteHeader';
import { SiteFooter } from '../organisms/SiteFooter';
import { SosFab } from '../organisms/SosFab';

/**
 * Plantilla común: skip link → header → <main> → footer, y el FAB SOS.
 * Al navegar, el foco pasa al <main> para que los lectores de pantalla
 * anuncien la nueva página (patrón SPA accesible).
 */
export function MainLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="contenido" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
        <Outlet />
      </main>
      <SiteFooter />
      <SosFab />
    </>
  );
}

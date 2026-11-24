import { describe, it, expect } from 'vitest';
import { matchRoutes } from 'react-router';
import { routes } from '../../src/routes';
import { PUBLIC_ROUTES, DEFAULT_SITE_URL, buildSitemap, buildRobots } from '../../src/utils/site';

describe('SEO: sitemap y robots', () => {
  it('cada ruta del sitemap existe en la app (no cae en la 404)', () => {
    for (const path of PUBLIC_ROUTES) {
      const matches = matchRoutes(routes, path);
      const leaf = matches?.at(-1)?.route;
      expect(leaf, path).toBeTruthy();
      expect(leaf.path, `${path} no debería ser la 404`).not.toBe('*');
    }
  });

  it('no incluye páginas personales ni de sesión', () => {
    expect(PUBLIC_ROUTES).not.toContain('/perfil');
    expect(PUBLIC_ROUTES).not.toContain('/entrar');
    expect(PUBLIC_ROUTES).not.toContain('/registro');
    expect(new Set(PUBLIC_ROUTES).size).toBe(PUBLIC_ROUTES.length);
  });

  it('genera un sitemap válido con URLs absolutas', () => {
    const xml = buildSitemap(`${DEFAULT_SITE_URL}/`);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<loc>/g)).toHaveLength(PUBLIC_ROUTES.length);
    expect(xml).toContain(`<loc>${DEFAULT_SITE_URL}/auxilio-inmediato</loc>`);
    expect(xml).not.toContain('//auxilio');
  });

  it('robots.txt bloquea /perfil y apunta al sitemap', () => {
    const txt = buildRobots('https://ejemplo.test');
    expect(txt).toContain('Disallow: /perfil');
    expect(txt).toContain('Sitemap: https://ejemplo.test/sitemap.xml');
  });
});

import { SECTION_PAGES } from './sectionPages.js';

/** Dominio público por defecto (se cambia con VITE_SITE_URL). */
export const DEFAULT_SITE_URL = 'https://neuronote-monorepo.vercel.app';

/**
 * Páginas públicas que van en sitemap.xml. Las personales (/perfil), las de
 * sesión (/entrar, /registro) y los detalles de cada oasis (datos de OSM que
 * cambian) no se incluyen. Una prueba comprueba que cada ruta exista en la app.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/mapa',
  '/rutas',
  '/oasis',
  '/microclima',
  '/notas',
  '/auxilio-inmediato',
  '/accesibilidad',
  ...SECTION_PAGES.map((p) => p.path),
];

export function buildSitemap(siteUrl) {
  const base = siteUrl.replace(/\/$/, '');
  const urls = PUBLIC_ROUTES.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobots(siteUrl) {
  return [
    '# NEURONOTE: las páginas públicas pueden indexarse.',
    '# /perfil es personal y requiere sesión.',
    'User-agent: *',
    'Disallow: /perfil',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
    '',
  ].join('\n');
}

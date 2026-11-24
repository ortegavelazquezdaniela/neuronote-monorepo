/**
 * Después de `vite build` (script postbuild): escribe dist/sitemap.xml y
 * dist/robots.txt con el dominio público (VITE_SITE_URL o el de Vercel por defecto).
 */
import { writeFileSync } from 'node:fs';
import { loadEnv } from 'vite';
import { DEFAULT_SITE_URL, buildSitemap, buildRobots } from '../src/utils/site.js';

const siteUrl = loadEnv('production', process.cwd(), 'VITE_').VITE_SITE_URL || DEFAULT_SITE_URL;
const dist = new URL('../dist/', import.meta.url);
writeFileSync(new URL('sitemap.xml', dist), buildSitemap(siteUrl));
writeFileSync(new URL('robots.txt', dist), buildRobots(siteUrl));
console.log(`sitemap.xml y robots.txt generados para ${siteUrl}`);

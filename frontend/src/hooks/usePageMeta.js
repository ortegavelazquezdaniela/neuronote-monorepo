import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { DEFAULT_SITE_URL } from '../utils/site';

const BASE = 'NEURONOTE';
const HOME_TITLE = `${BASE} · Rutas de calma y espacios sensoriales`;
export const DEFAULT_DESCRIPTION =
  'NEURONOTE ayuda a personas neurodivergentes y con sensibilidad sensorial a encontrar rutas peatonales más tranquilas, oasis sensoriales e información ambiental.';

/** Dominio público del frontend (canonical, og:url y sitemap). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

/** Busca o crea una etiqueta en <head> (sin duplicar las que ya trae index.html). */
function headTag(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

const setMeta = (attr, key, content) =>
  headTag(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  }).setAttribute('content', content);

/**
 * Título y metadatos de cada página (equivalente a react-helmet, sin dependencias).
 * - <title> también lo anuncian los lectores de pantalla al cambiar de página.
 * - description, canonical y Open Graph/Twitter para buscadores y vistas previas.
 * - noindex para páginas personales o inexistentes.
 * index.html conserva valores por defecto para los rastreadores que no ejecutan JavaScript.
 */
export function usePageMeta({ title, description = DEFAULT_DESCRIPTION, noindex = false } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = !title ? HOME_TITLE : title.includes(BASE) ? title : `${title} · ${BASE}`;
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    headTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.rel = 'canonical';
      return l;
    }).href = url;
  }, [title, description, noindex, pathname]);
}

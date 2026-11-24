import { overpassQuery } from './overpass';
import { nominatimSearch } from './nominatim';
import { withFallback } from './havens';
import { distanceMeters } from '../utils/geo';

/**
 * Clínicas y servicios de salud mental cercanos, desde OpenStreetMap.
 *
 * Regla del proyecto: NO se inventan establecimientos. Todo viene de OSM, que
 * editan personas voluntarias: puede estar incompleto o desactualizado, así que
 * cada resultado se muestra como «Sin verificar» y con su fuente.
 *
 * Fuentes, en orden (todas de OpenStreetMap):
 *   1. Overpass: etiquetas de salud mental (healthcare=psychotherapist/psychologist,
 *      healthcare:speciality=psychiatry/psychology/…) y nombres («psicólogo»,
 *      «psiquiatría», «salud mental»…) en lugares de salud, oficinas o edificios.
 *   2. Nominatim: búsquedas de texto en la zona (sus servidores son más estables).
 *   3. La última respuesta buena guardada en este navegador (≤ 7 días).
 */

const NAME_RE = '[Pp]sic(o|ó)l(o|ó)g|[Pp]siqui(a|á)tr|[Ss]alud [Mm]ental|[Pp]sicoterap';
const SPECIALITY_RE = 'psychiatry|psychology|psychotherapy|mental';
const NAME_TEST = /psic(o|ó)l(o|ó)g|psiqui(a|á)tr|salud mental|psicoterap/i;
const SEARCH_TERMS = ['psicólogo', 'psicología', 'psiquiatría', 'salud mental', 'psicoterapia'];

export function buildClinicsQuery({ lat, lon }, radius) {
  const around = `(around:${radius},${lat.toFixed(3)},${lon.toFixed(3)})`;
  // Solo se filtra por nombre dentro de claves indexadas (healthcare, amenity, office, building):
  // buscar un nombre en todos los elementos de 10 km satura los servidores públicos.
  const named = (key) => `  nwr["${key}"]["name"~"${NAME_RE}"]${around};`;
  return [
    '[out:json][timeout:20];',
    '(',
    `  nwr["healthcare"~"^(psychotherapist|psychologist)$"]${around};`,
    `  nwr["healthcare:speciality"~"${SPECIALITY_RE}"]${around};`,
    `  nwr["amenity"~"^(clinic|doctors|hospital|social_facility)$"]["name"~"${NAME_RE}"]${around};`,
    named('healthcare'),
    named('office'),
    named('building'),
    ');',
    'out center tags 80;',
  ].join('\n');
}

/** Qué tipo de servicio es, en palabras sencillas. */
export function clinicKind(tags = {}) {
  const spec = tags['healthcare:speciality'] ?? '';
  const name = tags.name ?? '';
  if (/psychiatry/.test(spec) || /siqui/i.test(name)) return 'Psiquiatría';
  if (tags.healthcare === 'psychotherapist' || /psychotherapy/.test(spec) || /sicoterap/i.test(name)) return 'Psicoterapia';
  if (tags.healthcare === 'psychologist' || /psychology/.test(spec) || /sic(o|ó)l(o|ó)g/i.test(name)) return 'Psicología';
  if (/salud mental/i.test(name) || /mental/.test(spec)) return 'Salud mental';
  return 'Atención en salud mental';
}

const firstPhone = (tags) =>
  (tags.phone ?? tags['contact:phone'] ?? tags['contact:mobile'] ?? '').split(';')[0].trim() || null;

/** Normaliza un elemento de OSM. Devuelve null si no sirve (sin nombre o sin coordenadas). */
export function toClinic(el, origin) {
  const tags = el.tags ?? {};
  const lat = Number(el.lat ?? el.center?.lat);
  const lon = Number(el.lon ?? el.center?.lon);
  if (!tags.name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  // Asesorías que no son de salud mental (p. ej. nutrición) no entran
  if (tags.healthcare === 'counselling' && !new RegExp(SPECIALITY_RE).test(tags['healthcare:speciality'] ?? '')) return null;
  const phone = firstPhone(tags);
  return {
    id: `${el.type}-${el.id}`,
    name: tags.name,
    kind: clinicKind(tags),
    lat,
    lon,
    distance: origin ? Math.round(distanceMeters(origin, { lat, lon })) : null,
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null,
    website: tags.website ?? tags['contact:website'] ?? null,
    openingHours: tags.opening_hours ?? null,
    address: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}

/**
 * Resultado de Nominatim → elemento tipo Overpass. Solo se aceptan lugares de salud,
 * oficinas o edificios cuyo nombre sea de salud mental (no calles ni escuelas).
 */
export function fromNominatim(r) {
  const okCategory =
    ['healthcare', 'office', 'building'].includes(r.category) ||
    (r.category === 'amenity' && ['clinic', 'doctors', 'hospital', 'social_facility'].includes(r.type));
  if (!okCategory || !NAME_TEST.test(r.name ?? '')) return null;
  return {
    type: r.osm_type,
    id: r.osm_id,
    lat: r.lat,
    lon: r.lon,
    tags: {
      ...(r.extratags ?? {}),
      name: r.name,
      ...(r.address?.road ? { 'addr:street': r.address.road } : {}),
      ...(r.address?.house_number ? { 'addr:housenumber': r.address.house_number } : {}),
    },
  };
}

async function overpassClinics(point, radius, signal) {
  const data = await overpassQuery(buildClinicsQuery(point, radius), {
    cacheKey: `clinics:ovp:${point.lat.toFixed(2)},${point.lon.toFixed(2)},${radius}`,
    timeout: 7_000, // si Overpass está saturado, pasar pronto a Nominatim
    signal,
  });
  return data.elements;
}

async function nominatimClinics(point, radius, signal) {
  const elements = [];
  for (const term of SEARCH_TERMS) {
    const results = await nominatimSearch(term, point, radius, { signal });
    elements.push(...results.map(fromNominatim).filter(Boolean));
  }
  return elements;
}

/**
 * Clínicas ordenadas por distancia (las más cercanas primero).
 * Devuelve { items, fetchedAt, stale, source }.
 */
export async function getNearbyClinics(point, { radius = 10_000, limit = 8, signal } = {}) {
  const key = `clinics:${point.lat.toFixed(2)},${point.lon.toFixed(2)},${radius}`;
  const res = await withFallback(
    key,
    [
      ['overpass', () => overpassClinics(point, radius, signal)],
      ['nominatim', () => nominatimClinics(point, radius, signal)],
    ],
    signal,
  );
  const seen = new Set();
  const items = res.items
    .map((el) => toClinic(el, point))
    .filter((c) => c && c.distance <= radius * 1.05 && !seen.has(c.id) && seen.add(c.id))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  return { ...res, items };
}

/**
 * Búsqueda más amplia en la app de mapas de la persona (Google Maps).
 * Se usa solo si la persona pulsa el enlace; las coordenadas van redondeadas (~1 km).
 */
export function mapsSearchUrl(point) {
  const at = point ? `/@${point.lat.toFixed(2)},${point.lon.toFixed(2)},13z` : '';
  return `https://www.google.com/maps/search/${encodeURIComponent('clínica psicológica')}${at}`;
}

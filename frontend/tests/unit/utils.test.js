import { describe, it, expect } from 'vitest';
import { validateNote, cleanText } from '../../src/utils/validation';
import { distanceMeters, formatDistance, formatDuration, nearbyCalmPlaces } from '../../src/utils/geo';
import { enrichRoutes, sortRoutes } from '../../src/utils/routeScoring';
import { buildWhatsAppLink, validatePhone, digitsOnly, DEFAULT_SOS_MESSAGE } from '../../src/utils/whatsapp';
import { typeFromTags, typeFromCategory, makeHaven } from '../../src/utils/havenTypes';
import { scaleOptions, listOptions, toLocalInput, formatWhen, NOISE_LABELS } from '../../src/utils/noteLabels';
import { MODULES, MODULE_BY_ID, NAV_LINKS } from '../../src/utils/modules';
import { HELPLINES } from '../../src/utils/helplines';

describe('validateNote', () => {
  const ok = { place: 'Parque', when: '2026-11-20T10:00', noise: 2, comfort: 4, light: '', crowd: 'poca', text: '' };
  const now = new Date('2026-11-22T12:00:00');

  it('acepta una nota válida y normaliza la fecha', () => {
    const r = validateNote(ok, now);
    expect(r.ok).toBe(true);
    expect(r.data).toMatchObject({ place: 'Parque', noise: 2, comfort: 4, light: null, crowd: 'poca' });
    expect(r.data.when).toMatch(/Z$/);
  });

  it('reporta cada campo obligatorio faltante', () => {
    const r = validateNote({ place: '', when: '', noise: null, comfort: null }, now);
    expect(Object.keys(r.errors)).toEqual(['place', 'when', 'noise', 'comfort']);
  });

  it('rechaza fechas futuras, textos largos y opciones inventadas', () => {
    const r = validateNote({ ...ok, when: '2030-01-01T00:00', text: 'x'.repeat(501), light: 'neón', crowd: 'enorme', place: 'a' }, now);
    expect(Object.keys(r.errors).sort()).toEqual(['crowd', 'light', 'place', 'text', 'when']);
    expect(validateNote({ ...ok, place: 'x'.repeat(81) }, now).errors.place).toMatch(/80/);
    expect(validateNote({ ...ok, when: 'no-es-fecha' }, now).errors.when).toMatch(/no es válida/);
  });

  it('cleanText quita caracteres de control y espacios repetidos', () => {
    expect(cleanText('  hola\u0000   mundo\t ')).toBe('hola mundo');
    expect(cleanText(undefined)).toBe('');
  });
});

describe('geo', () => {
  it('calcula distancias con Haversine (Zócalo → Alameda ≈ 1.15 km)', () => {
    const d = distanceMeters({ lat: 19.4326, lon: -99.1332 }, { lat: 19.4357, lon: -99.144 });
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1250);
  });

  it('da formato a distancias y duraciones', () => {
    expect(formatDistance(437)).toBe('440 m');
    expect(formatDistance(3441)).toBe('3,4 km');
    expect(formatDuration(1080)).toBe('18 min');
    expect(formatDuration(5400)).toBe('1 h 30 min');
  });

  it('cuenta lugares tranquilos cerca de una ruta', () => {
    const path = [[19.433, -99.133], [19.434, -99.138]];
    const places = [{ lat: 19.4331, lon: -99.1331 }, { lat: 19.5, lon: -99.2 }];
    expect(nearbyCalmPlaces(path, places)).toBe(1);
  });
});

describe('routeScoring', () => {
  const routes = [
    { id: 'a', distance: 1000, duration: 600, path: [[19.433, -99.133]] },
    { id: 'b', distance: 1200, duration: 700, path: [[19.44, -99.14]] },
  ];
  const havens = [{ lat: 19.44, lon: -99.14 }, { lat: 19.4401, lon: -99.1401 }];

  it('prioriza la ruta con más lugares tranquilos por km en modo calma', () => {
    const enriched = enrichRoutes(routes, havens);
    expect(enriched.find((r) => r.id === 'b').calm).toBe(2);
    expect(sortRoutes(enriched, 'calm')[0].id).toBe('b');
  });

  it('prioriza la más rápida en modo rápido', () => {
    expect(sortRoutes(enrichRoutes(routes, havens), 'fast')[0].id).toBe('a');
  });
});

describe('whatsapp', () => {
  it('arma un enlace wa.me con el mensaje codificado', () => {
    const link = buildWhatsAppLink('+52', '55 1234-5678');
    expect(link).toBe(`https://wa.me/525512345678?text=${encodeURIComponent(DEFAULT_SOS_MESSAGE)}`);
  });

  it('valida números E.164', () => {
    expect(validatePhone('', '5512345678')).toMatch(/país/);
    expect(validatePhone('52', '')).toMatch(/número/);
    expect(validatePhone('52', '123')).toMatch(/completo/);
    expect(validatePhone('52', '5512345678')).toBeNull();
    expect(digitsOnly('(55) 12-34')).toBe('551234');
  });
});

describe('havenTypes', () => {
  it('reconoce tipos desde etiquetas OSM y categorías de Nominatim', () => {
    expect(typeFromTags({ leisure: 'park' })).toBe('park');
    expect(typeFromTags({ shop: 'bakery' })).toBeNull();
    expect(typeFromCategory('amenity', 'library')).toBe('library');
    expect(typeFromCategory('amenity', 'bar')).toBeNull();
  });

  it('normaliza una ficha', () => {
    const h = makeHaven({ osmType: 'way', osmId: 1, name: 'X', type: 'park', lat: '1', lon: '2', tags: { 'addr:street': 'Calle', 'addr:housenumber': '3', website: 'https://x.test' } });
    expect(h).toMatchObject({ id: 'way-1', lat: 1, lon: 2, address: 'Calle 3', website: 'https://x.test', verified: false });
  });
});

describe('noteLabels y catálogos', () => {
  it('genera opciones de escala y de lista', () => {
    expect(scaleOptions(NOISE_LABELS)[0]).toEqual({ value: 1, label: '1', description: 'Muy tranquilo' });
    expect(listOptions({ a: 'A' })).toEqual([{ value: '', label: 'Sin indicar' }, { value: 'a', label: 'A' }]);
    expect(toLocalInput(new Date('2026-11-22T10:30:00'))).toBe('2026-11-22T10:30');
    expect(formatWhen('2026-11-22T10:30:00')).toMatch(/2026/);
  });

  it('mantiene catálogos coherentes', () => {
    expect(MODULES).toHaveLength(5);
    expect(MODULE_BY_ID.sos.path).toBe('/auxilio-inmediato');
    expect(NAV_LINKS[0].path).toBe('/');
    expect(HELPLINES.lineaDeLaVida.tel).toBe('tel:+528009112000');
  });
});

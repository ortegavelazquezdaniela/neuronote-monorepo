/**
 * Tipos de lugar que NEURONOTE considera candidatos a oasis sensorial,
 * con su equivalencia en etiquetas de OpenStreetMap.
 */
export const HAVEN_TYPES = {
  park: { label: 'Parque', key: 'leisure', value: 'park' },
  garden: { label: 'Jardín', key: 'leisure', value: 'garden' },
  library: { label: 'Biblioteca', key: 'amenity', value: 'library' },
  museum: { label: 'Museo', key: 'tourism', value: 'museum' },
};

/** Tipo a partir de las etiquetas OSM (Overpass): { leisure: 'park', ... } */
export function typeFromTags(tags = {}) {
  return Object.entries(HAVEN_TYPES).find(([, t]) => tags[t.key] === t.value)?.[0] ?? null;
}

/** Tipo a partir de category/type de Nominatim: ('leisure', 'park') */
export function typeFromCategory(category, type) {
  return Object.entries(HAVEN_TYPES).find(([, t]) => t.key === category && t.value === type)?.[0] ?? null;
}

/** Ficha normalizada, venga de Overpass o de Nominatim. */
export function makeHaven({ osmType, osmId, name, type, lat, lon, tags = {}, address = null }) {
  return {
    id: `${osmType}-${osmId}`,
    osmUrl: `https://www.openstreetmap.org/${osmType}/${osmId}`,
    name,
    type,
    lat: Number(lat),
    lon: Number(lon),
    wheelchair: tags.wheelchair ?? null, // yes | limited | no
    openingHours: tags.opening_hours ?? null,
    website: tags.website ?? tags['contact:website'] ?? null,
    address: address || [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null,
    verified: false,
  };
}

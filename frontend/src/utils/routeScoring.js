import { nearbyCalmPlaces } from './geo';

/**
 * Puntuación sensorial ESTIMADA de cada ruta: cuántos lugares tranquilos
 * (parques, jardines, bibliotecas, museos de OpenStreetMap) quedan a menos de
 * 120 m del trayecto, por kilómetro. No mide ruido: cuando existan reportes
 * comunitarios (Fase 4) se sumarán como dato "Reportado".
 */
export function enrichRoutes(routes, havens) {
  return routes.map((r) => {
    const calm = nearbyCalmPlaces(r.path, havens);
    return { ...r, calm, calmPerKm: calm / Math.max(0.3, r.distance / 1000) };
  });
}

/** priority: 'fast' (menor tiempo) | 'calm' (más lugares tranquilos por km). */
export function sortRoutes(routes, priority) {
  const list = [...routes];
  if (priority === 'calm') list.sort((a, b) => b.calmPerKm - a.calmPerKm || a.duration - b.duration);
  else list.sort((a, b) => a.duration - b.duration);
  return list;
}

import { useEffect } from 'react';

const BASE = 'NEURONOTE';

/** Actualiza el <title> en cada página para lectores de pantalla y pestañas. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} · Rutas de calma y espacios sensoriales`;
  }, [title]);
}

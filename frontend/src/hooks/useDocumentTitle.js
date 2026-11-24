import { usePageMeta } from './usePageMeta';

/**
 * Atajo histórico: solo el título (la descripción queda la general del sitio).
 * Las páginas nuevas deberían usar usePageMeta con su propia descripción.
 */
export function useDocumentTitle(title) {
  usePageMeta({ title });
}

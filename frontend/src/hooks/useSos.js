import { useContext } from 'react';
import { SosContext } from '../providers/contexts';

/** { open, openSos(), closeSos() } */
export function useSos() {
  const ctx = useContext(SosContext);
  if (!ctx) throw new Error('useSos debe usarse dentro de <SosProvider>');
  return ctx;
}

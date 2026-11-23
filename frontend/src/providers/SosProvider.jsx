import { useCallback, useEffect, useMemo, useState } from 'react';
import { SosContext } from './contexts';
import { CrisisDialog } from '../organisms/CrisisDialog';

/**
 * Estado global del apoyo SOS y atajo de teclado Alt + C (desde cualquier pantalla).
 * Se usa event.code para que funcione también con teclados en otros idiomas.
 */
export function SosProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openSos = useCallback(() => setOpen(true), []);
  const closeSos = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyC') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ open, openSos, closeSos }), [open, openSos, closeSos]);

  return (
    <SosContext.Provider value={value}>
      {children}
      <CrisisDialog open={open} onClose={closeSos} />
    </SosContext.Provider>
  );
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PreferencesContext } from './contexts';
import { DEFAULT_PREFS, loadPrefs, persistPrefs } from '../services/preferencesStore';

const THEME_COLOR = {
  default: '#184077',
  calm: '#345c61',
  contrast: '#000000',
  night: '#0f1a2a',
};

function useSystemReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Aplica las preferencias al elemento <html> (data-theme, data-font,
 * data-motion y --text-scale) para que todo el design system reaccione.
 */
export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saveError, setSaveError] = useState(false);
  const systemReduced = useSystemReducedMotion();

  const reducedMotion =
    prefs.motion === 'reduced' || (prefs.motion === 'system' && systemReduced) || prefs.theme === 'calm';

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = prefs.theme;
    root.dataset.font = prefs.font;
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.style.setProperty('--text-scale', String(prefs.textScale));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[prefs.theme]);
  }, [prefs.theme, prefs.font, prefs.textScale, reducedMotion]);

  // Se guarda en el mismo momento en que cambian (sin efectos en cascada)
  const latest = useRef(prefs);
  const commit = useCallback((next) => {
    latest.current = next;
    setPrefs(next);
    setSaveError(!persistPrefs(next));
  }, []);

  const update = useCallback((patch) => commit({ ...latest.current, ...patch }), [commit]);
  const reset = useCallback(
    () => commit({ ...DEFAULT_PREFS, remember: latest.current.remember }),
    [commit],
  );

  const value = useMemo(
    () => ({ prefs, update, reset, reducedMotion, saveError }),
    [prefs, update, reset, reducedMotion, saveError],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

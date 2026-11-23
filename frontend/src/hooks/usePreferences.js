import { useContext } from 'react';
import { PreferencesContext } from '../providers/contexts';

/** { prefs, update(patch), reset(), reducedMotion, saveError } */
export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de <PreferencesProvider>');
  return ctx;
}

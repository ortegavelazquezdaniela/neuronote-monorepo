import { useEffect, useState } from 'react';
import { useAsync } from './useAsync';
import { api, apiEnabled } from '../services/api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Profesionales verificados (API) + indicador "en línea" en tiempo real
 * (Supabase Realtime sobre la tabla pública psychologist_presence).
 * supabase-js se descarga solo cuando esta vista lo necesita.
 */
export function usePsychologist() {
  const list = useAsync((signal) => api('/psychologists', { auth: false, signal }), [], { enabled: apiEnabled() });
  const [online, setOnline] = useState({});
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return undefined;
    let channel;
    let client;
    let cancelled = false;
    // supabase-js (~60 kB comprimido) se descarga cuando el navegador queda libre,
    // para no competir con el contenido de Ayuda SOS, que debe verse primero.
    const connect = () => import('@supabase/supabase-js').then(({ createClient }) => {
      if (cancelled) return;
      client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
      channel = client
        .channel('psychologist-presence')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'psychologist_presence' }, (payload) => {
          const row = payload.new?.psychologist_id ? payload.new : payload.old;
          if (row?.psychologist_id) setOnline((o) => ({ ...o, [row.psychologist_id]: Boolean(payload.new?.online) }));
        })
        .subscribe((state) => setLive(state === 'SUBSCRIBED'));
    });
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const idleId = idle(connect, { timeout: 3000 });
    return () => {
      cancelled = true;
      cancelIdle(idleId);
      if (client && channel) client.removeChannel(channel);
    };
  }, []);

  const items = (list.data?.items ?? []).map((p) => ({ ...p, online: online[p.id] ?? p.online }));
  return { ...list, items, live, enabled: apiEnabled() };
}

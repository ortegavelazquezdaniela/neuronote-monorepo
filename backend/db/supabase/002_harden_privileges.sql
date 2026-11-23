-- NEURONOTE · migración 002 (23-nov-2026)
-- Corrige el aviso del asesor de seguridad de Supabase: la función del trigger
-- era invocable vía /rest/v1/rpc por anon/authenticated. Los triggers siguen
-- funcionando sin ese permiso.
revoke execute on function public.sync_psychologist_presence() from public, anon, authenticated;

-- Defensa en profundidad: además de RLS sin políticas, los roles del navegador
-- no tienen permiso de lectura sobre las tablas privadas.
revoke select on public.app_users, public.sensory_profiles, public.favorite_havens,
  public.psychologists, public.access_audit from anon, authenticated;

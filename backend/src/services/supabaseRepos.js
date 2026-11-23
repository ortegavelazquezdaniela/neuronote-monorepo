import { createClient } from '@supabase/supabase-js';

/**
 * PostgreSQL gestionado (Supabase) para datos relacionales: cuentas, perfiles
 * sensoriales, favoritos, psicólogos y bitácora de accesos.
 * Usa la clave SECRETA solo en el servidor. Las tablas tienen RLS activado:
 * desde el navegador (clave publicable) no se puede leer ni escribir nada de esto,
 * excepto la tabla pública psychologist_presence (ver db/supabase/001_init.sql).
 */

function check({ data, error }) {
  if (error) {
    const err = new Error(`Supabase: ${error.message}`);
    err.code = error.code;
    throw err;
  }
  return data;
}

const toUser = (r) =>
  r && {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    displayName: r.display_name,
    role: r.role,
    createdAt: r.created_at,
  };

const toProfile = (r) =>
  r && {
    noiseSensitivity: r.noise_sensitivity,
    lightSensitivity: r.light_sensitivity,
    crowdSensitivity: r.crowd_sensitivity,
    heatSensitivity: r.heat_sensitivity,
    routePriority: r.route_priority,
    updatedAt: r.updated_at,
  };

export function createSupabaseRepos({ url, secretKey }) {
  const db = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

  return {
    users: {
      async findByEmail(email) {
        return toUser(check(await db.from('app_users').select('*').eq('email', email).maybeSingle()));
      },
      async findById(id) {
        return toUser(check(await db.from('app_users').select('*').eq('id', id).maybeSingle()));
      },
      async create({ email, passwordHash, displayName, role = 'user' }) {
        const row = { email, password_hash: passwordHash, display_name: displayName, role };
        return toUser(check(await db.from('app_users').insert(row).select('*').single()));
      },
      async remove(id) {
        check(await db.from('app_users').delete().eq('id', id)); // perfiles y favoritos se borran en cascada
      },
      async logAccess(userId, action) {
        check(await db.from('access_audit').insert({ user_id: userId, action }));
      },
    },
    profiles: {
      async get(userId) {
        return toProfile(check(await db.from('sensory_profiles').select('*').eq('user_id', userId).maybeSingle()));
      },
      async upsert(userId, p) {
        const row = {
          user_id: userId,
          noise_sensitivity: p.noiseSensitivity,
          light_sensitivity: p.lightSensitivity,
          crowd_sensitivity: p.crowdSensitivity,
          heat_sensitivity: p.heatSensitivity,
          route_priority: p.routePriority,
          updated_at: new Date().toISOString(),
        };
        return toProfile(check(await db.from('sensory_profiles').upsert(row).select('*').single()));
      },
    },
    favorites: {
      async list(userId) {
        const rows = check(
          await db.from('favorite_havens').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        );
        return rows.map((r) => ({ osmId: r.osm_id, name: r.name, lat: r.lat, lon: r.lon, createdAt: r.created_at }));
      },
      async add(userId, f) {
        const row = { user_id: userId, osm_id: f.osmId, name: f.name, lat: f.lat, lon: f.lon };
        const r = check(await db.from('favorite_havens').upsert(row).select('*').single());
        return { osmId: r.osm_id, name: r.name, lat: r.lat, lon: r.lon, createdAt: r.created_at };
      },
      async remove(userId, osmId) {
        const rows = check(await db.from('favorite_havens').delete().eq('user_id', userId).eq('osm_id', osmId).select());
        return rows.length > 0;
      },
    },
    psychologists: {
      async listApproved() {
        const rows = check(
          await db
            .from('psychologists')
            .select('id, display_name, specialty, whatsapp, online')
            .eq('status', 'approved')
            .eq('license_verified', true),
        );
        return rows.map((r) => ({
          id: r.id,
          displayName: r.display_name,
          specialty: r.specialty,
          whatsapp: r.whatsapp,
          online: r.online,
          status: 'approved',
        }));
      },
    },
  };
}

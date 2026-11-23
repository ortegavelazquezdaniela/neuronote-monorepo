import { config, hasSupabase, hasMongo } from './config.js';
import { createApp } from './app.js';
import { createMemoryRepos } from './services/memoryRepos.js';
import { createSupabaseRepos } from './services/supabaseRepos.js';
import { createMongoRepos, connectMongo } from './services/mongoRepos.js';

/**
 * Servidor HTTP. Usa Supabase y MongoDB si están configurados en .env;
 * si falta alguno, esa parte funciona en memoria y lo avisa en consola y en /api/health.
 */
async function buildRepos() {
  const memory = createMemoryRepos();
  const repos = { ...memory, kind: { users: 'memory', notes: 'memory' } };

  if (hasSupabase()) {
    Object.assign(repos, createSupabaseRepos(config.supabase));
    repos.kind.users = 'supabase';
  } else {
    console.warn('⚠ Supabase no configurado: cuentas, perfiles y favoritos en MEMORIA (se pierden al reiniciar).');
  }

  if (hasMongo()) {
    try {
      await connectMongo(config.mongoUri);
      Object.assign(repos, createMongoRepos());
      repos.kind.notes = 'mongodb';
    } catch (err) {
      console.error('✖ No se pudo conectar a MongoDB:', err.message);
      if (config.isProd) process.exit(1);
    }
  } else {
    console.warn('⚠ MongoDB no configurado: notas y telemetría en MEMORIA (se pierden al reiniciar).');
  }
  return repos;
}

const repos = await buildRepos();
const app = createApp({ repos });
app.listen(config.port, () => {
  console.log(`NEURONOTE API escuchando en http://localhost:${config.port}/api (usuarios: ${repos.kind.users}, notas: ${repos.kind.notes})`);
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      // server.js solo arranca el proceso; los repositorios de nube se prueban contra los servicios reales
      exclude: ['src/server.js', 'src/services/supabaseRepos.js', 'src/services/mongoRepos.js'],
      reporter: ['text', 'html', 'json-summary'],
    },
  },
});

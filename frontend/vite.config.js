/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    sourcemap: false,
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    // Variables fijas para las pruebas: nunca se usan claves reales
    env: {
      VITE_API_URL: 'http://api.test/api',
      VITE_RESTCOUNTRIES_KEY: '',
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_PUBLISHABLE_KEY: '',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      // main.jsx solo monta la app; las historias de Storybook no son código de producción
      exclude: ['src/main.jsx', 'src/**/*.stories.jsx'],
      reporter: ['text-summary', 'text', 'html', 'json-summary'],
      thresholds: { lines: 70, statements: 70, functions: 70, branches: 60 },
    },
  },
});

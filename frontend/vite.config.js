/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { DEFAULT_SITE_URL } from './src/utils/site.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const siteUrl = (loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
  return {
    plugins: [
      react(),
      {
        // index.html necesita URLs absolutas (canonical, Open Graph, JSON-LD)
        name: 'neuronote-site-url',
        transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
      },
    ],
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
  };
});

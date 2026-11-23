import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './msw/handlers';
import { clearMemoryCache } from '../src/services/http';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  clearMemoryCache();
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-motion');
  document.documentElement.removeAttribute('data-font');
});
afterAll(() => server.close());

// --- APIs del navegador que jsdom no implementa ---------------------------------
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  });
}

class IO {
  constructor(cb) {
    this.cb = cb;
  }
  observe(el) {
    this.cb([{ isIntersecting: true, target: el }]);
  }
  disconnect() {}
  unobserve() {}
}
window.IntersectionObserver = IO;
window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

URL.createObjectURL ??= vi.fn(() => 'blob:prueba');
URL.revokeObjectURL ??= vi.fn();

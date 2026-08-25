import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Red de seguridad: ningún test debe llegar a la red real (menos aún a la API
// en vivo de Render). Cada archivo de test que sí necesite `fetch` debe
// mockearlo explícitamente (ver services/api/*.test.ts) — este guard evita
// que un test que se quede sin mockear cuelgue esperando una respuesta real
// o, peor, mute datos reales en el backend.
const originalFetch = globalThis.fetch;
beforeEachFetchGuard();

function beforeEachFetchGuard() {
  globalThis.fetch = vi.fn(() => {
    throw new Error(
      'fetch() real bloqueado en tests — mockea services/core/http o global.fetch en este archivo.'
    );
  }) as unknown as typeof fetch;
}

afterEach(() => {
  // Cada test puede instalar su propio mock de fetch; se restaura el guard
  // genérico entre tests para que un mock de un archivo no se filtre a otro.
  if (globalThis.fetch !== originalFetch) beforeEachFetchGuard();
});

// jsdom no implementa matchMedia; Radix (y next-themes) lo consultan al montar.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

// jsdom no implementa ResizeObserver; algunos primitivos de Radix lo usan.
if (!('ResizeObserver' in window)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - stub mínimo suficiente para los componentes bajo test
  window.ResizeObserver = ResizeObserverStub;
}

// jsdom no implementa IntersectionObserver; Landing.tsx lo usa para animaciones de scroll.
if (!('IntersectionObserver' in window)) {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  // @ts-expect-error - stub mínimo suficiente para los componentes bajo test
  window.IntersectionObserver = IntersectionObserverStub;
}

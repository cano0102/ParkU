import '@testing-library/jest-dom/vitest';

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

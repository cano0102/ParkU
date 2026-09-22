declare module '*.css';
declare module 'react-dom/client'

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  /** 'development' | 'production' | 'test' (Vitest). */
  readonly MODE: string;
}

/** Identificador del build, inyectado por `define` en vite.config.ts / vitest.config.ts. */
declare const __APP_BUILD_ID__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}
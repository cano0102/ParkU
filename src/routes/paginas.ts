import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Páginas que se cargan bajo demanda (cada una en su propio chunk), más la precarga de esos
 * chunks para que la navegación se sienta instantánea.
 *
 * Vive aparte de `index.tsx` para que el layout pueda precargar rutas (`precargarRutas`) sin
 * importar el router entero — `index.tsx` importa a `MainLayout`, y si `MainLayout` importara
 * a `index.tsx` habría un ciclo.
 */

/**
 * Envuelve `import()` para que un chunk que falla al descargarse (típico tras
 * un deploy nuevo: el navegador sigue teniendo cargado el `index.html`/router
 * viejo, que apunta a un archivo hasheado que el deploy actual ya no sirve —
 * "Failed to fetch dynamically imported module") recargue la página UNA vez
 * en vez de quedar en un error. La recarga trae el `index.html` actual, con
 * las referencias correctas a los chunks del build vigente. Si tras recargar
 * sigue fallando (caída real de red, no un deploy), ya no reintenta — se
 * deja propagar a `RouteErrorBoundary`.
 */
const CHUNK_RELOAD_KEY = 'parku-chunk-reload';

type PaginaLazy<P> = LazyExoticComponent<ComponentType<P>> & {
  /** Descarga el chunk sin renderizar nada. Los fallos se ignoran: es solo un adelanto. */
  precargar: () => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyConReintento<T extends { default: ComponentType<any> }>(factory: () => Promise<T>): PaginaLazy<any> {
  const componente = lazy(async () => {
    try {
      const modulo = await factory();
      // Un chunk que sí cargó bien limpia el flag: un reintento pasado no debe
      // impedir que una falla genuina *distinta*, más adelante, se recargue también.
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return modulo;
    } catch (error) {
      const yaReintento = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
      if (!yaReintento) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        return new Promise<T>(() => {}); // la página se recarga; nunca debe resolver.
      }
      throw error;
    }
  }) as PaginaLazy<any>;
  // El módulo queda en la caché de ES modules del navegador: cuando `lazy` vuelva a llamar a
  // `factory()` al renderizar, el `import()` resuelve al instante sin otra petición de red.
  componente.precargar = () => factory().then(() => undefined, () => undefined);
  return componente;
}

/* Pantallas públicas (salvo la landing, que es la entrada y va en el bundle inicial). */
export const Login = lazyConReintento(() => import('@/features/auth').then(m => ({ default: m.Login })));
export const Register = lazyConReintento(() => import('@/features/auth').then(m => ({ default: m.Register })));
export const ForgotPassword = lazyConReintento(() => import('@/features/auth').then(m => ({ default: m.ForgotPassword })));
export const ResetPassword = lazyConReintento(() => import('@/features/auth').then(m => ({ default: m.ResetPassword })));

/* Páginas autenticadas: se cargan bajo demanda, no en el bundle inicial */
export const Dashboard = lazyConReintento(() => import('@/features/dashboard'));
export const Roles = lazyConReintento(() => import('@/features/roles').then(m => ({ default: m.Roles })));
export const Usuarios = lazyConReintento(() => import('@/features/usuarios'));
export const Conductores = lazyConReintento(() => import('@/features/conductores').then(m => ({ default: m.Conductores })));
export const Parqueaderos = lazyConReintento(() => import('@/features/parqueaderos'));
export const ControlSalidaPage = lazyConReintento(() => import('@/features/controlSalida').then(m => ({ default: m.ControlSalidaPage })));
export const Reservas = lazyConReintento(() => import('@/features/reservas').then(m => ({ default: m.Reservas })));
export const Incidentes = lazyConReintento(() => import('@/features/incidentes').then(m => ({ default: m.Incidentes })));
export const Perfil = lazyConReintento(() => import('@/features/perfil').then(m => ({ default: m.Perfil })));
export const MisVehiculos = lazyConReintento(() => import('@/features/misVehiculos').then(m => ({ default: m.MisVehiculos })));

/** Chunk de cada ruta, para precargarlo antes de que alguien haga clic. */
const PAGINA_POR_RUTA: Record<string, PaginaLazy<unknown>> = {
  '/login': Login,
  '/register': Register,
  '/forgot-password': ForgotPassword,
  '/reset-password': ResetPassword,
  '/app/dashboard': Dashboard,
  '/app/perfil': Perfil,
  '/app/roles': Roles,
  '/app/usuarios': Usuarios,
  '/app/conductores': Conductores,
  '/app/parqueaderos': Parqueaderos,
  '/app/entrada-salida': ControlSalidaPage,
  '/app/reservas': Reservas,
  '/app/incidentes': Incidentes,
};

/**
 * Descarga en segundo plano los chunks de las rutas dadas, cuando el navegador esté libre.
 *
 * Los chunks son estáticos y vienen del CDN (no gastan cuota del backend ni de su límite
 * de solicitudes por IP), así que adelantarlos es gratis: cambiar de pantalla deja de
 * esperar una descarga y pasa a ser inmediato. Se respeta el ahorro de datos del
 * dispositivo, y las rutas que no existen se ignoran. Devuelve la función para cancelar.
 */
export function precargarRutas(rutas: string[]): () => void {
  if (typeof window === 'undefined') return () => {};
  // En las pruebas (jsdom) no hay nada que adelantar: solo cargaría media aplicación en cada
  // test que monte el layout, sin que ningún test lo use.
  if (import.meta.env.MODE === 'test') return () => {};
  const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conexion?.saveData) return () => {};

  const ejecutar = () => {
    for (const ruta of rutas) void PAGINA_POR_RUTA[ruta]?.precargar();
  };

  // Safari (también en iPhone) no tiene requestIdleCallback: ahí se espera un momento fijo.
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(ejecutar, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(ejecutar, 300);
  return () => window.clearTimeout(id);
}

/**
 * Backend falso "de toda la app", para los tests de página que antes corrían
 * contra el store mock compartido (`services/core/db.ts`, ya eliminado).
 * Junta un `createFakeRestBackend` (ver `fakeApi.ts`) por dominio y enruta
 * `apiFetch` según el prefijo de la URL — así una página que combina varios
 * hooks de dominio (p. ej. Parqueaderos: parqueaderos+celdas+vehiculos+
 * conductores+controlSalida+reservas) solo necesita un mock.
 *
 * Los datos semilla replican, en la forma de la API real, los mismos
 * nombres/valores que usaba `db.ts` para que las aserciones de los tests de
 * página existentes seguir funcionando con el mínimo de cambios.
 */
import { vi } from 'vitest';
import { createFakeRestBackend } from './fakeApi';
import { ROLES } from '@/services/core/roles';

export const rolesSeed = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema', estado: true },
  { id: 2, nombre: 'Vigilante', descripcion: 'Gestión de entradas y salidas', estado: true },
  { id: 3, nombre: 'Comunidad SENA', descripcion: 'Acceso básico', estado: true },
];

export const usuariosSeed = [
  { id: 1, correo: 'admin@sena.edu.co', contrasena: 'Pass1234', nombre: 'Administrador ParkU', numero_telefonico: '3101234567', rol: 1, estado: 'ACTIVO' },
  { id: 2, correo: 'ana.martinez@sena.edu.co', contrasena: 'Pass1234', nombre: 'Ana Martínez R.', rol: 2, estado: 'ACTIVO' },
  { id: 3, correo: 'pedro.ruiz@sena.edu.co', contrasena: 'Pass1234', nombre: 'Pedro Ruiz G.', rol: 2, estado: 'ACTIVO' },
  { id: 4, correo: 'maria.diaz@ext.com', contrasena: 'Pass1234', nombre: 'María Díaz P.', rol: 3, estado: 'ACTIVO' },
];

export const conductoresSeed = [
  {
    id: 1, usuario_id: 2, tipo_documento: 'CC', numero_documento: '2345678901', nombre_apellidos: 'Carlos López M.',
    correo: 'ana.martinez@sena.edu.co', direccion: null, numero_telefonico: '3102345678', tipo_usuario_id: 1,
    tipo_usuario_nombre: 'Aprendiz', regional_formacion: null, centro_formacion: 'Administración',
    programa_formacion: null, vigencia: null, movilidad_reducida: false, tipo_discapacidad: null, estado: true,
  },
  {
    id: 2, usuario_id: 3, tipo_documento: 'CC', numero_documento: '3456789012', nombre_apellidos: 'Pedro Ruiz G.',
    correo: 'pedro.ruiz@sena.edu.co', direccion: null, numero_telefonico: '3103456789', tipo_usuario_id: 2,
    tipo_usuario_nombre: 'Instructor', regional_formacion: null, centro_formacion: 'Diseño',
    programa_formacion: null, vigencia: null, movilidad_reducida: false, tipo_discapacidad: null, estado: true,
  },
];

export const vehiculosSeed = [
  {
    id: 1, placa: 'ABC123', tipo: 'CARRO', marca: 'Toyota', linea: 'Corolla', modelo: 2020, color: 'Blanco',
    observaciones: 'Sedán 4 puertas', estado: true,
    conductores: [{ id: 1, nombre_apellidos: 'Carlos López M.', DetallePropiedad: { es_principal: true } }],
    conductor_principal_id: 1, conductor_principal_nombre: 'Carlos López M.',
  },
  {
    id: 2, placa: 'DEF456', tipo: 'MOTO', marca: 'Yamaha', linea: 'FZ 25', modelo: 2022, color: 'Negro',
    observaciones: 'Moto deportiva', estado: true,
    conductores: [{ id: 2, nombre_apellidos: 'Pedro Ruiz G.', DetallePropiedad: { es_principal: true } }],
    conductor_principal_id: 2, conductor_principal_nombre: 'Pedro Ruiz G.',
  },
];

export const parqueaderosSeed = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  nombre: `PQ-${i + 1} Torre ${String.fromCharCode(65 + i)}`,
  ubicacion: `Acceso Torre ${String.fromCharCode(65 + i)}`,
  acceso: 'REGIONAL',
  capacidad_maxima: 20,
  hora_apertura: '06:00:00',
  hora_cierre: '22:00:00',
  estado: true,
  zona: `Torre ${String.fromCharCode(65 + i)}`,
  piso: 'Nivel 1',
  descripcion: '',
  tipo: i === 0 ? 'DOCENTES' : 'GENERAL',
}));

export const celdasSeed = [
  { id: 1, parqueadero: 1, numero: 'C-001', tipo: 'CARRO', usabilidad: 'GENERAL', estado: 'OCUPADA', observaciones: null },
  { id: 2, parqueadero: 1, numero: 'C-002', tipo: 'CARRO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
  { id: 3, parqueadero: 1, numero: 'M-001', tipo: 'MOTO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
  // Parqueadero 2 es exclusivo de motos (sin celdas de carro), para poder
  // probar el filtro "Motos" del Dashboard.
  { id: 4, parqueadero: 2, numero: 'M-001', tipo: 'MOTO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
  { id: 5, parqueadero: 2, numero: 'M-002', tipo: 'MOTO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
];

export const controlSalidaSeed = [
  {
    id: 1, vehiculo_id: 1, conductor_id: 1, parqueadero_id: 1, celda_id: 1,
    fecha_hora_ingreso: '2025-06-20T07:15:00.000Z', fecha_hora_salida: null, estado: 'DENTRO' as const,
  },
];

export const reservasSeed: any[] = [];

export const incidentesSeed = [
  {
    id: 1, tipo_novedad: 'MAL_ESTACIONAMIENTO', prioridad: 'MEDIA', descripcion: 'Vehículo mal estacionado bloqueando entrada',
    parqueadero_id: 1, celda_id: 1, vehiculo_id: 1, usuario_asignado_id: null,
    fecha_hora: '2025-06-18T07:15:00.000Z', estado: 'PENDIENTE', justificacion_cierre: null,
  },
  {
    id: 2, tipo_novedad: 'DANIO', prioridad: 'ALTA', descripcion: 'Derrame de aceite con posible caída de vehículo',
    parqueadero_id: 1, celda_id: 2, vehiculo_id: null, usuario_asignado_id: null,
    fecha_hora: '2025-06-16T07:15:00.000Z', estado: 'PENDIENTE', justificacion_cierre: null,
  },
];

export const catalogosSeed = [
  { id: 1, nombre: 'Aprendiz', descripcion: '', estado: true },
  { id: 2, nombre: 'Instructor', descripcion: '', estado: true },
  { id: 3, nombre: 'Administrativo', descripcion: '', estado: true },
  { id: 4, nombre: 'Contratista', descripcion: '', estado: true },
  { id: 5, nombre: 'Visitante', descripcion: '', estado: true },
];

/**
 * Backend falso de `/auth/*`: no es un recurso CRUD estándar (son rutas de
 * acción — login/registro/verificar/recuperar/restablecer), así que no usa
 * `createFakeRestBackend`. Opera directamente sobre `usuariosSeed` (incluida
 * la `contrasena`, que el backend `/usuarios` no expone) para que un usuario
 * registrado en un test pueda loguearse después con las mismas credenciales.
 *
 * `/auth/verificar` no recibe el header `Authorization` real (el mock
 * reemplaza `apiFetch` completo, antes de que `http.ts` lo agregue), así que
 * en su lugar confía en `parkUUser` de localStorage — igual de válido para
 * el propósito del bootstrap de sesión en estos tests.
 */
function createAuthBackend() {
  const resetTokens = new Map<string, string>();

  function findAccount(correo: string) {
    const c = (correo ?? '').trim().toLowerCase();
    return usuariosSeed.find((u) => u.correo.trim().toLowerCase() === c);
  }

  async function apiFetch<R>(path: string, options: { method?: string; body?: unknown } = {}): Promise<R> {
    const method = (options.method ?? 'GET').toUpperCase();
    const body = (options.body ?? {}) as Record<string, any>;

    if (method === 'POST' && path === '/auth/login') {
      const account = findAccount(body.correo);
      if (!account || account.contrasena !== body.contrasena) {
        throw new Error('Contraseña incorrecta. Verifica tus credenciales.');
      }
      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: { id: account.id, correo: account.correo, nombre: account.nombre, rol: account.rol, estado: account.estado },
          token: `fake-token-${account.id}`,
          refreshToken: `fake-refresh-${account.id}`,
          expiresIn: '7d',
        },
      } as unknown as R;
    }

    if (method === 'POST' && path === '/auth/registro') {
      if (findAccount(body.correo)) {
        throw new Error('Ya existe una cuenta registrada con este correo.');
      }
      const nextId = usuariosSeed.reduce((max, u) => Math.max(max, u.id), 0) + 1;
      usuariosSeed.push({
        id: nextId,
        correo: body.correo,
        contrasena: body.contrasena,
        nombre: body.nombre,
        rol: ROLES.CONDUCTOR,
        estado: 'ACTIVO',
      });
      return { success: true, message: 'Registro exitoso', data: {} } as unknown as R;
    }

    if (method === 'POST' && path === '/auth/logout') {
      return { success: true, message: 'Logout exitoso', data: {} } as unknown as R;
    }

    if (method === 'GET' && path === '/auth/verificar') {
      const raw = (() => {
        try { return localStorage.getItem('parkUUser'); } catch { return null; }
      })();
      if (!raw) throw new Error('No autenticado');
      const u = JSON.parse(raw);
      return {
        success: true,
        message: '',
        data: { usuario: { id: Number(u.id), correo: u.correo, nombre: u.nombre, rol: Number(u.rol), estado: 'ACTIVO' } },
      } as unknown as R;
    }

    if (method === 'GET' && path.startsWith('/auth/existe-correo')) {
      const correo = new URLSearchParams(path.split('?')[1] ?? '').get('correo') ?? '';
      return { success: true, existe: !!findAccount(correo) } as unknown as R;
    }

    if (method === 'GET' && path.startsWith('/auth/existe-numero')) {
      const numero = new URLSearchParams(path.split('?')[1] ?? '').get('numero') ?? '';
      const existe = usuariosSeed.some((u) => (u as { numero_telefonico?: string }).numero_telefonico === numero);
      return { success: true, existe } as unknown as R;
    }

    if (method === 'GET' && path.startsWith('/auth/existe-documento')) {
      const qs = new URLSearchParams(path.split('?')[1] ?? '');
      const tipoDocumento = qs.get('tipoDocumento') ?? '';
      const numeroDocumento = qs.get('numeroDocumento') ?? '';
      const existe = conductoresSeed.some((c) => c.tipo_documento === tipoDocumento && c.numero_documento === numeroDocumento);
      return { success: true, existe } as unknown as R;
    }

    if (method === 'POST' && path === '/auth/recuperar-password') {
      const account = findAccount(body.correo);
      const token = account ? `reset-${account.id}-${Math.random().toString(36).slice(2)}` : undefined;
      if (account && token) resetTokens.set(token, account.correo.trim().toLowerCase());
      return { success: true, message: 'Si el correo existe, se generó un enlace', ...(token ? { token } : {}) } as unknown as R;
    }

    if (method === 'POST' && path === '/auth/restablecer-password') {
      const correo = resetTokens.get(body.token);
      if (!correo) throw new Error('El enlace de recuperación no es válido.');
      const account = findAccount(correo);
      if (account) account.contrasena = body.nuevaContrasena;
      resetTokens.delete(body.token);
      return { success: true, message: 'Contraseña actualizada correctamente' } as unknown as R;
    }

    throw new Error(`appFakeApi(auth): sin handler para ${method} ${path}`);
  }

  return { apiFetch: vi.fn(apiFetch) };
}

/** Crea un set fresco de backends por dominio (uno por test, para no filtrar estado entre tests). */
export function createAppBackends() {
  const roles = createFakeRestBackend('/roles', rolesSeed);
  const usuarios = createFakeRestBackend('/usuarios', usuariosSeed.map(({ contrasena: _c, ...u }) => u), {
    actions: [{
      method: 'PATCH', pattern: /^\/(\d+)\/contrasena$/,
      handle: (m, body, items) => {
        const id = Number(m[1]);
        const real = usuariosSeed.find((u) => u.id === id);
        if (!real || real.contrasena !== (body as any).actual) throw new Error('Contraseña actual incorrecta');
        real.contrasena = (body as any).nueva;
        const idx = items.findIndex((i) => i.id === id);
        return idx === -1 ? { message: 'Contraseña actualizada' } : items[idx];
      },
    }],
  });
  const conductores = createFakeRestBackend('/conductores', conductoresSeed);
  const vehiculos = createFakeRestBackend('/vehiculos', vehiculosSeed);
  const parqueaderos = createFakeRestBackend('/parqueaderos', parqueaderosSeed, {
    actions: [{
      method: 'PATCH', pattern: /^\/(\d+)\/estado$/,
      handle: (m, body, items) => {
        const idx = items.findIndex((i) => i.id === Number(m[1]));
        if (idx === -1) throw new Error('404');
        items[idx] = { ...items[idx], estado: (body as any).estado };
        return items[idx];
      },
    }],
  });
  const celdas = createFakeRestBackend('/celdas', celdasSeed);
  const controlSalida = createFakeRestBackend('/entradas-salidas', controlSalidaSeed, {
    actions: [
      {
        method: 'POST', pattern: /^\/entrada$/,
        handle: (_m, body, items) => {
          const b = body as any;
          const nextId = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
          const created = {
            id: nextId, vehiculo_id: b.vehiculo_id, conductor_id: b.conductor_id ?? null,
            parqueadero_id: b.parqueadero_id, celda_id: b.celda_id ?? null,
            fecha_hora_ingreso: b.fecha_hora_ingreso ?? new Date().toISOString(),
            fecha_hora_salida: null, estado: 'DENTRO',
          };
          items.push(created);
          return created;
        },
      },
      {
        method: 'POST', pattern: /^\/salida$/,
        handle: (_m, body, items) => {
          const b = body as any;
          const idx = items.findIndex((i) => i.vehiculo_id === b.vehiculo_id && i.estado === 'DENTRO');
          if (idx === -1) throw new Error('409');
          items[idx] = { ...items[idx], fecha_hora_salida: b.fecha_hora_salida ?? new Date().toISOString(), estado: 'FINALIZADO' };
          return items[idx];
        },
      },
    ],
  });
  const reservas = createFakeRestBackend('/reservas', reservasSeed, {
    actions: [{
      method: 'PATCH', pattern: /^\/(\d+)\/estado$/,
      handle: (m, body, items) => {
        const idx = items.findIndex((i) => i.id === Number(m[1]));
        if (idx === -1) throw new Error('404');
        items[idx] = { ...items[idx], estado: (body as any).estado };
        return items[idx];
      },
    }],
  });
  const incidentes = createFakeRestBackend('/novedades', incidentesSeed);
  const catalogos = createFakeRestBackend('/catalogos/tipos-usuario', catalogosSeed);
  const auth = createAuthBackend();

  const backends: [string, ReturnType<typeof createFakeRestBackend>][] = [
    ['/catalogos/tipos-usuario', catalogos],
    ['/roles-permisos', createFakeRestBackend('/roles-permisos', [])],
    ['/roles', roles],
    ['/usuarios', usuarios],
    ['/conductores', conductores],
    ['/vehiculos', vehiculos],
    ['/parqueaderos', parqueaderos],
    ['/celdas', celdas],
    ['/entradas-salidas', controlSalida],
    ['/reservas', reservas],
    ['/novedades', incidentes],
  ];

  const apiFetch = vi.fn(async (path: string, opts?: object) => {
    // `/auth` no es un recurso CRUD del router genérico (ver createAuthBackend).
    if (path.startsWith('/auth')) return auth.apiFetch(path, opts as any);
    const match = backends.find(([prefix]) => path.startsWith(prefix));
    if (!match) throw new Error(`appFakeApi: sin router para ${path}`);
    return match[1].apiFetch(path, opts as any);
  });

  return { apiFetch, roles, usuarios, conductores, vehiculos, parqueaderos, celdas, controlSalida, reservas, incidentes, catalogos, auth };
}

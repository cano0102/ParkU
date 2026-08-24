/**
 * Sesión/login. Replica 1:1 el comportamiento que hoy vive en AuthContext.tsx
 * (login/registro/reset de contraseña contra el store mock de usuarios), pero
 * como funciones planas sin React — la Fase 2 hace que AuthContext consuma
 * este módulo en vez de tocar el store directamente. No importa
 * services/firebase.ts: la decisión confirmada para esta fase es mantener el
 * mock (ver services/firebase.ts para el motivo).
 */
import * as usuarios from './usuarios';
import * as roles from './roles';
import type { Rol } from '../core/db';

export interface AuthUser {
  id: string;
  correo: string;
  nombre: string;
  numero: string;
  rol: string;
  foto?: string;
}

export interface RegisterInput {
  correo: string;
  password: string;
  nombre: string;
  numero: string;
  tipoUsuario: 'visitante' | 'estudiante' | 'docente' | 'administrativo' | 'otro';
  tipoDocumento: string;
  identificacion: string;
}

export async function login(correo: string, password: string): Promise<AuthUser> {
  const correoNormalizado = correo.trim().toLowerCase();
  const lista = await usuarios.getAll();
  const usuario = lista.find((u) => u.correo.trim().toLowerCase() === correoNormalizado);

  if (!usuario) {
    throw new Error('No existe una cuenta con este correo.');
  }
  if (usuario.estado !== 'activo') {
    throw new Error('Esta cuenta está desactivada. Contacta al administrador.');
  }
  if (usuario.password !== password) {
    throw new Error('Contraseña incorrecta. Verifica tus credenciales.');
  }

  return {
    id: usuario.id,
    correo: usuario.correo,
    nombre: usuario.nombre,
    numero: usuario.numero,
    rol: usuario.rol,
    foto: usuario.foto,
  };
}

export async function register(data: RegisterInput): Promise<AuthUser> {
  const correoNormalizado = data.correo.trim().toLowerCase();
  const identificacionNormalizada = data.identificacion.trim();

  const lista = await usuarios.getAll();
  const duplicado = lista.find(
    (u) =>
      u.correo.trim().toLowerCase() === correoNormalizado ||
      (identificacionNormalizada && u.identificacion.trim() === identificacionNormalizada),
  );
  if (duplicado) {
    if (duplicado.correo.trim().toLowerCase() === correoNormalizado) {
      throw new Error('Ya existe una cuenta registrada con este correo.');
    }
    throw new Error('Ya existe una cuenta registrada con ese número de identificación.');
  }

  const nombre = data.nombre.trim();
  const numero = data.numero.trim();

  const creado = await usuarios.create({
    correo: correoNormalizado,
    password: data.password,
    nombre,
    numero,
    rol: 'Comunidad SENA',
    tipoUsuario: data.tipoUsuario,
    tipoDocumento: data.tipoDocumento,
    identificacion: identificacionNormalizada,
    estado: 'activo',
  });

  return {
    id: creado.id,
    correo: creado.correo,
    nombre: creado.nombre,
    numero: creado.numero,
    rol: creado.rol,
  };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const usuario = await usuarios.getById(userId);
  if (!usuario || usuario.password !== currentPassword) return false;
  await usuarios.update(userId, { password: newPassword });
  return true;
}

/* Recuperación de contraseña sin servicio de correo externo (igual que hoy):
   un token de un solo uso con 30 min de vigencia, guardado en memoria. Antes
   vivía como useState dentro de AuthContext; nada en esta lógica es
   específico de React. */
interface ResetRequest {
  token: string;
  usuarioId: string;
  correo: string;
  expiresAt: number;
  usado: boolean;
}

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
let resetRequests: ResetRequest[] = [];

export async function requestPasswordReset(correo: string): Promise<string | null> {
  const correoNormalizado = correo.trim().toLowerCase();
  const lista = await usuarios.getAll();
  const usuario = lista.find((u) => u.correo.trim().toLowerCase() === correoNormalizado);
  if (!usuario) return null;

  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  resetRequests = [
    ...resetRequests,
    { token, usuarioId: usuario.id, correo: usuario.correo, expiresAt: Date.now() + RESET_TOKEN_TTL_MS, usado: false },
  ];

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ ok: boolean; message?: string }> {
  const solicitud = resetRequests.find((r) => r.token === token);
  if (!solicitud) return { ok: false, message: 'El enlace de recuperación no es válido.' };
  if (solicitud.usado) return { ok: false, message: 'Este enlace ya fue utilizado. Solicita uno nuevo.' };
  if (Date.now() > solicitud.expiresAt) return { ok: false, message: 'El enlace de recuperación expiró. Solicita uno nuevo.' };

  await usuarios.update(solicitud.usuarioId, { password: newPassword });
  resetRequests = resetRequests.map((r) => (r.token === token ? { ...r, usado: true } : r));

  return { ok: true };
}

/** Permisos del rol por nombre (null si el rol fue borrado o está inactivo —
 * deniega por defecto, igual que el `hasPermission` actual). */
export async function getPermisos(rolNombre: string): Promise<Rol['permisos'] | null> {
  const lista = await roles.getAll();
  const rol = lista.find((r) => r.nombre === rolNombre);
  return rol && rol.estado === 'activo' ? rol.permisos : null;
}

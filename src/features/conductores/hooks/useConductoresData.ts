import { useCallback, useMemo } from "react";
import { useConductores, useCreateConductor, useUpdateConductor, useRemoveConductor } from "./useConductores";
import type { Conductor } from "@/services/api/conductores";
import {
  useVehiculos, useCreateVehiculo, useUpdateVehiculo, useRemoveVehiculo,
  useAgregarPropietarioVehiculo, useQuitarPropietarioVehiculo,
} from "./useVehiculos";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useUsuarios } from "@/features/usuarios";
import type { Usuario } from "@/services/api/usuarios";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useFotos } from "@/hooks/useFotos";

// Referencias ESTABLES para cuando la query todavía no resolvió: `data: x = []` con un
// literal inline crea un array NUEVO en cada render mientras `data` sigue `undefined`, lo que
// rompe la memoización de cualquier `useMemo`/`useCallback` que dependa de ese valor (aquí,
// `placasOcupadas`/`validate` en useConductorForm.ts) — eso deja un `useEffect` reejecutándose
// en un bucle infinito (formData→validate→setFormErrors→render→validate de nuevo) que además
// nunca deja que la promesa de la consulta real llegue a resolver (confirmado: reproducible
// también renderizando <Conductores/> tal cual, sin pasar por Parqueaderos — no es un bug
// introducido por el asistente de "Estacionar Vehículo", solo el primer lugar que lo hizo
// notorio, porque ConductoresPage.test.tsx tiene sus pruebas en `.skip`).
const EMPTY_CONDUCTORES: Conductor[] = [];
const EMPTY_USUARIOS: Usuario[] = [];
const EMPTY_VEHICULOS: Vehiculo[] = [];

/** Queries, mutaciones y totales de la página de Conductores. */
export function useConductoresData() {
  const { user } = useAuth();
  const { data: conductores = EMPTY_CONDUCTORES, isLoading } = useConductores();
  // Solo Admin puede listar /api/usuarios — un Vigilante (que sí llega a esta pantalla,
  // permiso `conductores`) recibía un 403 real en cada visita; con el toast global de errores
  // (ver App.tsx) eso pasó de quedar en `[]` en silencio a mostrarse como error visible.
  const { data: usuarios = EMPTY_USUARIOS } = useUsuarios({ enabled: user?.rol === ROLES.ADMIN });
  const { data: vehiculos = EMPTY_VEHICULOS } = useVehiculos();
  const createConductorMutation = useCreateConductor();
  const updateConductorMutation = useUpdateConductor();
  const removeConductorMutation = useRemoveConductor();
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();
  const removeVehiculoMutation = useRemoveVehiculo();
  const agregarPropietarioMutation = useAgregarPropietarioVehiculo();
  const quitarPropietarioMutation = useQuitarPropietarioVehiculo();

  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación en realidad falla.
  const addConductor = (data: Omit<Conductor, "id">) => createConductorMutation.mutateAsync(data);
  const updateConductor = (id: string, data: Partial<Omit<Conductor, "id">>) =>
    updateConductorMutation.mutateAsync({ id, data });
  // Borrado real. El backend solo lo permite si el conductor no tiene entradas, salidas ni
  // reservas; su cuenta de acceso y sus vehículos sobreviven (solo se va el vínculo).
  const removeConductor = (id: string) => removeConductorMutation.mutateAsync(id);
  const addVehiculo = (data: Omit<Vehiculo, "id">) => createVehiculoMutation.mutateAsync(data);
  const updateVehiculo = (id: string, data: Partial<Omit<Vehiculo, "id">>) =>
    updateVehiculoMutation.mutateAsync({ id, data });
  // Borrado real. El backend solo lo permite si el vehículo no tiene operaciones (entradas,
  // salidas, parqueos, novedades ni reservas); si las tiene responde 409 diciendo cuáles.
  const removeVehiculo = (id: string) => removeVehiculoMutation.mutateAsync(id);
  const agregarPropietario = (vehiculoId: string, conductorId: string) =>
    agregarPropietarioMutation.mutateAsync({ vehiculoId, conductorId });
  const quitarPropietario = (vehiculoId: string, conductorId: string) =>
    quitarPropietarioMutation.mutateAsync({ vehiculoId, conductorId });

  // Cuenta de acceso vinculada (opcional): no todo conductor real tiene una.
  const getUsuario = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  // Un vehículo vinculado como copropietario (ver `agregarPropietario`) NUNCA cambia su
  // `conductorId` (sigue apuntando al propietario principal) — filtrar solo por eso dejaba
  // al copropietario recién vinculado invisible en su propia tarjeta (0 vehículos, o sin el
  // nuevo en la lista) aunque el backend sí lo hubiera vinculado correctamente. `copropietarios`
  // ya trae TODOS los conductores vinculados (principal + copropietarios), así que basta con
  // buscar ahí también.
  const getVehiculosConductor = useCallback(
    (id: string) => vehiculos.filter((v) => v.conductorId === id || v.copropietarios?.some((p) => p.id === id)),
    [vehiculos]
  );

  /**
   * Foto de perfil del conductor. `conductor` tampoco tiene columna de foto en la API real,
   * así que vive en este navegador (services/core/fotosPerfil.ts). Si el conductor no tiene
   * una propia pero SÍ está vinculado a una cuenta, se usa la de esa cuenta: es la misma
   * persona, y así la foto que alguien se puso desde Perfil (o que un Admin le cargó en
   * Usuarios) también lo identifica aquí, sin volver a subirla.
   */
  const { fotos: fotosConductores, guardarFoto: guardarFotoConductor } = useFotos("conductor");
  const { fotos: fotosUsuarios } = useFotos("usuario");
  const fotoDeConductor = useCallback(
    (c: Conductor) => fotosConductores.get(c.id) ?? (c.usuarioId ? fotosUsuarios.get(c.usuarioId) : undefined),
    [fotosConductores, fotosUsuarios]
  );

  const totalActivos = useMemo(() => conductores.filter((c) => c.estado === "activo").length, [conductores]);
  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);
  const totalConductores = useMemo(() => conductores.length, [conductores]);
  const totalCarros = useMemo(() => vehiculos.filter((v) => v.tipo === "carro").length, [vehiculos]);
  const totalMotos = useMemo(() => vehiculos.filter((v) => v.tipo === "moto").length, [vehiculos]);

  return {
    conductores, usuarios, vehiculos,
    addConductor, updateConductor, removeConductor,
    addVehiculo, updateVehiculo, removeVehiculo, agregarPropietario, quitarPropietario,
    getUsuario, getVehiculosConductor, fotoDeConductor, guardarFotoConductor,
    totalActivos, totalVehiculos, totalConductores, totalCarros, totalMotos,
    isLoading,
  };
}

export type ConductoresData = ReturnType<typeof useConductoresData>;

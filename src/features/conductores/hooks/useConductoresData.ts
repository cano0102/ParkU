import { useCallback, useMemo } from "react";
import { useConductores, useCreateConductor, useUpdateConductor } from "./useConductores";
import type { Conductor } from "@/services/api/conductores";
import { useVehiculos, useCreateVehiculo, useUpdateVehiculo, useAgregarPropietarioVehiculo } from "./useVehiculos";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useUsuarios } from "@/features/usuarios";

/** Queries, mutaciones y totales de la página de Conductores. */
export function useConductoresData() {
  const { data: conductores = [], isLoading } = useConductores();
  const { data: usuarios = [] } = useUsuarios();
  const { data: vehiculos = [] } = useVehiculos();
  const createConductorMutation = useCreateConductor();
  const updateConductorMutation = useUpdateConductor();
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();
  const agregarPropietarioMutation = useAgregarPropietarioVehiculo();

  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación en realidad falla.
  const addConductor = (data: Omit<Conductor, "id">) => createConductorMutation.mutateAsync(data);
  const updateConductor = (id: string, data: Partial<Omit<Conductor, "id">>) =>
    updateConductorMutation.mutateAsync({ id, data });
  const addVehiculo = (data: Omit<Vehiculo, "id">) => createVehiculoMutation.mutateAsync(data);
  const updateVehiculo = (id: string, data: Partial<Omit<Vehiculo, "id">>) =>
    updateVehiculoMutation.mutateAsync({ id, data });
  const agregarPropietario = (vehiculoId: string, conductorId: string) =>
    agregarPropietarioMutation.mutateAsync({ vehiculoId, conductorId });

  // Cuenta de acceso vinculada (opcional): no todo conductor real tiene una.
  const getUsuario = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  const getVehiculosConductor = useCallback((id: string) => vehiculos.filter((v) => v.conductorId === id), [vehiculos]);

  const totalActivos = useMemo(() => conductores.filter((c) => c.estado === "activo").length, [conductores]);
  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);
  const totalConductores = useMemo(() => conductores.length, [conductores]);
  const totalCarros = useMemo(() => vehiculos.filter((v) => v.tipo === "carro").length, [vehiculos]);
  const totalMotos = useMemo(() => vehiculos.filter((v) => v.tipo === "moto").length, [vehiculos]);

  return {
    conductores, usuarios, vehiculos,
    addConductor, updateConductor, addVehiculo, updateVehiculo, agregarPropietario,
    getUsuario, getVehiculosConductor,
    totalActivos, totalVehiculos, totalConductores, totalCarros, totalMotos,
    isLoading,
  };
}

export type ConductoresData = ReturnType<typeof useConductoresData>;

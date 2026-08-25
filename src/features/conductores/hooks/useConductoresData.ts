import { useCallback, useMemo } from "react";
import { useConductores, useCreateConductor, useUpdateConductor } from "./useConductores";
import type { Conductor } from "@/services/api/conductores";
import { useVehiculos, useCreateVehiculo, useUpdateVehiculo } from "./useVehiculos";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useUsuarios } from "@/features/usuarios";

/** Queries, mutaciones y totales de la página de Conductores. */
export function useConductoresData() {
  const { data: conductores = [] } = useConductores();
  const { data: usuarios = [] } = useUsuarios();
  const { data: vehiculos = [] } = useVehiculos();
  const createConductorMutation = useCreateConductor();
  const updateConductorMutation = useUpdateConductor();
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();

  const addConductor = (data: Omit<Conductor, "id">) => createConductorMutation.mutateAsync(data);
  const updateConductor = (id: string, data: Partial<Omit<Conductor, "id">>) =>
    updateConductorMutation.mutate({ id, data });
  const addVehiculo = (data: Omit<Vehiculo, "id">) => createVehiculoMutation.mutate(data);
  const updateVehiculo = (id: string, data: Partial<Omit<Vehiculo, "id">>) =>
    updateVehiculoMutation.mutate({ id, data });

  const getUsuario = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  const getVehiculosConductor = useCallback((id: string) => vehiculos.filter((v) => v.conductorId === id), [vehiculos]);

  const totalActivos = useMemo(() => conductores.filter((c) => c.estado === "activo").length, [conductores]);
  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);
  const totalConductores = useMemo(() => conductores.length, [conductores]);
  const totalCarros = useMemo(() => vehiculos.filter((v) => v.tipo === "carro").length, [vehiculos]);
  const totalMotos = useMemo(() => vehiculos.filter((v) => v.tipo === "moto").length, [vehiculos]);

  return {
    conductores, usuarios, vehiculos,
    addConductor, updateConductor, addVehiculo, updateVehiculo,
    getUsuario, getVehiculosConductor,
    totalActivos, totalVehiculos, totalConductores, totalCarros, totalMotos,
  };
}

export type ConductoresData = ReturnType<typeof useConductoresData>;

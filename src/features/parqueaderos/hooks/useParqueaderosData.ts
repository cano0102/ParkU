import { useParqueaderos, useCreateParqueadero, useUpdateParqueadero } from "./useParqueaderos";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { useCeldas, useCreateCelda, useUpdateCelda, useRemoveCelda } from "./useCeldas";
import type { Celda } from "@/services/api/celdas";
import { useConductores, useCreateConductor } from "@/features/conductores";
import type { Conductor } from "@/services/api/conductores";
import { useVehiculos, useCreateVehiculo, useUpdateVehiculo } from "@/features/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useControlSalida, useCreateControlSalida, useUpdateControlSalida } from "@/features/controlSalida";
import type { ControlSalida } from "@/services/api/controlSalida";
import { useReservas, useCreateReserva, useUpdateReserva } from "@/features/reservas";
import type { Reserva } from "@/services/api/reservas";
import { useCreateIncidente } from "@/features/incidentes";
import type { Incidente } from "@/services/api/incidentes";

/** Queries y mutaciones de todos los dominios que orquesta la página de Parqueaderos. */
export function useParqueaderosData() {
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: controlesSalida = [] } = useControlSalida();
  const { data: reservas = [] } = useReservas();

  const createParqueaderoMutation = useCreateParqueadero();
  const updateParqueaderoMutation = useUpdateParqueadero();
  const createCeldaMutation = useCreateCelda();
  const updateCeldaMutation = useUpdateCelda();
  const removeCeldaMutation = useRemoveCelda();
  const createConductorMutation = useCreateConductor();
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();
  const createControlSalidaMutation = useCreateControlSalida();
  const updateControlSalidaMutation = useUpdateControlSalida();
  const createReservaMutation = useCreateReserva();
  const updateReservaMutation = useUpdateReserva();
  const createIncidenteMutation = useCreateIncidente();

  const addParqueadero = (data: Omit<Parqueadero, "id">) => createParqueaderoMutation.mutate(data);
  const updateParqueadero = (id: string, data: Partial<Omit<Parqueadero, "id">>) =>
    updateParqueaderoMutation.mutate({ id, data });
  const addCelda = (data: Omit<Celda, "id">) => createCeldaMutation.mutate(data);
  const updateCelda = (id: string, data: Partial<Omit<Celda, "id">>) => updateCeldaMutation.mutate({ id, data });
  const deleteCelda = (id: string) => removeCeldaMutation.mutate(id);
  // resolverConductor/resolverVehiculo necesitan el id real del registro creado
  // antes de seguir (para encadenar el control de salida), así que estas dos sí
  // esperan a que la mutación termine en vez de disparar y olvidar.
  const addConductor = (data: Omit<Conductor, "id">): Promise<string> =>
    createConductorMutation.mutateAsync(data).then((c) => c.id);
  const addVehiculo = (data: Omit<Vehiculo, "id">): Promise<string> =>
    createVehiculoMutation.mutateAsync(data).then((v) => v.id);
  const updateVehiculo = (id: string, data: Partial<Omit<Vehiculo, "id">>) =>
    updateVehiculoMutation.mutate({ id, data });
  const addControlSalida = (data: Omit<ControlSalida, "id">) => createControlSalidaMutation.mutate(data);
  const updateControlSalida = (id: string, data: Partial<Omit<ControlSalida, "id">>) =>
    updateControlSalidaMutation.mutate({ id, data });
  const addReserva = (data: Omit<Reserva, "id">) => createReservaMutation.mutate(data);
  const updateReserva = (id: string, data: Partial<Omit<Reserva, "id">>) =>
    updateReservaMutation.mutate({ id, data });
  const addIncidente = (data: Omit<Incidente, "id">) => createIncidenteMutation.mutate(data);

  return {
    parqueaderos, celdas, conductores, vehiculos, controlesSalida, reservas,
    addParqueadero, updateParqueadero, addCelda, updateCelda, deleteCelda,
    addConductor, addVehiculo, updateVehiculo,
    addControlSalida, updateControlSalida, addReserva, updateReserva, addIncidente,
  };
}

export type ParqueaderosData = ReturnType<typeof useParqueaderosData>;

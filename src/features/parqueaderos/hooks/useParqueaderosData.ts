import { useParqueaderos, useCreateParqueadero, useUpdateParqueadero, useRemoveParqueadero } from "./useParqueaderos";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { useCeldas, useCreateCelda, useUpdateCelda, useRemoveCelda, useCambiarDisponibilidadCelda, useGenerarLoteCeldas } from "./useCeldas";
import type { Celda, MotivoDisponibilidad, GenerarLoteCantidades } from "@/services/api/celdas";
import { useConductores, useCreateConductor } from "@/features/conductores";
import type { Conductor } from "@/services/api/conductores";
import { useVehiculos, useCreateVehiculo, useUpdateVehiculo } from "@/features/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useControlSalida, useCreateControlSalida, useUpdateControlSalida } from "@/features/controlSalida";
import type { ControlSalida } from "@/services/api/controlSalida";
import { useReservas, useCreateReserva, useUpdateReserva } from "@/features/reservas";
import type { Reserva } from "@/services/api/reservas";
import { useIncidentes, useCreateIncidente } from "@/features/incidentes";
import type { Incidente } from "@/services/api/incidentes";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";

/** Queries y mutaciones de todos los dominios que orquesta la página de Parqueaderos. */
export function useParqueaderosData() {
  const { user } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const { data: parqueaderos = [], isLoading } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: vehiculos = [] } = useVehiculos();
  // `/entradas-salidas` y el listado completo de `/reservas` son 403 para Comunidad SENA
  // (confirmado en vivo) — se desactivan para ese rol en vez de dejarlos fallar en cada
  // visita a esta pantalla (que sí es de acceso legítimo: es donde reserva su propia celda).
  const { data: controlesSalida = [] } = useControlSalida({ enabled: !esConductor });
  const { data: reservas = [] } = useReservas({ enabled: !esConductor });
  // `/novedades` (listado completo) también es solo Admin/Vigilante — mismo criterio que
  // controlesSalida/reservas de arriba; se usa aquí para saber si un parqueadero tiene
  // incidentes reportados antes de permitir eliminarlo (ver evaluarEliminacionParqueadero).
  const { data: incidentes = [] } = useIncidentes({ enabled: !esConductor });

  const createParqueaderoMutation = useCreateParqueadero();
  const updateParqueaderoMutation = useUpdateParqueadero();
  const removeParqueaderoMutation = useRemoveParqueadero();
  const createCeldaMutation = useCreateCelda();
  const updateCeldaMutation = useUpdateCelda();
  const removeCeldaMutation = useRemoveCelda();
  const cambiarDisponibilidadCeldaMutation = useCambiarDisponibilidadCelda();
  const generarLoteCeldasMutation = useGenerarLoteCeldas();
  const createConductorMutation = useCreateConductor();
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();
  const createControlSalidaMutation = useCreateControlSalida();
  const updateControlSalidaMutation = useUpdateControlSalida();
  const createReservaMutation = useCreateReserva();
  const updateReservaMutation = useUpdateReserva();
  const createIncidenteMutation = useCreateIncidente();

  // `mutateAsync` (no `.mutate`) en todas: quien llama necesita el `await`/try-catch
  // para no mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación falla.
  const addParqueadero = (data: Omit<Parqueadero, "id">) => createParqueaderoMutation.mutateAsync(data);
  const updateParqueadero = (id: string, data: Partial<Omit<Parqueadero, "id">>) =>
    updateParqueaderoMutation.mutateAsync({ id, data });
  const deleteParqueadero = (id: string) => removeParqueaderoMutation.mutateAsync(id);
  const addCelda = (data: Omit<Celda, "id">) => createCeldaMutation.mutateAsync(data);
  const updateCelda = (id: string, data: Partial<Omit<Celda, "id">>) => updateCeldaMutation.mutateAsync({ id, data });
  const deleteCelda = (id: string) => removeCeldaMutation.mutateAsync(id);
  const cambiarDisponibilidadCelda = (id: string, estado: Celda["estado"], motivo: MotivoDisponibilidad, observacion?: string) =>
    cambiarDisponibilidadCeldaMutation.mutateAsync({ id, estado, motivo, observacion });
  const generarCeldasEnLote = (parqueaderoId: string, cantidades: GenerarLoteCantidades) =>
    generarLoteCeldasMutation.mutateAsync({ parqueaderoId, cantidades });
  // resolverConductor/resolverVehiculo necesitan el id real del registro creado
  // antes de seguir (para encadenar el control de salida), así que estas dos sí
  // esperan a que la mutación termine en vez de disparar y olvidar.
  const addConductor = (data: Omit<Conductor, "id">): Promise<string> =>
    createConductorMutation.mutateAsync(data).then((c) => c.id);
  const addVehiculo = (data: Omit<Vehiculo, "id">): Promise<string> =>
    createVehiculoMutation.mutateAsync(data).then((v) => v.id);
  const updateVehiculo = (id: string, data: Partial<Omit<Vehiculo, "id">>) =>
    updateVehiculoMutation.mutateAsync({ id, data });
  const addControlSalida = (data: Omit<ControlSalida, "id">) => createControlSalidaMutation.mutateAsync(data);
  const updateControlSalida = (id: string, data: Partial<Omit<ControlSalida, "id">>) =>
    updateControlSalidaMutation.mutateAsync({ id, data });
  const addReserva = (data: Omit<Reserva, "id">) => createReservaMutation.mutateAsync(data);
  const updateReserva = (id: string, data: Partial<Omit<Reserva, "id">>) =>
    updateReservaMutation.mutateAsync({ id, data });
  const addIncidente = (data: Omit<Incidente, "id" | "fecha">) =>
    createIncidenteMutation.mutateAsync({ ...data, fecha: new Date().toISOString() });

  return {
    parqueaderos, celdas, conductores, vehiculos, controlesSalida, reservas, incidentes,
    addParqueadero, updateParqueadero, deleteParqueadero, addCelda, updateCelda, deleteCelda, cambiarDisponibilidadCelda, generarCeldasEnLote,
    addConductor, addVehiculo, updateVehiculo,
    addControlSalida, updateControlSalida, addReserva, updateReserva, addIncidente,
    isLoading,
  };
}

export type ParqueaderosData = ReturnType<typeof useParqueaderosData>;

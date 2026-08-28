/**
 * Un vehículo (o cualquier otro del mismo conductor) que ya está estacionado o tiene una
 * reserva pendiente/activa no puede reservarse ni estacionarse de nuevo hasta que esa
 * vinculación se libere. Se comparte entre el ingreso de vehículos, la reserva directa
 * (Admin/Vigilante) y la solicitud de reserva (Conductor) para no repetir la misma regla
 * tres veces con criterios distintos.
 */
import type { Vehiculo } from "@/services/api/vehiculos";
import type { ControlSalida } from "@/services/api/controlSalida";
import type { Reserva } from "@/services/api/reservas";

const RESERVA_ESTADOS_ACTIVOS = new Set(["pendiente", "activa"]);

export function vehiculoEstaParqueado(vehiculoId: string, controlesSalida: ControlSalida[]): boolean {
  return controlesSalida.some((cs) => cs.estado === "en_parqueadero" && cs.vehiculoId === vehiculoId);
}

export function reservaActivaDe(vehiculoId: string, reservas: Reserva[]): Reserva | undefined {
  return reservas.find((r) => r.vehiculoId === vehiculoId && RESERVA_ESTADOS_ACTIVOS.has(r.estado));
}

export interface MotivoNoDisponible {
  motivo: string;
}

/** Por qué un vehículo puntual no está disponible para una reserva/ingreso nuevo, o `null`
 *  si está libre. No mira a los demás vehículos del mismo conductor — ver
 *  `otroVehiculoDelConductorEnUso` para esa parte. */
export function vehiculoNoDisponible(
  vehiculo: Pick<Vehiculo, "id" | "placa">,
  controlesSalida: ControlSalida[],
  reservas: Reserva[]
): MotivoNoDisponible | null {
  if (vehiculoEstaParqueado(vehiculo.id, controlesSalida)) {
    return { motivo: `El vehículo ${vehiculo.placa} ya está estacionado en un parqueadero.` };
  }
  const reserva = reservaActivaDe(vehiculo.id, reservas);
  if (reserva) {
    return {
      motivo: `El vehículo ${vehiculo.placa} ya tiene una reserva ${reserva.estado === "activa" ? "activa" : "pendiente"} en otra celda.`,
    };
  }
  return null;
}

/** Igual que `vehiculoNoDisponible`, pero para los DEMÁS vehículos del mismo conductor: un
 *  conductor solo puede tener un vehículo suyo en uso (parqueado o reservado) a la vez —
 *  mientras uno esté vinculado activamente, el resto de su flota queda bloqueada. */
export function otroVehiculoDelConductorEnUso(
  conductorId: string,
  vehiculoIdActual: string | null,
  vehiculos: Vehiculo[],
  controlesSalida: ControlSalida[],
  reservas: Reserva[]
): MotivoNoDisponible | null {
  const otros = vehiculos.filter((v) => v.conductorId === conductorId && v.id !== vehiculoIdActual);
  for (const otro of otros) {
    const motivo = vehiculoNoDisponible(otro, controlesSalida, reservas);
    if (motivo) {
      return { motivo: `Este conductor ya tiene otro vehículo en uso (${otro.placa}). Libéralo antes de continuar con este.` };
    }
  }
  return null;
}

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import { ReservaFormState } from "../components/modals/ReservaModal";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";
import { vehiculoNoDisponible, otroVehiculoDelConductorEnUso } from "@/features/conductores";

/** Reservar una celda, cancelar su reserva, y liberar una celda ocupada. */
export function useReservaCelda(
  data: Pick<ParqueaderosData, "reservas" | "vehiculos" | "controlesSalida" | "addReserva" | "updateReserva" | "updateCelda">,
  celdaActiva: Celda | null,
  getOcupante: (celdaId: string) => { controlId: string } | null,
  updateControlSalida: (id: string, patch: { fechaSalida: string; estado: "finalizado" }) => Promise<unknown>,
  setOpenModal: (m: ModalKind) => void
) {
  const [reservaForm, setReservaForm] = useState<ReservaFormState>({
    vehiculoId: "",
    parqueaderoId: "",
    celdaId: "",
    fechaReserva: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    horaFin: "18:00",
    motivo: "",
    estado: "pendiente",
  });
  const [reservaError, setReservaError] = useState<string | null>(null);

  const openReservaFromCelda = useCallback((celda: Celda) => {
    setReservaForm((prev) => ({
      ...prev,
      parqueaderoId: celda.parqueaderoId,
      celdaId: celda.id,
      fechaReserva: new Date().toISOString().split("T")[0],
      horaInicio: "08:00",
      horaFin: "18:00",
      motivo: "",
      estado: "pendiente",
    }));
    setReservaError(null);
    setOpenModal("reserva");
  }, [setOpenModal]);

  const handleCrearReserva = useCallback(async () => {
    if (!reservaForm.vehiculoId) return setReservaError("Selecciona un vehículo");
    if (!reservaForm.celdaId) return setReservaError("Selecciona una celda");
    if (!reservaForm.fechaReserva) return setReservaError("La fecha es requerida");
    if (!reservaForm.horaInicio || !reservaForm.horaFin) return setReservaError("El horario es requerido");

    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMinutes(reservaForm.horaFin) <= toMinutes(reservaForm.horaInicio)) {
      return setReservaError("La hora de fin debe ser posterior a la hora de inicio");
    }

    // El <input type="date" min=...> del formulario ya sugiere no elegir un día
    // pasado, pero ese límite es solo de interfaz: se puede editar el campo
    // directamente. Se revalida aquí, incluyendo la hora, para el día de hoy.
    const inicioReserva = new Date(`${reservaForm.fechaReserva}T${reservaForm.horaInicio}`);
    if (inicioReserva.getTime() < Date.now()) {
      return setReservaError("No puedes reservar en una fecha u hora que ya pasó");
    }

    try {
      // Solo se permite una reserva activa por celda a la vez
      const conflicto = data.reservas.find(
        (r) => r.celdaId === reservaForm.celdaId && (r.estado === "pendiente" || r.estado === "activa")
      );
      if (conflicto) {
        const vehiculo = data.vehiculos.find((v) => v.id === conflicto.vehiculoId);
        setReservaError(`La celda ya tiene una reserva activa (vehículo ${vehiculo?.placa || "—"})`);
        return;
      }

      const vehiculoReservado = data.vehiculos.find((v) => v.id === reservaForm.vehiculoId);
      if (!vehiculoReservado) { setReservaError("Vehículo no encontrado"); return; }

      // El vehículo (o cualquier otro del mismo conductor) no puede estar ya estacionado ni
      // tener otra reserva pendiente/activa en otra celda — un conductor solo usa un vehículo
      // suyo a la vez.
      const motivoNoDisponible =
        vehiculoNoDisponible(vehiculoReservado, data.controlesSalida, data.reservas) ??
        (vehiculoReservado.conductorId
          ? otroVehiculoDelConductorEnUso(
              vehiculoReservado.conductorId, vehiculoReservado.id, data.vehiculos, data.controlesSalida, data.reservas
            )
          : null);
      if (motivoNoDisponible) { setReservaError(motivoNoDisponible.motivo); return; }

      // `POST /reservas` siempre crea en estado PENDIENTE (el backend no acepta otro estado
      // inicial) — como esta reserva la hace directamente un Admin/Vigilante desde el plano
      // de Parqueaderos (a diferencia de una solicitud de Conductor), se aprueba de inmediato
      // con un segundo PATCH en vez de dejarla esperando en "Solicitudes pendientes".
      const creada = await data.addReserva({
        tipoReserva: "visitante",
        vehiculoId: reservaForm.vehiculoId,
        celdaId: reservaForm.celdaId,
        conductorId: vehiculoReservado.conductorId ?? "",
        motivo: reservaForm.motivo.trim(),
        motivoRechazo: "",
        fechaReserva: reservaForm.fechaReserva,
        horaInicio: reservaForm.horaInicio,
        horaFin: reservaForm.horaFin,
        estado: "pendiente",
      });
      await data.updateReserva(creada.id, { estado: "activa" });
      await data.updateCelda(reservaForm.celdaId, { estado: "reservada" });
      toast.success(`Reserva creada para la celda ${celdaActiva?.numero}`);
      setOpenModal(null);
      setReservaError(null);
      setReservaForm((prev) => ({ ...prev, vehiculoId: "", horaInicio: "08:00", horaFin: "18:00", motivo: "" }));
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error(error);
    }
  }, [reservaForm, data, celdaActiva, setOpenModal]);

  const handleCancelarReserva = useCallback(async () => {
    if (!celdaActiva) return;
    const reserva = data.reservas.find((r) => r.celdaId === celdaActiva.id && (r.estado === "pendiente" || r.estado === "activa"));
    try {
      if (reserva) await data.updateReserva(reserva.id, { estado: "cancelada" });
      await data.updateCelda(celdaActiva.id, { estado: "disponible" });
      toast.info("Reserva cancelada.");
      setOpenModal(null);
    } catch (error) {
      console.error("Error cancelling reserva:", error);
    }
  }, [celdaActiva, data, setOpenModal]);

  const handleRequestLiberar = useCallback(async () => {
    if (!celdaActiva) return;
    const ocupante = getOcupante(celdaActiva.id);
    try {
      if (ocupante && ocupante.controlId) {
        await updateControlSalida(ocupante.controlId, { fechaSalida: new Date().toISOString().slice(0, 16), estado: "finalizado" });
      }
      await data.updateCelda(celdaActiva.id, { estado: "disponible", ocupada: false });
      toast.info(`Celda ${celdaActiva.numero} liberada.`);
      setOpenModal(null);
    } catch (error) {
      console.error("Error releasing celda:", error);
    }
  }, [celdaActiva, data, getOcupante, updateControlSalida, setOpenModal]);

  return {
    reservaForm, setReservaForm, reservaError,
    openReservaFromCelda, handleCrearReserva, handleCancelarReserva, handleRequestLiberar,
  };
}

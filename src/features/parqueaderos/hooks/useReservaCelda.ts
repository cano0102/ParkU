import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Vehiculo } from "@/services/api/vehiculos";
import { ReservaFormState } from "../components/modals/ReservaModal";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

/** Reservar una celda, cancelar su reserva, y liberar una celda ocupada. */
export function useReservaCelda(
  data: Pick<ParqueaderosData, "reservas" | "vehiculos" | "addReserva" | "updateReserva" | "updateCelda" | "updateVehiculo">,
  celdaActiva: Celda | null,
  getOcupante: (celdaId: string) => { controlId: string } | null,
  updateControlSalida: (id: string, patch: { fechaSalida: string; estado: "finalizado" }) => void,
  setOpenModal: (m: ModalKind) => void
) {
  const [reservaForm, setReservaForm] = useState<ReservaFormState>({
    vehiculoId: "",
    parqueaderoId: "",
    celdaId: "",
    fechaReserva: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    horaFin: "18:00",
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
      estado: "pendiente",
    }));
    setReservaError(null);
    setOpenModal("reserva");
  }, [setOpenModal]);

  const handleCrearReserva = useCallback(() => {
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

      const { parqueaderoId, ...payload } = reservaForm;
      data.addReserva({ ...payload, estado: "activa" });
      data.updateCelda(reservaForm.celdaId, { estado: "reservada" });
      toast.success(`Reserva creada para la celda ${celdaActiva?.numero}`);
      setOpenModal(null);
      setReservaError(null);
      setReservaForm((prev) => ({ ...prev, vehiculoId: "", horaInicio: "08:00", horaFin: "18:00" }));
    } catch (error) {
      setReservaError("Error al crear la reserva");
      console.error(error);
    }
  }, [reservaForm, data, celdaActiva, setOpenModal]);

  const handleCancelarReserva = useCallback(() => {
    if (!celdaActiva) return;
    const reserva = data.reservas.find((r) => r.celdaId === celdaActiva.id && (r.estado === "pendiente" || r.estado === "activa"));
    if (reserva) data.updateReserva(reserva.id, { estado: "cancelada" });
    data.updateCelda(celdaActiva.id, { estado: "disponible" });
    toast.info("Reserva cancelada.");
    setOpenModal(null);
  }, [celdaActiva, data, setOpenModal]);

  const handleRequestLiberar = useCallback(() => {
    if (!celdaActiva) return;
    const ocupante = getOcupante(celdaActiva.id);
    if (ocupante && ocupante.controlId) {
      updateControlSalida(ocupante.controlId, { fechaSalida: new Date().toISOString().slice(0, 16), estado: "finalizado" });
    }
    const vehiculoEnCelda: Vehiculo | undefined = data.vehiculos.find((v) => v.celdaId === celdaActiva.id);
    if (vehiculoEnCelda) {
      // Limpia la referencia para que la celda liberada no siga apareciendo
      // como "ocupada" por este vehículo (getOcupante la usa como fallback).
      data.updateVehiculo(vehiculoEnCelda.id, { celdaId: "" });
    }
    data.updateCelda(celdaActiva.id, { estado: "disponible", ocupada: false });
    toast.info(`Celda ${celdaActiva.numero} liberada.`);
    setOpenModal(null);
  }, [celdaActiva, data, getOcupante, updateControlSalida, setOpenModal]);

  return {
    reservaForm, setReservaForm, reservaError,
    openReservaFromCelda, handleCrearReserva, handleCancelarReserva, handleRequestLiberar,
  };
}

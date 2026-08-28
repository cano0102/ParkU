import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { ControlSalida } from "@/services/api/controlSalida";
import type { Reserva } from "@/services/api/reservas";
import { vehiculoNoDisponible, otroVehiculoDelConductorEnUso } from "@/features/conductores";
import { useCreateReserva } from "./useReservas";

interface SolicitarReservaForm {
  vehiculoId: string;
  parqueaderoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

const emptyForm = (vehiculoId = ""): SolicitarReservaForm => ({
  vehiculoId,
  parqueaderoId: "",
  celdaId: "",
  fechaReserva: new Date().toISOString().split("T")[0],
  horaInicio: "08:00",
  horaFin: "18:00",
  motivo: "",
});

/**
 * Solicitud de reserva para el rol Comunidad SENA (Conductor): a diferencia de la
 * reserva que crea un Admin/Vigilante desde el plano de Parqueaderos (que ocupa la
 * celda de inmediato), esto solo crea el registro en estado "pendiente" — la celda
 * queda intacta hasta que alguien la acepte desde "Solicitudes pendientes".
 */
export function useSolicitarReserva(
  misVehiculos: Vehiculo[],
  celdas: Celda[],
  parqueaderos: Parqueadero[],
  todosLosVehiculos: Vehiculo[],
  controlesSalida: ControlSalida[],
  reservasTodas: Reserva[]
) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SolicitarReservaForm>(emptyForm());
  const [touched, setTouched] = useState(false);
  const createReservaMutation = useCreateReserva();

  const abrir = useCallback(() => {
    setForm(emptyForm(misVehiculos[0]?.id ?? ""));
    setTouched(false);
    setOpen(true);
  }, [misVehiculos]);

  // Solo celdas disponibles del parqueadero elegido, y cuyo tipo coincida con el
  // vehículo a reservar (una celda de moto no sirve para un carro, y viceversa).
  const vehiculoSeleccionado = useMemo(() => misVehiculos.find((v) => v.id === form.vehiculoId), [misVehiculos, form.vehiculoId]);
  const celdasDisponibles = useMemo(() => {
    if (!form.parqueaderoId) return [];
    return celdas.filter((c) =>
      c.parqueaderoId === form.parqueaderoId &&
      c.estado === "disponible" &&
      (!vehiculoSeleccionado || c.tipo === vehiculoSeleccionado.tipo)
    );
  }, [celdas, form.parqueaderoId, vehiculoSeleccionado]);

  const parqueaderosActivos = useMemo(() => parqueaderos.filter((p) => p.estado === "activo"), [parqueaderos]);

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const validar = useCallback((f: SolicitarReservaForm): string | null => {
    if (!f.vehiculoId) return "Selecciona un vehículo";
    if (!f.parqueaderoId) return "Selecciona un parqueadero";
    if (!f.celdaId) return "Selecciona una celda disponible";
    if (!f.fechaReserva) return "La fecha es obligatoria";
    if (!f.horaInicio || !f.horaFin) return "El horario es obligatorio";
    if (toMinutes(f.horaFin) <= toMinutes(f.horaInicio)) return "La hora de fin debe ser posterior a la de inicio";
    const inicio = new Date(`${f.fechaReserva}T${f.horaInicio}`);
    if (inicio.getTime() < Date.now()) return "No puedes solicitar una fecha u hora que ya pasó";

    // El vehículo elegido (o cualquier otro del mismo conductor) no puede estar ya
    // estacionado ni tener otra reserva pendiente/activa — solo un vehículo suyo a la vez.
    const vehiculo = todosLosVehiculos.find((v) => v.id === f.vehiculoId);
    if (vehiculo) {
      const motivoNoDisponible =
        vehiculoNoDisponible(vehiculo, controlesSalida, reservasTodas) ??
        (vehiculo.conductorId
          ? otroVehiculoDelConductorEnUso(vehiculo.conductorId, vehiculo.id, todosLosVehiculos, controlesSalida, reservasTodas)
          : null);
      if (motivoNoDisponible) return motivoNoDisponible.motivo;
    }
    return null;
  }, [todosLosVehiculos, controlesSalida, reservasTodas]);

  const error = touched ? validar(form) : null;
  const markTouched = useCallback(() => setTouched(true), []);

  const enviarSolicitud = useCallback(async () => {
    setTouched(true);
    if (validar(form)) return;

    try {
      await createReservaMutation.mutateAsync({
        tipoReserva: "vehiculo_sena",
        vehiculoId: form.vehiculoId,
        celdaId: form.celdaId,
        conductorId: vehiculoSeleccionado?.conductorId ?? "",
        motivo: form.motivo.trim(),
        fechaReserva: form.fechaReserva,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        estado: "pendiente",
      });
      toast.success("Solicitud enviada. Un administrador debe aceptarla para que quede reservada la celda.");
      setOpen(false);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error requesting reserva:", error);
    }
  }, [form, validar, createReservaMutation, vehiculoSeleccionado]);

  return {
    open, setOpen, form, setForm, error, touched, markTouched,
    celdasDisponibles, parqueaderosActivos, abrir, enviarSolicitud,
  };
}

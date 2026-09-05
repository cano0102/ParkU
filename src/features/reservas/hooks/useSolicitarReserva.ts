import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { ControlSalida } from "@/services/api/controlSalida";
import type { Reserva } from "@/services/api/reservas";
import { vehiculoNoDisponible, otroVehiculoDelConductorEnUso } from "@/features/conductores";
import { HORA_OPERACION_INICIO, HORA_OPERACION_FIN } from "@/features/parqueaderos";
import { useCreateReserva } from "./useReservas";
import { franjaSugerida, validarFranja, ajustarFranja } from "../lib/reglas";

interface SolicitarReservaForm {
  vehiculoId: string;
  parqueaderoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}

// Arranca en una franja que ya cumple las reglas (dentro de la anticipación mínima y con la
// duración mínima), en vez de un 08:00–18:00 fijo que a media mañana ya estaba en el pasado.
const emptyForm = (vehiculoId = ""): SolicitarReservaForm => ({
  vehiculoId,
  parqueaderoId: "",
  celdaId: "",
  ...franjaSugerida(),
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

  /** Abre el formulario con una celda ya elegida (se llega así desde el plano). */
  const abrirCon = useCallback(({ celdaId, parqueaderoId }: { celdaId: string; parqueaderoId: string }) => {
    setForm({ ...emptyForm(misVehiculos[0]?.id ?? ""), celdaId, parqueaderoId });
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

  // Solo se ofrecen los parqueaderos que de verdad le sirven a este vehículo: activos y con
  // alguna celda libre de su tipo. Antes salían todos, y elegir uno de motos con un carro
  // llevaba a un selector de celdas vacío sin explicación.
  const parqueaderosActivos = useMemo(() => {
    const activos = parqueaderos.filter((p) => p.estado === "activo");
    if (!vehiculoSeleccionado) return activos;
    return activos.filter((p) => celdas.some((c) =>
      c.parqueaderoId === p.id && c.estado === "disponible" && c.tipo === vehiculoSeleccionado.tipo
    ));
  }, [parqueaderos, celdas, vehiculoSeleccionado]);

  const validar = useCallback((f: SolicitarReservaForm): string | null => {
    if (!f.vehiculoId) return "Selecciona un vehículo";
    if (!f.parqueaderoId) return "Selecciona un parqueadero";
    if (!f.celdaId) return "Selecciona una celda disponible";
    // El motivo es lo que le permite a quien aprueba decidir con criterio.
    if (!f.motivo.trim()) return "Explica para qué necesitas la celda: el motivo es obligatorio";
    if (!f.fechaReserva) return "La fecha es obligatoria";
    if (!f.horaInicio || !f.horaFin) return "El horario es obligatorio";
    // Las HORAS DE LA RESERVA tienen que caber en la ventana de operación (05:00-21:00). La
    // hora a la que se pide da igual: se puede solicitar de madrugada para el día siguiente.
    // Comparar como string funciona porque <input type="time"> siempre entrega "HH:MM".
    if (f.horaInicio < HORA_OPERACION_INICIO || f.horaFin > HORA_OPERACION_FIN) {
      return `El horario debe estar entre ${HORA_OPERACION_INICIO} y ${HORA_OPERACION_FIN} (horario de operación).`;
    }
    // Anticipación mínima, duración mínima y nada en el pasado: las mismas reglas que el
    // backend, aquí para avisar mientras se elige la hora (ver lib/reglas.ts).
    const problemaDeFranja = validarFranja(f);
    if (problemaDeFranja) return problemaDeFranja;

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
        motivoRechazo: "",
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

  /** Deja la franja dentro de lo que se puede elegir tras cambiar la fecha o la hora. */
  const ajustar = useCallback(
    (f: Pick<SolicitarReservaForm, "fechaReserva" | "horaInicio" | "horaFin">) =>
      ajustarFranja(f, { desde: HORA_OPERACION_INICIO, hasta: HORA_OPERACION_FIN }),
    [],
  );

  return {
    open, setOpen, form, setForm, error, touched, markTouched, ajustar,
    celdasDisponibles, parqueaderosActivos, abrir, abrirCon, enviarSolicitud,
  };
}

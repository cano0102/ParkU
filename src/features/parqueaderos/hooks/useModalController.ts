import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import { esPlacaOficial, type Ocupante } from "../lib/helpers";

import { agendaDeCelda, avisoDeCelda, comoHora, inicioDe, type MarcaReserva } from "../lib/agendaCelda";
import type { ParqueaderosData } from "./useParqueaderosData";


export type ModalKind =
  | "create" | "edit" | "ingreso" | "info" | "scanner" | "smartAssign" | "incidente" | "reserva"
  // Sub-pasos del asistente de "Estacionar Vehículo" (ver useIngresoVehiculo.ts): se
  // navega a ellos y se vuelve a "ingreso" igual que ya hace el escáner OCR, para no
  // superponer dos diálogos completos a la vez.
  | "crearConductor" | "crearVehiculo"
  // Cancelar la reserva de una celda pide motivo, así que es un formulario, no un aviso.
  | "cancelarReserva"
  | null;

/** Qué modal está abierto, qué celda está seleccionada, y los datos derivados de esa selección. */
export function useModalController(data: ParqueaderosData) {
  const { parqueaderos, celdas, conductores, vehiculos, controlesSalida, reservas } = data;

  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [celdaSeleccionadaId, setCeldaSeleccionadaId] = useState<string | null>(null);

  // El registro de entrada/salida es la ÚNICA fuente de verdad de "quién ocupa esta celda
  // ahora" — el vehículo ya no guarda su propia ubicación (ver services/api/vehiculos.ts).
  const getOcupante = useCallback((celdaId: string): Ocupante | null => {
    const cs = controlesSalida.find((c) => c.celdaId === celdaId && c.estado === "en_parqueadero");
    if (!cs) return null;
    const vehiculo = vehiculos.find((v) => v.id === cs.vehiculoId);
    if (!vehiculo) return null;
    const conductor = conductores.find((c) => c.id === (cs.conductorId || vehiculo.conductorId));
    return {
      vehiculo, conductor,
      esOficial: esPlacaOficial(vehiculo.placa),
      controlId: cs.id,
      fechaEntrada: cs.fechaEntrada,
    };
  }, [controlesSalida, vehiculos, conductores]);

  const celdaActiva = useMemo(() => celdas.find((c) => c.id === celdaSeleccionadaId) ?? null, [celdas, celdaSeleccionadaId]);
  const parqueaderoActivo = useMemo(
    () => (celdaActiva ? parqueaderos.find((p) => p.id === celdaActiva.parqueaderoId) ?? null : null),
    [celdaActiva, parqueaderos]
  );
  const ocupanteActivo = useMemo(() => (celdaActiva ? getOcupante(celdaActiva.id) : null), [celdaActiva, getOcupante]);

  /* La agenda de la celda abierta. Una reserva aparta una FRANJA, no la celda entera: antes
     bastaba con que existiera una reserva viva para dar la celda por reservada todo el día,
     y una reserva de las 15:00 dejaba la celda inservible desde la mañana. Ahora se pregunta
     por la hora — qué reserva rige AHORA ("vigente") y cuál viene después ("proxima").
     Se recalcula en cada render a propósito: depende del reloj, y el tick de
     useParqueaderosPage vuelve a renderizar cada 30 s para que los avisos aparezcan solos. */
  const agendaActiva = celdaActiva ? agendaDeCelda(celdaActiva.id, reservas) : null;

  /* Lo que el plano tiene que pintar sobre cada celda por causa de sus reservas. Se recalcula
     cuando cambian los datos y, además, cada minuto: los avisos dependen del reloj, y el
     plano está memoizado — sin un valor que cambie con el tiempo, un aviso que debía salir a
     las 10:20 no aparecería hasta que alguien tocara algo. */
  const minutoActual = Math.floor(Date.now() / 60000);
  const marcasDeReserva = useMemo(() => {
    const ahora = new Date();
    const marcas: Record<string, MarcaReserva> = {};
    for (const celda of celdas) {
      const agenda = agendaDeCelda(celda.id, reservas, ahora);
      if (!agenda.vigente && !agenda.proxima) continue;
      marcas[celda.id] = {
        aviso: avisoDeCelda(agenda, celda.estado === "no_disponible"),
        proximaHora: agenda.proxima ? comoHora(inicioDe(agenda.proxima)) : null,
        enCurso: !!agenda.vigente,
      };
    }
    return marcas;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- minutoActual es el reloj: entra a propósito.
  }, [celdas, reservas, minutoActual]);

  // La reserva que manda sobre la celda en este momento. Una reserva futura ya no la retiene:
  // solo la que está en curso decide quién puede ocuparla.
  const reservaActiva = agendaActiva?.vigente ?? null;
  // Para el botón "Estacionar <placa>": si no hay ninguna en curso, la próxima también sirve
  // — su conductor puede llegar antes de la hora, la celda es suya (lo permite igual el
  // backend, ver _validarReservaDeCelda).
  const reservaDestacada = agendaActiva?.vigente ?? agendaActiva?.proxima ?? null;
  const vehiculoReservado = useMemo(
    () => (reservaDestacada ? vehiculos.find((v) => v.id === reservaDestacada.vehiculoId) ?? null : null),
    [reservaDestacada, vehiculos]
  );

  /* Ajuste manual de estado de una celda (Administrador/Vigilante): vía de escape fuera del
     flujo normal (estacionar/reservar/liberar), para corregir una celda que quedó atascada en
     un estado por datos inconsistentes, o para ponerla/sacarla de mantenimiento. A diferencia
     del resto de cambios de celda (que el backend mueve solo vía trigger al aceptar una
     reserva o registrar un ingreso/salida), este SÍ necesita el canal dedicado
     `cambiarDisponibilidadCelda` — es el único que de verdad aplica el `estado` cuando no hay
     ninguna reserva/ingreso real detrás, y exige un motivo. */
  const handleSetEstadoCeldaManual = useCallback(async (estado: Celda["estado"]) => {
    if (!celdaActiva) return;
    try {
      const motivo = estado === "mantenimiento" ? "mantenimiento" : "error_asignacion";
      await data.cambiarDisponibilidadCelda(celdaActiva.id, estado, motivo);
      toast.success(`Celda ${celdaActiva.numero} marcada como "${estado.replace("_", " ")}"`);
      setOpenModal(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error setting celda estado manually:", error);
    }
  }, [celdaActiva, data]);

  return {
    openModal, setOpenModal,
    celdaSeleccionadaId, setCeldaSeleccionadaId,
    getOcupante,
    celdaActiva, parqueaderoActivo, ocupanteActivo, reservaActiva, reservaDestacada, vehiculoReservado,
    agendaActiva, marcasDeReserva,
    handleSetEstadoCeldaManual,
  };
}

export type ModalController = ReturnType<typeof useModalController>;

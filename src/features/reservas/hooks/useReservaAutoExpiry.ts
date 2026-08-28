import { useEffect } from "react";
import { useReservas, useUpdateReserva } from "./useReservas";
import { useCeldas, useUpdateCelda } from "@/features/parqueaderos";

const CHECK_INTERVAL_MS = 30000;

/**
 * Vence automáticamente las reservas vencidas — sin esto, una reserva se queda
 * en su estado para siempre si nadie la gestiona a mano:
 *
 * - "pendiente" cuya HORA DE INICIO ya pasó sin que nadie la aceptara: la
 *   solicitud ya no tiene sentido (el horario que pedía ya no existe) — se
 *   marca "cancelada". No espera a la hora de fin: una solicitud sin
 *   aprobar no debería seguir viva después de que empezó el horario pedido.
 * - "activa" (ya aceptada) cuya HORA DE FIN ya pasó: si se usó, se completó
 *   de verdad — se marca "completada" y libera la celda.
 *
 * Se monta una sola vez a nivel de layout (ver MainLayout) para que corra
 * sin importar qué página esté abierta.
 */
export function useReservaAutoExpiry() {
  const { data: reservas = [] } = useReservas();
  const { data: celdas = [] } = useCeldas();
  const updateReservaMutation = useUpdateReserva();
  const updateCeldaMutation = useUpdateCelda();

  useEffect(() => {
    const vencerReservasPasadas = () => {
      const ahora = Date.now();
      for (const reserva of reservas) {
        if (reserva.estado !== "pendiente" && reserva.estado !== "activa") continue;

        const limite = reserva.estado === "pendiente" ? reserva.horaInicio : reserva.horaFin;
        const momentoLimite = new Date(`${reserva.fechaReserva}T${limite}`).getTime();
        if (Number.isNaN(momentoLimite) || momentoLimite >= ahora) continue;

        const estadoFinal = reserva.estado === "pendiente" ? "cancelada" : "completada";
        updateReservaMutation.mutate({ id: reserva.id, data: { estado: estadoFinal } });

        const celda = celdas.find(c => c.id === reserva.celdaId);
        if (celda && celda.estado === "reservada") {
          updateCeldaMutation.mutate({ id: celda.id, data: { estado: "disponible" } });
        }
      }
    };

    vencerReservasPasadas();
    const interval = setInterval(vencerReservasPasadas, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservas, celdas]);
}

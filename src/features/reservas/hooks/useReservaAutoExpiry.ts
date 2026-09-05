import { useEffect } from "react";
import { useReservas, useUpdateReserva } from "./useReservas";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import {
  MARGEN_LLEGADA_MINUTOS, MARGEN_CONFIRMACION_MINUTOS,
  MOTIVO_VENCIMIENTO_ACEPTADA, MOTIVO_SIN_CONFIRMAR,
} from "../lib/reglas";

const CHECK_INTERVAL_MS = 30000;
const MINUTO_MS = 60 * 1000;

/**
 * Vence las reservas que se quedaron sin sentido — sin esto, una reserva se queda en su
 * estado para siempre si nadie la gestiona a mano:
 *
 * - "pendiente" que llega al margen de confirmación sin que nadie la apruebe: a media hora
 *   del inicio ya no da tiempo de organizarse, así que se marca RECHAZADA (no cancelada: no
 *   es que alguien se echara atrás, es que nunca llegó a aprobarse).
 * - "activa" (aceptada, celda reservada) a la que se le pasó el margen de llegada: se le
 *   esperan {@link MARGEN_LLEGADA_MINUTOS} minutos desde la hora de inicio y, si el vehículo
 *   no llegó, se cancela y la celda vuelve a estar disponible. Si el vehículo SÍ llegó, el
 *   flujo de ingreso ya dejó la reserva en "completada" antes de este chequeo.
 *
 * En las dos se escribe el motivo, para que en el historial se entienda por qué cambió sola.
 *
 * Esto es el aviso rápido, no la garantía: el backend hace el mismo barrido al consultar el
 * listado (ver vencerCaducadas en reserva.service.js), así que la regla se cumple aunque
 * nadie tenga la aplicación abierta. Aquí sirve para que quien está mirando la pantalla lo
 * vea sin esperar a recargar.
 *
 * Se monta una sola vez a nivel de layout (ver MainLayout) para que corra sin importar qué
 * página esté abierta — incluida cualquier sesión de Comunidad SENA, aunque ese rol no
 * gestiona el vencimiento de nadie. Como necesita el listado COMPLETO de reservas y esa ruta
 * da 403 para ese rol, se desactiva la query por completo para Conductor en vez de dejarla
 * fallar en cada página que visite.
 */
export function useReservaAutoExpiry() {
  const { user } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const { data: reservas = [] } = useReservas({ enabled: !esConductor });
  const updateReservaMutation = useUpdateReserva();

  useEffect(() => {
    const vencerReservasPasadas = () => {
      const ahora = Date.now();
      for (const reserva of reservas) {
        if (reserva.estado !== "pendiente" && reserva.estado !== "activa") continue;

        const inicio = new Date(`${reserva.fechaReserva}T${reserva.horaInicio}`).getTime();
        if (Number.isNaN(inicio)) continue;

        // La pendiente muere media hora antes del inicio si nadie la aprobó; la aceptada
        // aguanta el margen de llegada, que es lo que se le espera a quien reservó.
        const esPendiente = reserva.estado === "pendiente";
        const momentoLimite = esPendiente
          ? inicio - MARGEN_CONFIRMACION_MINUTOS * MINUTO_MS
          : inicio + MARGEN_LLEGADA_MINUTOS * MINUTO_MS;
        if (momentoLimite >= ahora) continue;

        // Cambiar el estado basta: el backend libera la celda que retenía esta reserva (y
        // solo si seguía RESERVADA). Hacerlo también desde aquí podía soltar una celda que
        // en realidad ya estaba ocupada por un vehículo que acababa de entrar.
        updateReservaMutation.mutate({
          id: reserva.id,
          data: {
            estado: esPendiente ? "rechazada" : "cancelada",
            motivoRechazo: esPendiente ? MOTIVO_SIN_CONFIRMAR : MOTIVO_VENCIMIENTO_ACEPTADA,
          },
        });
      }
    };

    vencerReservasPasadas();
    const interval = setInterval(vencerReservasPasadas, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservas]);
}

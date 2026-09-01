import { useEffect } from "react";
import { useReservas, useUpdateReserva } from "./useReservas";
import { useCeldas, useUpdateCelda } from "@/features/parqueaderos";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";

const CHECK_INTERVAL_MS = 30000;

/**
 * Vence automáticamente las reservas vencidas — sin esto, una reserva se queda
 * en su estado para siempre si nadie la gestiona a mano:
 *
 * - "pendiente" cuya HORA DE INICIO ya pasó sin que nadie la aceptara: la
 *   solicitud ya no tiene sentido (el horario que pedía ya no existe) — se
 *   marca "cancelada". No espera a la hora de fin: una solicitud sin
 *   aprobar no debería seguir viva después de que empezó el horario pedido.
 * - "activa" (ya aceptada, celda reservada) cuya HORA DE FIN ya pasó sin que
 *   el vehículo llegara a estacionarse: se marca "cancelada" y libera la
 *   celda. Si el vehículo SÍ se estacionó a tiempo, el flujo de ingreso
 *   (useIngresoVehiculo) ya dejó la reserva en "completada" antes de que
 *   este chequeo la alcance, así que nunca llega a este punto.
 *
 * Se monta una sola vez a nivel de layout (ver MainLayout) para que corra
 * sin importar qué página esté abierta — incluida cualquier sesión de
 * Comunidad SENA, aunque ese rol no gestiona el vencimiento de nadie. Como
 * necesita el listado COMPLETO de reservas (no solo las propias) y esa ruta
 * da 403 para ese rol, se desactiva la query por completo para Conductor en
 * vez de dejarla fallar en cada página que visite.
 */
export function useReservaAutoExpiry() {
  const { user } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const { data: reservas = [] } = useReservas({ enabled: !esConductor });
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

        updateReservaMutation.mutate({ id: reserva.id, data: { estado: "cancelada" } });

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

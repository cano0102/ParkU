import { useEffect } from "react";
import { useReservas, useUpdateReserva } from "./useReservas";
import { useCeldas, useUpdateCelda } from "@/features/parqueaderos";

const CHECK_INTERVAL_MS = 30000;

/** Vence automáticamente las reservas cuya hora de fin ya pasó: hoy una
 * reserva "activa"/"pendiente" se queda así para siempre si nadie la
 * cancela a mano, y la celda se queda marcada "reservada" indefinidamente
 * aunque el horario reservado ya terminó. Se monta una sola vez a nivel de
 * layout (ver MainLayout) para que corra sin importar qué página esté abierta. */
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
        const fin = new Date(`${reserva.fechaReserva}T${reserva.horaFin}`).getTime();
        if (Number.isNaN(fin) || fin >= ahora) continue;

        updateReservaMutation.mutate({ id: reserva.id, data: { estado: "completada" } });

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

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useReservas } from "@/features/reservas";
import { useIncidentes } from "@/features/incidentes";

/**
 * Lo que está esperando a alguien: solicitudes de reserva sin responder e incidentes sin
 * atender, por ruta del menú.
 *
 * Existe para que no haya que entrar a cada módulo a comprobar si pasó algo. Un incidente
 * reportado o una solicitud de reserva no avisan por sí solos: quedan ahí hasta que alguien
 * los mira, y quien tiene que mirarlos no siempre está en esa pantalla.
 *
 * Las dos consultas se piden en silencio y solo si el rol tiene el permiso: son un adorno del
 * menú, y un módulo al que este usuario no entra nunca no debería provocarle un error en cada
 * página. Comunidad SENA queda fuera de los dos: no aprueba solicitudes ni atiende
 * incidentes de nadie, y los dos listados completos le responden 403.
 */
export function usePendientes(): Record<string, number> {
  const { user, hasPermission } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;

  const reservas = useReservas({
    enabled: hasPermission("reservas") && !esConductor,
    silentError: true,
  });
  const incidentes = useIncidentes({
    enabled: hasPermission("incidentes") && !esConductor,
    silentError: true,
  });

  /* Los incidentes son lo que pide atención: una novedad es una observación de la operación
     y no debería inflar el mismo contador. Se cuentan aparte y el módulo suma las dos, porque
     el menú tiene un solo sitio donde ponerlo. */
  return useMemo(() => {
    const abiertos = (incidentes.data ?? []).filter((i) => i.estado === "pendiente");
    return {
      "/app/reservas": (reservas.data ?? []).filter((r) => r.estado === "pendiente").length,
      "/app/incidentes": abiertos.length,
    };
  }, [reservas.data, incidentes.data]);
}

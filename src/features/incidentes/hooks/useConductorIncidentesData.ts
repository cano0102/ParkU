import { useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useConductores } from "@/features/conductores";
import { useIncidentesData } from "./useIncidentesData";

/**
 * Vista de Incidentes para el rol Comunidad SENA: los mismos datos y
 * mutaciones que `useIncidentesData` (parqueaderos/celdas para el
 * formulario, mutaciones de crear/actualizar), pero acotados a los
 * vehículos e incidentes del propio conductor — nunca a la lista completa
 * del sistema, que además la API real le niega.
 *
 * Historias 07.1.11 (reportar) a 07.1.14 (cancelar). El backend real hoy es
 * mixto: `POST /novedades` (reportar) y `GET /:id/historial` son de
 * cualquier usuario autenticado, pero `GET /novedades` (listar) y
 * `PUT /novedades/:id` (actualizar) están restringidos a Admin/Vigilante
 * (ver el encabezado de `services/api/incidentes.ts`). Este hook ya deja el
 * flujo completo listo del lado del frontend; contra la API real, "Mis
 * incidentes" y "Editar"/"Cancelar" van a fallar con 403 hasta que esas
 * rutas se abran para que un Conductor gestione sus propios recursos.
 */
export function useConductorIncidentesData() {
  const { user } = useAuth();
  const { data: conductores = [] } = useConductores();
  // El listado de incidentes ya muestra su propio mensaje persistente más abajo en
  // ConductorIncidentes.tsx cuando falla — silencia el toast global redundante (ver N1/N2
  // del informe de auditoría).
  const base = useIncidentesData({ silentIncidentesError: true });

  const miConductorId = useMemo(
    () => (user?.rol === ROLES.CONDUCTOR ? conductores.find((c) => c.usuarioId === user.id)?.id ?? null : null),
    [user, conductores]
  );

  const misVehiculos = useMemo(
    () => base.vehiculos.filter((v) => v.conductorId === miConductorId),
    [base.vehiculos, miConductorId]
  );

  const misIncidentes = useMemo(() => {
    const misVehiculosIds = new Set(misVehiculos.map((v) => v.id));
    return base.incidentes
      .filter((i) => misVehiculosIds.has(i.vehiculoId))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [base.incidentes, misVehiculos]);

  // "Cancelar" no es un DELETE (esa ruta es solo Admin, y de todas formas borrar el
  // registro le quitaría al conductor su propio historial) — es un cambio de estado,
  // igual que "actualizar" ya lo es vía `updateIncidente`.
  const cancelarIncidente = async (id: string) => {
    try {
      await base.updateIncidente(id, { estado: "cancelado" });
      toast.success("Incidente cancelado.");
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error cancelling incidente:", error);
    }
  };

  return { ...base, misVehiculos, misIncidentes, cancelarIncidente };
}

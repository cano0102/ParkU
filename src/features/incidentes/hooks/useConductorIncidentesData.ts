import { useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useConductores, vehiculosDeConductor } from "@/features/conductores";
import { useIncidentesData } from "./useIncidentesData";
import { compararIncidentes } from "../lib/orden";

/**
 * Vista de Incidentes para el rol Comunidad SENA: los mismos datos y
 * mutaciones que `useIncidentesData` (parqueaderos/celdas para el
 * formulario, mutaciones de crear/actualizar), pero acotados a los
 * vehículos e incidentes del propio conductor — nunca a la lista completa
 * del sistema, que además la API real le niega.
 *
 * Historias 07.1.11 (reportar) a 07.1.14 (cancelar). El backend real hoy es
 * mixto: `GET /novedades` (listar) acepta al Conductor porque tiene el
 * permiso `novedades.consultar` (ver `config/seed.js`), y el resultado
 * queda acotado a lo suyo (`resolverAlcance`/`alcance.util.js`: lo que
 * reportó o lo que involucra alguno de sus vehículos) — nunca ve la lista
 * completa. Pero `PUT /novedades/:id` (usado por "Editar" y "Cancelar")
 * exige el permiso `novedades.gestionar` o rol Admin/Vigilante, que el
 * Conductor no tiene: `cancelarIncidente` sigue dando 403 en la API real,
 * por eso `ConductorIncidenteCard` mantiene esas acciones visibles pero
 * deshabilitadas (`ACCIONES_BACKEND_DISPONIBLES`) hasta que se abra esa
 * ruta para que el Conductor gestione sus propios recursos.
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
    () => vehiculosDeConductor(base.vehiculos, miConductorId),
    [base.vehiculos, miConductorId]
  );

  const misIncidentes = useMemo(() => {
    const misVehiculosIds = new Set(misVehiculos.map((v) => v.id));
    // "Propio" es lo que el conductor reportó, o lo que involucra alguno de sus vehículos
    // (mismo criterio que el backend en resolverAlcance/alcance.util.js): filtrar solo por
    // vehículo actual perdía sus propios reportes en cuanto dejaba de tener ese vehículo, o
    // cuando el reporte no llevaba vehículo asociado (una queja general).
    return base.incidentes
      .filter((i) => i.usuarioReportaId === user?.id || misVehiculosIds.has(i.vehiculoId))
      .sort(compararIncidentes);
  }, [base.incidentes, misVehiculos, user?.id]);

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

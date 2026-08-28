import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useConductores, useVehiculos } from "@/features/conductores";
import { useParqueaderos, useCeldas } from "@/features/parqueaderos";
import { useReservasDeVehiculos } from "@/features/reservas";

/**
 * Data del Dashboard simplificado para el rol Comunidad SENA (Conductor).
 *
 * El rol Conductor no tiene permiso para listar `/entradas-salidas` (403 en
 * la API real, confirmado en vivo) — por eso "estacionado ahora" no se puede
 * leer del registro real de ingreso/salida como en el Dashboard de Admin.
 * En su lugar se usa la reserva con estado "activa" (aceptada) más reciente
 * como mejor proxy disponible de "tiene una celda asignada en este momento":
 * cada reserva ya trae la celda embebida, y `/reservas/vehiculo/:id` sí es
 * accesible para cualquier usuario autenticado.
 */
export function useConductorDashboardData() {
  const { user } = useAuth();
  const { data: conductores = [], isLoading: loadingConductores } = useConductores();
  const { data: vehiculos = [], isLoading: loadingVehiculos } = useVehiculos();
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();

  const miConductor = useMemo(
    () => conductores.find((c) => c.usuarioId === user?.id) ?? null,
    [conductores, user?.id]
  );

  const misVehiculos = useMemo(
    () => (miConductor ? vehiculos.filter((v) => v.conductorId === miConductor.id) : []),
    [vehiculos, miConductor]
  );

  const misVehiculosIds = useMemo(() => misVehiculos.map((v) => v.id), [misVehiculos]);
  const { reservas: misReservas, isLoading: loadingReservas } = useReservasDeVehiculos(misVehiculosIds);

  const reservaActiva = useMemo(
    () => misReservas.find((r) => r.estado === "activa") ?? null,
    [misReservas]
  );

  const celdaActual = useMemo(
    () => (reservaActiva ? celdas.find((c) => c.id === reservaActiva.celdaId) ?? null : null),
    [celdas, reservaActiva]
  );

  const parqueaderoActual = useMemo(
    () => (celdaActual ? parqueaderos.find((p) => p.id === celdaActual.parqueaderoId) ?? null : null),
    [parqueaderos, celdaActual]
  );

  const isLoading = loadingConductores || loadingVehiculos || loadingReservas;

  return {
    miConductor, misVehiculos, misReservas,
    reservaActiva, celdaActual, parqueaderoActual,
    isLoading,
  };
}

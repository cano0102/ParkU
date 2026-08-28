import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useReservas, useRemoveReserva, useUpdateReserva } from "./useReservas";
import type { Reserva } from "@/services/api/reservas";
import { useUpdateCelda, useCeldas, useParqueaderos } from "@/features/parqueaderos";
import type { Celda } from "@/services/api/celdas";
import { useVehiculos, useConductores } from "@/features/conductores";
import type { EstadoReserva } from "../lib/constants";

/** Datos, filtros y eliminación del historial de reservas. */
export function useReservasPage() {
  const { user } = useAuth();
  const { data: reservasTodas = [], isLoading } = useReservas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: parqueaderos = [] } = useParqueaderos();
  const removeReservaMutation = useRemoveReserva();
  const updateCeldaMutation = useUpdateCelda();
  const updateReservaMutation = useUpdateReserva();
  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" cuando la mutación en realidad falla.
  const deleteReserva = (id: string) => removeReservaMutation.mutateAsync(id);
  const updateCelda = (id: string, data: Partial<Omit<Celda, "id">>) => updateCeldaMutation.mutateAsync({ id, data });
  const updateReserva = (id: string, data: Partial<Omit<Reserva, "id">>) => updateReservaMutation.mutateAsync({ id, data });

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoReserva>("todos");
  const [confirmDelete, setConfirmDelete] = useState<Reserva | null>(null);

  const getVehiculo = (id: string) => vehiculos.find((v) => v.id === id);
  const getCelda = (id: string) => celdas.find((c) => c.id === id);
  const getParqueadero = (id: string) => parqueaderos.find((p) => p.id === id);

  // La reserva ya trae su propio conductorId (relación directa en la API real);
  // si no vino, se cae de vuelta al dueño del vehículo reservado.
  const getConductorReserva = (reserva: Reserva) => {
    if (reserva.conductorId) return conductores.find((c) => c.id === reserva.conductorId) ?? null;
    const v = getVehiculo(reserva.vehiculoId);
    return v ? conductores.find((c) => c.id === v.conductorId) ?? null : null;
  };

  // Un Conductor (Comunidad SENA) solo debe ver su propio historial de reservas, no el de
  // todos los usuarios — Admin/Vigilante sí necesitan el historial completo para gestionarlo.
  const miConductorId = useMemo(
    () => (user?.rol === ROLES.CONDUCTOR ? conductores.find((c) => c.usuarioId === user.id)?.id ?? null : null),
    [user, conductores]
  );
  const reservas = useMemo(() => {
    if (user?.rol !== ROLES.CONDUCTOR) return reservasTodas;
    return reservasTodas.filter((r) => getConductorReserva(r)?.id === miConductorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservasTodas, user, miConductorId, conductores, vehiculos]);

  const counts = {
    pendiente: reservas.filter((r) => r.estado === "pendiente").length,
    activa: reservas.filter((r) => r.estado === "activa").length,
    completada: reservas.filter((r) => r.estado === "completada").length,
    cancelada: reservas.filter((r) => r.estado === "cancelada").length,
  };

  const filteredReservas = useMemo(() => {
    return reservas
      .filter((reserva) => {
        const vehiculo = getVehiculo(reserva.vehiculoId);
        const celda = getCelda(reserva.celdaId);
        const conductor = getConductorReserva(reserva);
        const q = search.toLowerCase();

        const matchesSearch =
          vehiculo?.placa.toLowerCase().includes(q) ||
          celda?.numero.toLowerCase().includes(q) ||
          conductor?.nombre.toLowerCase().includes(q) ||
          reserva.fechaReserva.includes(search);

        const matchesEstado = filterEstado === "todos" || reserva.estado === filterEstado;
        return matchesSearch && matchesEstado;
      })
      .sort((a, b) => {
        // Más próximas primero (fecha + hora de inicio)
        const da = `${a.fechaReserva} ${a.horaInicio}`;
        const db = `${b.fechaReserva} ${b.horaInicio}`;
        return da.localeCompare(db);
      });
  }, [reservas, search, filterEstado]);

  const handleDelete = (reserva: Reserva) => setConfirmDelete(reserva);

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      // Si la reserva seguía activa, libera la celda al eliminar el registro
      if (confirmDelete.estado === "pendiente" || confirmDelete.estado === "activa") {
        await updateCelda(confirmDelete.celdaId, { estado: "disponible" });
      }
      await deleteReserva(confirmDelete.id);
      toast.success("Reserva eliminada correctamente");
      setConfirmDelete(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error deleting reserva:", error);
    }
  };

  const activeFiltersCount = [search, filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setFilterEstado("todos");
  };

  // Solo Admin/Vigilante gestionan solicitudes — un Conductor puede solicitar una reserva,
  // pero no aprobar la suya (ni la de nadie).
  const puedeGestionarSolicitudes = user?.rol === ROLES.ADMIN || user?.rol === ROLES.VIGILANTE;
  // Ordenadas por fecha/hora de inicio para atender primero lo más próximo, igual que la tabla.
  const solicitudesPendientes = useMemo(
    () => reservasTodas
      .filter((r) => r.estado === "pendiente")
      .sort((a, b) => `${a.fechaReserva} ${a.horaInicio}`.localeCompare(`${b.fechaReserva} ${b.horaInicio}`)),
    [reservasTodas]
  );

  // Choque de horario: dos reservas de la MISMA celda se solapan si una empieza antes de que
  // la otra termine y termina después de que la otra empieza. Solo importa contra reservas ya
  // "activa" (aceptadas) — dos solicitudes "pendiente" pueden competir por la misma franja sin
  // problema, el conflicto real solo existe si se intenta aceptar ambas.
  const buscarConflictoHorario = (reserva: Reserva): Reserva | null => {
    const inicio = new Date(`${reserva.fechaReserva}T${reserva.horaInicio}`).getTime();
    const fin = new Date(`${reserva.fechaReserva}T${reserva.horaFin}`).getTime();
    return reservasTodas.find((r) => {
      if (r.id === reserva.id || r.celdaId !== reserva.celdaId || r.estado !== "activa") return false;
      const rInicio = new Date(`${r.fechaReserva}T${r.horaInicio}`).getTime();
      const rFin = new Date(`${r.fechaReserva}T${r.horaFin}`).getTime();
      return rInicio < fin && rFin > inicio;
    }) ?? null;
  };

  const aceptarSolicitud = async (reserva: Reserva) => {
    const conflicto = buscarConflictoHorario(reserva);
    if (conflicto) {
      const vehiculoConflicto = getVehiculo(conflicto.vehiculoId);
      toast.error(
        `No se puede aceptar: choca con la reserva de ${vehiculoConflicto?.placa ?? "otro vehículo"} ` +
        `del ${conflicto.fechaReserva} de ${conflicto.horaInicio} a ${conflicto.horaFin} en la misma celda.`
      );
      return;
    }
    try {
      await updateReserva(reserva.id, { estado: "activa" });
      await updateCelda(reserva.celdaId, { estado: "reservada" });
      toast.success("Solicitud aceptada — la celda queda reservada.");
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error accepting reserva:", error);
    }
  };

  const rechazarSolicitud = async (reserva: Reserva) => {
    try {
      await updateReserva(reserva.id, { estado: "rechazada" });
      toast.success("Solicitud rechazada.");
    } catch (error) {
      console.error("Error rejecting reserva:", error);
    }
  };

  return {
    reservas, viewOpen, setViewOpen, viewingReserva, setViewingReserva,
    search, setSearch, filterEstado, setFilterEstado, confirmDelete, setConfirmDelete,
    getVehiculo, getCelda, getParqueadero, getConductorReserva,
    counts, filteredReservas, handleDelete, confirmDeleteAction,
    puedeGestionarSolicitudes, solicitudesPendientes, aceptarSolicitud, rechazarSolicitud,
    miConductorId, celdas, parqueaderos, vehiculos,
    activeFiltersCount, clearFilters, isLoading,
  };
}

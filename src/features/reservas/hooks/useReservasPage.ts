import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useReservas, useRemoveReserva, useUpdateReserva } from "./useReservas";
import type { Reserva } from "@/services/api/reservas";
import { useUpdateCelda, useCeldas, useParqueaderos } from "@/features/parqueaderos";
import type { Celda } from "@/services/api/celdas";
import { useVehiculos, useConductores, vehiculoEstaParqueado } from "@/features/conductores";
import { useControlSalida } from "@/features/controlSalida";
import type { EstadoReserva } from "../lib/constants";

/** Datos, filtros y eliminación del historial de reservas. */
export function useReservasPage() {
  const { user } = useAuth();
  const { data: reservasTodas = [], isLoading } = useReservas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: controlesSalida = [] } = useControlSalida();
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
  // la otra termine y termina después de que la otra empieza.
  const seSolapan = (a: Reserva, b: Reserva) => {
    const aInicio = new Date(`${a.fechaReserva}T${a.horaInicio}`).getTime();
    const aFin = new Date(`${a.fechaReserva}T${a.horaFin}`).getTime();
    const bInicio = new Date(`${b.fechaReserva}T${b.horaInicio}`).getTime();
    const bFin = new Date(`${b.fechaReserva}T${b.horaFin}`).getTime();
    return bInicio < aFin && bFin > aInicio;
  };

  // Contra reservas ya "activa" (aceptadas): esto SÍ bloquea, es un doble-booking real —
  // dos solicitudes "pendiente" pueden competir por la misma franja sin problema, el
  // conflicto real solo existe si se intenta aceptar una segunda vez la misma franja.
  const buscarConflictoHorario = (reserva: Reserva): Reserva | null =>
    reservasTodas.find((r) => r.id !== reserva.id && r.celdaId === reserva.celdaId && r.estado === "activa" && seSolapan(reserva, r)) ?? null;

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

    // El vehículo pudo haberse estacionado en otro lado mientras esta solicitud esperaba
    // aprobación — eso sí se revalida antes de aceptar (a diferencia de "otra reserva", donde
    // es normal que el mismo vehículo tenga más de una solicitud pendiente compitiendo a la
    // vez; la que no se acepte se resuelve más abajo o por conflicto de horario).
    const vehiculoSolicitud = getVehiculo(reserva.vehiculoId);
    if (vehiculoSolicitud && vehiculoEstaParqueado(vehiculoSolicitud.id, controlesSalida)) {
      toast.error(`No se puede aceptar: el vehículo ${vehiculoSolicitud.placa} ya está estacionado en un parqueadero.`);
      return;
    }

    try {
      await updateReserva(reserva.id, { estado: "activa" });
      await updateCelda(reserva.celdaId, { estado: "reservada" });

      // Otras solicitudes "pendiente" de la MISMA celda que pedían una franja que ahora ya
      // no está disponible (se solapan con la que se acaba de aceptar) quedan sin sentido —
      // se rechazan automáticamente en vez de dejarlas colgadas hasta que alguien las gestione
      // a mano o venzan solas por el auto-vencimiento (ver useReservaAutoExpiry).
      const otrasEnConflicto = reservasTodas.filter(
        (r) => r.id !== reserva.id && r.celdaId === reserva.celdaId && r.estado === "pendiente" && seSolapan(reserva, r)
      );
      for (const otra of otrasEnConflicto) {
        await updateReserva(otra.id, { estado: "rechazada" });
      }

      toast.success(
        otrasEnConflicto.length > 0
          ? `Solicitud aceptada — la celda queda reservada. ${otrasEnConflicto.length} solicitud(es) en conflicto se rechazaron automáticamente.`
          : "Solicitud aceptada — la celda queda reservada."
      );
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
    miConductorId, celdas, parqueaderos, vehiculos, controlesSalida, reservasTodas,
    activeFiltersCount, clearFilters, isLoading,
  };
}

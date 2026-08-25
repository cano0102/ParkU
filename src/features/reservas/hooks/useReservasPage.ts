import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useReservas, useRemoveReserva } from "./useReservas";
import type { Reserva } from "@/services/api/reservas";
import { useUpdateCelda, useCeldas, useParqueaderos } from "@/features/parqueaderos";
import type { Celda } from "@/services/api/celdas";
import { useVehiculos, useConductores } from "@/features/conductores";
import type { EstadoReserva } from "../lib/constants";

/** Datos, filtros y eliminación del historial de reservas. */
export function useReservasPage() {
  const { data: reservas = [] } = useReservas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: parqueaderos = [] } = useParqueaderos();
  const removeReservaMutation = useRemoveReserva();
  const updateCeldaMutation = useUpdateCelda();
  const deleteReserva = (id: string) => removeReservaMutation.mutate(id);
  const updateCelda = (id: string, data: Partial<Omit<Celda, "id">>) => updateCeldaMutation.mutate({ id, data });

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

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    // Si la reserva seguía activa, libera la celda al eliminar el registro
    if (confirmDelete.estado === "pendiente" || confirmDelete.estado === "activa") {
      updateCelda(confirmDelete.celdaId, { estado: "disponible" });
    }
    deleteReserva(confirmDelete.id);
    toast.success("Reserva eliminada correctamente");
    setConfirmDelete(null);
  };

  const activeFiltersCount = [search, filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setFilterEstado("todos");
  };

  return {
    reservas, viewOpen, setViewOpen, viewingReserva, setViewingReserva,
    search, setSearch, filterEstado, setFilterEstado, confirmDelete, setConfirmDelete,
    getVehiculo, getCelda, getParqueadero, getConductorReserva,
    counts, filteredReservas, handleDelete, confirmDeleteAction,
    activeFiltersCount, clearFilters,
  };
}

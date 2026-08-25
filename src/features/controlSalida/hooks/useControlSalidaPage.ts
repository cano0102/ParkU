import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useControlSalida, useRemoveControlSalida } from "./useControlSalida";
import type { ControlSalida } from "@/services/api/controlSalida";
import { useVehiculos, useConductores } from "@/features/conductores";
import { useCeldas, useParqueaderos } from "@/features/parqueaderos";
import { PAGE_SIZE } from "../lib/helpers";

/** Datos, filtros, paginación y eliminación del historial de entrada/salida. */
export function useControlSalidaPage() {
  const { data: controlesSalida = [] } = useControlSalida();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: parqueaderos = [] } = useParqueaderos();
  const removeControlSalidaMutation = useRemoveControlSalida();
  const deleteControlSalida = useCallback(
    (id: string) => removeControlSalidaMutation.mutate(id),
    [removeControlSalidaMutation]
  );

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "en_parqueadero" | "finalizado">("todos");
  const [filterParqueadero, setFilterParqueadero] = useState<string>("todos");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<ControlSalida | null>(null);

  const getVehiculo = useCallback((vehiculoId: string) => vehiculos.find((v) => v.id === vehiculoId), [vehiculos]);
  const getCelda = useCallback((celdaId: string) => celdas.find((c) => c.id === celdaId), [celdas]);
  const getParqueadero = useCallback((parqueaderoId: string) => parqueaderos.find((p) => p.id === parqueaderoId), [parqueaderos]);

  const getConductorVehiculo = useCallback(
    (vehiculoId: string) => {
      const vehiculo = getVehiculo(vehiculoId);
      if (!vehiculo) return null;
      return conductores.find((c) => c.id === vehiculo.conductorId);
    },
    [vehiculos, conductores, getVehiculo]
  );

  // El conductor ya trae su propio documento/nombre (ver services/api/conductores.ts) —
  // ya no hace falta pasar por un Usuario vinculado (opcional) para mostrarlos.
  const getUsuarioConductor = getConductorVehiculo;

  // Celdas disponibles (sin filtrar por tipo)
  const celdasDisponibles = useMemo(() => celdas.filter((c) => c.estado === "disponible"), [celdas]);
  const vehiculosEnParqueadero = useMemo(() => controlesSalida.filter((c) => c.estado === "en_parqueadero"), [controlesSalida]);
  const vehiculosSalidos = useMemo(() => controlesSalida.filter((c) => c.estado === "finalizado"), [controlesSalida]);

  const filteredControles = useMemo(
    () =>
      controlesSalida
        .filter((control) => {
          const vehiculo = getVehiculo(control.vehiculoId);
          const celda = getCelda(control.celdaId);
          const usuario = getUsuarioConductor(control.vehiculoId);
          const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;

          const q = search.toLowerCase();
          const matchesSearch =
            vehiculo?.placa.toLowerCase().includes(q) ||
            celda?.numero.toLowerCase().includes(q) ||
            usuario?.nombre.toLowerCase().includes(q) ||
            usuario?.numeroDocumento.includes(q) ||
            vehiculo?.marca.toLowerCase().includes(q);
          const matchesEstado = filterEstado === "todos" ? true : control.estado === filterEstado;
          const matchesParqueadero = filterParqueadero === "todos" ? true : parqueadero?.id === filterParqueadero;
          return matchesSearch && matchesEstado && matchesParqueadero;
        })
        .sort((a, b) => new Date(b.fechaEntrada).getTime() - new Date(a.fechaEntrada).getTime()),
    [controlesSalida, search, filterEstado, filterParqueadero, getVehiculo, getCelda, getUsuarioConductor, getParqueadero]
  );

  useEffect(() => {
    setPage(1);
  }, [search, filterEstado, filterParqueadero]);

  const totalPages = Math.max(1, Math.ceil(filteredControles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedControles = useMemo(
    () => filteredControles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredControles, currentPage]
  );

  const handleDelete = useCallback((control: ControlSalida) => setConfirmDelete(control), []);

  const confirmDeleteAction = useCallback(() => {
    if (!confirmDelete) return;
    deleteControlSalida(confirmDelete.id);
    toast.success("Registro eliminado correctamente");
    setConfirmDelete(null);
  }, [confirmDelete, deleteControlSalida]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterEstado("todos");
    setFilterParqueadero("todos");
  }, []);

  const hasActiveFilters = !!search || filterEstado !== "todos" || filterParqueadero !== "todos";

  return {
    controlesSalida, parqueaderos,
    search, setSearch, filterEstado, setFilterEstado, filterParqueadero, setFilterParqueadero,
    confirmDelete, setConfirmDelete,
    getVehiculo, getCelda, getParqueadero, getUsuarioConductor,
    celdasDisponibles, vehiculosEnParqueadero, vehiculosSalidos,
    filteredControles, paginatedControles,
    currentPage, totalPages, setPage,
    handleDelete, confirmDeleteAction, clearFilters, hasActiveFilters,
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useControlSalida, useRemoveControlSalida, useUpdateControlSalida } from "./useControlSalida";
import type { ControlSalida } from "@/services/api/controlSalida";
import { useVehiculos, useConductores } from "@/features/conductores";
import { useCeldas, useParqueaderos, useUpdateCelda } from "@/features/parqueaderos";
import { PAGE_SIZE } from "../lib/helpers";

/** Datos, filtros, paginación y eliminación del historial de entrada/salida. */
export function useControlSalidaPage() {
  const { data: controlesSalida = [], isLoading } = useControlSalida();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: parqueaderos = [] } = useParqueaderos();
  const removeControlSalidaMutation = useRemoveControlSalida();
  const updateControlSalidaMutation = useUpdateControlSalida();
  const updateCeldaMutation = useUpdateCelda();
  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" cuando la mutación en realidad falla.
  const deleteControlSalida = useCallback(
    (id: string) => removeControlSalidaMutation.mutateAsync(id),
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
    [conductores, getVehiculo]
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
        // Orden por fecha/hora de SALIDA, lo más reciente primero. Los que siguen adentro no
        // tienen salida todavía: en vez de quedar al fondo (o romper la comparación con un
        // `new Date("")` inválido), van arriba —  son los registros vivos, los que el vigilante
        // necesita a mano— y entre ellos se ordenan por su hora de entrada más reciente.
        .sort((a, b) => {
          const salidaA = a.fechaSalida;
          const salidaB = b.fechaSalida;
          if (!salidaA && !salidaB) return new Date(b.fechaEntrada).getTime() - new Date(a.fechaEntrada).getTime();
          if (!salidaA) return -1;
          if (!salidaB) return 1;
          return new Date(salidaB).getTime() - new Date(salidaA).getTime();
        }),
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

  // Registrar salida directo desde esta pantalla — antes el único lugar donde liberar una
  // celda era el mapa/tabla de Parqueaderos (ver useReservaCelda.ts#handleRequestLiberar,
  // mismo patrón: cierra el ControlSalida y refresca la celda con lo que ya movió el trigger
  // del backend tras el POST de salida). Se mantiene aquí como una llamada aparte, no una
  // reutilización de ese hook, porque ese vive atado al estado de modal de la pantalla de
  // Parqueaderos (celda activa, ocupante activo) que esta pantalla no tiene.
  const handleLiberar = useCallback(
    async (control: ControlSalida) => {
      try {
        await updateControlSalidaMutation.mutateAsync({
          id: control.id,
          data: { estado: "finalizado", fechaSalida: new Date().toISOString() },
        });
        await updateCeldaMutation.mutateAsync({ id: control.celdaId, data: { estado: "disponible" } });
        toast.success("Salida registrada. Celda liberada.");
      } catch (error) {
        console.error("Error registering salida from ControlSalidaPage:", error);
      }
    },
    [updateControlSalidaMutation, updateCeldaMutation]
  );

  const confirmDeleteAction = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await deleteControlSalida(confirmDelete.id);
      toast.success("Registro eliminado correctamente");
      setConfirmDelete(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error deleting control de salida:", error);
    }
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
    handleDelete, confirmDeleteAction, clearFilters, hasActiveFilters, handleLiberar,
    isLoading,
  };
}

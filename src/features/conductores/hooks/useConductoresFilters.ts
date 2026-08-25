import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ConductoresData } from "./useConductoresData";

/** Búsqueda/filtros, modo de vista y paginación del listado de conductores. */
export function useConductoresFilters(data: Pick<ConductoresData, "conductores" | "getVehiculosConductor">) {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [filterVehiculoTipo, setFilterVehiculoTipo] = useState("todos");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
    setItemsPerPage(mode === "list" ? 15 : 9);
    setCurrentPage(1);
  }, []);

  const filteredConductores = useMemo(
    () =>
      data.conductores.filter((conductor) => {
        const q = search.toLowerCase();
        const vehiculosCond = data.getVehiculosConductor(conductor.id);
        const matchVehiculoTipo = filterVehiculoTipo === "todos"
          ? true
          : vehiculosCond.some((v) => v.tipo === filterVehiculoTipo);
        const matchesSearch =
          conductor.nombre.toLowerCase().includes(q) ||
          conductor.numeroDocumento.includes(search) ||
          (conductor.correo || "").toLowerCase().includes(q) ||
          conductor.centroFormacion.toLowerCase().includes(q) ||
          vehiculosCond.some((v) =>
            v.placa.toLowerCase().includes(q) ||
            v.marca.toLowerCase().includes(q)
          );
        const matchesTipo = filterTipo === "todos" ? true : conductor.tipoUsuarioNombre.toLowerCase() === filterTipo;
        const matchesEstado = filterEstado === "todos" ? true : conductor.estado === filterEstado;
        return matchesSearch && matchesTipo && matchesEstado && matchVehiculoTipo;
      }),
    [data.conductores, data.getVehiculosConductor, search, filterTipo, filterEstado, filterVehiculoTipo]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTipo, filterEstado, filterVehiculoTipo]);

  const totalPages = Math.max(1, Math.ceil(filteredConductores.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedConductores = useMemo(
    () => filteredConductores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredConductores, currentPage, itemsPerPage]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterTipo("todos");
    setFilterEstado("todos");
    setFilterVehiculoTipo("todos");
  }, []);

  const activeFiltersCount = useMemo(
    () =>
      [
        search,
        filterTipo !== "todos" ? filterTipo : "",
        filterEstado !== "todos" ? filterEstado : "",
        filterVehiculoTipo !== "todos" ? filterVehiculoTipo : "",
      ].filter(Boolean).length,
    [search, filterTipo, filterEstado, filterVehiculoTipo]
  );

  return {
    search, setSearch, filterTipo, setFilterTipo, filterEstado, setFilterEstado,
    filterVehiculoTipo, setFilterVehiculoTipo,
    viewMode, handleViewModeChange, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    filteredConductores, paginatedConductores, totalPages,
    clearFilters, activeFiltersCount,
  };
}

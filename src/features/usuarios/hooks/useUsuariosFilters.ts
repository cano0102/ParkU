import { useCallback, useEffect, useMemo, useState } from "react";
import type { UsuariosData } from "./useUsuariosData";
import { compararUsuariosPorRecientes } from "../lib/helpers";

/** Búsqueda/filtros, modo de vista y paginación del listado de usuarios. */
export function useUsuariosFilters(usuarios: UsuariosData["usuarios"]) {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [filterRol, setFilterRol] = useState("todos");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
    setItemsPerPage(mode === "list" ? 15 : 9);
    setCurrentPage(1);
  }, []);

  const filtered = useMemo(
    () =>
      usuarios.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
          u.nombre.toLowerCase().includes(q) ||
          u.correo.toLowerCase().includes(q);
        const matchEstado = filterEstado === "todos" || u.estado === filterEstado;
        const matchRol = filterRol === "todos" || String(u.rol) === filterRol;
        return matchSearch && matchEstado && matchRol;
      })
      // Más recientes primero; la paginación se aplica después sobre esta lista ya ordenada.
      .sort(compararUsuariosPorRecientes),
    [usuarios, search, filterEstado, filterRol]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterEstado, filterRol]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage, itemsPerPage]
  );

  return {
    search, setSearch, filterEstado, setFilterEstado, filterRol, setFilterRol,
    viewMode, handleViewModeChange, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    filtered, paginated, totalPages,
  };
}

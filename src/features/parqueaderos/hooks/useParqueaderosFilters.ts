import { compararPorRecientes } from "@/utils/orden";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import type { Celda } from "@/services/api/celdas";
import type { ParqueaderosData } from "./useParqueaderosData";

interface ParqueaderosFiltersOptions {
  /** true para quien solo debe ver celdas disponibles (Conductor): un parqueadero sin
   *  ninguna celda disponible en este momento no se lista, en vez de mostrarse vacío. */
  soloConCeldas?: boolean;
}

/** Pestaña activa, búsqueda/filtro de tipo, listas filtradas y estadísticas de ocupación. */
export function useParqueaderosFilters(data: ParqueaderosData, getOcupante: (celdaId: string) => { vehiculo: { placa: string }; conductor?: { nombre: string } } | null) {
  const { user } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const { parqueaderos, celdas, incidentes, misVehiculosPorCelda } = data;
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"map" | "table">("table");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const stats = useMemo(() => {
    const t = celdas.length;
    const o = celdas.filter((c) => c.estado === "no_disponible").length;
    const l = celdas.filter((c) => c.estado === "disponible").length;
    const m = celdas.filter((c) => c.estado === "mantenimiento").length;
    return { total: t, ocupadas: o, libres: l, mantenimiento: m };
  }, [celdas]);

  const cellMatchesSearch = useCallback(
    (celda: Celda) => {
      if (!search.trim()) return false;
      const q = search.toLowerCase();
      const ocupante = getOcupante(celda.id);
      return !!(celda.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q));
    },
    [search, getOcupante]
  );

  // Celdas con un incidente/novedad todavía abierto (pendiente o en proceso) — se usa para el
  // aviso visual (⚠️) en el plano y la tabla; uno ya resuelto/rechazado/cancelado no cuenta, esa
  // celda vuelve a verse "limpia" aunque conserve su historial.
  const celdasConIncidenteAbierto = useMemo(
    () => new Set(incidentes.filter((i) => i.estado === "pendiente" || i.estado === "en_proceso").map((i) => i.celdaId)),
    [incidentes]
  );
  const celdaTieneIncidenteAbierto = useCallback((celda: Celda) => celdasConIncidenteAbierto.has(celda.id), [celdasConIncidenteAbierto]);

  // Más recientes primero: el parqueadero recién creado aparece arriba, no al final.
  const filteredPqs = useMemo(
    () => parqueaderos.filter((pq) => filterTipo === "Todos" || pq.tipo === filterTipo).sort(compararPorRecientes),
    [parqueaderos, filterTipo],
  );
  const filteredCeldas = useMemo(() => {
    if (!search.trim()) return celdas;
    const q = search.toLowerCase();
    return celdas.filter((c) => {
      const ocupante = getOcupante(c.id);
      return c.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q);
    });
  }, [celdas, search, getOcupante]);
  const filteredPqsConCeldas = useMemo(
    () =>
      filteredPqs.filter(
        (pq) => filteredCeldas.some((c) => c.parqueaderoId === pq.id) || (!search.trim() && !options?.soloConCeldas)
      ),
    [filteredPqs, filteredCeldas, search, options?.soloConCeldas]
  );

  const activeFilters = [search, filterTipo !== "Todos" ? filterTipo : ""].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setFilterTipo("Todos");
  };

  // Comunidad SENA (Conductor) no ve el listado de parqueaderos en absoluto — solo las celdas
  // disponibles (más la suya propia si tiene un vehículo estacionado), sin agrupar por
  // parqueadero: no gestiona nada acá, solo necesita saber dónde puede parquear.
  const celdasDisponiblesConductor = useMemo(
    () => celdas.filter((c) => c.estado === "disponible" || misVehiculosPorCelda[c.id]),
    [celdas, misVehiculosPorCelda]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTipo]);

  const totalPages = Math.max(
    1,
    Math.ceil((esConductor ? celdasDisponiblesConductor.length : filteredPqsConCeldas.length) / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Solo la vista de tabla se pagina: el plano (mapa) necesita ver todos los parqueaderos a
  // la vez, partirlo en páginas dejaría el layout espacial incompleto y confuso.
  const paginatedPqsConCeldas = useMemo(
    () => filteredPqsConCeldas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredPqsConCeldas, currentPage, itemsPerPage]
  );

  const paginatedCeldasDisponibles = useMemo(
    () => celdasDisponiblesConductor.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [celdasDisponiblesConductor, currentPage, itemsPerPage]
  );

  return {
    activeTab, setActiveTab,
    search, setSearch,
    filterTipo, setFilterTipo,
    stats, cellMatchesSearch, celdaTieneIncidenteAbierto,
    filteredCeldas, filteredPqsConCeldas, paginatedPqsConCeldas,
    celdasDisponiblesConductor, paginatedCeldasDisponibles,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, totalPages,
    activeFilters, clearFilters,
  };
}

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Celda } from "@/services/api/celdas";
import type { ParqueaderosData } from "./useParqueaderosData";

/** Pestaña activa, búsqueda/filtro de tipo, listas filtradas y estadísticas de ocupación. */
export function useParqueaderosFilters(data: ParqueaderosData, getOcupante: (celdaId: string) => { vehiculo: { placa: string }; conductor?: { nombre: string } } | null) {
  const { parqueaderos, celdas } = data;
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"map" | "table">("table");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [filterTipo, setFilterTipo] = useState("Todos");

  const stats = useMemo(() => {
    const t = celdas.length;
    const o = celdas.filter((c) => c.estado === "no_disponible").length;
    const l = celdas.filter((c) => c.estado === "disponible").length;
    const r = celdas.filter((c) => c.estado === "reservada").length;
    return { total: t, ocupadas: o, libres: l, reservadas: r, pct: t ? Math.round((o / t) * 100) : 0 };
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

  const filteredPqs = useMemo(() => parqueaderos.filter((pq) => filterTipo === "Todos" || pq.tipo === filterTipo), [parqueaderos, filterTipo]);
  const filteredCeldas = useMemo(() => {
    if (!search.trim()) return celdas;
    const q = search.toLowerCase();
    return celdas.filter((c) => {
      const ocupante = getOcupante(c.id);
      return c.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q);
    });
  }, [celdas, search, getOcupante]);
  const filteredPqsConCeldas = useMemo(
    () => filteredPqs.filter((pq) => filteredCeldas.some((c) => c.parqueaderoId === pq.id) || !search.trim()),
    [filteredPqs, filteredCeldas, search]
  );

  const activeFilters = [search, filterTipo !== "Todos" ? filterTipo : ""].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setFilterTipo("Todos");
  };

  return {
    activeTab, setActiveTab,
    search, setSearch,
    filterTipo, setFilterTipo,
    stats, cellMatchesSearch,
    filteredCeldas, filteredPqsConCeldas,
    activeFilters, clearFilters,
  };
}

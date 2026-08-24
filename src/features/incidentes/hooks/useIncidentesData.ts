import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useParqueaderos, useCeldas } from "@/features/parqueaderos";
import { useVehiculos, useConductores } from "@/features/conductores";
import type { Incidente } from "@/services/api/incidentes";
import {
  useIncidentes,
  useCreateIncidente,
  useUpdateIncidente,
  useRemoveIncidente,
} from "./useIncidentes";
import type { EstadoIncidente } from "../lib/constants";

/** Datos base de Incidentes: queries, mutaciones, lookups hacia Parqueaderos/Celdas, stats y filtrado. */
export function useIncidentesData() {
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: conductores = [] } = useConductores();
  const { data: incidentes = [] } = useIncidentes();
  const createIncidenteMutation = useCreateIncidente();
  const updateIncidenteMutation = useUpdateIncidente();
  const removeIncidenteMutation = useRemoveIncidente();
  const addIncidente = (data: Omit<Incidente, "id">) => createIncidenteMutation.mutate(data);
  const updateIncidente = (id: string, data: Partial<Omit<Incidente, "id">>) =>
    updateIncidenteMutation.mutate({ id, data });
  const deleteIncidente = (id: string) => removeIncidenteMutation.mutate(id);

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoIncidente>("todos");

  const parqueaderoPorId = useMemo(() => new Map(parqueaderos.map((p) => [p.id, p])), [parqueaderos]);
  const celdaPorId = useMemo(() => new Map(celdas.map((c) => [c.id, c])), [celdas]);

  const nombreParqueadero = (id: string) => parqueaderoPorId.get(id)?.nombre ?? "—";
  const celdaDe = (id?: string) => (id ? celdaPorId.get(id) : undefined);

  const ocupanteDeCelda = (celdaId?: string) => {
    if (!celdaId) return null;
    const veh = vehiculos.find((v) => v.celdaId === celdaId);
    if (!veh) return null;
    const cond = conductores.find((c) => c.id === veh.conductorId);
    return { vehiculo: veh, conductorNombre: cond?.nombre };
  };

  const pendientes = incidentes.filter((i) => i.estado === "pendiente").length;
  const resueltos = incidentes.filter((i) => i.estado === "resuelto").length;
  const conEvidencia = incidentes.filter((i) => i.evidencia).length;

  const toggleEstado = (id: string) => {
    const incidente = incidentes.find((i) => i.id === id);
    if (incidente) {
      updateIncidente(id, {
        estado: incidente.estado === "resuelto" ? "pendiente" : "resuelto",
      });
      toast.success("Estado del incidente actualizado");
    }
  };

  const filteredIncidentes = useMemo(
    () =>
      incidentes
        .filter((inc) => {
          const q = search.toLowerCase();
          const pqNombre = nombreParqueadero(inc.parqueaderoId).toLowerCase();
          const celdaNumero = celdaDe(inc.celdaId)?.numero.toLowerCase() ?? "";
          const matchesSearch =
            inc.descripcion.toLowerCase().includes(q) ||
            pqNombre.includes(q) ||
            celdaNumero.includes(q) ||
            (inc.vehiculo && inc.vehiculo.toLowerCase().includes(q));
          const matchesEstado = filterEstado === "todos" ? true : inc.estado === filterEstado;
          return matchesSearch && matchesEstado;
        })
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [incidentes, search, filterEstado, parqueaderoPorId, celdaPorId]
  );

  const activeFiltersCount = [search, filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setFilterEstado("todos");
  };

  return {
    parqueaderos,
    celdas,
    vehiculos,
    incidentes,
    addIncidente,
    updateIncidente,
    deleteIncidente,
    search,
    setSearch,
    filterEstado,
    setFilterEstado,
    nombreParqueadero,
    celdaDe,
    ocupanteDeCelda,
    pendientes,
    resueltos,
    conEvidencia,
    toggleEstado,
    filteredIncidentes,
    activeFiltersCount,
    clearFilters,
  };
}

export type IncidentesData = ReturnType<typeof useIncidentesData>;

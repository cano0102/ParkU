import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useParqueaderos, useCeldas } from "@/features/parqueaderos";
import { useControlSalida } from "@/features/controlSalida";
import { useVehiculos, useConductores } from "@/features/conductores";
import { useUsuarios } from "@/features/usuarios";
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
  const { data: controlesSalida = [] } = useControlSalida();
  // Solo Admin puede listar /api/usuarios — para Vigilante/Conductor queda en
  // [] y el selector de "asignar a" simplemente aparece vacío (ver IncidenteVehiculoAsignadoFields).
  const { data: usuarios = [] } = useUsuarios();
  const { data: incidentes = [] } = useIncidentes();
  const createIncidenteMutation = useCreateIncidente();
  const updateIncidenteMutation = useUpdateIncidente();
  const removeIncidenteMutation = useRemoveIncidente();
  const addIncidente = (data: Omit<Incidente, "id" | "fecha">) => createIncidenteMutation.mutate({ ...data, fecha: new Date().toISOString() });
  const updateIncidente = (id: string, data: Partial<Omit<Incidente, "id">>) =>
    updateIncidenteMutation.mutate({ id, data });
  const deleteIncidente = (id: string) => removeIncidenteMutation.mutate(id);

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoIncidente>("todos");

  const parqueaderoPorId = useMemo(() => new Map(parqueaderos.map((p) => [p.id, p])), [parqueaderos]);
  const celdaPorId = useMemo(() => new Map(celdas.map((c) => [c.id, c])), [celdas]);
  const vehiculoPorId = useMemo(() => new Map(vehiculos.map((v) => [v.id, v])), [vehiculos]);

  const usuarioPorId = useMemo(() => new Map(usuarios.map((u) => [u.id, u])), [usuarios]);

  const nombreParqueadero = (id: string) => parqueaderoPorId.get(id)?.nombre ?? "—";
  const celdaDe = (id?: string) => (id ? celdaPorId.get(id) : undefined);
  const vehiculoDe = (id?: string) => (id ? vehiculoPorId.get(id) : undefined);
  const nombreUsuarioAsignado = (id?: string) => (id ? usuarioPorId.get(id)?.nombre : undefined);

  // Quién ocupa una celda AHORA: se deriva del registro de entrada/salida abierto
  // (ver services/api/controlSalida.ts) — el vehículo ya no guarda su propia celda.
  const ocupanteDeCelda = (celdaId?: string) => {
    if (!celdaId) return null;
    const cs = controlesSalida.find((c) => c.celdaId === celdaId && c.estado === "en_parqueadero");
    if (!cs) return null;
    const veh = vehiculos.find((v) => v.id === cs.vehiculoId);
    if (!veh) return null;
    const cond = conductores.find((c) => c.id === (cs.conductorId || veh.conductorId));
    return { vehiculo: veh, conductorNombre: cond?.nombre };
  };

  const pendientes = incidentes.filter((i) => i.estado === "pendiente").length;
  const enProceso = incidentes.filter((i) => i.estado === "en_proceso").length;
  const resueltos = incidentes.filter((i) => i.estado === "resuelto").length;

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
          const placa = (vehiculoDe(inc.vehiculoId)?.placa ?? "").toLowerCase();
          const matchesSearch =
            inc.descripcion.toLowerCase().includes(q) ||
            pqNombre.includes(q) ||
            celdaNumero.includes(q) ||
            placa.includes(q);
          const matchesEstado = filterEstado === "todos" ? true : inc.estado === filterEstado;
          return matchesSearch && matchesEstado;
        })
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [incidentes, search, filterEstado, parqueaderoPorId, celdaPorId, vehiculoPorId]
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
    usuarios,
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
    vehiculoDe,
    nombreUsuarioAsignado,
    ocupanteDeCelda,
    pendientes,
    enProceso,
    resueltos,
    toggleEstado,
    filteredIncidentes,
    activeFiltersCount,
    clearFilters,
  };
}

export type IncidentesData = ReturnType<typeof useIncidentesData>;

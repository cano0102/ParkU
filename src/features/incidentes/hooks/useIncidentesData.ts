import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
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
import { ESTADO_CONFIG, type EstadoIncidente } from "../lib/constants";
import { compararIncidentes } from "../lib/orden";
import { esEstadoFinal, puedeCambiarA } from "../lib/transiciones";

interface UseIncidentesDataOptions {
  /** El listado de incidentes hay que intentarlo igual para Comunidad SENA — no existe otra
   *  ruta que le dé su propio historial (ver useConductorIncidentesData.ts) — pero ese hook ya
   *  construye su propio mensaje persistente de error en pantalla; pasar `true` evita que el
   *  toast global de App.tsx muestre una segunda copia redundante del mismo aviso. */
  silentIncidentesError?: boolean;
}

/** Datos base de Incidentes: queries, mutaciones, lookups hacia Parqueaderos/Celdas, stats y filtrado. */
export function useIncidentesData(options?: UseIncidentesDataOptions) {
  const { user } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: conductores = [] } = useConductores();
  // Solo Admin/Vigilante pueden listar /api/entradas-salidas — 403 en vivo para Comunidad SENA;
  // solo se usa más abajo para "quién ocupa esta celda ahora", una vista de gestión que ese rol
  // no tiene en su pantalla de incidentes.
  const { data: controlesSalida = [] } = useControlSalida({ enabled: !esConductor });
  // Solo Admin puede listar /api/usuarios — para Vigilante/Conductor queda deshabilitada (antes
  // solo quedaba en [] tras un 403 real; ahora que las lecturas fallidas sí avisan globalmente,
  // desactivarla evita ese toast para dos roles que nunca iban a poder verla).
  const { data: usuarios = [] } = useUsuarios({ enabled: user?.rol === ROLES.ADMIN });
  const { data: incidentes = [], isLoading, isError } = useIncidentes({ silentError: options?.silentIncidentesError });
  const createIncidenteMutation = useCreateIncidente();
  const updateIncidenteMutation = useUpdateIncidente();
  const removeIncidenteMutation = useRemoveIncidente();
  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación en realidad falla.
  const addIncidente = (data: Omit<Incidente, "id" | "fecha">) => createIncidenteMutation.mutateAsync({ ...data, fecha: new Date().toISOString() });
  const updateIncidente = (id: string, data: Partial<Omit<Incidente, "id">>) =>
    updateIncidenteMutation.mutateAsync({ id, data });
  const deleteIncidente = (id: string) => removeIncidenteMutation.mutateAsync(id);

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoIncidente>("todos");

  const parqueaderoPorId = useMemo(() => new Map(parqueaderos.map((p) => [p.id, p])), [parqueaderos]);
  const celdaPorId = useMemo(() => new Map(celdas.map((c) => [c.id, c])), [celdas]);
  const vehiculoPorId = useMemo(() => new Map(vehiculos.map((v) => [v.id, v])), [vehiculos]);

  const usuarioPorId = useMemo(() => new Map(usuarios.map((u) => [u.id, u])), [usuarios]);
  // "Asignar a" solo debe ofrecer Vigilantes (son quienes de verdad gestionan incidentes en
  // campo) — `usuarios` completo se conserva aparte para resolver el nombre de un incidente ya
  // asignado antes de este cambio, aunque esa persona ya no sea Vigilante.
  const usuariosAsignables = useMemo(() => usuarios.filter((u) => u.rol === ROLES.VIGILANTE), [usuarios]);

  const nombreParqueadero = (id: string) => parqueaderoPorId.get(id)?.nombre ?? "—";
  const celdaDe = (id?: string) => (id ? celdaPorId.get(id) : undefined);
  const vehiculoDe = (id?: string) => (id ? vehiculoPorId.get(id) : undefined);
  const nombreUsuarioAsignado = (id?: string) => (id ? usuarioPorId.get(id)?.nombre : undefined);
  // Trazabilidad del incidente hacia la persona: novedad -> vehiculo_id -> conductor_principal
  // (no hay FK directa novedad->conductor, ver services/api/incidentes.ts).
  const conductorDe = (vehiculoId?: string) => {
    const veh = vehiculoDe(vehiculoId);
    return veh?.conductorId ? conductores.find((c) => c.id === veh.conductorId) : undefined;
  };

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

  /**
   * Cambia el estado de un incidente respetando las transiciones válidas
   * (lib/transiciones.ts): desde pendiente o en proceso se puede avanzar, mientras que
   * resuelto, cerrado y cancelado son finales y ya no admiten cambios. La tarjeta solo
   * ofrece los destinos válidos; estas guardas cubren cualquier otra vía de llamada.
   * El backend debe aplicar la misma regla.
   */
  const cambiarEstado = async (id: string, nuevoEstado: EstadoIncidente) => {
    const incidente = incidentes.find((i) => i.id === id);
    if (!incidente || incidente.estado === nuevoEstado) return;

    if (esEstadoFinal(incidente.estado)) {
      toast.error(`Un incidente ${ESTADO_CONFIG[incidente.estado].label.toLowerCase()} ya no puede cambiar de estado.`);
      return;
    }
    if (!puedeCambiarA(incidente.estado, nuevoEstado)) {
      toast.error("Ese cambio de estado no está permitido.");
      return;
    }

    try {
      await updateIncidente(id, { estado: nuevoEstado });
      toast.success(`Incidente marcado como "${ESTADO_CONFIG[nuevoEstado].label}"`);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error changing incidente estado:", error);
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
        .sort(compararIncidentes),
    // nombreParqueadero/celdaDe/vehiculoDe son funciones nuevas en cada render, pero lo que
    // de verdad cambia el resultado son los mapas que consultan, ya declarados aquí.
    // Depender de las funciones haría que este memo se recalculara siempre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    usuariosAsignables,
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
    conductorDe,
    nombreUsuarioAsignado,
    ocupanteDeCelda,
    pendientes,
    enProceso,
    resueltos,
    cambiarEstado,
    filteredIncidentes,
    activeFiltersCount,
    clearFilters,
    isLoading,
    isError,
  };
}

export type IncidentesData = ReturnType<typeof useIncidentesData>;

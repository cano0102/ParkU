import { useEffect, useMemo, useState } from "react";
import { useParqueaderos, useCeldas } from "@/features/parqueaderos";
import { useControlSalida } from "@/features/controlSalida";
import { useVehiculos, useConductores } from "@/features/conductores";
import { useIncidentes } from "@/features/incidentes";
import { useReservas } from "@/features/reservas";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { theme } from "@/styles/theme";
import { availableOf, occupancyOf, type Movement, type ParkingLot } from "../lib/helpers";

const COLORS = theme;

/** Toda la data derivada del Dashboard: parqueaderos, movimientos, totales, alertas y distribuciones. */
export function useDashboardData() {
  const [filter, setFilter] = useState<"all" | "car" | "moto">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // `DashboardPage.tsx` llama a este hook incondicionalmente y solo DESPUÉS decide renderizar
  // <ConductorDashboard/> en su lugar para ese rol — por reglas de hooks no se puede saltar la
  // llamada, así que las queries que la API real bloquea para Comunidad SENA (403 documentado:
  // entradas-salidas, vehículos, conductores, novedades, reservas completas) se deshabilitan
  // aquí mismo con `enabled`. Sin esto, cada Conductor que abrieaa el Dashboard disparaba cinco
  // peticiones condenadas a fallar — antes se veían silenciosamente vacías, y ahora que las
  // queries fallidas sí avisan (`QueryCache.onError` en App.tsx) se habrían visto como toasts
  // de error en una pantalla que ese rol nunca llega a ver de verdad.
  const { user } = useAuth();
  const esComunidadSena = user?.rol === ROLES.CONDUCTOR;

  const { data: parqueaderos = [], isLoading: loadingParqueaderos } = useParqueaderos();
  const { data: celdas = [], isLoading: loadingCeldas } = useCeldas();
  const { data: controlesSalida = [] } = useControlSalida({ enabled: !esComunidadSena });
  const { data: vehiculos = [] } = useVehiculos({ enabled: !esComunidadSena });
  const { data: conductores = [] } = useConductores({ enabled: !esComunidadSena });
  const { data: incidentes = [] } = useIncidentes({ enabled: !esComunidadSena });
  const { data: reservas = [] } = useReservas({ enabled: !esComunidadSena });
  // Solo se espera a parqueaderos/celdas (lo primero que se ve en pantalla): el resto son
  // datos secundarios de paneles específicos, esperarlos todos solo alargaría la carga inicial.
  const isLoading = loadingParqueaderos || loadingCeldas;

  // Parqueaderos + celdas reales del contexto
  const lots = useMemo<ParkingLot[]>(() => {
    return parqueaderos.map((pq) => {
      const celdasDelPQ = celdas.filter((c) => c.parqueaderoId === pq.id);
      const ocupadas = celdasDelPQ.filter((c) => c.estado === "no_disponible").length;
      const reservadas = celdasDelPQ.filter((c) => c.estado === "reservada").length;
      const mantenimiento = celdasDelPQ.filter((c) => c.estado === "mantenimiento").length;
      const carros = celdasDelPQ.filter((c) => c.tipo === "carro").length;
      const motos = celdasDelPQ.filter((c) => c.tipo === "moto").length;

      let tipo: ParkingLot["type"] = "mixed";
      if (motos === 0) tipo = "car";
      else if (carros === 0) tipo = "moto";

      return {
        id: pq.id,
        name: pq.nombre,
        block: pq.zona || pq.ubicacion,
        type: tipo,
        status: pq.estado === "activo" ? "activo" : "mantenimiento",
        // Antes usaba `pq.capacidadMaxima` primero — un número que el Admin escribe a mano al
        // crear el parqueadero, sin ninguna relación forzada con la cantidad real de celdas
        // generadas (esas se definen aparte). Eso hacía que el % de ocupación del Dashboard
        // pudiera no coincidir con el que muestra la pantalla de Parqueaderos, que sí cuenta
        // las celdas reales — se unifica usando siempre el conteo real acá también.
        capacity: celdasDelPQ.length || 1,
        occupied: ocupadas,
        reserved: reservadas,
        maintenance: mantenimiento,
      };
    });
  }, [parqueaderos, celdas]);

  // Movimientos reales: cada registro de entrada/salida genera un movimiento "entrada"
  // (fecha de ingreso) y, si ya salió, uno más de "salida" (fecha de salida) — ya no hay
  // un endpoint/tabla "movimientos" separado, se deriva directo de entradas-salidas.
  const movements = useMemo<Movement[]>(() => {
    const items: (Movement & { orden: string })[] = [];
    for (const cs of controlesSalida) {
      const vehiculo = vehiculos.find((v) => v.id === cs.vehiculoId);
      const conductor = conductores.find((c) => c.id === (cs.conductorId || vehiculo?.conductorId));
      items.push({
        id: `${cs.id}-entrada`,
        plate: vehiculo?.placa ?? "",
        driver: conductor?.nombre ?? vehiculo?.conductorNombre ?? "",
        lotId: cs.parqueaderoId,
        kind: "entrada",
        vehicle: vehiculo?.tipo === "moto" ? "Moto" : "Automovil",
        fecha: cs.fechaEntrada,
        orden: cs.fechaEntrada,
      });
      if (cs.fechaSalida) {
        items.push({
          id: `${cs.id}-salida`,
          plate: vehiculo?.placa ?? "",
          driver: conductor?.nombre ?? vehiculo?.conductorNombre ?? "",
          lotId: cs.parqueaderoId,
          kind: "salida",
          vehicle: vehiculo?.tipo === "moto" ? "Moto" : "Automovil",
          fecha: cs.fechaSalida,
          orden: cs.fechaSalida,
        });
      }
    }
    return items.sort((a, b) => b.orden.localeCompare(a.orden)).slice(0, 10);
  }, [controlesSalida, vehiculos, conductores]);

  useEffect(() => {
    if (lots.length > 0 && !selectedId) {
      setSelectedId(lots[0].id);
    }
  }, [lots, selectedId]);

  const visibleLots = useMemo(() => {
    if (filter === "all") return lots;
    return lots.filter((l) => l.type === filter || l.type === "mixed");
  }, [filter, lots]);

  const selectedLot = visibleLots.find((l) => l.id === selectedId) ?? visibleLots[0] ?? lots[0];

  const totals = useMemo(() => {
    const capacity = lots.reduce((a, l) => a + l.capacity, 0);
    const occupied = lots.reduce((a, l) => a + l.occupied, 0);
    const reserved = lots.reduce((a, l) => a + l.reserved, 0);
    const maintenance = lots.reduce((a, l) => a + l.maintenance, 0);
    const available = lots.reduce((a, l) => a + availableOf(l), 0);
    return {
      capacity, occupied, reserved, maintenance, available,
      pct: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
      activeLots: lots.filter((l) => l.status === "activo").length,
    };
  }, [lots]);

  const incidentesPendientes = useMemo(() => incidentes.filter((i) => i.estado === "pendiente"), [incidentes]);

  const reservaCounts = useMemo(() => ({
    pendiente: reservas.filter((r) => r.estado === "pendiente").length,
    activa: reservas.filter((r) => r.estado === "activa").length,
    completada: reservas.filter((r) => r.estado === "completada").length,
    cancelada: reservas.filter((r) => r.estado === "cancelada").length,
  }), [reservas]);

  const alerts = useMemo(() => {
    const high = lots.filter((l) => occupancyOf(l) >= 82);
    const result: { label: string; tone: "red" | "amber" | "green" }[] = [];

    if (high.length > 0) {
      result.push({ label: `${high.length} parqueadero(s) al ${Math.max(...high.map(occupancyOf))}% — casi lleno`, tone: "red" });
    }
    if (incidentesPendientes.length > 0) {
      result.push({ label: `${incidentesPendientes.length} incidente(s) pendiente(s) por resolver`, tone: "red" });
    }
    if (totals.maintenance > 0) {
      result.push({ label: `${totals.maintenance} celda(s) en mantenimiento`, tone: "amber" });
    }
    if (result.length === 0) {
      result.push({ label: "Todos los sistemas operan con normalidad", tone: "green" });
    }
    return result;
  }, [lots, totals.maintenance, incidentesPendientes]);

  const selectedStats = useMemo(() => {
    if (!selectedLot) return [];
    return [
      { label: "Ocupadas", value: selectedLot.occupied, color: COLORS.primary },
      { label: "Libres", value: availableOf(selectedLot), color: COLORS.blue },
      { label: "Reservadas", value: selectedLot.reserved, color: COLORS.amber },
      { label: "Mant.", value: selectedLot.maintenance, color: COLORS.red },
    ];
  }, [selectedLot]);

  // "Inactivo" debe reflejarse en los totales del Dashboard: un vehículo o conductor
  // desactivado ya no cuenta como "registrado" para estas métricas.
  const vehiculosActivos = useMemo(() => vehiculos.filter((v) => v.estado === "activo"), [vehiculos]);
  const conductoresActivos = useMemo(() => conductores.filter((c) => c.estado === "activo"), [conductores]);

  const vehicleDistribution = useMemo(() => {
    const carros = vehiculosActivos.filter((v) => v.tipo === "carro").length;
    const motos = vehiculosActivos.filter((v) => v.tipo === "moto").length;
    return [
      { label: "Carros", value: carros, color: COLORS.blue },
      { label: "Motos", value: motos, color: COLORS.amber },
    ];
  }, [vehiculosActivos]);

  const conductorDistribution = useMemo(() => {
    const aprendices = conductoresActivos.filter((c) => c.tipoUsuarioNombre.toLowerCase() === "aprendiz").length;
    const instructores = conductoresActivos.filter((c) => c.tipoUsuarioNombre.toLowerCase() === "instructor").length;
    return [
      { label: "Aprendices", value: aprendices, color: COLORS.primary },
      { label: "Instructores", value: instructores, color: COLORS.blue },
    ];
  }, [conductoresActivos]);

  const accessibility = useMemo(() => {
    const celdasMR = celdas.filter((c) => c.usabilidad === "movilidad_reducida");
    const disponiblesMR = celdasMR.filter((c) => c.estado === "disponible").length;
    const conductoresDiscapacidad = conductores.filter((c) => c.movilidadReducida).length;
    return { totalMR: celdasMR.length, disponiblesMR, conductoresDiscapacidad };
  }, [celdas, conductores]);

  const entradas = movements.filter((m) => m.kind === "entrada").length;
  const salidas = movements.filter((m) => m.kind === "salida").length;

  return {
    filter, setFilter, selectedId, setSelectedId,
    lots, movements, visibleLots, selectedLot, totals,
    incidentesPendientes, reservaCounts, alerts, selectedStats,
    vehiculosActivos, conductoresActivos, vehicleDistribution, conductorDistribution,
    accessibility, entradas, salidas, isLoading,
  };
}

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  IconCar as Car,
  IconDoorExit as DoorOpen,
  IconCircleLetterP as ParkingCircle,
  IconUsers as Users,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { LoadingState } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useClock } from "./hooks/useClock";
import { useDashboardData } from "./hooks/useDashboardData";
import { Kpi } from "./components/DashboardPrimitives";
import { DashboardHeader } from "./components/DashboardHeader";
import { ParqueaderosPanel } from "./components/ParqueaderosPanel";
import { PanoramaPanel } from "./components/PanoramaPanel";
import { EntradasSalidasPanel } from "./components/EntradasSalidasPanel";
import { OcupacionPanel } from "./components/OcupacionPanel";
import { DistribucionPanel } from "./components/DistribucionPanel";
import { MovimientosPanel } from "./components/MovimientosPanel";
import { ReservasIncidentesPanel } from "./components/ReservasIncidentesPanel";
import { AvisosPanel } from "./components/AvisosPanel";
import ConductorDashboard from "./components/ConductorDashboard";

const COLORS = theme;

export default function Dashboard() {
  const navigate = useNavigate();
  const now = useClock();
  const { user, hasPermission } = useAuth();
  const esComunidadSena = user?.rol === ROLES.CONDUCTOR;
  /* Los avisos son trabajo por hacer, y solo tiene sentido enseñárselos a quien puede
     hacerlo: Administrador y Vigilante. Se decide por permiso y no por el id del rol para
     que un rol creado a medida con esos mismos permisos también los vea. */
  const puedeGestionarReservas = !esComunidadSena && hasPermission("reservas");
  const puedeGestionarIncidentes = !esComunidadSena && hasPermission("incidentes");
  const d = useDashboardData();

  // El rol Comunidad SENA (Conductor) no tiene permiso en la API real para
  // consultar entradas-salidas/reservas completas/novedades (403 confirmado
  // en vivo) — el Dashboard completo de abajo depende de esos datos, así que
  // para este rol se muestra una versión reducida con solo lo que le sirve:
  // su celda asignada (si aplica), sus vehículos y sus reservas.
  if (esComunidadSena) {
    return <ConductorDashboard />;
  }

  if (d.isLoading) {
    return (
      <div className="dashboard-root">
        <LoadingState message="Cargando dashboard..." />
      </div>
    );
  }

  if (!d.selectedLot) {
    return null;
  }

  return (
    <>
      <style>{`
        :root { color-scheme: light; }
        body { margin: 0; font-family: 'Montserrat', sans-serif; }
        * { box-sizing: border-box; }
        ::selection { background: ${COLORS.primary}; color: white; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="dashboard-root flex flex-col gap-7"
      >
        <DashboardHeader now={now} />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Celdas totales" value={d.totals.capacity} detail={`${d.totals.activeLots} parqueaderos activos`} icon={ParkingCircle} color={COLORS.primary} onClick={() => navigate("/app/parqueaderos")} />
          <Kpi label="Celdas disponibles" value={d.totals.available} detail={`${d.totals.reserved} reservadas · ${d.totals.maintenance} en mant.`} icon={DoorOpen} color={COLORS.blue} onClick={() => navigate("/app/parqueaderos")} />
          <Kpi label="Vehículos registrados" value={d.vehiculosActivos.length} detail={`${d.vehicleDistribution[0].value} carros · ${d.vehicleDistribution[1].value} motos`} icon={Car} color={COLORS.amber} onClick={() => navigate("/app/conductores")} />
          <Kpi label="Conductores registrados" value={d.conductoresActivos.length} detail={`${d.conductorDistribution[0].value} aprendices · ${d.conductorDistribution[1].value} instructores`} icon={Users} color={COLORS.purple} onClick={() => navigate("/app/conductores")} />
        </div>

        {/* Lo que espera a alguien va arriba, antes que cualquier estadística: son las dos
            cosas que alguien tiene que ir a resolver hoy. */}
        {(puedeGestionarReservas || puedeGestionarIncidentes) && (
          <AvisosPanel
            reservasPendientes={puedeGestionarReservas ? d.reservaCounts.pendiente : 0}
            incidentesPendientes={puedeGestionarIncidentes ? d.incidentesPendientes.length : 0}
            novedadesPendientes={puedeGestionarIncidentes ? d.novedadesPendientes.length : 0}
            onVerReservas={() => navigate("/app/reservas")}
            onVerIncidentes={() => navigate("/app/incidentes")}
          />
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          <ParqueaderosPanel
            filter={d.filter}
            onFilterChange={d.setFilter}
            visibleLots={d.visibleLots}
            selectedLot={d.selectedLot}
            onSelectLot={d.setSelectedId}
            selectedStats={d.selectedStats}
            onManage={() => navigate("/app/parqueaderos")}
          />
          <PanoramaPanel pct={d.totals.pct} occupied={d.totals.occupied} available={d.totals.available} maintenance={d.totals.maintenance} alerts={d.alerts} />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <EntradasSalidasPanel entradas={d.entradas} salidas={d.salidas} totalMovimientos={d.movements.length} onVerControlAcceso={() => navigate("/app/entrada-salida")} />
          <OcupacionPanel lots={d.lots} onGestionar={() => navigate("/app/parqueaderos")} />
          <DistribucionPanel vehicleDistribution={d.vehicleDistribution} conductorDistribution={d.conductorDistribution} accessibility={d.accessibility} onVerConductores={() => navigate("/app/conductores")} />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <MovimientosPanel movements={d.movements} lots={d.lots} onVerTodos={() => navigate("/app/entrada-salida")} />
          <ReservasIncidentesPanel
            reservaCounts={d.reservaCounts}
            incidentesPendientes={d.incidentesPendientes}
            lots={d.lots}
            onVerIncidentes={() => navigate("/app/incidentes")}
            onVerReservas={() => navigate("/app/reservas")}
          />
        </div>
      </motion.div>
    </>
  );
}

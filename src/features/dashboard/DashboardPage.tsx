import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Car, DoorOpen, ParkingCircle, Users } from "lucide-react";
import { theme } from "@/styles/theme";
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

const COLORS = theme;

export default function Dashboard() {
  const navigate = useNavigate();
  const now = useClock();
  const d = useDashboardData();

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

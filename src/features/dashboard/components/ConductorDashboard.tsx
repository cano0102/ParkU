import { useNavigate } from "react-router-dom";
import { Bike, Calendar, Car, MapPin, ParkingCircle } from "lucide-react";
import { theme } from "@/styles/theme";
import { LoadingState } from "@/components/shared";
import { useConductorDashboardData } from "../hooks/useConductorDashboardData";
import { Card, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

const ESTADO_RESERVA_LABEL: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: COLORS.amber },
  activa: { label: "Activa", color: COLORS.primary },
  rechazada: { label: "Rechazada", color: COLORS.red },
  completada: { label: "Completada", color: COLORS.blue },
  cancelada: { label: "Cancelada", color: "#94A3B8" },
};

/**
 * Dashboard simplificado para el rol Comunidad SENA: solo lo que le sirve a
 * un conductor de un vistazo — dónde tiene su celda asignada ahora mismo (si
 * aplica), sus vehículos y sus reservas. El Dashboard completo (KPIs de todo
 * el sistema, ocupación global, movimientos de entrada/salida) es
 * información operativa que este rol no puede ni consultar en la API real.
 */
export default function ConductorDashboard() {
  const navigate = useNavigate();
  const d = useConductorDashboardData();

  if (d.isLoading) {
    return (
      <div className="dashboard-root">
        <LoadingState message="Cargando tu información..." />
      </div>
    );
  }

  return (
    <div className="dashboard-root flex flex-col gap-6">
      <div
        className="rounded-[20px] p-6 sm:p-7 text-white"
        style={{ background: "linear-gradient(135deg, #39A900 0%, #2D7D00 100%)" }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">Mi ParkU</h1>
        <p className="text-sm text-white/80 mt-1">Tu vehículo, tu celda y tus reservas en un solo lugar.</p>
      </div>

      <Card>
        <SectionTitle
          icon={MapPin}
          title="¿Dónde estoy estacionado?"
          subtitle={d.parqueaderoActual ? "Celda con reserva activa en este momento" : "No tienes una celda asignada ahora mismo"}
          color={COLORS.primary}
        />
        {d.parqueaderoActual && d.celdaActual ? (
          <div className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${COLORS.primary}15` }}>
              <ParkingCircle size={22} color={COLORS.primary} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[#1a1a2e]">{d.parqueaderoActual.nombre}</p>
              <p className="text-sm text-[#64748B]">Celda {d.celdaActual.numero} · {d.parqueaderoActual.zona || d.parqueaderoActual.ubicacion}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] p-5 text-center">
            <p className="text-sm text-[#64748B]">
              Cuando tengas una reserva aceptada, aquí verás el parqueadero y la celda asignados.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          icon={Car}
          title="Mis vehículos"
          subtitle={`${d.misVehiculos.length} vehículo(s) registrado(s)`}
          color={COLORS.blue}
          actionLabel="Ver detalle"
          onAction={() => navigate("/app/conductores")}
        />
        {d.misVehiculos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] p-5 text-center">
            <p className="text-sm text-[#64748B]">Todavía no tienes un vehículo registrado.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {d.misVehiculos.map((v) => {
              const Icon = v.tipo === "moto" ? Bike : Car;
              return (
                <div key={v.id} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.blue}15` }}>
                    <Icon size={18} color={COLORS.blue} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-bold text-[#1a1a2e]">{v.placa}</p>
                    <p className="text-xs text-[#64748B] truncate">{v.marca} {v.modelo ?? ""} · {v.color}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: v.estado === "activo" ? `${COLORS.primary}15` : "#F1F5F9",
                      color: v.estado === "activo" ? COLORS.primary : "#64748B",
                    }}
                  >
                    {v.estado}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          icon={Calendar}
          title="Mis reservas"
          subtitle={d.misReservas.length > 0 ? `${d.misReservas.length} reserva(s)` : "No tienes reservas registradas"}
          color={COLORS.amber}
          actionLabel="Ir a Reservas"
          onAction={() => navigate("/app/reservas")}
        />
        {d.misReservas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] p-5 text-center">
            <p className="text-sm text-[#64748B]">
              Reserva una celda desde el módulo de Parqueaderos y aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {d.misReservas.slice(0, 5).map((r) => {
              const estado = ESTADO_RESERVA_LABEL[r.estado] ?? ESTADO_RESERVA_LABEL.pendiente;
              const vehiculo = d.misVehiculos.find((v) => v.id === r.vehiculoId);
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] p-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a2e]">
                      {vehiculo ? `${vehiculo.placa} · ` : ""}{r.fechaReserva} · {r.horaInicio} – {r.horaFin}
                    </p>
                    {r.motivo && <p className="text-xs text-[#64748B] truncate mt-0.5">{r.motivo}</p>}
                    {r.estado === "rechazada" && r.motivoRechazo && (
                      <p className="text-xs text-red-600 truncate mt-0.5">Motivo del rechazo: {r.motivoRechazo}</p>
                    )}
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ backgroundColor: `${estado.color}15`, color: estado.color }}
                  >
                    {estado.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

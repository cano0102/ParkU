import { useNavigate } from "react-router-dom";
import {
  IconBike as Bike,
  IconCalendar as Calendar,
  IconCar as Car,
  IconMapPin as MapPin,
  IconCircleLetterP as ParkingCircle,
  IconPlus as Plus,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { LoadingState, Modal } from "@/components/shared";
import { useConductorDashboardData } from "../hooks/useConductorDashboardData";
import { useRegistrarVehiculoConductor } from "../hooks/useRegistrarVehiculoConductor";
import { Card, SectionTitle } from "./DashboardPrimitives";
import { RegistrarVehiculoModal } from "./RegistrarVehiculoModal";

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
  const registrar = useRegistrarVehiculoConductor(d.miConductor);

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
        {/* Sin "Ver detalle": /app/conductores es una ruta con permission="conductores" que
            este rol no tiene (navegar ahí terminaba en "Acceso denegado") — el detalle de
            cada vehículo ya se muestra completo aquí abajo, no hace falta otra pantalla. */}
        <SectionTitle
          icon={Car}
          title="Mis vehículos"
          subtitle={`${d.misVehiculos.length} vehículo(s) registrado(s)`}
          color={COLORS.blue}
          actionLabel={d.miConductor ? "Registrar vehículo" : undefined}
          onAction={d.miConductor ? registrar.abrir : undefined}
        />
        {d.misVehiculos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] p-5 text-center">
            <p className="text-sm text-[#64748B]">Todavía no tienes un vehículo registrado.</p>
            {d.miConductor ? (
              <button
                onClick={registrar.abrir}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Plus size={14} />
                Registrar mi vehículo
              </button>
            ) : (
              <p className="text-xs text-[#94A3B8] mt-2">
                Tu perfil de conductor aún no está completo. Contacta a un administrador para poder registrar un vehículo.
              </p>
            )}
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

      <Modal open={registrar.open} onClose={() => registrar.setOpen(false)} maxWidth={560} title="Registrar mi vehículo">
        <RegistrarVehiculoModal
          placa={registrar.form.placa}
          tipoVehiculo={registrar.form.tipoVehiculo}
          marca={registrar.form.marca}
          linea={registrar.form.linea}
          modelo={registrar.form.modelo}
          color={registrar.form.color}
          descripcionVehiculo={registrar.form.descripcionVehiculo}
          errors={registrar.errors}
          touched={registrar.touched}
          guardando={registrar.guardando}
          onPlacaChange={(v) => registrar.setForm((f) => ({ ...f, placa: v }))}
          onTipoVehiculoChange={(tipo) => registrar.setForm((f) => ({ ...f, tipoVehiculo: tipo }))}
          onMarcaChange={(v) => registrar.setForm((f) => ({ ...f, marca: v }))}
          onLineaChange={(v) => registrar.setForm((f) => ({ ...f, linea: v }))}
          onModeloChange={(v) => registrar.setForm((f) => ({ ...f, modelo: v }))}
          onColorChange={(v) => registrar.setForm((f) => ({ ...f, color: v }))}
          onDescripcionChange={(v) => registrar.setForm((f) => ({ ...f, descripcionVehiculo: v }))}
          onMarkTouched={registrar.markTouched}
          onSubmit={registrar.guardar}
          onCancel={() => registrar.setOpen(false)}
        />
      </Modal>
    </div>
  );
}

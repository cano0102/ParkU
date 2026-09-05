import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Modal, LoadingState } from "@/components/shared";
import { theme } from "@/styles/theme";
import { useAuth } from "@/context/AuthContext";
import { vehiculosDeConductor, vehiculosOperables } from "@/features/conductores";
import { ROLES } from "@/services/core/roles";
import { useReservasPage } from "./hooks/useReservasPage";
import { useSolicitarReserva } from "./hooks/useSolicitarReserva";
import { reservasStyles } from "./lib/styles";
import { ReservasHero } from "./components/ReservasHero";
import { ReservasToolbar } from "./components/ReservasToolbar";
import { ReservasTable } from "./components/ReservasTable";
import { ReservaViewModal } from "./components/ReservaViewModal";
import { ConfirmDeleteReservaModal } from "./components/ConfirmDeleteReservaModal";
import { MotivoReservaModal } from "./components/MotivoReservaModal";
import { SolicitudesPendientesPanel } from "./components/SolicitudesPendientesPanel";
import { SolicitarReservaModal } from "./components/SolicitarReservaModal";

const C = theme;

export function Reservas() {
  const p = useReservasPage();
  const { user } = useAuth();
  const esComunidadSena = user?.rol === ROLES.CONDUCTOR;
  // El backend ya rechaza DELETE /reservas/:id con 403 para cualquiera que no
  // sea Admin (rol 1) — el botón ni se muestra para los demás roles.
  const puedeEliminarReserva = user?.rol === ROLES.ADMIN;
  // Incluye los que copropieta: al vincular un vehículo existente, su `conductorId` sigue
  // siendo el del dueño principal y el vínculo queda en `copropietarios` — filtrar solo por
  // `conductorId` dejaba al copropietario sin poder reservar con un vehículo que sí es suyo.
  const misVehiculos = useMemo(
    () => vehiculosOperables(vehiculosDeConductor(p.vehiculos, p.miConductorId)),
    [p.vehiculos, p.miConductorId]
  );
  const solicitud = useSolicitarReserva(misVehiculos, p.celdas, p.parqueaderos, p.vehiculos, p.controlesSalida, p.reservasTodas);

  // Se llega aquí desde el plano de Parqueaderos con una celda ya elegida ("Solicitar esta
  // celda"): se abre el formulario con ella puesta, para no obligar a buscarla otra vez.
  const location = useLocation();
  const celdaPedida = (location.state as { solicitarCelda?: { celdaId: string; parqueaderoId: string } } | null)?.solicitarCelda;
  useEffect(() => {
    if (!celdaPedida) return;
    solicitud.abrirCon(celdaPedida);
    // Se limpia el estado de navegación para que volver atrás no reabra el formulario.
    window.history.replaceState({}, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celdaPedida?.celdaId, celdaPedida?.parqueaderoId]);

  return (
    <>
      <style>{reservasStyles}</style>

      <div className="reservas-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ReservasHero
          counts={p.counts}
          filterEstado={p.filterEstado}
          onFilterEstadoChange={p.setFilterEstado}
          onSolicitarReserva={esComunidadSena ? solicitud.abrir : undefined}
        />

        {p.puedeGestionarSolicitudes && (
          <SolicitudesPendientesPanel
            solicitudes={p.solicitudesPendientes}
            getVehiculo={p.getVehiculo}
            getCelda={p.getCelda}
            getParqueadero={p.getParqueadero}
            getConductorReserva={p.getConductorReserva}
            onAceptar={p.aceptarSolicitud}
            onRechazar={p.handleRechazar}
          />
        )}

        <ReservasToolbar
          search={p.search}
          onSearchChange={p.setSearch}
          filterEstado={p.filterEstado}
          onFilterEstadoChange={p.setFilterEstado}
          activeFiltersCount={p.activeFiltersCount}
          onClearFilters={p.clearFilters}
        />

        {p.isLoading ? (
          <LoadingState message="Cargando reservas..." />
        ) : (
          <>
            {p.activeFiltersCount > 0 && (
              <p style={{ fontSize: 11, color: C.textLight }}>
                Mostrando <strong>{p.filteredReservas.length}</strong> resultado{p.filteredReservas.length !== 1 ? "s" : ""}
              </p>
            )}

            <ReservasTable
              filteredReservas={p.filteredReservas}
              totalReservas={p.reservas.length}
              getVehiculo={p.getVehiculo}
              getCelda={p.getCelda}
              getConductorReserva={p.getConductorReserva}
              getParqueadero={p.getParqueadero}
              canDelete={puedeEliminarReserva}
              onView={(reserva) => { p.setViewingReserva(reserva); p.setViewOpen(true); }}
              onDelete={p.handleDelete}
              puedeCancelar={p.puedeCancelar}
              onCancel={p.handleCancelar}
            />
          </>
        )}
      </div>

      <Modal open={p.viewOpen} onClose={() => p.setViewOpen(false)} maxWidth={450}>
        {p.viewingReserva && (() => {
          const celda = p.getCelda(p.viewingReserva.celdaId);
          return (
            <ReservaViewModal
              reserva={p.viewingReserva}
              vehiculo={p.getVehiculo(p.viewingReserva.vehiculoId)}
              celda={celda}
              usuario={p.getConductorReserva(p.viewingReserva)}
              parqueadero={celda ? p.getParqueadero(celda.parqueaderoId) : undefined}
              onClose={() => p.setViewOpen(false)}
            />
          );
        })()}
      </Modal>

      <Modal open={!!p.confirmDelete} onClose={() => p.setConfirmDelete(null)} maxWidth={380}>
        {p.confirmDelete && (
          <ConfirmDeleteReservaModal
            placa={p.getVehiculo(p.confirmDelete.vehiculoId)?.placa || "—"}
            fecha={p.confirmDelete.fechaReserva}
            onCancel={() => p.setConfirmDelete(null)}
            onConfirm={p.confirmDeleteAction}
          />
        )}
      </Modal>

      {/* Cancelar es distinto de eliminar: la reserva se conserva con estado "cancelada"
          (es historial), y por eso quien la pidió también puede hacerlo. El motivo es
          obligatorio: es lo que verá esa persona en su historial. */}
      <Modal open={!!p.confirmCancelar} onClose={() => p.setConfirmCancelar(null)} maxWidth={420}>
        {p.confirmCancelar && (
          <MotivoReservaModal
            accion="cancelar"
            placa={p.getVehiculo(p.confirmCancelar.vehiculoId)?.placa || "—"}
            fecha={p.confirmCancelar.fechaReserva}
            onCancel={() => p.setConfirmCancelar(null)}
            onConfirm={p.confirmCancelarAction}
          />
        )}
      </Modal>

      <Modal open={!!p.confirmRechazar} onClose={() => p.setConfirmRechazar(null)} maxWidth={420}>
        {p.confirmRechazar && (
          <MotivoReservaModal
            accion="rechazar"
            placa={p.getVehiculo(p.confirmRechazar.vehiculoId)?.placa || "—"}
            fecha={p.confirmRechazar.fechaReserva}
            onCancel={() => p.setConfirmRechazar(null)}
            onConfirm={p.confirmRechazarAction}
          />
        )}
      </Modal>

      <Modal open={solicitud.open} onClose={() => solicitud.setOpen(false)} maxWidth={620}>
        <SolicitarReservaModal
          /* Ya filtrados por el tipo de la celda cuando hay una elegida (ver el hook). */
          misVehiculos={solicitud.vehiculosOfrecidos}
          parqueaderosActivos={solicitud.parqueaderosActivos}
          celdasDisponibles={solicitud.celdasDisponibles}
          vehiculoId={solicitud.form.vehiculoId}
          parqueaderoId={solicitud.form.parqueaderoId}
          celdaId={solicitud.form.celdaId}
          fechaReserva={solicitud.form.fechaReserva}
          horaInicio={solicitud.form.horaInicio}
          horaFin={solicitud.form.horaFin}
          motivo={solicitud.form.motivo}
          error={solicitud.error}
          onVehiculoChange={(v) => solicitud.setForm({ ...solicitud.form, vehiculoId: v })}
          onParqueaderoChange={(v) => solicitud.setForm({ ...solicitud.form, parqueaderoId: v, celdaId: "" })}
          onCeldaChange={(v) => solicitud.setForm({ ...solicitud.form, celdaId: v })}
          onFechaChange={(v) => solicitud.setForm({ ...solicitud.form, ...solicitud.ajustar({ ...solicitud.form, fechaReserva: v }) })}
          /* Las tres pasan por `ajustar`: mover el inicio empuja el fin para que siga
             habiendo una hora entre los dos, que era justo lo que no se respetaba. */
          onHoraInicioChange={(v) => solicitud.setForm({ ...solicitud.form, ...solicitud.ajustar({ ...solicitud.form, horaInicio: v }) })}
          onHoraFinChange={(v) => solicitud.setForm({ ...solicitud.form, ...solicitud.ajustar({ ...solicitud.form, horaFin: v }) })}
          onMotivoChange={(v) => solicitud.setForm({ ...solicitud.form, motivo: v })}
          onSubmit={solicitud.enviarSolicitud}
          onCancel={() => solicitud.setOpen(false)}
        />
      </Modal>
    </>
  );
}

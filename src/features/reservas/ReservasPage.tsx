import { Modal } from "@/components/shared";
import { theme } from "@/styles/theme";
import { useReservasPage } from "./hooks/useReservasPage";
import { reservasStyles } from "./lib/styles";
import { ReservasHero } from "./components/ReservasHero";
import { ReservasToolbar } from "./components/ReservasToolbar";
import { ReservasTable } from "./components/ReservasTable";
import { ReservaViewModal } from "./components/ReservaViewModal";
import { ConfirmDeleteReservaModal } from "./components/ConfirmDeleteReservaModal";

const C = theme;

export function Reservas() {
  const p = useReservasPage();

  return (
    <>
      <style>{reservasStyles}</style>

      <div className="reservas-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ReservasHero counts={p.counts} filterEstado={p.filterEstado} onFilterEstadoChange={p.setFilterEstado} />

        <ReservasToolbar
          search={p.search}
          onSearchChange={p.setSearch}
          filterEstado={p.filterEstado}
          onFilterEstadoChange={p.setFilterEstado}
          activeFiltersCount={p.activeFiltersCount}
          onClearFilters={p.clearFilters}
        />

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
          onView={(reserva) => { p.setViewingReserva(reserva); p.setViewOpen(true); }}
          onDelete={p.handleDelete}
        />
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
    </>
  );
}

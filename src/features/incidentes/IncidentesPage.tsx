import { Modal, LoadingState } from "@/components/shared";
import { theme } from "@/styles/theme";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useIncidentesPage } from "./hooks/useIncidentesPage";
import { incidentesStyles } from "./lib/styles";
import { IncidentesHero } from "./components/IncidentesHero";
import { IncidentesToolbar } from "./components/IncidentesToolbar";
import { IncidentesGrid } from "./components/IncidentesGrid";
import { IncidenteFormModal } from "./components/IncidenteFormModal";
import { IncidenteViewModal } from "./components/IncidenteViewModal";
import { ConfirmDeleteIncidenteModal } from "./components/ConfirmDeleteIncidenteModal";
import { ConductorIncidentes } from "./components/ConductorIncidentes";

const C = theme;

export function Incidentes() {
  const { user } = useAuth();
  const p = useIncidentesPage();

  // El rol Comunidad SENA (Conductor) no puede listar el /novedades completo en la API
  // real (403) ni gestionar los de otros — mismo patrón que ConductorDashboard.tsx: una
  // vista propia y más simple en vez del panel de gestión que usan Admin/Vigilante.
  if (user?.rol === ROLES.CONDUCTOR) {
    return <ConductorIncidentes />;
  }

  return (
    <>
      <style>{incidentesStyles}</style>

      <div className="incidentes-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <IncidentesHero pendientes={p.pendientes} enProceso={p.enProceso} resueltos={p.resueltos} total={p.incidentes.length} />

        <IncidentesToolbar
          search={p.search}
          onSearchChange={p.setSearch}
          filterEstado={p.filterEstado}
          onFilterEstadoChange={p.setFilterEstado}
          activeFiltersCount={p.activeFiltersCount}
          onClearFilters={p.clearFilters}
          onCreate={p.openCreate}
        />

        {p.isLoading ? (
          <LoadingState message="Cargando incidentes..." />
        ) : (
          <>
            {p.activeFiltersCount > 0 && (
              <p style={{ fontSize: 11, color: C.textLight }}>
                Mostrando <strong>{p.filteredIncidentes.length}</strong> incidente{p.filteredIncidentes.length !== 1 ? "s" : ""}
              </p>
            )}

            <IncidentesGrid
              incidentes={p.filteredIncidentes}
              celdaDe={p.celdaDe}
              vehiculoDe={p.vehiculoDe}
              nombreUsuarioAsignado={p.nombreUsuarioAsignado}
              nombreParqueadero={p.nombreParqueadero}
              onView={p.openView}
              onEdit={p.openEdit}
              onDelete={p.handleDelete}
              onToggleEstado={p.toggleEstado}
            />
          </>
        )}
      </div>

      <Modal open={p.dialogOpen} onClose={p.closeForm} maxWidth={640}>
        <IncidenteFormModal
          isEditing={p.isEditing}
          showJustificacionCierre={p.isEditing && p.selectedIncidente?.estado === "resuelto"}
          formData={p.formData}
          setFormData={p.setFormData}
          formTouched={p.formTouched}
          formErrors={p.formErrors}
          formInvalido={p.formInvalido}
          markTouched={p.markTouched}
          parqueaderos={p.parqueaderos}
          vehiculos={p.vehiculos}
          usuarios={p.usuarios}
          celdasDelParqueadero={p.celdasDelParqueadero}
          celdaSeleccionada={p.celdaDe(p.formData.celdaId)}
          ocupanteSeleccionado={p.ocupanteSeleccionado}
          ocupanteDeCelda={p.ocupanteDeCelda}
          onParqueaderoChange={p.handleParqueaderoChange}
          onCeldaChange={p.handleCeldaChange}
          onClose={p.closeForm}
          onSave={p.handleSave}
        />
      </Modal>

      <Modal open={p.viewOpen} onClose={() => p.setViewOpen(false)} maxWidth={480}>
        {p.selectedIncidente && (
          <IncidenteViewModal
            incidente={p.selectedIncidente}
            celda={p.celdaDe(p.selectedIncidente.celdaId)}
            vehiculoPlaca={p.vehiculoDe(p.selectedIncidente.vehiculoId)?.placa}
            conductorNombre={p.conductorDe(p.selectedIncidente.vehiculoId)?.nombre}
            conductorDocumento={p.conductorDe(p.selectedIncidente.vehiculoId)?.numeroDocumento}
            asignadoNombre={p.nombreUsuarioAsignado(p.selectedIncidente.usuarioAsignadoId)}
            nombreParqueadero={p.nombreParqueadero(p.selectedIncidente.parqueaderoId)}
            onClose={() => p.setViewOpen(false)}
            onEdit={() => p.openEdit(p.selectedIncidente!)}
          />
        )}
      </Modal>

      <Modal open={!!p.confirmDelete} onClose={() => p.setConfirmDelete(null)} maxWidth={380}>
        {p.confirmDelete && (
          <ConfirmDeleteIncidenteModal
            descripcion={p.confirmDelete.descripcion}
            onCancel={() => p.setConfirmDelete(null)}
            onConfirm={p.confirmDeleteAction}
          />
        )}
      </Modal>
    </>
  );
}

import { ShieldCheck, Users, UserCheck, Car as CarIcon, Bike as BikeIcon } from "lucide-react";
import { Modal } from "@/components/shared";
import { StatsPanel } from "@/components/data";
import { ConductorFormModal } from "./components/ConductorFormModal";
import { ConductorDetailModal } from "./components/ConductorDetailModal";
import { VehiculoView } from "./components/VehiculoView";
import { ConductoresToolbar } from "./components/ConductoresToolbar";
import { ConductoresResults } from "./components/ConductoresResults";
import { conductoresStyles } from "./lib/styles";
import { useConductoresPage } from "./hooks/useConductoresPage";

export function Conductores() {
  const { data, filters: f, form, viewVehiculoOpen, setViewVehiculoOpen, viewDetailOpen, setViewDetailOpen,
    viewingVehiculo, viewingConductor, openVehiculoView, openConductorDetail, handleToggleEstado } = useConductoresPage();

  return (
    <>
      <style>{conductoresStyles}</style>

      <div className="conductores-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <StatsPanel
          eyebrowIcon={<ShieldCheck size={11} />}
          eyebrowText="Gestión integral"
          title="Conductores y Vehículos"
          description="Administra conductores, aprendices, instructores y vehículos autorizados del sistema SENA."
          metrics={[
            { label: "Conductores", value: data.totalConductores, icon: <Users size={11} /> },
            { label: "Activos", value: data.totalActivos, icon: <UserCheck size={11} /> },
            { label: "Vehículos", value: data.totalVehiculos, icon: <CarIcon size={11} /> },
            { label: "Carros/Motos", value: `${data.totalCarros}/${data.totalMotos}`, icon: <BikeIcon size={11} /> },
          ]}
        />

        <ConductoresToolbar
          search={f.search}
          onSearchChange={f.setSearch}
          filterTipo={f.filterTipo}
          onFilterTipoChange={f.setFilterTipo}
          filterVehiculoTipo={f.filterVehiculoTipo}
          onFilterVehiculoTipoChange={f.setFilterVehiculoTipo}
          filterEstado={f.filterEstado}
          onFilterEstadoChange={f.setFilterEstado}
          viewMode={f.viewMode}
          onViewModeChange={f.handleViewModeChange}
          onCreate={form.openCreate}
          activeFiltersCount={f.activeFiltersCount}
          filteredCount={f.filteredConductores.length}
          onClearFilters={f.clearFilters}
        />

        <ConductoresResults
          conductores={f.paginatedConductores}
          viewMode={f.viewMode}
          currentPage={f.currentPage}
          totalPages={f.totalPages}
          itemsPerPage={f.itemsPerPage}
          totalItems={f.filteredConductores.length}
          getUsuario={data.getUsuario}
          getVehiculosConductor={data.getVehiculosConductor}
          onToggleEstado={handleToggleEstado}
          onViewVehiculo={openVehiculoView}
          onViewDetail={openConductorDetail}
          onEdit={form.openEdit}
          onPageChange={f.setCurrentPage}
          onItemsPerPageChange={(n) => {
            f.setItemsPerPage(n);
            f.setCurrentPage(1);
          }}
        />
      </div>

      {/* Modal de formulario de conductor con vehículo */}
      <Modal open={form.dialogOpen} onClose={() => form.setDialogOpen(false)} maxWidth={780}>
        <ConductorFormModal
          isEdit={form.isEdit}
          formData={form.formData}
          setFormData={form.setFormData}
          formErrors={form.formErrors}
          touched={form.touched}
          markTouched={form.markTouched}
          isValid={form.isValid}
          usuarioSearch={form.usuarioSearch}
          setUsuarioSearch={form.setUsuarioSearch}
          usuariosFiltrados={form.usuariosFiltrados}
          usuariosConConductorIds={form.usuariosConConductorIds}
          usuarioSeleccionado={form.usuarioSeleccionado}
          onSubmit={form.handleSave}
          onCancel={() => form.setDialogOpen(false)}
        />
      </Modal>

      {/* Modal de vista de vehículo */}
      <Modal open={viewVehiculoOpen} onClose={() => setViewVehiculoOpen(false)} maxWidth={450}>
        {viewingVehiculo && (
          <VehiculoView
            vehiculo={viewingVehiculo}
            onEdit={() => {
              const conductor = data.conductores.find((c) => c.id === viewingVehiculo.conductorId);
              if (conductor) {
                setViewVehiculoOpen(false);
                form.openEdit(conductor, viewingVehiculo);
              }
            }}
            onClose={() => setViewVehiculoOpen(false)}
          />
        )}
      </Modal>

      {/* Modal de detalle de conductor */}
      <Modal open={viewDetailOpen} onClose={() => setViewDetailOpen(false)} maxWidth={450}>
        {viewingConductor && (
          <ConductorDetailModal
            conductor={viewingConductor}
            usuario={data.getUsuario(viewingConductor.usuarioId)}
            vehiculos={data.getVehiculosConductor(viewingConductor.id)}
            onEdit={() => {
              setViewDetailOpen(false);
              form.openEdit(viewingConductor);
            }}
            onViewVehiculo={(v) => {
              setViewDetailOpen(false);
              openVehiculoView(v);
            }}
            onClose={() => setViewDetailOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}

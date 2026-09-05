import {
  IconShieldCheck as ShieldCheck,
  IconUsers as Users,
  IconUserCheck as UserCheck,
  IconCar as CarIcon,
  IconBike as BikeIcon,
} from "@tabler/icons-react";
import { Modal, LoadingState, ConfirmDialog } from "@/components/shared";
import { StatsPanel } from "@/components/data";
import { ConductorFormModal } from "./components/ConductorFormModal";
import { ConductorDetailModal } from "./components/ConductorDetailModal";
import { VehiculoView } from "./components/VehiculoView";
import { VehiculoFormModal } from "./components/VehiculoFormModal";
import { AgregarVehiculoModal } from "./components/AgregarVehiculoModal";
import { ConductoresToolbar } from "./components/ConductoresToolbar";
import { ConductoresResults } from "./components/ConductoresResults";
import { conductoresStyles } from "./lib/styles";
import { useConductoresPage } from "./hooks/useConductoresPage";

export function Conductores() {
  const { data, filters: f, form, agregarVehiculo, viewVehiculoOpen, setViewVehiculoOpen, viewDetailOpen, setViewDetailOpen,
    viewingVehiculo, viewingConductor, openVehiculoView, openConductorDetail, handleToggleEstado,
    vehiculoEditando, vehiculoForm, setVehiculoForm, vehiculoTouched, erroresVehiculo,
    abrirEditarVehiculo, guardarVehiculo, cerrarEditarVehiculo,
    vehiculoAEliminar, setVehiculoAEliminar, confirmEliminarVehiculo,
    conductorSinCuenta, setConductorSinCuenta, vincularCuentaYActivar,
    confirmQuitarCopropietario, setConfirmQuitarCopropietario, solicitarQuitarPropietario, confirmQuitarCopropietarioAction,
  } = useConductoresPage();

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

        {data.isLoading ? (
          <LoadingState message="Cargando conductores..." />
        ) : (
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
            onAgregarVehiculo={agregarVehiculo.abrir}
            fotoDe={data.fotoDeConductor}
            onPageChange={f.setCurrentPage}
            onItemsPerPageChange={(n) => {
              f.setItemsPerPage(n);
              f.setCurrentPage(1);
            }}
          />
        )}
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
            onEditarVehiculo={() => {
              setViewVehiculoOpen(false);
              abrirEditarVehiculo(viewingVehiculo);
            }}
            onEliminarVehiculo={() => setVehiculoAEliminar(viewingVehiculo)}
            onClose={() => setViewVehiculoOpen(false)}
            onQuitarPropietario={(conductorId, conductorNombre) =>
              solicitarQuitarPropietario(viewingVehiculo, conductorId, conductorNombre)
            }
          />
        )}
      </Modal>

      {/* Editar el vehículo: es la vía para corregir placa, marca, línea o modelo, ya que el
          formulario del conductor ya no incluye vehículo. */}
      <Modal open={!!vehiculoEditando} onClose={cerrarEditarVehiculo} maxWidth={560}>
        {vehiculoForm && (
          <VehiculoFormModal
            form={vehiculoForm}
            errors={erroresVehiculo}
            touched={vehiculoTouched}
            isValid={Object.keys(erroresVehiculo).length === 0}
            onChange={(patch) => setVehiculoForm({ ...vehiculoForm, ...patch })}
            onMarkTouched={() => { /* marcado al enviar; el aviso llega ahí */ }}
            onSubmit={guardarVehiculo}
            onCancel={cerrarEditarVehiculo}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!vehiculoAEliminar}
        onConfirm={confirmEliminarVehiculo}
        onCancel={() => setVehiculoAEliminar(null)}
        title="Eliminar vehículo"
        message={`¿Eliminar el vehículo ${vehiculoAEliminar?.placa ?? ""}? Se borra de la base de datos. Solo es posible si no tiene entradas, salidas, parqueos, novedades ni reservas registradas; sus dueños no se ven afectados.`}
        confirmLabel="Eliminar"
      />

      {/* Reactivar a alguien cuya cuenta fue eliminada: primero hay que darle otra. */}
      <ConfirmDialog
        open={!!conductorSinCuenta}
        onConfirm={vincularCuentaYActivar}
        onCancel={() => setConductorSinCuenta(null)}
        title="Este conductor se quedó sin cuenta"
        message={`La cuenta de acceso de ${conductorSinCuenta?.nombre ?? ""} fue eliminada, por eso quedó desactivado. Para volver a activarlo hay que vincularle otra cuenta. ¿Abrir su ficha para hacerlo ahora?`}
        confirmLabel="Vincular una cuenta"
      />

      {/* Modal de detalle de conductor */}
      <Modal open={viewDetailOpen} onClose={() => setViewDetailOpen(false)} maxWidth={450}>
        {viewingConductor && (
          <ConductorDetailModal
            conductor={viewingConductor}
            usuario={data.getUsuario(viewingConductor.usuarioId)}
            foto={data.fotoDeConductor(viewingConductor)}
            vehiculos={data.getVehiculosConductor(viewingConductor.id)}
            onEdit={() => {
              setViewDetailOpen(false);
              form.openEdit(viewingConductor);
            }}
            onViewVehiculo={(v) => {
              setViewDetailOpen(false);
              openVehiculoView(v);
            }}
            onAgregarVehiculo={() => {
              setViewDetailOpen(false);
              agregarVehiculo.abrir(viewingConductor);
            }}
            onClose={() => setViewDetailOpen(false)}
          />
        )}
      </Modal>

      {/* Modal de agregar un vehículo más a un conductor existente */}
      <Modal open={agregarVehiculo.open} onClose={() => agregarVehiculo.setOpen(false)} maxWidth={520}>
        {agregarVehiculo.conductorActivo && (
          <AgregarVehiculoModal
            conductor={agregarVehiculo.conductorActivo}
            modo={agregarVehiculo.modo}
            onModoChange={agregarVehiculo.setModo}
            placa={agregarVehiculo.form.placa}
            tipoVehiculo={agregarVehiculo.form.tipoVehiculo}
            marca={agregarVehiculo.form.marca}
            linea={agregarVehiculo.form.linea}
            modelo={agregarVehiculo.form.modelo}
            color={agregarVehiculo.form.color}
            descripcionVehiculo={agregarVehiculo.form.descripcionVehiculo}
            errors={agregarVehiculo.errors}
            touched={agregarVehiculo.touched}
            onPlacaChange={(v) => agregarVehiculo.setForm({ ...agregarVehiculo.form, placa: v })}
            onTipoVehiculoChange={(tipo) => agregarVehiculo.setForm({ ...agregarVehiculo.form, tipoVehiculo: tipo })}
            onMarcaChange={(v) => agregarVehiculo.setForm({ ...agregarVehiculo.form, marca: v })}
            onLineaChange={(v) => agregarVehiculo.setForm({ ...agregarVehiculo.form, linea: v })}
            onModeloChange={(v) => agregarVehiculo.setForm({ ...agregarVehiculo.form, modelo: v })}
            onColorChange={(v) => agregarVehiculo.setForm({ ...agregarVehiculo.form, color: v })}
            onDescripcionChange={(v) => agregarVehiculo.setForm({ ...agregarVehiculo.form, descripcionVehiculo: v })}
            onMarkTouched={agregarVehiculo.markTouched}
            busquedaExistente={agregarVehiculo.busquedaExistente}
            onBusquedaExistenteChange={agregarVehiculo.setBusquedaExistente}
            vehiculoExistenteId={agregarVehiculo.vehiculoExistenteId}
            onVehiculoExistenteIdChange={agregarVehiculo.setVehiculoExistenteId}
            vehiculosVinculables={agregarVehiculo.vehiculosVinculables}
            onSubmit={agregarVehiculo.guardar}
            onCancel={() => agregarVehiculo.setOpen(false)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmQuitarCopropietario}
        onConfirm={confirmQuitarCopropietarioAction}
        onCancel={() => setConfirmQuitarCopropietario(null)}
        title="Quitar copropietario"
        message={
          confirmQuitarCopropietario
            ? `${confirmQuitarCopropietario.conductorNombre} dejará de figurar como copropietario del vehículo ${confirmQuitarCopropietario.vehiculo.placa}. Esta acción no se puede revertir desde aquí.`
            : ""
        }
        confirmLabel="Quitar"
        tone="danger"
      />
    </>
  );
}

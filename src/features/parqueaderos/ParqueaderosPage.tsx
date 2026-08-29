import { theme } from "@/styles/theme";
import { LoadingState, Modal } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { ConductorFormModal, AgregarVehiculoModal } from "@/features/conductores";
import { parqueaderosStyles } from "./lib/styles";
import { useParqueaderosPage } from "./hooks/useParqueaderosPage";
import { ParqueaderosHero } from "./components/ParqueaderosHero";
import { ParqueaderosTopbar } from "./components/ParqueaderosTopbar";
import { ParkingMap } from "./components/map/ParkingMap";
import { ParqueaderosTable } from "./components/ParqueaderosTable";
import { SmartAssignModal } from "./components/modals/SmartAssignModal";
import { ParqueaderoFormModal } from "./components/modals/ParqueaderoFormModal";
import { IngresoModal } from "./components/modals/IngresoModal";
import { CeldaInfoModal } from "./components/modals/CeldaInfoModal";
import { ReservaModal } from "./components/modals/ReservaModal";
import { IncidenteModal } from "./components/modals/IncidenteModal";
import { ScannerModal } from "./components/modals/ScannerModal";

const C = theme;

export default function Parqueaderos() {
  const {
    navigate, hasPermission, data, modal, filters, pqFormState, ingreso, scanner, reserva, incidente, handleCellClick,
    conductorForm, agregarVehiculo, abrirCrearConductor, abrirCrearVehiculo,
  } = useParqueaderosPage();
  const { user } = useAuth();

  // Comunidad SENA (Conductor) solo puede reservar para su propio vehículo: el buscador del
  // modal de reserva no debe exponer la lista completa de vehículos/conductores del sistema.
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const miConductor = esConductor ? data.conductores.find((c) => c.usuarioId === user!.id) : undefined;
  const vehiculosParaReserva = esConductor ? data.vehiculos.filter((v) => v.conductorId === miConductor?.id) : data.vehiculos;
  const conductoresParaReserva = esConductor ? data.conductores.filter((c) => c.id === miConductor?.id) : data.conductores;

  return (
    <>
      <style>{parqueaderosStyles}</style>

      <div className="pq-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ParqueaderosHero stats={filters.stats} />

        <ParqueaderosTopbar
          search={filters.search}
          onSearchChange={filters.setSearch}
          filterTipo={filters.filterTipo}
          onFilterTipoChange={filters.setFilterTipo}
          activeTab={filters.activeTab}
          onActiveTabChange={filters.setActiveTab}
          activeFilters={filters.activeFilters}
          onClearFilters={filters.clearFilters}
          onOpenSmartAssign={() => modal.setOpenModal("smartAssign")}
          onOpenCreate={pqFormState.openCreate}
          canCrearParqueadero={hasPermission("celdas")}
          canAsignacionInteligente={hasPermission("asignaciones")}
        />

        {data.isLoading ? (
          <LoadingState message="Cargando parqueaderos..." />
        ) : (
          <>
            {filters.activeFilters > 0 && (
              <p style={{ fontSize: 11, color: C.textLight }}>
                Mostrando <strong>{filters.filteredPqsConCeldas.length}</strong> resultado{filters.filteredPqsConCeldas.length !== 1 ? "s" : ""}
              </p>
            )}

            {filters.activeTab === "table" && (
              <ParqueaderosTable
                parqueaderos={filters.filteredPqsConCeldas}
                celdas={filters.search.trim() ? filters.filteredCeldas : data.celdas}
                getOcupante={modal.getOcupante}
                onEdit={pqFormState.openEdit}
                onToggleEstado={pqFormState.handleToggleEstadoParqueadero}
                onCellClick={handleCellClick}
                cellMatchesSearch={filters.cellMatchesSearch}
                canManage={hasPermission("celdas")}
              />
            )}

            {filters.activeTab === "map" && (
              <ParkingMap
                parqueaderos={filters.filteredPqsConCeldas}
                celdas={data.celdas}
                getOcupante={modal.getOcupante}
                onCellClick={handleCellClick}
                cellMatchesSearch={filters.cellMatchesSearch}
              />
            )}
          </>
        )}
      </div>

      {/* ══ MODALES ══ */}

      <ParqueaderoFormModal
        open={modal.openModal === "create" || modal.openModal === "edit"}
        isEdit={modal.openModal === "edit"}
        pqForm={pqFormState.pqForm}
        setPqForm={pqFormState.setPqForm}
        formError={pqFormState.formError}
        onClose={() => modal.setOpenModal(null)}
        onSubmit={modal.openModal === "edit" ? pqFormState.handleEdit : pqFormState.handleCreate}
      />

      <IngresoModal
        open={modal.openModal === "ingreso"}
        celdaActiva={modal.celdaActiva}
        vehiculoForm={ingreso.vehiculoForm}
        setVehiculoForm={ingreso.setVehiculoForm}
        placaError={ingreso.placaError}
        onPlacaChange={() => ingreso.setPlacaError(null)}
        ingresoPlacaOk={ingreso.ingresoPlacaOk}
        ingresoValid={ingreso.ingresoValid}
        ingresoPlacaHint={ingreso.ingresoPlacaHint}
        placaYaEstacionada={ingreso.placaYaEstacionada}
        vehiculoEncontrado={ingreso.vehiculoEncontrado}
        conductorIdentificado={ingreso.conductorIdentificado}
        conductores={data.conductores}
        conductorQuery={ingreso.conductorQuery}
        onConductorQueryChange={ingreso.setConductorQuery}
        onSelectConductor={ingreso.seleccionarConductor}
        onCambiarConductor={ingreso.cambiarConductor}
        onCrearConductor={abrirCrearConductor}
        onCrearVehiculo={abrirCrearVehiculo}
        onSelectVehiculo={ingreso.seleccionarVehiculo}
        vehiculosConductor={ingreso.vehiculosConductor}
        parqueaderoInactivo={!ingreso.parqueaderoIngresoActivo}
        motivoBloqueoLive={ingreso.motivoBloqueoLive}
        onClose={() => modal.setOpenModal(null)}
        onOpenScanner={() => scanner.abrirScannerDesde("ingreso")}
        onSubmit={ingreso.registrarVehiculo}
      />

      {/* Sub-pasos del asistente de "Estacionar Vehículo": crear conductor o vehículo sin
          perder la celda ni el resto del formulario (ver useParqueaderosPage.ts). */}
      <Modal open={modal.openModal === "crearConductor"} onClose={() => modal.setOpenModal("ingreso")} maxWidth={780}>
        <ConductorFormModal
          isEdit={false}
          formData={conductorForm.formData}
          setFormData={conductorForm.setFormData}
          formErrors={conductorForm.formErrors}
          touched={conductorForm.touched}
          markTouched={conductorForm.markTouched}
          isValid={conductorForm.isValid}
          usuarioSearch={conductorForm.usuarioSearch}
          setUsuarioSearch={conductorForm.setUsuarioSearch}
          usuariosFiltrados={conductorForm.usuariosFiltrados}
          usuariosConConductorIds={conductorForm.usuariosConConductorIds}
          usuarioSeleccionado={conductorForm.usuarioSeleccionado}
          onSubmit={conductorForm.handleSave}
          onCancel={() => modal.setOpenModal("ingreso")}
        />
      </Modal>

      <Modal open={modal.openModal === "crearVehiculo"} onClose={() => modal.setOpenModal("ingreso")} maxWidth={520}>
        {agregarVehiculo.conductorActivo && (
          <AgregarVehiculoModal
            conductor={agregarVehiculo.conductorActivo}
            modo={agregarVehiculo.modo}
            onModoChange={agregarVehiculo.setModo}
            placa={agregarVehiculo.form.placa}
            tipoVehiculo={agregarVehiculo.form.tipoVehiculo}
            marca={agregarVehiculo.form.marca}
            color={agregarVehiculo.form.color}
            descripcionVehiculo={agregarVehiculo.form.descripcionVehiculo}
            errors={agregarVehiculo.errors}
            touched={agregarVehiculo.touched}
            onPlacaChange={(v) => agregarVehiculo.setForm((f) => ({ ...f, placa: v }))}
            onTipoVehiculoChange={(tipo) => agregarVehiculo.setForm((f) => ({ ...f, tipoVehiculo: tipo }))}
            onMarcaChange={(v) => agregarVehiculo.setForm((f) => ({ ...f, marca: v }))}
            onColorChange={(v) => agregarVehiculo.setForm((f) => ({ ...f, color: v }))}
            onDescripcionChange={(v) => agregarVehiculo.setForm((f) => ({ ...f, descripcionVehiculo: v }))}
            onMarkTouched={agregarVehiculo.markTouched}
            busquedaExistente={agregarVehiculo.busquedaExistente}
            onBusquedaExistenteChange={agregarVehiculo.setBusquedaExistente}
            vehiculoExistenteId={agregarVehiculo.vehiculoExistenteId}
            onVehiculoExistenteIdChange={agregarVehiculo.setVehiculoExistenteId}
            vehiculosVinculables={agregarVehiculo.vehiculosVinculables}
            onSubmit={agregarVehiculo.guardar}
            onCancel={() => modal.setOpenModal("ingreso")}
          />
        )}
      </Modal>

      <CeldaInfoModal
        open={modal.openModal === "info"}
        celdaActiva={modal.celdaActiva}
        ocupanteActivo={modal.ocupanteActivo}
        reservaActiva={modal.reservaActiva}
        vehiculoReservado={modal.vehiculoReservado}
        parqueaderoActivo={modal.parqueaderoActivo}
        onClose={() => modal.setOpenModal(null)}
        onCancelarReserva={reserva.handleCancelarReserva}
        onEstacionarOficial={ingreso.abrirIngresoOficial}
        onNavigateConductor={(nombre) => navigate(`/app/conductores?q=${encodeURIComponent(nombre)}`)}
        onLiberar={reserva.handleRequestLiberar}
        onReportarIncidente={() => modal.setOpenModal("incidente")}
        onEstacionarVehiculo={ingreso.abrirIngresoVisitante}
        onReservarCelda={() => { if (modal.celdaActiva) reserva.openReservaFromCelda(modal.celdaActiva); }}
        canManageCeldas={hasPermission("celdas")}
        canRegistrarIngreso={hasPermission("entradaSalida")}
        canReportarIncidentes={hasPermission("incidentes")}
        onSetEstadoManual={modal.handleSetEstadoCeldaManual}
      />

      <ReservaModal
        open={modal.openModal === "reserva"}
        celdaActiva={modal.celdaActiva}
        parqueaderoActivo={modal.parqueaderoActivo}
        vehiculos={vehiculosParaReserva}
        conductores={conductoresParaReserva}
        reservaForm={reserva.reservaForm}
        setReservaForm={reserva.setReservaForm}
        reservaError={reserva.reservaError}
        onClose={() => modal.setOpenModal(null)}
        onSubmit={reserva.handleCrearReserva}
      />

      <IncidenteModal
        open={modal.openModal === "incidente"}
        celdaActiva={modal.celdaActiva}
        ocupanteActivo={modal.ocupanteActivo}
        parqueaderoActivo={modal.parqueaderoActivo}
        incidenteForm={incidente.incidenteForm}
        setIncidenteForm={incidente.setIncidenteForm}
        incidenteError={incidente.incidenteError}
        onClose={incidente.closeIncidenteModal}
        onSubmit={incidente.registrarIncidente}
      />

      <ScannerModal
        open={modal.openModal === "scanner"}
        videoRef={scanner.videoRef}
        guiaRef={scanner.guiaRef}
        camaraLista={scanner.camaraLista}
        onCamaraLista={() => scanner.setCamaraLista(true)}
        ocrLoading={scanner.ocrLoading}
        ocrError={scanner.ocrError}
        ocrFlash={scanner.ocrFlash}
        onClose={scanner.cerrarScanner}
        onCapture={scanner.handleCaptureOcr}
        onFileOCR={scanner.handleFileOCR}
        onSimOCR={scanner.handleSimOCR}
      />

      <SmartAssignModal
        open={modal.openModal === "smartAssign"}
        parqueaderos={data.parqueaderos}
        celdas={data.celdas}
        onClose={scanner.closeSmartAssign}
        onAssign={scanner.handleSmartAssign}
        openScanner={() => scanner.abrirScannerDesde("smartAssign")}
        scannedPlate={scanner.scannedPlate}
      />
    </>
  );
}

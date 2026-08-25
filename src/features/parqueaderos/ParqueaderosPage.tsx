import { theme } from "@/styles/theme";
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
  const { navigate, hasPermission, data, modal, filters, pqFormState, ingreso, scanner, reserva, incidente, handleCellClick } = useParqueaderosPage();

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
        />

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
        ingresoConductorOk={ingreso.ingresoConductorOk}
        ingresoValid={ingreso.ingresoValid}
        ingresoPlacaHint={ingreso.ingresoPlacaHint}
        vehiculoEncontrado={ingreso.vehiculoEncontrado}
        conductorEncontrado={ingreso.conductorEncontrado}
        conductorIdentificado={ingreso.conductorIdentificado}
        conductoresSugeridos={ingreso.conductoresSugeridos}
        vehiculosConductor={ingreso.vehiculosConductor}
        parqueaderoInactivo={!ingreso.parqueaderoIngresoActivo}
        onClose={() => modal.setOpenModal(null)}
        onOpenScanner={() => scanner.abrirScannerDesde("ingreso")}
        onSubmit={ingreso.registrarVehiculo}
      />

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
        onSetEstadoManual={modal.handleSetEstadoCeldaManual}
      />

      <ReservaModal
        open={modal.openModal === "reserva"}
        celdaActiva={modal.celdaActiva}
        parqueaderoActivo={modal.parqueaderoActivo}
        vehiculos={data.vehiculos}
        conductores={data.conductores}
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

import { LoadingState, Modal, ConfirmDialog } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useControlSalidaPage } from "./hooks/useControlSalidaPage";
import { controlSalidaStyles } from "./lib/styles";
import { ControlSalidaHero } from "./components/ControlSalidaHero";
import { ControlSalidaToolbar } from "./components/ControlSalidaToolbar";
import { ControlSalidaTable } from "./components/ControlSalidaTable";
import { ConductorControlCard } from "./components/ConductorControlCard";
import { ControlSalidaPagination } from "./components/ControlSalidaPagination";
import { ControlSalidaDetalleModal } from "./components/ControlSalidaDetalleModal";
import { IncidenteModal } from "@/features/parqueaderos";

export function ControlSalidaPage() {
  const p = useControlSalidaPage();
  const { user } = useAuth();
  // Comunidad SENA ve solo sus movimientos, como tarjetas (mismo patrón que "Mis incidentes")
  // en vez de la tabla de gestión de portería, que no tiene nada que él pueda accionar.
  const esConductor = user?.rol === ROLES.CONDUCTOR;

  return (
    <>
      <style>{controlSalidaStyles}</style>

      <div
        className="control-root"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <ControlSalidaHero
          enParqueadero={p.vehiculosEnParqueadero.length}
          salidas={p.vehiculosSalidos.length}
          celdasLibres={p.celdasDisponibles.length}
          total={p.controlesSalida.length}
        />

        {/* Comunidad SENA no busca ni filtra: solo ve los movimientos de sus vehículos. */}
        {!esConductor && (
          <ControlSalidaToolbar
            search={p.search}
            onSearchChange={p.setSearch}
            filterEstado={p.filterEstado}
            onFilterEstadoChange={p.setFilterEstado}
            filterParqueadero={p.filterParqueadero}
            onFilterParqueaderoChange={p.setFilterParqueadero}
            parqueaderos={p.parqueaderos}
            filteredCount={p.filteredControles.length}
            hasActiveFilters={p.hasActiveFilters}
            onClearFilters={p.clearFilters}
          />
        )}

        {p.isLoading ? (
          <LoadingState message="Cargando registros..." />
        ) : esConductor ? (
          p.filteredControles.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "3rem 1rem",
                borderRadius: 16,
                border: "2px dashed #E2E8F0",
                background: "#fff",
                color: "#64748B",
                textAlign: "center",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: 13 }}>
                {p.hasActiveFilters
                  ? "Ningún movimiento coincide con los filtros"
                  : "Aún no tienes entradas ni salidas registradas"}
              </p>
              <p style={{ fontSize: 11, marginTop: 4 }}>
                {p.hasActiveFilters
                  ? "Prueba con otros filtros."
                  : "Cuando el vigilante registre el ingreso de tu vehículo, aparecerá aquí."}
              </p>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                background: "#F8FAF8",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: 12,
                  padding: 12,
                }}
              >
                {p.paginatedControles.map((control) => {
                  const celda = p.getCelda(control.celdaId);
                  return (
                    <ConductorControlCard
                      key={control.id}
                      control={control}
                      vehiculo={p.getVehiculo(control.vehiculoId)}
                      celda={celda}
                      parqueadero={
                        celda ? p.getParqueadero(celda.parqueaderoId) : null
                      }
                      onVerDetalle={() => p.verDetalle(control)}
                    />
                  );
                })}
              </div>
              <ControlSalidaPagination
                currentPage={p.currentPage}
                totalPages={p.totalPages}
                totalItems={p.filteredControles.length}
                onPageChange={p.setPage}
              />
            </div>
          )
        ) : (
          <ControlSalidaTable
            paginatedControles={p.paginatedControles}
            filteredCount={p.filteredControles.length}
            currentPage={p.currentPage}
            totalPages={p.totalPages}
            onPageChange={p.setPage}
            getVehiculo={p.getVehiculo}
            getCelda={p.getCelda}
            getUsuarioConductor={p.getUsuarioConductor}
            getParqueadero={p.getParqueadero}
            onVerDetalle={p.verDetalle}
            onReportar={p.abrirReporteDe}
            onLiberar={p.pedirSalida}
          />
        )}
      </div>

      {/* Confirmación antes de dar salida: liberar la celda no se puede deshacer. */}
      <ConfirmDialog
        open={!!p.salidaAConfirmar}
        onConfirm={p.confirmarSalida}
        onCancel={p.cancelarSalida}
        title="Confirmar salida"
        message={(() => {
          const control = p.salidaAConfirmar;
          if (!control) return "";
          const placa = p.getVehiculo(control.vehiculoId)?.placa;
          const celda = p.getCelda(control.celdaId)?.numero;
          const conductor = p.getUsuarioConductor(control.vehiculoId)?.nombre;
          return `¿Registrar la salida del vehículo ${placa ?? "seleccionado"}${conductor ? ` de ${conductor}` : ""}${celda ? ` y liberar la celda ${celda}` : ""}? Esta acción no se puede deshacer.`;
        })()}
        confirmLabel="Registrar salida"
        tone="success"
      />

      {/* La ficha completa del movimiento: lo que no cabe en la fila. */}
      <Modal open={!!p.detalle} onClose={p.cerrarDetalle} maxWidth={460}>
        {p.detalle && (
          <ControlSalidaDetalleModal
            control={p.detalle}
            vehiculo={p.getVehiculo(p.detalle.vehiculoId)}
            celda={p.getCelda(p.detalle.celdaId)}
            conductor={p.getUsuarioConductor(p.detalle.vehiculoId)}
            parqueadero={p.getParqueadero(p.detalle.parqueaderoId)}
            onClose={p.cerrarDetalle}
          />
        )}
      </Modal>

      {/* Reportar sobre un movimiento: el formulario ya llega con su celda, su parqueadero y
          su vehículo, que es lo que costaba volver a buscar. */}
      <IncidenteModal
        open={p.reporteAbierto}
        celdaActiva={null}
        ocupanteActivo={null}
        parqueaderoActivo={null}
        incidenteForm={p.reporte.incidenteForm}
        setIncidenteForm={p.reporte.setIncidenteForm}
        incidenteError={p.reporte.incidenteError}
        usuariosAsignables={[]}
        usuariosReportantes={p.usuariosReportantes}
        puedeRegistrarNovedades={p.reporte.puedeRegistrarNovedades}
        vehiculosDelReportante={p.reporte.vehiculosDelReportante}
        vehiculoFijado={!!p.reporte.objetivo?.vehiculoId}
        evidencias={p.reporte.evidencias}
        onEvidenciasChange={p.reporte.setEvidencias}
        etiquetaContexto={p.reporte.objetivo?.etiqueta}
        onClose={p.reporte.closeIncidenteModal}
        onSubmit={p.reporte.registrarIncidente}
      />
    </>
  );
}

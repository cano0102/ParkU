import { theme } from "@/styles/theme";
import { LoadingState, Modal, ConfirmDialog } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import {
  ConductorFormModal,
  AgregarVehiculoModal,
  vehiculosDeConductor,
  vehiculosOperables,
} from "@/features/conductores";
import { MotivoReservaModal, useSolicitarReserva, SolicitarReservaModal } from "@/features/reservas";
import { DataPagination } from "@/components/data";
import { parqueaderosStyles } from "./lib/styles";
import { useParqueaderosPage } from "./hooks/useParqueaderosPage";
import { ParqueaderosHero } from "./components/ParqueaderosHero";
import { ParqueaderosTopbar } from "./components/ParqueaderosTopbar";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { ParkingMap } from "./components/map/ParkingMap";
import { ParqueaderosTable } from "./components/ParqueaderosTable";
import { ParqueaderoFormModal } from "./components/modals/ParqueaderoFormModal";
import { IngresoModal } from "./components/modals/IngresoModal";
import { CeldaInfoModal } from "./components/modals/CeldaInfoModal";
import { ReservaModal } from "./components/modals/ReservaModal";
import { IncidenteModal } from "./components/modals/IncidenteModal";
import { ScannerModal } from "./components/modals/ScannerModal";

const C = theme;

export default function Parqueaderos() {
  const {
    navigate,
    hasPermission,
    data,
    celdasVisibles,
    modal,
    filters,
    pqFormState,
    ingreso,
    scanner,
    reserva,
    incidente,
    handleCellClick,
    conductorForm,
    agregarVehiculo,
    abrirCrearConductor,
    abrirCrearVehiculo,
  } = useParqueaderosPage();
  const { user } = useAuth();

  // Comunidad SENA (Conductor) ve el mapa solo como información: no abre ni elige celdas (la
  // celda se la asigna el vigilante al registrar el ingreso) — únicamente ve dónde quedaron
  // sus vehículos. Además, si llegara a reservar, solo para su propio vehículo: el buscador
  // del modal de reserva no debe exponer la lista completa de vehículos/conductores.
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  const miConductor = esConductor
    ? data.conductores.find((c) => c.usuarioId === user!.id)
    : undefined;
  // Solo vehículos que pueden operar: los de una cuenta desactivada quedan fuera (ver
  // vehiculosOperables), salvo los que comparte con otro propietario que sigue activo.
  const vehiculosDelRol = vehiculosOperables(
    esConductor
      ? vehiculosDeConductor(data.vehiculos, miConductor?.id)
      : data.vehiculos,
  );
  // La celda ya está elegida (la reserva se abre desde el plano), así que el selector solo
  // debe ofrecer vehículos que quepan en SU tipo: una celda de moto no admite un carro y
  // viceversa. La validación definitiva vuelve a hacerse al crear la reserva (useReservaCelda)
  // y en el backend.
  const vehiculosParaReserva = modal.celdaActiva
    ? vehiculosDelRol.filter((v) => v.tipo === modal.celdaActiva!.tipo)
    : vehiculosDelRol;
  const conductoresParaReserva = (
    esConductor
      ? data.conductores.filter((c) => c.id === miConductor?.id)
      : data.conductores
  ).filter((c) => c.estado === "activo");

  // Comunidad SENA (Conductor) no reserva de inmediato desde el plano como Admin/Vigilante
  // (ver comentario de `canManageCeldas` en CeldaInfoModal.tsx): pide una celda con este
  // formulario aparte, que la deja en estado "pendiente" hasta que alguien la acepte.
  const solicitud = useSolicitarReserva(
    vehiculosDelRol,
    data.celdas,
    data.parqueaderos,
    data.vehiculos,
    data.controlesSalida,
    esConductor ? data.misReservas : data.reservas,
    miConductor?.id,
  );

  return (
    <>
      <style>{parqueaderosStyles}</style>

      <div
        className="pq-root"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <ParqueaderosHero stats={filters.stats} soloLectura={esConductor} />

        {/* El Conductor no busca ni filtra: no ve ocupantes (no lee el registro de ingresos)
            y sus celdas ya salen resaltadas; sin buscador ni filtro la barra quedaba vacía. */}
        {!esConductor && (
          <ParqueaderosTopbar
            search={filters.search}
            onSearchChange={filters.setSearch}
            filterTipo={filters.filterTipo}
            onFilterTipoChange={filters.setFilterTipo}
            activeTab={filters.activeTab}
            onActiveTabChange={filters.setActiveTab}
            activeFilters={filters.activeFilters}
            onClearFilters={filters.clearFilters}
            onOpenCreate={pqFormState.openCreate}
            canCrearParqueadero={hasPermission("celdas")}
          />
        )}

        {data.isLoading ? (
          <LoadingState message="Cargando parqueaderos..." />
        ) : (
          <>
            {filters.activeFilters > 0 && (
              <p style={{ fontSize: 11, color: C.textLight }}>
                Mostrando <strong>{filters.filteredPqsConCeldas.length}</strong>{" "}
                resultado{filters.filteredPqsConCeldas.length !== 1 ? "s" : ""}
              </p>
            )}

            {esConductor && (
              <p
                style={{
                  margin: 0,
                  padding: "10px 14px",
                  borderRadius: 11,
                  background: C.primaryPale,
                  border: `1px solid ${C.primaryLight}`,
                  fontSize: 12,
                  color: C.primaryDark,
                  fontWeight: 600,
                }}
              >
                ℹ️ Esta vista es solo informativa: la celda te la asigna el vigilante al
                registrar tu ingreso. Cuando la tengas, tu vehículo aparece resaltado en verde.
              </p>
            )}

            {filters.activeTab === "table" && (
              <ParqueaderosTable
                parqueaderos={filters.paginatedPqsConCeldas}
                celdas={
                  filters.search.trim() ? filters.filteredCeldas : celdasVisibles
                }
                getOcupante={modal.getOcupante}
                onEdit={pqFormState.openEdit}
                onDelete={pqFormState.handleDeleteRequest}
                onToggleEstado={pqFormState.handleToggleEstadoParqueadero}
                onReportar={
                  !esConductor && hasPermission("incidentes")
                    ? (pq: Parqueadero) =>
                        incidente.abrirReporte({
                          parqueaderoId: pq.id,
                          etiqueta: pq.nombre,
                        })
                    : undefined
                }
                onCellClick={handleCellClick}
                cellMatchesSearch={filters.cellMatchesSearch}
                celdaTieneIncidenteAbierto={filters.celdaTieneIncidenteAbierto}
                canManage={hasPermission("celdas")}
                misVehiculosPorCelda={data.misVehiculosPorCelda}
                vistaSimplificada={esConductor}
              />
            )}

            {filters.activeTab === "table" && filters.filteredPqsConCeldas.length > 0 && (
              <DataPagination
                currentPage={filters.currentPage}
                totalPages={filters.totalPages}
                itemsPerPage={filters.itemsPerPage}
                totalItems={filters.filteredPqsConCeldas.length}
                itemsPerPageOptions={[10, 25, 50, 100]}
                entityLabel="Parqueaderos"
                onPageChange={filters.setCurrentPage}
                onItemsPerPageChange={filters.setItemsPerPage}
              />
            )}

            {filters.activeTab === "map" && (
              <ParkingMap
                parqueaderos={filters.filteredPqsConCeldas}
                celdas={celdasVisibles}
                getOcupante={modal.getOcupante}
                onCellClick={handleCellClick}
                cellMatchesSearch={filters.cellMatchesSearch}
                celdaTieneIncidenteAbierto={filters.celdaTieneIncidenteAbierto}
                marcasDeReserva={modal.marcasDeReserva}
                onToggleEstado={pqFormState.handleToggleEstadoParqueadero}
                canManage={hasPermission("celdas")}
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
        onSubmit={
          modal.openModal === "edit"
            ? pqFormState.handleEdit
            : pqFormState.handleCreate
        }
      />

      <ConfirmDialog
        open={!!pqFormState.pqAEliminar}
        onConfirm={pqFormState.confirmDeleteParqueadero}
        onCancel={() => pqFormState.setPqAEliminar(null)}
        title="Eliminar parqueadero"
        message={`El parqueadero "${pqFormState.pqAEliminar?.nombre ?? ""}" se eliminará permanentemente. Esta acción no se puede revertir.`}
        confirmLabel="Eliminar"
      />

      <ConfirmDialog
        open={!!pqFormState.pqADesactivar}
        onConfirm={pqFormState.confirmDesactivarParqueadero}
        onCancel={() => pqFormState.setPqADesactivar(null)}
        title="Desactivar parqueadero"
        message={`¿Está seguro de desactivar "${pqFormState.pqADesactivar?.nombre ?? ""}"? Dejará de aceptar nuevos ingresos y reservas. Los vehículos que ya están dentro siguen registrados: se les puede registrar la salida normalmente.`}
        confirmLabel="Desactivar"
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
        sugerenciasPlaca={ingreso.sugerenciasPlaca}
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
      <Modal
        open={modal.openModal === "crearConductor"}
        onClose={() => modal.setOpenModal("ingreso")}
        maxWidth={780}
      >
        <ConductorFormModal
          /* Alta rápida desde portería: sin centro de formación ni regional — esos campos
             siguen disponibles en el módulo Conductores, que es donde se completan. */
          esVisitante={conductorForm.esVisitante}
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

      <Modal
        open={modal.openModal === "crearVehiculo"}
        onClose={() => modal.setOpenModal("ingreso")}
        maxWidth={520}
      >
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
            onPlacaChange={(v) =>
              agregarVehiculo.setForm((f) => ({ ...f, placa: v }))
            }
            onTipoVehiculoChange={(tipo) =>
              agregarVehiculo.setForm((f) => ({ ...f, tipoVehiculo: tipo }))
            }
            onMarcaChange={(v) =>
              agregarVehiculo.setForm((f) => ({ ...f, marca: v }))
            }
            onLineaChange={(v) =>
              agregarVehiculo.setForm((f) => ({ ...f, linea: v }))
            }
            onModeloChange={(v) =>
              agregarVehiculo.setForm((f) => ({ ...f, modelo: v }))
            }
            onColorChange={(v) =>
              agregarVehiculo.setForm((f) => ({ ...f, color: v }))
            }
            onDescripcionChange={(v) =>
              agregarVehiculo.setForm((f) => ({ ...f, descripcionVehiculo: v }))
            }
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
        agenda={modal.agendaActiva}
        agendaDetallada={(modal.agendaActiva?.reservas ?? []).map((r) => ({
          id: r.id,
          placa: data.vehiculos.find((v) => v.id === r.vehiculoId)?.placa ?? "",
          conductor:
            data.conductores.find((c) => c.id === r.conductorId)?.nombre ?? "",
        }))}
        parqueaderoActivo={modal.parqueaderoActivo}
        onClose={() => modal.setOpenModal(null)}
        onCancelarReserva={reserva.handleCancelarReserva}
        onEstacionarOficial={ingreso.abrirIngresoOficial}
        onNavigateConductor={(nombre) =>
          navigate(`/app/conductores?q=${encodeURIComponent(nombre)}`)
        }
        onLiberar={reserva.handleRequestLiberar}
        onReportarIncidente={() => modal.setOpenModal("incidente")}
        onEstacionarVehiculo={ingreso.abrirIngresoVisitante}
        onEstacionarReservado={() => {
          const vehiculo = modal.vehiculoReservado;
          if (!vehiculo) return;
          const conductor = data.conductores.find(
            (c) =>
              c.id ===
              (modal.reservaDestacada?.conductorId || vehiculo.conductorId),
          );
          ingreso.abrirIngresoReservado(vehiculo, conductor);
        }}
        onReservarCelda={() => {
          if (!modal.celdaActiva) return;
          if (esConductor) {
            solicitud.abrirCon({
              celdaId: modal.celdaActiva.id,
              parqueaderoId: modal.celdaActiva.parqueaderoId,
            });
          } else {
            reserva.openReservaFromCelda(modal.celdaActiva);
          }
        }}
        mostrarReservar={esConductor}
        conductorReserva={
          modal.reservaDestacada
            ? (data.conductores.find(
                (c) => c.id === modal.reservaDestacada!.conductorId,
              )?.nombre ??
              data.conductores.find(
                (c) => c.id === modal.vehiculoReservado?.conductorId,
              )?.nombre)
            : undefined
        }
        canManageCeldas={hasPermission("celdas")}
        canRegistrarIngreso={!esConductor && hasPermission("entradaSalida")}
        canReportarIncidentes={!esConductor && hasPermission("incidentes")}
        incidenteAbiertoExiste={incidente.incidenteAbiertoExisteParaCeldaActiva}
        onSetEstadoManual={modal.handleSetEstadoCeldaManual}
      />

      {/* Cancelar la reserva de una celda pide motivo, igual que en el módulo de Reservas:
          es el mismo formulario, para que se pida lo mismo se entre por donde se entre. */}
      <Modal
        open={modal.openModal === "cancelarReserva"}
        onClose={() => modal.setOpenModal(null)}
        maxWidth={420}
      >
        {reserva.reservaACancelar && (
          <MotivoReservaModal
            accion="cancelar"
            placa={
              data.vehiculos.find(
                (v) => v.id === reserva.reservaACancelar!.vehiculoId,
              )?.placa || "—"
            }
            fecha={`${reserva.reservaACancelar.fechaReserva} · ${reserva.reservaACancelar.horaInicio}–${reserva.reservaACancelar.horaFin}`}
            onCancel={() => modal.setOpenModal(null)}
            onConfirm={reserva.confirmarCancelarReserva}
          />
        )}
      </Modal>

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
        usuariosAsignables={data.usuariosAsignables}
        usuariosReportantes={data.usuariosReportantes}
        puedeRegistrarNovedades={incidente.puedeRegistrarNovedades}
        vehiculosDelReportante={incidente.vehiculosDelReportante}
        vehiculoFijado={!!incidente.objetivo?.vehiculoId}
        evidencias={incidente.evidencias}
        onEvidenciasChange={incidente.setEvidencias}
        etiquetaContexto={incidente.objetivo?.etiqueta}
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

      {/* Solicitud de reserva de Comunidad SENA (Conductor): mismo formulario que "Solicitar
          reserva" en Reservas, pero se abre con la celda ya elegida desde el plano. */}
      <Modal
        open={solicitud.open}
        onClose={() => solicitud.setOpen(false)}
        maxWidth={620}
      >
        <SolicitarReservaModal
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
          enviando={solicitud.enviando}
          onVehiculoChange={(v) => solicitud.setForm({ ...solicitud.form, vehiculoId: v })}
          onParqueaderoChange={(v) =>
            solicitud.setForm({ ...solicitud.form, parqueaderoId: v, celdaId: "" })
          }
          onCeldaChange={(v) => solicitud.setForm({ ...solicitud.form, celdaId: v })}
          onFechaChange={(v) =>
            solicitud.setForm({
              ...solicitud.form,
              ...solicitud.ajustar({ ...solicitud.form, fechaReserva: v }),
            })
          }
          onHoraInicioChange={(v) =>
            solicitud.setForm({
              ...solicitud.form,
              ...solicitud.ajustar({ ...solicitud.form, horaInicio: v }),
            })
          }
          onHoraFinChange={(v) =>
            solicitud.setForm({
              ...solicitud.form,
              ...solicitud.ajustar({ ...solicitud.form, horaFin: v }),
            })
          }
          onMotivoChange={(v) => solicitud.setForm({ ...solicitud.form, motivo: v })}
          onSubmit={solicitud.enviarSolicitud}
          onCancel={() => solicitud.setOpen(false)}
        />
      </Modal>
    </>
  );
}

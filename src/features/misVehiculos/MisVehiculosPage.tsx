import { IconCar as Car, IconPlus as Plus } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Modal, LoadingState } from "@/components/shared";
import { DataGrid, DataList, DataToolbar } from "@/components/data";
import { VehiculoView } from "@/features/conductores/components/VehiculoView";
import { VehiculoFormModal } from "@/features/conductores/components/VehiculoFormModal";
import { CrearMiVehiculoModal } from "./components/CrearMiVehiculoModal";
import { renderVehiculoCard, getVehiculoColumns, type VehiculoCardHandlers } from "./components/VehiculoCard";
import { useMisVehiculosPage } from "./hooks/useMisVehiculosPage";

const C = theme;

export function MisVehiculos() {
  const {
    isLoading, miConductor, misVehiculos, misVehiculosFiltrados, esPrincipal,
    viewMode, setViewMode, search, setSearch,
    crear,
    viewing, openView, closeView,
    editando, form, setForm, touched, markTouched, erroresEdicion, abrirEditar, cerrarEditar, guardarEdicion,
  } = useMisVehiculosPage();

  if (isLoading) return <LoadingState message="Cargando tus vehículos..." />;

  const handlers: VehiculoCardHandlers = {
    esPrincipal: (v) => !!miConductor && esPrincipal(v, miConductor.id),
    onView: openView,
    onEdit: abrirEditar,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          borderRadius: 20,
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          padding: "1.4rem 1.6rem",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
            Mis Vehículos
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.85)" }}>
            Registra y consulta los vehículos vinculados a tu cuenta.
          </p>
        </div>
      </div>

      {!miConductor && (
        <div
          style={{
            padding: "2rem", borderRadius: 16, border: `1px dashed ${C.border}`, textAlign: "center",
            color: C.textLight, fontSize: 13,
          }}
        >
          Tu cuenta no tiene un perfil de conductor vinculado, así que todavía no puedes
          registrar vehículos.
        </div>
      )}

      {miConductor && misVehiculos.length === 0 && (
        <div
          style={{
            padding: "2.4rem 1.5rem", borderRadius: 16, border: `1px dashed ${C.border}`, textAlign: "center",
          }}
        >
          <Car size={28} color={C.textLight} style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 13, color: C.textLight, marginBottom: 14 }}>
            Todavía no tienes ningún vehículo registrado.
          </p>
          <button
            type="button"
            onClick={crear.abrir}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12,
              border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Plus size={16} /> Registrar mi primer vehículo
          </button>
        </div>
      )}

      {miConductor && misVehiculos.length > 0 && (
        <>
          <DataToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por placa, marca o línea..."
            searchAriaLabel="Buscar en mis vehículos"
            filters={[]}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            createLabel="Registrar vehículo"
            onCreate={crear.abrir}
          />

          {viewMode === "grid" ? (
            <DataGrid
              items={misVehiculosFiltrados}
              getKey={(v) => v.id}
              gridTemplateColumns="repeat(auto-fill,minmax(240px,1fr))"
              gap={14}
              renderCard={(v) => renderVehiculoCard(v, handlers)}
            />
          ) : (
            <DataList
              items={misVehiculosFiltrados}
              getKey={(v) => v.id}
              columns={getVehiculoColumns(handlers)}
            />
          )}
        </>
      )}

      <Modal open={crear.open} onClose={() => crear.setOpen(false)} maxWidth={480} title="Registrar mi vehículo">
        <CrearMiVehiculoModal hook={crear} />
      </Modal>

      <Modal open={!!viewing} onClose={closeView} maxWidth={450} title="Detalle del vehículo">
        {viewing && (
          <VehiculoView
            vehiculo={viewing}
            onClose={closeView}
            onEditarVehiculo={
              miConductor && esPrincipal(viewing, miConductor.id) ? () => abrirEditar(viewing) : undefined
            }
          />
        )}
      </Modal>

      <Modal open={!!editando} onClose={cerrarEditar} maxWidth={480} title="Editar vehículo">
        {editando && form && (
          <VehiculoFormModal
            form={form}
            errors={erroresEdicion}
            touched={touched}
            isValid={Object.values(erroresEdicion).every((v) => !v)}
            onChange={(patch) => setForm((f) => (f ? { ...f, ...patch } : f))}
            onMarkTouched={markTouched}
            onSubmit={guardarEdicion}
            onCancel={cerrarEditar}
          />
        )}
      </Modal>
    </div>
  );
}

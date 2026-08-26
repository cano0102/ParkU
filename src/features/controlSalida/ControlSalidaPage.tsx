import { ConfirmDialog, LoadingState } from "@/components/shared";
import { useControlSalidaPage } from "./hooks/useControlSalidaPage";
import { controlSalidaStyles } from "./lib/styles";
import { ControlSalidaHero } from "./components/ControlSalidaHero";
import { ControlSalidaToolbar } from "./components/ControlSalidaToolbar";
import { ControlSalidaTable } from "./components/ControlSalidaTable";

export function ControlSalidaPage() {
  const p = useControlSalidaPage();

  return (
    <>
      <style>{controlSalidaStyles}</style>

      <div className="control-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ControlSalidaHero
          enParqueadero={p.vehiculosEnParqueadero.length}
          salidas={p.vehiculosSalidos.length}
          celdasLibres={p.celdasDisponibles.length}
          total={p.controlesSalida.length}
        />

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

        {p.isLoading ? (
          <LoadingState message="Cargando registros..." />
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
            onDelete={p.handleDelete}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!p.confirmDelete}
        onConfirm={p.confirmDeleteAction}
        onCancel={() => p.setConfirmDelete(null)}
        title="Eliminar registro"
        message={`El registro del vehículo ${p.confirmDelete ? p.getVehiculo(p.confirmDelete.vehiculoId)?.placa || "—" : ""} se eliminará permanentemente. Esta acción no se puede revertir.`}
        confirmLabel="Eliminar"
        tone="danger"
      />
    </>
  );
}

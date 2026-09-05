import { Modal, LoadingState, ConfirmDialog } from "@/components/shared";
import { useRolesPage } from "./hooks/useRolesPage";
import { rolesStyles } from "./lib/styles";
import { RolesHero } from "./components/RolesHero";
import { RolesToolbar } from "./components/RolesToolbar";
import { RolesResults } from "./components/RolesResults";
import { RolFormModal } from "./components/RolFormModal";
import { RolViewModal } from "./components/RolViewModal";

export function Roles() {
  const {
    roles, isLoading, dialogOpen, setDialogOpen, viewOpen, setViewOpen, editingRol, viewingRol,
    search, setSearch, filterEstado, setFilterEstado, viewMode, setViewMode,
    formInitial, filteredRoles, stats,
    openCreate, openEdit, openView, handleToggleEstado, handleSave,
    rolAEliminar, setRolAEliminar, handleDeleteRequest, confirmDeleteRol,
  } = useRolesPage();

  return (
    <>
      <style>{rolesStyles}</style>

      <div className="roles-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <RolesHero stats={stats} />

        <RolesToolbar
          search={search}
          onSearchChange={setSearch}
          filterEstado={filterEstado}
          onFilterEstadoChange={setFilterEstado}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreate={openCreate}
        />

        {isLoading ? (
          <LoadingState message="Cargando roles..." />
        ) : (
          <RolesResults
            roles={filteredRoles}
            viewMode={viewMode}
            onView={openView}
            onEdit={openEdit}
            onToggleEstado={handleToggleEstado}
            onDelete={handleDeleteRequest}
          />
        )}
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={780}>
        <RolFormModal
          key={editingRol?.id ?? "new"}
          initial={formInitial}
          title={editingRol ? "Editar Rol" : "Nuevo Rol"}
          isEditing={!!editingRol}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
          existingRoles={roles}
          editingRolId={editingRol?.id ?? null}
        />
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={440}>
        {viewingRol && (
          <RolViewModal
            rol={viewingRol}
            onClose={() => setViewOpen(false)}
            onEdit={() => openEdit(viewingRol)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!rolAEliminar}
        onConfirm={confirmDeleteRol}
        onCancel={() => setRolAEliminar(null)}
        title="Eliminar rol"
        message={`¿Está seguro de eliminar el rol "${rolAEliminar?.nombre ?? ""}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </>
  );
}

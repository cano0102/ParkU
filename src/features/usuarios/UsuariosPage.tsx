import { Shield, UserCheck, Users, UserX } from "lucide-react";
import { Modal, LoadingState } from "@/components/shared";
import { StatsPanel } from "@/components/data";
import { COLORS } from "./lib/helpers";
import { UsuarioFormModal } from "./components/UsuarioFormModal";
import { UsuariosToolbar } from "./components/UsuariosToolbar";
import { UsuariosResults } from "./components/UsuariosResults";
import { usuariosStyles } from "./lib/styles";
import { useUsuariosPage } from "./hooks/useUsuariosPage";

export default function Usuarios() {
  const { data, filters: f, form } = useUsuariosPage();
  const hasActiveFilters = !!f.search || f.filterEstado !== "todos" || f.filterRol !== "todos";

  return (
    <>
      <style>{usuariosStyles}</style>

      <div className="u-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <StatsPanel
          eyebrowIcon={<Shield size={11} />}
          eyebrowText="Gestión institucional"
          title="Gestión de Usuarios"
          description="Administra cuentas, accesos, roles y permisos del sistema."
          metrics={[
            { label: "Total", value: data.usuarios.length, icon: <Users size={11} /> },
            { label: "Activos", value: data.totalActivos, icon: <UserCheck size={11} /> },
            { label: "Inactivos", value: data.totalInactivos, icon: <UserX size={11} /> },
            { label: "Roles", value: data.roles.length, icon: <Shield size={11} /> },
          ]}
        />

        <UsuariosToolbar
          search={f.search}
          onSearchChange={f.setSearch}
          filterEstado={f.filterEstado}
          onFilterEstadoChange={f.setFilterEstado}
          filterRol={f.filterRol}
          onFilterRolChange={f.setFilterRol}
          roles={data.roles}
          viewMode={f.viewMode}
          onViewModeChange={f.handleViewModeChange}
          onCreate={form.openCreate}
        />

        {data.isLoading ? (
          <LoadingState message="Cargando usuarios..." />
        ) : (
          <>
            {hasActiveFilters && (
              <p style={{ fontSize: 11, color: COLORS.textLight }}>
                Mostrando <strong style={{ color: COLORS.text }}>{f.filtered.length}</strong> resultado
                {f.filtered.length !== 1 ? "s" : ""}
                {f.search && (
                  <>
                    {" "}
                    para "<strong>{f.search}</strong>"
                  </>
                )}
              </p>
            )}

            <UsuariosResults
              usuarios={f.paginated}
              viewMode={f.viewMode}
              currentPage={f.currentPage}
              totalPages={f.totalPages}
              itemsPerPage={f.itemsPerPage}
              totalItems={f.filtered.length}
              onToggleEstado={form.handleToggleEstado}
              onEdit={form.openEdit}
              documentoDe={data.documentoDe}
              fotoDe={data.fotoDe}
              nombreDeRolReal={data.nombreDeRolReal}
              idUltimoAdminActivo={data.idUltimoAdminActivo}
              onPageChange={f.setCurrentPage}
              onItemsPerPageChange={(n) => {
                f.setItemsPerPage(n);
                f.setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      <Modal open={form.dialogOpen} onClose={() => form.setDialogOpen(false)} maxWidth={640}>
        <UsuarioFormModal
          key={form.editingUsuario?.id ?? "new"}
          initial={form.formInitial}
          title={form.editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
          roles={data.roles}
          usuarios={data.usuarios}
          conductores={data.conductores}
          editingId={form.editingUsuario?.id ?? null}
          onSave={form.handleSave}
          onCancel={() => form.setDialogOpen(false)}
        />
      </Modal>
    </>
  );
}

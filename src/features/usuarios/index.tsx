import { useCallback, useEffect, useMemo, useState } from "react";
import { UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "@/features/usuarios/hooks/useUsuarios";
import type { Usuario } from "@/services/api/usuarios";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { Modal } from "@/components/shared";
import { COLORS, USUARIOS_PROTEGIDOS, sanitizeText, emptyForm, FormState } from "./lib/helpers";
import { DataGrid, DataList, DataPagination, DataToolbar, StatsPanel } from "@/components/data";
import { renderUsuarioCard, getUsuarioColumns } from "./components/cards";
import { Shield, Users, UserCheck, UserX } from "lucide-react";
import { UsuarioFormModal } from "./components/UsuarioFormModal";

export default function Usuarios() {
  const { data: usuarios = [] } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const createUsuarioMutation = useCreateUsuario();
  const updateUsuarioMutation = useUpdateUsuario();
  const addUsuario = (data: Omit<Usuario, "id">) => createUsuarioMutation.mutate(data);
  const updateUsuario = (id: string, data: Partial<Omit<Usuario, "id">>) =>
    updateUsuarioMutation.mutate({ id, data });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [filterRol, setFilterRol] = useState("todos");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
    setItemsPerPage(mode === "list" ? 15 : 9);
    setCurrentPage(1);
  }, []);

  const totalActivos = useMemo(() => usuarios.filter((u) => u.estado === "activo").length, [usuarios]);
  const totalInactivos = useMemo(() => usuarios.filter((u) => u.estado === "inactivo").length, [usuarios]);
  const uniqueRoles = useMemo(
    () => Array.from(new Set(usuarios.map((u) => u.rol).filter(Boolean))),
    [usuarios]
  );

  const filtered = useMemo(
    () =>
      usuarios.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
          u.nombre.toLowerCase().includes(q) ||
          u.correo.toLowerCase().includes(q) ||
          u.identificacion.includes(search);
        const matchEstado = filterEstado === "todos" || u.estado === filterEstado;
        const matchRol = filterRol === "todos" || u.rol === filterRol;
        return matchSearch && matchEstado && matchRol;
      }),
    [usuarios, search, filterEstado, filterRol]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterEstado, filterRol]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage, itemsPerPage]
  );

  const openCreate = useCallback(() => {
    setEditingUsuario(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (u: Usuario) => {
      setEditingUsuario(u);
      setFormInitial({
        correo: u.correo,
        // Se deja vacío a propósito: el hint del formulario dice
        // "vacío = sin cambios", así que no debe pre-cargarse la
        // contraseña real (ver handleSave, que omite este campo si llega vacío).
        password: "",
        nombre: u.nombre,
        numero: u.numero,
        rol: u.rol,
        tipoDocumento: u.tipoDocumento,
        identificacion: u.identificacion,
        estado: u.estado,
      });
      setDialogOpen(true);
    },
    []
  );

  // Corrección: evita registrar dos usuarios iguales (mismo correo o misma identificación)
  const encontrarDuplicado = useCallback(
    (data: FormState, excludeId?: string) => {
      const correoNuevo = data.correo.trim().toLowerCase();
      const idNuevo = data.identificacion.trim();
      return usuarios.find(
        (u) =>
          u.id !== excludeId &&
          (u.correo.trim().toLowerCase() === correoNuevo ||
            (idNuevo && u.identificacion.trim() === idNuevo))
      );
    },
    [usuarios]
  );

  const handleSave = useCallback(
    (data: FormState) => {
      try {
        const duplicado = encontrarDuplicado(data, editingUsuario?.id);
        if (duplicado) {
          const motivo =
            duplicado.correo.trim().toLowerCase() === data.correo.trim().toLowerCase()
              ? "Ya existe un usuario registrado con ese correo"
              : "Ya existe un usuario registrado con ese número de identificación";
          toast.error(motivo);
          return;
        }

        if (editingUsuario) {
          // Corrección: si el campo de contraseña se deja vacío al editar,
          // no debe sobreescribir la contraseña existente (así lo indica
          // el hint "vacío = sin cambios" del formulario).
          const { password, ...rest } = data;
          updateUsuario(editingUsuario.id, password ? data : rest);
          toast.success("Usuario actualizado correctamente");
        } else {
          addUsuario(data);
          toast.success("Usuario creado correctamente");
        }
        setDialogOpen(false);
      } catch (error) {
        toast.error("Error al guardar el usuario");
        console.error("Error saving user:", error);
      }
    },
    [editingUsuario, addUsuario, updateUsuario, encontrarDuplicado]
  );

  const handleToggleEstado = useCallback(
    (u: Usuario) => {
      if (USUARIOS_PROTEGIDOS.includes(u.correo)) {
        toast.error("Este usuario está protegido");
        return;
      }
      try {
        updateUsuario(u.id, { ...u, estado: u.estado === "activo" ? "inactivo" : "activo" });
        toast.success(`Usuario ${u.estado === "activo" ? "desactivado" : "activado"} correctamente`);
      } catch (error) {
        toast.error("Error al cambiar el estado");
        console.error("Error toggling user status:", error);
      }
    },
    [updateUsuario]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .u-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .u-card{ transition:box-shadow .18s,transform .18s; }
        .u-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-2px); }
        .u-btn{ transition:background .15s,opacity .15s; }
        .u-btn:hover{ opacity:.85; }
        .u-page-btn{ transition:background .15s,border-color .15s,color .15s; }
        .u-page-btn:not(:disabled):hover{ border-color:${COLORS.primary}; color:${COLORS.primaryDark}; }
        input:focus,select:focus,textarea:focus{
          outline:none;
          border-color:${COLORS.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
        @media (max-width:640px){
          .u-view-label{ display:none; }
          .u-list-header{ display:none !important; }
          .u-list-row{
            grid-template-columns:1fr !important;
            grid-auto-flow:row;
            gap:6px !important;
          }
        }
        @media (max-width:480px){
          .uf-modal-grid{ grid-template-columns:1fr !important; }
        }
      `}</style>

      <div className="u-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <StatsPanel
          eyebrowIcon={<Shield size={11} />}
          eyebrowText="Gestión institucional"
          title="Gestión de Usuarios"
          description="Administra cuentas, accesos, roles y permisos del sistema."
          metrics={[
            { label: "Total", value: usuarios.length, icon: <Users size={11} /> },
            { label: "Activos", value: totalActivos, icon: <UserCheck size={11} /> },
            { label: "Inactivos", value: totalInactivos, icon: <UserX size={11} /> },
            { label: "Roles", value: uniqueRoles.length, icon: <Shield size={11} /> },
          ]}
        />

        <DataToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar usuario..."
          searchAriaLabel="Buscar usuarios"
          filters={[
            {
              value: filterEstado,
              onChange: (v) => setFilterEstado(v as "todos" | "activo" | "inactivo"),
              ariaLabel: "Filtrar por estado",
              options: [
                { value: "todos", label: "Todos" },
                { value: "activo", label: "Activos" },
                { value: "inactivo", label: "Inactivos" },
              ],
            },
            {
              value: filterRol,
              onChange: setFilterRol,
              ariaLabel: "Filtrar por rol",
              options: [
                { value: "todos", label: "Todos los roles" },
                ...uniqueRoles.map((r) => ({ value: r, label: r })),
              ],
            },
          ]}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          createLabel="Nuevo Usuario"
          onCreate={openCreate}
        />

        {(search || filterEstado !== "todos" || filterRol !== "todos") && (
          <p style={{ fontSize: 11, color: COLORS.textLight }}>
            Mostrando <strong style={{ color: COLORS.text }}>{filtered.length}</strong> resultado
            {filtered.length !== 1 ? "s" : ""}
            {search && (
              <>
                {" "}
                para "<strong>{sanitizeText(search)}</strong>"
              </>
            )}
          </p>
        )}

        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              borderRadius: 16,
              border: `2px dashed ${COLORS.border}`,
              background: "#fff",
              color: COLORS.textLight,
            }}
          >
            <UserCircle size={40} color={COLORS.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron usuarios</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea uno nuevo</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <DataGrid
                items={paginated}
                getKey={(u) => u.id}
                renderCard={(u) => renderUsuarioCard(u, { onToggleEstado: handleToggleEstado, onEdit: openEdit })}
              />
            ) : (
              <DataList
                items={paginated}
                getKey={(u) => u.id}
                columns={getUsuarioColumns({ onToggleEstado: handleToggleEstado, onEdit: openEdit })}
              />
            )}

            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filtered.length}
              itemsPerPageOptions={viewMode === "list" ? [15, 25, 50, 100] : [9, 18, 36, 60]}
              entityLabel="Usuarios"
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={640}>
        <UsuarioFormModal
          key={editingUsuario?.id ?? "new"}
          initial={formInitial}
          title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
          roles={roles}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Modal>
    </>
  );
}

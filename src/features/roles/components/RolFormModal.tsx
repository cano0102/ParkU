import { memo, useMemo } from "react";
import { IconShieldCheck as ShieldCheck, IconX as X } from "@tabler/icons-react";
import type { Rol } from "@/services/api/roles";
import { theme } from "@/styles/theme";
import { useRolForm } from "../hooks/useRolForm";
import { usePermisosCatalogo, usePermisosDeRol } from "../hooks/useRoles";
import type { FormState } from "../lib/helpers";
import { RolBasicInfoFields } from "./RolBasicInfoFields";
import { PermisosEditor } from "./PermisosEditor";

const COLORS = theme;

interface RolFormModalProps {
  initial: FormState;
  onSave: (data: FormState, permisoIds: string[]) => void;
  onCancel: () => void;
  title: string;
  isEditing?: boolean;
  existingRoles: Rol[];
  editingRolId?: string | null;
}

/** Formulario de creación/edición de rol: header, campos básicos, permisos y acciones. */
export const RolFormModal = memo(({ initial, onSave, onCancel, title, isEditing = false, existingRoles, editingRolId = null }: RolFormModalProps) => {
  const { data: permisosCatalogo = [], isLoading: catalogoLoading } = usePermisosCatalogo();
  const { data: permisosGuardados, isLoading: asignadosLoading } = usePermisosDeRol(editingRolId);
  const idsGuardados = useMemo(() => permisosGuardados ?? new Set<string>(), [permisosGuardados]);
  const {
    form, permisosSeleccionados, togglePermiso, toggleModulo,
    setDescripcion, setEstado, nombreErrorVisible, formInvalido,
    handleNombreChange, markNombreTocado, handleSubmit,
  } = useRolForm({ initial, onSave, existingRoles, editingRolId, permisosGuardados: idsGuardados });

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: "1.1rem 1.6rem 0.9rem",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(57,169,0,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={18} color={COLORS.primary} />
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                color: COLORS.primary,
                textTransform: "uppercase",
              }}
            >
              Seguridad
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>{title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            cursor: "pointer",
            color: COLORS.textLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Cerrar formulario"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: "1rem 1.6rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <RolBasicInfoFields
          form={form}
          isEditing={isEditing}
          nombreErrorVisible={nombreErrorVisible}
          onNombreChange={handleNombreChange}
          onNombreBlur={markNombreTocado}
          onDescripcionChange={setDescripcion}
          onEstadoChange={setEstado}
        />
        <PermisosEditor
          isLoading={catalogoLoading || asignadosLoading}
          permisosCatalogo={permisosCatalogo}
          seleccionados={permisosSeleccionados}
          onToggle={togglePermiso}
          onToggleModulo={toggleModulo}
        />
      </div>

      <div
        style={{
          padding: "0.8rem 1.6rem",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 20px",
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.text,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={formInvalido}
          style={{
            padding: "11px 24px",
            borderRadius: 12,
            border: "none",
            background: formInvalido ? "#E2E8F0" : COLORS.primary,
            color: formInvalido ? COLORS.textLight : "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: formInvalido ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: formInvalido ? undefined : "0 6px 18px rgba(57,169,0,.22)",
          }}
        >
          {title === "Nuevo Rol" ? "Crear Rol" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
});

RolFormModal.displayName = "RolFormModal";

import { memo } from "react";
import { UserCheck } from "lucide-react";
import { EntityFormModal } from "@/components/data";
import { DatosPersonalesFields } from "./DatosPersonalesFields";
import { CredencialesAccesoFields } from "./CredencialesAccesoFields";
import { DocumentoIdentidadFields } from "./DocumentoIdentidadFields";
import type { Usuario } from "@/services/api/usuarios";
import type { Conductor } from "@/services/api/conductores";
import { COLORS, FormState } from "../lib/helpers";
import { useUsuarioForm } from "../hooks/useUsuarioForm";

interface UsuarioFormModalProps {
  initial: FormState;
  title: string;
  roles: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  /** Usuarios existentes, para detectar en vivo correos duplicados. */
  usuarios: Usuario[];
  /** Conductores existentes, para detectar en vivo documentos duplicados. */
  conductores: Conductor[];
  /** Id del usuario en edición, para no chocar consigo mismo en la detección de duplicados. */
  editingId: string | null;
  onSave: (data: FormState) => void;
  onCancel: () => void;
}

export const UsuarioFormModal = memo(({ initial, title, roles, usuarios, conductores, editingId, onSave, onCancel }: UsuarioFormModalProps) => {
  const isEdit = title.startsWith("Editar");
  const f = useUsuarioForm({ initial, isEdit, roles, usuarios, conductores, editingId, onSave });

  return (
    <EntityFormModal
      icon={<UserCheck size={18} color={COLORS.primary} />}
      eyebrow="Gestión de accesos"
      title={title}
      onSubmit={f.handleSubmit}
      onCancel={onCancel}
      isValid={f.isValid}
      submitLabel={isEdit ? "Guardar cambios" : "Crear Usuario"}
    >
      <DatosPersonalesFields
        nombre={f.form.nombre}
        correo={f.form.correo}
        numero={f.form.numero}
        nombreError={f.err("nombre")}
        correoError={f.err("correo")}
        numeroError={f.err("numero")}
        onNombreChange={(v) => f.set("nombre", v)}
        onNombreBlur={() => f.markTouched("nombre")}
        onCorreoChange={(v) => f.set("correo", v)}
        onCorreoBlur={() => f.markTouched("correo")}
        onNumeroChange={(v) => f.set("numero", v)}
        onNumeroBlur={() => f.markTouched("numero")}
      />

      <CredencialesAccesoFields
        isEdit={isEdit}
        password={f.form.password}
        showPass={f.showPass}
        rol={f.form.rol}
        estado={f.form.estado}
        passwordError={f.err("password")}
        rolError={f.err("rol")}
        rolesDisponibles={f.rolesDisponibles}
        onPasswordChange={(v) => f.set("password", v)}
        onPasswordBlur={() => f.markTouched("password")}
        onToggleShowPass={() => f.setShowPass((v) => !v)}
        onRolChange={(v) => { f.set("rol", v); f.markTouched("rol"); }}
        onEstadoChange={(v) => f.set("estado", v)}
      />

      {f.esRolConductor && (
        <DocumentoIdentidadFields
          tipoDocumento={f.form.tipoDocumento}
          numeroDocumento={f.form.numeroDocumento}
          tipoUsuarioId={f.form.tipoUsuarioId}
          numeroDocumentoError={f.err("numeroDocumento")}
          tipoUsuarioIdError={f.err("tipoUsuarioId")}
          onTipoDocumentoChange={(v) => f.set("tipoDocumento", v)}
          onNumeroDocumentoChange={(v) => f.set("numeroDocumento", v)}
          onNumeroDocumentoBlur={() => f.markTouched("numeroDocumento")}
          onTipoUsuarioIdChange={(v) => { f.set("tipoUsuarioId", v); f.markTouched("tipoUsuarioId"); }}
        />
      )}
    </EntityFormModal>
  );
});

UsuarioFormModal.displayName = "UsuarioFormModal";

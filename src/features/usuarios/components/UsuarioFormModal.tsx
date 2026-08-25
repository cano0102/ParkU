import { memo } from "react";
import { UserCheck } from "lucide-react";
import { EntityFormModal } from "@/components/data";
import { ScannerQR } from "./ScannerQR";
import { DocumentoIdentidadFields } from "./DocumentoIdentidadFields";
import { DatosPersonalesFields } from "./DatosPersonalesFields";
import { CredencialesAccesoFields } from "./CredencialesAccesoFields";
import type { Usuario } from "@/services/api/usuarios";
import { COLORS, FormState } from "../lib/helpers";
import { useUsuarioForm } from "../hooks/useUsuarioForm";

interface UsuarioFormModalProps {
  initial: FormState;
  title: string;
  roles: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  /** Usuarios existentes, para detectar en vivo correo/identificación duplicados. */
  usuarios: Usuario[];
  /** Id del usuario en edición, para no chocar consigo mismo en la detección de duplicados. */
  editingId: string | null;
  onSave: (data: FormState) => void;
  onCancel: () => void;
}

export const UsuarioFormModal = memo(({ initial, title, roles, usuarios, editingId, onSave, onCancel }: UsuarioFormModalProps) => {
  const isEdit = title.startsWith("Editar");
  const f = useUsuarioForm({ initial, isEdit, roles, usuarios, editingId, onSave });

  return (
    <>
      <EntityFormModal
        icon={<UserCheck size={18} color={COLORS.primary} />}
        eyebrow="Gestión de accesos"
        title={title}
        onSubmit={f.handleSubmit}
        onCancel={onCancel}
        isValid={true}
        submitLabel={isEdit ? "Guardar cambios" : "Crear Usuario"}
      >
        <DocumentoIdentidadFields
          tipoDocumento={f.form.tipoDocumento}
          identificacion={f.form.identificacion}
          identificacionError={f.err("identificacion")}
          onTipoDocumentoChange={(v) => f.set("tipoDocumento", v)}
          onIdentificacionChange={(v) => f.set("identificacion", v)}
          onIdentificacionBlur={() => f.markTouched("identificacion")}
          onOpenScanner={() => f.setShowScanner(true)}
        />

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
          onNumeroChange={f.setTelefono}
          onNumeroBlur={() => f.markTouched("numero")}
        />

        <CredencialesAccesoFields
          isEdit={isEdit}
          password={f.form.password}
          showPass={f.showPass}
          rol={f.form.rol}
          tipoUsuario={f.form.tipoUsuario}
          estado={f.form.estado}
          passwordError={f.err("password")}
          rolError={f.err("rol")}
          tipoUsuarioError={f.err("tipoUsuario")}
          rolesDisponibles={f.rolesDisponibles}
          onPasswordChange={(v) => f.set("password", v)}
          onPasswordBlur={() => f.markTouched("password")}
          onToggleShowPass={() => f.setShowPass((v) => !v)}
          onRolChange={(v) => { f.set("rol", v); f.markTouched("rol"); }}
          onTipoUsuarioChange={(v) => { f.set("tipoUsuario", v); f.markTouched("tipoUsuario"); }}
          onEstadoChange={(v) => f.set("estado", v)}
        />
      </EntityFormModal>

      <ScannerQR
        open={f.showScanner}
        onScanSuccess={f.handleScanSuccess}
        onClose={() => f.setShowScanner(false)}
      />
    </>
  );
});

UsuarioFormModal.displayName = "UsuarioFormModal";

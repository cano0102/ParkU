import { memo } from "react";
import { IconUserCheck as UserCheck } from "@tabler/icons-react";
import { EntityFormModal } from "@/components/data";
import { AvatarUploader } from "@/components/shared";
import { DatosPersonalesFields } from "./DatosPersonalesFields";
import { CredencialesAccesoFields } from "./CredencialesAccesoFields";
import { DocumentoIdentidadFields } from "./DocumentoIdentidadFields";
import { RolSistemaField } from "./RolSistemaField";
import type { Usuario } from "@/services/api/usuarios";
import type { Conductor } from "@/services/api/conductores";
import { ROLES } from "@/services/core/roles";
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

  // El perfil SENA (Aprendiz/Instructor/…) solo se pregunta al CREAR una cuenta de rol
  // Conductor: es entonces cuando el backend le crea su perfil de conductor, y ese campo va
  // ahí. Al editar se corrige desde el módulo de Conductores.
  const pedirTipoUsuario = !isEdit && Number(f.form.rol) === ROLES.CONDUCTOR;

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
      {/* Foto de perfil: es lo primero con lo que se reconoce a la persona en el listado
          (Admin, Vigilante, Operador…). Opcional — sin ella se siguen mostrando las iniciales. */}
      <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
            Foto de perfil
          </p>
        </div>
        <div style={{ padding: "1rem 1.2rem", display: "flex", alignItems: "center", gap: 14 }}>
          <AvatarUploader
            nombre={f.form.nombre.trim() || "Nuevo usuario"}
            foto={f.form.foto}
            onChange={(foto) => f.set("foto", foto)}
            size={64}
          />
        </div>
      </section>

      {/* El rol va antes que nada: de él depende qué campos aparecen después (el "Tipo de
          usuario" del documento solo se pide para el rol Conductor). */}
      <RolSistemaField
        rol={f.form.rol}
        rolError={f.err("rol")}
        rolesDisponibles={f.rolesDisponibles}
        onRolChange={(v) => { f.set("rol", v); f.markTouched("rol"); }}
      />

      {/* Después el documento: es el dato con el que se identifica a la persona
          (y el que el listado y las tarjetas muestran). */}
      <DocumentoIdentidadFields
        tipoDocumento={f.form.tipoDocumento}
        numeroDocumento={f.form.numeroDocumento}
        numeroDocumentoError={f.err("numeroDocumento")}
        pedirTipoUsuario={pedirTipoUsuario}
        tipoUsuarioId={f.form.tipoUsuarioId}
        tipoUsuarioIdError={f.err("tipoUsuarioId")}
        onTipoDocumentoChange={(v) => f.set("tipoDocumento", v)}
        onNumeroDocumentoChange={(v) => f.set("numeroDocumento", v)}
        onNumeroDocumentoBlur={() => f.markTouched("numeroDocumento")}
        onTipoUsuarioIdChange={(v) => { f.set("tipoUsuarioId", v); f.markTouched("tipoUsuarioId"); }}
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
        onNumeroChange={(v) => f.set("numero", v)}
        onNumeroBlur={() => f.markTouched("numero")}
      />

      <CredencialesAccesoFields
        isEdit={isEdit}
        password={f.form.password}
        confirmPassword={f.form.confirmPassword}
        showPass={f.showPass}
        estado={f.form.estado}
        passwordError={f.err("password")}
        confirmPasswordError={f.err("confirmPassword")}
        onPasswordChange={(v) => f.set("password", v)}
        onPasswordBlur={() => f.markTouched("password")}
        onConfirmPasswordChange={(v) => f.set("confirmPassword", v)}
        onConfirmPasswordBlur={() => f.markTouched("confirmPassword")}
        onToggleShowPass={() => f.setShowPass((v) => !v)}
        onEstadoChange={(v) => f.set("estado", v)}
      />

    </EntityFormModal>
  );
});

UsuarioFormModal.displayName = "UsuarioFormModal";

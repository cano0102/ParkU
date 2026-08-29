import { Sparkles } from "lucide-react";
import type { Usuario } from "@/services/api/usuarios";
import { EntityFormModal } from "@/components/data";
import { COLORS, FormState, FormErrors } from "../lib/helpers";
import { UsuarioVinculadoField } from "./UsuarioVinculadoField";
import { DatosConductorFields } from "./DatosConductorFields";
import { DiscapacidadFields } from "./DiscapacidadFields";
import { VehiculoAsociadoFields } from "./VehiculoAsociadoFields";

interface ConductorFormModalProps {
  isEdit: boolean;
  formData: FormState;
  setFormData: (data: FormState) => void;
  formErrors: FormErrors;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
  isValid: boolean;
  usuarioSearch: string;
  setUsuarioSearch: (value: string) => void;
  usuariosFiltrados: Usuario[];
  usuariosConConductorIds: Set<string>;
  usuarioSeleccionado: Usuario | undefined;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ConductorFormModal({
  isEdit, formData, setFormData, formErrors, touched, markTouched, isValid,
  usuarioSearch, setUsuarioSearch, usuariosFiltrados, usuariosConConductorIds, usuarioSeleccionado,
  onSubmit, onCancel,
}: ConductorFormModalProps) {
  return (
    <EntityFormModal
      icon={<Sparkles size={18} color={COLORS.primary} />}
      eyebrow="Registro integral"
      title={isEdit ? "Editar Conductor" : "Nuevo Conductor"}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isValid={isValid}
      submitLabel={isEdit ? "Guardar cambios" : "Crear Conductor"}
      showValidationMessage={!isValid && Object.keys(touched).length > 0}
    >
      <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
            Datos del conductor
          </p>
        </div>
        <div style={{ padding: "0.85rem 1.1rem", display: "flex", flexDirection: "column", gap: 9 }}>
          <UsuarioVinculadoField
            error={undefined}
            usuarioSearch={usuarioSearch}
            onUsuarioSearchChange={setUsuarioSearch}
            usuariosFiltrados={usuariosFiltrados}
            usuariosConConductorIds={usuariosConConductorIds}
            usuarioIdSeleccionado={formData.usuarioId}
            usuarioSeleccionado={usuarioSeleccionado}
            onSelectUsuario={(id) => {
              // Autocompleta con los datos que ya tiene la cuenta (nombre/correo/teléfono)
              // para no hacer que se vuelvan a escribir a mano — solo pisa un campo si la
              // cuenta trae valor para él, así no borra algo que el usuario ya haya escrito.
              const usuario = usuariosFiltrados.find((u) => u.id === id);
              setFormData({
                ...formData,
                usuarioId: id,
                nombre: usuario?.nombre || formData.nombre,
                correo: usuario?.correo || formData.correo,
                numeroTelefonico: usuario?.numero || formData.numeroTelefonico,
              });
              markTouched("usuarioId");
            }}
          />

          <DatosConductorFields
            isEdit={isEdit}
            form={formData}
            errors={formErrors}
            touched={touched}
            onChange={(patch) => setFormData({ ...formData, ...patch })}
            onBlur={markTouched}
            onToggleEstado={() => setFormData({ ...formData, estado: formData.estado === "activo" ? "inactivo" : "activo" })}
          />

          <DiscapacidadFields
            discapacidad={formData.movilidadReducida}
            tipoDiscapacidad={formData.tipoDiscapacidad}
            onToggleDiscapacidad={() => setFormData({ ...formData, movilidadReducida: !formData.movilidadReducida })}
            onTipoDiscapacidadChange={(v) => setFormData({ ...formData, tipoDiscapacidad: v })}
          />
        </div>
      </section>

      <VehiculoAsociadoFields
        placa={formData.placa}
        placaError={touched.placa ? formErrors.placa : undefined}
        tipoVehiculo={formData.tipoVehiculo}
        marca={formData.marca}
        marcaError={touched.marca ? formErrors.marca : undefined}
        color={formData.color}
        colorError={touched.color ? formErrors.color : undefined}
        descripcionVehiculo={formData.descripcionVehiculo}
        onPlacaChange={(v) => setFormData({ ...formData, placa: v })}
        onPlacaBlur={() => markTouched("placa")}
        onTipoVehiculoChange={(tipo) => setFormData({ ...formData, tipoVehiculo: tipo })}
        onMarcaChange={(v) => setFormData({ ...formData, marca: v })}
        onMarcaBlur={() => markTouched("marca")}
        onColorChange={(v) => setFormData({ ...formData, color: v })}
        onColorBlur={() => markTouched("color")}
        onDescripcionChange={(v) => setFormData({ ...formData, descripcionVehiculo: v })}
      />
    </EntityFormModal>
  );
}

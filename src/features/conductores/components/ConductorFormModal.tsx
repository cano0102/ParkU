import { useState } from "react";
import { IconSparkles as Sparkles } from "@tabler/icons-react";
import type { Usuario } from "@/services/api/usuarios";
import { EntityFormModal } from "@/components/data";
import { AvatarUploader, ConfirmDialog } from "@/components/shared";
import { COLORS, FormState, FormErrors } from "../lib/helpers";
import { TipoUsuarioField } from "./TipoUsuarioField";
import { UsuarioVinculadoField } from "./UsuarioVinculadoField";
import { DatosConductorFields } from "./DatosConductorFields";
import { DiscapacidadFields } from "./DiscapacidadFields";
import { CuentaNuevaFields } from "./CuentaNuevaFields";
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
  /** El tipo de usuario elegido es Visitante: el único que puede quedarse sin cuenta. */
  esVisitante?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ConductorFormModal({
  isEdit, formData, setFormData, formErrors, touched, markTouched, isValid,
  usuarioSearch, setUsuarioSearch, usuariosFiltrados, usuariosConConductorIds, usuarioSeleccionado,
  esVisitante = false, onSubmit, onCancel,
}: ConductorFormModalProps) {
  // El vehículo se registra junto al conductor al CREARLO: dar de alta a alguien sin su
  // vehículo deja el trámite a medias. Al EDITAR no aparece -- para eso está la tarjeta del
  // vehículo, que además permite borrarlo.
  const conVehiculo = !isEdit;
  // Cambiar la cuenta de un conductor que YA tiene una es una decisión con consecuencias
  // (esa persona pierde el acceso y lo gana otra), así que se confirma antes.
  const [cuentaPendiente, setCuentaPendiente] = useState<Usuario | null>(null);

  const vincular = (id: string) => {
    // Autocompleta con los datos que ya tiene la cuenta (nombre/correo/teléfono) para no
    // hacer que se vuelvan a escribir a mano — solo pisa un campo si la cuenta trae valor.
    const usuario = usuariosFiltrados.find((u) => u.id === id) ?? cuentaPendiente ?? undefined;
    setFormData({
      ...formData,
      usuarioId: id,
      crearCuenta: false,
      nombre: usuario?.nombre || formData.nombre,
      correo: usuario?.correo || formData.correo,
      numeroTelefonico: usuario?.numero || formData.numeroTelefonico,
      // El documento también es de la cuenta desde la migración 002 del backend: si lo trae,
      // se precarga en vez de hacer que se teclee otra vez.
      tipoDocumento: (usuario?.tipoDocumento as FormState["tipoDocumento"]) || formData.tipoDocumento,
      numeroDocumento: usuario?.numeroDocumento || formData.numeroDocumento,
    });
    markTouched("usuarioId");
  };

  const alSeleccionar = (id: string) => {
    // Solo se pregunta cuando se REEMPLAZA una cuenta ya vinculada, no al elegir la primera.
    if (formData.usuarioId && formData.usuarioId !== id) {
      setCuentaPendiente(usuariosFiltrados.find((u) => u.id === id) ?? null);
      return;
    }
    vincular(id);
  };

  return (
    <>
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
      {/* El tipo de usuario va primero: de él depende si hace falta cuenta de acceso. */}
      <TipoUsuarioField
        value={formData.tipoUsuarioId}
        error={touched.tipoUsuarioId ? formErrors.tipoUsuarioId : undefined}
        onChange={(v) => setFormData({ ...formData, tipoUsuarioId: v })}
        onBlur={() => markTouched("tipoUsuarioId")}
      />

      <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
            Datos del conductor
          </p>
        </div>
        <div style={{ padding: "0.85rem 1.1rem", display: "flex", flexDirection: "column", gap: 9 }}>
          {/* Foto de perfil: con ella el vigilante reconoce al conductor de un vistazo en el
              listado, sin tener que leer el documento. Opcional — sin foto quedan las iniciales.
              El propio control ya se explica solo, así que no lleva texto al lado. */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AvatarUploader
              nombre={formData.nombre.trim() || "Nuevo conductor"}
              foto={formData.foto}
              onChange={(foto) => setFormData({ ...formData, foto })}
              size={60}
            />
          </div>

          <UsuarioVinculadoField
            error={touched.usuarioId ? formErrors.usuarioId : undefined}
            esVisitante={esVisitante}
            permitirCrearCuenta={!isEdit}
            crearCuenta={formData.crearCuenta}
            onCrearCuentaChange={(valor) => setFormData({
              ...formData,
              crearCuenta: valor,
              // Las dos opciones son excluyentes: al crear una cuenta se suelta la vinculada.
              usuarioId: valor ? "" : formData.usuarioId,
              password: valor ? formData.password : "",
              confirmPassword: valor ? formData.confirmPassword : "",
            })}
            usuarioSearch={usuarioSearch}
            onUsuarioSearchChange={setUsuarioSearch}
            usuariosFiltrados={usuariosFiltrados}
            usuariosConConductorIds={usuariosConConductorIds}
            usuarioIdSeleccionado={formData.usuarioId}
            usuarioSeleccionado={usuarioSeleccionado}
            onQuitarUsuario={() => {
              // Solo se suelta el vínculo con la cuenta: los datos ya escritos (nombre,
              // documento, contacto…) se conservan para poder seguir creando el conductor.
              setFormData({ ...formData, usuarioId: "" });
              setUsuarioSearch("");
            }}
            onSelectUsuario={alSeleccionar}
          />

          <DatosConductorFields
            form={formData}
            errors={formErrors}
            touched={touched}
            onChange={(patch) => setFormData({ ...formData, ...patch })}
            onBlur={markTouched}
            onToggleEstado={() => setFormData({ ...formData, estado: formData.estado === "activo" ? "inactivo" : "activo" })}
            soloLectura={isEdit}
            mostrarEstado={isEdit}
          />

          <DiscapacidadFields
            discapacidad={formData.movilidadReducida}
            tipoDiscapacidad={formData.tipoDiscapacidad}
            onToggleDiscapacidad={() => setFormData({ ...formData, movilidadReducida: !formData.movilidadReducida })}
            onTipoDiscapacidadChange={(v) => setFormData({ ...formData, tipoDiscapacidad: v })}
          />
        </div>
      </section>

      {/* La contraseña va después de la discapacidad (y de su descripción, si se desplegó):
          es el último paso del trámite. */}
      {formData.crearCuenta && (
        <CuentaNuevaFields
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          passwordError={touched.password ? formErrors.password : undefined}
          confirmPasswordError={touched.confirmPassword ? formErrors.confirmPassword : undefined}
          onPasswordChange={(v) => setFormData({ ...formData, password: v })}
          onConfirmPasswordChange={(v) => setFormData({ ...formData, confirmPassword: v })}
          onBlur={() => { markTouched("password"); markTouched("confirmPassword"); }}
        />
      )}

      {conVehiculo && (
        <VehiculoAsociadoFields
          placa={formData.placa}
          placaError={touched.placa ? formErrors.placa : undefined}
          tipoVehiculo={formData.tipoVehiculo}
          marca={formData.marca}
          marcaError={touched.marca ? formErrors.marca : undefined}
          linea={formData.linea}
          modelo={formData.modelo}
          modeloError={touched.modelo ? formErrors.modelo : undefined}
          color={formData.color}
          colorError={touched.color ? formErrors.color : undefined}
          descripcionVehiculo={formData.descripcionVehiculo}
          onPlacaChange={(v) => setFormData({ ...formData, placa: v })}
          onPlacaBlur={() => markTouched("placa")}
          onTipoVehiculoChange={(tipo) => setFormData({ ...formData, tipoVehiculo: tipo })}
          onMarcaChange={(v) => setFormData({ ...formData, marca: v })}
          onMarcaBlur={() => markTouched("marca")}
          onLineaChange={(v) => setFormData({ ...formData, linea: v })}
          onModeloChange={(v) => setFormData({ ...formData, modelo: v })}
          onModeloBlur={() => markTouched("modelo")}
          onColorChange={(v) => setFormData({ ...formData, color: v })}
          onColorBlur={() => markTouched("color")}
          onDescripcionChange={(v) => setFormData({ ...formData, descripcionVehiculo: v })}
        />
      )}
    </EntityFormModal>

    <ConfirmDialog
      open={!!cuentaPendiente}
      onConfirm={() => {
        if (cuentaPendiente) vincular(cuentaPendiente.id);
        setCuentaPendiente(null);
      }}
      onCancel={() => setCuentaPendiente(null)}
      title="Cambiar la cuenta vinculada"
      message={`Este conductor pasará a estar vinculado a "${cuentaPendiente?.nombre ?? ""}" (${cuentaPendiente?.correo ?? ""}). La cuenta anterior queda libre y pierde el acceso a esta ficha. ¿Continuar?`}
      confirmLabel="Cambiar cuenta"
    />
    </>
  );
}

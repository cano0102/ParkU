import { IconCar as Car, IconUserPlus as UserPlus } from "@tabler/icons-react";
import { EntityFormModal } from "@/components/data";
import { VehiculoAsociadoFields } from "@/features/conductores/components/VehiculoAsociadoFields";
import { COLORS } from "@/features/conductores/lib/helpers";
import type { useCrearMiVehiculo } from "../hooks/useCrearMiVehiculo";

interface CrearMiVehiculoModalProps {
  hook: ReturnType<typeof useCrearMiVehiculo>;
}

/**
 * Mismo formulario que usa el Administrador para dar de alta un vehículo (`VehiculoAsociadoFields`,
 * dentro del mismo `EntityFormModal`), pero para que un Conductor registre el suyo propio.
 *
 * Si la placa ya existe a nombre de otro conductor, el backend responde 409 con quién es el
 * dueño (`vehiculo.service.js::create`) -- en vez de solo mostrar el error, se ofrece la
 * acción de vincularse como copropietario, que es lo único que un Conductor puede hacer con
 * un vehículo que no es suyo (`POST /vehiculos/:id/conductores`, restringido a su propio id).
 */
export function CrearMiVehiculoModal({ hook }: CrearMiVehiculoModalProps) {
  if (hook.conflicto) {
    return (
      <div style={{ padding: "1.6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(217,119,6,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Car size={18} color="#D97706" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, lineHeight: 1.3 }}>
            Esta placa ya está registrada
          </h2>
        </div>
        <p style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.5, marginBottom: 18 }}>
          El vehículo con esta placa ya existe a nombre de{" "}
          <strong style={{ color: COLORS.text }}>{hook.conflicto.propietario}</strong>. No puedes
          registrarte como su propietario, pero puedes vincularte como copropietario si también
          usas este vehículo.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => hook.setConflicto(null)}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 12, border: `1px solid ${COLORS.border}`,
              background: "#fff", color: COLORS.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Volver
          </button>
          <button
            type="button"
            onClick={hook.vincularmeComoCopropietario}
            disabled={hook.vinculando}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 12, border: "none",
              background: COLORS.primary, color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: hook.vinculando ? "not-allowed" : "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: hook.vinculando ? 0.75 : 1,
            }}
          >
            <UserPlus size={14} />
            {hook.vinculando ? "Vinculando…" : "Vincularme como copropietario"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <EntityFormModal
      icon={<Car size={18} color={COLORS.primary} />}
      eyebrow="Vehículo"
      title="Registrar mi vehículo"
      onSubmit={hook.guardar}
      onCancel={() => hook.setOpen(false)}
      isValid={hook.isValid}
      submitLabel="Registrar vehículo"
      showValidationMessage={hook.touched}
    >
      <VehiculoAsociadoFields
        placa={hook.form.placa}
        placaError={hook.touched ? hook.errors.placa : undefined}
        tipoVehiculo={hook.form.tipoVehiculo}
        marca={hook.form.marca}
        marcaError={hook.touched ? hook.errors.marca : undefined}
        linea={hook.form.linea}
        modelo={hook.form.modelo}
        modeloError={hook.touched ? hook.errors.modelo : undefined}
        color={hook.form.color}
        colorError={hook.touched ? hook.errors.color : undefined}
        descripcionVehiculo={hook.form.descripcionVehiculo}
        onPlacaChange={(v) => hook.setForm((f) => ({ ...f, placa: v }))}
        onPlacaBlur={hook.markTouched}
        onTipoVehiculoChange={(tipo) => hook.setForm((f) => ({ ...f, tipoVehiculo: tipo }))}
        onMarcaChange={(v) => hook.setForm((f) => ({ ...f, marca: v }))}
        onMarcaBlur={hook.markTouched}
        onLineaChange={(v) => hook.setForm((f) => ({ ...f, linea: v }))}
        onModeloChange={(v) => hook.setForm((f) => ({ ...f, modelo: v }))}
        onModeloBlur={hook.markTouched}
        onColorChange={(v) => hook.setForm((f) => ({ ...f, color: v }))}
        onColorBlur={hook.markTouched}
        onDescripcionChange={(v) => hook.setForm((f) => ({ ...f, descripcionVehiculo: v }))}
      />
    </EntityFormModal>
  );
}

import { AlertCircle, Car, Mail, ShieldCheck, Sparkles, X } from "lucide-react";
import type { Usuario } from "../../context/DataContext";
import { FormField } from "../../components/shared";
import { COLORS, getAvatarGradient, getInitials, inputStyle, inputErrorStyle, FormState, FormErrors } from "./helpers";

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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div
        style={{
          padding: "1.4rem 1.8rem 1.2rem",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            <Sparkles size={18} color={COLORS.primary} />
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
              Registro integral
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>
              {isEdit ? "Editar Conductor" : "Nuevo Conductor"}
            </h2>
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

      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <section
          style={{
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: COLORS.bg,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: COLORS.textLight,
                textTransform: "uppercase",
              }}
            >
              Datos del conductor
            </p>
          </div>
          <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField
              label="Usuario vinculado *"
              error={touched.usuarioId ? formErrors.usuarioId : undefined}
            >
              <input
                type="text"
                placeholder="Buscar por nombre, identificación o correo..."
                value={usuarioSearch}
                onChange={(e) => setUsuarioSearch(e.target.value)}
                style={inputStyle}
              />
              <div
                style={{
                  marginTop: 6,
                  borderRadius: 11,
                  border: `1px solid ${COLORS.border}`,
                  padding: 4,
                  background: "#fff",
                }}
              >
                {usuariosFiltrados.length === 0 && (
                  <p style={{ fontSize: 11, color: COLORS.textMuted, padding: "10px 8px" }}>
                    Sin resultados
                  </p>
                )}
                {usuariosFiltrados.map((u) => {
                  const yaEsConductor = usuariosConConductorIds.has(u.id);
                  const selected = formData.usuarioId === u.id;
                  return (
                    <div
                      key={u.id}
                      className={`usuario-option${yaEsConductor ? " disabled" : ""}`}
                      onClick={() => {
                        if (yaEsConductor) return;
                        setFormData({ ...formData, usuarioId: u.id });
                        markTouched("usuarioId");
                      }}
                      style={{
                        background: selected ? "rgba(57,169,0,.1)" : "transparent",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${getAvatarGradient(u.nombre)[0]}, ${getAvatarGradient(u.nombre)[1]})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {getInitials(u.nombre)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {u.nombre}
                        </p>
                        <p style={{ fontSize: 10, color: COLORS.textLight }}>
                          {u.tipoDocumento} · {u.identificacion}
                          {yaEsConductor ? " — ya es conductor" : ""}
                        </p>
                      </div>
                      {selected && <ShieldCheck size={14} color={COLORS.primary} />}
                    </div>
                  );
                })}
              </div>

              {usuarioSeleccionado && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "#F0FDF4",
                    border: `1px solid ${COLORS.primary}33`,
                  }}
                >
                  <Mail size={13} color={COLORS.primaryDark} />
                  <span style={{ fontSize: 11, color: COLORS.primaryDark, fontWeight: 700 }}>
                    {usuarioSeleccionado.correo}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.textLight }}>
                    Seleccionado: {usuarioSeleccionado.nombre}
                  </span>
                </div>
              )}
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: isEdit ? "1fr 1fr" : "1fr", gap: 10 }}>
              <FormField label="Tipo de conductor">
                <div style={{ display: "flex", gap: 8 }}>
                  {(["aprendiz", "instructor"] as const).map((tipo) => {
                    const isSelected = formData.tipoConductor === tipo;
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoConductor: tipo })}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 11,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          border: isSelected ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                          background: isSelected ? "rgba(57,169,0,.1)" : COLORS.bg,
                          color: isSelected ? COLORS.primaryDark : COLORS.textLight,
                          textTransform: "capitalize",
                        }}
                      >
                        {tipo}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              {isEdit && (
                <FormField label="Estado">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight }}>Inactivo</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          estado: formData.estado === "activo" ? "inactivo" : "activo",
                        })
                      }
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 999,
                        background: formData.estado === "activo" ? COLORS.primary : "#CBD5E1",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background .2s",
                      }}
                      aria-label={formData.estado === "activo" ? "Desactivar" : "Activar"}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#fff",
                          position: "absolute",
                          top: 2,
                          left: formData.estado === "activo" ? 22 : 2,
                          transition: "left .2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                        }}
                      />
                    </button>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: formData.estado === "activo" ? COLORS.primaryDark : "#B91C1C",
                      }}
                    >
                      {formData.estado === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </FormField>
              )}
            </div>

            <FormField
              label="Centro de formación *"
              error={touched.centroFormacion ? formErrors.centroFormacion : undefined}
            >
              <input
                type="text"
                placeholder="ej. Centro de Tecnología"
                value={formData.centroFormacion}
                onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                onBlur={() => markTouched("centroFormacion")}
                style={{
                  ...inputStyle,
                  ...(touched.centroFormacion && formErrors.centroFormacion ? inputErrorStyle : {}),
                }}
                required
              />
            </FormField>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                borderRadius: 11,
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
                  ¿Tiene alguna discapacidad?
                </p>
                <p style={{ fontSize: 10, color: COLORS.textLight }}>
                  Activa para registrar el tipo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discapacidad: !formData.discapacidad })}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 999,
                  background: formData.discapacidad ? COLORS.primary : "#CBD5E1",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background .2s",
                }}
                aria-label={formData.discapacidad ? "Desactivar discapacidad" : "Activar discapacidad"}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 2,
                    left: formData.discapacidad ? 20 : 2,
                    transition: "left .2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                  }}
                />
              </button>
            </div>

            {formData.discapacidad && (
              <FormField label="Tipo de discapacidad">
                <input
                  type="text"
                  placeholder="ej. Visual, Motriz, Auditiva…"
                  value={formData.tipoDiscapacidad}
                  onChange={(e) => setFormData({ ...formData, tipoDiscapacidad: e.target.value })}
                  style={inputStyle}
                />
              </FormField>
            )}
          </div>
        </section>

        <section
          style={{
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: COLORS.bg,
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.5,
                color: COLORS.textLight,
                textTransform: "uppercase",
              }}
            >
              Vehículo asociado
            </p>
            {formData.placa && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: COLORS.primary,
                  background: "rgba(57,169,0,.1)",
                  padding: "2px 10px",
                  borderRadius: 999,
                }}
              >
                Placa: {formData.placa}
              </span>
            )}
          </div>
          <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField
              label="Placa *"
              error={touched.placa ? formErrors.placa : undefined}
              hint="Sin espacios ni guiones, ej: ABC123"
              style={{ gridColumn: "1 / -1" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
                  padding: "4px 14px 4px 4px",
                  borderRadius: 11,
                  border: `2px solid ${touched.placa && formErrors.placa ? "#FCA5A5" : COLORS.primary}`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    background: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <Car size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: ABC123"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  onBlur={() => markTouched("placa")}
                  maxLength={10}
                  required
                  style={{
                    ...inputStyle,
                    border: "none",
                    background: "transparent",
                    padding: "11px 0",
                    fontSize: 16,
                    fontWeight: 700,
                    color: COLORS.text,
                    letterSpacing: 1,
                  }}
                />
              </div>
            </FormField>

            <FormField label="Tipo de vehículo">
              <div style={{ display: "flex", gap: 8 }}>
                {(["carro", "moto"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipoVehiculo: tipo })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 11,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: formData.tipoVehiculo === tipo ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                      background: formData.tipoVehiculo === tipo ? "rgba(57,169,0,.1)" : COLORS.bg,
                      color: formData.tipoVehiculo === tipo ? COLORS.primaryDark : COLORS.textLight,
                    }}
                  >
                    {tipo === "carro" ? "🚗 Carro" : "🏍️ Moto"}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Marca">
              <input
                type="text"
                placeholder="ej. Chevrolet Spark"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                style={inputStyle}
              />
            </FormField>

            <FormField
              label="Descripción adicional"
              hint={`${formData.descripcionVehiculo.length}/200`}
              style={{ gridColumn: "1 / -1" }}
            >
              <textarea
                rows={2}
                maxLength={200}
                placeholder="Observaciones sobre el vehículo…"
                value={formData.descripcionVehiculo}
                onChange={(e) => setFormData({ ...formData, descripcionVehiculo: e.target.value })}
                style={{ ...inputStyle, resize: "none" }}
              />
            </FormField>
          </div>
        </section>
      </div>

      <div
        style={{
          padding: "1rem 1.8rem",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {!isValid && Object.keys(touched).length > 0 && (
          <span
            style={{
              fontSize: 11,
              color: "#DC2626",
              fontWeight: 600,
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertCircle size={13} /> Revisa los campos marcados
          </span>
        )}
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
          disabled={!isValid}
          style={{
            padding: "11px 24px",
            borderRadius: 12,
            border: "none",
            background: isValid ? COLORS.primary : COLORS.textMuted,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: isValid ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            boxShadow: isValid ? "0 6px 18px rgba(57,169,0,.22)" : "none",
            opacity: isValid ? 1 : 0.65,
            transition: "opacity .15s ease",
          }}
        >
          {isEdit ? "Guardar cambios" : "Crear Conductor"}
        </button>
      </div>
    </form>
  );
}

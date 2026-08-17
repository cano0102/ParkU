import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail, Phone, X, UserCheck, IdCard, KeyRound, Camera,
  Eye as EyeIcon, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Modal, FormField } from "../../components/shared";
import { ScannerQR } from "./ScannerQR";
import {
  COLORS, FormState, NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX,
  TELEFONO_REGEX, EMAIL_REGEX, inputStyle, inputErrorStyle, inputIconStyle,
  sanitizeText,
} from "./helpers";

interface UsuarioFormModalProps {
  initial: FormState;
  title: string;
  roles: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  onSave: (data: FormState) => void;
  onCancel: () => void;
}

export const UsuarioFormModal = memo(({ initial, title, roles, onSave, onCancel }: UsuarioFormModalProps) => {
  const [form, setForm] = useState<FormState>(initial);
  const [showPass, setShowPass] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const isEdit = title.startsWith("Editar");

  useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial]);

  // Solo se muestran roles activos en el selector (corrección: no mostrar roles desactivados)
  const rolesDisponibles = useMemo(
    () => roles.filter((r) => r.estado !== "inactivo"),
    [roles]
  );

  const set = useCallback((k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }, []);

  // Teléfono: solo permite dígitos, espacios, paréntesis, guiones y "+"
  const setTelefono = useCallback((raw: string) => {
    const filtrado = raw.replace(/[^0-9()+\-\s]/g, "");
    setForm((f) => ({ ...f, numero: filtrado }));
    setErrors((e) => ({ ...e, numero: undefined }));
  }, []);

  // Maneja los datos obtenidos del QR
  const handleScanSuccess = useCallback((data: any) => {
    // Mapeo robusto de campos según la estructura típica de la cédula colombiana
    const identificacion = data.numeroDocumento ?? data.identificacion ?? data.documento ?? "";
    // Corrección: `??` tiene menor precedencia que `+`, así que
    // `data.nombres + " " + data.apellidos` se evaluaba primero, produciendo
    // el string "undefined undefined" (no null/undefined) cuando faltaba
    // alguno de los dos campos, y ese texto terminaba en el input de nombre.
    const nombreCompleto =
      data.nombreCompleto ??
      (data.nombres && data.apellidos ? `${data.nombres} ${data.apellidos}` : undefined) ??
      data.nombre ??
      "";
    const correo = data.correo ?? data.email ?? "";
    const telefonoCrudo = (data.telefono ?? data.celular ?? data.numero ?? "").toString();
    const tipoDoc = data.tipoDocumento ?? "CC";

    setForm((prev) => ({
      ...prev,
      identificacion: identificacion.toString(),
      nombre: nombreCompleto.toString(),
      correo: correo.toString(),
      numero: telefonoCrudo.replace(/[^0-9()+\-\s]/g, ""),
      tipoDocumento: tipoDoc.toString(),
    }));
    toast.success("Datos de la cédula cargados correctamente");
  }, []);

  const validate = useCallback((f: FormState) => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const nombre = f.nombre.trim();
    const correo = f.correo.trim();
    const numero = f.numero.trim();

    // Nombre completo: longitud mínima y máxima
    if (!nombre) {
      nextErrors.nombre = "El nombre es obligatorio";
    } else if (nombre.length < NOMBRE_MIN) {
      nextErrors.nombre = `El nombre debe tener al menos ${NOMBRE_MIN} caracteres`;
    } else if (nombre.length > NOMBRE_MAX) {
      nextErrors.nombre = `El nombre no puede superar ${NOMBRE_MAX} caracteres`;
    }

    // Correo: formato válido
    if (!correo) {
      nextErrors.correo = "El correo es obligatorio";
    } else if (!EMAIL_REGEX.test(correo)) {
      nextErrors.correo = "Ingresa un correo electrónico válido";
    }

    // Teléfono: solo números (y separadores comunes), longitud razonable
    if (numero && !TELEFONO_REGEX.test(numero)) {
      nextErrors.numero = "El teléfono solo debe contener números (7 a 15 dígitos)";
    }

    // Rol obligatorio
    if (!f.rol) {
      nextErrors.rol = "Debe seleccionar un rol";
    }

    // Contraseña: obligatoria al crear; si se escribe (crear o editar), validar longitud
    if (!isEdit && !f.password) {
      nextErrors.password = "La contraseña es obligatoria";
    } else if (f.password && (f.password.length < PASSWORD_MIN || f.password.length > PASSWORD_MAX)) {
      nextErrors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;
    }

    return nextErrors;
  }, [isEdit]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const nextErrors = validate(form);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        toast.error("Revisa los campos marcados en rojo");
        return;
      }

      const sanitizedNombre = sanitizeText(form.nombre.trim());
      const sanitizedCorreo = sanitizeText(form.correo.trim().toLowerCase());
      onSave({ ...form, nombre: sanitizedNombre, correo: sanitizedCorreo, numero: form.numero.trim() });
    },
    [form, onSave, validate]
  );

  const iconColor = COLORS.textLight;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            padding: "1.4rem 1.8rem 1.2rem",
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
              <UserCheck size={18} color={COLORS.primary} />
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
                Gestión de accesos
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

        <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                Documento de identidad
              </p>
            </div>
            <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FormField label="Tipo de documento">
                <select
                  value={form.tipoDocumento}
                  onChange={(e) => set("tipoDocumento", e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                >
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PPTE">Cédula de Extranjera (PPTE)</option>
                </select>
              </FormField>
              <FormField label="Número de identificación">
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <IdCard
                    size={14}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: iconColor,
                      zIndex: 1,
                    }}
                  />
                  <input
                    placeholder="ej. 1001234567"
                    value={form.identificacion}
                    onChange={(e) => set("identificacion", e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
                    style={{ ...inputIconStyle, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    title="Escanear cédula (código QR)"
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.primary,
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                      borderRadius: 6,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(57,169,0,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Camera size={18} />
                  </button>
                </div>
              </FormField>
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
                Datos personales
              </p>
            </div>
            <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: 10 }}>
              <FormField label="Nombre completo" hint={`${form.nombre.trim().length}/${NOMBRE_MAX}`} error={errors.nombre}>
                <input
                  placeholder="ej. María García López"
                  value={form.nombre}
                  maxLength={NOMBRE_MAX}
                  onChange={(e) => set("nombre", e.target.value)}
                  style={errors.nombre ? { ...inputStyle, ...inputErrorStyle } : inputStyle}
                />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FormField label="Correo electrónico" error={errors.correo}>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={14}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: iconColor,
                      }}
                    />
                    <input
                      type="email"
                      placeholder="correo@sena.edu.co"
                      value={form.correo}
                      onChange={(e) => set("correo", e.target.value)}
                      style={errors.correo ? { ...inputIconStyle, ...inputErrorStyle } : inputIconStyle}
                    />
                  </div>
                </FormField>
                <FormField label="Teléfono" error={errors.numero}>
                  <div style={{ position: "relative" }}>
                    <Phone
                      size={14}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: iconColor,
                      }}
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="300 000 0000"
                      value={form.numero}
                      maxLength={15}
                      onChange={(e) => setTelefono(e.target.value)}
                      style={errors.numero ? { ...inputIconStyle, ...inputErrorStyle } : inputIconStyle}
                    />
                  </div>
                </FormField>
              </div>
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
                Credenciales y acceso
              </p>
            </div>
            <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FormField
                label="Contraseña"
                hint={isEdit ? "vacío = sin cambios" : `mín. ${PASSWORD_MIN} caracteres`}
                error={errors.password}
              >
                <div style={{ position: "relative" }}>
                  <KeyRound
                    size={14}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: iconColor,
                    }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    maxLength={PASSWORD_MAX}
                    onChange={(e) => set("password", e.target.value)}
                    style={
                      errors.password
                        ? { ...inputIconStyle, ...inputErrorStyle, paddingRight: 38 }
                        : { ...inputIconStyle, paddingRight: 38 }
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: iconColor,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                  </button>
                </div>
              </FormField>

              <FormField label="Rol del sistema" error={errors.rol}>
                <select
                  value={form.rol}
                  onChange={(e) => set("rol", e.target.value)}
                  style={
                    errors.rol
                      ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" }
                      : { ...inputStyle, appearance: "none", cursor: "pointer" }
                  }
                >
                  <option value="">Seleccionar rol…</option>
                  {rolesDisponibles.map((r) => (
                    <option key={r.id} value={r.nombre}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </FormField>

              {isEdit && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField label="Estado de la cuenta">
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["activo", "inactivo"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set("estado", s)}
                          style={{
                            flex: 1,
                            padding: "11px 10px",
                            borderRadius: 11,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            border: form.estado === s ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                            background:
                              form.estado === s
                                ? s === "activo"
                                  ? "rgba(57,169,0,.1)"
                                  : "rgba(239,68,68,.08)"
                                : COLORS.bg,
                            color:
                              form.estado === s
                                ? s === "activo"
                                  ? COLORS.primaryDark
                                  : "#B91C1C"
                                : COLORS.textLight,
                          }}
                        >
                          {s === "activo" ? "✓ Activo" : "✗ Inactivo"}
                        </button>
                      ))}
                    </div>
                  </FormField>
                </div>
              )}
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
            style={{
              padding: "11px 24px",
              borderRadius: 12,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 6px 18px rgba(57,169,0,.22)",
            }}
          >
            {isEdit ? "Guardar cambios" : "Crear Usuario"}
          </button>
        </div>
      </form>

      {/* Modal para el escáner QR */}
      <Modal open={showScanner} onClose={() => setShowScanner(false)} maxWidth={450}>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: COLORS.text }}>
              📷 Escanear cédula
            </h3>
            <button
              onClick={() => setShowScanner(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.textLight,
              }}
            >
              <X size={16} />
            </button>
          </div>
          <ScannerQR
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
          <p style={{ fontSize: 11, color: COLORS.textLight, marginTop: 16, textAlign: "center" }}>
            Coloca el código QR de la cédula frente a la cámara.
          </p>
        </div>
      </Modal>
    </>
  );
});

UsuarioFormModal.displayName = "UsuarioFormModal";

import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import {
  Plus, Pencil, Trash2, Eye, Search,
  UserCircle, Shield, Mail, Phone, Lock,
  CheckCircle2, XCircle, UserCheck, X,
  Users, UserX, IdCard, KeyRound, Eye as EyeIcon, EyeOff,
  LayoutGrid, List, Camera,
} from "lucide-react";
import { useData, Usuario } from "../context/DataContext";
import { toast } from "sonner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { theme } from "../theme";

const COLORS = theme;

const USUARIOS_PROTEGIDOS = ["admin@sena.edu.co", "superadmin@sena.edu.co"];

const getRoleAccent = (rol: string) => {
  switch (rol) {
    case "Administrador": return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" };
    case "SuperAdmin": return { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" };
    case "Supervisor": return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    case "Operador": return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
    default: return { bg: "#ECFDF5", text: "#166534", border: "#A7F3D0", dot: "#39A900" };
  }
};

const AVATAR_PALETTE = [
  ["#39A900", "#2D7D00"], ["#2563EB", "#1D4ED8"], ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"], ["#EF4444", "#DC2626"], ["#0891B2", "#0E7490"],
] as const;

const avatarColors = (nombre: string): [string, string] => {
  const idx = (nombre.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx] as [string, string];
};

const initials = (nombre: string): string => {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
};

const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

// ----------------------------------------------
// 🔧 REGLAS DE VALIDACIÓN (correcciones)
// ----------------------------------------------
const NOMBRE_MIN = 3;
const NOMBRE_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;
const TELEFONO_REGEX = /^[0-9()+\-\s]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

const Modal = memo(({ open, onClose, children, maxWidth = 680 }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const focusable = document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 24,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 55px rgba(15,23,42,.12)",
          animation: "modalIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn{
          from{opacity:0;transform:translateY(16px) scale(.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
      `}</style>
    </div>
  );
});

Modal.displayName = "Modal";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}

const Field = memo(({ label, children, hint, error }: FieldProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: COLORS.textLight }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <span style={{ fontSize: 10, fontWeight: 700, color: "#DC2626" }}>{error}</span>
      )}
    </div>
  );
});

Field.displayName = "Field";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 11,
  border: `1px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  background: COLORS.bg,
  color: COLORS.text,
};

const inputErrorStyle: React.CSSProperties = {
  borderColor: "#DC2626",
};

const inputIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: 38,
};

// ----------------------------------------------
// 🔍 COMPONENTE ESCÁNER QR CORREGIDO
// ----------------------------------------------
interface ScannerQRProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

const ScannerQR = memo(({ onScanSuccess, onClose }: ScannerQRProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (!result || result.length === 0) return;

    try {
      // El resultado es un array con el texto del QR en rawValue
      const raw = result[0]?.rawValue;
      if (!raw) {
        setError("No se pudo leer el código QR");
        toast.error("No se pudo leer el código QR");
        return;
      }
      const parsed = JSON.parse(raw);
      onScanSuccess(parsed);
      onClose();
    } catch (e) {
      console.error("Error parseando QR:", e);
      setError("El código QR no contiene datos válidos.");
      toast.error("QR inválido, intenta de nuevo");
    }
  };

  const handleError = (err: any) => {
    console.error("Error de cámara:", err);
    setError("No se pudo acceder a la cámara. Verifica los permisos.");
    toast.error("No se pudo acceder a la cámara");
  };

  return (
    <div style={{ position: "relative", maxWidth: 400, margin: "0 auto" }}>
      <Scanner
        constraints={{ facingMode: "environment" }}
        onScan={handleScan}
        onError={handleError}
        styles={{
          container: { borderRadius: 16, overflow: "hidden" },
          video: { width: "100%", height: "auto" },
        }}
      />
      {error && (
        <p style={{ color: "#EF4444", fontSize: 12, marginTop: 8, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
});

ScannerQR.displayName = "ScannerQR";

// ----------------------------------------------
// FORMULARIO DE USUARIO (con escáner)
// ----------------------------------------------
interface FormState {
  correo: string;
  password: string;
  nombre: string;
  numero: string;
  rol: string;
  tipoDocumento: string;
  identificacion: string;
  estado: "activo" | "inactivo";
}

interface UsuarioFormProps {
  initial: FormState;
  title: string;
  roles: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  onSave: (data: FormState) => void;
  onCancel: () => void;
}

const UsuarioForm = memo(({ initial, title, roles, onSave, onCancel }: UsuarioFormProps) => {
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
    const nombreCompleto = data.nombreCompleto ?? data.nombres + " " + data.apellidos ?? data.nombre ?? "";
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
              <Field label="Tipo de documento">
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
              </Field>
              <Field label="Número de identificación">
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
              </Field>
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
              <Field label="Nombre completo" hint={`${form.nombre.trim().length}/${NOMBRE_MAX}`} error={errors.nombre}>
                <input
                  placeholder="ej. María García López"
                  value={form.nombre}
                  maxLength={NOMBRE_MAX}
                  onChange={(e) => set("nombre", e.target.value)}
                  style={errors.nombre ? { ...inputStyle, ...inputErrorStyle } : inputStyle}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Correo electrónico" error={errors.correo}>
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
                </Field>
                <Field label="Teléfono" error={errors.numero}>
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
                </Field>
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
              <Field
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
              </Field>

              <Field label="Rol del sistema" error={errors.rol}>
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
              </Field>

              {isEdit && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Estado de la cuenta">
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
                  </Field>
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

UsuarioForm.displayName = "UsuarioForm";

// ----------------------------------------------
// CONFIRMACIÓN
// ----------------------------------------------
interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog = memo(({ open, onConfirm, onCancel, title, message }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 20,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 55px rgba(15,23,42,.12)",
          padding: "1.8rem",
          animation: "modalIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
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
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = "ConfirmDialog";

const emptyForm = (): FormState => ({
  correo: "",
  password: "",
  nombre: "",
  numero: "",
  rol: "",
  tipoDocumento: "CC",
  identificacion: "",
  estado: "activo",
});

// ----------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------
export default function Usuarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, roles } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
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

  const pageNumbers = useMemo(() => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
    );
    return pages.reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
      acc.push(p);
      return acc;
    }, []);
  }, [totalPages, currentPage]);

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
        password: u.password,
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

  const openConfirm = useCallback((u: Usuario) => {
    if (USUARIOS_PROTEGIDOS.includes(u.correo)) {
      toast.error("Este usuario está protegido y no puede eliminarse");
      return;
    }
    setDeletingUsuario(u);
    setConfirmOpen(true);
  }, []);

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
          updateUsuario(editingUsuario.id, data);
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

  const handleDelete = useCallback(() => {
    if (deletingUsuario) {
      try {
        deleteUsuario(deletingUsuario.id);
        toast.success("Usuario eliminado correctamente");
        setConfirmOpen(false);
        setDeletingUsuario(null);
      } catch (error) {
        toast.error("Error al eliminar el usuario");
        console.error("Error deleting user:", error);
      }
    }
  }, [deletingUsuario, deleteUsuario]);

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
      `}</style>

      <div className="u-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
            background: "linear-gradient(135deg,#39A900,#2D7D00)",
            padding: "1.4rem 1.6rem",
            color: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(255,255,255,.07)",
              top: -80,
              right: -60,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                <Shield size={11} /> Gestión institucional
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem,3vw,2.2rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                Gestión de Usuarios
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra cuentas, accesos, roles y permisos del sistema.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                minWidth: 280,
              }}
            >
              {[
                { label: "Total", value: usuarios.length, icon: <Users size={11} /> },
                { label: "Activos", value: totalActivos, icon: <UserCheck size={11} /> },
                { label: "Inactivos", value: totalInactivos, icon: <UserX size={11} /> },
                { label: "Roles", value: uniqueRoles.length, icon: <Shield size={11} /> },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,.12)",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 12,
                    padding: "8px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: "rgba(255,255,255,.65)",
                      textTransform: "uppercase",
                      marginBottom: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                    }}
                  >
                    {s.icon} {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: COLORS.textLight,
              }}
            />
            <input
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
              aria-label="Buscar usuarios"
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as "todos" | "activo" | "inactivo")}
            style={{
              ...inputStyle,
              width: "auto",
              appearance: "none",
              paddingRight: 28,
              cursor: "pointer",
            }}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            style={{
              ...inputStyle,
              width: "auto",
              appearance: "none",
              paddingRight: 28,
              cursor: "pointer",
            }}
            aria-label="Filtrar por rol"
          >
            <option value="todos">Todos los roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              gap: 2,
              padding: 3,
              borderRadius: 11,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
            }}
            role="group"
            aria-label="Modo de visualización"
          >
            {(
              [
                { mode: "grid" as const, icon: <LayoutGrid size={14} />, label: "Cuadrícula" },
                { mode: "list" as const, icon: <List size={14} />, label: "Lista" },
              ]
            ).map((v) => (
              <button
                key={v.mode}
                type="button"
                onClick={() => handleViewModeChange(v.mode)}
                title={v.label}
                aria-label={v.label}
                aria-pressed={viewMode === v.mode}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  background: viewMode === v.mode ? "#fff" : "transparent",
                  color: viewMode === v.mode ? COLORS.primaryDark : COLORS.textLight,
                  boxShadow: viewMode === v.mode ? "0 1px 4px rgba(15,23,42,.1)" : "none",
                }}
              >
                {v.icon}
                <span className="u-view-label">{v.label}</span>
              </button>
            ))}
          </div>

          <button
            className="u-btn"
            onClick={openCreate}
            style={{
              padding: "10px 18px",
              borderRadius: 11,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 14px rgba(57,169,0,.25)",
            }}
          >
            <Plus size={15} /> Nuevo Usuario
          </button>
        </div>

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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
                gap: 12,
              }}
            >
              {paginated.map((u) => {
                const protegido = USUARIOS_PROTEGIDOS.includes(u.correo);
                const activo = u.estado === "activo";
                const roleStyle = getRoleAccent(u.rol);
                const [c1, c2] = avatarColors(u.nombre);
                const ini = initials(u.nombre);

                return (
                  <div
                    key={u.id}
                    className="u-card"
                    style={{
                      borderRadius: 16,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                    }}
                  >
                    <div
                      style={{
                        height: 3,
                        background: `linear-gradient(90deg,${roleStyle.dot},${roleStyle.dot}66)`,
                      }}
                    />

                    <div
                      style={{
                        padding: "14px 14px 10px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: `linear-gradient(135deg,${c1},${c2})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 900,
                          color: "#fff",
                          boxShadow: `0 3px 10px ${c1}44`,
                        }}
                      >
                        {ini}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: COLORS.text,
                                lineHeight: 1.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {sanitizeText(u.nombre)}
                            </p>
                            <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 1 }}>
                              {u.tipoDocumento} · {u.identificacion}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleEstado(u)}
                            title={activo ? "Desactivar" : "Activar"}
                            style={{
                              flexShrink: 0,
                              width: 36,
                              height: 20,
                              borderRadius: 999,
                              border: "none",
                              cursor: "pointer",
                              position: "relative",
                              background: activo ? COLORS.primary : "#CBD5E1",
                              transition: "background .2s",
                            }}
                            aria-label={activo ? "Desactivar usuario" : "Activar usuario"}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: 3,
                                left: activo ? 18 : 3,
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: "#fff",
                                transition: "left .2s",
                                boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                              }}
                            />
                          </button>
                        </div>

                        <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 5 }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 9px",
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                              background: roleStyle.bg,
                              color: roleStyle.text,
                              border: `1px solid ${roleStyle.border}`,
                            }}
                          >
                            <Shield size={9} /> {u.rol || "Sin rol"}
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 9px",
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: 0.3,
                              background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                              color: activo ? "#166534" : "#B91C1C",
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: activo ? COLORS.primary : "#EF4444",
                              }}
                            />
                            {u.estado}
                          </span>
                          {protegido && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 9px",
                                borderRadius: 999,
                                fontSize: 10,
                                fontWeight: 700,
                                background: "#FFFBEB",
                                color: "#92400E",
                                border: "1px solid #FDE68A",
                              }}
                            >
                              <Lock size={9} /> Protegido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "0 14px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {[
                        { icon: <Mail size={12} />, text: u.correo },
                        { icon: <Phone size={12} />, text: u.numero || "—" },
                      ].map((row, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            borderRadius: 9,
                            border: `1px solid ${COLORS.border}`,
                            background: COLORS.bg,
                            fontSize: 11,
                            color: COLORS.textLight,
                          }}
                        >
                          <span style={{ color: COLORS.textLight, flexShrink: 0 }}>{row.icon}</span>
                          <span
                            style={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        borderTop: `1px solid ${COLORS.border}`,
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 10,
                          color: COLORS.textLight,
                        }}
                      >
                        <UserCheck size={12} color={COLORS.primary} />
                        Registrado
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          {
                            icon: <Pencil size={12} />,
                            title: "Editar",
                            color: COLORS.textLight,
                            bg: COLORS.bg,
                            onClick: () => openEdit(u),
                          },
                          ...(!protegido
                            ? [
                                {
                                  icon: <Trash2 size={12} />,
                                  title: "Eliminar",
                                  color: "#EF4444",
                                  bg: "#FEF2F2",
                                  onClick: () => openConfirm(u),
                                },
                              ]
                            : []),
                        ].map((btn, i) => (
                          <button
                            key={i}
                            title={btn.title}
                            onClick={btn.onClick}
                            className="u-btn"
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              border: `1px solid ${COLORS.border}`,
                              background: btn.bg,
                              color: btn.color,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            aria-label={btn.title}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
            <div
              style={{
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(15,23,42,.05)",
              }}
            >
              <div
                className="u-list-header"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(200px,2fr) minmax(160px,1.4fr) 130px 110px 100px 90px",
                  gap: 10,
                  padding: "10px 14px",
                  background: COLORS.bg,
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: COLORS.textLight,
                }}
              >
                <span>Usuario</span>
                <span>Correo</span>
                <span>Documento</span>
                <span>Rol</span>
                <span>Estado</span>
                <span style={{ textAlign: "right" }}>Acciones</span>
              </div>

              {paginated.map((u, idx) => {
                const protegido = USUARIOS_PROTEGIDOS.includes(u.correo);
                const activo = u.estado === "activo";
                const roleStyle = getRoleAccent(u.rol);
                const [c1, c2] = avatarColors(u.nombre);
                const ini = initials(u.nombre);

                return (
                  <div
                    key={u.id}
                    className="u-list-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(200px,2fr) minmax(160px,1.4fr) 130px 110px 100px 90px",
                      gap: 10,
                      alignItems: "center",
                      padding: "10px 14px",
                      borderBottom: idx === paginated.length - 1 ? "none" : `1px solid ${COLORS.border}`,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          flexShrink: 0,
                          background: `linear-gradient(135deg,${c1},${c2})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#fff",
                        }}
                      >
                        {ini}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 800,
                            color: COLORS.text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {sanitizeText(u.nombre)}
                        </p>
                        {protegido && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#92400E",
                            }}
                          >
                            <Lock size={8} /> Protegido
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: COLORS.textLight,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={u.correo}
                    >
                      <Mail size={11} style={{ flexShrink: 0 }} />
                      {u.correo}
                    </div>

                    <div style={{ color: COLORS.textLight, fontSize: 11 }}>
                      {u.tipoDocumento} · {u.identificacion}
                    </div>

                    <div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 9px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          background: roleStyle.bg,
                          color: roleStyle.text,
                          border: `1px solid ${roleStyle.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Shield size={9} /> {u.rol || "Sin rol"}
                      </span>
                    </div>

                    <div>
                      <button
                        onClick={() => handleToggleEstado(u)}
                        title={activo ? "Desactivar" : "Activar"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 9px",
                          borderRadius: 999,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                          background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                          color: activo ? "#166534" : "#B91C1C",
                          fontFamily: "inherit",
                        }}
                        aria-label={activo ? "Desactivar usuario" : "Activar usuario"}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: activo ? COLORS.primary : "#EF4444",
                          }}
                        />
                        {u.estado}
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button
                        title="Editar"
                        onClick={() => openEdit(u)}
                        className="u-btn"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 7,
                          border: `1px solid ${COLORS.border}`,
                          background: COLORS.bg,
                          color: COLORS.textLight,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Editar"
                      >
                        <Pencil size={12} />
                      </button>
                      {!protegido && (
                        <button
                          title="Eliminar"
                          onClick={() => openConfirm(u)}
                          className="u-btn"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            border: `1px solid ${COLORS.border}`,
                            background: "#FEF2F2",
                            color: "#EF4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: COLORS.textLight }}>
                <span>
                  Mostrando{" "}
                  <strong style={{ color: COLORS.text }}>
                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}
                  </strong>{" "}
                  de <strong style={{ color: COLORS.text }}>{filtered.length}</strong>
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    ...inputStyle,
                    width: "auto",
                    padding: "6px 10px",
                    fontSize: 11,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                  aria-label="Usuarios por página"
                >
                  {(viewMode === "list" ? [15, 25, 50, 100] : [9, 18, 36, 60]).map((n) => (
                    <option key={n} value={n}>
                      {n} por página
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    className="u-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      color: currentPage === 1 ? COLORS.border : COLORS.text,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ← Anterior
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`e-${i}`} style={{ padding: "0 4px", color: COLORS.textLight, fontSize: 11 }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className="u-page-btn"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: p === currentPage ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                          background: p === currentPage ? COLORS.primary : "#fff",
                          color: p === currentPage ? "#fff" : COLORS.text,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="u-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      color: currentPage === totalPages ? COLORS.border : COLORS.text,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={640}>
        <UsuarioForm
          key={editingUsuario?.id ?? "new"}
          initial={formInitial}
          title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
          roles={roles}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingUsuario(null);
        }}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar al usuario "${deletingUsuario?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}
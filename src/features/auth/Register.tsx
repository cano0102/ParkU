import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  IdCard,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import {
  NOMBRE_MIN,
  NOMBRE_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  TELEFONO_REGEX,
  EMAIL_REGEX,
} from "@/utils/validation";

const COLORS = theme;

function useAnimated() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return visible;
}

interface FormState {
  nombre: string;
  correo: string;
  numero: string;
  tipoDocumento: string;
  identificacion: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
}

const emptyForm = (): FormState => ({
  nombre: "",
  correo: "",
  numero: "",
  tipoDocumento: "CC",
  identificacion: "",
  password: "",
  confirmPassword: "",
  aceptaTerminos: false,
});

interface ValidationErrors {
  nombre?: string;
  correo?: string;
  numero?: string;
  identificacion?: string;
  password?: string;
  confirmPassword?: string;
  aceptaTerminos?: string;
}

export function Register() {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const navigate = useNavigate();
  const visible = useAnimated();
  const { register } = useAuth();
  const primerCampoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primerCampoRef.current?.focus();
  }, []);

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setTelefono = (raw: string) => {
    set("numero", raw.replace(/[^0-9()+\-\s]/g, ""));
  };

  const setIdentificacion = (raw: string) => {
    set("identificacion", raw.replace(/[^0-9]/g, ""));
  };

  const validate = (f: FormState): ValidationErrors => {
    const nextErrors: ValidationErrors = {};
    const nombre = f.nombre.trim();
    const correo = f.correo.trim();
    const numero = f.numero.trim();
    const identificacion = f.identificacion.trim();

    if (!nombre) {
      nextErrors.nombre = "El nombre es obligatorio";
    } else if (nombre.length < NOMBRE_MIN) {
      nextErrors.nombre = `El nombre debe tener al menos ${NOMBRE_MIN} caracteres`;
    } else if (nombre.length > NOMBRE_MAX) {
      nextErrors.nombre = `El nombre no puede superar ${NOMBRE_MAX} caracteres`;
    }

    if (!correo) {
      nextErrors.correo = "El correo electrónico es obligatorio";
    } else if (!EMAIL_REGEX.test(correo)) {
      nextErrors.correo = "Ingresa un correo electrónico válido";
    }

    if (!numero) {
      nextErrors.numero = "El teléfono es obligatorio";
    } else if (!TELEFONO_REGEX.test(numero)) {
      nextErrors.numero = "El teléfono solo debe contener números (7 a 15 dígitos)";
    }

    if (!identificacion) {
      nextErrors.identificacion = "El número de identificación es obligatorio";
    } else if (identificacion.length < 6) {
      nextErrors.identificacion = "El número de identificación debe tener al menos 6 dígitos";
    }

    if (!f.password) {
      nextErrors.password = "La contraseña es obligatoria";
    } else if (f.password.length < PASSWORD_MIN || f.password.length > PASSWORD_MAX) {
      nextErrors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;
    }

    if (!f.confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña";
    } else if (f.confirmPassword !== f.password) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!f.aceptaTerminos) {
      nextErrors.aceptaTerminos = "Debes aceptar los términos para continuar";
    }

    return nextErrors;
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({
      nombre: true,
      correo: true,
      numero: true,
      identificacion: true,
      password: true,
      confirmPassword: true,
      aceptaTerminos: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      await register({
        correo: form.correo.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        numero: form.numero.trim(),
        tipoDocumento: form.tipoDocumento,
        identificacion: form.identificacion.trim(),
      });

      toast.success("¡Cuenta creada correctamente! Bienvenido a ParkU.");
      navigate("/app/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const err = (field: keyof FormState) => (touched[field] ? errors[field] : undefined);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Montserrat', sans-serif;
          background: ${COLORS.background};
        }

        .fade {
          opacity: 0;
          transform: translateY(30px);
          transition: 0.8s ease;
        }

        .fade.active {
          opacity: 1;
          transform: translateY(0);
        }

        input, select {
          font-family: 'Montserrat', sans-serif;
        }

        button {
          font-family: 'Montserrat', sans-serif;
          transition: 0.25s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        button:disabled {
          cursor: not-allowed;
        }

        input:focus, select:focus {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 4px rgba(57, 169, 0, 0.12);
        }

        input.input-error:focus {
          border-color: ${COLORS.danger} !important;
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 900px) {
          .register-grid {
            grid-template-columns: 1fr !important;
          }

          .register-left {
            display: none !important;
          }

          .mobile-back {
            display: flex !important;
            align-items: center;
            gap: 8px;
            width: max-content;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #ffffff 0%, #F3F8F1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.2rem",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* Fondo decorativo */}
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(57, 169, 0, 0.1)",
            top: -100,
            right: -100,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(57, 169, 0, 0.08)",
            bottom: -80,
            left: -80,
            filter: "blur(60px)",
          }}
        />

        <div
          className={`fade ${visible ? "active" : ""} register-grid`}
          style={{
            width: "100%",
            maxWidth: 900,
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            overflow: "hidden",
            borderRadius: 24,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 20px 55px rgba(15, 23, 42, 0.08)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Columna izquierda - Presentación */}
          <div
            className="register-left"
            style={{
              padding: "2rem 2.2rem",
              background: "linear-gradient(135deg, #39A900, #2D7D00)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                top: -100,
                right: -80,
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.14)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#fff",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <ArrowLeft size={15} />
                  Volver
                </button>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <img
                    src={logoSena}
                    alt="Logo SENA"
                    style={{
                      height: 46,
                      width: "auto",
                      filter: "brightness(0) invert(1)",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <h1
                  style={{
                    fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
                    lineHeight: 1,
                    fontWeight: 900,
                    marginBottom: "1rem",
                  }}
                >
                  Únete a ParkU
                </h1>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "rgba(255, 255, 255, 0.92)",
                    maxWidth: 420,
                  }}
                >
                  Crea tu cuenta institucional para gestionar tus reservas y
                  acceder al parqueadero del SENA.
                </p>

                <div
                  style={{
                    marginTop: "1.8rem",
                    display: "grid",
                    gap: "0.6rem",
                  }}
                >
                  {["Registro rápido y seguro", "Reserva tu celda en minutos", "Soporte institucional"].map(
                    (item) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "rgba(255, 255, 255, 0.08)",
                          padding: "10px 14px",
                          borderRadius: 12,
                        }}
                      >
                        <ShieldCheck size={17} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div
            style={{
              padding: "2rem clamp(1.5rem, 3vw, 2.5rem)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 420,
              }}
            >
              {/* Botón volver (móvil) */}
              <button
                type="button"
                className="mobile-back"
                onClick={() => navigate("/")}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  background: "#F1F5F9",
                  color: COLORS.text,
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <ArrowLeft size={15} />
                Volver
              </button>

              <div style={{ marginBottom: "1.3rem" }}>
                <div style={{ marginBottom: "0.8rem" }}>
                  <img
                    src={logoSena}
                    alt="Logo SENA"
                    style={{
                      height: 38,
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div
                  style={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    marginBottom: 10,
                    letterSpacing: 1,
                    fontSize: 12,
                  }}
                >
                  REGISTRO INSTITUCIONAL
                </div>

                <h2
                  style={{
                    fontSize: "clamp(1.6rem, 3.4vw, 2rem)",
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1,
                    marginBottom: "0.6rem",
                  }}
                >
                  Crear cuenta
                </h2>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.6,
                    fontSize: 13,
                  }}
                >
                  Completa tus datos para registrarte en el sistema ParkU.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* Tipo y número de documento (primero: se usan para identificar al aprendiz/docente antes que sus datos de contacto) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
                  <div>
                    <label htmlFor="register-tipo-doc" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                      Documento
                    </label>
                    <select
                      id="register-tipo-doc"
                      value={form.tipoDocumento}
                      onChange={(e) => set("tipoDocumento", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "13px 12px",
                        borderRadius: 12,
                        border: `1px solid ${COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none",
                      }}
                    >
                      <option value="CC">CC</option>
                      <option value="TI">TI</option>
                      <option value="CE">CE</option>
                      <option value="PPTE">PPTE</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="register-identificacion" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                      N.º de identificación
                    </label>
                    <div style={{ position: "relative" }}>
                      <IdCard size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input
                        id="register-identificacion"
                        ref={primerCampoRef}
                        type="text"
                        inputMode="numeric"
                        value={form.identificacion}
                        onChange={(e) => setIdentificacion(e.target.value)}
                        onBlur={() => handleBlur("identificacion")}
                        placeholder="1001234567"
                        className={err("identificacion") ? "input-error" : ""}
                        aria-invalid={!!err("identificacion")}
                        style={{
                          width: "100%",
                          padding: "13px 14px 13px 38px",
                          borderRadius: 12,
                          border: `1px solid ${err("identificacion") ? COLORS.danger : COLORS.border}`,
                          background: "#fff",
                          fontSize: 14,
                          outline: "none",
                          transition: "border-color .2s",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {err("identificacion") && (
                  <p role="alert" style={{ marginTop: -6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <AlertCircle size={13} />
                    {errors.identificacion}
                  </p>
                )}

                {/* Nombre completo */}
                <div>
                  <label htmlFor="register-nombre" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                    Nombre Completo
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="register-nombre"
                      type="text"
                      autoComplete="name"
                      value={form.nombre}
                      onChange={(e) => set("nombre", e.target.value)}
                      onBlur={() => handleBlur("nombre")}
                      placeholder="Ej. Juan Pérez"
                      className={err("nombre") ? "input-error" : ""}
                      aria-invalid={!!err("nombre")}
                      style={{
                        width: "100%",
                        padding: "13px 16px 13px 42px",
                        borderRadius: 12,
                        border: `1px solid ${err("nombre") ? COLORS.danger : COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />
                  </div>
                  {err("nombre") && (
                    <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Correo */}
                <div>
                  <label htmlFor="register-email" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                    Correo Electrónico
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="register-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.correo}
                      onChange={(e) => set("correo", e.target.value)}
                      onBlur={() => handleBlur("correo")}
                      placeholder="correo@sena.edu.co"
                      className={err("correo") ? "input-error" : ""}
                      aria-invalid={!!err("correo")}
                      style={{
                        width: "100%",
                        padding: "13px 16px 13px 42px",
                        borderRadius: 12,
                        border: `1px solid ${err("correo") ? COLORS.danger : COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />
                  </div>
                  {err("correo") && (
                    <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} />
                      {errors.correo}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="register-telefono" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                    Teléfono
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="register-telefono"
                      type="tel"
                      autoComplete="tel"
                      value={form.numero}
                      onChange={(e) => setTelefono(e.target.value)}
                      onBlur={() => handleBlur("numero")}
                      placeholder="3101234567"
                      className={err("numero") ? "input-error" : ""}
                      aria-invalid={!!err("numero")}
                      style={{
                        width: "100%",
                        padding: "13px 16px 13px 42px",
                        borderRadius: 12,
                        border: `1px solid ${err("numero") ? COLORS.danger : COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />
                  </div>
                  {err("numero") && (
                    <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} />
                      {errors.numero}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="register-password" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                    Contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="••••••••"
                      className={err("password") ? "input-error" : ""}
                      aria-invalid={!!err("password")}
                      style={{
                        width: "100%",
                        padding: "13px 48px 13px 42px",
                        borderRadius: 12,
                        border: `1px solid ${err("password") ? COLORS.danger : COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: 14,
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: COLORS.textLight,
                        padding: 2,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {err("password") ? (
                    <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} />
                      {errors.password}
                    </p>
                  ) : (
                    <p style={{ marginTop: 6, fontSize: 11, color: COLORS.textLight }}>
                      Mínimo {PASSWORD_MIN} caracteres.
                    </p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label htmlFor="register-confirm-password" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
                    Confirmar Contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      placeholder="••••••••"
                      className={err("confirmPassword") ? "input-error" : ""}
                      aria-invalid={!!err("confirmPassword")}
                      style={{
                        width: "100%",
                        padding: "13px 48px 13px 42px",
                        borderRadius: 12,
                        border: `1px solid ${err("confirmPassword") ? COLORS.danger : COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: 14,
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: COLORS.textLight,
                        padding: 2,
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {err("confirmPassword") && (
                    <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Términos */}
                <div>
                  <label
                    htmlFor="register-terminos"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 12.5,
                      color: COLORS.textLight,
                      fontWeight: 600,
                      userSelect: "none",
                    }}
                  >
                    <input
                      id="register-terminos"
                      type="checkbox"
                      checked={form.aceptaTerminos}
                      onChange={(e) => set("aceptaTerminos", e.target.checked)}
                      style={{
                        width: 15,
                        height: 15,
                        marginTop: 1,
                        accentColor: COLORS.primary,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    Acepto los términos y el tratamiento de mis datos personales
                    conforme a la política institucional del SENA.
                  </label>
                  {err("aceptaTerminos") && (
                    <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} />
                      {errors.aceptaTerminos}
                    </p>
                  )}
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    background: loading ? "#94A3B8" : COLORS.primary,
                    color: "#fff",
                    padding: "14px 20px",
                    borderRadius: 14,
                    fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: loading ? "none" : "0 8px 22px rgba(57, 169, 0, 0.2)",
                    opacity: loading ? 0.7 : 1,
                    marginTop: 4,
                  }}
                >
                  {loading && <Loader2 size={16} className="spin" />}
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>

              {/* Footer */}
              <div
                style={{
                  marginTop: "1.2rem",
                  paddingTop: "1.2rem",
                  borderTop: `1px solid ${COLORS.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <p style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 600 }}>
                  ¿Ya tienes una cuenta?{" "}
                  <Link to="/login" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: 800 }}>
                    Inicia sesión
                  </Link>
                </p>
                <p style={{ textAlign: "center", color: COLORS.textLight, fontSize: 12 }}>
                  © {new Date().getFullYear()} · Plataforma Institucional ParkU
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

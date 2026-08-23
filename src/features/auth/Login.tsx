import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/theme";

const COLORS = theme;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = "parku_remembered_email";

function useAnimated() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return visible;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const navigate = useNavigate();
  const visible = useAnimated();
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Precarga el correo recordado
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
    emailInputRef.current?.focus();
  }, []);

  // Validaciones en tiempo real
  useEffect(() => {
    if (touched.email) validateEmail(email);
    if (touched.password) validatePassword(password);
  }, [email, password, touched]);

  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim();

    if (!trimmed) {
      setErrors((prev) => ({ ...prev, email: "El correo electrónico es obligatorio" }));
      return false;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setErrors((prev) => ({ ...prev, email: "Ingresa un correo electrónico válido" }));
      return false;
    }

    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, password: "La contraseña es obligatoria" }));
      return false;
    }

    if (value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "La contraseña debe tener al menos 6 caracteres" }));
      return false;
    }

    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    setTouched({ email: true, password: true });

    return isEmailValid && isPasswordValid;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      validateEmail(email);
    } else {
      validatePassword(password);
    }
  };

  const handlePasswordKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  // ============================================================
  // LOGIN CON FIREBASE
  // ============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    const trimmedEmail = email.trim();
    setLoading(true);

    try {
      await login(trimmedEmail, password);

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, trimmedEmail);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      toast.success("¡Bienvenido! Redirigiendo...");
      navigate("/app/dashboard");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);

      const errorCode = error?.code;
      let mensaje = "Ocurrió un error inesperado. Intenta de nuevo.";

      switch (errorCode) {
        case "auth/user-not-found":
          mensaje = "No existe una cuenta con este correo.";
          break;
        case "auth/wrong-password":
          mensaje = "Contraseña incorrecta. Verifica tus credenciales.";
          break;
        case "auth/invalid-credential":
          mensaje = "Correo o contraseña incorrectos.";
          break;
        case "auth/invalid-email":
          mensaje = "El formato del correo no es válido.";
          break;
        case "auth/user-disabled":
          mensaje = "Esta cuenta ha sido deshabilitada. Contacta al administrador.";
          break;
        case "auth/too-many-requests":
          mensaje = "Demasiados intentos fallidos. Intenta más tarde.";
          break;
        case "auth/network-request-failed":
          mensaje = "Error de conexión. Verifica tu red e intenta de nuevo.";
          break;
        default:
          mensaje = error?.message || mensaje;
      }

      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormatValid = EMAIL_REGEX.test(email.trim());
  const isPasswordFormatValid = password.length >= 6;
  const isFormValid = isEmailFormatValid && isPasswordFormatValid;

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

        input {
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

        input:focus {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 4px rgba(57, 169, 0, 0.12);
        }

        input.input-error:focus {
          border-color: ${COLORS.danger} !important;
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        .shake {
          animation: shake 0.5s;
        }

        @media (max-width: 900px) {
          .login-grid {
            grid-template-columns: 1fr !important;
          }

          .login-left {
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
          className={`fade ${visible ? "active" : ""} login-grid`}
          style={{
            width: "100%",
            maxWidth: 820,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
            className="login-left"
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
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    lineHeight: 0.95,
                    fontWeight: 900,
                    marginBottom: "1rem",
                  }}
                >
                  Bienvenido a ParkU
                </h1>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "rgba(255, 255, 255, 0.92)",
                    maxWidth: 420,
                  }}
                >
                  Sistema institucional para la gestión inteligente de parqueaderos,
                  accesos y monitoreo vehicular del SENA.
                </p>

                <div
                  style={{
                    marginTop: "1.8rem",
                    display: "grid",
                    gap: "0.6rem",
                  }}
                >
                  {["Control de acceso seguro", "Monitoreo en tiempo real", "Gestión automatizada"].map(
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
                maxWidth: 360,
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

              <div style={{ marginBottom: "1.5rem" }}>
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
                  ACCESO INSTITUCIONAL
                </div>

                <h2
                  style={{
                    fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1,
                    marginBottom: "0.6rem",
                  }}
                >
                  Iniciar Sesión
                </h2>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.6,
                    fontSize: 13,
                  }}
                >
                  Ingresa tus credenciales institucionales para acceder al sistema
                  ParkU.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
                noValidate
              >
                {/* Campo email */}
                <div>
                  <label
                    htmlFor="login-email"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 700,
                      color: COLORS.text,
                      fontSize: 13,
                    }}
                  >
                    Correo Electrónico
                  </label>

                  <div style={{ position: "relative" }}>
                    <Mail
                      size={16}
                      color={COLORS.textLight}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 16,
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />

                    <input
                      id="login-email"
                      ref={emailInputRef}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="correo@sena.edu.co"
                      className={errors.email && touched.email ? "input-error" : ""}
                      aria-invalid={!!(errors.email && touched.email)}
                      aria-describedby={errors.email && touched.email ? "login-email-error" : undefined}
                      style={{
                        width: "100%",
                        padding: "14px 16px 14px 42px",
                        borderRadius: 12,
                        border: `1px solid ${
                          errors.email && touched.email ? COLORS.danger : COLORS.border
                        }`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />
                  </div>

                  {errors.email && touched.email && (
                    <p
                      id="login-email-error"
                      role="alert"
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: COLORS.danger,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <AlertCircle size={13} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Campo password */}
                <div>
                  <label
                    htmlFor="login-password"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 700,
                      color: COLORS.text,
                      fontSize: 13,
                    }}
                  >
                    Contraseña
                  </label>

                  <div style={{ position: "relative" }}>
                    <Lock
                      size={16}
                      color={COLORS.textLight}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 16,
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      onKeyUp={handlePasswordKeyEvent}
                      onKeyDown={handlePasswordKeyEvent}
                      placeholder="••••••••"
                      className={errors.password && touched.password ? "input-error" : ""}
                      aria-invalid={!!(errors.password && touched.password)}
                      aria-describedby={errors.password && touched.password ? "login-password-error" : undefined}
                      style={{
                        width: "100%",
                        padding: "14px 48px 14px 42px",
                        borderRadius: 12,
                        border: `1px solid ${
                          errors.password && touched.password ? COLORS.danger : COLORS.border
                        }`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                        transition: "border-color .2s",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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

                  {capsLockOn && (
                    <p
                      role="status"
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#B45309",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <AlertTriangle size={13} />
                      Bloq Mayús está activado
                    </p>
                  )}

                  {errors.password && touched.password && (
                    <p
                      id="login-password-error"
                      role="alert"
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: COLORS.danger,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <AlertCircle size={13} />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Recordarme + Olvidé contraseña */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.6rem 1rem",
                  }}
                >
                  <label
                    htmlFor="login-remember"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      color: COLORS.textLight,
                      fontWeight: 600,
                      userSelect: "none",
                    }}
                  >
                    <input
                      id="login-remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: 15,
                        height: 15,
                        accentColor: COLORS.primary,
                        cursor: "pointer",
                      }}
                    />
                    Recordarme
                  </label>

                  <Link
                    to="/forgot-password"
                    style={{
                      color: COLORS.primary,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  style={{
                    border: "none",
                    background: loading || !isFormValid ? "#94A3B8" : COLORS.primary,
                    color: "#fff",
                    padding: "14px 20px",
                    borderRadius: 14,
                    fontWeight: 800,
                    cursor: loading || !isFormValid ? "not-allowed" : "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow:
                      loading || !isFormValid ? "none" : "0 8px 22px rgba(57, 169, 0, 0.2)",
                    opacity: loading || !isFormValid ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 size={16} className="spin" />}
                  {loading ? "Verificando..." : "Ingresar"}
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
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: 800 }}>
                    Regístrate
                  </Link>
                </p>
                <p
                  style={{
                    textAlign: "center",
                    color: COLORS.textLight,
                    fontSize: 12,
                  }}
                >
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

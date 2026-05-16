import React, { useState } from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  BadgeCheck,
  LockKeyhole,
} from "lucide-react";

import {
  confirmPasswordReset,
} from "firebase/auth";

import { auth } from "../../firebase/config";

import { toast } from "sonner";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  background: "#F5F7F8",
  surface: "#FFFFFF",
  text: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
};

export function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const oobCode =
    searchParams.get("oobCode");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!oobCode) {
      toast.error(
        "Código inválido o expirado"
      );
      return;
    }

    if (password.length < 8) {
      toast.error(
        "La contraseña debe tener mínimo 8 caracteres"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "Las contraseñas no coinciden"
      );
      return;
    }

    try {
      setLoading(true);

      await confirmPasswordReset(
        auth,
        oobCode,
        password
      );

      toast.success(
        "Contraseña actualizada correctamente"
      );

      navigate("/login");
    } catch (error) {
      console.error(error);

      toast.error(
        "El enlace expiró o es inválido"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`

      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      body{
        font-family:'Montserrat',sans-serif;
        background:${COLORS.background};
      }

      input{
        font-family:'Montserrat',sans-serif;
      }

      button{
        font-family:'Montserrat',sans-serif;
        transition:.25s ease;
      }

      button:hover{
        transform:translateY(-2px);
      }

      input:focus{
        border-color:${COLORS.primary} !important;
        box-shadow:0 0 0 4px rgba(57,169,0,.12);
      }

      @media(max-width:900px){

        .reset-grid{
          grid-template-columns:1fr !important;
        }

        .reset-left{
          display:none !important;
        }

      }

      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg,#ffffff 0%,#F3F8F1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG */}

        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "rgba(57,169,0,.08)",
            top: -120,
            right: -120,
            filter: "blur(10px)",
          }}
        />

        {/* CARD */}

        <div
          className="reset-grid"
          style={{
            width: "100%",
            maxWidth: 1180,
            display: "grid",
            gridTemplateColumns:
              "1fr .9fr",
            overflow: "hidden",
            borderRadius: 36,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow:
              "0 25px 70px rgba(15,23,42,.08)",
          }}
        >
          {/* LEFT */}

          <div
            className="reset-left"
            style={{
              padding: "3rem 4rem",
              background:
                "linear-gradient(135deg,#39A900,#2D7D00)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* BG CIRCLE */}

            <div
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,.08)",
                top: -150,
                right: -120,
              }}
            />

            {/* CONTENT */}

            <div
              style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* TOP */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  marginBottom: "3rem",
                }}
              >
                <button
                  onClick={() =>
                    navigate("/login")
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 18px",
                    background:
                      "rgba(255,255,255,.14)",
                    border:
                      "1px solid rgba(255,255,255,.12)",
                    color: "#fff",
                    borderRadius: 14,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    backdropFilter:
                      "blur(10px)",
                  }}
                >
                  <ArrowLeft size={16} />
                  Volver
                </button>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background:
                      "rgba(255,255,255,.12)",
                    padding: "10px 18px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  <BadgeCheck size={18} />
                  Plataforma Oficial SENA
                </div>
              </div>

              {/* TITLE */}

              <h1
                style={{
                  fontSize:
                    "clamp(3rem,5vw,5rem)",
                  lineHeight: 0.95,
                  fontWeight: 900,
                  marginBottom: "2rem",
                }}
              >
                Nueva
                <br />
                Contraseña
              </h1>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.8,
                  color:
                    "rgba(255,255,255,.92)",
                  maxWidth: 500,
                }}
              >
                Protege tu cuenta
                institucional actualizando
                tu contraseña de acceso al
                sistema ParkU.
              </p>

              {/* FEATURES */}

              <div
                style={{
                  marginTop: "4rem",
                  display: "grid",
                  gap: "1rem",
                }}
              >
                {[
                  "Acceso institucional seguro",
                  "Protección de credenciales",
                  "Sistema protegido ParkU",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background:
                        "rgba(255,255,255,.08)",
                      padding: "16px 18px",
                      borderRadius: 18,
                    }}
                  >
                    <ShieldCheck
                      size={20}
                    />

                    <span
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div
            style={{
              padding:
                "4rem clamp(2rem,4vw,4rem)",
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
              {/* HEADER */}

              <div
                style={{
                  marginBottom: "2.5rem",
                }}
              >
                <div
                  style={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    marginBottom: 14,
                    letterSpacing: 1,
                  }}
                >
                  SEGURIDAD DE ACCESO
                </div>

                <h2
                  style={{
                    fontSize:
                      "clamp(2.5rem,5vw,3.5rem)",
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1,
                    marginBottom: "1rem",
                  }}
                >
                  Restablecer
                  <br />
                  acceso
                </h2>

                <p
                  style={{
                    color:
                      COLORS.textLight,
                    lineHeight: 1.8,
                  }}
                >
                  Ingresa y confirma tu nueva
                  contraseña para recuperar
                  el acceso al sistema.
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.4rem",
                }}
              >
                {/* PASSWORD */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 10,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    Nueva Contraseña
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      required
                      style={{
                        width: "100%",
                        padding:
                          "18px 55px 18px 18px",
                        borderRadius: 16,
                        border: `1px solid ${COLORS.border}`,
                        background: "#fff",
                        fontSize: 15,
                        outline: "none",
                        transition:
                          ".25s ease",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        top: "50%",
                        right: 16,
                        transform:
                          "translateY(-50%)",
                        background:
                          "transparent",
                        border: "none",
                        cursor: "pointer",
                        color:
                          COLORS.textLight,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 10,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    Confirmar Contraseña
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      required
                      style={{
                        width: "100%",
                        padding:
                          "18px 55px 18px 18px",
                        borderRadius: 16,
                        border: `1px solid ${COLORS.border}`,
                        background: "#fff",
                        fontSize: 15,
                        outline: "none",
                        transition:
                          ".25s ease",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        top: "50%",
                        right: 16,
                        transform:
                          "translateY(-50%)",
                        background:
                          "transparent",
                        border: "none",
                        cursor: "pointer",
                        color:
                          COLORS.textLight,
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* REQUIREMENTS */}

                <div
                  style={{
                    background: "#F8FAFC",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 18,
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                      fontWeight: 800,
                      color: COLORS.text,
                    }}
                  >
                    <LockKeyhole
                      size={18}
                    />
                    Requisitos de seguridad
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        color:
                          password.length >= 8
                            ? COLORS.primary
                            : COLORS.textLight,
                        fontWeight: 600,
                      }}
                    >
                      • Mínimo 8 caracteres
                    </div>

                    <div
                      style={{
                        color:
                          password ===
                            confirmPassword &&
                          password
                            ? COLORS.primary
                            : COLORS.textLight,
                        fontWeight: 600,
                      }}
                    >
                      • Las contraseñas
                      coinciden
                    </div>
                  </div>
                </div>

                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    background:
                      loading
                        ? "#94A3B8"
                        : COLORS.primary,
                    color: "#fff",
                    padding:
                      "18px 24px",
                    borderRadius: 18,
                    fontWeight: 800,
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: 10,
                    fontSize: 15,
                    boxShadow:
                      "0 10px 25px rgba(57,169,0,.2)",
                  }}
                >
                  {loading
                    ? "Actualizando..."
                    : "Actualizar Contraseña"}
                </button>
              </form>

              {/* FOOTER */}

              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button
                    style={{
                      width: "100%",
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      color: COLORS.text,
                      padding:
                        "18px 24px",
                      borderRadius: 18,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      gap: 10,
                      fontSize: 15,
                    }}
                  >
                    <ArrowLeft size={18} />
                    Volver al Login
                  </button>
                </Link>

                <div
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#ECFDF3",
                    padding: "16px 18px",
                    borderRadius: 16,
                    color:
                      COLORS.primaryDark,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <ShieldCheck
                    size={18}
                  />
                  Plataforma protegida y
                  segura
                </div>

                <p
                  style={{
                    marginTop: "1.5rem",
                    textAlign: "center",
                    color:
                      COLORS.textLight,
                    fontSize: 13,
                  }}
                >
                  © 2026 · Plataforma
                  Institucional ParkU
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
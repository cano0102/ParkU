import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

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

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      toast.success("Enlace de recuperación enviado");
    }, 1500);
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

          .forgot-grid{
            grid-template-columns:1fr !important;
          }

          .forgot-left{
            display:none !important;
          }

          .mobile-back{
            display:flex !important;
            align-items:center;
            gap:8px;
            width:max-content;
            margin-bottom:1.5rem;
          }

        }

      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#ffffff 0%,#F3F8F1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG */}
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(57,169,0,.07)",
            top: -100,
            right: -100,
            filter: "blur(10px)",
          }}
        />

        <div
          className="forgot-grid"
          style={{
            width: "100%",
            maxWidth: 820,
            maxHeight: "92vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
            borderRadius: 24,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 20px 55px rgba(15,23,42,.08)",
          }}
        >
          {/* LEFT */}
          <div
            className="forgot-left"
            style={{
              padding: "2rem 2.2rem",
              background: "linear-gradient(135deg,#39A900,#2D7D00)",
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
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
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
              {/* TOP BAR */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,.14)",
                    border: "1px solid rgba(255,255,255,.12)",
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

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,.12)",
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  <BadgeCheck size={15} />
                  Plataforma Oficial
                </div>
              </div>

              {/* SENA LOGO */}
              <div style={{ marginBottom: "1rem" }}>
                <img
                  src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
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
                  fontSize: "clamp(2rem,4vw,3rem)",
                  lineHeight: 0.95,
                  fontWeight: 900,
                  marginBottom: "1rem",
                }}
              >
                Recupera
                <br />
                tu acceso
              </h1>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,.92)",
                  maxWidth: 420,
                }}
              >
                Recupera el acceso a tu cuenta institucional de ParkU mediante
                un enlace seguro enviado a tu correo electrónico.
              </p>

              {/* FEATURES */}
              <div
                style={{
                  marginTop: "1.8rem",
                  display: "grid",
                  gap: "0.6rem",
                }}
              >
                {[
                  "Enlace seguro y privado",
                  "Recuperación rápida",
                  "Protección institucional",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "rgba(255,255,255,.08)",
                      padding: "10px 14px",
                      borderRadius: 12,
                    }}
                  >
                    <ShieldCheck size={17} />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{
              padding: "2rem clamp(1.5rem,3vw,2.5rem)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            <div style={{ width: "100%", maxWidth: 360 }}>

              {/* MOBILE BACK */}
              <button
                type="button"
                className="mobile-back"
                onClick={() => navigate("/login")}
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

              {!emailSent ? (
                <>
                  {/* HEADER */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    {/* SENA LOGO */}
                    <div style={{ marginBottom: "0.8rem" }}>
                      <img
                        src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
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
                      RECUPERACIÓN
                    </div>

                    <h2
                      style={{
                        fontSize: "clamp(1.8rem,4vw,2.4rem)",
                        fontWeight: 900,
                        color: COLORS.text,
                        lineHeight: 1,
                        marginBottom: "0.6rem",
                      }}
                    >
                      ¿Olvidaste
                      <br />
                      tu contraseña?
                    </h2>

                    <p
                      style={{
                        color: COLORS.textLight,
                        lineHeight: 1.6,
                        fontSize: 13,
                      }}
                    >
                      Ingresa tu correo institucional y te enviaremos un enlace
                      para recuperar tu acceso.
                    </p>
                  </div>

                  {/* FORM */}
                  <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    <div>
                      <label
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
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 14,
                            transform: "translateY(-50%)",
                            color: COLORS.textLight,
                          }}
                        />
                        <input
                          type="email"
                          placeholder="correo@sena.edu.co"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "14px 16px 14px 40px",
                            borderRadius: 12,
                            border: `1px solid ${COLORS.border}`,
                            background: "#fff",
                            fontSize: 14,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* INFO */}
                    <div
                      style={{
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          color: "#1E3A8A",
                          lineHeight: 1.6,
                          fontWeight: 500,
                        }}
                      >
                        Se enviará un enlace de recuperación a tu correo. El
                        enlace será válido por 24 horas.
                      </p>
                    </div>

                    {/* SUBMIT */}
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
                        boxShadow: "0 8px 22px rgba(57,169,0,.2)",
                      }}
                    >
                      {loading ? "Enviando..." : "Enviar Enlace"}
                    </button>

                    {/* BACK */}
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <button
                        type="button"
                        style={{
                          width: "100%",
                          border: `1px solid ${COLORS.border}`,
                          background: "#fff",
                          color: COLORS.text,
                          padding: "14px 20px",
                          borderRadius: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          fontSize: 13,
                        }}
                      >
                        <ArrowLeft size={15} />
                        Volver al Login
                      </button>
                    </Link>
                  </form>
                </>
              ) : (
                /* SUCCESS STATE */
                <div style={{ textAlign: "center" }}>
                  {/* SENA LOGO */}
                  <div style={{ marginBottom: "0.8rem" }}>
                    <img
                      src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
                      alt="Logo SENA"
                      style={{ height: 38, width: "auto", objectFit: "contain" }}
                    />
                  </div>

                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#ECFDF3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.2rem",
                    }}
                  >
                    <Mail size={34} color={COLORS.primary} />
                  </div>

                  <h2
                    style={{
                      fontSize: "clamp(1.8rem,4vw,2.4rem)",
                      fontWeight: 900,
                      color: COLORS.text,
                      marginBottom: 10,
                      lineHeight: 1,
                    }}
                  >
                    Correo
                    <br />
                    enviado
                  </h2>

                  <p
                    style={{
                      color: COLORS.textLight,
                      lineHeight: 1.6,
                      fontSize: 13,
                      marginBottom: "1rem",
                    }}
                  >
                    Hemos enviado un enlace de recuperación a:
                  </p>

                  <div
                    style={{
                      background: "#F8FAFC",
                      border: `1px solid ${COLORS.border}`,
                      padding: "14px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 13,
                      color: COLORS.text,
                      marginBottom: "1rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {email}
                  </div>

                  <div
                    style={{
                      background: "#ECFDF3",
                      padding: "14px 16px",
                      borderRadius: 12,
                      textAlign: "left",
                      marginBottom: "1.2rem",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        color: COLORS.primaryDark,
                        marginBottom: 8,
                        fontSize: 13,
                      }}
                    >
                      Recomendaciones
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gap: 6,
                        color: COLORS.primaryDark,
                        fontSize: 13,
                      }}
                    >
                      <span>• Revisa tu bandeja de entrada</span>
                      <span>• Verifica spam o promociones</span>
                      <span>• El enlace expira en 24h</span>
                    </div>
                  </div>

                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        width: "100%",
                        border: "none",
                        background: COLORS.primary,
                        color: "#fff",
                        padding: "14px 20px",
                        borderRadius: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 8px 22px rgba(57,169,0,.2)",
                      }}
                    >
                      <ArrowLeft size={15} />
                      Volver al Login
                    </button>
                  </Link>
                </div>
              )}

              {/* FOOTER */}
              <div
                style={{
                  marginTop: "1.2rem",
                  paddingTop: "1.2rem",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <p
                  style={{
                    textAlign: "center",
                    color: COLORS.textLight,
                    fontSize: 12,
                  }}
                >
                  © 2026 · Plataforma Institucional ParkU
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
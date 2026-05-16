import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  ParkingCircle,
  ArrowLeft,
  Mail,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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

  const [loading, setLoading] =
    useState(false);

  const [emailSent, setEmailSent] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    // Simulación
    setTimeout(() => {
      setLoading(false);

      setEmailSent(true);

      toast.success(
        "Enlace de recuperación enviado"
      );
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
          box-shadow:0 0 0 4px rgba(57,169,0,.12) !important;
        }

        @media(max-width:900px){

          .forgot-left{
            display:none !important;
          }

          .forgot-grid{
            grid-template-columns:1fr !important;
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

        <div
          className="forgot-grid"
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
            className="forgot-left"
            style={{
              padding: "4rem",
              background:
                "linear-gradient(135deg,#39A900,#2D7D00)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
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

            <div
              style={{
                position: "relative",
                zIndex: 2,
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
                <Link to="/login">
                  <button
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
                </Link>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background:
                      "rgba(255,255,255,.12)",
                    padding:
                      "10px 18px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  <BadgeCheck
                    size={18}
                  />
                  Plataforma Oficial
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
                Recupera
                <br />
                tu acceso
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
                Recupera el acceso a tu
                cuenta institucional de
                ParkU mediante un enlace
                seguro enviado a tu
                correo electrónico.
              </p>

              {/* CARDS */}

              <div
                style={{
                  marginTop: "4rem",
                  display: "grid",
                  gap: "1rem",
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
                      gap: 12,
                      background:
                        "rgba(255,255,255,.08)",
                      padding:
                        "16px 18px",
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
                maxWidth: 430,
              }}
            >
              {!emailSent ? (
                <>
                  {/* HEADER */}

                  <div
                    style={{
                      marginBottom:
                        "2.5rem",
                    }}
                  >
                    <div
                      style={{
                        color:
                          COLORS.primary,
                        fontWeight: 800,
                        marginBottom: 14,
                        letterSpacing: 1,
                      }}
                    >
                      RECUPERACIÓN
                    </div>

                    <h2
                      style={{
                        fontSize:
                          "clamp(2.5rem,5vw,3.5rem)",
                        fontWeight: 900,
                        color:
                          COLORS.text,
                        lineHeight: 1,
                        marginBottom:
                          "1rem",
                      }}
                    >
                      ¿Olvidaste
                      <br />
                      tu contraseña?
                    </h2>

                    <p
                      style={{
                        color:
                          COLORS.textLight,
                        lineHeight: 1.8,
                      }}
                    >
                      Ingresa tu correo
                      institucional y te
                      enviaremos un enlace
                      para recuperar tu
                      acceso.
                    </p>
                  </div>

                  {/* FORM */}

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <Label
                        htmlFor="email"
                        style={{
                          display:
                            "block",
                          marginBottom: 10,
                          fontWeight: 700,
                          color:
                            COLORS.text,
                        }}
                      >
                        Correo Electrónico
                      </Label>

                      <div
                        style={{
                          position:
                            "relative",
                        }}
                      >
                        <Mail
                          size={18}
                          style={{
                            position:
                              "absolute",
                            top: "50%",
                            left: 18,
                            transform:
                              "translateY(-50%)",
                            color:
                              COLORS.textLight,
                          }}
                        />

                        <Input
                          id="email"
                          type="email"
                          placeholder="correo@sena.edu.co"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target
                                .value
                            )
                          }
                          required
                          className="h-14"
                          style={{
                            borderRadius: 16,
                            border: `1px solid ${COLORS.border}`,
                            paddingLeft: 50,
                            fontSize: 15,
                          }}
                        />
                      </div>
                    </div>

                    {/* INFO */}

                    <div
                      style={{
                        background:
                          "#EFF6FF",
                        border:
                          "1px solid #BFDBFE",
                        borderRadius: 18,
                        padding: 18,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          color:
                            "#1E3A8A",
                          lineHeight: 1.7,
                          fontWeight: 500,
                        }}
                      >
                        Se enviará un
                        enlace de
                        recuperación a tu
                        correo. El enlace
                        será válido por 24
                        horas.
                      </p>
                    </div>

                    {/* BUTTON */}

                    <Button
                      type="submit"
                      disabled={
                        loading
                      }
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
                        fontSize: 15,
                        height: 58,
                        boxShadow:
                          "0 10px 25px rgba(57,169,0,.2)",
                      }}
                    >
                      {loading
                        ? "Enviando..."
                        : "Enviar Enlace"}
                    </Button>
                  </form>

                  {/* FOOTER */}

                  <div
                    style={{
                      marginTop:
                        "2rem",
                    }}
                  >
                    <Link
                      to="/login"
                      style={{
                        textDecoration:
                          "none",
                      }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full"
                        style={{
                          height: 54,
                          borderRadius: 16,
                          fontWeight: 700,
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Login
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* SUCCESS */}

                  <div
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius:
                          "50%",
                        background:
                          "#ECFDF3",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        margin:
                          "0 auto 2rem",
                      }}
                    >
                      <Mail
                        size={42}
                        color={
                          COLORS.primary
                        }
                      />
                    </div>

                    <h2
                      style={{
                        fontSize:
                          "2.7rem",
                        fontWeight: 900,
                        color:
                          COLORS.text,
                        marginBottom: 18,
                        lineHeight: 1,
                      }}
                    >
                      Correo
                      <br />
                      enviado
                    </h2>

                    <p
                      style={{
                        color:
                          COLORS.textLight,
                        lineHeight: 1.8,
                        marginBottom:
                          "2rem",
                      }}
                    >
                      Hemos enviado un
                      enlace de
                      recuperación a:
                    </p>

                    <div
                      style={{
                        background:
                          "#F8FAFC",
                        border: `1px solid ${COLORS.border}`,
                        padding:
                          "18px 20px",
                        borderRadius: 18,
                        fontWeight: 700,
                        color:
                          COLORS.text,
                        marginBottom:
                          "2rem",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {email}
                    </div>

                    <div
                      style={{
                        background:
                          "#ECFDF3",
                        padding: 20,
                        borderRadius: 18,
                        textAlign:
                          "left",
                        marginBottom:
                          "2rem",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 700,
                          color:
                            COLORS.primaryDark,
                          marginBottom: 10,
                        }}
                      >
                        Recomendaciones
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gap: 8,
                          color:
                            COLORS.primaryDark,
                          fontSize: 14,
                        }}
                      >
                        <span>
                          • Revisa tu
                          bandeja de
                          entrada
                        </span>

                        <span>
                          • Verifica spam
                          o promociones
                        </span>

                        <span>
                          • El enlace
                          expira en 24h
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/login"
                      style={{
                        textDecoration:
                          "none",
                      }}
                    >
                      <Button
                        style={{
                          width: "100%",
                          height: 58,
                          borderRadius: 18,
                          background:
                            COLORS.primary,
                          fontWeight: 800,
                          fontSize: 15,
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Login
                      </Button>
                    </Link>
                  </div>
                </>
              )}

              {/* FOOTER */}

              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
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
                  Recuperación segura y
                  protegida
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
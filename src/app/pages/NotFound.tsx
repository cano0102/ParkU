import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Home,
  ShieldCheck,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  background: "#F5F7F8",
  surface: "#FFFFFF",
  text: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
};

export function NotFound() {
  const navigate = useNavigate();

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

      button{
        font-family:'Montserrat',sans-serif;
        transition:.25s ease;
      }

      button:hover{
        transform:translateY(-2px);
      }

      @media(max-width:900px){

        .notfound-grid{
          grid-template-columns:1fr !important;
        }

        .notfound-left{
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
            background: "rgba(57,169,0,.08)",
            top: -120,
            right: -120,
            filter: "blur(10px)",
          }}
        />

        {/* CARD */}

        <div
          className="notfound-grid"
          style={{
            width: "100%",
            maxWidth: 1180,
            display: "grid",
            gridTemplateColumns: "1fr .9fr",
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
            className="notfound-left"
            style={{
              padding: "3rem 4rem",
              background:
                "linear-gradient(135deg,#39A900,#2D7D00)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* CIRCLE */}

            <div
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
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
                  justifyContent: "space-between",
                  marginBottom: "3rem",
                }}
              >
                <button
                  onClick={() => navigate(-1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 18px",
                    background: "rgba(255,255,255,.14)",
                    border:
                      "1px solid rgba(255,255,255,.12)",
                    color: "#fff",
                    borderRadius: 14,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    backdropFilter: "blur(10px)",
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
                    background: "rgba(255,255,255,.12)",
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

              {/* 404 */}

              <div
                style={{
                  fontSize: "clamp(6rem,10vw,10rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: "1rem",
                }}
              >
                404
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.5rem,5vw,4rem)",
                  lineHeight: 1,
                  fontWeight: 900,
                  marginBottom: "2rem",
                }}
              >
                Página
                <br />
                no encontrada
              </h1>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.92)",
                  maxWidth: 500,
                }}
              >
                La página que estás buscando
                no existe, fue eliminada o
                movida dentro del sistema.
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
                  "Sistema institucional seguro",
                  "Navegación protegida",
                  "Plataforma ParkU SENA",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(255,255,255,.08)",
                      padding: "16px 18px",
                      borderRadius: 18,
                    }}
                  >
                    <ShieldCheck size={20} />

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
                  ERROR DEL SISTEMA
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
                  Ruta
                  <br />
                  inválida
                </h2>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.8,
                    fontSize: 16,
                  }}
                >
                  Parece que intentaste acceder
                  a una ruta que no existe dentro
                  de la plataforma ParkU.
                </p>
              </div>

              {/* ACTION CARD */}

              <div
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 24,
                  padding: "2rem",
                  background: "#fff",
                  boxShadow:
                    "0 10px 30px rgba(15,23,42,.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: "1.5rem",
                    color: COLORS.primaryDark,
                    fontWeight: 800,
                  }}
                >
                  <ShieldCheck size={22} />
                  Plataforma protegida
                </div>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.8,
                    marginBottom: "2rem",
                  }}
                >
                  Puedes volver al dashboard
                  principal para continuar usando
                  el sistema normalmente.
                </p>

                {/* BUTTON */}

                <button
                  onClick={() =>
                    navigate("/app/dashboard")
                  }
                  style={{
                    width: "100%",
                    border: "none",
                    background: COLORS.primary,
                    color: "#fff",
                    padding: "18px 24px",
                    borderRadius: 18,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    fontSize: 15,
                    boxShadow:
                      "0 10px 25px rgba(57,169,0,.2)",
                  }}
                >
                  <Home size={18} />
                  Volver al Dashboard
                </button>
              </div>

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
                    color: COLORS.primaryDark,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <ShieldCheck size={18} />
                  Plataforma protegida y segura
                </div>

                <p
                  style={{
                    marginTop: "1.5rem",
                    textAlign: "center",
                    color: COLORS.textLight,
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ShieldCheck,
  CarFront,
  BarChart3,
  ScanLine,
  BadgeCheck,
  CheckCircle2,
  Activity,
} from "lucide-react";

import logoSena from "../../styles/images/logoSena.png";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  background: "#F5F7F8",
  surface: "#FFFFFF",
  text: "#000000ff",
  textLight: "#64748B",
  border: "#E2E8F0",
  dark: "#00000"
};



const features = [
  {
    icon: ShieldCheck,
    title: "Seguridad Institucional",
    desc: "Control automatizado de acceso vehicular.",
  },
  {
    icon: ScanLine,
    title: "Lectura Inteligente",
    desc: "Ingreso mediante QR y reconocimiento de placas.",
  },
  {
    icon: Activity,
    title: "Monitoreo en Tiempo Real",
    desc: "Visualización del estado del parqueadero.",
  },
  {
    icon: BarChart3,
    title: "Analítica Operativa",
    desc: "Estadísticas y reportes institucionales.",
  },
];

function useAnimated() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);

    return () => clearTimeout(timer);
  }, []);

  return visible;
}

export default function SenaLanding() {
  const navigate = useNavigate();

  const visible = useAnimated();

  return (
    <>
      <style>{`

      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      html{
        scroll-behavior:smooth;
      }

      body{
        font-family:'Montserrat',sans-serif;
        background:${COLORS.background};
        color:${COLORS.text};
      }

      button{
        font-family:'Montserrat',sans-serif;
        transition:.25s ease;
      }

      button:hover{
        transform:translateY(-2px);
      }

      .container{
        width:100%;
        max-width:1200px;
        margin:auto;
        padding:0 2rem;
      }

      .fade{
        opacity:0;
        transform:translateY(30px);
        transition:.8s ease;
      }

      .fade.active{
        opacity:1;
        transform:translateY(0);
      }

      .card{
        background:${COLORS.surface};
        border:1px solid ${COLORS.border};
        border-radius:24px;
        padding:2rem;
        transition:.3s ease;
      }

      .card:hover{
        transform:translateY(-6px);
        box-shadow:0 15px 40px rgba(0,0,0,.06);
      }

      @media(max-width:900px){

        .hero-grid,
        .features-grid,
        .stats-grid{
          grid-template-columns:1fr !important;
        }

        .nav-links{
          display:none !important;
        }

        .hero-title{
          font-size:3.5rem !important;
        }
      }

      @media(max-width:600px){

        .hero-title{
          font-size:2.7rem !important;
        }

        .hero-buttons{
          flex-direction:column;
        }

      }

      `}</style>

      <div
        style={{
          overflow: "hidden",
        }}
      >
        {/* NAVBAR */}

        <nav
          style={{
            width: "100%",
            position: "fixed",
            top: 0,
            zIndex: 100,
            background: "rgba(255,255,255,.95)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            className="container"
            style={{
              height: 85,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* LOGO */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <img
                src={logoSena}
                alt="SENA"
                style={{
                  width: 58,
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: COLORS.text,
                  }}
                >
                  ParkU
                </div>

                <div
                  style={{
                    color: COLORS.dark,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Sistema Institucional SENA
                </div>
              </div>
            </div>
            {/* BUTTON */}

            <button
              onClick={() => navigate("/login")}
              style={{
                border: "none",
                background: COLORS.primary,
                color: "#fff",
                padding: "14px 26px",
                borderRadius: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(57,169,0,.2)",
              }}
            >
              Ingresar
            </button>
          </div>
        </nav>

        {/* HERO */}

        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            background:
              "linear-gradient(180deg,#ffffff 0%,#F3F8F1 100%)",
            paddingTop: 100,
          }}
        >
          <div
            className="container hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            {/* LEFT */}

            <div
              className={`fade ${visible ? "active" : ""}`}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#E8F5E1",
                  color: COLORS.primaryDark,
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontWeight: 800,
                  marginBottom: "2rem",
                }}
              >
                <BadgeCheck size={18} />
                Plataforma Oficial SENA
              </div>

              <h1
                className="hero-title"
                style={{
                  fontSize: "clamp(3rem,7vw,5.8rem)",
                  lineHeight: .95,
                  fontWeight: 900,
                  marginBottom: "1.5rem",
                  color: COLORS.text,
                }}
              >
                Gestión
                <br />

                <span
                  style={{
                    color: COLORS.primary,
                  }}
                >
                  Inteligente
                </span>

                <br />
                de Parqueaderos
              </h1>

              <p
                style={{
                  color: COLORS.dark,
                  fontSize: 18,
                  lineHeight: 1.8,
                  maxWidth: 650,
                  marginBottom: "2.5rem",
                }}
              >
                ParkU es la plataforma institucional del SENA
                diseñada para optimizar el control vehicular,
                automatizar accesos y monitorear en tiempo real
                la ocupación de parqueaderos.
              </p>

              <div
                className="hero-buttons"
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "4rem",
                }}
              >
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    border: "none",
                    background: COLORS.primary,
                    color: "#fff",
                    padding: "18px 30px",
                    borderRadius: 16,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 15,
                  }}
                >
                  Acceder al Sistema
                  <ArrowRight size={18} />
                </button>

                <button
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    background: "#fff",
                    color: COLORS.text,
                    padding: "18px 30px",
                    borderRadius: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Ver Información
                </button>
              </div>
            </div>

            {/* RIGHT */}

            <div
              className={`fade ${visible ? "active" : ""}`}
            >
              <div
                className="card"
                style={{
                  padding: "2.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "2rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 24,
                      }}
                    >
                      Dashboard ParkU
                    </div>

                    <div
                      style={{
                        color: COLORS.dark,
                        marginTop: 4,
                      }}
                    >
                      Estado institucional en tiempo real
                    </div>
                  </div>

                  <div
                    style={{
                      color: COLORS.primary,
                      fontWeight: 800,
                    }}
                  >
                    ● Online
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {[
                    ["Disponibles", "124"],
                    ["Ocupados", "98"],
                    ["Reservas", "27"],
                    ["Accesos", "1.240"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 18,
                        padding: "1.5rem",
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 30,
                          fontWeight: 900,
                          color: COLORS.primary,
                        }}
                      >
                        {value}
                      </div>

                      <div
                        style={{
                          color: COLORS.dark,
                          marginTop: 6,
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#ECFDF3",
                    padding: "16px 18px",
                    borderRadius: 16,
                    color: COLORS.primaryDark,
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={20} />
                  Sistema operativo correctamente
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}

        <section
          style={{
            padding: "6rem 0",
            background: "#fff",
          }}
        >
          <div className="container">
            <div
              style={{
                textAlign: "center",
                marginBottom: "4rem",
              }}
            >
              <div
                style={{
                  color: COLORS.primary,
                  fontWeight: 800,
                  letterSpacing: 1,
                  marginBottom: 14,
                }}
              >
                BENEFICIOS
              </div>

              <h2
                style={{
                  fontSize: "clamp(2.5rem,5vw,4rem)",
                  fontWeight: 900,
                  color: COLORS.text,
                  marginBottom: "1rem",
                }}
              >
                Tecnología para el SENA
              </h2>

              <p
                style={{
                  color: COLORS.dark,
                  maxWidth: 700,
                  margin: "auto",
                  lineHeight: 1.8,
                }}
              >
                Una solución moderna enfocada en seguridad,
                automatización y administración vehicular.
              </p>
            </div>

            <div
              className="features-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(260px,1fr))",
                gap: "1.5rem",
              }}
            >
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="card"
                  >
                    <div
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 20,
                        background: "#E8F5E1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <Icon
                        size={34}
                        color={COLORS.primary}
                      />
                    </div>

                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        marginBottom: ".8rem",
                        color: "black"
                      }}
                    >
                      {feature.title}
                    </h3>

                    <p
                      style={{
                        color: COLORS.dark,
                        lineHeight: 1.8,
                      }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}

        <section
          style={{
            padding: "6rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                background:
                  "linear-gradient(135deg,#39A900,#2D7D00)",
                borderRadius: 40,
                padding: "5rem 3rem",
                textAlign: "center",
              }}
            >
              <CarFront
                size={58}
                color="#fff"
              />

              <h2
                style={{
                  color: "#fff",
                  fontSize: "clamp(2.5rem,5vw,4rem)",
                  fontWeight: 900,
                  marginTop: "2rem",
                  marginBottom: "1rem",
                }}
              >
                Accede a ParkU
              </h2>

              <p
                style={{
                  color: "rgba(255,255,255,.9)",
                  maxWidth: 720,
                  margin: "auto",
                  lineHeight: 1.8,
                  fontSize: 18,
                }}
              >
                Gestiona el acceso vehicular institucional de
                forma moderna, rápida y segura.
              </p>

              <button
                onClick={() => navigate("/login")}
                style={{
                  marginTop: "2rem",
                  border: "none",
                  background: "#fff",
                  color: COLORS.primary,
                  padding: "18px 34px",
                  borderRadius: 18,
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer
          style={{
            background: "#fff",
            borderTop: `1px solid ${COLORS.border}`,
            padding: "2rem 0",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <img
                src={logoSena}
                alt="SENA"
                style={{
                  width: 46,
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: COLORS.text,
                  }}
                >
                  ParkU · SENA
                </div>

                <div
                  style={{
                    color: COLORS.dark,
                    fontSize: 14,
                  }}
                >
                  Servicio Nacional de Aprendizaje
                </div>
              </div>
            </div>

            <div
              style={{
                color: COLORS.dark,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              © 2026 · Plataforma Institucional ParkU
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
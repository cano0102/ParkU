import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  CarFront,
  BarChart3,
  BellRing,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ScanLine,
  Building2,
  Clock3,
  MapPinned,
  Activity,
  Camera,
  Smartphone,
  ChevronRight,
  BadgeCheck,
  Sparkles,
  LockKeyhole,
  LayoutDashboard,
  Zap,
} from "lucide-react";

import logoSena from "../../styles/images/logoSena.png";

type SlotStatus = "libre" | "ocupado" | "reservado" | "discap";

type Slot = {
  id: string;
  status: SlotStatus;
};

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primarySoft: "#EAF7E3",

  background: "#F3F6F8",
  surface: "#FFFFFF",

  text: "#0F172A",
  textSoft: "#334155",
  textLight: "#475569",

  border: "#DDE3EA",

  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#2563EB",
};

const slots: Slot[] = [
  { id: "A01", status: "ocupado" },
  { id: "A02", status: "ocupado" },
  { id: "A03", status: "libre" },
  { id: "A04", status: "libre" },
  { id: "A05", status: "ocupado" },
  { id: "B01", status: "libre" },
  { id: "B02", status: "reservado" },
  { id: "B03", status: "ocupado" },
  { id: "B04", status: "libre" },
  { id: "B05", status: "libre" },
  { id: "C01", status: "ocupado" },
  { id: "C02", status: "libre" },
  { id: "C03", status: "libre" },
  { id: "C04", status: "ocupado" },
  { id: "C05", status: "reservado" },
  { id: "D01", status: "libre" },
  { id: "D02", status: "ocupado" },
  { id: "D03", status: "discap" },
  { id: "D04", status: "libre" },
  { id: "D05", status: "ocupado" },
];

const slotColors = {
  libre: {
    bg: "#DCFCE7",
    color: "#16A34A",
  },
  ocupado: {
    bg: "#FEE2E2",
    color: "#DC2626",
  },
  reservado: {
    bg: "#FEF3C7",
    color: "#D97706",
  },
  discap: {
    bg: "#DBEAFE",
    color: "#2563EB",
  },
};

const benefits = [
  {
    icon: ShieldCheck,
    title: "Seguridad Institucional",
    desc: "Acceso inteligente y control automatizado para toda la regional.",
  },
  {
    icon: ScanLine,
    title: "Reconocimiento de Placas",
    desc: "Ingreso automático mediante lectura LPR y QR institucional.",
  },
  {
    icon: Activity,
    title: "Monitoreo en Tiempo Real",
    desc: "Visualización operativa del parqueadero en vivo.",
  },
  {
    icon: Smartphone,
    title: "Acceso Multiplataforma",
    desc: "Compatible con escritorio, tablet y dispositivos móviles.",
  },
  {
    icon: BellRing,
    title: "Alertas Inteligentes",
    desc: "Notificaciones instantáneas y eventos críticos.",
  },
  {
    icon: BarChart3,
    title: "Analítica Avanzada",
    desc: "Reportes y métricas institucionales en tiempo real.",
  },
];

const modules = [
  {
    title: "Gestión Vehicular",
    icon: CarFront,
    desc: "Registro y control automatizado de vehículos.",
  },
  {
    title: "Administración",
    icon: Building2,
    desc: "Configuración institucional y gestión de usuarios.",
  },
  {
    title: "Vigilancia Inteligente",
    icon: Camera,
    desc: "Monitoreo visual integrado en tiempo real.",
  },
  {
    title: "IA Operativa",
    icon: Cpu,
    desc: "Predicción y optimización de ocupación.",
  },
];

function useAnimated() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);

    return () => clearTimeout(t);
  }, []);

  return visible;
}

export default function SenaLanding() {
  const navigate = useNavigate();

  const visible = useAnimated();

  const libres = slots.filter((s) => s.status === "libre").length;
  const ocupados = slots.filter((s) => s.status === "ocupado").length;
  const reservas = slots.filter((s) => s.status === "reservado").length;

  return (
    <>
      <style>{`

      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
      }

      html{
        scroll-behavior:smooth;
      }

      body{
        font-family:'Inter',sans-serif;
        background:${COLORS.background};
        color:${COLORS.text};
      }

      button{
        transition:.25s ease;
      }

      button:hover{
        transform:translateY(-2px);
      }

      ::selection{
        background:#39A900;
        color:white;
      }

      .container{
        max-width:1280px;
        margin:auto;
        padding:0 2rem;
      }

      .glass{
        background:rgba(255,255,255,.96);
        backdrop-filter:blur(16px);
        border:1px solid rgba(15,23,42,.06);
        box-shadow:0 10px 40px rgba(0,0,0,.05);
      }

      .card{
        transition:.3s ease;
      }

      .card:hover{
        transform:translateY(-8px);
        box-shadow:0 20px 50px rgba(15,23,42,.08);
      }

      .fade-up{
        opacity:0;
        transform:translateY(40px);
        transition:all .8s ease;
      }

      .fade-up.visible{
        opacity:1;
        transform:translateY(0);
      }

      .hero-blur{
        position:absolute;
        width:700px;
        height:700px;
        border-radius:50%;
        background:#39A90015;
        filter:blur(120px);
        top:-200px;
        right:-120px;
      }

      .tag{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:10px 18px;
        border-radius:999px;
        background:${COLORS.primarySoft};
        color:${COLORS.primaryDark};
        font-weight:700;
        font-size:14px;
      }

      @media(max-width:980px){

        .hero-grid,
        .modules-grid,
        .cta-grid{
          grid-template-columns:1fr !important;
        }

        .nav-links{
          display:none !important;
        }

        .hero-title{
          font-size:4rem !important;
        }
      }

      @media(max-width:640px){

        .hero-title{
          font-size:3rem !important;
        }

        .section-title{
          font-size:2.5rem !important;
        }
      }

      `}</style>

      <div
        style={{
          overflow: "hidden",
          background: COLORS.background,
        }}
      >
        {/* NAVBAR */}

        <nav
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 100,
            backdropFilter: "blur(16px)",
            background: "rgba(255,255,255,.92)",
            borderBottom: "1px solid rgba(0,0,0,.05)",
          }}
        >
          <div
            className="container"
            style={{
              height: 82,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
                  width: 56,
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 16,
                    color: COLORS.text,
                  }}
                >
                  PARKU SENA
                </div>

                <div
                  style={{
                    color: COLORS.textLight,
                    fontSize: 12,
                  }}
                >
                  Sistema Institucional
                </div>
              </div>
            </div>

            <div
              className="nav-links"
              style={{
                display: "flex",
                gap: "2rem",
                color: COLORS.textSoft,
                fontWeight: 600,
              }}
            >
              <span>Inicio</span>
              <span>Funciones</span>
              <span>Dashboard</span>
              <span>Soporte</span>
            </div>

            <button
              onClick={() => navigate("/login")}
              style={{
                border: "none",
                background: COLORS.primary,
                color: "#fff",
                padding: "14px 26px",
                borderRadius: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 15,
                letterSpacing: ".2px",
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
            position: "relative",
            paddingTop: 140,
            background:
              "linear-gradient(180deg,#ffffff 0%,#f4f8f4 40%,#eef5ef 100%)",
          }}
        >
          <div className="hero-blur" />

          <div
            className="container hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: "5rem",
              alignItems: "center",
            }}
          >
            {/* LEFT */}

            <div
              className={`fade-up ${visible ? "visible" : ""}`}
            >
              <div className="tag">
                <BadgeCheck size={16} />
                Plataforma Institucional Activa
              </div>

              <h1
                className="hero-title"
                style={{
                  fontSize: "clamp(3rem,8vw,6.5rem)",
                  lineHeight: .92,
                  letterSpacing: "-0.05em",
                  marginTop: "2rem",
                  marginBottom: "1.5rem",
                  fontWeight: 900,
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
                  fontSize: 18,
                  color: COLORS.textLight,
                  lineHeight: 1.8,
                  maxWidth: 650,
                  marginBottom: "2.5rem",
                }}
              >
                Plataforma moderna desarrollada para optimizar
                el acceso vehicular institucional mediante
                automatización, monitoreo en tiempo real,
                reservas inteligentes y control administrativo.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
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
                    letterSpacing: ".2px",
                    boxShadow: "0 14px 30px rgba(57,169,0,.25)",
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
                    fontSize: 15,
                  }}
                >
                  Ver Módulos
                </button>
              </div>

              {/* STATS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(180px,1fr))",
                  gap: "1rem",
                  marginTop: "4rem",
                }}
              >
                {[
                  ["+250", "Celdas Activas", Sparkles],
                  ["24/7", "Monitoreo", Activity],
                  ["98%", "Disponibilidad", Zap],
                ].map(([n, l, Icon]: any) => (
                  <div
                    key={l}
                    className="glass card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: 24,
                    }}
                  >
                    <Icon
                      size={24}
                      color={COLORS.primary}
                    />

                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 900,
                        color: COLORS.primary,
                        marginTop: 14,
                      }}
                    >
                      {n}
                    </div>

                    <div
                      style={{
                        color: COLORS.textLight,
                        marginTop: 6,
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}

            <div
              className="glass fade-up visible"
              style={{
                borderRadius: 32,
                padding: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 24,
                      color: COLORS.text,
                    }}
                  >
                    Dashboard Operativo
                  </div>

                  <div
                    style={{
                      color: COLORS.textLight,
                      marginTop: 4,
                    }}
                  >
                    Estado institucional en tiempo real
                  </div>
                </div>

                <div
                  style={{
                    color: COLORS.success,
                    fontWeight: 700,
                  }}
                >
                  ● Online
                </div>
              </div>

              {/* MINI CARDS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  [
                    Clock3,
                    "3s",
                    "Tiempo promedio acceso",
                  ],
                  [
                    MapPinned,
                    "7",
                    "Parqueaderos activos",
                  ],
                ].map(([Icon, n, l], i) => {
                  const Comp = Icon as any;

                  return (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        borderRadius: 22,
                        padding: "1.2rem",
                        border: `1px solid ${COLORS.border}`,
                        boxShadow:
                          "0 10px 30px rgba(15,23,42,.04)",
                      }}
                    >
                      <Comp
                        size={22}
                        color={COLORS.primary}
                      />

                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 900,
                          marginTop: 14,
                          color: COLORS.text,
                        }}
                      >
                        {n}
                      </div>

                      <div
                        style={{
                          color: COLORS.textLight,
                          marginTop: 4,
                          fontSize: 14,
                        }}
                      >
                        {l}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PARKING GRID */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5,1fr)",
                  gap: 10,
                }}
              >
                {slots.map((slot) => {
                  const c = slotColors[slot.status];

                  return (
                    <div
                      key={slot.id}
                      style={{
                        aspectRatio: "1.2",
                        borderRadius: 18,
                        background: c.bg,
                        color: c.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        boxShadow:
                          "0 4px 14px rgba(0,0,0,.04)",
                      }}
                    >
                      {slot.id}
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM STATS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "1rem",
                  marginTop: "1.5rem",
                }}
              >
                {[
                  [libres, "Libres"],
                  [ocupados, "Ocupados"],
                  [reservas, "Reservas"],
                ].map(([n, l]) => (
                  <div
                    key={l}
                    style={{
                      background: "#fff",
                      borderRadius: 18,
                      padding: "1rem",
                      border: `1px solid ${COLORS.border}`,
                      boxShadow:
                        "0 10px 30px rgba(15,23,42,.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: COLORS.primary,
                      }}
                    >
                      {n}
                    </div>

                    <div
                      style={{
                        color: COLORS.textLight,
                        marginTop: 4,
                        fontSize: 14,
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}

        <section
          style={{
            padding: "2rem 0",
            background: "#fff",
            borderTop: `1px solid ${COLORS.border}`,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            {[
              "Acceso Inteligente",
              "Reconocimiento LPR",
              "Control Institucional",
              "Monitoreo 24/7",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontWeight: 700,
                  color: COLORS.textSoft,
                }}
              >
                <CheckCircle2
                  size={18}
                  color={COLORS.primary}
                />

                {item}
              </div>
            ))}
          </div>
        </section>

        {/* BENEFITS */}

        <section
          style={{
            padding: "7rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                color: COLORS.primary,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Beneficios Institucionales
            </div>

            <h2
              className="section-title"
              style={{
                fontSize: "clamp(3rem,5vw,5rem)",
                lineHeight: 1,
                fontWeight: 900,
                marginBottom: "1rem",
                color: COLORS.text,
              }}
            >
              Tecnología moderna
              <br />
              para el SENA
            </h2>

            <p
              style={{
                color: COLORS.textLight,
                maxWidth: 760,
                lineHeight: 1.8,
                fontSize: 18,
                marginBottom: "4rem",
              }}
            >
              Solución diseñada para optimizar movilidad,
              seguridad y administración institucional.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(320px,1fr))",
                gap: "1.5rem",
              }}
            >
              {benefits.map((b) => {
                const Icon = b.icon;

                return (
                  <div
                    key={b.title}
                    className="glass card"
                    style={{
                      borderRadius: 28,
                      padding: "2rem",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 24,
                        background: COLORS.primarySoft,
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
                        fontSize: 24,
                        fontWeight: 900,
                        marginBottom: ".8rem",
                        color: COLORS.text,
                      }}
                    >
                      {b.title}
                    </h3>

                    <p
                      style={{
                        color: COLORS.textLight,
                        lineHeight: 1.8,
                      }}
                    >
                      {b.desc}
                    </p>

                    <div
                      style={{
                        marginTop: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: COLORS.primary,
                        fontWeight: 700,
                      }}
                    >
                      Ver más
                      <ChevronRight size={18} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MODULES */}

        <section
          style={{
            padding: "7rem 0",
            background: "#fff",
          }}
        >
          <div className="container">
            <div
              className="modules-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "5rem",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    marginBottom: 16,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Módulos Inteligentes
                </div>

                <h2
                  className="section-title"
                  style={{
                    fontSize: "clamp(3rem,5vw,4.5rem)",
                    lineHeight: 1,
                    fontWeight: 900,
                    marginBottom: "1.5rem",
                    color: COLORS.text,
                  }}
                >
                  Ecosistema
                  <br />
                  operativo
                </h2>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.8,
                    fontSize: 18,
                    marginBottom: "3rem",
                  }}
                >
                  Arquitectura modular moderna enfocada en
                  escalabilidad, automatización y control.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {[
                    "Ingreso mediante QR institucional",
                    "Validación automática de acceso",
                    "Asignación inteligente de celdas",
                    "Monitoreo y alertas operativas",
                  ].map((item, i) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: COLORS.primary,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>

                      <div
                        style={{
                          color: COLORS.textSoft,
                          fontWeight: 600,
                        }}
                      >
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(240px,1fr))",
                  gap: "1.5rem",
                }}
              >
                {modules.map((m) => {
                  const Icon = m.icon;

                  return (
                    <div
                      key={m.title}
                      className="glass card"
                      style={{
                        borderRadius: 28,
                        padding: "2rem",
                      }}
                    >
                      <Icon
                        size={36}
                        color={COLORS.primary}
                      />

                      <h3
                        style={{
                          marginTop: "1.5rem",
                          fontWeight: 900,
                          fontSize: 22,
                          marginBottom: ".8rem",
                          color: COLORS.text,
                        }}
                      >
                        {m.title}
                      </h3>

                      <p
                        style={{
                          color: COLORS.textLight,
                          lineHeight: 1.8,
                        }}
                      >
                        {m.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* EXTRA SECTION */}

        <section
          style={{
            padding: "7rem 0",
          }}
        >
          <div className="container">
            <div
              className="glass"
              style={{
                borderRadius: 40,
                padding: "4rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(250px,1fr))",
                  gap: "2rem",
                }}
              >
                {[
                  {
                    icon: LockKeyhole,
                    title: "Seguridad Avanzada",
                  },
                  {
                    icon: LayoutDashboard,
                    title: "Dashboard Ejecutivo",
                  },
                  {
                    icon: Sparkles,
                    title: "Experiencia Moderna",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title}>
                      <Icon
                        size={42}
                        color={COLORS.primary}
                      />

                      <h3
                        style={{
                          marginTop: "1rem",
                          fontSize: 24,
                          fontWeight: 900,
                          color: COLORS.text,
                        }}
                      >
                        {item.title}
                      </h3>

                      <p
                        style={{
                          marginTop: ".8rem",
                          color: COLORS.textLight,
                          lineHeight: 1.8,
                        }}
                      >
                        Plataforma diseñada con estándares
                        modernos para operación institucional.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}

        <section
          style={{
            padding: "7rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                borderRadius: 40,
                overflow: "hidden",
                position: "relative",
                background:
                  "linear-gradient(135deg,#39A900,#2D7D00)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 600,
                  height: 600,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.08)",
                  top: -250,
                  right: -100,
                  filter: "blur(40px)",
                }}
              />

              <div
                className="cta-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "3rem",
                  alignItems: "center",
                  padding: "5rem",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "clamp(3rem,5vw,5rem)",
                      lineHeight: 1,
                      fontWeight: 900,
                      color: "#fff",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Moderniza tu
                    <br />
                    parqueadero hoy
                  </h2>

                  <p
                    style={{
                      color: "rgba(255,255,255,.92)",
                      lineHeight: 1.8,
                      fontSize: 18,
                      maxWidth: 760,
                    }}
                  >
                    Accede al sistema institucional y mejora
                    la gestión vehicular de tu regional.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      border: "none",
                      background: "#fff",
                      color: COLORS.primary,
                      padding: "18px 30px",
                      borderRadius: 16,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    Iniciar Sesión
                  </button>

                  <button
                    style={{
                      border:
                        "1px solid rgba(255,255,255,.3)",
                      background: "transparent",
                      color: "#fff",
                      padding: "18px 30px",
                      borderRadius: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Contactar Soporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer
          style={{
            background: "#FFFFFF",
            borderTop: `1px solid ${COLORS.border}`,
            padding: "5rem 0 2rem",
          }}
        >
          <div
            className="container"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",
              gap: "4rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <img
                  src={logoSena}
                  alt="SENA"
                  style={{
                    width: 54,
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
                    PARKU SENA
                  </div>

                  <div
                    style={{
                      color: COLORS.textLight,
                      fontSize: 14,
                    }}
                  >
                    Sistema Institucional
                  </div>
                </div>
              </div>

              <p
                style={{
                  color: COLORS.textLight,
                  lineHeight: 1.9,
                  maxWidth: 400,
                }}
              >
                Plataforma moderna diseñada para optimizar
                la administración vehicular institucional.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 900,
                  marginBottom: "1.2rem",
                  color: COLORS.text,
                  fontSize: 18,
                }}
              >
                Navegación
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  color: COLORS.textLight,
                  fontWeight: 500,
                }}
              >
                <span>Inicio</span>
                <span>Beneficios</span>
                <span>Módulos</span>
                <span>Dashboard</span>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontWeight: 900,
                  marginBottom: "1.2rem",
                  color: COLORS.text,
                  fontSize: 18,
                }}
              >
                Estado del Sistema
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: COLORS.success,
                  fontWeight: 700,
                  background: "#ECFDF3",
                  width: "fit-content",
                  padding: "10px 16px",
                  borderRadius: 999,
                }}
              >
                <CheckCircle2 size={18} />
                Operativo 24/7
              </div>
            </div>
          </div>

          <div
            className="container"
            style={{
              marginTop: "4rem",
              paddingTop: "2rem",
              borderTop: `1px solid ${COLORS.border}`,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div
              style={{
                color: COLORS.textLight,
                fontSize: 14,
              }}
            >
              © 2026 SENA · Servicio Nacional de Aprendizaje
            </div>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                color: COLORS.textLight,
                fontSize: 14,
              }}
            >
              <span>Privacidad</span>
              <span>Términos</span>
              <span>Soporte TIC</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
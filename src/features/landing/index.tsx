import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  CarFront,
  BarChart3,
  ScanLine,
  BadgeCheck,
  CheckCircle2,
  Activity,
  Menu,
  X,
  Clock,
  Users,
  Sparkles,
  UserPlus,
  QrCode,
  DoorOpen,
} from "lucide-react";

import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/theme";

const COLORS = theme;

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

const steps = [
  {
    icon: UserPlus,
    title: "Regístrate",
    desc: "Crea tu cuenta institucional con tus datos del SENA en pocos minutos.",
  },
  {
    icon: QrCode,
    title: "Genera tu código QR",
    desc: "Vincula tu vehículo y obtén un código de acceso único y seguro.",
  },
  {
    icon: DoorOpen,
    title: "Accede sin filas",
    desc: "Ingresa y sal del parqueadero de forma automática, rápida y segura.",
  },
];

const heroStats = [
  { label: "Disponibles", value: 124 },
  { label: "Ocupados", value: 98 },
  { label: "Reservas", value: 27 },
  { label: "Accesos", value: 1240 },
];

const trustBadges = [
  { icon: Clock, text: "Disponible 24/7" },
  { icon: Users, text: "+500 usuarios activos" },
  { icon: Sparkles, text: "Soporte institucional SENA" },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

function useCountUp(end: number, active: boolean, duration = 1300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let raf: number;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);

  return value;
}

function StatCard({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  const count = useCountUp(value, active);

  return (
    <div
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
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count.toLocaleString("es-CO")}
      </div>

      <div
        style={{
          color: COLORS.textLight,
          marginTop: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Reveal({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`fade ${visible ? "active" : ""} ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function SenaLanding() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsRef, statsVisible] = useReveal<HTMLDivElement>();

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToId = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { id: "inicio", label: "Inicio" },
    { id: "beneficios", label: "Beneficios" },
    { id: "como-funciona", label: "Cómo Funciona" },
    { id: "contacto", label: "Contacto" },
  ];

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

      .navbar{
        transition:.3s ease;
      }

      .nav-link{
        position:relative;
        background:none;
        border:none;
        cursor:pointer;
        font-family:'Montserrat',sans-serif;
        font-weight:700;
        font-size:15px;
        color:${COLORS.text};
        padding:8px 2px;
      }

      .nav-link::after{
        content:'';
        position:absolute;
        left:0;
        bottom:0;
        width:0;
        height:2px;
        background:${COLORS.primary};
        transition:.25s ease;
      }

      .nav-link:hover::after{
        width:100%;
      }

      .nav-link:hover{
        transform:none;
      }

      .menu-toggle{
        display:none;
        background:none;
        border:none;
        cursor:pointer;
        color:${COLORS.text};
      }

      .step-line{
        position:absolute;
        top:35px;
        left:calc(50% + 45px);
        width:calc(100% - 90px);
        height:2px;
        background:repeating-linear-gradient(90deg,${COLORS.border} 0 8px,transparent 8px 16px);
      }

      @media(max-width:900px){

        .hero-grid,
        .features-grid,
        .stats-grid,
        .steps-grid{
          grid-template-columns:1fr !important;
        }

        .nav-links{
          display:none !important;
        }

        .menu-toggle{
          display:flex !important;
        }

        .hero-title{
          font-size:3.5rem !important;
        }

        .step-line{
          display:none;
        }
      }

      @media(max-width:600px){

        .hero-title{
          font-size:2.7rem !important;
        }

        .hero-buttons{
          flex-direction:column;
        }

        .trust-badges{
          flex-direction:column;
          align-items:flex-start !important;
        }
      }

      @media(max-width:480px){

        .logo-subtitle{
          display:none;
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
          className="navbar"
          style={{
            width: "100%",
            position: "fixed",
            top: 0,
            zIndex: 100,
            background: "rgba(255,255,255,.95)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${COLORS.border}`,
            boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,.06)" : "none",
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
              onClick={() => scrollToId("inicio")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
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
                  className="logo-subtitle"
                  style={{
                    color: COLORS.textLight,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Sistema Institucional SENA
                </div>
              </div>
            </div>

            {/* NAV LINKS */}

            <div
              className="nav-links"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
              }}
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  className="nav-link"
                  onClick={() => scrollToId(link.id)}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
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

              <button
                className="menu-toggle"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menú"
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}

          {menuOpen && (
            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                background: "#fff",
                padding: "1.5rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToId(link.id)}
                  style={{
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: 16,
                    color: COLORS.text,
                    cursor: "pointer",
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* HERO */}

        <section
          id="inicio"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            background:
              "radial-gradient(1100px 500px at 85% -10%, #E8F5E1 0%, rgba(232,245,225,0) 60%), linear-gradient(180deg,#ffffff 0%,#F3F8F1 100%)",
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

            <div className={`fade ${heroVisible ? "active" : ""}`}>
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
                  lineHeight: 0.95,
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
                  color: COLORS.textLight,
                  fontSize: 18,
                  lineHeight: 1.8,
                  maxWidth: 650,
                  marginBottom: "2rem",
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
                  marginBottom: "2.5rem",
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
                </button>

                <button
                  onClick={() => scrollToId("beneficios")}
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

              <div
                className="trust-badges"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.8rem",
                  flexWrap: "wrap",
                }}
              >
                {trustBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.text}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: COLORS.textLight,
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      <Icon size={18} color={COLORS.primary} />
                      {badge.text}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT */}

            <div className={`fade ${heroVisible ? "active" : ""}`}>
              <div
                className="card"
                ref={statsRef}
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
                        color: COLORS.textLight,
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
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: COLORS.primary,
                        display: "inline-block",
                      }}
                    />
                    Online
                  </div>
                </div>

                <div
                  className="stats-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {heroStats.map((stat) => (
                    <StatCard
                      key={stat.label}
                      label={stat.label}
                      value={stat.value}
                      active={statsVisible}
                    />
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
          id="beneficios"
          style={{
            padding: "6rem 0",
            background: "#fff",
          }}
        >
          <div className="container">
            <Reveal
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
                  color: COLORS.textLight,
                  maxWidth: 700,
                  margin: "auto",
                  lineHeight: 1.8,
                }}
              >
                Una solución moderna enfocada en seguridad,
                automatización y administración vehicular.
              </p>
            </Reveal>

            <div
              className="features-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(260px,1fr))",
                gap: "1.5rem",
              }}
            >
              {features.map((feature, i) => {
                const Icon = feature.icon;

                return (
                  <Reveal
                    key={feature.title}
                    className="card"
                    style={{ transitionDelay: `${i * 0.08}s` }}
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
                      <Icon size={34} color={COLORS.primary} />
                    </div>

                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        marginBottom: ".8rem",
                        color: COLORS.text,
                      }}
                    >
                      {feature.title}
                    </h3>

                    <p
                      style={{
                        color: COLORS.textLight,
                        lineHeight: 1.8,
                      }}
                    >
                      {feature.desc}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}

        <section
          id="como-funciona"
          style={{
            padding: "6rem 0",
            background: COLORS.background,
          }}
        >
          <div className="container">
            <Reveal
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
                PROCESO
              </div>

              <h2
                style={{
                  fontSize: "clamp(2.5rem,5vw,4rem)",
                  fontWeight: 900,
                  color: COLORS.text,
                  marginBottom: "1rem",
                }}
              >
                Cómo Funciona
              </h2>

              <p
                style={{
                  color: COLORS.textLight,
                  maxWidth: 700,
                  margin: "auto",
                  lineHeight: 1.8,
                }}
              >
                Empieza a usar ParkU en tres simples pasos.
              </p>
            </Reveal>

            <div
              className="steps-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "2rem",
                position: "relative",
              }}
            >
              {steps.map((step, i) => {
                const Icon = step.icon;

                return (
                  <Reveal
                    key={step.title}
                    style={{
                      position: "relative",
                      textAlign: "center",
                      transitionDelay: `${i * 0.12}s`,
                    }}
                  >
                    {i < steps.length - 1 && <div className="step-line" />}

                    <div
                      style={{
                        position: "relative",
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background: "#fff",
                        border: `2px solid ${COLORS.primary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                        boxShadow: "0 15px 30px rgba(57,169,0,.12)",
                      }}
                    >
                      <Icon size={36} color={COLORS.primary} />

                      <div
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: COLORS.primary,
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i + 1}
                      </div>
                    </div>

                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        marginBottom: ".6rem",
                        color: COLORS.text,
                      }}
                    >
                      {step.title}
                    </h3>

                    <p
                      style={{
                        color: COLORS.textLight,
                        lineHeight: 1.8,
                        maxWidth: 320,
                        margin: "auto",
                      }}
                    >
                      {step.desc}
                    </p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}

        <section
          style={{
            padding: "6rem 0",
            background: "#fff",
          }}
        >
          <div className="container">
            <Reveal
              style={{
                background:
                  "linear-gradient(135deg,#39A900,#2D7D00)",
                borderRadius: 40,
                padding: "5rem 3rem",
                textAlign: "center",
              }}
            >
              <CarFront size={58} color="#fff" />

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
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}

        <footer
          id="contacto"
          style={{
            background: "#fff",
            borderTop: `1px solid ${COLORS.border}`,
            padding: "2.5rem 0",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
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
                    color: COLORS.textLight,
                    fontSize: 14,
                  }}
                >
                  Servicio Nacional de Aprendizaje
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1.8rem",
                flexWrap: "wrap",
              }}
            >
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToId(link.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: COLORS.textLight,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div
              style={{
                color: COLORS.textLight,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} · Plataforma Institucional ParkU
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

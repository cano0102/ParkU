import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase/config";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  background: "#F5F7F8",
  surface: "#FFFFFF",
  text: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
};

function useAnimated() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return visible;
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const visible = useAnimated();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Acceso concedido");
        navigate("/app/dashboard");
      } else {
        toast.error("Credenciales inválidas");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      googleLogin(result.user);
      toast.success(`Bienvenido ${result.user.displayName}`);
      navigate("/app/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Error con Google");
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

      .fade{
        opacity:0;
        transform:translateY(30px);
        transition:.8s ease;
      }

      .fade.active{
        opacity:1;
        transform:translateY(0);
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

        .login-grid{
          grid-template-columns:1fr !important;
        }

        .login-left{
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
          className={`fade ${visible ? "active" : ""} login-grid`}
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
            className="login-left"
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
                  onClick={() => navigate("/")}
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
                Bienvenido a ParkU
              </h1>

              {/* DESCRIPTION */}

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,.92)",
                  maxWidth: 420,
                }}
              >
                Sistema institucional para la gestión inteligente de
                parqueaderos, accesos y monitoreo vehicular del SENA.
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
                  "Control de acceso seguro",
                  "Monitoreo en tiempo real",
                  "Gestión automatizada",
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

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
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
              padding: "2rem clamp(1.5rem,3vw,2.5rem)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 360,
              }}
            >
              {/* HEADER */}

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

              <div
                style={{
                  marginBottom: "1.5rem",
                }}
              >
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
                  ACCESO INSTITUCIONAL
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
                  Iniciar Sesión
                </h2>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.6,
                    fontSize: 13,
                  }}
                >
                  Ingresa tus credenciales institucionales para acceder al
                  sistema ParkU.
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleLogin}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* EMAIL */}

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

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@sena.edu.co"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>

                {/* PASSWORD */}

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
                    Contraseña
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: "100%",
                        padding: "14px 48px 14px 16px",
                        borderRadius: 12,
                        border: `1px solid ${COLORS.border}`,
                        background: "#fff",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                </div>

                {/* FORGOT */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
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

                {/* LOGIN */}

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
                  {loading ? "Verificando..." : "Ingresar"}
                </button>

                {/* GOOGLE */}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
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
                    gap: 10,
                    fontSize: 13,
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    style={{
                      width: 18,
                      height: 18,
                    }}
                  />
                  Continuar con Google
                </button>
              </form>

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

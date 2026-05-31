import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { ArrowLeft, Eye, EyeOff, ShieldCheck, BadgeCheck } from "lucide-react";

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

      }

      .mobile-back{
  display:none;
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

        <div
          className={`fade ${visible ? "active" : ""} login-grid`}
          style={{
            width: "100%",
            maxWidth: 1180,
            display: "grid",
            gridTemplateColumns: "1fr .9fr",
            overflow: "hidden",
            borderRadius: 36,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 25px 70px rgba(15,23,42,.08)",
          }}
        >
          {/* LEFT */}

          <div
            className="login-left"
            style={{
              padding: "3rem 4rem",
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
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
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
              {/* TOP BAR */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "3rem",
                }}
              >
                <button
                  onClick={() => navigate("/")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 18px",
                    background: "rgba(255,255,255,.14)",
                    border: "1px solid rgba(255,255,255,.12)",
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
              </div>

              {/* TITLE */}

              {/* SENA LOGO */}
              <div style={{ marginBottom: "1.5rem" }}>
                <img
                  src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
                  alt="Logo SENA"
                  style={{
                    height: 64,
                    width: "auto",
                    filter: "brightness(0) invert(1)",
                    objectFit: "contain",
                  }}
                />
              </div>

              <h1
                style={{
                  fontSize: "clamp(3rem,5vw,5rem)",
                  lineHeight: 0.95,
                  fontWeight: 900,
                  marginBottom: "2rem",
                }}
              >
                Bienvenido a ParkU
              </h1>

              {/* DESCRIPTION */}

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.92)",
                  maxWidth: 500,
                }}
              >
                Sistema institucional para la gestión inteligente de
                parqueaderos, accesos y monitoreo vehicular del SENA.
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
                  "Control de acceso seguro",
                  "Monitoreo en tiempo real",
                  "Gestión automatizada",
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
              padding: "4rem clamp(2rem,4vw,4rem)",
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

              <button
                type="button"
                className="mobile-back"
                onClick={() => navigate("/")}
                style={{
                  border: "none",
                  background: "#F1F5F9",
                  color: COLORS.text,
                  padding: "12px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                <ArrowLeft size={16} />
                Volver
              </button>

              <div
                style={{
                  marginBottom: "2.5rem",
                }}
              >
                {/* SENA LOGO */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <img
                    src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
                    alt="Logo SENA"
                    style={{
                      height: 52,
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div
                  style={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    marginBottom: 14,
                    letterSpacing: 1,
                  }}
                >
                  ACCESO INSTITUCIONAL
                </div>

                <h2
                  style={{
                    fontSize: "clamp(2.5rem,5vw,3.5rem)",
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1,
                    marginBottom: "1rem",
                  }}
                >
                  Iniciar Sesión
                </h2>

                <p
                  style={{
                    color: COLORS.textLight,
                    lineHeight: 1.8,
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
                  gap: "1.4rem",
                }}
              >
                {/* EMAIL */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 10,
                      fontWeight: 700,
                      color: COLORS.text,
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
                      padding: "18px 18px",
                      borderRadius: 16,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                </div>

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
                        padding: "18px 55px 18px 18px",
                        borderRadius: 16,
                        border: `1px solid ${COLORS.border}`,
                        background: "#fff",
                        fontSize: 15,
                        outline: "none",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: 16,
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: COLORS.textLight,
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                      fontSize: 14,
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
                    padding: "18px 24px",
                    borderRadius: 18,
                    fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: 15,
                    boxShadow: "0 10px 25px rgba(57,169,0,.2)",
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
                    padding: "18px 24px",
                    borderRadius: 18,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    fontSize: 15,
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                  Continuar con Google
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
                <p
                  style={{
                    marginTop: "1.5rem",
                    textAlign: "center",
                    color: COLORS.textLight,
                    fontSize: 13,
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
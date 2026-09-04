import { useNavigate, Link } from "react-router-dom";
import { IconArrowLeft as ArrowLeft, IconLoader2 as Loader2 } from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import type { useLoginForm } from "../hooks/useLoginForm";
import { LoginEmailField } from "./LoginEmailField";
import { LoginPasswordField } from "./LoginPasswordField";

const COLORS = theme;

interface LoginFormProps {
  formState: ReturnType<typeof useLoginForm>;
}

/** Encabezado, campos, "recordarme"/"olvidé contraseña", envío y pie de la columna derecha del login. */
export function LoginForm({ formState: f }: LoginFormProps) {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <button
        type="button"
        className="mobile-back"
        onClick={() => navigate("/")}
        style={{
          display: "none", alignItems: "center", gap: 8, border: "none",
          background: "#F1F5F9", color: COLORS.text, padding: "10px 14px",
          borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13,
        }}
      >
        <ArrowLeft size={15} />
        Volver
      </button>

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.8rem" }}>
          <img src={logoSena} alt="Logo SENA" style={{ height: 38, width: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ color: COLORS.primary, fontWeight: 800, marginBottom: 10, letterSpacing: 1, fontSize: 12 }}>
          ACCESO INSTITUCIONAL
        </div>

        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900,
            color: COLORS.text, lineHeight: 1, marginBottom: "0.6rem",
          }}
        >
          Iniciar Sesión
        </h2>

        <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13 }}>
          Ingresa tus credenciales institucionales para acceder al sistema
          ParkU.
        </p>
      </div>

      <form onSubmit={f.handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} noValidate>
        <LoginEmailField
          value={f.email}
          inputRef={f.emailInputRef}
          error={f.errors.email}
          touched={f.touched.email}
          onChange={f.setEmail}
          onBlur={() => f.handleBlur("email")}
        />

        <LoginPasswordField
          value={f.password}
          showPassword={f.showPassword}
          capsLockOn={f.capsLockOn}
          error={f.errors.password}
          touched={f.touched.password}
          onChange={f.setPassword}
          onBlur={() => f.handleBlur("password")}
          onKeyEvent={f.handlePasswordKeyEvent}
          onToggleShow={() => f.setShowPassword(!f.showPassword)}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem 1rem" }}>
          <label
            htmlFor="login-remember"
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: COLORS.textLight, fontWeight: 600, userSelect: "none" }}
          >
            <input
              id="login-remember"
              type="checkbox"
              checked={f.rememberMe}
              onChange={(e) => f.setRememberMe(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: COLORS.primary, cursor: "pointer" }}
            />
            Recordarme
          </label>

          <Link to="/forgot-password" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={f.loading || !f.isFormValid}
          style={{
            border: "none",
            background: f.loading || !f.isFormValid ? "#94A3B8" : COLORS.primary,
            color: "#fff",
            padding: "14px 20px",
            borderRadius: 14,
            fontWeight: 800,
            cursor: f.loading || !f.isFormValid ? "not-allowed" : "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: f.loading || !f.isFormValid ? "none" : "0 8px 22px rgba(57, 169, 0, 0.2)",
            opacity: f.loading || !f.isFormValid ? 0.7 : 1,
          }}
        >
          {f.loading && <Loader2 size={16} className="spin" />}
          {f.loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>

      <div
        style={{
          marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: `1px solid ${COLORS.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}
      >
        <p style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 600 }}>
          ¿No tienes una cuenta?{" "}
          <Link to="/register" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: 800 }}>
            Regístrate
          </Link>
        </p>
        <p style={{ textAlign: "center", color: COLORS.textLight, fontSize: 12 }}>
          © {new Date().getFullYear()} · Plataforma Institucional ParkU
        </p>
      </div>
    </div>
  );
}

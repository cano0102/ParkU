import type { Ref } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { IdentidadFields } from "./IdentidadFields";
import { NombreCorreoTelefonoFields } from "./NombreCorreoTelefonoFields";
import { PasswordFields } from "./PasswordFields";
import { TerminosCheckbox } from "./TerminosCheckbox";

const COLORS = theme;

interface RegisterFormProps {
  identificacionRef: Ref<HTMLInputElement>;
  formState: ReturnType<typeof useRegisterForm>;
}

/** Encabezado, campos y pie de la columna derecha del registro. */
export function RegisterForm({ identificacionRef, formState: f }: RegisterFormProps) {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
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

      <div style={{ marginBottom: "1.3rem" }}>
        <div style={{ marginBottom: "0.8rem" }}>
          <img src={logoSena} alt="Logo SENA" style={{ height: 38, width: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ color: COLORS.primary, fontWeight: 800, marginBottom: 10, letterSpacing: 1, fontSize: 12 }}>
          REGISTRO INSTITUCIONAL
        </div>

        <h2
          style={{
            fontSize: "clamp(1.6rem, 3.4vw, 2rem)", fontWeight: 900,
            color: COLORS.text, lineHeight: 1, marginBottom: "0.6rem",
          }}
        >
          Crear cuenta
        </h2>

        <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13 }}>
          Completa tus datos para registrarte en el sistema ParkU.
        </p>
      </div>

      <form onSubmit={f.handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <IdentidadFields
          tipoDocumento={f.form.tipoDocumento}
          identificacion={f.form.identificacion}
          tipoUsuario={f.form.tipoUsuario}
          identificacionRef={identificacionRef}
          identificacionError={f.err("identificacion")}
          tipoUsuarioError={f.err("tipoUsuario")}
          onTipoDocumentoChange={(v) => f.set("tipoDocumento", v)}
          onIdentificacionChange={f.setIdentificacion}
          onIdentificacionBlur={() => f.handleBlur("identificacion")}
          onTipoUsuarioChange={(v) => f.set("tipoUsuario", v)}
          onTipoUsuarioBlur={() => f.handleBlur("tipoUsuario")}
        />

        <NombreCorreoTelefonoFields
          nombre={f.form.nombre}
          correo={f.form.correo}
          numero={f.form.numero}
          nombreError={f.err("nombre")}
          correoError={f.err("correo")}
          numeroError={f.err("numero")}
          onNombreChange={f.setNombre}
          onNombreBlur={() => f.handleBlur("nombre")}
          onCorreoChange={(v) => f.set("correo", v)}
          onCorreoBlur={() => f.handleBlur("correo")}
          onNumeroChange={f.setTelefono}
          onNumeroBlur={() => f.handleBlur("numero")}
        />

        <PasswordFields
          password={f.form.password}
          confirmPassword={f.form.confirmPassword}
          showPassword={f.showPassword}
          showConfirmPassword={f.showConfirmPassword}
          passwordError={f.err("password")}
          confirmPasswordError={f.err("confirmPassword")}
          onPasswordChange={(v) => f.set("password", v)}
          onPasswordBlur={() => f.handleBlur("password")}
          onToggleShowPassword={() => f.setShowPassword((v) => !v)}
          onConfirmPasswordChange={(v) => f.set("confirmPassword", v)}
          onConfirmPasswordBlur={() => f.handleBlur("confirmPassword")}
          onToggleShowConfirmPassword={() => f.setShowConfirmPassword((v) => !v)}
        />

        <TerminosCheckbox
          checked={f.form.aceptaTerminos}
          error={f.err("aceptaTerminos")}
          onChange={(checked) => f.set("aceptaTerminos", checked)}
        />

        <button
          type="submit"
          disabled={f.loading}
          style={{
            border: "none",
            background: f.loading ? "#94A3B8" : COLORS.primary,
            color: "#fff",
            padding: "14px 20px",
            borderRadius: 14,
            fontWeight: 800,
            cursor: f.loading ? "not-allowed" : "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: f.loading ? "none" : "0 8px 22px rgba(57, 169, 0, 0.2)",
            opacity: f.loading ? 0.7 : 1,
            marginTop: 4,
          }}
        >
          {f.loading && <Loader2 size={16} className="spin" />}
          {f.loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <div
        style={{
          marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: `1px solid ${COLORS.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}
      >
        <p style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 600 }}>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: 800 }}>
            Inicia sesión
          </Link>
        </p>
        <p style={{ textAlign: "center", color: COLORS.textLight, fontSize: 12 }}>
          © {new Date().getFullYear()} · Plataforma Institucional ParkU
        </p>
      </div>
    </div>
  );
}

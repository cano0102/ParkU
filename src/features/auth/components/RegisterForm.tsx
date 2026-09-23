import { useEffect, useState, type RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconArrowLeft as ArrowLeft, IconLoader2 as Loader2 } from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { VehiculoAsociadoFields } from "@/features/conductores";
import { IdentidadFields } from "./IdentidadFields";
import { NombreCorreoTelefonoFields } from "./NombreCorreoTelefonoFields";
import { PasswordFields } from "./PasswordFields";
import { TerminosCheckbox } from "./TerminosCheckbox";
import { RequisitoVehiculo } from "./RequisitoVehiculo";

const COLORS = theme;

interface RegisterFormProps {
  identificacionRef: RefObject<HTMLInputElement>;
  formState: ReturnType<typeof useRegisterForm>;
}

/** Encabezado, campos y pie de la columna derecha del registro. */
export function RegisterForm({ identificacionRef, formState: f }: RegisterFormProps) {
  const navigate = useNavigate();
  // Filtro previo (ver RequisitoVehiculo): el formulario solo aparece cuando la persona confirma
  // que tiene carro o moto; sin vehículo, la cuenta no le sirve para nada.
  const [tieneVehiculo, setTieneVehiculo] = useState<boolean | null>(null);
  useEffect(() => {
    if (tieneVehiculo) identificacionRef.current?.focus();
  }, [tieneVehiculo, identificacionRef]);

  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
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
          {tieneVehiculo
            ? "Completa tus datos para registrarte en el sistema ParkU."
            : "La cuenta es para quienes tienen carro o moto que estacionar en el SENA."}
        </p>
      </div>

      {!tieneVehiculo && (
        <RequisitoVehiculo tieneVehiculo={tieneVehiculo} onResponder={setTieneVehiculo} />
      )}

      {tieneVehiculo && (
      <form onSubmit={f.handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <IdentidadFields
          tipoDocumento={f.form.tipoDocumento}
          identificacion={f.form.identificacion}
          identificacionRef={identificacionRef}
          identificacionError={f.err("identificacion")}
          checkingDocumento={f.checkingDocumento}
          tiposUsuario={f.tiposUsuario}
          tipoUsuarioId={f.form.tipoUsuarioId}
          tipoUsuarioIdError={f.err("tipoUsuarioId")}
          onTipoDocumentoChange={(v) => f.set("tipoDocumento", v)}
          onIdentificacionChange={f.setIdentificacion}
          onIdentificacionBlur={() => f.handleBlur("identificacion")}
          onTipoUsuarioIdChange={(v) => { f.set("tipoUsuarioId", v); f.handleBlur("tipoUsuarioId"); }}
        />

        <NombreCorreoTelefonoFields
          nombre={f.form.nombre}
          correo={f.form.correo}
          numero={f.form.numero}
          nombreError={f.err("nombre")}
          correoError={f.err("correo")}
          numeroError={f.err("numero")}
          checkingCorreo={f.checkingCorreo}
          checkingNumero={f.checkingNumero}
          onNombreChange={f.setNombre}
          onNombreBlur={() => f.handleBlur("nombre")}
          onCorreoChange={f.setCorreo}
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

        <div
          style={{
            marginTop: "0.4rem",
            paddingTop: "0.85rem",
            borderTop: `1px dashed ${COLORS.border}`,
          }}
        >
          <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: "0.6rem", lineHeight: 1.5 }}>
            Necesitas registrar un vehículo propio para crear tu cuenta.
          </p>
          <VehiculoAsociadoFields
            placa={f.form.vehiculoPlaca}
            placaError={f.err("vehiculoPlaca")}
            tipoVehiculo={f.form.vehiculoTipo}
            marca={f.form.vehiculoMarca}
            marcaError={f.err("vehiculoMarca")}
            linea={f.form.vehiculoLinea}
            modelo={f.form.vehiculoModelo}
            modeloError={f.err("vehiculoModelo")}
            color={f.form.vehiculoColor}
            colorError={f.err("vehiculoColor")}
            descripcionVehiculo={f.form.vehiculoDescripcion}
            onPlacaChange={(v) => f.set("vehiculoPlaca", v)}
            onPlacaBlur={() => f.handleBlur("vehiculoPlaca")}
            onTipoVehiculoChange={(tipo) => f.set("vehiculoTipo", tipo)}
            onMarcaChange={(v) => f.set("vehiculoMarca", v)}
            onMarcaBlur={() => f.handleBlur("vehiculoMarca")}
            onLineaChange={(v) => f.set("vehiculoLinea", v)}
            onModeloChange={(v) => f.set("vehiculoModelo", v)}
            onModeloBlur={() => f.handleBlur("vehiculoModelo")}
            onColorChange={(v) => f.set("vehiculoColor", v)}
            onColorBlur={() => f.handleBlur("vehiculoColor")}
            onDescripcionChange={(v) => f.set("vehiculoDescripcion", v)}
          />
        </div>

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
      )}

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

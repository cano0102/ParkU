import type React from "react";
import {
  IconCircleCheck as CheckCircle2,
  IconId as IdCard,
  IconMail as Mail,
  IconPencil as Pencil,
  IconPhone as Phone,
  IconDeviceFloppy as Save,
  IconShield as Shield,
  IconUser as User,
  IconX as X,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { useAuth } from "@/context/AuthContext";
import { nombreDeRol } from "@/services/core/roles";
import { quitarDigitos, filtrarTelefono, TIPOS_DOCUMENTO, NUMERO_DOCUMENTO_MAX } from "@/utils/validation";
import type { usePerfilForm, CampoPerfil } from "../hooks/usePerfilForm";

const C = theme;

const fieldInputStyle: React.CSSProperties = {
  width: "100%", marginTop: 6, padding: "8px 10px", borderRadius: 9,
  border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, fontFamily: "inherit",
  color: C.text, background: "#fff", outline: "none",
};

interface InformacionPersonalCardProps {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  form: ReturnType<typeof usePerfilForm>;
}

/** Cómo se escribe cada campo: filtra lo que se teclea y decide si es lista o texto. */
type ModoCampo = "texto" | "correo" | "telefono" | "documento" | "lista";

/** Tarjeta "Información personal": nombre, correo, teléfono y documento editables en línea. */
export function InformacionPersonalCard({ user, form }: InformacionPersonalCardProps) {
  const infoItems: Array<{
    key: CampoPerfil;
    icon: typeof User;
    label: string;
    modo: ModoCampo;
    valor: string;
    placeholder?: string;
  }> = [
    // El asterisco marca lo que no se puede dejar en blanco: solo el teléfono es opcional.
    { key: "nombre", icon: User, label: "Nombre *", modo: "texto", valor: user.nombre, placeholder: "Tu nombre completo" },
    { key: "correo", icon: Mail, label: "Correo *", modo: "correo", valor: user.correo, placeholder: "correo@sena.edu.co" },
    { key: "numero", icon: Phone, label: "Teléfono", modo: "telefono", valor: user.numero || "—", placeholder: "Ej: 3001234567" },
    // El id interno de la base no le dice nada a la persona que mira su propio perfil: lo que
    // la identifica es su documento, que la cuenta guarda desde la migración 002 del backend.
    { key: "tipoDocumento", icon: IdCard, label: "Tipo de documento *", modo: "lista", valor: user.tipoDocumento || "—" },
    {
      key: "numeroDocumento",
      icon: IdCard,
      label: "Número de documento *",
      modo: "documento",
      valor: user.numeroDocumento || "Sin documento registrado",
      placeholder: "1001234567",
    },
  ];

  /** El asterisco es para quien mira, no para quien usa un lector de pantalla ni para las
   *  pruebas: la etiqueta accesible es el nombre del campo a secas. */
  const accesible = (label: string) => label.replace(" *", "");

  /** Lo que se teclea, ya filtrado: sin dígitos en el nombre, solo dígitos en el documento. */
  const limpiar = (modo: ModoCampo, valor: string) => {
    if (modo === "texto") return quitarDigitos(valor);
    if (modo === "telefono") return filtrarTelefono(valor);
    if (modo === "documento") return valor.replace(/\D/g, "").slice(0, NUMERO_DOCUMENTO_MAX);
    return valor;
  };

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 16px", background: "#F8FAF8", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <User size={15} color={C.primary} />
          <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Información personal</span>
        </div>

        {!form.editMode ? (
          <button
            type="button"
            className="perfil-btn"
            onClick={form.startEdit}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, color: C.text }}
          >
            <Pencil size={12} /> Editar
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="perfil-btn"
              onClick={form.cancelEdit}
              disabled={form.guardando}
              aria-label="Cancelar edición"
              style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.textLight, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={14} />
            </button>
            <button
              type="button"
              className="perfil-btn"
              onClick={form.handleSaveProfile}
              disabled={form.profileInvalido || form.guardando}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "none",
                background: form.profileInvalido || form.guardando ? C.textMuted : C.primary, color: "#fff",
                cursor: form.profileInvalido || form.guardando ? "not-allowed" : "pointer",
                opacity: form.profileInvalido || form.guardando ? 0.65 : 1,
                fontSize: 12, fontWeight: 800, boxShadow: "0 4px 12px rgba(57,169,0,.25)",
              }}
            >
              <Save size={12} /> {form.guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "2px 16px" }}>
        {infoItems.map((item) => {
          const error = form.errorDe(item.key);
          return (
            <div key={item.key} className="perfil-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 2px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <item.icon size={16} color={C.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: C.textLight }}>
                  {item.label}
                </div>
                {form.editMode ? (
                  <>
                    {item.modo === "lista" ? (
                      <select
                        value={form.profileForm.tipoDocumento}
                        aria-label={accesible(item.label)}
                        onChange={(e) => form.setCampo("tipoDocumento", e.target.value)}
                        style={{ ...fieldInputStyle, appearance: "none", cursor: "pointer" }}
                      >
                        {TIPOS_DOCUMENTO.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={form.profileForm[item.key]}
                        type={item.modo === "correo" ? "email" : "text"}
                        inputMode={item.modo === "documento" ? "numeric" : undefined}
                        aria-label={accesible(item.label)}
                        onChange={(e) => form.setCampo(item.key, limpiar(item.modo, e.target.value))}
                        onBlur={() => form.markProfileTouched(item.key)}
                        placeholder={item.placeholder}
                        aria-invalid={!!error}
                        style={{ ...fieldInputStyle, borderColor: error ? C.danger : C.border }}
                      />
                    )}
                    {error && (
                      <p style={{ marginTop: 4, fontSize: 10.5, fontWeight: 700, color: C.danger }}>{error}</p>
                    )}
                  </>
                ) : (
                  <p style={{ marginTop: 2, fontSize: 13.5, fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.valor}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div className="perfil-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: C.textLight }}>Rol</div>
              {/* Ver PerfilHero: el nombre real viene de la API; nombreDeRol es el respaldo.
                  El rol NO se edita desde aquí: cambiárselo uno mismo sería darse permisos. */}
              <p style={{ marginTop: 2, fontSize: 13.5, fontWeight: 800, color: C.text }}>{user.rolNombre || nombreDeRol(user.rol)}</p>
            </div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "rgba(57,169,0,.1)", color: C.primaryDark }}>
            <CheckCircle2 size={12} /> Permisos activos
          </span>
        </div>
      </div>
    </div>
  );
}

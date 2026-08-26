import type React from "react";
import { CheckCircle2, IdCard, Mail, Pencil, Phone, Save, Shield, User, X } from "lucide-react";
import { theme } from "@/styles/theme";
import { useAuth } from "@/context/AuthContext";
import { nombreDeRol } from "@/services/core/roles";
import type { usePerfilForm } from "../hooks/usePerfilForm";

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

/** Tarjeta "Información personal": nombre/teléfono editables en línea, correo/id/rol de solo lectura. */
export function InformacionPersonalCard({ user, form }: InformacionPersonalCardProps) {
  const infoItems = [
    { key: "nombre" as const, icon: User, label: "Nombre", editable: true, value: user.nombre, placeholder: "Tu nombre completo" },
    { key: "correo" as const, icon: Mail, label: "Correo", editable: false, value: user.correo },
    { key: "numero" as const, icon: Phone, label: "Teléfono", editable: true, value: user.numero || "—", placeholder: "Ej: 3001234567" },
    { key: "id" as const, icon: IdCard, label: "ID de usuario", editable: false, value: user.id },
  ];

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "#F8FAF8", borderBottom: `1px solid ${C.border}` }}>
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
              aria-label="Cancelar edición"
              style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.textLight, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={14} />
            </button>
            <button
              type="button"
              className="perfil-btn"
              onClick={form.handleSaveProfile}
              disabled={form.profileInvalido}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "none",
                background: form.profileInvalido ? C.textMuted : C.primary, color: "#fff",
                cursor: form.profileInvalido ? "not-allowed" : "pointer", opacity: form.profileInvalido ? 0.65 : 1,
                fontSize: 12, fontWeight: 800, boxShadow: "0 4px 12px rgba(57,169,0,.25)",
              }}
            >
              <Save size={12} /> Guardar
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "2px 16px" }}>
        {infoItems.map((item) => (
          <div key={item.key} className="perfil-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 2px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <item.icon size={16} color={C.primary} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: C.textLight }}>
                {item.label}
              </div>
              {item.editable && form.editMode ? (
                <>
                  <input
                    value={item.key === "nombre" ? form.profileForm.nombre : form.profileForm.numero}
                    onChange={(e) => form.setProfileForm({ ...form.profileForm, [item.key === "nombre" ? "nombre" : "numero"]: e.target.value })}
                    onBlur={() => form.markProfileTouched(item.key === "nombre" ? "nombre" : "numero")}
                    placeholder={item.placeholder}
                    aria-invalid={!!(form.profileTouched[item.key as "nombre" | "numero"] && form.profileErrors[item.key as "nombre" | "numero"])}
                    style={{
                      ...fieldInputStyle,
                      borderColor: form.profileTouched[item.key as "nombre" | "numero"] && form.profileErrors[item.key as "nombre" | "numero"] ? C.danger : C.border,
                    }}
                  />
                  {form.profileTouched[item.key as "nombre" | "numero"] && form.profileErrors[item.key as "nombre" | "numero"] && (
                    <p style={{ marginTop: 4, fontSize: 10.5, fontWeight: 700, color: C.danger }}>
                      {form.profileErrors[item.key as "nombre" | "numero"]}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ marginTop: 2, fontSize: 13.5, fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.value}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="perfil-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: C.textLight }}>Rol</div>
              <p style={{ marginTop: 2, fontSize: 13.5, fontWeight: 800, color: C.text }}>{nombreDeRol(user.rol)}</p>
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

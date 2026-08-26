import { Key, Lock, Shield } from "lucide-react";
import { theme } from "@/styles/theme";

const C = theme;

interface SeguridadCardProps {
  onChangePassword: () => void;
}

/** Tarjeta "Seguridad": acceso al modal de cambio de contraseña. */
export function SeguridadCard({ onChangePassword }: SeguridadCardProps) {
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 16px", background: "#F8FAF8", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={15} color={C.primary} />
          <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Seguridad</span>
        </div>
        <button
          type="button"
          className="perfil-btn"
          onClick={onChangePassword}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 800, boxShadow: "0 4px 12px rgba(57,169,0,.25)" }}
        >
          <Key size={12} /> Cambiar
        </button>
      </div>

      <div style={{ padding: "2px 16px" }}>
        <div className="perfil-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>Contraseña protegida</div>
              <p style={{ marginTop: 2, fontSize: 11, color: C.textLight }}>Cámbiala periódicamente para mantener tu cuenta segura.</p>
            </div>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, color: C.textMuted, fontWeight: 700 }}>••••••••</div>
        </div>
      </div>
    </div>
  );
}

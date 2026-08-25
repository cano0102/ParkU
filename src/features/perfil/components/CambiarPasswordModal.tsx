import { CheckCircle2, Eye, EyeOff, Key, Lock, Save } from "lucide-react";
import { theme } from "@/styles/theme";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/utils/validation";
import type { usePasswordChange } from "../hooks/usePasswordChange";

const C = theme;

interface CambiarPasswordModalProps {
  pw: ReturnType<typeof usePasswordChange>;
}

/** Contenido del modal de cambio de contraseña: campos + checklist de requisitos en vivo. */
export function CambiarPasswordModal({ pw }: CambiarPasswordModalProps) {
  const fields = [
    {
      label: "Contraseña actual", icon: Lock, show: pw.showCurrent, setShow: pw.setShowCurrent,
      value: pw.passwordData.currentPassword,
      setValue: (e: React.ChangeEvent<HTMLInputElement>) => pw.setPasswordData({ ...pw.passwordData, currentPassword: e.target.value }),
    },
    {
      label: "Nueva contraseña", icon: Key, show: pw.showNew, setShow: pw.setShowNew,
      value: pw.passwordData.newPassword,
      setValue: (e: React.ChangeEvent<HTMLInputElement>) => pw.setPasswordData({ ...pw.passwordData, newPassword: e.target.value }),
    },
  ];

  const requisitos = [
    { label: "Contraseña actual ingresada", check: pw.currentFilled },
    { label: `Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`, check: pw.passwordLengthOk },
    { label: "Diferente a la contraseña actual", check: pw.passwordDifferent },
    { label: "Las contraseñas coinciden", check: pw.passwordsMatch },
  ];

  return (
    <form onSubmit={pw.handlePasswordChange}>
      <div style={{ padding: "1.1rem 1.6rem 0.9rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(57,169,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Key size={18} color={C.primary} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
            Seguridad de la cuenta
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1 }}>Cambiar contraseña</h2>
        </div>
      </div>

      <div style={{ padding: "1rem 1.6rem", display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.map(({ label, icon: Icon, show, setShow, value, setValue }) => (
          <div key={label}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{label}</label>
            <div style={{ position: "relative" }}>
              <Icon size={14} color={C.textLight} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type={show ? "text" : "password"}
                placeholder={label}
                value={value}
                onChange={setValue}
                maxLength={label === "Nueva contraseña" ? PASSWORD_MAX : undefined}
                style={{ width: "100%", padding: "10px 36px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC", color: C.text }}
              />
              <button
                type="button"
                className="perfil-eye-btn"
                onClick={() => setShow(!show)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Confirmar nueva contraseña</label>
          <div style={{ position: "relative" }}>
            <CheckCircle2 size={14} color={C.textLight} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type={pw.showNew ? "text" : "password"}
              placeholder="Confirmar nueva contraseña"
              value={pw.passwordData.confirmPassword}
              onChange={(e) => pw.setPasswordData({ ...pw.passwordData, confirmPassword: e.target.value })}
              maxLength={PASSWORD_MAX}
              style={{ width: "100%", padding: "10px 36px 10px 36px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC", color: C.text }}
            />
          </div>
        </div>

        <div style={{ borderRadius: 11, border: `1px solid ${C.border}`, background: "#F8FAFC", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          {requisitos.map(({ label, check }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: check ? C.primaryDark : C.textLight }}>
              <CheckCircle2 size={13} color={check ? C.primary : C.textMuted} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0.9rem 1.6rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="perfil-btn"
          onClick={pw.closePasswordDialog}
          style={{ padding: "10px 18px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700 }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="perfil-btn"
          disabled={!pw.canSubmitPassword || pw.submitting}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 11, border: "none",
            background: pw.canSubmitPassword ? C.primary : C.textMuted, color: "#fff", fontSize: 13, fontWeight: 800,
            cursor: pw.canSubmitPassword && !pw.submitting ? "pointer" : "not-allowed",
            opacity: pw.canSubmitPassword ? 1 : 0.65,
            boxShadow: pw.canSubmitPassword ? "0 6px 18px rgba(57,169,0,.22)" : "none",
          }}
        >
          <Save size={13} />
          {pw.submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

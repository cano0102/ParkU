import { useNavigate } from "react-router-dom";
import { IconArrowLeft as ArrowLeft } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { useForgotPasswordForm } from "./hooks/useForgotPasswordForm";
import { forgotPasswordStyles } from "./lib/styles";
import { ForgotPasswordLeftPanel } from "./components/ForgotPasswordLeftPanel";
import { ForgotPasswordRequestForm } from "./components/ForgotPasswordRequestForm";
import { ForgotPasswordSuccess } from "./components/ForgotPasswordSuccess";

const COLORS = theme;

export function ForgotPassword() {
  const navigate = useNavigate();
  const form = useForgotPasswordForm();

  return (
    <>
      <style>{forgotPasswordStyles}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#ffffff 0%,#F3F8F1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.2rem",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", width: 350, height: 350, borderRadius: "50%",
            background: "rgba(57,169,0,.07)", top: -100, right: -100, filter: "blur(10px)",
          }}
        />

        <div
          className="forgot-grid"
          style={{
            width: "100%",
            maxWidth: 820,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
            borderRadius: 24,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 20px 55px rgba(15,23,42,.08)",
          }}
        >
          <ForgotPasswordLeftPanel />

          <div style={{ padding: "2rem clamp(1.5rem,3vw,2.5rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 360 }}>
              <button
                type="button"
                className="mobile-back"
                onClick={() => navigate("/login")}
                style={{
                  display: "none", alignItems: "center", gap: 8, border: "none",
                  background: "#F1F5F9", color: COLORS.text, padding: "10px 14px",
                  borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13,
                }}
              >
                <ArrowLeft size={15} />
                Volver
              </button>

              {!form.emailSent ? (
                <ForgotPasswordRequestForm form={form} />
              ) : (
                <ForgotPasswordSuccess email={form.email} resetLink={form.resetLink} />
              )}

              <div style={{ marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: `1px solid ${COLORS.border}` }}>
                <p style={{ textAlign: "center", color: COLORS.textLight, fontSize: 12 }}>
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

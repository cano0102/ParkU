import { theme } from "@/styles/theme";
import { useResetPasswordForm } from "./hooks/useResetPasswordForm";
import { resetPasswordStyles } from "./lib/styles";
import { ResetPasswordLeftPanel } from "./components/ResetPasswordLeftPanel";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

const COLORS = theme;

export function ResetPassword() {
  const form = useResetPasswordForm();

  return (
    <>
      <style>{resetPasswordStyles}</style>

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
        <div
          style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "rgba(57,169,0,.08)", top: -120, right: -120, filter: "blur(10px)",
          }}
        />

        <div
          className="reset-grid"
          style={{
            width: "100%",
            maxWidth: 900,
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            overflow: "hidden",
            borderRadius: 24,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 25px 70px rgba(15,23,42,.08)",
          }}
        >
          <ResetPasswordLeftPanel />

          <div style={{ padding: "2rem clamp(1.5rem, 3vw, 2.5rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResetPasswordForm form={form} />
          </div>
        </div>
      </div>
    </>
  );
}

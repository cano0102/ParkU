import { theme } from "@/styles/theme";
import { useAnimated } from "./hooks/useAnimated";
import { useLoginForm } from "./hooks/useLoginForm";
import { loginStyles } from "./lib/styles";
import { LoginLeftPanel } from "./components/LoginLeftPanel";
import { LoginForm } from "./components/LoginForm";
import { LoginEmailNotice } from "./components/LoginEmailNotice";

const COLORS = theme;

export function Login() {
  const visible = useAnimated();
  const formState = useLoginForm();

  return (
    <>
      <style>{loginStyles}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #ffffff 0%, #F3F8F1 100%)",
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
            background: "rgba(57, 169, 0, 0.1)", top: -100, right: -100, filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute", width: 280, height: 280, borderRadius: "50%",
            background: "rgba(57, 169, 0, 0.08)", bottom: -80, left: -80, filter: "blur(60px)",
          }}
        />

        <div
          className={`fade ${visible ? "active" : ""} login-grid`}
          style={{
            width: "100%",
            maxWidth: 820,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
            borderRadius: 24,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 20px 55px rgba(15, 23, 42, 0.08)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <LoginLeftPanel />

          <div style={{ padding: "2rem clamp(1.5rem, 3vw, 2.5rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {formState.accesoNotificado ? (
              <LoginEmailNotice
                email={formState.accesoNotificado}
                onContinue={formState.continuarAlPanel}
              />
            ) : (
              <LoginForm formState={formState} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

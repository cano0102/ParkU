import { useEffect, useRef } from "react";
import { theme } from "@/styles/theme";
import { useAnimated } from "./hooks/useAnimated";
import { useRegisterForm } from "./hooks/useRegisterForm";
import { registerStyles } from "./lib/styles";
import { RegisterLeftPanel } from "./components/RegisterLeftPanel";
import { RegisterForm } from "./components/RegisterForm";

const COLORS = theme;

export function Register() {
  const visible = useAnimated();
  const formState = useRegisterForm();
  const primerCampoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primerCampoRef.current?.focus();
  }, []);

  return (
    <>
      <style>{registerStyles}</style>

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
          className={`fade ${visible ? "active" : ""} register-grid`}
          style={{
            width: "100%",
            maxWidth: 900,
            display: "grid",
            gridTemplateColumns: "0.85fr 1.15fr",
            overflow: "hidden",
            borderRadius: 24,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 20px 55px rgba(15, 23, 42, 0.08)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <RegisterLeftPanel />

          <div style={{ padding: "2rem clamp(1.5rem, 3vw, 2.5rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RegisterForm identificacionRef={primerCampoRef} formState={formState} />
          </div>
        </div>
      </div>
    </>
  );
}

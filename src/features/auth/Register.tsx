import { useEffect, useRef } from "react";
import { useAnimated } from "./hooks/useAnimated";
import { useRegisterForm } from "./hooks/useRegisterForm";
import { registerStyles } from "./lib/styles";
import { RegisterLeftPanel } from "./components/RegisterLeftPanel";
import { RegisterForm } from "./components/RegisterForm";

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
          /* A pantalla completa, igual que el login: columna verde + formulario ocupan toda la
             ventana. El formulario es largo, así que su columna hace scroll por sí sola cuando
             no cabe, sin que la columna verde se vaya con él. */
          className={`fade ${visible ? "active" : ""} register-grid`}
          style={{
            width: "100%",
            height: "100vh",
            display: "grid",
            gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
            background: "#fff",
            position: "relative",
            zIndex: 1,
          }}
        >
          <RegisterLeftPanel />

          {/* La columna del formulario es la que hace scroll (altura fija = ventana). El
              formulario se centra con `margin: auto` y no con align-items: center, porque con
              center, cuando el contenido es más alto que la columna, se recorta por arriba y por
              abajo y el botón final queda fuera de alcance. */}
          <div style={{ minHeight: 0, overflowY: "auto", display: "flex", padding: "clamp(1.5rem, 4vh, 3rem) clamp(1.25rem, 6vw, 5rem)" }}>
            <div style={{ margin: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
              <RegisterForm identificacionRef={primerCampoRef} formState={formState} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

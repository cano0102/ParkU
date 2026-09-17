import { useAnimated } from "./hooks/useAnimated";
import { useLoginForm } from "./hooks/useLoginForm";
import { loginStyles } from "./lib/styles";
import { LoginLeftPanel } from "./components/LoginLeftPanel";
import { LoginForm } from "./components/LoginForm";

export function Login() {
  const visible = useAnimated();
  const formState = useLoginForm();

  return (
    <>
      <style>{loginStyles}</style>

      <div
        style={{
          minHeight: "100dvh",
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
          /* A pantalla completa: la columna verde y el formulario se reparten todo el ancho y el
             alto de la ventana, sin la tarjeta centrada de antes (que dejaba media pantalla en
             blanco en un monitor normal). En móvil la columna verde se oculta (ver styles.ts). */
          className={`fade ${visible ? "active" : ""} login-grid`}
          style={{
            width: "100%",
            minHeight: "100dvh",
            display: "grid",
            gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
            background: "#fff",
            position: "relative",
            zIndex: 1,
          }}
        >
          <LoginLeftPanel />

          <div style={{ padding: "clamp(1.5rem, 4vh, 3rem) clamp(1.25rem, 6vw, 5rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LoginForm formState={formState} />
          </div>
        </div>
      </div>
    </>
  );
}

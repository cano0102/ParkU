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
          /* A pantalla completa: la columna verde y el formulario se reparten todo el ancho y el
             alto de la ventana, sin la tarjeta centrada de antes (que dejaba media pantalla en
             blanco en un monitor normal). En móvil la columna verde se oculta (ver styles.ts). */
          className={`fade ${visible ? "active" : ""} login-grid`}
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
          <LoginLeftPanel />

          {/* La columna del formulario es la que hace scroll (altura fija = ventana). El
              formulario se centra con `margin: auto` y no con align-items: center, porque con
              center, cuando el contenido es más alto que la columna, se recorta por arriba y por
              abajo y el botón final queda fuera de alcance. */}
          <div style={{ minHeight: 0, overflowY: "auto", display: "flex", padding: "clamp(1.5rem, 4vh, 3rem) clamp(1.25rem, 6vw, 5rem)" }}>
            <div style={{ margin: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
              <LoginForm formState={formState} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

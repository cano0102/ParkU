import { useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";
import { notFoundStyles } from "./notFound/styles";
import { NotFoundLeftPanel } from "./notFound/NotFoundLeftPanel";
import { NotFoundActionCard } from "./notFound/NotFoundActionCard";

const COLORS = theme;

export function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <style>{notFoundStyles}</style>

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
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(57,169,0,.08)",
            top: -120,
            right: -120,
            filter: "blur(10px)",
          }}
        />

        <div
          className="notfound-grid"
          style={{
            width: "100%",
            maxWidth: 1180,
            display: "grid",
            gridTemplateColumns: "1fr .9fr",
            overflow: "hidden",
            borderRadius: 36,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 25px 70px rgba(15,23,42,.08)",
          }}
        >
          <NotFoundLeftPanel onBack={() => navigate(-1)} />
          <NotFoundActionCard onGoDashboard={() => navigate("/app/dashboard")} />
        </div>
      </div>
    </>
  );
}

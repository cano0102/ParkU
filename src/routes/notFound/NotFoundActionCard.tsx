import { IconHome as Home, IconShieldCheck as ShieldCheck } from "@tabler/icons-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface NotFoundActionCardProps {
  onGoDashboard: () => void;
}

/** Panel derecho: mensaje de error, tarjeta de acción "Volver al Dashboard" y el pie de página. */
export function NotFoundActionCard({ onGoDashboard }: NotFoundActionCardProps) {
  return (
    <div style={{ padding: "4rem clamp(2rem,4vw,4rem)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ color: COLORS.primary, fontWeight: 800, marginBottom: 14, letterSpacing: 1 }}>
            ERROR DEL SISTEMA
          </div>

          <h2 style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, color: COLORS.text, lineHeight: 1, marginBottom: "1rem" }}>
            Ruta
            <br />
            inválida
          </h2>

          <p style={{ color: COLORS.textLight, lineHeight: 1.8, fontSize: 16 }}>
            Parece que intentaste acceder
            a una ruta que no existe dentro
            de la plataforma ParkU.
          </p>
        </div>

        <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: "2rem", background: "#fff", boxShadow: "0 10px 30px rgba(15,23,42,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", color: COLORS.primaryDark, fontWeight: 800 }}>
            <ShieldCheck size={22} />
            Plataforma protegida
          </div>

          <p style={{ color: COLORS.textLight, lineHeight: 1.8, marginBottom: "2rem" }}>
            Puedes volver al dashboard
            principal para continuar usando
            el sistema normalmente.
          </p>

          <button
            onClick={onGoDashboard}
            style={{
              width: "100%", border: "none", background: COLORS.primary, color: "#fff",
              padding: "18px 24px", borderRadius: 18, fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 15,
              boxShadow: "0 10px 25px rgba(57,169,0,.2)",
            }}
          >
            <Home size={18} />
            Volver al Dashboard
          </button>
        </div>

        <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: `1px solid ${COLORS.border}` }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#ECFDF3", padding: "16px 18px", borderRadius: 16,
              color: COLORS.primaryDark, fontWeight: 700, fontSize: 14,
            }}
          >
            <ShieldCheck size={18} />
            Plataforma protegida y segura
          </div>

          <p style={{ marginTop: "1.5rem", textAlign: "center", color: COLORS.textLight, fontSize: 13 }}>
            © 2026 · Plataforma
            Institucional ParkU
          </p>
        </div>
      </div>
    </div>
  );
}

import { theme } from "@/styles/theme";
import { useCountUp } from "../hooks/useCountUp";

const COLORS = theme;

interface StatCardProps {
  label: string;
  value: number;
  active: boolean;
}

/** Tarjeta de una estadística del panel del hero, con conteo animado al hacerse visible. */
export function StatCard({ label, value, active }: StatCardProps) {
  const count = useCountUp(value, active);

  return (
    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: "1.5rem",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: COLORS.primary,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count.toLocaleString("es-CO")}
      </div>

      <div
        style={{
          color: COLORS.textLight,
          marginTop: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

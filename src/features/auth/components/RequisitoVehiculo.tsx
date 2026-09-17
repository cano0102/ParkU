import { Link } from "react-router-dom";
import { IconCar as Car, IconBike as Bike, IconInfoCircle as Info } from "@tabler/icons-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface RequisitoVehiculoProps {
  /** null = todavía no respondió; false = dijo que no tiene vehículo. */
  tieneVehiculo: boolean | null;
  onResponder: (tiene: boolean) => void;
}

/**
 * Filtro previo al formulario de registro: ParkU sirve para reservar celda y registrar el
 * ingreso de un vehículo propio, así que quien no tiene carro ni moto no tiene nada que hacer
 * con una cuenta. Preguntarlo primero le ahorra llenar todo el formulario para descubrirlo
 * después (y evita cuentas sin uso en el sistema).
 */
export function RequisitoVehiculo({ tieneVehiculo, onResponder }: RequisitoVehiculoProps) {
  if (tieneVehiculo === false) {
    return (
      <div
        role="status"
        style={{
          borderRadius: 16, border: `1px solid ${COLORS.border}`, background: "#F8FAFC",
          padding: "1.2rem 1.3rem", display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <Info size={20} color={COLORS.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 800, color: COLORS.text, fontSize: 14, marginBottom: 4 }}>
              Por ahora no necesitas una cuenta
            </p>
            <p style={{ color: COLORS.textLight, fontSize: 13, lineHeight: 1.6 }}>
              ParkU sirve para reservar celda y registrar el ingreso de <strong>tu propio carro o
              moto</strong> en el parqueadero del SENA. Sin un vehículo no hay nada que gestionar
              desde la aplicación. Cuando tengas uno, vuelve y crea tu cuenta en un minuto.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onResponder(true)}
            style={{
              border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text,
              padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            Sí tengo vehículo, continuar
          </button>
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", padding: "10px 14px", borderRadius: 12,
              background: COLORS.primary, color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none",
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 16, border: `1px solid ${COLORS.primaryLight}`, background: COLORS.primaryPale,
        padding: "1.2rem 1.3rem", display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      <div>
        <p style={{ fontWeight: 800, color: COLORS.primaryDark, fontSize: 14, marginBottom: 4 }}>
          Antes de empezar: ¿tienes carro o moto?
        </p>
        <p style={{ color: COLORS.primaryDark, fontSize: 13, lineHeight: 1.6 }}>
          ParkU es para reservar celda y registrar el ingreso de tu propio vehículo. Si no tienes
          uno, la cuenta no te serviría de nada.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onResponder(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, border: "none",
            background: COLORS.primary, color: "#fff", padding: "11px 16px", borderRadius: 12,
            fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 8px 22px rgba(57, 169, 0, 0.2)",
          }}
        >
          <Car size={16} /><Bike size={16} />
          Sí, tengo vehículo
        </button>
        <button
          type="button"
          onClick={() => onResponder(false)}
          style={{
            border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text,
            padding: "11px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}
        >
          No tengo vehículo
        </button>
      </div>
    </div>
  );
}

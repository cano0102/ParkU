import { Car } from "lucide-react";
import { FormField } from "@/components/shared";
import { COLORS, inputStyle } from "../lib/helpers";

interface VehiculoAsociadoFieldsProps {
  placa: string;
  placaError?: string;
  tipoVehiculo: "carro" | "moto";
  marca: string;
  descripcionVehiculo: string;
  onPlacaChange: (value: string) => void;
  onPlacaBlur: () => void;
  onTipoVehiculoChange: (tipo: "carro" | "moto") => void;
  onMarcaChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
}

/** Sección "Vehículo asociado": placa, tipo, marca y descripción. */
export function VehiculoAsociadoFields({
  placa, placaError, tipoVehiculo, marca, descripcionVehiculo,
  onPlacaChange, onPlacaBlur, onTipoVehiculoChange, onMarcaChange, onDescripcionChange,
}: VehiculoAsociadoFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Vehículo asociado
        </p>
        {placa && (
          <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.primary, background: "rgba(57,169,0,.1)", padding: "2px 10px", borderRadius: 999 }}>
            Placa: {placa}
          </span>
        )}
      </div>
      <div className="cf-modal-grid" style={{ padding: "0.85rem 1.1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <FormField label="Placa *" error={placaError} hint="Sin espacios ni guiones, ej: ABC123" style={{ gridColumn: "1 / -1" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", padding: "4px 14px 4px 4px", borderRadius: 11,
              border: `2px solid ${placaError ? "#FCA5A5" : COLORS.primary}`,
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <Car size={16} />
            </div>
            <input
              type="text"
              placeholder="Ej: ABC123"
              value={placa}
              onChange={(e) => onPlacaChange(e.target.value.toUpperCase())}
              onBlur={onPlacaBlur}
              maxLength={10}
              required
              style={{ ...inputStyle, border: "none", background: "transparent", padding: "8px 0", fontSize: 15, fontWeight: 700, color: COLORS.text, letterSpacing: 1 }}
            />
          </div>
        </FormField>

        <FormField label="Tipo de vehículo">
          <div style={{ display: "flex", gap: 8 }}>
            {(["carro", "moto"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => onTipoVehiculoChange(tipo)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 11, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  border: tipoVehiculo === tipo ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                  background: tipoVehiculo === tipo ? "rgba(57,169,0,.1)" : COLORS.bg,
                  color: tipoVehiculo === tipo ? COLORS.primaryDark : COLORS.textLight,
                }}
              >
                {tipo === "carro" ? "🚗 Carro" : "🏍️ Moto"}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Marca">
          <input
            type="text"
            placeholder="ej. Chevrolet Spark"
            value={marca}
            onChange={(e) => onMarcaChange(e.target.value)}
            style={inputStyle}
          />
        </FormField>

        <FormField label="Descripción adicional" hint={`${descripcionVehiculo.length}/200`} style={{ gridColumn: "1 / -1" }}>
          <textarea
            rows={1}
            maxLength={200}
            placeholder="Observaciones sobre el vehículo…"
            value={descripcionVehiculo}
            onChange={(e) => onDescripcionChange(e.target.value)}
            style={{ ...inputStyle, resize: "none" }}
          />
        </FormField>
      </div>
    </section>
  );
}

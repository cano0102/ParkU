import { Car } from "lucide-react";
import { FormField } from "@/components/shared";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS, TIPOS_VEHICULO, getTipoVehiculoStyle, inputStyle } from "../lib/helpers";

interface VehiculoAsociadoFieldsProps {
  placa: string;
  placaError?: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  marcaError?: string;
  color: string;
  colorError?: string;
  descripcionVehiculo: string;
  onPlacaChange: (value: string) => void;
  onPlacaBlur: () => void;
  onTipoVehiculoChange: (tipo: Vehiculo["tipo"]) => void;
  onMarcaChange: (value: string) => void;
  onMarcaBlur: () => void;
  onColorChange: (value: string) => void;
  onColorBlur: () => void;
  onDescripcionChange: (value: string) => void;
}

/** Sección "Vehículo asociado": placa, tipo, marca, color y descripción. */
export function VehiculoAsociadoFields({
  placa, placaError, tipoVehiculo, marca, marcaError, color, colorError, descripcionVehiculo,
  onPlacaChange, onPlacaBlur, onTipoVehiculoChange, onMarcaChange, onMarcaBlur, onColorChange, onColorBlur, onDescripcionChange,
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
      <div className="cf-modal-grid" style={{ padding: "0.85rem 1.1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 9 }}>
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
              maxLength={6}
              required
              style={{ ...inputStyle, border: "none", background: "transparent", padding: "8px 0", fontSize: 15, fontWeight: 700, color: COLORS.text, letterSpacing: 1 }}
            />
          </div>
        </FormField>

        <FormField label="Tipo de vehículo">
          <select
            value={tipoVehiculo}
            onChange={(e) => onTipoVehiculoChange(e.target.value as Vehiculo["tipo"])}
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            {TIPOS_VEHICULO.map((tipo) => (
              <option key={tipo} value={tipo}>{getTipoVehiculoStyle(tipo).label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Marca *" error={marcaError}>
          <input
            type="text"
            placeholder="ej. Chevrolet Spark"
            value={marca}
            onChange={(e) => onMarcaChange(e.target.value)}
            onBlur={onMarcaBlur}
            style={inputStyle}
          />
        </FormField>

        <FormField label="Color *" error={colorError}>
          <input
            type="text"
            placeholder="ej. Rojo"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            onBlur={onColorBlur}
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

import { IconCar as Car } from "@tabler/icons-react";
import { FormField } from "@/components/shared";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS, TIPOS_VEHICULO, getTipoVehiculoStyle, inputStyle } from "../lib/helpers";
import { MarcaField } from "./MarcaField";

interface VehiculoAsociadoFieldsProps {
  placa: string;
  placaError?: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  marcaError?: string;
  /** Línea del vehículo ("Spark GT", "Boxer 150"). Columna real de `vehiculo`. */
  linea: string;
  /** Año del modelo: en Colombia el "modelo" de un vehículo ES su año. */
  modelo: string;
  modeloError?: string;
  color: string;
  colorError?: string;
  descripcionVehiculo: string;
  onPlacaChange: (value: string) => void;
  onPlacaBlur: () => void;
  onTipoVehiculoChange: (tipo: Vehiculo["tipo"]) => void;
  onMarcaChange: (value: string) => void;
  onMarcaBlur: () => void;
  onLineaChange: (value: string) => void;
  onModeloChange: (value: string) => void;
  onModeloBlur: () => void;
  onColorChange: (value: string) => void;
  onColorBlur: () => void;
  onDescripcionChange: (value: string) => void;
}

/** Sección "Vehículo asociado": placa, tipo, marca, línea, modelo (año), color y descripción. */
export function VehiculoAsociadoFields({
  placa, placaError, tipoVehiculo, marca, marcaError, linea, modelo, modeloError, color, colorError, descripcionVehiculo,
  onPlacaChange, onPlacaBlur, onTipoVehiculoChange, onMarcaChange, onMarcaBlur,
  onLineaChange, onModeloChange, onModeloBlur, onColorChange, onColorBlur, onDescripcionChange,
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
        {/* El tipo va PRIMERO: de él depende el formato válido de la placa (un carro lleva
            3 letras y 3 números; una moto termina en letra), así que elegirlo antes evita
            escribir una placa que el formulario va a rechazar por el tipo equivocado. */}
        <FormField label="Tipo de vehículo *" style={{ gridColumn: "1 / -1" }}>
          <select
            value={tipoVehiculo}
            aria-label="Tipo de vehículo"
            onChange={(e) => onTipoVehiculoChange(e.target.value as Vehiculo["tipo"])}
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            {TIPOS_VEHICULO.map((tipo) => (
              <option key={tipo} value={tipo}>{getTipoVehiculoStyle(tipo).label}</option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Placa *"
          error={placaError}
          hint={tipoVehiculo === "moto" ? "3 letras y 2 números, ej: ABC12 (o ABC12D)" : "3 letras y 3 números, ej: ABC123"}
          style={{ gridColumn: "1 / -1" }}
        >
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

        {/* La marca sugiere las que más ruedan en Colombia, filtradas por el tipo elegido,
            pero acepta cualquier texto. */}
        <MarcaField
          tipoVehiculo={tipoVehiculo}
          value={marca}
          error={marcaError}
          onChange={onMarcaChange}
          onBlur={onMarcaBlur}
        />

        <FormField label="Línea (opcional)">
          <input
            type="text"
            placeholder="ej. Spark GT"
            value={linea}
            onChange={(e) => onLineaChange(e.target.value)}
            style={inputStyle}
          />
        </FormField>

        <FormField label="Modelo (año, opcional)" error={modeloError}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="ej. 2020"
            value={modelo}
            /* Solo dígitos y cuatro como mucho: es un año, no un texto libre. */
            onChange={(e) => onModeloChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onBlur={onModeloBlur}
            maxLength={4}
            style={{ ...inputStyle, ...(modeloError ? { border: "1px solid #FCA5A5", background: "#FEF2F2" } : {}) }}
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

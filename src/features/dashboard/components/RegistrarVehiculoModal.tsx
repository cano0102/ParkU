import { IconCar as Car, IconPlus as Plus } from "@tabler/icons-react";
import { VehiculoAsociadoFields, type ErroresVehiculo } from "@/features/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface RegistrarVehiculoModalProps {
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  descripcionVehiculo: string;
  errors: ErroresVehiculo;
  touched: boolean;
  guardando: boolean;
  onPlacaChange: (v: string) => void;
  onTipoVehiculoChange: (tipo: Vehiculo["tipo"]) => void;
  onMarcaChange: (v: string) => void;
  onLineaChange: (v: string) => void;
  onModeloChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onDescripcionChange: (v: string) => void;
  onMarkTouched: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Registrar un vehículo propio desde el Dashboard del conductor. */
export function RegistrarVehiculoModal({
  placa, tipoVehiculo, marca, linea, modelo, color, descripcionVehiculo, errors, touched, guardando,
  onPlacaChange, onTipoVehiculoChange, onMarcaChange, onLineaChange, onModeloChange, onColorChange,
  onDescripcionChange, onMarkTouched, onSubmit, onCancel,
}: RegistrarVehiculoModalProps) {
  return (
    <div>
      <div style={{ padding: "1.4rem 1.8rem", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(57,169,0,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Car size={18} color={COLORS.primary} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: COLORS.primary, textTransform: "uppercase" }}>
            Nuevo vehículo
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>
            Registrar mi vehículo
          </h2>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        <VehiculoAsociadoFields
          placa={placa}
          placaError={touched ? errors.placa : undefined}
          tipoVehiculo={tipoVehiculo}
          marca={marca}
          marcaError={touched ? errors.marca : undefined}
          linea={linea}
          lineaError={touched ? errors.linea : undefined}
          modelo={modelo}
          modeloError={touched ? errors.modelo : undefined}
          color={color}
          colorError={touched ? errors.color : undefined}
          descripcionVehiculo={descripcionVehiculo}
          descripcionError={touched ? errors.descripcionVehiculo : undefined}
          onPlacaChange={onPlacaChange}
          onPlacaBlur={onMarkTouched}
          onTipoVehiculoChange={onTipoVehiculoChange}
          onMarcaChange={onMarcaChange}
          onMarcaBlur={onMarkTouched}
          onLineaChange={onLineaChange}
          onModeloChange={onModeloChange}
          onModeloBlur={onMarkTouched}
          onColorChange={onColorChange}
          onColorBlur={onMarkTouched}
          onDescripcionChange={onDescripcionChange}
        />
      </div>

      <div style={{ padding: "1rem 1.8rem", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          disabled={guardando}
          style={{
            padding: "10px 20px", borderRadius: 12, border: `1px solid ${COLORS.border}`,
            background: "#fff", color: COLORS.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={guardando}
          style={{
            padding: "10px 24px", borderRadius: 12, border: "none", background: COLORS.primary, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: guardando ? "default" : "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 18px rgba(57,169,0,.22)",
            opacity: guardando ? 0.7 : 1,
          }}
        >
          <Plus size={14} />
          {guardando ? "Registrando..." : "Registrar vehículo"}
        </button>
      </div>
    </div>
  );
}

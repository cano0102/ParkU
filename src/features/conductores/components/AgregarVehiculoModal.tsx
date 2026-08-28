import { Car, Plus } from "lucide-react";
import type { Conductor } from "@/services/api/conductores";
import { COLORS } from "../lib/helpers";
import { VehiculoAsociadoFields } from "./VehiculoAsociadoFields";

interface AgregarVehiculoModalProps {
  conductor: Conductor;
  placa: string;
  tipoVehiculo: "carro" | "moto" | "bicicleta" | "camion" | "bus";
  marca: string;
  descripcionVehiculo: string;
  error: string | null;
  touched: boolean;
  onPlacaChange: (v: string) => void;
  onTipoVehiculoChange: (tipo: AgregarVehiculoModalProps["tipoVehiculo"]) => void;
  onMarcaChange: (v: string) => void;
  onDescripcionChange: (v: string) => void;
  onMarkTouched: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Agregar un vehículo más a un conductor que ya existe, sin editar el resto de su ficha. */
export function AgregarVehiculoModal({
  conductor, placa, tipoVehiculo, marca, descripcionVehiculo, error, touched,
  onPlacaChange, onTipoVehiculoChange, onMarcaChange, onDescripcionChange, onMarkTouched,
  onSubmit, onCancel,
}: AgregarVehiculoModalProps) {
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
            Agregar a {conductor.nombre}
          </h2>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        <VehiculoAsociadoFields
          placa={placa}
          placaError={touched ? error ?? undefined : undefined}
          tipoVehiculo={tipoVehiculo}
          marca={marca}
          descripcionVehiculo={descripcionVehiculo}
          onPlacaChange={onPlacaChange}
          onPlacaBlur={onMarkTouched}
          onTipoVehiculoChange={onTipoVehiculoChange}
          onMarcaChange={onMarcaChange}
          onDescripcionChange={onDescripcionChange}
        />
      </div>

      <div style={{ padding: "1rem 1.8rem", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px", borderRadius: 12, border: `1px solid ${COLORS.border}`,
            background: "#fff", color: COLORS.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          style={{
            padding: "10px 24px", borderRadius: 12, border: "none", background: COLORS.primary, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 18px rgba(57,169,0,.22)",
          }}
        >
          <Plus size={14} />
          Agregar Vehículo
        </button>
      </div>
    </div>
  );
}

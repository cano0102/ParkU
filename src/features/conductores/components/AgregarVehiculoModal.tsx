import { IconCar as Car, IconPlus as Plus, IconUsers as Users } from "@tabler/icons-react";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS } from "../lib/helpers";
import { VehiculoAsociadoFields } from "./VehiculoAsociadoFields";
import type { ModoAgregarVehiculo } from "../hooks/useAgregarVehiculo";

interface AgregarVehiculoModalProps {
  conductor: Conductor;
  modo: ModoAgregarVehiculo;
  onModoChange: (modo: ModoAgregarVehiculo) => void;
  placa: string;
  tipoVehiculo: "carro" | "moto" | "bicicleta" | "camion" | "bus";
  marca: string;
  color: string;
  descripcionVehiculo: string;
  errors: { placa?: string; marca?: string; color?: string };
  touched: boolean;
  onPlacaChange: (v: string) => void;
  onTipoVehiculoChange: (tipo: AgregarVehiculoModalProps["tipoVehiculo"]) => void;
  onMarcaChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onDescripcionChange: (v: string) => void;
  onMarkTouched: () => void;
  busquedaExistente: string;
  onBusquedaExistenteChange: (v: string) => void;
  vehiculoExistenteId: string;
  onVehiculoExistenteIdChange: (v: string) => void;
  vehiculosVinculables: Vehiculo[];
  onSubmit: () => void;
  onCancel: () => void;
}

/** Agregar un vehículo a un conductor que ya existe: uno NUEVO, o vincular uno YA EXISTENTE
 *  (de otro conductor) como copropietario — un vehículo puede tener más de un dueño. */
export function AgregarVehiculoModal({
  conductor, modo, onModoChange, placa, tipoVehiculo, marca, color, descripcionVehiculo, errors, touched,
  onPlacaChange, onTipoVehiculoChange, onMarcaChange, onColorChange, onDescripcionChange, onMarkTouched,
  busquedaExistente, onBusquedaExistenteChange, vehiculoExistenteId, onVehiculoExistenteIdChange, vehiculosVinculables,
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
            {modo === "nuevo" ? "Nuevo vehículo" : "Copropietario"}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>
            Agregar a {conductor.nombre}
          </h2>
        </div>
      </div>

      <div style={{ padding: "1rem 1.8rem 0" }}>
        <div style={{ display: "flex", gap: 6, background: "#F1F5F9", borderRadius: 12, padding: 4 }}>
          {(["nuevo", "existente"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModoChange(m)}
              style={{
                flex: 1, padding: "8px 10px", borderRadius: 9, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 800, fontFamily: "inherit",
                background: modo === m ? "#fff" : "transparent",
                color: modo === m ? COLORS.primary : COLORS.textLight,
                boxShadow: modo === m ? "0 1px 4px rgba(0,0,0,.08)" : "none",
              }}
            >
              {m === "nuevo" ? "Vehículo nuevo" : "Vincular existente"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        {modo === "nuevo" ? (
          <VehiculoAsociadoFields
            placa={placa}
            placaError={touched ? errors.placa : undefined}
            tipoVehiculo={tipoVehiculo}
            marca={marca}
            marcaError={touched ? errors.marca : undefined}
            color={color}
            colorError={touched ? errors.color : undefined}
            descripcionVehiculo={descripcionVehiculo}
            onPlacaChange={onPlacaChange}
            onPlacaBlur={onMarkTouched}
            onTipoVehiculoChange={onTipoVehiculoChange}
            onMarcaChange={onMarcaChange}
            onMarcaBlur={onMarkTouched}
            onColorChange={onColorChange}
            onColorBlur={onMarkTouched}
            onDescripcionChange={onDescripcionChange}
          />
        ) : (
          <div>
            <p style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 10 }}>
              Vincula un vehículo ya registrado a nombre de otro conductor — quedará también a nombre de{" "}
              <strong>{conductor.nombre}</strong> como copropietario, sin quitárselo al dueño principal.
            </p>
            <input
              type="text"
              placeholder="Buscar por placa, marca o dueño actual..."
              value={busquedaExistente}
              onChange={(e) => onBusquedaExistenteChange(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
                fontSize: 13, fontFamily: "inherit", marginBottom: 8,
              }}
            />
            <div style={{ maxHeight: 220, overflowY: "auto", border: `1px solid ${COLORS.border}`, borderRadius: 11, padding: 4 }}>
              {vehiculosVinculables.length === 0 && (
                <p style={{ fontSize: 11, color: COLORS.textLight, padding: "10px 8px" }}>
                  Sin vehículos disponibles para vincular.
                </p>
              )}
              {vehiculosVinculables.map((v) => {
                const selected = vehiculoExistenteId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => onVehiculoExistenteIdChange(v.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
                      cursor: "pointer", background: selected ? "rgba(57,169,0,.1)" : "transparent",
                    }}
                  >
                    <Users size={14} color={selected ? COLORS.primary : COLORS.textLight} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{v.placa} — {v.marca || "Sin marca"}</p>
                      <p style={{ fontSize: 10, color: COLORS.textLight }}>Dueño actual: {v.conductorNombre || "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
          {modo === "nuevo" ? "Agregar Vehículo" : "Vincular Copropietario"}
        </button>
      </div>
    </div>
  );
}

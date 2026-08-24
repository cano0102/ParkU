import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";

const C = theme;

interface IncidenteVehiculoAsignadoFieldsProps {
  vehiculo: string;
  asignadoA: string;
  vehiculos: Vehiculo[];
  showNotasResolucion: boolean;
  notasResolucion: string;
  onVehiculoChange: (value: string) => void;
  onAsignadoAChange: (value: string) => void;
  onNotasResolucionChange: (value: string) => void;
}

/** Campos vehículo, asignar a, y notas de resolución (solo al editar un incidente resuelto). */
export function IncidenteVehiculoAsignadoFields({
  vehiculo, asignadoA, vehiculos, showNotasResolucion, notasResolucion,
  onVehiculoChange, onAsignadoAChange, onNotasResolucionChange,
}: IncidenteVehiculoAsignadoFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="vehiculo" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Vehículo (opcional)
        </label>
        <select
          id="vehiculo"
          value={vehiculo}
          onChange={(e) => onVehiculoChange(e.target.value)}
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 11,
            border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
            fontFamily: "inherit", background: "#F8FAFC",
          }}
        >
          <option value="">Ninguno</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.placa}>
              {v.placa} — {v.marca} {v.modelo}
            </option>
          ))}
        </select>
        <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
          Si seleccionas una celda ocupada, la placa se sugiere automáticamente.
        </p>
      </div>

      <div>
        <label htmlFor="asignadoA" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Asignar a
        </label>
        <input
          id="asignadoA"
          type="text"
          placeholder="Nombre del responsable"
          value={asignadoA}
          onChange={(e) => onAsignadoAChange(e.target.value)}
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 11,
            border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
            fontFamily: "inherit", background: "#F8FAFC",
          }}
        />
      </div>

      {showNotasResolucion && (
        <div>
          <label htmlFor="notasResolucion" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Notas de resolución
          </label>
          <textarea
            id="notasResolucion"
            rows={2}
            placeholder="¿Qué se hizo para resolver el incidente?"
            value={notasResolucion}
            onChange={(e) => onNotasResolucionChange(e.target.value)}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 11,
              border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
              fontFamily: "inherit", background: "#F8FAFC", resize: "none",
            }}
          />
        </div>
      )}
    </>
  );
}

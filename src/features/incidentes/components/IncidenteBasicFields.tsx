import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { CELDA_ESTADO_CONFIG } from "../lib/constants";
import { CeldaBadgeInline } from "./IncidenteBadges";

const C = theme;

interface IncidenteBasicFieldsProps {
  descripcion: string;
  parqueaderoId: string;
  celdaId: string;
  parqueaderos: Parqueadero[];
  celdasDelParqueadero: Celda[];
  celdaSeleccionada: Celda | undefined;
  ocupanteSeleccionado: { vehiculo: { placa: string }; conductorNombre?: string } | null;
  descripcionError?: string;
  parqueaderoError?: string;
  onDescripcionChange: (value: string) => void;
  onDescripcionBlur: () => void;
  onParqueaderoChange: (value: string) => void;
  onParqueaderoBlur: () => void;
  onCeldaChange: (value: string) => void;
  ocupanteDeCelda: (celdaId?: string) => { vehiculo: { placa: string } } | null;
}

/** Campos descripción + parqueadero + celda del formulario de incidente. */
export function IncidenteBasicFields({
  descripcion, parqueaderoId, celdaId, parqueaderos, celdasDelParqueadero,
  celdaSeleccionada, ocupanteSeleccionado, descripcionError, parqueaderoError,
  onDescripcionChange, onDescripcionBlur, onParqueaderoChange, onParqueaderoBlur, onCeldaChange, ocupanteDeCelda,
}: IncidenteBasicFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="descripcion" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Descripción *
        </label>
        <textarea
          id="descripcion"
          rows={3}
          placeholder="Describe el incidente o novedad..."
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          onBlur={onDescripcionBlur}
          aria-invalid={!!descripcionError}
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 11,
            border: `1px solid ${descripcionError ? C.danger : C.border}`,
            fontSize: 13, outline: "none",
            fontFamily: "inherit", background: "#F8FAFC", resize: "none",
          }}
        />
        {descripcionError && (
          <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{descripcionError}</p>
        )}
      </div>

      <div className="incidentes-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="parqueadero" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Parqueadero *
          </label>
          <select
            id="parqueadero"
            value={parqueaderoId}
            onChange={(e) => onParqueaderoChange(e.target.value)}
            onBlur={onParqueaderoBlur}
            aria-invalid={!!parqueaderoError}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 11,
              border: `1px solid ${parqueaderoError ? C.danger : C.border}`,
              fontSize: 13, outline: "none",
              fontFamily: "inherit", background: "#F8FAFC",
            }}
          >
            <option value="">Seleccionar parqueadero...</option>
            {parqueaderos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          {parqueaderoError && (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{parqueaderoError}</p>
          )}
        </div>

        <div>
          <label htmlFor="celda" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Celda
          </label>
          <select
            id="celda"
            value={celdaId}
            onChange={(e) => onCeldaChange(e.target.value)}
            disabled={!parqueaderoId || celdasDelParqueadero.length === 0}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 11,
              border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
              fontFamily: "inherit", background: "#F8FAFC",
            }}
          >
            <option value="">
              {parqueaderoId ? "Sin celda específica" : "Elige un parqueadero primero"}
            </option>
            {celdasDelParqueadero.map((c) => {
              const ocupante = ocupanteDeCelda(c.id);
              return (
                <option key={c.id} value={c.id}>
                  {c.numero} · {CELDA_ESTADO_CONFIG[c.estado].label}
                  {ocupante ? ` (${ocupante.vehiculo.placa})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {celdaId && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: -8 }}>
          <CeldaBadgeInline numero={celdaSeleccionada?.numero ?? ""} estado={celdaSeleccionada?.estado} />
          {ocupanteSeleccionado && (
            <span style={{ fontSize: 11, color: C.textLight }}>
              Ocupada por <strong>{ocupanteSeleccionado.vehiculo.placa}</strong>
              {ocupanteSeleccionado.conductorNombre ? ` — ${ocupanteSeleccionado.conductorNombre}` : ""}
            </span>
          )}
        </div>
      )}
    </>
  );
}

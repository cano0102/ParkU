import type { ReactNode } from "react";
import { IconCrown as Crown, IconUsers as Users, IconEye as Eye, IconPencil as Pencil } from "@tabler/icons-react";
import type { DataListColumn } from "@/components/data";
import { COLORS, getTipoVehiculoStyle } from "@/features/conductores/lib/helpers";
import type { Vehiculo } from "@/services/api/vehiculos";

/**
 * Contenido de la tarjeta/fila de un vehículo en "Mis Vehículos" (autoservicio del
 * Conductor). El layout de cuadrícula/lista lo resuelven `DataGrid`/`DataList`
 * (components/data/) — esto es solo lo específico de este dominio, igual que
 * `ConductorCard.tsx` hace para conductores.
 */
export interface VehiculoCardHandlers {
  esPrincipal: (v: Vehiculo) => boolean;
  onView: (v: Vehiculo) => void;
  onEdit: (v: Vehiculo) => void;
}

function RolBadge({ soyPrincipal }: { soyPrincipal: boolean }) {
  return soyPrincipal ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: COLORS.primaryDark, background: "rgba(57,169,0,.1)", padding: "3px 9px", borderRadius: 999 }}>
      <Crown size={11} /> Propietario
    </span>
  ) : (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: COLORS.textLight, background: COLORS.surfaceSubtle, padding: "3px 9px", borderRadius: 999 }}>
      <Users size={11} /> Copropietario
    </span>
  );
}

export function renderVehiculoCard(v: Vehiculo, h: VehiculoCardHandlers): ReactNode {
  const soyPrincipal = h.esPrincipal(v);
  const tipoStyle = getTipoVehiculoStyle(v.tipo);
  const TipoIcon = tipoStyle.icon;

  return (
    <div
      style={{
        border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "1.1rem",
        display: "flex", flexDirection: "column", gap: 10, background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: tipoStyle.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TipoIcon size={18} color={tipoStyle.dot} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: COLORS.text }}>{v.placa}</div>
          <div style={{ fontSize: 11, color: COLORS.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {v.marca} {v.linea}
          </div>
        </div>
      </div>

      <RolBadge soyPrincipal={soyPrincipal} />

      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <button
          type="button"
          onClick={() => h.onView(v)}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
            background: "#fff", color: COLORS.text, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Eye size={13} /> Ver
        </button>
        <button
          type="button"
          onClick={() => h.onEdit(v)}
          disabled={!soyPrincipal}
          title={soyPrincipal ? undefined : "Solo el propietario principal puede editar"}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 10, border: "none",
            background: soyPrincipal ? COLORS.primary : COLORS.textMuted, color: "#fff", fontSize: 12, fontWeight: 700,
            cursor: soyPrincipal ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: soyPrincipal ? 1 : 0.6,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Pencil size={13} /> Editar
        </button>
      </div>
    </div>
  );
}

export function getVehiculoColumns(h: VehiculoCardHandlers): DataListColumn<Vehiculo>[] {
  return [
    {
      header: "Placa",
      width: "110px",
      render: (v) => <strong style={{ fontSize: 13, color: COLORS.text }}>{v.placa}</strong>,
    },
    {
      header: "Tipo",
      width: "90px",
      render: (v) => {
        const tipoStyle = getTipoVehiculoStyle(v.tipo);
        const TipoIcon = tipoStyle.icon;
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.text }}>
            <TipoIcon size={14} color={tipoStyle.dot} /> {tipoStyle.label}
          </span>
        );
      },
    },
    {
      header: "Marca / Línea",
      width: "1.4fr",
      render: (v) => <span style={{ fontSize: 12, color: COLORS.text }}>{v.marca} {v.linea}</span>,
    },
    {
      header: "Rol",
      width: "140px",
      render: (v) => <RolBadge soyPrincipal={h.esPrincipal(v)} />,
    },
    {
      header: "Acciones",
      width: "170px",
      align: "right",
      render: (v) => {
        const soyPrincipal = h.esPrincipal(v);
        return (
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => h.onView(v)}
              title="Ver detalle"
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Eye size={13} />
            </button>
            <button
              type="button"
              onClick={() => h.onEdit(v)}
              disabled={!soyPrincipal}
              title={soyPrincipal ? "Editar" : "Solo el propietario principal puede editar"}
              style={{
                width: 30, height: 30, borderRadius: 8, border: "none",
                background: soyPrincipal ? COLORS.primary : COLORS.textMuted, color: "#fff",
                cursor: soyPrincipal ? "pointer" : "not-allowed", opacity: soyPrincipal ? 1 : 0.6,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Pencil size={13} />
            </button>
          </div>
        );
      },
    },
  ];
}

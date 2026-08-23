import { Pencil, Car, Building2, Accessibility, Eye } from "lucide-react";
import type { ReactNode } from "react";
import type { DataListColumn } from "@/components/data";
import type { Conductor } from "@/services/conductores";
import type { Usuario } from "@/services/usuarios";
import type { Vehiculo } from "@/services/vehiculos";
import { COLORS, getAvatarGradient, getInitials, getTipoStyle, getTipoVehiculoStyle, sanitizeText } from "./helpers";

/**
 * Antes ConductoresGrid.tsx y ConductoresList.tsx: el layout de cuadrícula y
 * de lista ahora viven en components/data/ (DataGrid, DataList) — lo que
 * queda aquí es solo el contenido de cada tarjeta/fila, específico de este
 * dominio (bloque de placas, tipo de conductor, discapacidad, etc.).
 */
export interface ConductorCardHandlers {
  getUsuario: (id: string) => Usuario | undefined;
  getVehiculosConductor: (id: string) => Vehiculo[];
  onToggleEstado: (id: string, estado: "activo" | "inactivo") => void;
  onViewVehiculo: (v: Vehiculo) => void;
  onViewDetail: (c: Conductor) => void;
  onEdit: (c: Conductor) => void;
}

export function renderConductorCard(conductor: Conductor, handlers: ConductorCardHandlers): ReactNode {
  const { getUsuario, getVehiculosConductor, onToggleEstado, onViewVehiculo, onViewDetail, onEdit } = handlers;
  const usuario = getUsuario(conductor.usuarioId);
  const vehiculosCond = getVehiculosConductor(conductor.id);
  if (!usuario) return null;

  const [g1, g2] = getAvatarGradient(conductor.nombre);
  const initials = getInitials(conductor.nombre);
  const tipoStyle = getTipoStyle(conductor.tipoConductor);
  const activo = conductor.estado === "activo";
  const TipoIcon = tipoStyle.icon;
  const vehiculoPrincipal = vehiculosCond[0];
  const vTipoStyle = vehiculoPrincipal ? getTipoVehiculoStyle(vehiculoPrincipal.tipo) : null;

  return (
    <div className={`conductor-card${activo ? "" : " is-inactive"}`}>
      <div className="status-rail" style={{ background: activo ? COLORS.primary : "#CBD5E1" }} />

      <div className="card-top">
        <div className="card-avatar" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
          {initials}
        </div>

        <div className="card-identity">
          <p className="card-name">{sanitizeText(conductor.nombre)}</p>
          <p className="card-doc">
            {usuario.tipoDocumento} · {usuario.identificacion}
          </p>
        </div>

        <button
          className="card-switch"
          onClick={() => onToggleEstado(conductor.id, conductor.estado)}
          style={{ background: activo ? COLORS.primary : "#CBD5E1" }}
          aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
        >
          <div className="knob" style={{ left: activo ? 17 : 2 }} />
        </button>
      </div>

      <div className="card-tags">
        <span className="card-tag" style={{ background: tipoStyle.bg, color: tipoStyle.text }}>
          <TipoIcon size={10} />
          {tipoStyle.label}
        </span>
        <span className={`status-badge ${activo ? "active" : "inactive"}`}>{conductor.estado}</span>
        {conductor.discapacidad && (
          <span className="card-tag" style={{ background: "#F3E8FF", color: "#9333EA" }}>
            <Accessibility size={10} />
            Discapacidad
          </span>
        )}
      </div>

      {vehiculosCond.length === 0 ? (
        <div className="plate-block">
          <Car size={15} color={COLORS.textMuted} style={{ flexShrink: 0 }} />
          <span className="plate-empty">Sin vehículo asignado</span>
        </div>
      ) : vehiculosCond.length === 1 && vehiculoPrincipal && vTipoStyle ? (
        <div className="plate-block has-plate" onClick={() => onViewVehiculo(vehiculoPrincipal)} style={{ cursor: "pointer" }}>
          <span className="plate-chip">{vehiculoPrincipal.placa}</span>
          <span className="plate-meta">
            {vehiculoPrincipal.marca} {vehiculoPrincipal.modelo}
          </span>
          <vTipoStyle.icon size={15} color={vTipoStyle.dot} style={{ flexShrink: 0 }} />
        </div>
      ) : (
        <div className="plate-list">
          {vehiculosCond.map((v) => {
            const vStyle = getTipoVehiculoStyle(v.tipo);
            const VIcon = vStyle.icon;
            return (
              <div key={v.id} className="plate-row" onClick={() => onViewVehiculo(v)}>
                <span className="plate-chip">{v.placa}</span>
                <span className="plate-meta">
                  {v.marca} {v.modelo}
                </span>
                <VIcon size={13} color={vStyle.dot} style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}

      <div className="card-center">
        <Building2 size={12} color={COLORS.textLight} />
        <span>{sanitizeText(conductor.centroFormacion) || "—"}</span>
      </div>

      <div className="card-footer">
        <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700 }}>
          {vehiculosCond.length} vehículo{vehiculosCond.length !== 1 ? "s" : ""}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="action-btn"
            title="Ver detalles"
            onClick={() => onViewDetail(conductor)}
            aria-label={`Ver detalles de ${sanitizeText(conductor.nombre)}`}
          >
            <Eye size={14} />
          </button>
          <button
            className="action-btn"
            title="Editar"
            onClick={() => onEdit(conductor)}
            aria-label={`Editar ${sanitizeText(conductor.nombre)}`}
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function getConductorColumns(handlers: ConductorCardHandlers): DataListColumn<Conductor>[] {
  const { getUsuario, getVehiculosConductor, onToggleEstado, onViewVehiculo, onViewDetail, onEdit } = handlers;

  return [
    {
      header: "Conductor",
      width: "2fr",
      render: (conductor) => {
        const usuario = getUsuario(conductor.usuarioId);
        const [g1, g2] = getAvatarGradient(conductor.nombre);
        const initials = getInitials(conductor.nombre);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `linear-gradient(135deg,${g1},${g2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 900, color: "#fff",
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 800, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {sanitizeText(conductor.nombre)}
              </p>
              <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 1 }}>
                {usuario?.tipoDocumento} · {usuario?.identificacion}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Centro de formación",
      width: "1.4fr",
      render: (conductor) => (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6, color: COLORS.textLight,
            minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
          title={conductor.centroFormacion}
        >
          <Building2 size={11} style={{ flexShrink: 0 }} />
          {sanitizeText(conductor.centroFormacion) || "—"}
        </div>
      ),
    },
    {
      header: "Vehículo(s)",
      width: "1.2fr",
      render: (conductor) => {
        const vehiculosCond = getVehiculosConductor(conductor.id);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {vehiculosCond.length === 0 ? (
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" }}>Sin vehículo</span>
            ) : (
              vehiculosCond.slice(0, 2).map((v) => (
                <span
                  key={v.id}
                  className="list-plate-chip"
                  style={{ cursor: "pointer", width: "fit-content" }}
                  onClick={() => onViewVehiculo(v)}
                >
                  {v.placa}
                </span>
              ))
            )}
            {vehiculosCond.length > 2 && (
              <span style={{ fontSize: 10, color: COLORS.textLight }}>+{vehiculosCond.length - 2} más</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Tipo",
      width: "0.9fr",
      render: (conductor) => {
        const tipoStyle = getTipoStyle(conductor.tipoConductor);
        const TipoIcon = tipoStyle.icon;
        return (
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px",
              borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: tipoStyle.bg, color: tipoStyle.text, border: `1px solid ${tipoStyle.border}`,
              whiteSpace: "nowrap",
            }}
          >
            <TipoIcon size={9} /> {tipoStyle.label}
          </span>
        );
      },
    },
    {
      header: "Estado",
      width: "0.8fr",
      render: (conductor) => {
        const activo = conductor.estado === "activo";
        return (
          <button
            onClick={() => onToggleEstado(conductor.id, conductor.estado)}
            title={activo ? "Desactivar" : "Activar"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px",
              borderRadius: 999, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 0.3,
              background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
              color: activo ? "#166534" : "#B91C1C", fontFamily: "inherit",
            }}
            aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: activo ? COLORS.primary : "#EF4444" }} />
            {conductor.estado}
          </button>
        );
      },
    },
    {
      header: "Acciones",
      width: "0.7fr",
      align: "right",
      render: (conductor) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <button
            title="Ver detalles"
            onClick={() => onViewDetail(conductor)}
            className="action-btn"
            style={{ width: 26, height: 26, border: `1px solid ${COLORS.border}`, background: COLORS.bg }}
            aria-label="Ver detalles"
          >
            <Eye size={12} />
          </button>
          <button
            title="Editar"
            onClick={() => onEdit(conductor)}
            className="action-btn"
            style={{ width: 26, height: 26, border: `1px solid ${COLORS.border}`, background: COLORS.bg }}
            aria-label="Editar"
          >
            <Pencil size={12} />
          </button>
        </div>
      ),
    },
  ];
}

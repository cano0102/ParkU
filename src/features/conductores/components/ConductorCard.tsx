import {
  IconPencil as Pencil,
  IconCar as Car,
  IconPlus as Plus,
  IconBuilding as Building2,
  IconWheelchair as Accessibility,
  IconEye as Eye,
  IconTrash as Trash,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { DataListColumn } from "@/components/data";
import { Avatar } from "@/components/shared";
import type { Conductor } from "@/services/api/conductores";
import type { Usuario } from "@/services/api/usuarios";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS, getTipoUsuarioStyle, getTipoVehiculoStyle } from "../lib/helpers";

/**
 * Antes ConductoresGrid.tsx y ConductoresList.tsx: el layout de cuadrícula y
 * de lista ahora viven en components/data/ (DataGrid, DataList) — lo que
 * queda aquí es solo el contenido de cada tarjeta/fila, específico de este
 * dominio (bloque de placas, tipo de usuario, movilidad reducida, etc.).
 */
export interface ConductorCardHandlers {
  getUsuario: (id: string) => Usuario | undefined;
  getVehiculosConductor: (id: string) => Vehiculo[];
  onToggleEstado: (id: string, estado: "activo" | "inactivo") => void;
  onViewVehiculo: (v: Vehiculo) => void;
  onViewDetail: (c: Conductor) => void;
  onEdit: (c: Conductor) => void;
  onAgregarVehiculo: (c: Conductor) => void;
  /** Borra la ficha. El backend la rechaza si tiene entradas, salidas o reservas. */
  onDelete: (c: Conductor) => void;
  /** Foto del conductor (la propia, o la de su cuenta vinculada), guardada en este navegador
   *  — ver useConductoresData.fotoDeConductor. Sin foto se muestran las iniciales. */
  fotoDe: (c: Conductor) => string | undefined;
}

export function renderConductorCard(conductor: Conductor, handlers: ConductorCardHandlers): ReactNode {
  const { getVehiculosConductor, onToggleEstado, onViewVehiculo, onViewDetail, onEdit, onAgregarVehiculo, onDelete, fotoDe } = handlers;
  const vehiculosCond = getVehiculosConductor(conductor.id);

  const tipoStyle = getTipoUsuarioStyle(conductor.tipoUsuarioNombre);
  const activo = conductor.estado === "activo";
  const TipoIcon = tipoStyle.icon;
  const vehiculoPrincipal = vehiculosCond[0];
  const vTipoStyle = vehiculoPrincipal ? getTipoVehiculoStyle(vehiculoPrincipal.tipo) : null;

  return (
    <div className={`conductor-card${activo ? "" : " is-inactive"}`}>
      <div className="status-rail" style={{ background: activo ? COLORS.primary : "#CBD5E1" }} />

      <div className="card-top">
        <Avatar className="card-avatar" nombre={conductor.nombre} foto={fotoDe(conductor)} size={46} radius={13} fontSize={15} />

        <div className="card-identity">
          <p className="card-name">{conductor.nombre}</p>
          <p className="card-doc">
            {conductor.tipoDocumento} · {conductor.numeroDocumento}
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
        {conductor.movilidadReducida && (
          <span className="card-tag" style={{ background: "#F3E8FF", color: "#9333EA" }}>
            <Accessibility size={10} />
            Movilidad reducida
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
            {vehiculoPrincipal.marca} {vehiculoPrincipal.modelo ?? ""}
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
                  {v.marca} {v.modelo ?? ""}
                </span>
                <VIcon size={13} color={vStyle.dot} style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}

      <div className="card-center">
        <Building2 size={12} color={COLORS.textLight} />
        <span>{conductor.centroFormacion || "—"}</span>
      </div>

      <div className="card-footer">
        <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700 }}>
          {vehiculosCond.length} vehículo{vehiculosCond.length !== 1 ? "s" : ""}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="action-btn"
            title="Agregar un nuevo vehículo a este conductor"
            onClick={() => onAgregarVehiculo(conductor)}
            aria-label={`Agregar vehículo a ${conductor.nombre}`}
            style={{
              width: "auto", padding: "0 8px", gap: 4,
              background: `${COLORS.primary}14`, borderColor: `${COLORS.primary}55`, color: COLORS.primary,
            }}
          >
            <Plus size={14} />
            <span style={{ fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>Vehículo</span>
          </button>
          <button
            className="action-btn"
            title="Ver detalles"
            onClick={() => onViewDetail(conductor)}
            aria-label={`Ver detalles de ${conductor.nombre}`}
          >
            <Eye size={14} />
          </button>
          <button
            className="action-btn"
            title="Editar"
            onClick={() => onEdit(conductor)}
            aria-label={`Editar ${conductor.nombre}`}
          >
            <Pencil size={14} />
          </button>
          <button
            className="action-btn"
            title="Eliminar"
            onClick={() => onDelete(conductor)}
            aria-label={`Eliminar ${conductor.nombre}`}
            style={{ border: "1px solid #FECACA", background: "#FEF2F2", color: "#B91C1C" }}
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function getConductorColumns(handlers: ConductorCardHandlers): DataListColumn<Conductor>[] {
  const { getVehiculosConductor, onToggleEstado, onViewVehiculo, onViewDetail, onEdit, onAgregarVehiculo, onDelete, fotoDe } = handlers;

  return [
    {
      header: "Conductor",
      width: "2fr",
      render: (conductor) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Avatar nombre={conductor.nombre} foto={fotoDe(conductor)} size={32} radius={9} fontSize={12} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 800, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {conductor.nombre}
              </p>
              <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 1 }}>
                {conductor.tipoDocumento} · {conductor.numeroDocumento}
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
          {conductor.centroFormacion || "—"}
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
        const tipoStyle = getTipoUsuarioStyle(conductor.tipoUsuarioNombre);
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
      width: "1.1fr",
      align: "right",
      render: (conductor) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <button
            title="Agregar un nuevo vehículo a este conductor"
            onClick={() => onAgregarVehiculo(conductor)}
            className="action-btn"
            style={{
              width: "auto", height: 26, padding: "0 8px", gap: 4,
              border: `1px solid ${COLORS.primary}55`, background: `${COLORS.primary}14`, color: COLORS.primary,
            }}
            aria-label={`Agregar vehículo a ${conductor.nombre}`}
          >
            <Plus size={12} />
            <span style={{ fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>Vehículo</span>
          </button>
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
          <button
            title="Eliminar"
            onClick={() => onDelete(conductor)}
            className="action-btn"
            style={{ width: 26, height: 26, border: "1px solid #FECACA", background: "#FEF2F2", color: "#B91C1C" }}
            aria-label={`Eliminar ${conductor.nombre}`}
          >
            <Trash size={12} />
          </button>
        </div>
      ),
    },
  ];
}

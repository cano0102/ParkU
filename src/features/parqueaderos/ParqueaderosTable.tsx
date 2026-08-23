import React, { memo, useState } from "react";
import { Car, Eye, Pencil, MapPin } from "lucide-react";
import type { Celda } from "@/services/celdas";
import type { Parqueadero } from "@/services/parqueaderos";
import { theme } from "@/theme";
import { Ocupante, CELDA_CONFIG, TIPO_CELDA_CONFIG, getTipoCeldaConfig, capitalizar } from "./helpers";

const C = theme;

/* ============================================================
   VISTA TABLA
============================================================ */
export const ParqueaderosTable = memo(({ parqueaderos, celdas, getOcupante, onEdit, onToggleEstado, onCellClick, cellMatchesSearch }: {
  parqueaderos: Parqueadero[];
  celdas: Celda[];
  getOcupante: (celdaId: string) => Ocupante | null;
  onEdit: (p: Parqueadero) => void;
  onToggleEstado: (p: Parqueadero) => void;
  onCellClick: (c: Celda) => void;
  cellMatchesSearch: (c: Celda) => boolean;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div className="pq-table-header">
        <div>Parqueadero</div><div>Tipo</div><div>Ocupación</div><div>Libres</div><div>Ocupadas</div><div>Reservadas</div><div>Estado</div><div style={{ textAlign: "right" }}>Acciones</div>
      </div>
      <div>
        {parqueaderos.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", color: C.textLight }}>
            <Car size={36} color={C.border} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron parqueaderos</p>
          </div>
        ) : parqueaderos.map(pq => {
          const celdasPq  = celdas.filter(c => c.parqueaderoId === pq.id);
          const libres    = celdasPq.filter(c => c.estado === "disponible").length;
          const ocupados  = celdasPq.filter(c => c.estado === "no_disponible").length;
          const reservas  = celdasPq.filter(c => c.estado === "reservada").length;
          const pct       = celdasPq.length ? Math.round(ocupados / celdasPq.length * 100) : 0;
          const pctColor  = pct >= 90 ? C.danger : pct >= 50 ? C.amber : C.primary;
          const isExpanded = expandedId === pq.id;
          const activo = pq.estado === "activo";

          // Desglose de celdas libres por tipo de vehículo, para distinguir carro vs moto de un vistazo
          const libresPorTipo = Object.keys(TIPO_CELDA_CONFIG).reduce<Record<string, number>>((acc, tipo) => {
            acc[tipo] = celdasPq.filter(c => c.tipo === tipo && c.estado === "disponible").length;
            return acc;
          }, {});

          return (
            <React.Fragment key={pq.id}>
              <div
                className="pq-table-row"
                style={{ background: isExpanded ? "#F8FAF8" : "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8FAF8")}
                onMouseLeave={e => (e.currentTarget.style.background = isExpanded ? "#F8FAF8" : "#fff")}
                onClick={() => setExpandedId(isExpanded ? null : pq.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={16} color={C.primary} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: C.text }}>{pq.nombre}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 3 }}>Bloque {pq.bloque} · {celdasPq.length} celdas</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {Object.entries(TIPO_CELDA_CONFIG).map(([tipo, cfg]) => {
                        const total = celdasPq.filter(c => c.tipo === tipo).length;
                        if (!total) return null;
                        const Icon = cfg.icon;
                        return (
                          <span key={tipo} title={`${cfg.label}: ${libresPorTipo[tipo]} libres de ${total}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 999, background: cfg.accentSoft, color: cfg.accentDark, fontSize: 9, fontWeight: 800 }}>
                            <Icon size={9} strokeWidth={2.5} />{libresPorTipo[tipo]}/{total}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div><span className="pq-cell-label">Tipo</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 8, background: "#F1F5F9", fontSize: 11, fontWeight: 600, color: C.textLight }}>{capitalizar(pq.tipo)}</span></div>
                <div>
                  <span className="pq-cell-label">Ocupación</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pctColor, borderRadius: 999, transition: "width .3s" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: pctColor, minWidth: 28 }}>{pct}%</span>
                  </div>
                </div>
                <div><span className="pq-cell-label">Libres</span><span style={{ fontWeight: 700, color: C.primary }}>{libres}</span></div>
                <div><span className="pq-cell-label">Ocupadas</span><span style={{ fontWeight: 700, color: C.danger }}>{ocupados}</span></div>
                <div><span className="pq-cell-label">Reservadas</span><span style={{ fontWeight: 700, color: C.amber }}>{reservas}</span></div>
                <div>
                  <span className="pq-cell-label">Estado</span>
                  <button
                    onClick={e => { e.stopPropagation(); onToggleEstado(pq); }}
                    title={activo ? "Desactivar" : "Activar"}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999,
                      border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 0.3, background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                      color: activo ? "#166534" : "#B91C1C", fontFamily: "inherit",
                    }}
                    aria-label={activo ? "Desactivar parqueadero" : "Activar parqueadero"}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: activo ? C.primary : "#EF4444" }} />
                    {pq.estado}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <button title="Ver celdas" onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : pq.id); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: C.textLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Eye size={13} />
                  </button>
                  <button title="Editar" onClick={e => { e.stopPropagation(); onEdit(pq); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: C.textLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: "#FAFBFC" }}>
                  <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                    {Object.entries(TIPO_CELDA_CONFIG).map(([tipo, cfg]) => {
                      const total = celdasPq.filter(c => c.tipo === tipo).length;
                      if (!total) return null;
                      const Icon = cfg.icon;
                      return (
                        <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 20, height: 20, borderRadius: 6, background: cfg.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={12} color="#fff" strokeWidth={2.5} />
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{cfg.label}: <strong style={{ color: cfg.accentDark }}>{total}</strong> celdas</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8 }}>
                    {celdasPq.map(celda => {
                      const cfg = CELDA_CONFIG[celda.estado];
                      const tipoCfg = getTipoCeldaConfig(celda.tipo);
                      const TipoIcon = tipoCfg.icon;
                      const matched = cellMatchesSearch(celda);
                      const ocupante = celda.estado === "no_disponible" ? getOcupante(celda.id) : null;
                      const estaOcupada = celda.estado === "no_disponible" && ocupante !== null;
                      return (
                        <button key={celda.id} onClick={() => onCellClick(celda)}
                          style={{ position: "relative", padding: "8px 10px 8px 12px", borderRadius: 10, borderTop: `2px ${celda.estado === "disponible" ? "dashed" : "solid"} ${matched ? "#F59E0B" : cfg.border}`, borderRight: `2px ${celda.estado === "disponible" ? "dashed" : "solid"} ${matched ? "#F59E0B" : cfg.border}`, borderBottom: `2px ${celda.estado === "disponible" ? "dashed" : "solid"} ${matched ? "#F59E0B" : cfg.border}`, borderLeft: `4px solid ${tipoCfg.accent}`, background: cfg.bg, color: cfg.text, cursor: "pointer", textAlign: "left", fontFamily: "inherit", outline: "none", boxShadow: matched ? "0 0 0 3px rgba(245,158,11,.25)" : undefined }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>{celda.numero}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 5, background: tipoCfg.accent, flexShrink: 0 }}>
                              <TipoIcon size={10} color="#fff" strokeWidth={2.5} />
                            </span>
                          </div>
                          {estaOcupada && ocupante && (
                            <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,.15)", padding: "1px 4px", borderRadius: 4, marginBottom: 2 }}>{ocupante.vehiculo.placa}</div>
                          )}
                          {celda.estado === "no_disponible" && !ocupante && (
                            <div style={{ fontSize: 8, color: C.danger, fontWeight: 700, marginBottom: 2 }}>⚠️ Error</div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0 }} />
                            <span style={{ fontSize: 8, fontWeight: 700, opacity: .8 }}>{cfg.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {parqueaderos.length > 0 && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, background: "#F8FAF8", fontSize: 11, color: C.textLight }}>
          Mostrando <strong>{parqueaderos.length}</strong> parqueadero{parqueaderos.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
});
ParqueaderosTable.displayName="ParqueaderosTable";

import { memo, useMemo } from "react";
import { Car, Clock, Info } from "lucide-react";
import type { Celda, Parqueadero } from "../../context/DataContext";
import { theme } from "../../theme";
import { Ocupante, getTipoCeldaConfig, formatearDuracion } from "./helpers";

const C = theme;

/* ============================================================
   LISTA VEHÍCULOS ACTIVOS
============================================================ */
export const ActiveVehiclesList = memo(({ celdas, parqueaderos, getOcupante, onSelectCell, searchQuery }: {
  celdas: Celda[];
  parqueaderos: Parqueadero[];
  getOcupante: (celdaId: string) => Ocupante | null;
  onSelectCell: (c: Celda) => void;
  searchQuery: string;
}) => {
  const activos = useMemo(() => {
    const list: { celda: Celda; pqNombre: string; ocupante: Ocupante }[] = [];
    celdas.forEach(c => {
      if (c.estado !== "no_disponible") return;
      const ocupante = getOcupante(c.id);
      if (!ocupante) return;
      const pq = parqueaderos.find(p => p.id === c.parqueaderoId);
      list.push({ celda: c, pqNombre: pq?.nombre || "—", ocupante });
    });
    return list.sort((a, b) => new Date(b.ocupante.fechaEntrada).getTime() - new Date(a.ocupante.fechaEntrada).getTime());
  }, [celdas, parqueaderos, getOcupante]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return activos;
    const q = searchQuery.toLowerCase();
    return activos.filter(v => v.ocupante.vehiculo.placa.toLowerCase().includes(q) || v.ocupante.conductor?.nombre.toLowerCase().includes(q) || v.celda.numero.toLowerCase().includes(q));
  }, [activos, searchQuery]);

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: "#F8FAF8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Car size={15} color={C.primary} />
          <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: .5 }}>Vehículos Activos</span>
        </div>
        <span style={{ padding: "2px 8px", borderRadius: 999, background: C.primaryPale, color: C.primaryDark, fontSize: 10, fontWeight: 800 }}>{activos.length}</span>
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {filtered.length > 0 ? filtered.map(({ celda, pqNombre, ocupante }) => {
          const tipoCfg = getTipoCeldaConfig(celda.tipo);
          const TipoIcon = tipoCfg.icon;
          return (
          <div key={celda.id} onClick={() => onSelectCell(celda)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${tipoCfg.accent}`, cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F8FAF8")} onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 5, background: tipoCfg.accentSoft, flexShrink: 0 }}>
                  <TipoIcon size={11} color={tipoCfg.accentDark} strokeWidth={2.5} />
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, background: "#F1F5F9", color: C.text, padding: "1px 6px", borderRadius: 6, border: `1px solid ${C.border}` }}>{ocupante.vehiculo.placa}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.textLight }}>Celda {celda.numero}</span>
                {ocupante.esOficial && <span style={{ fontSize: 8, fontWeight: 800, background: C.primaryPale, color: C.primaryDark, padding: "1px 4px", borderRadius: 4 }}>OFICIAL</span>}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{ocupante.conductor?.nombre || "—"}</div>
              <div style={{ fontSize: 9, color: C.textLight, marginTop: 1, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pqNombre}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", fontSize: 10, fontWeight: 600, color: C.textLight }}><Clock size={8} />{formatearDuracion(ocupante.fechaEntrada)}</div>
            </div>
          </div>
        );}) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", color: C.textLight }}>
            <Info size={20} color={C.border} style={{ marginBottom: 8 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>No hay vehículos activos</span>
          </div>
        )}
      </div>
    </div>
  );
});
ActiveVehiclesList.displayName="ActiveVehiclesList";

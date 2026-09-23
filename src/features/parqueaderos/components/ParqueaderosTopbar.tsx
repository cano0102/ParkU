import { IconPlus as Plus, IconSearch as Search, IconX as X } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { TIPOS_PARQUEADERO, capitalizar } from "../lib/helpers";

const C = theme;

interface ParqueaderosTopbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterTipo: string;
  onFilterTipoChange: (value: string) => void;
  activeFilters: number;
  onClearFilters: () => void;
  onOpenCreate: () => void;
  /** true si el rol puede crear parqueaderos (permiso "celdas"). */
  canCrearParqueadero: boolean;
  /** Oculta el buscador: el mapa de consulta del Conductor no tiene ocupantes que buscar
   *  (no lee el registro de ingresos), y sus propias celdas ya salen resaltadas. */
  ocultarBusqueda?: boolean;
  /** true si el rol puede usar la asignación inteligente (permiso "asignaciones"). */
}

/** Buscador + filtro de tipo + acciones de gestión de parqueaderos. */
export function ParqueaderosTopbar({
  search, onSearchChange, filterTipo, onFilterTipoChange,
  activeFilters, onClearFilters, onOpenCreate,
  canCrearParqueadero,
  ocultarBusqueda = false,
}: ParqueaderosTopbarProps) {
  return (
    <div className="pq-topbar">
      {!ocultarBusqueda && <div className="pq-search-wrap">
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por placa, celda, conductor..."
          style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit" }}
        />
        {search && (
          <button onClick={() => onSearchChange("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textLight }}>
            <X size={14} />
          </button>
        )}
      </div>}

      <select
        value={filterTipo}
        onChange={(e) => onFilterTipoChange(e.target.value)}
        style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
      >
        <option value="Todos">Todos los tipos</option>
        {TIPOS_PARQUEADERO.map((t) => <option key={t} value={t}>{capitalizar(t)}</option>)}
      </select>

      {activeFilters > 0 && (
        <button onClick={onClearFilters} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.textLight, fontSize: 12, fontFamily: "inherit" }}>
          <X size={14} />Limpiar
        </button>
      )}

      {canCrearParqueadero && (
        <button onClick={onOpenCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>
          <Plus size={15} />Nuevo Parqueadero
        </button>
      )}
    </div>
  );
}

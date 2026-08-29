import { IdCard, Mail, Search, User } from "lucide-react";
import type { Conductor } from "@/services/api/conductores";
import { COLORS, getAvatarGradient, getInitials, inputStyle } from "../lib/helpers";

interface ConductorSearchFieldProps {
  /** Lista ya cargada (React Query) — este componente no hace ninguna llamada de red. */
  conductores: Conductor[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (conductor: Conductor) => void;
  selectedId?: string;
  placeholder?: string;
}

/**
 * Buscador reutilizable de Conductor por documento, nombre o correo.
 *
 * Con el campo vacío no muestra ninguna sugerencia (ni una lista completa, ni
 * hace ninguna llamada extra) — solo empieza a filtrar cuando el usuario
 * escribe. La comparación es client-side sobre `conductores` (ya cacheado
 * por React Query), no hace falta un endpoint de búsqueda nuevo.
 */
export function ConductorSearchField({
  conductores, query, onQueryChange, onSelect, selectedId, placeholder,
}: ConductorSearchFieldProps) {
  const q = query.trim().toLowerCase();
  const resultados = q
    ? conductores.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.numeroDocumento.toLowerCase().includes(q) ||
          c.correo.toLowerCase().includes(q)
      )
    : [];

  return (
    <div>
      <div style={{ position: "relative" }}>
        <Search size={14} color={COLORS.textLight} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder={placeholder ?? "Buscar por documento, nombre o correo..."}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 34 }}
        />
      </div>

      {q && (
        <div
          style={{
            marginTop: 6, borderRadius: 11, border: `1px solid ${COLORS.border}`,
            padding: 4, background: "#fff", maxHeight: 220, overflowY: "auto",
          }}
        >
          {resultados.length === 0 && (
            <p style={{ fontSize: 11, color: COLORS.textLight, padding: "10px 8px" }}>
              No se encontró ningún conductor.
            </p>
          )}
          {resultados.map((c) => {
            const selected = selectedId === c.id;
            const [c1, c2] = getAvatarGradient(c.nombre);
            return (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
                  cursor: "pointer", background: selected ? "rgba(57,169,0,.1)" : "transparent",
                }}
              >
                <div
                  style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 800,
                  }}
                >
                  {getInitials(c.nombre)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.nombre}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: COLORS.textLight }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <IdCard size={10} /> {c.numeroDocumento}
                    </span>
                    {c.correo && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Mail size={10} /> {c.correo}
                      </span>
                    )}
                  </div>
                </div>
                {selected && <User size={14} color={COLORS.primary} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

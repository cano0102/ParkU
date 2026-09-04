import { theme } from "@/styles/theme";
import { etiquetaDePermiso } from "../lib/permisos";
import type { PermisoCatalogo } from "@/services/api/roles";

const COLORS = theme;

interface PermisosEditorProps {
  isCreating: boolean;
  isLoading: boolean;
  permisosCatalogo: PermisoCatalogo[];
  /** Permisos marcados ahora mismo en el formulario. */
  seleccionados: Set<string>;
  onToggle: (permisoId: string) => void;
  /** Marca o desmarca de golpe todos los permisos de un módulo. */
  onToggleModulo: (permisoIds: string[], marcar: boolean) => void;
}

/**
 * Sección "Permisos" del formulario de rol: el catálogo real del backend (`GET /permisos`)
 * agrupado por módulo, con selección por permiso o por módulo completo. Lo marcado se guarda
 * en `rol_permiso` al enviar el formulario (ver guardarPermisosDeRol en services/api/roles.ts).
 */
export function PermisosEditor({ isCreating, isLoading, permisosCatalogo, seleccionados, onToggle, onToggleModulo }: PermisosEditorProps) {
  const porModulo = new Map<string, PermisoCatalogo[]>();
  for (const permiso of permisosCatalogo) {
    const lista = porModulo.get(permiso.moduloNombre) ?? [];
    lista.push(permiso);
    porModulo.set(permiso.moduloNombre, lista);
  }
  const activeCount = permisosCatalogo.filter((p) => seleccionados.has(p.id)).length;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Permisos
        </p>
        {!isLoading && permisosCatalogo.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary }}>
            {activeCount} / {permisosCatalogo.length} seleccionados
          </span>
        )}
      </div>

      {isLoading ? (
        <p style={{ fontSize: 11, color: COLORS.textLight, padding: "8px 2px" }}>Cargando permisos…</p>
      ) : permisosCatalogo.length === 0 ? (
        <p style={{ fontSize: 11, color: COLORS.textLight, padding: "8px 2px" }}>
          El backend no tiene ningún permiso definido en su catálogo todavía.
        </p>
      ) : (
        <div className="roles-permiso-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 8, alignItems: "start" }}>
          {Array.from(porModulo.entries()).map(([moduloNombre, permisos]) => {
            const on = permisos.filter((p) => seleccionados.has(p.id)).length;
            return (
              <div key={moduloNombre} style={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "#F8FAFC", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => onToggleModulo(permisos.map((p) => p.id), on < permisos.length)}
                  title={on < permisos.length ? `Seleccionar todo ${moduloNombre}` : `Quitar todo ${moduloNombre}`}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 10px", borderBottom: `1px solid ${COLORS.border}`, background: "#fff",
                    border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.text }}>{moduloNombre}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: on > 0 ? COLORS.primary : COLORS.textLight }}>{on}/{permisos.length}</span>
                </button>
                <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {permisos.map((permiso) => {
                    const checked = seleccionados.has(permiso.id);
                    return (
                      <label
                        key={permiso.id}
                        title={`${permiso.nombre}${permiso.descripcion ? ` — ${permiso.descripcion}` : ""}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          padding: "6px 10px", borderRadius: 9, cursor: "pointer",
                          border: `1px solid ${checked ? `${COLORS.primary}30` : COLORS.border}`,
                          background: checked ? `${COLORS.primary}08` : "#fff",
                          fontSize: 11, fontWeight: 600, color: checked ? COLORS.text : COLORS.textLight,
                        }}
                      >
                        <span>{etiquetaDePermiso(permiso)}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(permiso.id)}
                          style={{ width: 15, height: 15, accentColor: COLORS.primary, cursor: "pointer", flexShrink: 0 }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

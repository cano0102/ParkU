import { Info } from "lucide-react";
import { theme } from "@/styles/theme";
import type { PermisoCatalogo } from "@/services/api/roles";

const COLORS = theme;

interface PermisosEditorProps {
  isCreating: boolean;
  isLoading: boolean;
  permisosCatalogo: PermisoCatalogo[];
  permisosAsignadosIds: Set<string>;
}

/**
 * Sección "Permisos" del formulario de rol — de SOLO LECTURA: muestra los permisos que el
 * backend real tiene guardados para este rol (`GET /roles-permisos/rol/:id`), agrupados por
 * módulo. No hay checkboxes editables a propósito: la API expone `rol_permiso` para
 * guardarlo, pero ninguna ruta lo consulta todavía para autorizar nada (ver el porqué
 * completo en el encabezado de `services/api/roles.ts`) — un control que aceptara cambios
 * aquí los guardaría sin que tuvieran ningún efecto real, que es justo el problema que esto
 * reemplaza.
 */
export function PermisosEditor({ isCreating, isLoading, permisosCatalogo, permisosAsignadosIds }: PermisosEditorProps) {
  const porModulo = new Map<string, PermisoCatalogo[]>();
  for (const permiso of permisosCatalogo) {
    const lista = porModulo.get(permiso.moduloNombre) ?? [];
    lista.push(permiso);
    porModulo.set(permiso.moduloNombre, lista);
  }
  const activeCount = permisosCatalogo.filter((p) => permisosAsignadosIds.has(p.id)).length;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Permisos (solo lectura)
        </p>
        {!isCreating && !isLoading && (
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary }}>
            {activeCount} / {permisosCatalogo.length} asignados
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 12px", borderRadius: 10,
          background: "#EFF6FF", border: "1px solid #BFDBFE", marginBottom: 10,
        }}
      >
        <Info size={13} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: "#1E3A8A", lineHeight: 1.5, margin: 0 }}>
          Esto refleja lo que ya está guardado en el backend, pero hoy ningún endpoint lo
          consulta para autorizar accesos — el control de acceso real sigue siendo fijo por
          rol en el servidor. Gestionar permisos se hace desde el backend, no desde aquí.
        </p>
      </div>

      {isCreating ? (
        <p style={{ fontSize: 11, color: COLORS.textLight, padding: "8px 2px" }}>
          Un rol nuevo todavía no tiene permisos asignados en el backend — se podrán ver aquí
          después de crearlo.
        </p>
      ) : isLoading ? (
        <p style={{ fontSize: 11, color: COLORS.textLight, padding: "8px 2px" }}>Cargando permisos…</p>
      ) : permisosCatalogo.length === 0 ? (
        <p style={{ fontSize: 11, color: COLORS.textLight, padding: "8px 2px" }}>
          El backend no tiene ningún permiso definido en su catálogo todavía.
        </p>
      ) : (
        <div className="roles-permiso-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "start" }}>
          {Array.from(porModulo.entries()).map(([moduloNombre, permisos]) => {
            const on = permisos.filter((p) => permisosAsignadosIds.has(p.id)).length;
            return (
              <div key={moduloNombre} style={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "#F8FAFC", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderBottom: `1px solid ${COLORS.border}`, background: "#fff" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.text }}>{moduloNombre}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.textLight }}>{on}/{permisos.length}</span>
                </div>
                <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {permisos.map((permiso) => {
                    const checked = permisosAsignadosIds.has(permiso.id);
                    return (
                      <div
                        key={permiso.id}
                        title={permiso.descripcion}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "6px 10px", borderRadius: 9,
                          border: `1px solid ${checked ? `${COLORS.primary}30` : COLORS.border}`,
                          background: checked ? `${COLORS.primary}08` : "#fff",
                          fontSize: 11, fontWeight: 600, color: checked ? COLORS.text : COLORS.textLight,
                        }}
                      >
                        <span>{permiso.nombre}</span>
                        <div
                          style={{
                            width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                            border: `1.5px solid ${checked ? COLORS.primary : COLORS.border}`,
                            background: checked ? COLORS.primary : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {checked && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                        </div>
                      </div>
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

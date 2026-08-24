import { theme } from "@/styles/theme";
import {
  GRUPO_COLORS, GRUPO_ICON_COMPONENTS, GRUPO_LABELS, PERMISOS,
  type PermisosKeys, type PermisosState,
} from "../lib/permisos";

const COLORS = theme;

interface PermisosEditorProps {
  permisos: PermisosState;
  activeCount: number;
  total: number;
  onTogglePermiso: (k: keyof PermisosState) => void;
  onToggleGrupo: (grupo: PermisosKeys) => void;
}

/** Sección "Permisos" del formulario de rol: progreso global + tarjetas por grupo con sus toggles. */
export function PermisosEditor({ permisos, activeCount, total, onTogglePermiso, onToggleGrupo }: PermisosEditorProps) {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: COLORS.textLight,
            textTransform: "uppercase",
          }}
        >
          Permisos
        </p>
        <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary }}>
          {activeCount} / {total} activos
        </span>
      </div>

      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: "#E2E8F0",
          marginBottom: 9,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: COLORS.primary,
            width: `${(activeCount / total) * 100}%`,
            transition: "width .3s ease",
          }}
          role="progressbar"
          aria-valuenow={(activeCount / total) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="roles-permiso-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "start" }}>
        {(Object.entries(PERMISOS) as [PermisosKeys, typeof PERMISOS[PermisosKeys]][]).map(
          ([grupo, permisosGrupo]) => {
            const color = GRUPO_COLORS[grupo] ?? COLORS.primary;
            const Icon = GRUPO_ICON_COMPONENTS[grupo];
            const keys = Object.keys(permisosGrupo) as Array<keyof PermisosState>;
            const on = keys.filter((k) => permisos[k]).length;
            const totalGrupo = keys.length;
            const allOn = on === totalGrupo;

            return (
              <div
                key={grupo}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  background: "#F8FAFC",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        background: `${color}18`,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={13} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: COLORS.text,
                      }}
                    >
                      {GRUPO_LABELS[grupo]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleGrupo(grupo)}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {allOn ? "Quitar todo" : "Todo"}
                  </button>
                </div>

                <div style={{ height: 3, background: "#E2E8F0", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: color,
                      width: `${(on / totalGrupo) * 100}%`,
                      transition: "width .3s",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "7px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {Object.entries(permisosGrupo).map(([key, label]) => {
                    const checked = permisos[key as keyof PermisosState];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onTogglePermiso(key as keyof PermisosState)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: 9,
                          cursor: "pointer",
                          border: `1px solid ${checked ? `${color}30` : COLORS.border}`,
                          background: checked ? `${color}08` : "#fff",
                          transition: "all .15s",
                          width: "100%",
                          fontFamily: "inherit",
                          fontSize: 11,
                          fontWeight: 600,
                          color: COLORS.text,
                        }}
                        role="checkbox"
                        aria-checked={checked}
                      >
                        <span>{label}</span>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 5,
                            border: `1.5px solid ${checked ? color : COLORS.border}`,
                            background: checked ? color : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all .15s",
                          }}
                        >
                          {checked && (
                            <span
                              style={{ color: "#fff", fontSize: 9, fontWeight: 900, lineHeight: 1 }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

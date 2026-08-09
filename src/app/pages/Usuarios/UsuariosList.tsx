import { Mail, Shield, Lock, Pencil, Trash2 } from "lucide-react";
import type { Usuario } from "../../context/DataContext";
import { COLORS, USUARIOS_PROTEGIDOS, getRoleAccent, avatarColors, initials, sanitizeText } from "./helpers";

interface UsuariosListProps {
  usuarios: Usuario[];
  onToggleEstado: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onDelete: (u: Usuario) => void;
}

export function UsuariosList({ usuarios, onToggleEstado, onEdit, onDelete }: UsuariosListProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15,23,42,.05)",
      }}
    >
      <div
        className="u-list-header"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px,2fr) minmax(160px,1.4fr) 130px 110px 100px 90px",
          gap: 10,
          padding: "10px 14px",
          background: COLORS.bg,
          borderBottom: `1px solid ${COLORS.border}`,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: COLORS.textLight,
        }}
      >
        <span>Usuario</span>
        <span>Correo</span>
        <span>Documento</span>
        <span>Rol</span>
        <span>Estado</span>
        <span style={{ textAlign: "right" }}>Acciones</span>
      </div>

      {usuarios.map((u, idx) => {
        const protegido = USUARIOS_PROTEGIDOS.includes(u.correo);
        const activo = u.estado === "activo";
        const roleStyle = getRoleAccent(u.rol);
        const [c1, c2] = avatarColors(u.nombre);
        const ini = initials(u.nombre);

        return (
          <div
            key={u.id}
            className="u-list-row"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(200px,2fr) minmax(160px,1.4fr) 130px 110px 100px 90px",
              gap: 10,
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: idx === usuarios.length - 1 ? "none" : `1px solid ${COLORS.border}`,
              fontSize: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${c1},${c2})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                {ini}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 800,
                    color: COLORS.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sanitizeText(u.nombre)}
                </p>
                {protegido && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#92400E",
                    }}
                  >
                    <Lock size={8} /> Protegido
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: COLORS.textLight,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={u.correo}
            >
              <Mail size={11} style={{ flexShrink: 0 }} />
              {u.correo}
            </div>

            <div style={{ color: COLORS.textLight, fontSize: 11 }}>
              {u.tipoDocumento} · {u.identificacion}
            </div>

            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  background: roleStyle.bg,
                  color: roleStyle.text,
                  border: `1px solid ${roleStyle.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                <Shield size={9} /> {u.rol || "Sin rol"}
              </span>
            </div>

            <div>
              <button
                onClick={() => onToggleEstado(u)}
                title={activo ? "Desactivar" : "Activar"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                  color: activo ? "#166534" : "#B91C1C",
                  fontFamily: "inherit",
                }}
                aria-label={activo ? "Desactivar usuario" : "Activar usuario"}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: activo ? COLORS.primary : "#EF4444",
                  }}
                />
                {u.estado}
              </button>
            </div>

            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <button
                title="Editar"
                onClick={() => onEdit(u)}
                className="u-btn"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bg,
                  color: COLORS.textLight,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Editar"
              >
                <Pencil size={12} />
              </button>
              {!protegido && (
                <button
                  title="Eliminar"
                  onClick={() => onDelete(u)}
                  className="u-btn"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    border: `1px solid ${COLORS.border}`,
                    background: "#FEF2F2",
                    color: "#EF4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

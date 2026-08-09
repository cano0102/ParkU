import { Mail, Phone, Shield, Lock, UserCheck, Pencil, Trash2 } from "lucide-react";
import type { Usuario } from "../../context/DataContext";
import { COLORS, USUARIOS_PROTEGIDOS, getRoleAccent, avatarColors, initials, sanitizeText } from "./helpers";

interface UsuariosGridProps {
  usuarios: Usuario[];
  onToggleEstado: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onDelete: (u: Usuario) => void;
}

export function UsuariosGrid({ usuarios, onToggleEstado, onEdit, onDelete }: UsuariosGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
        gap: 12,
      }}
    >
      {usuarios.map((u) => {
        const protegido = USUARIOS_PROTEGIDOS.includes(u.correo);
        const activo = u.estado === "activo";
        const roleStyle = getRoleAccent(u.rol);
        const [c1, c2] = avatarColors(u.nombre);
        const ini = initials(u.nombre);

        return (
          <div
            key={u.id}
            className="u-card"
            style={{
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
              background: "#fff",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(15,23,42,.05)",
            }}
          >
            <div
              style={{
                height: 3,
                background: `linear-gradient(90deg,${roleStyle.dot},${roleStyle.dot}66)`,
              }}
            />

            <div
              style={{
                padding: "14px 14px 10px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${c1},${c2})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#fff",
                  boxShadow: `0 3px 10px ${c1}44`,
                }}
              >
                {ini}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: COLORS.text,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {sanitizeText(u.nombre)}
                    </p>
                    <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 1 }}>
                      {u.tipoDocumento} · {u.identificacion}
                    </p>
                  </div>

                  <button
                    onClick={() => onToggleEstado(u)}
                    title={activo ? "Desactivar" : "Activar"}
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 20,
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      background: activo ? COLORS.primary : "#CBD5E1",
                      transition: "background .2s",
                    }}
                    aria-label={activo ? "Desactivar usuario" : "Activar usuario"}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: activo ? 18 : 3,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left .2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      }}
                    />
                  </button>
                </div>

                <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 5 }}>
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
                    }}
                  >
                    <Shield size={9} /> {u.rol || "Sin rol"}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 9px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                      background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                      color: activo ? "#166534" : "#B91C1C",
                    }}
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
                  </span>
                  {protegido && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 9px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        background: "#FFFBEB",
                        color: "#92400E",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <Lock size={9} /> Protegido
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "0 14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {[
                { icon: <Mail size={12} />, text: u.correo },
                { icon: <Phone size={12} />, text: u.numero || "—" },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 9,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.bg,
                    fontSize: 11,
                    color: COLORS.textLight,
                  }}
                >
                  <span style={{ color: COLORS.textLight, flexShrink: 0 }}>{row.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.text}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}
              >
                <UserCheck size={12} color={COLORS.primary} />
                Registrado
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[
                  {
                    icon: <Pencil size={12} />,
                    title: "Editar",
                    color: COLORS.textLight,
                    bg: COLORS.bg,
                    onClick: () => onEdit(u),
                  },
                  ...(!protegido
                    ? [
                        {
                          icon: <Trash2 size={12} />,
                          title: "Eliminar",
                          color: "#EF4444",
                          bg: "#FEF2F2",
                          onClick: () => onDelete(u),
                        },
                      ]
                    : []),
                ].map((btn, i) => (
                  <button
                    key={i}
                    title={btn.title}
                    onClick={btn.onClick}
                    className="u-btn"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      background: btn.bg,
                      color: btn.color,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label={btn.title}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

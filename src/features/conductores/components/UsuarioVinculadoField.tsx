import { Mail, Phone, Shield, ShieldCheck, UserCheck, X } from "lucide-react";
import type { Usuario } from "@/services/api/usuarios";
import { FormField } from "@/components/shared";
import { useRoles } from "@/features/roles";
import { nombreDeRol } from "@/services/core/roles";
import { COLORS, getAvatarGradient, getInitials, inputStyle } from "../lib/helpers";

interface UsuarioVinculadoFieldProps {
  error?: string;
  usuarioSearch: string;
  onUsuarioSearchChange: (value: string) => void;
  usuariosFiltrados: Usuario[];
  usuariosConConductorIds: Set<string>;
  usuarioIdSeleccionado: string;
  usuarioSeleccionado: Usuario | undefined;
  onSelectUsuario: (id: string) => void;
  /** Deshace SOLO la vinculación con la cuenta (por haber elegido la equivocada): el resto
   *  del formulario del conductor se conserva tal cual, sin cancelar su creación. */
  onQuitarUsuario: () => void;
}

/** Buscador + lista de usuarios para vincular al conductor, con vista previa del seleccionado. */
export function UsuarioVinculadoField({
  error, usuarioSearch, onUsuarioSearchChange, usuariosFiltrados, usuariosConConductorIds,
  usuarioIdSeleccionado, usuarioSeleccionado, onSelectUsuario, onQuitarUsuario,
}: UsuarioVinculadoFieldProps) {
  // Nombre real del rol de la cuenta (`/api/roles`), no la tabla estática de 3 roles fijos.
  const { data: roles = [] } = useRoles();
  const nombreRol = (rolId: number) => roles.find((r) => r.id === String(rolId))?.nombre ?? nombreDeRol(rolId);

  return (
    <FormField label="Cuenta de acceso vinculada (opcional)" error={error}>
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        value={usuarioSearch}
        onChange={(e) => onUsuarioSearchChange(e.target.value)}
        style={inputStyle}
      />
      <div
        style={{
          marginTop: 6, borderRadius: 11, border: `1px solid ${COLORS.border}`,
          padding: 4, background: "#fff", maxHeight: 132, overflowY: "auto",
        }}
      >
        {usuariosFiltrados.length === 0 && (
          <p style={{ fontSize: 11, color: COLORS.textMuted, padding: "10px 8px" }}>
            Sin resultados
          </p>
        )}
        {usuariosFiltrados.map((u) => {
          const yaEsConductor = usuariosConConductorIds.has(u.id);
          const selected = usuarioIdSeleccionado === u.id;
          return (
            <div
              key={u.id}
              className={`usuario-option${yaEsConductor ? " disabled" : ""}`}
              onClick={() => { if (!yaEsConductor) onSelectUsuario(u.id); }}
              style={{ background: selected ? "rgba(57,169,0,.1)" : "transparent" }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `linear-gradient(135deg, ${getAvatarGradient(u.nombre)[0]}, ${getAvatarGradient(u.nombre)[1]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 800,
                }}
              >
                {getInitials(u.nombre)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {u.nombre}
                </p>
                <p style={{ fontSize: 10, color: COLORS.textLight }}>
                  {u.correo}
                  {yaEsConductor ? " — ya vinculado a otro conductor" : ""}
                </p>
              </div>
              {selected && <ShieldCheck size={14} color={COLORS.primary} />}
            </div>
          );
        })}
      </div>

      {usuarioSeleccionado && (
        <div
          style={{
            marginTop: 8, padding: "10px 12px", borderRadius: 10,
            background: "#F0FDF4", border: `1px solid ${COLORS.primary}33`,
            display: "flex", flexDirection: "column", gap: 7,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserCheck size={13} color={COLORS.primaryDark} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, fontWeight: 800, color: COLORS.primaryDark, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {usuarioSeleccionado.nombre}
            </span>
            <span
              style={{
                marginLeft: "auto", flexShrink: 0, padding: "2px 8px", borderRadius: 999,
                fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3,
                background: usuarioSeleccionado.estado === "activo" ? "rgba(57,169,0,.12)" : "rgba(239,68,68,.1)",
                color: usuarioSeleccionado.estado === "activo" ? "#166534" : "#B91C1C",
              }}
            >
              {usuarioSeleccionado.estado}
            </span>
            <button
              type="button"
              onClick={onQuitarUsuario}
              aria-label="Quitar la cuenta vinculada"
              title="Quitar la cuenta vinculada (no cancela el registro del conductor)"
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#fff",
                color: COLORS.textLight, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <X size={11} />
              Quitar
            </button>
          </div>

          {/* Datos que aporta la cuenta y que ya quedaron puestos en el formulario. El
              documento no aparece aquí porque la tabla `usuario` no lo guarda: es un dato
              del conductor, y se escribe en los campos de arriba. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 5 }}>
            {[
              { icon: <Mail size={11} />, valor: usuarioSeleccionado.correo },
              ...(usuarioSeleccionado.numero ? [{ icon: <Phone size={11} />, valor: usuarioSeleccionado.numero }] : []),
              { icon: <Shield size={11} />, valor: nombreRol(usuarioSeleccionado.rol) },
            ].map((dato, i) => (
              <span
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: COLORS.primaryDark, minWidth: 0 }}
              >
                <span style={{ flexShrink: 0, display: "flex" }}>{dato.icon}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dato.valor}</span>
              </span>
            ))}
          </div>
        </div>
      )}

    </FormField>
  );
}

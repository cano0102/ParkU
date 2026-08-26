import { memo, useMemo } from "react";
import { CheckCircle2, Lock, Pencil, Shield, XCircle, X } from "lucide-react";
import type { Rol } from "@/services/api/roles";
import { theme } from "@/styles/theme";
import { sanitizeText } from "@/utils/format";
import { countActive, PERMISO_LABELS } from "../lib/permisos";
import { ROLES_PROTEGIDOS, getRolAccent } from "../lib/helpers";

const COLORS = theme;

interface RolViewModalProps {
  rol: Rol;
  onClose: () => void;
  onEdit: () => void;
}

/** Vista de solo lectura del detalle de un rol: permisos activos y accesos rápidos. */
export const RolViewModal = memo(({ rol, onClose, onEdit }: RolViewModalProps) => {
  const accent = getRolAccent(rol.nombre);
  const activeCount = useMemo(() => countActive(rol.permisos), [rol.permisos]);
  const total = useMemo(() => Object.keys(rol.permisos).length, [rol.permisos]);
  const protegido = (ROLES_PROTEGIDOS as readonly string[]).includes(rol.nombre);

  const permisosList = useMemo(
    () => Object.entries(rol.permisos),
    [rol.permisos]
  );

  return (
    <>
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          color: "#fff",
          borderRadius: "24px 24px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,.07)",
            top: -80,
            right: -60,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 11,
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={20} />
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "rgba(255,255,255,.15)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Cerrar vista"
            >
              <X size={15} />
            </button>
          </div>
          <h2 style={{ marginTop: 14, fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
            {sanitizeText(rol.nombre)}
          </h2>
          <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            {rol.descripcion || "Sin descripción"}
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(255,255,255,.18)",
                border: "1px solid rgba(255,255,255,.25)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {rol.estado}
            </span>
            {protegido && (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  background: "rgba(255,255,255,.18)",
                  border: "1px solid rgba(255,255,255,.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Lock size={10} /> Protegido
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
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
            Permisos activos
          </p>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>
            {activeCount} / {total}
          </span>
        </div>

        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: "#E2E8F0",
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              background: accent,
              width: `${(activeCount / total) * 100}%`,
            }}
            role="progressbar"
            aria-valuenow={(activeCount / total) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {permisosList.map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${value ? `${accent}20` : COLORS.border}`,
                background: value ? `${accent}06` : "#FAFAFA",
                color: value ? COLORS.text : COLORS.textLight,
              }}
            >
              <span>{PERMISO_LABELS[key] ?? key}</span>
              {value ? (
                <CheckCircle2 size={14} color={accent} />
              ) : (
                <XCircle size={14} color="#CBD5E1" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onEdit}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "13px 20px",
            borderRadius: 12,
            border: "none",
            background: accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 6px 18px ${accent}33`,
          }}
        >
          <Pencil size={14} />
          Editar este rol
        </button>
      </div>
    </>
  );
});

RolViewModal.displayName = "RolViewModal";

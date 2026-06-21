import React, { useMemo, useState, useCallback, useEffect, memo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Shield,
  Search,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers3,
  ShieldCheck,
  X,
} from "lucide-react";
import { useData, Rol } from "../context/DataContext";
import { toast } from "sonner";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  text: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
  bg: "#F5F7F8",
} as const;

const ROLES_PROTEGIDOS = ["Administrador", "SuperAdmin"] as const;

const PERMISOS = {
  administracion: { usuarios: "Usuarios", roles: "Roles", dashboard: "Dashboard" },
  operaciones: { entradaSalida: "Entrada / Salida", reservas: "Reservas", asignaciones: "Asignaciones" },
  parqueadero: { parqueaderos: "Parqueaderos", celdas: "Celdas", vehiculos: "Vehículos", conductores: "Conductores" },
  seguridad: { incidentes: "Incidentes", reconocimientoPlacas: "Reconocimiento" },
} as const;

type PermisosKeys = keyof typeof PERMISOS;
type PermisoKey = keyof typeof PERMISOS.administracion | keyof typeof PERMISOS.operaciones | keyof typeof PERMISOS.parqueadero | keyof typeof PERMISOS.seguridad;

const GRUPO_ICONS: Record<PermisosKeys, React.ReactNode> = {
  administracion: <Shield size={13} />,
  operaciones: <Layers3 size={13} />,
  parqueadero: <Sparkles size={13} />,
  seguridad: <ShieldCheck size={13} />,
};

const GRUPO_COLORS: Record<PermisosKeys, string> = {
  administracion: "#EF4444",
  operaciones: "#2563EB",
  parqueadero: "#F59E0B",
  seguridad: "#8B5CF6",
};

interface PermisosState {
  dashboard: boolean;
  roles: boolean;
  usuarios: boolean;
  conductores: boolean;
  vehiculos: boolean;
  parqueaderos: boolean;
  celdas: boolean;
  asignaciones: boolean;
  entradaSalida: boolean;
  reservas: boolean;
  incidentes: boolean;
  reconocimientoPlacas: boolean;
}

const initialPermisos: PermisosState = {
  dashboard: false,
  roles: false,
  usuarios: false,
  conductores: false,
  vehiculos: false,
  parqueaderos: false,
  celdas: false,
  asignaciones: false,
  entradaSalida: false,
  reservas: false,
  incidentes: false,
  reconocimientoPlacas: false,
};

const PERMISO_LABELS: Record<string, string> = Object.values(PERMISOS).reduce(
  (acc, g) => ({ ...acc, ...g }),
  {} as Record<string, string>
);

const getRolAccent = (nombre: string): string => {
  switch (nombre) {
    case "Administrador": return "#EF4444";
    case "SuperAdmin": return "#8B5CF6";
    case "Supervisor": return "#2563EB";
    case "Operador": return "#F59E0B";
    default: return COLORS.primary;
  }
};

const countActive = (p: PermisosState): number => Object.values(p).filter(Boolean).length;

const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

const Modal = memo(({ open, onClose, children, maxWidth = 780 }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const focusable = document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 24,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 55px rgba(15,23,42,.12)",
          animation: "modalIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn{
          from{opacity:0;transform:translateY(16px) scale(.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
      `}</style>
    </div>
  );
});

Modal.displayName = "Modal";

interface FormState {
  nombre: string;
  descripcion: string;
  permisos: PermisosState;
  estado: "activo" | "inactivo";
}

interface RolFormProps {
  initial: FormState;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  title: string;
  isEditing?: boolean;
}

const RolForm = memo(({ initial, onSave, onCancel, title, isEditing = false }: RolFormProps) => {
  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleTogglePermiso = useCallback((k: keyof PermisosState) => {
    setForm((f) => ({
      ...f,
      permisos: { ...f.permisos, [k]: !f.permisos[k] },
    }));
  }, []);

  const handleToggleGrupo = useCallback((grupo: PermisosKeys) => {
    const keys = Object.keys(PERMISOS[grupo]) as Array<keyof PermisosState>;
    const allOn = keys.every((k) => form.permisos[k]);
    setForm((f) => ({
      ...f,
      permisos: keys.reduce((acc, k) => ({ ...acc, [k]: !allOn }), f.permisos),
    }));
  }, [form.permisos]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const sanitizedName = sanitizeText(form.nombre.trim());
      if (!sanitizedName) {
        toast.error("El nombre es obligatorio");
        return;
      }
      onSave({ ...form, nombre: sanitizedName });
    },
    [form, onSave]
  );

  const activeCount = useMemo(() => countActive(form.permisos), [form.permisos]);
  const total = useMemo(() => Object.keys(form.permisos).length, [form.permisos]);

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: "1.4rem 1.8rem 1.2rem",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(57,169,0,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={18} color={COLORS.primary} />
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                color: COLORS.primary,
                textTransform: "uppercase",
              }}
            >
              Seguridad
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>{title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            cursor: "pointer",
            color: COLORS.textLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Cerrar formulario"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <section>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: COLORS.textLight,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Información básica
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isEditing ? "1fr 1fr" : "1fr", gap: 10 }}>
            <div>
              <label
                htmlFor="role-name"
                style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}
              >
                Nombre del rol
              </label>
              <input
                id="role-name"
                type="text"
                placeholder="ej. Operador de turno"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 11,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  background: "#F8FAFC",
                }}
                required
                aria-required="true"
              />
            </div>

            {isEditing && (
              <div>
                <label
                  htmlFor="role-status"
                  style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}
                >
                  Estado
                </label>
                <select
                  id="role-status"
                  value={form.estado}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estado: e.target.value as "activo" | "inactivo" }))
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                    cursor: "pointer",
                  }}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <label
              htmlFor="role-description"
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}
            >
              Descripción
            </label>
            <textarea
              id="role-description"
              placeholder="Describe las responsabilidades de este rol..."
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={2}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 11,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                background: "#F8FAFC",
                resize: "none",
              }}
            />
          </div>
        </section>

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
              marginBottom: 12,
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(Object.entries(PERMISOS) as [PermisosKeys, typeof PERMISOS[PermisosKeys]][]).map(
              ([grupo, permisos]) => {
                const color = GRUPO_COLORS[grupo] ?? COLORS.primary;
                const keys = Object.keys(permisos) as Array<keyof PermisosState>;
                const on = keys.filter((k) => form.permisos[k]).length;
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
                        padding: "9px 12px",
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
                          {GRUPO_ICONS[grupo]}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: COLORS.text,
                            textTransform: "capitalize",
                          }}
                        >
                          {grupo}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleGrupo(grupo)}
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
                        padding: "8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {Object.entries(permisos).map(([key, label]) => {
                        const checked = form.permisos[key as keyof PermisosState];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleTogglePermiso(key as keyof PermisosState)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
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
      </div>

      <div
        style={{
          padding: "1rem 1.8rem",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 20px",
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.text,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            padding: "11px 24px",
            borderRadius: 12,
            border: "none",
            background: COLORS.primary,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 6px 18px rgba(57,169,0,.22)",
          }}
        >
          {title === "Nuevo Rol" ? "Crear Rol" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
});

RolForm.displayName = "RolForm";

interface ViewModalProps {
  rol: Rol;
  onClose: () => void;
  onEdit: () => void;
}

const ViewModal = memo(({ rol, onClose, onEdit }: ViewModalProps) => {
  const accent = getRolAccent(rol.nombre);
  const activeCount = useMemo(() => countActive(rol.permisos), [rol.permisos]);
  const total = useMemo(() => Object.keys(rol.permisos).length, [rol.permisos]);
  const protegido = ROLES_PROTEGIDOS.includes(rol.nombre as any);

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

ViewModal.displayName = "ViewModal";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog = memo(({ open, onConfirm, onCancel, title, message }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 20,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 55px rgba(15,23,42,.12)",
          padding: "1.8rem",
          animation: "modalIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: "#fff",
              color: COLORS.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = "ConfirmDialog";

const RoleCard = memo(
  ({
    rol,
    onView,
    onEdit,
    onDelete,
  }: {
    rol: Rol;
    onView: (rol: Rol) => void;
    onEdit: (rol: Rol) => void;
    onDelete: (rol: Rol) => void;
  }) => {
    const activeCount = useMemo(() => countActive(rol.permisos), [rol.permisos]);
    const total = useMemo(() => Object.keys(rol.permisos).length, [rol.permisos]);
    const pct = Math.round((activeCount / total) * 100);

    const protegido = ROLES_PROTEGIDOS.includes(rol.nombre as any);
    const accent = getRolAccent(rol.nombre);
    const activo = rol.estado === "activo";

    const activePermissions = useMemo(
      () =>
        Object.entries(rol.permisos)
          .filter(([, value]) => value)
          .map(([key]) => PERMISO_LABELS[key] ?? key)
          .slice(0, 3),
      [rol.permisos]
    );

    const handleView = useCallback(() => onView(rol), [onView, rol]);
    const handleEdit = useCallback(() => onEdit(rol), [onEdit, rol]);
    const handleDelete = useCallback(() => onDelete(rol), [onDelete, rol]);

   return (
  <article
    style={{
      background: "#fff",
      borderRadius: 20,
      border: `1px solid ${COLORS.border}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 4px 14px rgba(15,23,42,.06)",
      transition: ".25s",
      height: "100%",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow =
        "0 14px 28px rgba(15,23,42,.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 4px 14px rgba(15,23,42,.06)";
    }}
  >
    <div
      style={{
        height: 6,
        background: accent,
      }}
    />

    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `${accent}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Shield size={24} color={accent} />
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: activo
              ? "rgba(57,169,0,.12)"
              : "rgba(239,68,68,.12)",
            color: activo
              ? COLORS.primaryDark
              : "#EF4444",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {rol.estado}
        </span>
      </div>

      <h3
        style={{
          marginTop: 14,
          fontSize: 20,
          fontWeight: 900,
          color: COLORS.text,
        }}
      >
        {rol.nombre}
      </h3>

      <p
        style={{
          fontSize: 12,
          color: COLORS.textLight,
          marginTop: 4,
          minHeight: 34,
        }}
      >
        {rol.descripcion || "Sin descripción"}
      </p>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: COLORS.textLight,
              fontWeight: 700,
            }}
          >
            Nivel de acceso
          </span>

          <span
            style={{
              color: accent,
              fontWeight: 900,
            }}
          >
            {pct}%
          </span>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "#E2E8F0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: accent,
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {activePermissions.slice(0, 4).map((p) => (
          <span
            key={p}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: `${accent}12`,
              color: accent,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>

    <div
      style={{
        marginTop: "auto",
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
      }}
    >
      <button
        onClick={handleView}
        style={{
          flex: 1,
          padding: 14,
          border: "none",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <Eye size={16} />
      </button>

      <button
        onClick={handleEdit}
        style={{
          flex: 1,
          padding: 14,
          border: "none",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <Pencil size={16} />
      </button>

      {!protegido && (
        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: 14,
            border: "none",
            background: "#fff",
            cursor: "pointer",
            color: "#EF4444",
          }}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  </article>
);
  }
);

RoleCard.displayName = "RoleCard";

const emptyForm = (): FormState => ({
  nombre: "",
  descripcion: "",
  permisos: { ...initialPermisos },
  estado: "activo",
});

export function Roles() {
  const { roles, addRol, updateRol, deleteRol } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);
  const [deletingRol, setDeletingRol] = useState<Rol | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());

  const filteredRoles = useMemo(
    () =>
      roles.filter((r) => {
        const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase());
        const matchEstado = filterEstado === "todos" || r.estado === filterEstado;
        return matchSearch && matchEstado;
      }),
    [roles, search, filterEstado]
  );

  const stats = useMemo(
    () => ({
      activos: roles.filter((r) => r.estado === "activo").length,
      protegidos: ROLES_PROTEGIDOS.length,
      total: roles.length,
      permisos: Object.keys(initialPermisos).length,
    }),
    [roles]
  );

  const openCreate = useCallback(() => {
    setEditingRol(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (rol: Rol) => {
      setEditingRol(rol);
      setFormInitial({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: { ...rol.permisos },
        estado: rol.estado,
      });
      setViewOpen(false);
      setDialogOpen(true);
    },
    []
  );

  const openView = useCallback((rol: Rol) => {
    setViewingRol(rol);
    setViewOpen(true);
  }, []);

  const openConfirm = useCallback((rol: Rol) => {
    if (ROLES_PROTEGIDOS.includes(rol.nombre as any)) {
      toast.error("Este rol está protegido y no puede eliminarse");
      return;
    }
    setDeletingRol(rol);
    setConfirmOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: FormState) => {
      try {
        if (editingRol) {
          updateRol(editingRol.id, data);
          toast.success("Rol actualizado correctamente");
        } else {
          addRol(data);
          toast.success("Rol creado correctamente");
        }
        setDialogOpen(false);
      } catch (error) {
        toast.error("Error al guardar el rol");
        console.error("Error saving role:", error);
      }
    },
    [editingRol, addRol, updateRol]
  );

  const handleDelete = useCallback(() => {
    if (deletingRol) {
      try {
        deleteRol(deletingRol.id);
        toast.success("Rol eliminado correctamente");
        setConfirmOpen(false);
        setDeletingRol(null);
      } catch (error) {
        toast.error("Error al eliminar el rol");
        console.error("Error deleting role:", error);
      }
    }
  }, [deletingRol, deleteRol]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .roles-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${COLORS.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="roles-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
            background: "linear-gradient(135deg,#39A900,#2D7D00)",
            padding: "1.4rem 1.6rem",
            color: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(255,255,255,.07)",
              top: -80,
              right: -60,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                <ShieldCheck size={11} /> Seguridad y permisos
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem,3vw,2.2rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                Gestión de Roles
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra accesos, permisos y niveles de seguridad.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                minWidth: 280,
              }}
            >
              {[
                { label: "Activos", value: stats.activos },
                { label: "Protegidos", value: stats.protegidos },
                { label: "Permisos", value: stats.permisos },
                { label: "Total", value: stats.total },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,.12)",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 12,
                    padding: "8px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: "rgba(255,255,255,.65)",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: COLORS.textLight,
              }}
            />
            <input
              placeholder="Buscar rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                borderRadius: 11,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: "#fff",
                fontFamily: "inherit",
              }}
              aria-label="Buscar roles"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as "todos" | "activo" | "inactivo")
            }
            style={{
              padding: "10px 14px",
              borderRadius: 11,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              background: "#fff",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <button
            onClick={openCreate}
            style={{
              padding: "10px 18px",
              borderRadius: 11,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 14px rgba(57,169,0,.25)",
            }}
          >
            <Plus size={15} /> Nuevo Rol
          </button>
        </div>

        {filteredRoles.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              borderRadius: 16,
              border: `2px dashed ${COLORS.border}`,
              background: "#fff",
              color: COLORS.textLight,
            }}
          >
            <Shield size={36} color={COLORS.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron roles</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea uno nuevo</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
              gap: 10,
            }}
          >
            {filteredRoles.map((rol) => (
              <RoleCard
                key={rol.id}
                rol={rol}
                onView={openView}
                onEdit={openEdit}
                onDelete={openConfirm}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={780}>
        <RolForm
          key={editingRol?.id ?? "new"}
          initial={formInitial}
          title={editingRol ? "Editar Rol" : "Nuevo Rol"}
          isEditing={!!editingRol}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={440}>
        {viewingRol && (
          <ViewModal
            rol={viewingRol}
            onClose={() => setViewOpen(false)}
            onEdit={() => openEdit(viewingRol)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingRol(null);
        }}
        title="Eliminar Rol"
        message={`¿Estás seguro de eliminar el rol "${deletingRol?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}
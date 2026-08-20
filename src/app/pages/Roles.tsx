import React, { useMemo, useState, useCallback, useEffect, memo } from "react";
import {
  Plus,
  Pencil,
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
import { theme } from "../theme";
import { Modal } from "../components/shared";

const COLORS = theme;

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

const GRUPO_LABELS: Record<PermisosKeys, string> = {
  administracion: "Administración",
  operaciones: "Operaciones",
  parqueadero: "Parqueadero",
  seguridad: "Seguridad",
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
    case "Vigilante": return "#F59E0B";
    default: return COLORS.primary;
  }
};

const countActive = (p: PermisosState): number => Object.values(p).filter(Boolean).length;
const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

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
  existingRoles: Rol[];
  editingRolId?: string | null;
}

const RolForm = memo(({ initial, onSave, onCancel, title, isEditing = false, existingRoles, editingRolId = null }: RolFormProps) => {
  const [form, setForm] = useState<FormState>(initial);
  const [nombreError, setNombreError] = useState<string>("");

  useEffect(() => {
    setForm(initial);
    setNombreError("");
  }, [initial]);

  const handleNombreChange = useCallback(
    (value: string) => {
      setForm((f) => ({ ...f, nombre: value }));
      const trimmed = value.trim().toLowerCase();
      const duplicado = existingRoles.some(
        (r) => r.id !== editingRolId && r.nombre.trim().toLowerCase() === trimmed
      );
      setNombreError(trimmed && duplicado ? "Ya existe un rol con este nombre" : "");
    },
    [existingRoles, editingRolId]
  );

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
      const rawName = form.nombre.trim();
      if (!rawName) {
        toast.error("El nombre es obligatorio");
        return;
      }
      const duplicado = existingRoles.some(
        (r) => r.id !== editingRolId && r.nombre.trim().toLowerCase() === rawName.toLowerCase()
      );
      if (duplicado) {
        setNombreError("Ya existe un rol con este nombre");
        toast.error("Ya existe un rol con este nombre");
        return;
      }
      const sanitizedName = sanitizeText(rawName);
      onSave({ ...form, nombre: sanitizedName });
    },
    [form, onSave, existingRoles, editingRolId]
  );

  const activeCount = useMemo(() => countActive(form.permisos), [form.permisos]);
  const total = useMemo(() => Object.keys(form.permisos).length, [form.permisos]);

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: "1.1rem 1.6rem 0.9rem",
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

      <div style={{ padding: "1rem 1.6rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <section>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: COLORS.textLight,
              textTransform: "uppercase",
              marginBottom: 6,
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
                onChange={(e) => handleNombreChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: 11,
                  border: `1px solid ${nombreError ? "#EF4444" : COLORS.border}`,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  background: "#F8FAFC",
                }}
                required
                aria-required="true"
                aria-invalid={!!nombreError}
                aria-describedby={nombreError ? "role-name-error" : undefined}
              />
              {nombreError && (
                <p
                  id="role-name-error"
                  style={{ marginTop: 5, fontSize: 11, fontWeight: 700, color: "#EF4444" }}
                >
                  {nombreError}
                </p>
              )}
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
                    padding: "9px 14px",
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

          <div style={{ marginTop: 8 }}>
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
              rows={1}
              style={{
                width: "100%",
                padding: "9px 14px",
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "start" }}>
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
                          {GRUPO_ICONS[grupo]}
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
                        padding: "7px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
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
      </div>

      <div
        style={{
          padding: "0.8rem 1.6rem",
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

const RoleCard = memo(
  ({
    rol,
    onView,
    onEdit,
    onToggleEstado,
  }: {
    rol: Rol;
    onView: (rol: Rol) => void;
    onEdit: (rol: Rol) => void;
    onToggleEstado: (rol: Rol) => void;
  }) => {
    const activeCount = useMemo(() => countActive(rol.permisos), [rol.permisos]);
    const total = useMemo(() => Object.keys(rol.permisos).length, [rol.permisos]);
    const pct = Math.round((activeCount / total) * 100);

    const protegido = ROLES_PROTEGIDOS.includes(rol.nombre as any);
    const accent = getRolAccent(rol.nombre);
    const activo = rol.estado === "activo";

    const gruposDesglose = useMemo(
      () =>
        (Object.entries(PERMISOS) as [PermisosKeys, typeof PERMISOS[PermisosKeys]][]).map(
          ([grupo, permisos]) => {
            const keys = Object.keys(permisos) as Array<keyof PermisosState>;
            const on = keys.filter((k) => rol.permisos[k]).length;
            return { grupo, on, total: keys.length };
          }
        ),
      [rol.permisos]
    );

    const filledBars = pct === 0 ? 0 : Math.max(1, Math.ceil(pct / 20));
    const barHeights = [7, 11, 15, 19, 23];

    const handleView = useCallback(() => onView(rol), [onView, rol]);
    const handleEdit = useCallback(() => onEdit(rol), [onEdit, rol]);
    const handleToggleEstado = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleEstado(rol);
      },
      [onToggleEstado, rol]
    );

    return (
      <article className="role-card" style={{ ["--accent" as any]: accent }}>
        <div className="role-card-top" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="role-card-top-row">
            <div className="role-icon" style={{ background: `${accent}15` }}>
              <Shield size={20} color={accent} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="role-status-pill"
                style={{
                  background: activo ? "rgba(57,169,0,.12)" : "rgba(148,163,184,.16)",
                  color: activo ? COLORS.primaryDark : COLORS.textLight,
                }}
              >
                {activo ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {rol.estado}
              </span>
              {!protegido && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  aria-label={activo ? `Deshabilitar rol ${sanitizeText(rol.nombre)}` : `Habilitar rol ${sanitizeText(rol.nombre)}`}
                  title={activo ? "Deshabilitar rol" : "Habilitar rol"}
                  onClick={handleToggleEstado}
                  className="role-switch"
                  style={{
                    background: activo ? COLORS.primary : "#CBD5E1",
                  }}
                >
                  <span
                    className="role-switch-knob"
                    style={{ transform: activo ? "translateX(14px)" : "translateX(0)" }}
                  />
                </button>
              )}
            </div>
          </div>

          <div className="role-name-row">
            <h3 className="role-name">{sanitizeText(rol.nombre)}</h3>
            {protegido && (
              <span className="role-lock" title="Rol protegido del sistema">
                <Lock size={11} />
              </span>
            )}
          </div>

          <p className="role-desc">{rol.descripcion || "Sin descripción"}</p>
        </div>

        <div className="role-card-body">
          <div className="clearance-row">
            <span className="clearance-label">Nivel de acceso</span>
            <span className="clearance-pct" style={{ color: accent }}>
              {pct}%
            </span>
          </div>
          <div className="clearance-bars">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="clearance-bar"
                style={{
                  height: h,
                  background: i < filledBars ? accent : "#E2E8F0",
                }}
              />
            ))}
          </div>

          <div className="group-grid">
            {gruposDesglose.map(({ grupo, on, total: totalGrupo }) => {
              const color = GRUPO_COLORS[grupo];
              const activeGroup = on > 0;
              return (
                <div
                  key={grupo}
                  className="group-chip"
                  style={{
                    background: activeGroup ? `${color}12` : "#F8FAFC",
                    color: activeGroup ? color : COLORS.textLight,
                    border: `1px solid ${activeGroup ? `${color}30` : COLORS.border}`,
                  }}
                  title={GRUPO_LABELS[grupo]}
                >
                  {GRUPO_ICONS[grupo]}
                  <span>{on}/{totalGrupo}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="role-card-footer">
          <button className="role-action-btn" onClick={handleView} aria-label={`Ver detalle de ${sanitizeText(rol.nombre)}`} title="Ver detalle">
            <Eye size={15} />
          </button>
          <span className="role-action-divider" />
          <button className="role-action-btn" onClick={handleEdit} aria-label={`Editar ${sanitizeText(rol.nombre)}`} title="Editar">
            <Pencil size={15} />
          </button>
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
  const { roles, addRol, updateRol } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);
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

  const handleToggleEstado = useCallback(
    (rol: Rol) => {
      if (ROLES_PROTEGIDOS.includes(rol.nombre as any)) {
        toast.error("Este rol está protegido y no puede deshabilitarse");
        return;
      }
      try {
        const nuevoEstado = rol.estado === "activo" ? "inactivo" : "activo";
        updateRol(rol.id, {
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: rol.permisos,
          estado: nuevoEstado,
        });
        toast.success(
          nuevoEstado === "activo" ? "Rol habilitado correctamente" : "Rol deshabilitado correctamente"
        );
      } catch (error) {
        toast.error("Error al cambiar el estado del rol");
        console.error("Error toggling role state:", error);
      }
    },
    [updateRol]
  );

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

        /* ---------- Tarjeta de rol (rediseño) ---------- */
        .role-card{
          background: #fff;
          border-radius: 18px;
          border: 1px solid ${COLORS.border};
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-shadow: 0 1px 2px rgba(15,23,42,.04);
          transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s cubic-bezier(.4,0,.2,1), border-color .22s ease;
        }
        .role-card:hover{
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(15,23,42,.10);
          border-color: color-mix(in srgb, var(--accent) 40%, ${COLORS.border});
        }

        .role-card-top{
          padding: 16px 16px 12px;
        }
        .role-card-top-row{
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .role-icon{
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .role-status-pill{
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .role-switch{
          position: relative;
          width: 30px;
          height: 17px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          padding: 2px;
          flex-shrink: 0;
          transition: background .18s ease;
        }
        .role-switch-knob{
          display: block;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 2px rgba(15,23,42,.25);
          transition: transform .18s ease;
        }

        .role-name-row{
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }
        .role-name{
          font-size: 16px;
          font-weight: 900;
          color: ${COLORS.text};
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .role-lock{
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: #F1F5F9;
          color: ${COLORS.textLight};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .role-desc{
          margin-top: 4px;
          font-size: 11.5px;
          color: ${COLORS.textLight};
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 33px;
        }

        .role-card-body{
          padding: 14px 16px 4px;
          flex: 1;
        }
        .clearance-row{
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .clearance-label{
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: ${COLORS.textLight};
        }
        .clearance-pct{
          font-size: 14px;
          font-weight: 900;
        }
        .clearance-bars{
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 24px;
          margin-bottom: 14px;
        }
        .clearance-bar{
          flex: 1;
          border-radius: 2px;
          transition: background .3s ease;
        }

        .group-grid{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 14px;
        }
        .group-chip{
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border-radius: 9px;
          font-size: 10.5px;
          font-weight: 800;
        }

        .role-card-footer{
          margin-top: auto;
          border-top: 1px solid ${COLORS.border};
          display: flex;
          align-items: center;
          background: ${COLORS.bg};
        }
        .role-action-btn{
          flex: 1;
          padding: 11px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: ${COLORS.textLight};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s ease, color .15s ease;
        }
        .role-action-btn:hover{
          background: #fff;
          color: ${COLORS.text};
        }
        .role-action-btn.danger:hover{
          background: #FEE2E2;
          color: #DC2626;
        }
        .role-action-divider{
          width: 1px;
          align-self: stretch;
          background: ${COLORS.border};
        }
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
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 14,
            }}
          >
            {filteredRoles.map((rol) => (
              <RoleCard
                key={rol.id}
                rol={rol}
                onView={openView}
                onEdit={openEdit}
                onToggleEstado={handleToggleEstado}
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
          existingRoles={roles}
          editingRolId={editingRol?.id ?? null}
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
    </>
  );
}
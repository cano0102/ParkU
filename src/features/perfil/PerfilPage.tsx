import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  X,
  BadgeCheck,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { PASSWORD_MIN, PASSWORD_MAX, TELEFONO_REGEX } from "@/utils/validation";

const C = theme;

const MAX_FOTO_SOURCE_MB = 5;
const FOTO_SIZE = 256;

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 9,
  border: `1px solid ${C.border}`,
  fontSize: 13,
  fontWeight: 700,
  fontFamily: "inherit",
  color: C.text,
  background: "#fff",
  outline: "none",
};

export function Perfil() {
  const { user, updateUser, changePassword } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ nombre: user?.nombre ?? "", numero: user?.numero ?? "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  if (!user) return null;

  const passwordLengthOk = passwordData.newPassword.length >= PASSWORD_MIN && passwordData.newPassword.length <= PASSWORD_MAX;
  const passwordsMatch = !!passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword;
  const currentFilled = passwordData.currentPassword.length > 0;
  const passwordDifferent = !!passwordData.newPassword && passwordData.newPassword !== passwordData.currentPassword;
  const canSubmitPassword = passwordLengthOk && passwordsMatch && currentFilled && passwordDifferent;

  const closePasswordDialog = () => {
    setDialogOpen(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSaveProfile = () => {
    const nombre = profileForm.nombre.trim();
    const numero = profileForm.numero.trim();
    if (!nombre) return toast.error("El nombre no puede estar vacío");
    if (numero && !TELEFONO_REGEX.test(numero)) return toast.error("Ingresa un número de teléfono válido");
    updateUser({ nombre, numero });
    toast.success("Perfil actualizado");
    setEditMode(false);
  };

  // Redimensiona y recorta la imagen a un cuadrado en el propio navegador
  // antes de guardarla, para no llenar el estado en memoria (y localStorage)
  // con fotos de varios MB solo para mostrar un avatar pequeño.
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > MAX_FOTO_SOURCE_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_FOTO_SOURCE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = FOTO_SIZE;
        canvas.height = FOTO_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          toast.error("No se pudo procesar la imagen");
          return;
        }
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, FOTO_SIZE, FOTO_SIZE);
        updateUser({ foto: canvas.toDataURL("image/jpeg", 0.85) });
        toast.success("Foto de perfil actualizada");
      };
      img.onerror = () => toast.error("No se pudo procesar la imagen");
      img.src = reader.result as string;
    };
    reader.onerror = () => toast.error("No se pudo cargar la imagen");
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateUser({ foto: "" });
    toast.success("Foto de perfil eliminada");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFilled) return toast.error("Ingresa tu contraseña actual");
    if (!passwordLengthOk) return toast.error(`La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`);
    if (!passwordDifferent) return toast.error("La nueva contraseña debe ser diferente a la actual");
    if (!passwordsMatch) return toast.error("Las contraseñas no coinciden");

    setSubmitting(true);
    try {
      const ok = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (!ok) return toast.error("Contraseña actual incorrecta");
      toast.success("Contraseña actualizada");
      closePasswordDialog();
    } finally {
      setSubmitting(false);
    }
  };

  const infoItems = [
    {
      key: "nombre",
      icon: User,
      label: "Nombre",
      editable: true,
      value: user.nombre,
      placeholder: "Tu nombre completo",
    },
    {
      key: "correo",
      icon: Mail,
      label: "Correo",
      editable: false,
      value: user.correo,
    },
    {
      key: "numero",
      icon: Phone,
      label: "Teléfono",
      editable: true,
      value: user.numero || "—",
      placeholder: "Ej: 3001234567",
    },
    {
      key: "id",
      icon: IdCard,
      label: "ID de usuario",
      editable: false,
      value: user.id,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .perfil-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .perfil-root input:focus{
          outline:none;
          border-color:${C.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        .perfil-row{ transition: background .15s; border-radius: 10px; }
        .perfil-row:hover{ background: #F8FAF8; }
        .perfil-btn{ transition: all .15s ease; cursor:pointer; font-family:inherit; }
        .perfil-btn:hover{ transform: translateY(-1px); }
        .perfil-btn:active{ transform: translateY(0); }
        .perfil-eye-btn{ cursor:pointer; background:none; border:none; padding:0; display:flex; align-items:center; color:${C.textLight}; }
      `}</style>

      <div className="perfil-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* HERO */}
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
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 20,
                  background: "rgba(255,255,255,.16)",
                  border: "1px solid rgba(255,255,255,.25)",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  overflow: "hidden",
                }}
              >
                {user.foto ? (
                  <img
                    src={user.foto}
                    alt={user.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  user.nombre.charAt(0).toUpperCase()
                )}
              </div>

              <label
                htmlFor="fotoPerfilInput"
                className="perfil-btn"
                title="Cambiar foto de perfil"
                style={{
                  position: "absolute",
                  bottom: -6,
                  right: -6,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#fff",
                  border: `2px solid ${C.primary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,.2)",
                }}
              >
                <Camera size={12} color={C.primary} />
              </label>
              <input
                id="fotoPerfilInput"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />

              {user.foto && (
                <button
                  type="button"
                  className="perfil-btn"
                  onClick={handleRemovePhoto}
                  title="Quitar foto de perfil"
                  aria-label="Quitar foto de perfil"
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: C.danger,
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <X size={10} />
                </button>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                <Sparkles size={11} /> Mi perfil
              </div>
              <h1 style={{ fontSize: "clamp(1.3rem,2.4vw,1.7rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 2 }}>
                {user.nombre}
              </h1>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.85)" }}>{user.correo}</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <Shield size={12} /> {user.rol}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(34,197,94,.22)",
                  border: "1px solid rgba(255,255,255,.2)",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <BadgeCheck size={12} /> Activo
              </span>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN PERSONAL */}
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,23,42,.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "12px 16px",
              background: "#F8FAF8",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={15} color={C.primary} />
              <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Información personal</span>
            </div>

            {!editMode ? (
              <button
                type="button"
                className="perfil-btn"
                onClick={() => {
                  setProfileForm({ nombre: user.nombre, numero: user.numero });
                  setEditMode(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                <Pencil size={12} /> Editar
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="perfil-btn"
                  onClick={() => {
                    setEditMode(false);
                    setProfileForm({ nombre: user.nombre, numero: user.numero });
                  }}
                  aria-label="Cancelar edición"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: `1px solid ${C.border}`,
                    background: "#fff",
                    color: C.textLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  className="perfil-btn"
                  onClick={handleSaveProfile}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 9,
                    border: "none",
                    background: C.primary,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    boxShadow: "0 4px 12px rgba(57,169,0,.25)",
                  }}
                >
                  <Save size={12} /> Guardar
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: "2px 16px" }}>
            {infoItems.map((item) => (
              <div
                key={item.key}
                className="perfil-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 2px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: C.primaryPale,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <item.icon size={16} color={C.primary} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: C.textLight,
                    }}
                  >
                    {item.label}
                  </div>
                  {item.editable && editMode ? (
                    <input
                      value={item.key === "nombre" ? profileForm.nombre : profileForm.numero}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          [item.key === "nombre" ? "nombre" : "numero"]: e.target.value,
                        })
                      }
                      placeholder={item.placeholder}
                      style={fieldInputStyle}
                    />
                  ) : (
                    <p
                      style={{
                        marginTop: 2,
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: C.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div
              className="perfil-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                padding: "12px 2px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: C.primaryPale,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={16} color={C.primary} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: C.textLight,
                    }}
                  >
                    Rol
                  </div>
                  <p style={{ marginTop: 2, fontSize: 13.5, fontWeight: 800, color: C.text }}>{user.rol}</p>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  background: "rgba(57,169,0,.1)",
                  color: C.primaryDark,
                }}
              >
                <CheckCircle2 size={12} /> Permisos activos
              </span>
            </div>
          </div>
        </div>

        {/* SEGURIDAD */}
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: "#fff",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,23,42,.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "12px 16px",
              background: "#F8FAF8",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={15} color={C.primary} />
              <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Seguridad</span>
            </div>
            <button
              type="button"
              className="perfil-btn"
              onClick={() => setDialogOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 9,
                border: "none",
                background: C.primary,
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(57,169,0,.25)",
              }}
            >
              <Key size={12} /> Cambiar
            </button>
          </div>

          <div style={{ padding: "2px 16px" }}>
            <div
              className="perfil-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                padding: "12px 2px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: C.primaryPale,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={16} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>Contraseña protegida</div>
                  <p style={{ marginTop: 2, fontSize: 11, color: C.textLight }}>Cámbiala periódicamente para mantener tu cuenta segura.</p>
                </div>
              </div>
              <div style={{ fontSize: 18, letterSpacing: 3, color: C.textMuted, fontWeight: 700 }}>••••••••</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: CAMBIAR CONTRASEÑA */}
      <Modal open={dialogOpen} onClose={closePasswordDialog} maxWidth={420} title="Cambiar contraseña">
        <form onSubmit={handlePasswordChange}>
          <div
            style={{
              padding: "1.1rem 1.6rem 0.9rem",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(57,169,0,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Key size={18} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
                Seguridad de la cuenta
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1 }}>Cambiar contraseña</h2>
            </div>
          </div>

          <div style={{ padding: "1rem 1.6rem", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                label: "Contraseña actual",
                icon: Lock,
                show: showCurrent,
                setShow: setShowCurrent,
                value: passwordData.currentPassword,
                setValue: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value }),
              },
              {
                label: "Nueva contraseña",
                icon: Key,
                show: showNew,
                setShow: setShowNew,
                value: passwordData.newPassword,
                setValue: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value }),
              },
            ].map(({ label, icon: Icon, show, setShow, value, setValue }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <Icon
                    size={14}
                    color={C.textLight}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type={show ? "text" : "password"}
                    placeholder={label}
                    value={value}
                    onChange={setValue}
                    maxLength={label === "Nueva contraseña" ? PASSWORD_MAX : undefined}
                    style={{
                      width: "100%",
                      padding: "10px 36px",
                      borderRadius: 11,
                      border: `1px solid ${C.border}`,
                      fontSize: 13,
                      fontFamily: "inherit",
                      background: "#F8FAFC",
                      color: C.text,
                    }}
                  />
                  <button
                    type="button"
                    className="perfil-eye-btn"
                    onClick={() => setShow(!show)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Confirmar nueva contraseña</label>
              <div style={{ position: "relative" }}>
                <CheckCircle2
                  size={14}
                  color={C.textLight}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Confirmar nueva contraseña"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  maxLength={PASSWORD_MAX}
                  style={{
                    width: "100%",
                    padding: "10px 36px 10px 36px",
                    borderRadius: 11,
                    border: `1px solid ${C.border}`,
                    fontSize: 13,
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                    color: C.text,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                borderRadius: 11,
                border: `1px solid ${C.border}`,
                background: "#F8FAFC",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                { label: "Contraseña actual ingresada", check: currentFilled },
                { label: `Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`, check: passwordLengthOk },
                { label: "Diferente a la contraseña actual", check: passwordDifferent },
                { label: "Las contraseñas coinciden", check: passwordsMatch },
              ].map(({ label, check }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: check ? C.primaryDark : C.textLight,
                  }}
                >
                  <CheckCircle2 size={13} color={check ? C.primary : C.textMuted} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "0.9rem 1.6rem",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              className="perfil-btn"
              onClick={closePasswordDialog}
              style={{
                padding: "10px 18px",
                borderRadius: 11,
                border: `1px solid ${C.border}`,
                background: "#fff",
                color: C.text,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="perfil-btn"
              disabled={!canSubmitPassword || submitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 11,
                border: "none",
                background: canSubmitPassword ? C.primary : C.textMuted,
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                cursor: canSubmitPassword && !submitting ? "pointer" : "not-allowed",
                opacity: canSubmitPassword ? 1 : 0.65,
                boxShadow: canSubmitPassword ? "0 6px 18px rgba(57,169,0,.22)" : "none",
              }}
            >
              <Save size={13} />
              {submitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

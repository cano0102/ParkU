import { BadgeCheck, Camera, Shield, Sparkles, X } from "lucide-react";
import { theme } from "@/styles/theme";
import { useAuth } from "@/context/AuthContext";
import { nombreDeRol } from "@/services/core/roles";

const C = theme;

interface PerfilHeroProps {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

/** Banner superior con avatar (editable), nombre, correo, rol y estado de la cuenta. */
export function PerfilHero({ user, onPhotoChange, onRemovePhoto }: PerfilHeroProps) {
  return (
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
          position: "absolute", width: 250, height: 250, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", top: -80, right: -60,
        }}
      />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 76, height: 76, borderRadius: 20,
              background: "rgba(255,255,255,.16)",
              border: "1px solid rgba(255,255,255,.25)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 900, overflow: "hidden",
            }}
          >
            {user.foto ? (
              <img src={user.foto} alt={user.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user.nombre.charAt(0).toUpperCase()
            )}
          </div>

          <label
            htmlFor="fotoPerfilInput"
            className="perfil-btn"
            title="Cambiar foto de perfil"
            style={{
              position: "absolute", bottom: -6, right: -6, width: 28, height: 28, borderRadius: "50%",
              background: "#fff", border: `2px solid ${C.primary}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,.2)",
            }}
          >
            <Camera size={12} color={C.primary} />
          </label>
          <input id="fotoPerfilInput" type="file" accept="image/*" onChange={onPhotoChange} style={{ display: "none" }} />

          {user.foto && (
            <button
              type="button"
              className="perfil-btn"
              onClick={onRemovePhoto}
              title="Quitar foto de perfil"
              aria-label="Quitar foto de perfil"
              style={{
                position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                background: C.danger, border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
              }}
            >
              <X size={10} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
              padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800,
              letterSpacing: 1, textTransform: "uppercase", marginBottom: 6,
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
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
              padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
            }}
          >
            <Shield size={12} /> {nombreDeRol(user.rol)}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(34,197,94,.22)", border: "1px solid rgba(255,255,255,.2)",
              padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
            }}
          >
            <BadgeCheck size={12} /> Activo
          </span>
        </div>
      </div>
    </div>
  );
}

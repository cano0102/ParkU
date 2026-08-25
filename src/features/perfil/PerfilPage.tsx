import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { usePerfilForm } from "./hooks/usePerfilForm";
import { usePasswordChange } from "./hooks/usePasswordChange";
import { useFotoPerfil } from "./hooks/useFotoPerfil";
import { PerfilHero } from "./components/PerfilHero";
import { InformacionPersonalCard } from "./components/InformacionPersonalCard";
import { SeguridadCard } from "./components/SeguridadCard";
import { CambiarPasswordModal } from "./components/CambiarPasswordModal";

const C = theme;

export function Perfil() {
  const { user } = useAuth();
  const form = usePerfilForm(user ?? { nombre: "", numero: "" });
  const pw = usePasswordChange();
  const foto = useFotoPerfil();

  if (!user) return null;

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
        <PerfilHero user={user} onPhotoChange={foto.handlePhotoChange} onRemovePhoto={foto.handleRemovePhoto} />
        <InformacionPersonalCard user={user} form={form} />
        <SeguridadCard onChangePassword={() => pw.setDialogOpen(true)} />
      </div>

      <Modal open={pw.dialogOpen} onClose={pw.closePasswordDialog} maxWidth={420} title="Cambiar contraseña">
        <CambiarPasswordModal pw={pw} />
      </Modal>
    </>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { PASSWORD_MIN, PASSWORD_MAX } from "@/utils/validation";

/** Modal de cambio de contraseña, con el checklist de requisitos en vivo. */
export function usePasswordChange() {
  const { changePassword } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const passwordLengthOk = passwordData.newPassword.length >= PASSWORD_MIN && passwordData.newPassword.length <= PASSWORD_MAX;
  const passwordsMatch = !!passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword;
  const currentFilled = passwordData.currentPassword.length > 0;
  const passwordDifferent = !!passwordData.newPassword && passwordData.newPassword !== passwordData.currentPassword;
  const canSubmitPassword = passwordLengthOk && passwordsMatch && currentFilled && passwordDifferent;

  const closePasswordDialog = () => {
    setDialogOpen(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

  return {
    dialogOpen, setDialogOpen, submitting,
    showCurrent, setShowCurrent, showNew, setShowNew,
    passwordData, setPasswordData,
    passwordLengthOk, passwordsMatch, currentFilled, passwordDifferent, canSubmitPassword,
    closePasswordDialog, handlePasswordChange,
  };
}

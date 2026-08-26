import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { validarTelefono } from "@/utils/validation";

/** Edición en línea de nombre/teléfono, con validación en tiempo real. */
export function usePerfilForm(user: { nombre: string; numero: string }) {
  const { updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ nombre: user.nombre, numero: user.numero });
  const [profileTouched, setProfileTouched] = useState<{ nombre?: boolean; numero?: boolean }>({});

  const profileErrors = {
    nombre: profileForm.nombre.trim() ? "" : "El nombre no puede estar vacío",
    numero: profileForm.numero.trim() && !validarTelefono(profileForm.numero.trim()) ? "Ingresa un número de teléfono colombiano válido (10 dígitos)" : "",
  };
  const profileInvalido = !!profileErrors.nombre || !!profileErrors.numero;
  const markProfileTouched = (campo: "nombre" | "numero") => setProfileTouched((t) => ({ ...t, [campo]: true }));

  const startEdit = () => {
    setProfileForm({ nombre: user.nombre, numero: user.numero });
    setProfileTouched({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setProfileForm({ nombre: user.nombre, numero: user.numero });
    setProfileTouched({});
  };

  const handleSaveProfile = () => {
    setProfileTouched({ nombre: true, numero: true });
    if (profileInvalido) {
      toast.error(profileErrors.nombre || profileErrors.numero);
      return;
    }
    updateUser({ nombre: profileForm.nombre.trim(), numero: profileForm.numero.trim() });
    toast.success("Perfil actualizado");
    setEditMode(false);
  };

  return {
    editMode, profileForm, setProfileForm, profileTouched, profileErrors, profileInvalido,
    markProfileTouched, startEdit, cancelEdit, handleSaveProfile,
  };
}

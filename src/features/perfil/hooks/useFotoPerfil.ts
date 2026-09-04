import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { procesarFotoCuadrada } from "@/utils/imagen";

/** Sube y recorta la foto de perfil a un cuadrado en el propio navegador antes de guardarla,
 * para no llenar el estado en memoria (y localStorage) con fotos de varios MB. El recorte
 * vive en @/utils/imagen porque los formularios de Usuarios y Conductores hacen lo mismo. */
export function useFotoPerfil() {
  const { updateUser } = useAuth();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      updateUser({ foto: await procesarFotoCuadrada(file) });
      toast.success("Foto de perfil actualizada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo procesar la imagen");
    }
  };

  const handleRemovePhoto = () => {
    updateUser({ foto: "" });
    toast.success("Foto de perfil eliminada");
  };

  return { handlePhotoChange, handleRemovePhoto };
}

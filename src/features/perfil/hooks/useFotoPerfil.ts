import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const MAX_FOTO_SOURCE_MB = 5;
const FOTO_SIZE = 256;

/** Sube y recorta la foto de perfil a un cuadrado en el propio navegador antes de guardarla,
 * para no llenar el estado en memoria (y localStorage) con fotos de varios MB. */
export function useFotoPerfil() {
  const { updateUser } = useAuth();

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

  return { handlePhotoChange, handleRemovePhoto };
}

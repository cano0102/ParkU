import { useId, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '@/styles/theme';
import { procesarFotoCuadrada } from '@/utils/imagen';
import { Avatar } from './Avatar';

const C = theme;

interface AvatarUploaderProps {
  nombre: string;
  foto?: string;
  /** Recibe la foto ya recortada como data URL, o cadena vacía al quitarla. */
  onChange: (foto: string) => void;
  size?: number;
  radius?: number;
  disabled?: boolean;
}

/** Avatar editable: subir una foto (se recorta a un cuadrado en el navegador) o quitarla. */
export function AvatarUploader({ nombre, foto, onChange, size = 64, radius = 18, disabled }: AvatarUploaderProps) {
  const inputId = useId();
  const [procesando, setProcesando] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Se limpia el input para que volver a elegir EL MISMO archivo dispare otro `change`.
    e.target.value = '';
    if (!file) return;

    setProcesando(true);
    try {
      onChange(await procesarFotoCuadrada(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo procesar la imagen');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Avatar
        nombre={nombre}
        foto={foto}
        size={size}
        radius={radius}
        style={{ border: `1px solid ${C.border}`, opacity: procesando ? 0.6 : 1 }}
      />

      <label
        htmlFor={inputId}
        title={foto ? 'Cambiar foto' : 'Subir foto'}
        style={{
          position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%',
          background: '#fff', border: `2px solid ${C.primary}`, color: C.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: '0 2px 6px rgba(15,23,42,.18)',
        }}
      >
        {procesando ? <Loader2 size={12} /> : <Camera size={12} />}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        disabled={disabled || procesando}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label={foto ? `Cambiar foto de ${nombre}` : `Subir foto de ${nombre}`}
      />

      {foto && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Quitar foto"
          aria-label={`Quitar foto de ${nombre}`}
          disabled={disabled}
          style={{
            position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%',
            background: C.danger, border: '2px solid #fff', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer', padding: 0,
          }}
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

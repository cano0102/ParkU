import type { CSSProperties } from 'react';
import { getAvatarGradient, getInitials } from '@/utils/format';

interface AvatarProps {
  nombre: string;
  /** Foto de perfil (data URL). Sin ella se muestran las iniciales sobre el degradado
   *  que ya derivaba del nombre, así que ninguna pantalla queda peor que antes. */
  foto?: string;
  size?: number;
  /** Radio del recorte: 999 para un círculo, un número menor para la esquina redondeada
   *  que usan las tarjetas de Usuarios y Conductores. */
  radius?: number;
  fontSize?: number;
  className?: string;
  style?: CSSProperties;
}

/** Avatar de una persona: su foto si la tiene registrada, o sus iniciales si no. */
export function Avatar({ nombre, foto, size = 40, radius = 12, fontSize, className, style }: AvatarProps) {
  const [c1, c2] = getAvatarGradient(nombre);

  return (
    <div
      className={className}
      title={nombre}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg,${c1},${c2})`,
        color: '#fff',
        fontWeight: 900,
        fontSize: fontSize ?? Math.round(size * 0.36),
        letterSpacing: 0.3,
        ...style,
      }}
    >
      {foto ? (
        <img
          src={foto}
          alt={`Foto de ${nombre}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        getInitials(nombre)
      )}
    </div>
  );
}

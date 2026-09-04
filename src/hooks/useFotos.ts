import { useCallback, useSyncExternalStore } from 'react';
import { fotosDe, guardarFoto, suscribirseAFotos, type AmbitoFoto } from '@/services/core/fotosPerfil';

/**
 * Fotos de perfil del ámbito pedido, suscritas al almacén de services/core/fotosPerfil.ts:
 * cualquier pantalla que guarde una foto (Perfil, el formulario de Usuarios o el de
 * Conductores) re-renderiza a todas las demás que la estén mostrando.
 */
export function useFotos(ambito: AmbitoFoto) {
  const leerAmbito = useCallback(() => fotosDe(ambito), [ambito]);
  const fotos = useSyncExternalStore(suscribirseAFotos, leerAmbito, leerAmbito);

  const fotoDe = useCallback((id: string) => (id ? fotos.get(id) : undefined), [fotos]);
  const guardar = useCallback((id: string, foto: string) => guardarFoto(ambito, id, foto), [ambito]);

  return { fotos, fotoDe, guardarFoto: guardar };
}

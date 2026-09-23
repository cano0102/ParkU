/**
 * Fábrica de hooks de React Query reutilizada por cada dominio. Da caché,
 * estados de carga/error y revalidación automática (invalida la query de
 * lista tras cada mutación) sin que cada hook de dominio tenga que escribirlo
 * a mano.
 *
 * Ubicación provisional: la Fase 3 de la reestructuración reubica estos
 * hooks dentro de cada features/<dominio>/ — hoy viven junto a los servicios
 * porque routes.tsx todavía apunta a pages/, no a features/.
 */
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CrudService } from './crud';

/** Mensaje mostrado cuando la mutación falla y quien la llamó no le pasó su
 *  propio `onError` — así ninguna operación falla en silencio (antes, sin
 *  esto, un create/update/remove que el backend rechazaba no mostraba nada:
 *  ni error, ni el toast de éxito dejaba de dispararse en el sitio que la
 *  invoca). Un `onError` pasado a `.mutate(data, { onError })` en el sitio de
 *  llamada sigue corriendo también, ya que React Query ejecuta ambos. */
function avisarError(error: unknown) {
  toast.error(error instanceof Error ? error.message : 'No se pudo completar la operación.');
}

/**
 * Cuánto tiempo se reutiliza una lista ya descargada antes de volver a pedirla al montar
 * una pantalla. El backend limita a 100 solicitudes por IP cada 15 minutos (cabecera
 * `ratelimit` de la API real), y cada pantalla pide entre 4 y 8 listas: sin distinguir, un
 * uso normal de la app agotaba la cuota en pocos minutos de navegación.
 *
 * - `VIVO` (1 min, el valor por defecto de App.tsx): lo que cambia por la operación —
 *   celdas, entradas/salidas, reservas, incidentes. Otro vigilante puede haberlas movido
 *   desde otro equipo, así que no conviene retenerlas mucho.
 * - `FRECUENTE` (2 min): conductores y vehículos. Se dan de alta en portería; una lista de
 *   dos minutos basta para que un vehículo registrado en otra entrada aparezca en esta.
 * - `MAESTRO` (5 min): roles, usuarios, parqueaderos y catálogos. Cambian pocas veces al
 *   día y casi siempre desde este mismo navegador — y toda mutación propia invalida su lista
 *   igual, así que el retraso solo aplica a cambios hechos por otra persona.
 */
export const STALE_TIME = {
  VIVO: 60_000,
  FRECUENTE: 2 * 60_000,
  MAESTRO: 5 * 60_000,
} as const;

interface QueryHooksOptions {
  /** Ver {@link STALE_TIME}. Si se omite, manda el valor por defecto del QueryClient. */
  staleTime?: number;
  /** Vuelve a pedir la lista cada tantos ms mientras la pestaña esté visible (React Query
   *  pausa el intervalo con la pestaña en segundo plano por defecto, así que no suma contra
   *  la cuota del backend mientras nadie mira la pantalla). Pensado para listas cuyo cambio
   *  lo puede disparar OTRO usuario desde otro equipo y que sí importa ver sin recargar —
   *  p. ej. si un parqueadero se desactiva, un vigilante con la pantalla abierta debe dejar
   *  de poder operarlo sin tener que navegar fuera y volver. Si se omite, no hay polling. */
  refetchInterval?: number;
}

export function createQueryHooks<T extends { id: string }>(queryKey: string, service: CrudService<T>, opciones: QueryHooksOptions = {}) {
  const key = [queryKey] as const;

  // Los errores de esta query los avisa `QueryCache.onError` en App.tsx, no un
  // `onError` acá — React Query 5 ya no lo admite en `useQuery` (solo en `useMutation`).
  // `enabled` (default true) es para el caso de un rol que la API real bloquea de plano
  // (403 documentado) — sin esto, un componente que llama a este hook incondicionalmente
  // antes de decidir qué renderizar (p. ej. DashboardPage.tsx antes de su rama por rol)
  // igual dispara la petición condenada a fallar, y ahora que los errores de lectura sí
  // avisan (ver arriba), eso se traduciría en un toast de error visible para ese rol.
  // `silentError` es para el caso contrario: la lectura SÍ hay que intentarla (no hay otra
  // fuente de datos — p. ej. el listado de incidentes para Comunidad SENA, que la API real
  // bloquea sin ningún endpoint alternativo), pero quien la llama ya construyó su propio
  // manejo de `isError` en pantalla (un mensaje persistente, no un toast) — mostrar TAMBIÉN
  // el toast global sería una segunda copia redundante del mismo aviso.
  function useList(options?: { enabled?: boolean; silentError?: boolean }) {
    return useQuery({
      queryKey: key,
      queryFn: service.getAll,
      enabled: options?.enabled ?? true,
      // Solo si se fijó: pasar `staleTime: undefined` pisa el valor por defecto del
      // QueryClient (React Query mezcla las opciones con spread) y deja la lista siempre
      // caducada — es decir, una petición nueva en cada montaje.
      ...(opciones.staleTime !== undefined ? { staleTime: opciones.staleTime } : {}),
      ...(opciones.refetchInterval !== undefined ? { refetchInterval: opciones.refetchInterval } : {}),
      meta: { silentError: options?.silentError ?? false },
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Omit<T, 'id'>) => service.create(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
      onError: avisarError,
    });
  }

  /*
   * `useUpdate` y `useRemove` son optimistas: la lista en caché cambia en el mismo clic, antes
   * de que el backend responda. Contra la API real, esperar a la respuesta y luego al refetch
   * de la lista eran uno o dos segundos en los que la pantalla no reflejaba nada, y la gente
   * volvía a pulsar (segunda petición sobre un registro ya cambiado o ya borrado). Si el
   * backend rechaza el cambio, se restaura lo que había y se avisa con el toast de siempre;
   * en cualquier caso la lista se refresca al terminar, para recoger lo que el backend haya
   * calculado por su cuenta (campos derivados, estados que mueve un trigger).
   *
   * `useCreate` no lo es: la respuesta del POST suele venir sin los campos que la lista
   * resuelve con joins (nombre del tipo de usuario, del conductor…), así que meterla en la
   * lista tal cual mostraría la fila incompleta un instante. Ahí se espera al refetch.
   */
  async function congelarLista(queryClient: QueryClient): Promise<T[] | undefined> {
    // Un refetch en vuelo que aterrizara después pisaría el cambio optimista con lo viejo.
    await queryClient.cancelQueries({ queryKey: key });
    return queryClient.getQueryData<T[]>(key);
  }

  function restaurarLista(queryClient: QueryClient, previa: T[] | undefined, error: unknown) {
    if (previa) queryClient.setQueryData<T[]>(key, previa);
    avisarError(error);
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Omit<T, 'id'>> }) => service.update(id, data),
      onMutate: async ({ id, data }) => {
        const previa = await congelarLista(queryClient);
        queryClient.setQueryData<T[]>(key, (lista) => lista?.map((item) => (item.id === id ? { ...item, ...data } : item)));
        return { previa };
      },
      onError: (error, _variables, contexto) => restaurarLista(queryClient, contexto?.previa, error),
      onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
    });
  }

  function useRemove() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => service.remove(id),
      onMutate: async (id) => {
        const previa = await congelarLista(queryClient);
        queryClient.setQueryData<T[]>(key, (lista) => lista?.filter((item) => item.id !== id));
        return { previa };
      },
      onError: (error, _id, contexto) => restaurarLista(queryClient, contexto?.previa, error),
      onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
    });
  }

  return { queryKey: key, useList, useCreate, useUpdate, useRemove };
}

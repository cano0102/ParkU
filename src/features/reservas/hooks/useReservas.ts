import * as reservasService from '@/services/api/reservas';
import type { Reserva } from '@/services/api/reservas';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Reserva };

const hooks = createQueryHooks<Reserva>('reservas', reservasService);

export const useReservas = hooks.useList;
export const useCreateReserva = hooks.useCreate;
export const useUpdateReserva = hooks.useUpdate;
export const useRemoveReserva = hooks.useRemove;

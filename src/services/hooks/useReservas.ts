import * as reservasService from '../reservas';
import type { Reserva } from '../reservas';
import { createQueryHooks } from './_factory';

export type { Reserva };

const hooks = createQueryHooks<Reserva>('reservas', reservasService);

export const useReservas = hooks.useList;
export const useCreateReserva = hooks.useCreate;
export const useUpdateReserva = hooks.useUpdate;
export const useRemoveReserva = hooks.useRemove;

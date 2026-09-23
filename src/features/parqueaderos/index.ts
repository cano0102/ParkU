export { default } from './ParqueaderosPage';
export { useParqueaderos, useCreateParqueadero, useUpdateParqueadero, useRemoveParqueadero } from './hooks/useParqueaderos';
export { useCeldas, useCreateCelda, useUpdateCelda, useRemoveCelda, useCambiarDisponibilidadCelda, useRefrescarCeldas } from './hooks/useCeldas';
export { APLICAR_RESTRICCION_HORARIO, HORA_OPERACION_INICIO, HORA_OPERACION_FIN, estaFueraDeHorarioOperacion } from './lib/helpers';
/* El reporte de incidente/novedad no es exclusivo del plano: también se abre desde el
   historial de entradas y salidas. Se comparten el formulario y su hook para que la regla de
   qué exige cada clase de reporte viva en un solo sitio. */
export { useIncidenteReporte, TIPO_OTRO_MAX, type ContextoReporte } from './hooks/useIncidenteReporte';
export { IncidenteModal } from './components/modals/IncidenteModal';

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useIncidentes, ESTADOS_ABIERTOS } from "@/features/incidentes";
import type { Celda } from "@/services/api/celdas";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Ocupante, IncidenteForm } from "../lib/helpers";
import type { PrioridadNovedad } from "@/services/api/incidentes";
import { subirVarias } from "@/services/api/evidencias";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

/**
 * De dónde sale un reporte. La celda del plano es solo uno de los sitios: también se reporta
 * desde el historial de entradas y salidas, y desde las acciones de un parqueadero. Lo que
 * cambia entre ellos es cuánto contexto hay (a veces hay celda y vehículo, a veces solo el
 * parqueadero), no el formulario.
 */
export interface ContextoReporte {
  parqueaderoId: string;
  celdaId?: string;
  vehiculoId?: string;
  /** Lo que se muestra en la cabecera para saber sobre qué se está reportando. */
  etiqueta?: string;
}

const emptyIncidenteForm = (usuarioReportaId = ""): IncidenteForm => ({
  clase: "incidente", usuarioReportaId, descripcion: "",
  // Vacíos a propósito: tipo y prioridad son obligatorios, y un valor por defecto los
  // convertiría en una elección que nadie hizo.
  tipoNovedad: "", tipoOtro: "", prioridad: "", vehiculoId: "", usuarioAsignadoId: "",
});

/**
 * Qué le falta al formulario para poder enviarse.
 *
 * Una NOVEDAD es una observación de la operación: solo necesita el texto. Un INCIDENTE hay
 * que poder clasificarlo y ordenarlo, así que exige tipo y prioridad — y si el tipo es
 * "otro", decir en qué consiste, que si no la precisión se pierde.
 *
 * La prioridad solo se le exige a quien puede elegirla: Comunidad SENA no la define (la pone
 * el personal autorizado al aceptar el reporte, ver novedades.service.js).
 */
export const validarIncidenteForm = (form: IncidenteForm, puedeElegirPrioridad: boolean): string | null => {
  if (!form.descripcion.trim()) return "La descripción es obligatoria.";
  if (form.clase === "novedad") return null;
  if (!form.tipoNovedad) return "Elige el tipo de incidente.";
  if (form.tipoNovedad === "otro" && !form.tipoOtro.trim()) return "Indica de qué tipo de incidente se trata.";
  if (puedeElegirPrioridad && !form.prioridad) return "Elige la prioridad del incidente.";
  return null;
};

/** Formulario de reporte de incidente o novedad, se abra desde donde se abra. */
export function useIncidenteReporte(
  data: Pick<ParqueaderosData, "addIncidente">,
  celdaActiva: Celda | null,
  ocupanteActivo: Ocupante | null,
  setOpenModal: (m: ModalKind) => void,
  /** Para ofrecer solo los vehículos de quien figura como reportante. */
  flota: { conductores: Conductor[]; vehiculos: Vehiculo[] } = { conductores: [], vehiculos: [] },
) {
  const { user } = useAuth();
  const esConductor = user?.rol === ROLES.CONDUCTOR;
  /* El conductor ya no reporta incidentes del parqueadero: solo su propio acceso/estacionamiento
     queda en el flujo de entrada/salida. Cualquier intento de abrir o enviar un reporte desde
     este contexto se bloquea por seguridad, aunque la ruta se haya abierto por URL o por un
     estado previo. */
  const puedeRegistrarNovedades = !esConductor;

  // GET /novedades da 403 para Comunidad SENA en la API real hoy (ver el comentario junto a
  // PERMISOS_POR_ROL[CONDUCTOR].incidentes en services/core/roles.ts) — se deshabilita la
  // query para ese rol; sin esto, cualquier Conductor que entre al plano de Parqueaderos
  // dispararía una lectura condenada a fallar y vería el toast de error global (ver
  // QueryCache.onError en App.tsx) solo por visitar la página, no por algo que hizo. Como
  // efecto secundario, el check de duplicados de abajo queda inerte para ese rol (no hay lista
  // contra la cual comparar) — degradación aceptable frente a un 403 en cada visita.
  const { data: incidentes = [] } = useIncidentes({ enabled: !esConductor });

  const [incidenteForm, setIncidenteFormRaw] = useState<IncidenteForm>(emptyIncidenteForm());
  /* Las fotos van aparte del formulario: la API las cuelga del reporte ya creado
     (`/novedades/:id/evidencias`), así que no pueden viajar en el mismo envío. */
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [incidenteError, setIncidenteError] = useState<string | null>(null);
  const [incidenteTocado, setIncidenteTocado] = useState(false);
  /* Contexto explícito: cuando el reporte se abre desde fuera del plano (entrada/salida, la
     ficha de un parqueadero) no hay "celda activa" de la que deducirlo. */
  const [contexto, setContexto] = useState<ContextoReporte | null>(null);

  // Validación en tiempo real: se recalcula en cada cambio (no solo al enviar), y solo se
  // muestra una vez que el usuario empezó a escribir, para no saludarlo con un error en un
  // modal recién abierto.
  useEffect(() => {
    setIncidenteError(incidenteTocado ? validarIncidenteForm(incidenteForm, !esConductor) : null);
  }, [incidenteForm, incidenteTocado, esConductor]);

  const setIncidenteForm: React.Dispatch<React.SetStateAction<IncidenteForm>> = useCallback((updater) => {
    setIncidenteTocado(true);
    setIncidenteFormRaw(updater);
  }, []);

  /** Abre el formulario sobre un contexto concreto (celda, vehículo o solo el parqueadero). */
  const abrirReporte = useCallback((ctx: ContextoReporte) => {
    if (esConductor) {
      toast.error("No puedes reportar incidentes del parqueadero desde este rol.");
      return;
    }
    setContexto(ctx);
    setIncidenteFormRaw(emptyIncidenteForm(user?.id ?? ""));
    setEvidencias([]);
    setIncidenteError(null);
    setIncidenteTocado(false);
    setOpenModal("incidente");
  }, [esConductor, setOpenModal, user?.id]);

  const closeIncidenteModal = useCallback(() => {
    setOpenModal(null);
    setIncidenteFormRaw(emptyIncidenteForm());
    setEvidencias([]);
    setIncidenteError(null);
    setIncidenteTocado(false);
    setContexto(null);
  }, [setOpenModal]);

  // Ya existe un incidente abierto (pendiente/en proceso) para la celda activa o su ocupante:
  // usado tanto para bloquear el envío como para que CeldaInfoModal refleje el estado en el
  // botón "Reportar incidente" en vez de dejar que se acumulen duplicados.
  const incidenteAbiertoExisteParaCeldaActiva = useMemo(() => {
    if (!celdaActiva) return false;
    return incidentes.some(
      (i) =>
        ESTADOS_ABIERTOS.includes(i.estado) &&
        (i.celdaId === celdaActiva.id || (!!ocupanteActivo && i.vehiculoId === ocupanteActivo.vehiculo.id))
    );
  }, [incidentes, celdaActiva, ocupanteActivo]);

  /* Sobre qué se reporta: el contexto explícito manda, y si no lo hay se deduce de la celda
     abierta en el plano (el camino de siempre). */
  const objetivo = useMemo<ContextoReporte | null>(() => contexto ?? (celdaActiva
    ? {
      parqueaderoId: celdaActiva.parqueaderoId,
      celdaId: celdaActiva.id,
      vehiculoId: ocupanteActivo?.vehiculo.id,
      etiqueta: `Celda ${celdaActiva.numero}${ocupanteActivo ? ` · ${ocupanteActivo.vehiculo.placa}` : ""}`,
    }
    : null), [contexto, celdaActiva, ocupanteActivo]);

  const registrarIncidente = useCallback(async () => {
    if (esConductor) {
      toast.error("No puedes reportar incidentes del parqueadero desde este rol.");
      return;
    }
    if (!objetivo) return;
    setIncidenteTocado(true);
    const error = validarIncidenteForm(incidenteForm, !esConductor);
    if (error) {
      setIncidenteError(error);
      return;
    }

    const esNovedad = incidenteForm.clase === "novedad";
    // Un duplicado solo tiene sentido entre incidentes: dos observaciones sobre el mismo sitio
    // son perfectamente normales.
    if (!esNovedad && objetivo.celdaId && incidenteAbiertoExisteParaCeldaActiva) {
      toast.error("Ya existe un incidente abierto para esta celda o vehículo.");
      return;
    }

    try {
      const creado = await data.addIncidente({
        clase: incidenteForm.clase,
        descripcion: incidenteForm.descripcion.trim(),
        parqueaderoId: objetivo.parqueaderoId,
        // Una novedad no ocurre "sobre" una celda ni un vehículo: no los arrastra.
        celdaId: esNovedad ? "" : (objetivo.celdaId ?? ""),
        // El del contexto manda (se reporta sobre un vehículo concreto); si no hay, el que se
        // haya elegido a mano entre los de quien reporta.
        vehiculoId: esNovedad ? "" : (objetivo.vehiculoId || incidenteForm.vehiculoId),
        // Comunidad SENA no elige prioridad ni encargado: los pone el personal autorizado al
        // aceptar el reporte, y mandarlos vacíos hace que ni siquiera viajen.
        usuarioAsignadoId: esConductor ? "" : incidenteForm.usuarioAsignadoId,
        usuarioReportaId: incidenteForm.usuarioReportaId,
        tipoNovedad: esNovedad ? "otro" : (incidenteForm.tipoNovedad || "otro"),
        tipoOtro: incidenteForm.tipoNovedad === "otro" ? incidenteForm.tipoOtro.trim() : "",
        /* Vacía cuando quien reporta no puede elegirla: `toApiPayload` no envía los campos
           vacíos, así que la prioridad queda sin definir hasta que alguien acepte el reporte
           (que es justo la regla del backend). El tipo pide un valor concreto, pero la
           creación admite este hueco a propósito. */
        prioridad: (esConductor ? "" : (incidenteForm.prioridad || "media")) as PrioridadNovedad,
        estado: "pendiente",
        justificacionCierre: "",
      });
      /* Las fotos se suben con el reporte ya creado, que es cuando existe el id al que
         colgarlas. Si alguna falla, el reporte NO se pierde: ya quedó guardado y se avisa de
         lo que no subió, en vez de dar todo por fallido. Una novedad no lleva fotos. */
      let avisoEvidencias = "";
      if (!esNovedad && evidencias.length && creado?.id) {
        const { subidas, errores } = await subirVarias(creado.id, evidencias);
        if (errores.length) {
          avisoEvidencias = ` Se subieron ${subidas} de ${evidencias.length} imágenes.`;
          toast.error(errores[0]);
        }
      }

      closeIncidenteModal();
      toast.success(
        (esNovedad ? "Novedad registrada correctamente." : "Incidente registrado correctamente.")
        + avisoEvidencias,
      );
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error registering incidente:", error);
    }
  }, [objetivo, incidenteForm, evidencias, esConductor, incidenteAbiertoExisteParaCeldaActiva, data, closeIncidenteModal]);

  /* Los vehículos de quien reporta. Un conductor se identifica por su cuenta de usuario, así
     que se llega a sus vehículos por ahí: ofrecer la flota entera obligaba a buscar una placa
     entre cientos cuando casi siempre es uno de los suyos. */
  const vehiculosDelReportante = useMemo(() => {
    const conductor = flota.conductores.find((c) => c.usuarioId === incidenteForm.usuarioReportaId);
    if (!conductor) return [];
    return flota.vehiculos.filter((v) => v.conductorId === conductor.id);
  }, [flota.conductores, flota.vehiculos, incidenteForm.usuarioReportaId]);

  return {
    incidenteForm, setIncidenteForm, incidenteError,
    evidencias, setEvidencias,
    vehiculosDelReportante,
    closeIncidenteModal, registrarIncidente, abrirReporte,
    incidenteAbiertoExisteParaCeldaActiva,
    objetivo, puedeRegistrarNovedades,
  };
}

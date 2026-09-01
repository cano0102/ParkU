import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { useIncidentes, ESTADOS_ABIERTOS } from "@/features/incidentes";
import type { Celda } from "@/services/api/celdas";
import type { Ocupante, IncidenteForm } from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const emptyIncidenteForm = (): IncidenteForm => ({ descripcion: "" });

const validarIncidenteForm = (form: IncidenteForm): string | null =>
  form.descripcion.trim() ? null : "La descripción del incidente es obligatoria.";

/** Formulario rápido de reporte de incidente sobre la celda activa (desde el plano de Parqueaderos). */
export function useIncidenteReporte(
  data: Pick<ParqueaderosData, "addIncidente">,
  celdaActiva: Celda | null,
  ocupanteActivo: Ocupante | null,
  setOpenModal: (m: ModalKind) => void
) {
  const { user } = useAuth();
  // GET /novedades da 403 para Comunidad SENA en la API real hoy (ver el comentario junto a
  // PERMISOS_POR_ROL[CONDUCTOR].incidentes en services/core/roles.ts) — se deshabilita la
  // query para ese rol; sin esto, cualquier Conductor que entre al plano de Parqueaderos
  // dispararía una lectura condenada a fallar y vería el toast de error global (ver
  // QueryCache.onError en App.tsx) solo por visitar la página, no por algo que hizo. Como
  // efecto secundario, el check de duplicados de abajo queda inerte para ese rol (no hay lista
  // contra la cual comparar) — degradación aceptable frente a un 403 en cada visita.
  const { data: incidentes = [] } = useIncidentes({ enabled: user?.rol !== ROLES.CONDUCTOR });

  const [incidenteForm, setIncidenteFormRaw] = useState<IncidenteForm>(emptyIncidenteForm());
  const [incidenteError, setIncidenteError] = useState<string | null>(null);
  const [incidenteTocado, setIncidenteTocado] = useState(false);

  // Validación en tiempo real: se recalcula en cada cambio (no solo al enviar), y solo se
  // muestra una vez que el usuario empezó a escribir, para no saludarlo con un error en un
  // modal recién abierto.
  useEffect(() => {
    setIncidenteError(incidenteTocado ? validarIncidenteForm(incidenteForm) : null);
  }, [incidenteForm, incidenteTocado]);

  const setIncidenteForm: React.Dispatch<React.SetStateAction<IncidenteForm>> = useCallback((updater) => {
    setIncidenteTocado(true);
    setIncidenteFormRaw(updater);
  }, []);

  const closeIncidenteModal = useCallback(() => {
    setOpenModal(null);
    setIncidenteFormRaw(emptyIncidenteForm());
    setIncidenteError(null);
    setIncidenteTocado(false);
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

  const registrarIncidente = useCallback(async () => {
    if (!celdaActiva || !ocupanteActivo) return;
    setIncidenteTocado(true);
    const error = validarIncidenteForm(incidenteForm);
    if (error) {
      setIncidenteError(error);
      return;
    }

    if (incidenteAbiertoExisteParaCeldaActiva) {
      toast.error("Ya existe un incidente abierto para esta celda o vehículo.");
      return;
    }

    try {
      await data.addIncidente({
        descripcion: incidenteForm.descripcion.trim(),
        parqueaderoId: celdaActiva.parqueaderoId,
        celdaId: celdaActiva.id,
        vehiculoId: ocupanteActivo.vehiculo.id,
        usuarioAsignadoId: "",
        tipoNovedad: "otro",
        prioridad: "media",
        estado: "pendiente",
        justificacionCierre: "",
      });
      setIncidenteFormRaw(emptyIncidenteForm());
      setIncidenteError(null);
      setIncidenteTocado(false);
      setOpenModal(null);
      toast.success("Incidente registrado correctamente.");
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error registering incidente:", error);
    }
  }, [celdaActiva, ocupanteActivo, incidenteForm, incidenteAbiertoExisteParaCeldaActiva, data, setOpenModal]);

  return {
    incidenteForm, setIncidenteForm, incidenteError,
    closeIncidenteModal, registrarIncidente,
    incidenteAbiertoExisteParaCeldaActiva,
  };
}

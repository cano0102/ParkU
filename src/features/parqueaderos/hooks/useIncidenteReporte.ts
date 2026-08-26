import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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

  const registrarIncidente = useCallback(async () => {
    if (!celdaActiva || !ocupanteActivo) return;
    setIncidenteTocado(true);
    const error = validarIncidenteForm(incidenteForm);
    if (error) {
      setIncidenteError(error);
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
  }, [celdaActiva, ocupanteActivo, incidenteForm, data, setOpenModal]);

  return {
    incidenteForm, setIncidenteForm, incidenteError,
    closeIncidenteModal, registrarIncidente,
  };
}

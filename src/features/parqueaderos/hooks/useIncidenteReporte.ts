import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Ocupante, IncidenteForm } from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const emptyIncidenteForm = (): IncidenteForm => ({ descripcion: "" });

/** Formulario rápido de reporte de incidente sobre la celda activa (desde el plano de Parqueaderos). */
export function useIncidenteReporte(
  data: Pick<ParqueaderosData, "addIncidente">,
  celdaActiva: Celda | null,
  ocupanteActivo: Ocupante | null,
  setOpenModal: (m: ModalKind) => void
) {
  const [incidenteForm, setIncidenteForm] = useState<IncidenteForm>(emptyIncidenteForm());
  const [incidenteError, setIncidenteError] = useState<string | null>(null);

  const closeIncidenteModal = useCallback(() => {
    setOpenModal(null);
    setIncidenteError(null);
  }, [setOpenModal]);

  const registrarIncidente = useCallback(() => {
    if (!celdaActiva || !ocupanteActivo) return;
    const { descripcion } = incidenteForm;
    if (!descripcion.trim()) {
      setIncidenteError("La descripción del incidente es obligatoria.");
      return;
    }

    data.addIncidente({
      descripcion: descripcion.trim(),
      parqueaderoId: celdaActiva.parqueaderoId,
      celdaId: celdaActiva.id,
      vehiculoId: ocupanteActivo.vehiculo.id,
      usuarioAsignadoId: "",
      tipoNovedad: "otro",
      prioridad: "media",
      estado: "pendiente",
      justificacionCierre: "",
    });
    setIncidenteForm(emptyIncidenteForm());
    setIncidenteError(null);
    setOpenModal(null);
    toast.success("Incidente registrado correctamente.");
  }, [celdaActiva, ocupanteActivo, incidenteForm, data, setOpenModal]);

  return {
    incidenteForm, setIncidenteForm, incidenteError, setIncidenteError,
    closeIncidenteModal, registrarIncidente,
  };
}

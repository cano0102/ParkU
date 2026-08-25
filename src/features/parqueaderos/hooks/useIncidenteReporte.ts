import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Ocupante, IncidenteForm } from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const MAX_EVIDENCIA_MB = 5;
const emptyIncidenteForm = (): IncidenteForm => ({ descripcion: "", asignadoA: "", notasResolucion: "", evidencia: "" });

/** Formulario de reporte de incidente sobre la celda activa (con evidencia fotográfica). */
export function useIncidenteReporte(
  data: Pick<ParqueaderosData, "addIncidente">,
  celdaActiva: Celda | null,
  ocupanteActivo: Ocupante | null,
  setOpenModal: (m: ModalKind) => void
) {
  const [incidenteForm, setIncidenteForm] = useState<IncidenteForm>(emptyIncidenteForm());
  const [incidenteError, setIncidenteError] = useState<string | null>(null);

  const resetIncidenteEvidencia = useCallback(() => {
    setIncidenteForm((prev) => ({ ...prev, evidencia: "" }));
  }, []);

  const handleIncidenteFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > MAX_EVIDENCIA_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_EVIDENCIA_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setIncidenteForm((prev) => ({ ...prev, evidencia: (ev.target?.result as string) || "" }));
    };
    reader.onerror = () => toast.error("No se pudo cargar la imagen");
    reader.readAsDataURL(file);
  }, []);

  const closeIncidenteModal = useCallback(() => {
    setOpenModal(null);
    setIncidenteError(null);
    resetIncidenteEvidencia();
  }, [setOpenModal, resetIncidenteEvidencia]);

  const registrarIncidente = useCallback(() => {
    if (!celdaActiva || !ocupanteActivo) return;
    const { descripcion, asignadoA, notasResolucion, evidencia } = incidenteForm;
    if (!descripcion.trim()) {
      setIncidenteError("La descripción del incidente es obligatoria.");
      return;
    }

    data.addIncidente({
      descripcion: descripcion.trim(),
      parqueaderoId: celdaActiva.parqueaderoId,
      celdaId: celdaActiva.id,
      celdaNumero: celdaActiva.numero,
      vehiculo: ocupanteActivo.vehiculo.placa,
      conductor: ocupanteActivo.conductor?.nombre || "",
      asignadoA: asignadoA.trim() || undefined,
      notasResolucion: notasResolucion.trim() || undefined,
      evidencia: evidencia || undefined,
      fecha: new Date().toISOString(),
      estado: "pendiente" as const,
    });
    setIncidenteForm(emptyIncidenteForm());
    setIncidenteError(null);
    setOpenModal(null);
    toast.success("Incidente registrado correctamente.");
  }, [celdaActiva, ocupanteActivo, incidenteForm, data, setOpenModal]);

  return {
    incidenteForm, setIncidenteForm, incidenteError, setIncidenteError,
    handleIncidenteFileChange, resetIncidenteEvidencia, closeIncidenteModal, registrarIncidente,
  };
}

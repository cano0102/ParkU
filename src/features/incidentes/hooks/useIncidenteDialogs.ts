import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Incidente, TipoNovedad, PrioridadNovedad } from "@/services/api/incidentes";
import { ESTADOS_ABIERTOS } from "../lib/constants";
import type { IncidentesData } from "./useIncidentesData";

const emptyFormData = () => ({
  descripcion: "",
  parqueaderoId: "",
  celdaId: "",
  vehiculoId: "",
  usuarioAsignadoId: "",
  tipoNovedad: "otro" as TipoNovedad,
  prioridad: "media" as PrioridadNovedad,
  estado: "pendiente" as Incidente["estado"],
  justificacionCierre: "",
});

/** Los tres modales de Incidentes: crear/editar (con su validación en vivo), ver detalle y confirmar eliminación. */
export function useIncidenteDialogs(data: IncidentesData) {
  const { celdas, incidentes, addIncidente, updateIncidente, deleteIncidente, ocupanteDeCelda } = data;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Incidente | null>(null);

  const [formData, setFormData] = useState(emptyFormData());
  const [formTouched, setFormTouched] = useState<{ descripcion?: boolean; parqueaderoId?: boolean }>({});

  // Validación en tiempo real: solo descripción y parqueadero son obligatorios.
  const formErrors = {
    descripcion: formData.descripcion.trim() ? "" : "La descripción es obligatoria",
    parqueaderoId: formData.parqueaderoId ? "" : "Selecciona un parqueadero",
  };
  const formInvalido = !!formErrors.descripcion || !!formErrors.parqueaderoId;
  const markTouched = (campo: "descripcion" | "parqueaderoId") =>
    setFormTouched((t) => ({ ...t, [campo]: true }));

  const celdasDelParqueadero = useMemo(
    () => celdas.filter((c) => c.parqueaderoId === formData.parqueaderoId),
    [celdas, formData.parqueaderoId]
  );
  const ocupanteSeleccionado = ocupanteDeCelda(formData.celdaId);

  const resetForm = () => {
    setFormData(emptyFormData());
    setFormTouched({});
    setIsEditing(false);
    setSelectedIncidente(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setFormData({
      descripcion: incidente.descripcion,
      parqueaderoId: incidente.parqueaderoId,
      celdaId: incidente.celdaId || "",
      vehiculoId: incidente.vehiculoId || "",
      usuarioAsignadoId: incidente.usuarioAsignadoId || "",
      tipoNovedad: incidente.tipoNovedad,
      prioridad: incidente.prioridad,
      estado: incidente.estado,
      justificacionCierre: incidente.justificacionCierre || "",
    });
    setIsEditing(true);
    setViewOpen(false);
    setDialogOpen(true);
  };

  const openView = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setViewOpen(true);
  };

  const closeForm = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleParqueaderoChange = (parqueaderoId: string) => {
    setFormData({ ...formData, parqueaderoId, celdaId: "" });
  };

  const handleCeldaChange = (celdaId: string) => {
    const ocupante = ocupanteDeCelda(celdaId);
    setFormData({
      ...formData,
      celdaId,
      vehiculoId: ocupante ? ocupante.vehiculo.id : formData.vehiculoId,
    });
  };

  // Evita reportar dos veces la misma novedad: si ya hay un incidente abierto (pendiente/en
  // proceso) para la misma celda o el mismo vehículo, se bloquea la creación en vez de dejar
  // que se acumulen duplicados. Solo aplica al crear — al editar uno existente no tiene sentido
  // compararlo contra sí mismo.
  const incidenteAbiertoDuplicado = () =>
    incidentes.find(
      (i) =>
        i.id !== selectedIncidente?.id &&
        ESTADOS_ABIERTOS.includes(i.estado) &&
        ((formData.celdaId && i.celdaId === formData.celdaId) ||
          (formData.vehiculoId && i.vehiculoId === formData.vehiculoId))
    );

  const handleSave = async () => {
    setFormTouched({ descripcion: true, parqueaderoId: true });
    if (formInvalido) {
      toast.error("Descripción y Parqueadero son obligatorios");
      return;
    }

    if (!isEditing && incidenteAbiertoDuplicado()) {
      toast.error("Ya existe un incidente abierto para esta celda o vehículo.");
      return;
    }

    try {
      if (isEditing && selectedIncidente) {
        await updateIncidente(selectedIncidente.id, { ...formData });
        toast.success("Incidente actualizado correctamente");
      } else {
        await addIncidente({ ...formData });
        toast.success("Incidente registrado correctamente");
      }
      closeForm();
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error saving incidente:", error);
    }
  };

  const handleDelete = (incidente: Incidente) => setConfirmDelete(incidente);

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await deleteIncidente(confirmDelete.id);
      toast.success("Incidente eliminado");
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting incidente:", error);
    }
  };

  return {
    dialogOpen,
    viewOpen,
    setViewOpen,
    selectedIncidente,
    isEditing,
    confirmDelete,
    setConfirmDelete,
    formData,
    setFormData,
    formTouched,
    formErrors,
    formInvalido,
    markTouched,
    celdasDelParqueadero,
    ocupanteSeleccionado,
    openCreate,
    openEdit,
    openView,
    closeForm,
    handleParqueaderoChange,
    handleCeldaChange,
    handleSave,
    handleDelete,
    confirmDeleteAction,
  };
}

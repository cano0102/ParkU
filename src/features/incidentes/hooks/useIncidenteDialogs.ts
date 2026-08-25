import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Incidente, TipoNovedad, PrioridadNovedad } from "@/services/api/incidentes";
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
  const { celdas, addIncidente, updateIncidente, deleteIncidente, ocupanteDeCelda } = data;

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

  const handleSave = () => {
    setFormTouched({ descripcion: true, parqueaderoId: true });
    if (formInvalido) {
      toast.error("Descripción y Parqueadero son obligatorios");
      return;
    }

    if (isEditing && selectedIncidente) {
      updateIncidente(selectedIncidente.id, { ...formData });
      toast.success("Incidente actualizado correctamente");
    } else {
      addIncidente({ ...formData });
      toast.success("Incidente registrado correctamente");
    }
    closeForm();
  };

  const handleDelete = (incidente: Incidente) => setConfirmDelete(incidente);

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    deleteIncidente(confirmDelete.id);
    toast.success("Incidente eliminado");
    setConfirmDelete(null);
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

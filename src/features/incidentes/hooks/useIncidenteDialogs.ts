import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Incidente, TipoNovedad, PrioridadNovedad, ClaseNovedad } from "@/services/api/incidentes";
import { ESTADOS_ABIERTOS, type EstadoIncidente } from "../lib/constants";
import { recomiendaEncargado, requiereMotivo } from "../lib/transiciones";
import type { IncidentesData } from "./useIncidentesData";
import { listar as listarEvidencias, subirVarias, type Evidencia } from "@/services/api/evidencias";
import { validarTextoLargo, validarTextoCorto, DESCRIPCION_MIN, DESCRIPCION_MAX } from "@/utils/validation";
import { TIPO_OTRO_MAX } from "@/features/parqueaderos";

const emptyFormData = () => ({
  clase: "incidente" as ClaseNovedad,
  tipoOtro: "",
  usuarioReportaId: "",
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

/** Los modales de Incidentes: crear/editar, ver detalle y confirmar desactivación. */
export function useIncidenteDialogs(
  data: IncidentesData,
  options?: {
    celdaIdsPermitidas?: Set<string>;
    /** false para quien solo reporta (Comunidad SENA): la prioridad no la elige quien reporta,
     *  sino quien recibe el reporte al aceptarlo (ver IncidenteVehiculoAsignadoFields) — exigirla
     *  aquí igual dejaba el formulario permanentemente inválido, con el campo que la pediría
     *  oculto para ese rol. Por defecto true (Admin/Vigilante). */
    puedeClasificar?: boolean;
    /** true para Comunidad SENA (ConductorIncidentes): el parqueadero va oculto y se deriva del
     *  vehículo elegido, en vez de que la persona elija primero el parqueadero y luego la celda. */
    modoConductor?: boolean;
  }
) {
  const puedeClasificar = options?.puedeClasificar ?? true;
  const {
    celdas, incidentes, addIncidente, updateIncidente, ocupanteDeCelda,
    cambiarEstado, usuariosReportantes,
  } = data;

  /* Cambiar el estado de un incidente no siempre es un clic: avanzar exige un encargado que
     responda por él, y descartarlo exige decir por qué (lo lee quien lo reportó). Cuando
     falta ese dato se pide antes de aplicar el cambio, en vez de dejar que el backend lo
     rechace con un error que no explica qué hacer. */
  const [cambioEstado, setCambioEstado] = useState<{ incidente: Incidente; destino: EstadoIncidente } | null>(null);

  const solicitarCambioEstado = (id: string, destino: EstadoIncidente) => {
    const incidente = incidentes.find((i) => i.id === id);
    if (!incidente || incidente.estado === destino) return;

    const faltaEncargado = recomiendaEncargado(destino) && !incidente.usuarioAsignadoId;
    if (faltaEncargado || requiereMotivo(destino)) {
      setCambioEstado({ incidente, destino });
      return;
    }
    cambiarEstado(id, destino);
  };

  const confirmarCambioEstado = async (datos: { usuarioAsignadoId?: string; justificacionCierre?: string }) => {
    if (!cambioEstado) return;
    await cambiarEstado(cambioEstado.incidente.id, cambioEstado.destino, datos);
    setCambioEstado(null);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Incidente | null>(null);

  const [formData, setFormData] = useState(emptyFormData());
  /* Las fotos van aparte: la API las cuelga del reporte ya creado, así que no viajan en el
     mismo envío que el resto del formulario. */
  const [evidencias, setEvidencias] = useState<File[]>([]);
  /* Las que ya están guardadas (al editar): cuentan para el máximo de tres y se muestran. */
  const [evidenciasExistentes, setEvidenciasExistentes] = useState<Evidencia[]>([]);
  const [formTouched, setFormTouched] = useState<{ descripcion?: boolean; parqueaderoId?: boolean }>({});

  /* Validación en tiempo real. Un incidente hay que poder clasificarlo y ordenarlo, así que
     exige tipo y prioridad —y el detalle cuando el tipo es "otro"—; una novedad es una
     observación de la operación y no tiene nada de eso que dar. Mismas reglas que el reporte
     rápido (useIncidenteReporte) y que el backend. */
  const esNovedad = formData.clase === "novedad";
  const modoConductor = options?.modoConductor ?? false;
  const formErrors = {
    descripcion: validarTextoLargo(formData.descripcion, "La descripción", { min: DESCRIPCION_MIN, max: DESCRIPCION_MAX }) ?? "",
    // El backend admite vehiculo_id en null (novedades.models.js): no todo incidente ocurre
    // sobre un vehículo concreto (una queja general, o uno reportado antes de que existiera
    // este campo). Exigirlo aquí bloqueaba guardar —y por tanto subir evidencias— en esos
    // casos, aunque la API los aceptara sin problema.
    tipoNovedad: esNovedad || formData.tipoNovedad ? "" : "Elige el tipo de incidente",
    tipoOtro: !esNovedad && formData.tipoNovedad === "otro"
      ? (formData.tipoOtro.trim()
          ? (validarTextoCorto(formData.tipoOtro, "El tipo de incidente", TIPO_OTRO_MAX, true) ?? "")
          : "Indica de qué tipo de incidente se trata")
      : "",
    prioridad: esNovedad || !puedeClasificar || formData.prioridad ? "" : "Elige la prioridad",
    // Elegir una celda ya fija el parqueadero (ver handleCeldaChange/handleVehiculoChange):
    // exigirlo aparte era redundante y bloqueaba casos válidos, así que no se valida.
    parqueaderoId: "",
  };
  const formInvalido = Object.values(formErrors).some(Boolean);
  const markTouched = (campo: "descripcion" | "parqueaderoId") =>
    setFormTouched((t) => ({ ...t, [campo]: true }));

  const celdasDelParqueadero = useMemo(
    () => celdas.filter((c) => modoConductor
      ? (!options?.celdaIdsPermitidas || options.celdaIdsPermitidas.has(c.id))
      : c.parqueaderoId === formData.parqueaderoId),
    [celdas, formData.parqueaderoId, modoConductor, options?.celdaIdsPermitidas]
  );
  const ocupanteSeleccionado = ocupanteDeCelda(formData.celdaId);

  const resetForm = () => {
    setFormData(emptyFormData());
    setEvidencias([]);
    setEvidenciasExistentes([]);
    setFormTouched({});
    setIsEditing(false);
    setSelectedIncidente(null);
  };

  const openCreate = () => {
    resetForm();
    // A nombre de quien lo está escribiendo: es el caso normal, y sin autor no hay a quién
    // volver a preguntarle.
    setFormData((f) => ({ ...f, usuarioReportaId: usuariosReportantes?.[0]?.id ?? "" }));
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
      clase: incidente.clase,
      tipoOtro: incidente.tipoOtro || "",
      usuarioReportaId: incidente.usuarioReportaId || "",
      tipoNovedad: incidente.tipoNovedad,
      prioridad: incidente.prioridad,
      estado: incidente.estado,
      justificacionCierre: incidente.justificacionCierre || "",
    });
    setIsEditing(true);
    setViewOpen(false);
    setDialogOpen(true);
    // Las fotos ya guardadas se cargan aparte: el listado de incidentes no las trae.
    listarEvidencias(incidente.id).then(setEvidenciasExistentes).catch(() => setEvidenciasExistentes([]));
  };

  const openView = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setEvidenciasExistentes([]);
    setViewOpen(true);
    listarEvidencias(incidente.id).then(setEvidenciasExistentes).catch(() => setEvidenciasExistentes([]));
  };

  const closeForm = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleCeldaChange = (celdaId: string) => {
    const ocupante = ocupanteDeCelda(celdaId);
    const celda = celdas.find((item) => item.id === celdaId);
    setFormData({
      ...formData,
      parqueaderoId: celda?.parqueaderoId ?? "",
      celdaId,
      vehiculoId: ocupante ? ocupante.vehiculo.id : "",
    });
  };

  const handleParqueaderoChange = (parqueaderoId: string) => {
    setFormData({ ...formData, parqueaderoId, celdaId: "" });
  };

  const handleVehiculoChange = (vehiculoId: string) => {
    if (!modoConductor) {
      setFormData({ ...formData, vehiculoId });
      return;
    }
    const celda = celdas.find((item) => ocupanteDeCelda(item.id)?.vehiculo.id === vehiculoId);
    setFormData({
      ...formData,
      vehiculoId,
      celdaId: celda?.id ?? "",
      parqueaderoId: celda?.parqueaderoId ?? "",
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
      toast.error("Revisa los campos obligatorios del formulario");
      return;
    }

    if (
      options?.celdaIdsPermitidas &&
      (!formData.celdaId || !options.celdaIdsPermitidas.has(formData.celdaId))
    ) {
      toast.error("Solo puedes reportar incidentes desde una celda donde esté uno de tus vehículos.");
      return;
    }

    if (!isEditing && incidenteAbiertoDuplicado()) {
      toast.error("Ya existe un incidente abierto para esta celda o vehículo.");
      return;
    }

    try {
      const datosParaGuardar = modoConductor
        ? { ...formData, prioridad: "", usuarioAsignadoId: "" }
        : formData;
      /* Las fotos se suben con el reporte ya existente, que es cuando hay un id al que
         colgarlas. Si alguna falla, lo demás ya quedó guardado: se avisa de lo que no subió
         en vez de dar todo por perdido. Una novedad no lleva fotos. */
      const subirFotos = async (id: string) => {
        if (esNovedad || !evidencias.length) return "";
        const { subidas, errores } = await subirVarias(id, evidencias);
        if (!errores.length) return "";
        toast.error(errores[0]);
        return ` Se subieron ${subidas} de ${evidencias.length} imágenes.`;
      };

      if (isEditing && selectedIncidente) {
        await updateIncidente(selectedIncidente.id, { ...datosParaGuardar } as Partial<Incidente>);
        const aviso = await subirFotos(selectedIncidente.id);
        toast.success("Incidente actualizado correctamente" + aviso);
      } else {
        // Quien no puede clasificar (Comunidad SENA) nunca vio el selector de prioridad ni el
        // de encargado — `formData` igual trae el valor por defecto (media, sin asignar) del
        // formulario compartido con Admin/Vigilante. Se limpian antes de enviar para que el
        // reporte quede de verdad sin definir, como promete el aviso del formulario ("quien lo
        // reciba define la prioridad"), en vez de llegar ya con una prioridad que nadie eligió.
        const payload = puedeClasificar
          ? formData
          : { ...formData, prioridad: "" as PrioridadNovedad, usuarioAsignadoId: "" };
        const creado = await addIncidente({ ...payload });
        const aviso = creado?.id ? await subirFotos(creado.id) : "";
        toast.success("Incidente registrado correctamente" + aviso);
      }
      closeForm();
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error saving incidente:", error);
    }
  };

  const handleDelete = async (incidente: Incidente) => {
    if (incidente.activo === false) {
      try {
        await updateIncidente(incidente.id, { activo: true });
        toast.success("Incidente activado correctamente");
      } catch (error) {
        console.error("Error activating incidente:", error);
      }
      return;
    }
    setConfirmDelete(incidente);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await updateIncidente(confirmDelete.id, { activo: false });
      toast.success("Incidente desactivado correctamente");
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
    handleVehiculoChange,
    handleCeldaChange,
    handleSave,
    handleDelete,
    confirmDeleteAction,
    evidencias,
    setEvidencias,
    evidenciasExistentes,
    cambioEstado,
    solicitarCambioEstado,
    confirmarCambioEstado,
    cerrarCambioEstado: () => setCambioEstado(null),
  };
}

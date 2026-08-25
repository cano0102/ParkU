import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Parqueadero } from "@/services/api/parqueaderos";
import {
  type FormParqueadero, normalizarTexto, validarFormParqueadero, NOMBRE_PQ_MAX,
} from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const emptyPqForm = (): FormParqueadero => ({
  nombre: "", ubicacion: "", acceso: "regional", tipo: "general",
  capacidadMaxima: 10, horaInicio: "06:00", horaFin: "22:00", zona: "", piso: "", descripcion: "",
});

/** Formulario de crear/editar parqueadero, con su validación en vivo.
 * Las celdas ya no se generan/redimensionan automáticamente al guardar
 * (la API real no lo hace) — se administran aparte desde la pantalla de Celdas. */
export function useParqueaderoForm(data: ParqueaderosData, openModal: ModalKind, setOpenModal: (m: ModalKind) => void) {
  const { parqueaderos, addParqueadero, updateParqueadero } = data;

  const [pqEditId, setPqEditId] = useState<string | null>(null);
  const [pqForm, setPqFormRaw] = useState<FormParqueadero>(emptyPqForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [pqTocado, setPqTocado] = useState(false);

  // Validación en tiempo real: se recalcula en cada cambio (no solo al enviar), y solo se
  // muestra una vez que el usuario empezó a escribir (pqTocado), para no saludarlo con
  // errores en un formulario recién abierto.
  useEffect(() => {
    if (openModal !== "create" && openModal !== "edit") return;
    if (!pqTocado) { setFormError(null); return; }
    setFormError(validarFormParqueadero(pqForm, parqueaderos, openModal === "edit" ? pqEditId : null));
  }, [pqForm, pqTocado, openModal, parqueaderos, pqEditId]);

  const setPqForm: React.Dispatch<React.SetStateAction<FormParqueadero>> = (updater) => {
    setPqTocado(true);
    setPqFormRaw(updater);
  };

  const openCreate = () => {
    setPqFormRaw(emptyPqForm());
    setFormError(null);
    setPqTocado(false);
    setOpenModal("create");
  };

  const openEdit = (pq: Parqueadero) => {
    setPqEditId(pq.id);
    setPqFormRaw({
      nombre: pq.nombre, ubicacion: pq.ubicacion, acceso: pq.acceso, tipo: pq.tipo,
      capacidadMaxima: pq.capacidadMaxima, horaInicio: pq.horaInicio, horaFin: pq.horaFin,
      zona: pq.zona, piso: pq.piso, descripcion: pq.descripcion,
    });
    setFormError(null);
    setPqTocado(false);
    setOpenModal("edit");
  };

  const handleCreate = () => {
    setPqTocado(true);
    const error = validarFormParqueadero(pqForm, parqueaderos, null);
    if (error) return setFormError(error);
    const nombre = normalizarTexto(pqForm.nombre, NOMBRE_PQ_MAX);
    addParqueadero({
      nombre, ubicacion: pqForm.ubicacion.trim(), acceso: pqForm.acceso, tipo: pqForm.tipo,
      capacidadMaxima: pqForm.capacidadMaxima, horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
      zona: pqForm.zona.trim(), piso: pqForm.piso.trim(), descripcion: pqForm.descripcion.trim(),
      estado: "activo",
    });
    toast.success(`Parqueadero "${nombre}" creado.`);
    setOpenModal(null);
  };

  const handleEdit = () => {
    setPqTocado(true);
    if (!pqEditId) return;
    const actual = parqueaderos.find((p) => p.id === pqEditId);
    if (!actual) return;
    const error = validarFormParqueadero(pqForm, parqueaderos, pqEditId);
    if (error) return setFormError(error);
    const nombre = normalizarTexto(pqForm.nombre, NOMBRE_PQ_MAX);

    updateParqueadero(pqEditId, {
      nombre, ubicacion: pqForm.ubicacion.trim(), acceso: pqForm.acceso, tipo: pqForm.tipo,
      capacidadMaxima: pqForm.capacidadMaxima, horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
      zona: pqForm.zona.trim(), piso: pqForm.piso.trim(), descripcion: pqForm.descripcion.trim(),
    });
    toast.success("Parqueadero actualizado.");
    setOpenModal(null);
    setPqEditId(null);
  };

  const handleToggleEstadoParqueadero = (p: Parqueadero) => {
    const nuevoEstado = p.estado === "activo" ? "inactivo" : "activo";
    updateParqueadero(p.id, { estado: nuevoEstado });
    toast.success(nuevoEstado === "activo" ? "Parqueadero activado." : "Parqueadero desactivado.");
  };

  return {
    pqForm, setPqForm, formError, pqEditId,
    openCreate, openEdit, handleCreate, handleEdit, handleToggleEstadoParqueadero,
  };
}

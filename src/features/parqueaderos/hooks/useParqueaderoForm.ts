import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Celda } from "@/services/api/celdas";
import {
  type FormParqueadero, normalizarTexto, validarFormParqueadero, NOMBRE_PQ_MAX,
} from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const emptyPqForm = (): FormParqueadero => ({
  nombre: "", bloque: "A", tipo: "general", direccion: "", horaInicio: "06:00", horaFin: "22:00",
  celdasCarros: 8, celdasMotos: 2, celdasMovilidadReducida: 1, descripcion: "",
});

/** Formulario de crear/editar parqueadero, con su validación en vivo y el redimensionado de celdas al editar. */
export function useParqueaderoForm(data: ParqueaderosData, openModal: ModalKind, setOpenModal: (m: ModalKind) => void) {
  const { parqueaderos, celdas, addParqueadero, updateParqueadero, addCelda, deleteCelda } = data;

  const [pqEditId, setPqEditId] = useState<string | null>(null);
  const [pqForm, setPqFormRaw] = useState<FormParqueadero>(emptyPqForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [pqTocado, setPqTocado] = useState(false);

  const capacidadForm = pqForm.celdasCarros + pqForm.celdasMotos + pqForm.celdasMovilidadReducida;

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
      nombre: pq.nombre, bloque: pq.bloque, tipo: pq.tipo, direccion: pq.direccion,
      horaInicio: pq.horaInicio, horaFin: pq.horaFin,
      celdasCarros: pq.celdasCarros, celdasMotos: pq.celdasMotos, celdasMovilidadReducida: pq.celdasMovilidadReducida,
      descripcion: pq.descripcion,
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
    const bloque = pqForm.bloque.trim();
    addParqueadero({
      nombre, bloque, tipo: pqForm.tipo, direccion: pqForm.direccion.trim(), descripcion: pqForm.descripcion.trim(),
      horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
      celdasCarros: pqForm.celdasCarros, celdasMotos: pqForm.celdasMotos, celdasMovilidadReducida: pqForm.celdasMovilidadReducida,
      capacidad: capacidadForm, estado: "activo",
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
    const bloque = pqForm.bloque.trim();

    const celdasPq = celdas.filter((c) => c.parqueaderoId === pqEditId);
    const tiposMap: { tipo: Celda["tipo"]; prefix: string; anterior: number; nuevo: number }[] = [
      { tipo: "carro", prefix: "C", anterior: actual.celdasCarros, nuevo: pqForm.celdasCarros },
      { tipo: "moto", prefix: "M", anterior: actual.celdasMotos, nuevo: pqForm.celdasMotos },
      { tipo: "movilidad reducida", prefix: "MR", anterior: actual.celdasMovilidadReducida, nuevo: pqForm.celdasMovilidadReducida },
    ];

    for (const t of tiposMap) {
      if (t.nuevo < t.anterior) {
        const delTipo = celdasPq.filter((c) => c.tipo === t.tipo);
        const sobrantes = delTipo.slice(t.nuevo);
        if (sobrantes.some((c) => c.estado === "no_disponible" || c.estado === "reservada")) {
          return setFormError(`No se puede reducir ${t.tipo}: hay celdas ocupadas o reservadas en el rango a eliminar.`);
        }
      }
    }

    for (const t of tiposMap) {
      const delTipo = celdasPq.filter((c) => c.tipo === t.tipo);
      if (t.nuevo < t.anterior) {
        delTipo.slice(t.nuevo).forEach((c) => deleteCelda(c.id));
      } else if (t.nuevo > t.anterior) {
        for (let i = t.anterior; i < t.nuevo; i++) {
          addCelda({
            parqueaderoId: pqEditId,
            numero: `${t.prefix}-${String(i + 1).padStart(3, "0")}`,
            tipo: t.tipo, estado: "disponible", ocupada: false,
            nombre: `${nombre}-${t.prefix}${i + 1}`,
          });
        }
      }
    }

    updateParqueadero(pqEditId, {
      nombre, bloque, tipo: pqForm.tipo, direccion: pqForm.direccion.trim(), descripcion: pqForm.descripcion.trim(),
      horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
      celdasCarros: pqForm.celdasCarros, celdasMotos: pqForm.celdasMotos, celdasMovilidadReducida: pqForm.celdasMovilidadReducida,
      capacidad: capacidadForm,
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

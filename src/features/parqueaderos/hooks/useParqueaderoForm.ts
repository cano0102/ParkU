import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Parqueadero } from "@/services/api/parqueaderos";
import {
  type FormParqueadero, normalizarTexto, validarFormParqueadero, evaluarEliminacionParqueadero, NOMBRE_PQ_MAX,
} from "../lib/helpers";
import { agruparPorCategoria, reconciliarTodasLasCategorias } from "../lib/celdasReconciliacion";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const emptyPqForm = (): FormParqueadero => ({
  nombre: "", ubicacion: "", acceso: "regional", tipo: "general",
  capacidadMaxima: 10, horaInicio: "06:00", horaFin: "22:00", zona: "", piso: "", descripcion: "",
  estado: "activo", celdasCarros: 0, celdasMotos: 0, celdasMovilidadReducida: 0,
});

/** Formulario de crear/editar parqueadero, con su validación en vivo.
 * Las celdas ya no se generan/redimensionan automáticamente al guardar
 * (la API real no lo hace) — se administran aparte desde la pantalla de Celdas. */
export function useParqueaderoForm(data: ParqueaderosData, openModal: ModalKind, setOpenModal: (m: ModalKind) => void) {
  const {
    parqueaderos, addParqueadero, updateParqueadero, deleteParqueadero, generarCeldasEnLote,
    celdas, addCelda, cambiarDisponibilidadCelda, controlesSalida, reservas, incidentes,
  } = data;

  const [pqEditId, setPqEditId] = useState<string | null>(null);
  const [pqForm, setPqFormRaw] = useState<FormParqueadero>(emptyPqForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [pqTocado, setPqTocado] = useState(false);
  const [pqAEliminar, setPqAEliminar] = useState<Parqueadero | null>(null);
  const [pqADesactivar, setPqADesactivar] = useState<Parqueadero | null>(null);

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
    // Precarga la cantidad ACTIVA real de cada categoría (celdas con estado != "inactiva"),
    // no un valor fijo en 0 — así el admin ve de dónde parte antes de subir o bajar la cifra
    // (ver handleEdit, que reconcilia contra estos mismos números al guardar).
    const celdasDelPq = celdas.filter((c) => c.parqueaderoId === pq.id);
    const grupos = agruparPorCategoria(celdasDelPq);
    const activas = (lista: typeof celdasDelPq) => lista.filter((c) => c.estado !== "inactiva").length;
    setPqFormRaw({
      nombre: pq.nombre, ubicacion: pq.ubicacion, acceso: pq.acceso, tipo: pq.tipo,
      capacidadMaxima: pq.capacidadMaxima, horaInicio: pq.horaInicio, horaFin: pq.horaFin,
      zona: pq.zona, piso: pq.piso, descripcion: pq.descripcion, estado: pq.estado,
      celdasCarros: activas(grupos.carros), celdasMotos: activas(grupos.motos), celdasMovilidadReducida: activas(grupos.movilidadReducida),
    });
    setFormError(null);
    setPqTocado(false);
    setOpenModal("edit");
  };

  const handleCreate = async () => {
    setPqTocado(true);
    const error = validarFormParqueadero(pqForm, parqueaderos, null);
    if (error) return setFormError(error);
    const nombre = normalizarTexto(pqForm.nombre, NOMBRE_PQ_MAX);
    try {
      const creado = await addParqueadero({
        nombre, ubicacion: pqForm.ubicacion.trim(), acceso: pqForm.acceso, tipo: pqForm.tipo,
        capacidadMaxima: pqForm.capacidadMaxima, horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
        zona: pqForm.zona.trim(), piso: pqForm.piso.trim(), descripcion: pqForm.descripcion.trim(),
        estado: pqForm.estado,
      });
      // Segunda llamada encadenada (mismo patrón que conductor+vehículo en
      // useConductorForm.ts): el parqueadero ya existe, ahora se generan sus
      // celdas iniciales de una sola vez en el backend.
      try {
        await generarCeldasEnLote(creado.id, {
          carros: pqForm.celdasCarros, motos: pqForm.celdasMotos, movilidadReducida: pqForm.celdasMovilidadReducida,
        });
      } catch (celdaError) {
        console.error("Error generating celdas for new parqueadero:", celdaError);
        toast.error(`Parqueadero "${nombre}" creado, pero no se pudieron generar sus celdas. Créalas desde la pantalla de Celdas.`);
        setOpenModal(null);
        return;
      }
      toast.success(`Parqueadero "${nombre}" creado con sus celdas.`);
      setOpenModal(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error creating parqueadero:", error);
    }
  };

  const handleEdit = async () => {
    setPqTocado(true);
    if (!pqEditId) return;
    const actual = parqueaderos.find((p) => p.id === pqEditId);
    if (!actual) return;
    const error = validarFormParqueadero(pqForm, parqueaderos, pqEditId);
    if (error) return setFormError(error);
    const nombre = normalizarTexto(pqForm.nombre, NOMBRE_PQ_MAX);

    try {
      // Acceso/categoría/zona/piso/horarios ya no se muestran ni se editan desde este
      // formulario — se dejan fuera del payload a propósito para no reenviar al backend un
      // valor que el usuario no tocó (y que en este formulario ni siquiera puede ver).
      await updateParqueadero(pqEditId, {
        nombre, ubicacion: pqForm.ubicacion.trim(),
        capacidadMaxima: pqForm.capacidadMaxima, descripcion: pqForm.descripcion.trim(),
      });

      // Segunda llamada encadenada (mismo patrón que handleCreate): el parqueadero ya se
      // actualizó, ahora se reconcilia la cantidad de celdas de cada categoría contra lo que
      // haya en el formulario. Si aumenta, reactiva celdas inactivas primero y solo crea las
      // que falten (nunca duplica). Si disminuye, SOLO desactiva celdas realmente libres —
      // una celda ocupada o con una reserva activa nunca se toca, y si no hay suficientes
      // libres para llegar al número pedido, esa categoría puntual se deja sin cambiar en vez
      // de reducirla a medias.
      const celdasDelPq = celdas.filter((c) => c.parqueaderoId === pqEditId);
      const resultado = await reconciliarTodasLasCategorias(
        celdasDelPq,
        { carros: pqForm.celdasCarros, motos: pqForm.celdasMotos, movilidadReducida: pqForm.celdasMovilidadReducida },
        { parqueaderoId: pqEditId, addCelda, cambiarDisponibilidadCelda }
      );

      if (!resultado.ok) {
        toast.error(`Parqueadero "${nombre}" actualizado, pero: ${resultado.bloqueos.join(" ")}`);
      } else {
        const cambios: string[] = [];
        if (resultado.totalCreadas) cambios.push(`${resultado.totalCreadas} celda(s) nueva(s)`);
        if (resultado.totalReactivadas) cambios.push(`${resultado.totalReactivadas} reactivada(s)`);
        if (resultado.totalDesactivadas) cambios.push(`${resultado.totalDesactivadas} desactivada(s)`);
        toast.success(cambios.length ? `Parqueadero actualizado (${cambios.join(", ")}).` : "Parqueadero actualizado.");
      }
      setOpenModal(null);
      setPqEditId(null);
    } catch (error) {
      console.error("Error updating parqueadero:", error);
    }
  };

  // Reactivar (inactivo → activo) no tiene por qué pedir confirmación — es una acción segura,
  // reversible con el mismo switch. Desactivar sí: puede sacar de operación un parqueadero con
  // vehículos estacionados en este momento, así que pide confirmación explícita primero (ver
  // confirmDesactivarParqueadero) en vez de aplicarse directo al pulsar el switch.
  const handleToggleEstadoParqueadero = async (p: Parqueadero) => {
    if (p.estado === "activo") {
      setPqADesactivar(p);
      return;
    }
    try {
      await updateParqueadero(p.id, { estado: "activo" });
      toast.success("Parqueadero activado.");
    } catch (error) {
      console.error("Error activating parqueadero:", error);
    }
  };

  const confirmDesactivarParqueadero = async () => {
    if (!pqADesactivar) return;
    try {
      // Al invalidar la query de parqueaderos (ver useParqueaderos.ts), esto también refresca
      // la lista/el detalle abierto y, vía useParqueaderosData, las celdas — no hace falta
      // ninguna actualización manual aparte para "actualizar lista/detalle/celdas".
      await updateParqueadero(pqADesactivar.id, { estado: "inactivo" });
      toast.success("Parqueadero desactivado.");
      setPqADesactivar(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts) — si el backend rechaza la desactivación por alguna
      // razón, ese mensaje real se ve ahí en vez de uno genérico inventado aquí.
      console.error("Error deactivating parqueadero:", error);
    }
  };

  // Pide confirmación para eliminar SOLO si el parqueadero de verdad no tiene nada que
  // perder (sin celdas/ingresos/reservas/incidentes) — si tiene, ni se abre el diálogo de
  // confirmación: se avisa de una vez con el motivo específico y se sugiere desactivar.
  const handleDeleteRequest = (p: Parqueadero) => {
    const evaluacion = evaluarEliminacionParqueadero(p.id, celdas, controlesSalida, reservas, incidentes);
    if (!evaluacion.eliminable) {
      toast.error(evaluacion.motivo);
      return;
    }
    setPqAEliminar(p);
  };

  const confirmDeleteParqueadero = async () => {
    if (!pqAEliminar) return;
    try {
      await deleteParqueadero(pqAEliminar.id);
      toast.success(`Parqueadero "${pqAEliminar.nombre}" eliminado.`);
      setPqAEliminar(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error deleting parqueadero:", error);
    }
  };

  return {
    pqForm, setPqForm, formError, pqEditId,
    openCreate, openEdit, handleCreate, handleEdit, handleToggleEstadoParqueadero,
    pqAEliminar, setPqAEliminar, handleDeleteRequest, confirmDeleteParqueadero,
    pqADesactivar, setPqADesactivar, confirmDesactivarParqueadero,
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import {
  emptyForm, validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca, validarNumeroDocumento, validarTelefono, EMAIL_REGEX,
  type FormState, type FormErrors,
} from "../lib/helpers";
import type { ConductoresData } from "./useConductoresData";

/** Formulario de crear/editar conductor (con su vehículo), con validación en vivo. */
export function useConductorForm(
  data: ConductoresData,
  /** Se dispara solo tras CREAR un conductor nuevo (no al editar uno existente), con el
   *  conductor y el vehículo recién creados — lo usa el asistente de "Estacionar Vehículo"
   *  para seleccionar ambos de inmediato, sin que el operador tenga que volver a buscarlos. */
  onCreated?: (conductor: Conductor, vehiculo: Vehiculo) => void
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [editingVehiculoId, setEditingVehiculoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [usuarioSearch, setUsuarioSearch] = useState("");

  // Usuarios que ya tienen un conductor vinculado (para evitar duplicados), excluyendo el que se está editando
  const usuariosConConductorIds = useMemo(() => {
    const ids = new Set(data.conductores.map((c) => c.usuarioId).filter(Boolean));
    if (editingConductor?.usuarioId) ids.delete(editingConductor.usuarioId);
    return ids;
  }, [data.conductores, editingConductor]);

  const usuariosFiltrados = useMemo(() => {
    const q = usuarioSearch.toLowerCase().trim();
    // Campo vacío = sin sugerencias (no listar toda la cuenta de usuarios sin que se pida).
    if (!q) return [];
    return data.usuarios.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
    );
  }, [data.usuarios, usuarioSearch]);

  const openCreate = useCallback(() => {
    setEditingConductor(null);
    setEditingVehiculoId(null);
    setFormData(emptyForm());
    setFormErrors({});
    setTouched({});
    setUsuarioSearch("");
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (conductor: Conductor, vehiculo?: Vehiculo) => {
      setEditingConductor(conductor);
      const v = vehiculo ?? data.vehiculos.find((veh) => veh.conductorId === conductor.id);
      setEditingVehiculoId(v?.id ?? null);
      setFormData({
        usuarioId: conductor.usuarioId,
        nombre: conductor.nombre,
        tipoDocumento: conductor.tipoDocumento,
        numeroDocumento: conductor.numeroDocumento,
        correo: conductor.correo,
        numeroTelefonico: conductor.numeroTelefonico,
        tipoUsuarioId: conductor.tipoUsuarioId,
        regionalFormacion: conductor.regionalFormacion,
        centroFormacion: conductor.centroFormacion,
        programaFormacion: conductor.programaFormacion,
        movilidadReducida: conductor.movilidadReducida,
        tipoDiscapacidad: conductor.tipoDiscapacidad,
        estado: conductor.estado,
        placa: v?.placa || "",
        tipoVehiculo: v?.tipo || "carro",
        marca: v?.marca || "",
        color: v?.color || "",
        descripcionVehiculo: v?.descripcion || "",
      });
      setFormErrors({});
      setTouched({});
      setUsuarioSearch("");
      setDialogOpen(true);
    },
    [data.vehiculos]
  );

  // Placas ya registradas en otros vehículos (para evitar duplicados), excluyendo el vehículo puntual en edición
  const placasOcupadas = useMemo(() => {
    return new Set(
      data.vehiculos
        .filter((v) => v.id !== editingVehiculoId)
        .map((v) => v.placa.toUpperCase().trim())
    );
  }, [data.vehiculos, editingVehiculoId]);

  // Documentos ya registrados en otros conductores (para evitar duplicados), excluyendo el
  // conductor en edición. Se combina tipo + número (no solo el número) porque dos conductores
  // distintos sí pueden compartir el mismo número si su tipo de documento es diferente (p. ej.
  // una CC y una CE con el mismo número no son la misma persona).
  const documentosOcupados = useMemo(() => {
    return new Set(
      data.conductores
        .filter((c) => c.id !== editingConductor?.id)
        .map((c) => `${c.tipoDocumento}|${c.numeroDocumento.trim()}`)
    );
  }, [data.conductores, editingConductor]);

  // Validación en vivo del formulario
  const validate = useCallback((form: FormState): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    }
    const numeroDocumento = form.numeroDocumento.trim();
    if (!numeroDocumento) {
      errors.numeroDocumento = "El número de documento es obligatorio";
    } else if (!validarNumeroDocumento(numeroDocumento)) {
      errors.numeroDocumento = "El número de documento debe tener entre 6 y 10 dígitos.";
    } else if (documentosOcupados.has(`${form.tipoDocumento}|${numeroDocumento}`)) {
      errors.numeroDocumento = "Ya existe un conductor registrado con este tipo y número de documento.";
    }
    // Correo y teléfono son OBLIGATORIOS al registrar un conductor: son los dos datos con los
    // que el backend resuelve (o crea) el Usuario asociado — sin correo no hay cuenta con la
    // cual vincularlo, y sin teléfono no hay forma de contactar al dueño del vehículo.
    const correo = form.correo.trim();
    if (!correo) {
      errors.correo = "El correo es obligatorio";
    } else if (!EMAIL_REGEX.test(correo)) {
      errors.correo = "Ingresa un correo electrónico válido";
    }
    const numeroTelefonico = form.numeroTelefonico.trim();
    if (!numeroTelefonico) {
      errors.numeroTelefonico = "El teléfono es obligatorio";
    } else if (!validarTelefono(numeroTelefonico)) {
      errors.numeroTelefonico = "Ingresa un número de teléfono colombiano válido (10 dígitos)";
    }
    if (!form.tipoUsuarioId) {
      errors.tipoUsuarioId = "Selecciona un tipo de usuario";
    }
    // Centro de formación es opcional (el backend ya lo trata como tal —
    // no se pide de nuevo un dato que la BD no exige).
    const placa = form.placa.trim().toUpperCase();
    if (!placa) {
      errors.placa = "La placa es obligatoria";
    } else if (!validarPlacaColombiana(placa)) {
      errors.placa = "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
    } else if ((form.tipoVehiculo === "carro" || form.tipoVehiculo === "moto") && !validarPlacaPorTipo(placa, form.tipoVehiculo)) {
      const tipoDetectado = tipoVehiculoDesdePlaca(placa);
      errors.placa = `Seleccionaste "${form.tipoVehiculo}", pero la placa tiene formato de ${tipoDetectado}.`;
    } else if (placasOcupadas.has(placa)) {
      errors.placa = "Esta placa ya está registrada en otro vehículo";
    }
    if (!form.marca.trim()) {
      errors.marca = "La marca es obligatoria";
    }
    if (!form.color.trim()) {
      errors.color = "El color es obligatorio";
    }
    return errors;
  }, [placasOcupadas, documentosOcupados]);

  useEffect(() => {
    setFormErrors(validate(formData));
  }, [formData, validate]);

  const isValid = useMemo(() => Object.keys(formErrors).length === 0, [formErrors]);

  const usuarioSeleccionado = useMemo(
    () => data.usuarios.find((u) => u.id === formData.usuarioId),
    [data.usuarios, formData.usuarioId]
  );

  const markTouched = useCallback((field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const handleSave = useCallback(async () => {
    const errors = validate(formData);
    setFormErrors(errors);
    setTouched({ nombre: true, numeroDocumento: true, correo: true, numeroTelefonico: true, tipoUsuarioId: true, placa: true, marca: true, color: true });

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError || "Revisa los campos del formulario");
      return;
    }

    const conductorData = {
      usuarioId: formData.usuarioId,
      nombre: formData.nombre.trim(),
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento.trim(),
      correo: formData.correo.trim(),
      direccion: editingConductor?.direccion || "",
      numeroTelefonico: formData.numeroTelefonico.trim(),
      tipoUsuarioId: formData.tipoUsuarioId,
      tipoUsuarioNombre: "",
      regionalFormacion: formData.regionalFormacion.trim(),
      centroFormacion: formData.centroFormacion.trim(),
      programaFormacion: formData.programaFormacion.trim(),
      vigencia: editingConductor?.vigencia || "",
      movilidadReducida: formData.movilidadReducida,
      tipoDiscapacidad: formData.tipoDiscapacidad.trim(),
      estado: formData.estado,
    };

    try {
      if (editingConductor) {
        await data.updateConductor(editingConductor.id, conductorData);

        const vehiculoData = {
          conductorId: editingConductor.id,
          conductorNombre: conductorData.nombre,
          placa: formData.placa.toUpperCase().trim(),
          tipo: formData.tipoVehiculo,
          marca: formData.marca.trim(),
          linea: "",
          modelo: null,
          color: formData.color.trim(),
          descripcion: formData.descripcionVehiculo.trim(),
          estado: "activo" as const,
        };

        const existingVehiculo = editingVehiculoId
          ? data.vehiculos.find((v) => v.id === editingVehiculoId)
          : undefined;
        if (existingVehiculo) {
          await data.updateVehiculo(existingVehiculo.id, vehiculoData);
        } else {
          await data.addVehiculo(vehiculoData);
        }
        toast.success("Conductor actualizado correctamente");
      } else {
        const created = await data.addConductor(conductorData);
        if (created?.id) {
          const vehiculoCreado = await data.addVehiculo({
            conductorId: created.id,
            conductorNombre: created.nombre,
            placa: formData.placa.toUpperCase().trim(),
            tipo: formData.tipoVehiculo,
            marca: formData.marca.trim(),
            linea: "",
            modelo: null,
            color: formData.color.trim(),
            descripcion: formData.descripcionVehiculo.trim(),
            estado: "activo",
          });
          onCreated?.(created, vehiculoCreado);
        }
        toast.success("Conductor creado correctamente");
      }
      setDialogOpen(false);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts); aquí solo evitamos cerrar el diálogo o
      // mostrar un falso "éxito" cuando alguno de los pasos en realidad falló.
      console.error("Error saving conductor:", error);
    }
  }, [formData, editingConductor, editingVehiculoId, data, validate, onCreated]);

  return {
    dialogOpen, setDialogOpen, editingConductor, editingVehiculoId,
    formData, setFormData, formErrors, touched, markTouched,
    usuarioSearch, setUsuarioSearch, usuariosFiltrados, usuariosConConductorIds, usuarioSeleccionado,
    isValid, isEdit: !!editingConductor,
    openCreate, openEdit, handleSave,
  };
}

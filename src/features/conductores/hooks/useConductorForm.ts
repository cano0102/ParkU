import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { comprobarDisponibilidad } from "@/services/api/usuarios";
import { validarPassword } from "@/utils/validation";
import {
  emptyForm, validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca, validarNumeroDocumento, validarTelefono, EMAIL_REGEX,
  TIPO_VISITANTE, type FormState, type FormErrors,
} from "../lib/helpers";
import { useTiposUsuario } from "./useTiposUsuario";
import type { ConductoresData } from "./useConductoresData";

/** Pausa sin escribir antes de preguntarle al backend si un dato ya está ocupado. */
const ESPERA_VALIDACION_MS = 500;

/** Referencia ESTABLE para cuando el catálogo todavía no cargó. Con `= []` en el destructuring
 *  se crea un array nuevo en cada render, y como `validate` depende de él, el efecto que
 *  recalcula los errores se dispararía en bucle (mismo problema documentado en
 *  useConductoresData.ts). */
const SIN_TIPOS: { id: string; nombre: string }[] = [];

/** Formulario de crear/editar conductor (con su vehículo), con validación en vivo. */
export function useConductorForm(
  data: ConductoresData,
  /** Se dispara solo tras CREAR un conductor nuevo (no al editar uno existente), con el
   *  conductor y el vehículo recién creados — lo usa el asistente de "Estacionar Vehículo"
   *  para seleccionar ambos de inmediato, sin que el operador tenga que volver a buscarlos. */
  onCreated?: (conductor: Conductor, vehiculo: Vehiculo) => void,
  /** `conVehiculo`: el formulario incluye la sección del vehículo. Solo lo enciende el
   *  asistente de Estacionar Vehículo, donde crear conductor y vehículo de un tirón evita
   *  partir en dos el trámite que se hace con la persona delante de la barrera. En el módulo
   *  de Conductores está apagado: allí el vehículo se gestiona desde la tarjeta. */
  { conVehiculo = false }: { conVehiculo?: boolean } = {}
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [editingVehiculoId, setEditingVehiculoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [usuarioSearch, setUsuarioSearch] = useState("");
  // Choques que solo el backend conoce (documento o correo ya registrados en otra ficha).
  // Van aparte de `formErrors` porque exigen una consulta de red, no se pueden derivar del
  // formulario -- mismo patrón que el registro público.
  const [erroresRemotos, setErroresRemotos] = useState<{ numeroDocumento?: string; correo?: string }>({});
  const consultaId = useRef(0);
  const { data: tiposUsuario = SIN_TIPOS } = useTiposUsuario();

  /** El visitante es el único que puede quedarse sin cuenta de acceso. */
  const esVisitante = useMemo(() => {
    const tipo = tiposUsuario.find((t) => t.id === formData.tipoUsuarioId);
    return (tipo?.nombre || "").trim().toLowerCase() === TIPO_VISITANTE;
  }, [tiposUsuario, formData.tipoUsuarioId]);

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
        crearCuenta: false,
        password: "",
        confirmPassword: "",
        nombre: conductor.nombre,
        tipoDocumento: conductor.tipoDocumento,
        numeroDocumento: conductor.numeroDocumento,
        correo: conductor.correo,
        numeroTelefonico: conductor.numeroTelefonico,
        tipoUsuarioId: conductor.tipoUsuarioId,
        movilidadReducida: conductor.movilidadReducida,
        tipoDiscapacidad: conductor.tipoDiscapacidad,
        estado: conductor.estado,
        // La foto no viene de la API (no hay columna): se precarga de este navegador para que
        // guardar cualquier otro cambio no la borre. Ver useConductoresData.fotoDeConductor.
        foto: data.fotoDeConductor(conductor) ?? "",
        placa: v?.placa || "",
        tipoVehiculo: v?.tipo || "carro",
        marca: v?.marca || "",
        linea: v?.linea || "",
        modelo: v?.modelo ? String(v.modelo) : "",
        color: v?.color || "",
        descripcionVehiculo: v?.descripcion || "",
      });
      setFormErrors({});
      setTouched({});
      setUsuarioSearch("");
      setDialogOpen(true);
    },
    [data]
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
    // El tipo de usuario va primero porque de él depende todo lo demás: es lo que decide si
    // esta persona puede quedarse sin cuenta de acceso.
    if (!form.tipoUsuarioId) {
      errors.tipoUsuarioId = "Selecciona un tipo de usuario";
    }

    const tipo = tiposUsuario.find((t) => t.id === form.tipoUsuarioId);
    const visitante = (tipo?.nombre || "").trim().toLowerCase() === TIPO_VISITANTE;

    // Todo conductor necesita cuenta, salvo el visitante: sin ella no puede consultar sus
    // reservas ni sus vehículos. O se selecciona una que exista, o se crea aquí mismo.
    // Solo se exige al CREAR: hay fichas antiguas sin cuenta, y bloquearles el guardado
    // impediría justamente vincularles una. Reactivarlas sin cuenta sí lo impide el backend.
    if (!editingConductor && !form.usuarioId && !form.crearCuenta && !visitante) {
      errors.usuarioId = 'Selecciona la cuenta de esta persona, o marca "no tengo usuario" para crearla';
    }

    // El correo solo hace falta cuando hay que CREAR la cuenta: si se vincula una existente
    // lo aporta ella, y un visitante puede no tener.
    const correo = form.correo.trim();
    if (form.crearCuenta && !correo) {
      errors.correo = "El correo es obligatorio para crear la cuenta";
    } else if (correo && !EMAIL_REGEX.test(correo)) {
      errors.correo = "Ingresa un correo electrónico válido";
    }

    // El teléfono es opcional, como en el resto del sistema. Si se escribe, sí tiene que ser
    // válido: un número a medias es peor que ninguno.
    const numeroTelefonico = form.numeroTelefonico.trim();
    if (numeroTelefonico && !validarTelefono(numeroTelefonico)) {
      errors.numeroTelefonico = "Ingresa un número de teléfono colombiano válido (10 dígitos)";
    }

    if (form.crearCuenta) {
      const errorPassword = validarPassword(form.password);
      if (errorPassword) errors.password = errorPassword;
      if (!form.confirmPassword) {
        errors.confirmPassword = "Confirma la contraseña";
      } else if (form.confirmPassword !== form.password) {
        errors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    // La sección del vehículo solo existe en el asistente de Estacionar Vehículo; en el
    // módulo de Conductores se gestiona desde la tarjeta, así que aquí no se valida.
    if (!conVehiculo) return errors;

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
    const modelo = form.modelo.trim();
    if (modelo) {
      const anio = Number(modelo);
      const anioMaximo = new Date().getFullYear() + 1;
      if (!Number.isInteger(anio) || anio < 1950 || anio > anioMaximo) {
        errors.modelo = `El modelo es el año del vehículo: entre 1950 y ${anioMaximo}`;
      }
    }
    return errors;
  }, [placasOcupadas, documentosOcupados, tiposUsuario, conVehiculo, editingConductor]);

  useEffect(() => {
    setFormErrors(validate(formData));
  }, [formData, validate]);

  // Validación en vivo contra el backend: documento y correo se comprueban tras una pausa
  // sin escribir, mirando cuentas Y conductores. Antes solo se avisaba al guardar, con el
  // formulario entero relleno.
  useEffect(() => {
    if (!dialogOpen) return undefined;
    const documento = formData.numeroDocumento.trim();
    const correo = formData.correo.trim();
    const hayQueMirarDocumento = validarNumeroDocumento(documento);
    const hayQueMirarCorreo = !!correo && EMAIL_REGEX.test(correo);
    if (!hayQueMirarDocumento && !hayQueMirarCorreo) {
      setErroresRemotos({});
      return undefined;
    }

    const temporizador = setTimeout(async () => {
      const id = ++consultaId.current;
      try {
        const res = await comprobarDisponibilidad({
          tipoDocumento: hayQueMirarDocumento ? formData.tipoDocumento : undefined,
          numeroDocumento: hayQueMirarDocumento ? documento : undefined,
          correo: hayQueMirarCorreo ? correo : undefined,
          // Editando, la propia cuenta de este conductor no cuenta como ocupada.
          excluirUsuarioId: formData.usuarioId || undefined,
        });
        if (id !== consultaId.current) return; // respuesta vieja
        setErroresRemotos({
          numeroDocumento: res.documento?.disponible === false ? res.documento.motivo ?? undefined : undefined,
          correo: res.correo?.disponible === false ? res.correo.motivo ?? undefined : undefined,
        });
      } catch {
        // Si la comprobación falla (sin red, sin permiso), no se bloquea el formulario: el
        // backend lo rechazará al guardar y ahí sí se ve el motivo.
      }
    }, ESPERA_VALIDACION_MS);

    return () => clearTimeout(temporizador);
  }, [dialogOpen, formData.tipoDocumento, formData.numeroDocumento, formData.correo, formData.usuarioId]);

  /** Los del formulario más los que solo el backend conoce. */
  const erroresVisibles = useMemo<FormErrors>(
    () => ({
      ...formErrors,
      ...(erroresRemotos.numeroDocumento && !formErrors.numeroDocumento
        ? { numeroDocumento: erroresRemotos.numeroDocumento } : {}),
      ...(erroresRemotos.correo && !formErrors.correo ? { correo: erroresRemotos.correo } : {}),
    }),
    [formErrors, erroresRemotos],
  );

  const isValid = useMemo(() => Object.keys(erroresVisibles).length === 0, [erroresVisibles]);

  const usuarioSeleccionado = useMemo(
    () => data.usuarios.find((u) => u.id === formData.usuarioId),
    [data.usuarios, formData.usuarioId]
  );

  const markTouched = useCallback((field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const handleSave = useCallback(async () => {
    const errors = { ...validate(formData), ...erroresRemotos };
    setFormErrors(errors);
    setTouched({
      nombre: true, numeroDocumento: true, correo: true, numeroTelefonico: true,
      tipoUsuarioId: true, usuarioId: true, password: true, confirmPassword: true,
      placa: true, marca: true, color: true,
    });

    if (Object.values(errors).some(Boolean)) {
      const firstError = Object.values(errors).find(Boolean);
      toast.error(firstError || "Revisa los campos del formulario");
      return;
    }

    // Qué hacer con la cuenta. Al editar no se toca este modo: la vinculación se cambia con
    // usuarioId a secas, y crear una cuenta desde la edición no está contemplado.
    const modoCuenta = editingConductor
      ? undefined
      : formData.crearCuenta
        ? ("crear" as const)
        : formData.usuarioId
          ? ("vincular" as const)
          : ("sin_cuenta" as const);

    const conductorData = {
      usuarioId: formData.usuarioId,
      modoCuenta,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      nombre: formData.nombre.trim(),
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento.trim(),
      correo: formData.correo.trim(),
      direccion: editingConductor?.direccion || "",
      numeroTelefonico: formData.numeroTelefonico.trim(),
      tipoUsuarioId: formData.tipoUsuarioId,
      tipoUsuarioNombre: "",
      // regional/centro/programa de formación ya no se piden ni se envían.
      regionalFormacion: "",
      centroFormacion: "",
      programaFormacion: "",
      vigencia: editingConductor?.vigencia || "",
      movilidadReducida: formData.movilidadReducida,
      tipoDiscapacidad: formData.tipoDiscapacidad.trim(),
      estado: formData.estado,
    };

    try {
      if (editingConductor) {
        // Editar un conductor solo cambia su cuenta vinculada y su estado: el resto se
        // muestra en solo lectura (ver ConductorFormModal), así que no se reenvía. Enviarlo
        // solo servía para arriesgarse a pisar datos que la cuenta ya mantiene.
        await data.updateConductor(editingConductor.id, {
          usuarioId: conductorData.usuarioId,
          estado: conductorData.estado,
        });
        // La foto no viaja a la API: se guarda en este navegador (services/core/fotosPerfil.ts).
        data.guardarFotoConductor(editingConductor.id, formData.foto);

        const vehiculoData = conVehiculo ? {
          conductorId: editingConductor.id,
          conductorNombre: conductorData.nombre,
          placa: formData.placa.toUpperCase().trim(),
          tipo: formData.tipoVehiculo,
          marca: formData.marca.trim(),
          linea: formData.linea.trim(),
          modelo: formData.modelo ? Number(formData.modelo) : null,
          color: formData.color.trim(),
          descripcion: formData.descripcionVehiculo.trim(),
          estado: "activo" as const,
        } : null;

        if (vehiculoData) {
          const existingVehiculo = editingVehiculoId
            ? data.vehiculos.find((v) => v.id === editingVehiculoId)
            : undefined;
          if (existingVehiculo) {
            await data.updateVehiculo(existingVehiculo.id, vehiculoData);
          } else {
            await data.addVehiculo(vehiculoData);
          }
        }
        toast.success("Conductor actualizado correctamente");
      } else {
        const created = await data.addConductor(conductorData);
        if (created?.id) {
          // Igual que al editar, pero solo ahora se conoce el id que asignó el backend.
          data.guardarFotoConductor(created.id, formData.foto);
          if (conVehiculo) {
            const vehiculoCreado = await data.addVehiculo({
              conductorId: created.id,
              conductorNombre: created.nombre,
              placa: formData.placa.toUpperCase().trim(),
              tipo: formData.tipoVehiculo,
              marca: formData.marca.trim(),
              linea: formData.linea.trim(),
              modelo: formData.modelo ? Number(formData.modelo) : null,
              color: formData.color.trim(),
              descripcion: formData.descripcionVehiculo.trim(),
              estado: "activo",
            });
            onCreated?.(created, vehiculoCreado);
          }
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
  }, [formData, editingConductor, editingVehiculoId, data, validate, onCreated, erroresRemotos, conVehiculo]);

  return {
    dialogOpen, setDialogOpen, editingConductor, editingVehiculoId,
    // `erroresVisibles` (no `formErrors`) para que el formulario pinte también los choques
    // que solo conoce el backend: documento o correo ya registrados.
    formData, setFormData, formErrors: erroresVisibles, touched, markTouched,
    usuarioSearch, setUsuarioSearch, usuariosFiltrados, usuariosConConductorIds, usuarioSeleccionado,
    isValid, isEdit: !!editingConductor,
    /** El visitante es el único que puede quedarse sin cuenta: el formulario lo usa para
     *  decidir si exige vincular o crear una. */
    esVisitante,
    /** El formulario incluye la sección del vehículo (solo en el asistente de parqueo). */
    conVehiculo,
    openCreate, openEdit, handleSave,
  };
}

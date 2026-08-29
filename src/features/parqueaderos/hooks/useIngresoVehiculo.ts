import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Conductor } from "@/services/api/conductores";
import {
  type VehiculoForm,
  normalizarTexto, validarPlacaColombiana, validarPlacaPorTipo, validarNombreConductor, tipoVehiculoDesdePlaca,
  getTipoCeldaConfig,
} from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";
import { otroVehiculoDelConductorEnUso } from "@/features/conductores";
import type { Reserva } from "@/services/api/reservas";

const emptyVehiculoForm = (esOficial = false): VehiculoForm => ({ placa: "", conductor: "", esOficial, marca: "", modelo: "", color: "" });

/** Formulario de registro/estacionamiento de un vehículo en una celda: búsqueda estructurada
 * de conductor (documento/nombre/correo) → selección de uno de sus vehículos ya registrados
 * (o creación inline de cualquiera de los dos, sin perder el paso en el que iba) → registro
 * final en la celda ya elegida. `registrarEnCelda` sigue siendo el motor de validación/registro
 * compartido con el escáner OCR y la Asignación Inteligente (`useOcrScanner.ts`), que siguen
 * identificando por placa/nombre en texto libre — para esos dos, si el nombre detectado no
 * coincide con un conductor ya registrado, el ingreso se registra igual pero sin conductor
 * vinculado (el vigilante puede completarlo después desde Conductores); el asistente de este
 * hook, en cambio, exige un conductor real antes de permitir el registro. */
export function useIngresoVehiculo(
  data: ParqueaderosData,
  celdaActiva: Celda | null,
  parqueaderoActivo: Parqueadero | null,
  setOpenModal: (m: ModalKind) => void
) {
  const { conductores, vehiculos, controlesSalida, reservas, addVehiculo, addControlSalida, updateCelda, updateReserva } = data;

  const [vehiculoForm, setVehiculoForm] = useState<VehiculoForm>(emptyVehiculoForm());
  const [placaError, setPlacaError] = useState<string | null>(null);
  // Id del conductor elegido explícitamente desde el buscador estructurado (documento/nombre/
  // correo) o creado en el momento — a diferencia de `vehiculoForm.conductor` (un nombre en
  // texto libre, compartido con el OCR), este id no es ambiguo aunque existan dos conductores
  // con el mismo nombre. Se usa como fuente de verdad preferente en `conductorIdentificado` y
  // se manda tal cual al registrar, en vez de volver a resolverlo por nombre.
  const [conductorSeleccionadoId, setConductorSeleccionadoId] = useState<string | null>(null);
  const [conductorQuery, setConductorQuery] = useState("");

  const resolverVehiculo = async (
    placa: string, conductorId: string, tipo: "carro" | "moto",
    datosVehiculo?: { marca?: string; modelo?: string; color?: string }
  ): Promise<string> => {
    const existente = vehiculos.find((v) => v.placa === placa);
    if (existente) return existente.id;
    const modeloAnio = Number(datosVehiculo?.modelo);
    return addVehiculo({
      conductorId, conductorNombre: "", placa, tipo,
      marca: datosVehiculo?.marca?.trim() || "", linea: "",
      modelo: Number.isFinite(modeloAnio) && modeloAnio > 0 ? modeloAnio : null,
      color: datosVehiculo?.color?.trim() || "", descripcion: "", estado: "activo",
    });
  };

  const registrarEnCelda = async (
    celda: Celda, placaRaw: string, conductorRaw: string, _esOficial: boolean,
    datosVehiculo?: { marca?: string; modelo?: string; color?: string },
    conductorIdExplicito?: string
  ): Promise<boolean> => {
    const placa = placaRaw.trim().toUpperCase();
    const conductorNombre = normalizarTexto(conductorRaw, 60);
    if (!placa || !conductorNombre) { setPlacaError("Completa todos los campos."); return false; }
    if (!validarPlacaColombiana(placa)) { setPlacaError("Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto)."); return false; }
    // Cuando el asistente de búsqueda estructurada ya identificó un conductor puntual (por
    // documento/nombre/correo o recién creado), se resuelve por su id — evita el caso
    // ambiguo de dos conductores con el mismo nombre. El OCR y la Asignación Inteligente
    // no mandan este id (siguen resolviendo por nombre, igual que siempre).
    // Un conductor ya registrado en el módulo Conductores es válido de por sí, aunque su
    // nombre no cumpla el formato "nombre apellido" del validador genérico (p. ej. "Carlos
    // López M.", con inicial abreviada). El validador de formato solo aplica a nombres nuevos.
    const conductorExistente = conductorIdExplicito
      ? conductores.find((c) => c.id === conductorIdExplicito)
      : conductores.find((c) => c.nombre.trim().toLowerCase() === conductorNombre.toLowerCase());
    if (!conductorExistente && !validarNombreConductor(conductorNombre)) { setPlacaError("Ingresa el nombre completo del conductor (nombre y apellido)."); return false; }
    // Un conductor desactivado no puede seguir estacionando vehículos: "inactivo" debe
    // bloquear de verdad, no solo dejar de aparecer en las sugerencias.
    if (conductorExistente && conductorExistente.estado === "inactivo") { setPlacaError("Este conductor está inactivo y no puede registrar vehículos. Actívalo en el módulo Conductores."); return false; }

    const pq = data.parqueaderos.find((p) => p.id === celda.parqueaderoId);
    // Un parqueadero desactivado no acepta nuevos registros de vehículos.
    if (pq && pq.estado !== "activo") { setPlacaError("Este parqueadero está inactivo y no acepta nuevos registros."); return false; }

    const tipoPlaca = tipoVehiculoDesdePlaca(placa);
    if (celda.tipo === "carro" && tipoPlaca !== "carro") { setPlacaError("Esta celda es para automóviles. La placa ingresada tiene formato de moto (ABC12D / ABC12)."); return false; }
    if (celda.tipo === "moto" && tipoPlaca !== "moto") { setPlacaError("Esta celda es para motocicletas. La placa ingresada tiene formato de carro (ABC123)."); return false; }
    // Celdas de bicicleta/camión/bus no tienen convención de placa propia que validar contra
    // el formato en sí, pero si la placa SÍ tiene formato reconocible de carro o moto, es
    // justamente el vehículo equivocado para una celda de este tipo (antes esto pasaba sin
    // aviso: un carro/moto se dejaba registrar igual en una celda exclusiva para bicicletas).
    if (celda.tipo !== "carro" && celda.tipo !== "moto" && tipoPlaca) {
      const etiquetaCelda = getTipoCeldaConfig(celda.tipo).label.toLowerCase();
      const etiquetaPlaca = tipoPlaca === "moto" ? "motocicletas" : "automóviles";
      setPlacaError(`Esta celda es exclusiva para ${etiquetaCelda}, no para ${etiquetaPlaca}.`);
      return false;
    }

    const yaActivo = controlesSalida.some((cs) => cs.estado === "en_parqueadero" && cs.celdaId !== celda.id && vehiculos.find((v) => v.id === cs.vehiculoId)?.placa === placa);
    if (yaActivo) { setPlacaError("Este vehículo ya está estacionado en otra celda."); return false; }

    // La celda podría tener una reserva activa (pendiente = admin-direct sin confirmar aún,
    // o activa = ya aceptada/reservada) — si es así, solo el vehículo reservado puede
    // estacionarse aquí; cualquier otro vehículo queda bloqueado hasta que esa reserva expire
    // o se cancele.
    const reservaDeLaCelda = reservas.find((r) => r.celdaId === celda.id && (r.estado === "pendiente" || r.estado === "activa"));
    const vehiculoExistentePorPlaca = vehiculos.find((v) => v.placa === placa) ?? null;
    if (reservaDeLaCelda && reservaDeLaCelda.vehiculoId !== vehiculoExistentePorPlaca?.id) {
      const vehiculoReservado = vehiculos.find((v) => v.id === reservaDeLaCelda.vehiculoId);
      setPlacaError(`Esta celda está reservada exclusivamente para el vehículo ${vehiculoReservado?.placa ?? "reservado"} hasta las ${reservaDeLaCelda.horaFin}.`);
      return false;
    }

    // Igual que al reservar: mientras el conductor tenga otro vehículo suyo ya estacionado o
    // con una reserva pendiente/activa en otra celda, no puede usar este para estacionar.
    if (conductorExistente) {
      const otroEnUso = otroVehiculoDelConductorEnUso(
        conductorExistente.id, vehiculoExistentePorPlaca?.id ?? null, vehiculos, controlesSalida, reservas
      );
      if (otroEnUso) { setPlacaError(otroEnUso.motivo); return false; }
    }

    const conductorId = conductorExistente?.id ?? "";
    const fechaEntrada = new Date().toISOString().slice(0, 16);
    const vehiculoTipo: "carro" | "moto" = tipoPlaca === "moto" ? "moto" : "carro";

    try {
      const vehiculoId = await resolverVehiculo(placa, conductorId, vehiculoTipo, datosVehiculo);

      // Solo se completa la reserva de ESTE vehículo — antes se completaba cualquier reserva
      // pendiente de la celda sin importar el vehículo, lo que habría marcado como "cumplida"
      // la reserva de otro vehículo si de alguna forma llegaba a estacionarse aquí (ahora eso
      // ya está bloqueado más arriba, pero esta comprobación se deja como defensa adicional).
      if (reservaDeLaCelda && reservaDeLaCelda.vehiculoId === vehiculoId) {
        await updateReserva(reservaDeLaCelda.id, { estado: "completada" });
      }

      await addControlSalida({ vehiculoId, conductorId, parqueaderoId: celda.parqueaderoId, celdaId: celda.id, fechaEntrada, estado: "en_parqueadero" });
      await updateCelda(celda.id, { estado: "no_disponible", ocupada: true });
      toast.success(`Vehículo ${placa} registrado.`);
      return true;
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error registering vehicle entry:", error);
      return false;
    }
  };

  const registrarVehiculo = async () => {
    if (!celdaActiva) return;
    if (await registrarEnCelda(celdaActiva, vehiculoForm.placa, vehiculoForm.conductor, vehiculoForm.esOficial, {
      marca: vehiculoForm.marca, modelo: vehiculoForm.modelo, color: vehiculoForm.color,
    }, conductorSeleccionadoId ?? undefined)) {
      setOpenModal(null);
    }
  };

  const resetWizardConductor = () => {
    setConductorSeleccionadoId(null);
    setConductorQuery("");
  };

  const abrirIngresoOficial = () => { setVehiculoForm(emptyVehiculoForm(true)); resetWizardConductor(); setOpenModal("ingreso"); };
  const abrirIngresoVisitante = () => { setVehiculoForm(emptyVehiculoForm(false)); resetWizardConductor(); setOpenModal("ingreso"); };

  /** Selección estructurada del conductor (buscador por documento/nombre/correo, o recién
   *  creado inline) — a diferencia de escribir un nombre libre, deja el id sin ambigüedad y
   *  limpia cualquier vehículo/placa que hubiera quedado de una selección anterior. */
  const seleccionarConductor = (c: Conductor) => {
    setConductorSeleccionadoId(c.id);
    setConductorQuery("");
    setPlacaError(null);
    setVehiculoForm((prev) => ({ ...prev, conductor: c.nombre, placa: "", marca: "", modelo: "", color: "" }));
  };

  /** Vuelve al paso de búsqueda de conductor (botón "Cambiar"), sin cerrar el asistente. */
  const cambiarConductor = () => {
    setConductorSeleccionadoId(null);
    setConductorQuery("");
    setPlacaError(null);
    setVehiculoForm((prev) => ({ ...prev, conductor: "", placa: "", marca: "", modelo: "", color: "" }));
  };

  /** Selección de uno de los vehículos ya registrados del conductor identificado. */
  const seleccionarVehiculo = (v: Vehiculo) => {
    setPlacaError(null);
    setVehiculoForm((prev) => ({ ...prev, placa: v.placa }));
  };

  /* Sugerencias del campo Conductor: nombres de conductores reales ya registrados en el
     módulo Conductores (en vez de la lista genérica de ejemplo), para que el operador
     elija uno existente en lugar de escribir uno cualquiera. Si el conductor buscado no
     aparece, se puede seguir escribiendo su nombre para registrarlo como uno nuevo. */
  const conductoresSugeridos = useMemo(
    () => Array.from(new Set(conductores.filter((c) => c.estado === "activo").map((c) => c.nombre))).sort((a, b) => a.localeCompare(b, "es")),
    [conductores]
  );

  /* Búsqueda en vivo del vehículo/conductor asociados a la placa escrita: si la placa ya
     está registrada, se muestra (y bloquea) el nombre de su conductor real en lugar de dejar
     que el operador reescriba uno cualquiera; si no se encuentra, el formulario queda libre
     para registrar la placa como un vehículo nuevo. */
  const vehiculoEncontrado = useMemo(() => {
    const placa = vehiculoForm.placa.trim().toUpperCase();
    if (!validarPlacaColombiana(placa)) return null;
    return vehiculos.find((v) => v.placa === placa) ?? null;
  }, [vehiculoForm.placa, vehiculos]);

  /* Chequeo en vivo de "vehículo ya estacionado en otra celda": los datos (controlesSalida,
     vehículos) ya están cargados en memoria, así que no hace falta esperar al envío del
     formulario para avisar — se recalcula con cada tecleo de la placa, igual que el resto de
     validaciones de este formulario. */
  const placaYaEstacionada = useMemo(() => {
    if (!vehiculoEncontrado || !celdaActiva) return false;
    return controlesSalida.some(
      (cs) => cs.estado === "en_parqueadero" && cs.celdaId !== celdaActiva.id && cs.vehiculoId === vehiculoEncontrado.id
    );
  }, [vehiculoEncontrado, controlesSalida, celdaActiva]);

  const conductorEncontrado = useMemo(() => {
    if (!vehiculoEncontrado) return null;
    return conductores.find((c) => c.id === vehiculoEncontrado.conductorId) ?? null;
  }, [vehiculoEncontrado, conductores]);

  /* Conductor "identificado" para todo el resto del formulario, en orden de prioridad:
     1) elegido explícitamente en el buscador estructurado (conductorSeleccionadoId) — el
        único caso sin ambigüedad aunque haya dos conductores con el mismo nombre;
     2) resuelto por la placa ya registrada (conductorEncontrado);
     3) coincidencia exacta de nombre en texto libre (compatibilidad con el OCR, que solo
        rellena `vehiculoForm.conductor` con el nombre detectado, sin id). */
  const conductorIdentificado = useMemo(() => {
    if (conductorSeleccionadoId) {
      const c = conductores.find((c) => c.id === conductorSeleccionadoId);
      if (c) return c;
    }
    if (conductorEncontrado) return conductorEncontrado;
    const nombre = vehiculoForm.conductor.trim().toLowerCase();
    if (!nombre) return null;
    return conductores.find((c) => c.nombre.trim().toLowerCase() === nombre) ?? null;
  }, [conductorSeleccionadoId, conductorEncontrado, vehiculoForm.conductor, conductores]);

  /* Chequeo en vivo de "celda reservada para otro vehículo" y "el conductor ya tiene otro
     vehículo suyo en uso" — igual que placaYaEstacionada, se recalcula con cada tecleo para
     avisar antes de que el operador intente enviar el formulario. */
  const motivoBloqueoLive = useMemo((): string | null => {
    if (!celdaActiva) return null;
    const reservaDeLaCelda: Reserva | undefined = reservas.find(
      (r) => r.celdaId === celdaActiva.id && (r.estado === "pendiente" || r.estado === "activa")
    );
    if (reservaDeLaCelda && reservaDeLaCelda.vehiculoId !== vehiculoEncontrado?.id) {
      const vehiculoReservado = vehiculos.find((v) => v.id === reservaDeLaCelda.vehiculoId);
      return `Esta celda está reservada exclusivamente para el vehículo ${vehiculoReservado?.placa ?? "reservado"} hasta las ${reservaDeLaCelda.horaFin}.`;
    }
    // `conductorIdentificado` (no solo `conductorEncontrado`, que depende de que la placa YA
    // coincida con un vehículo existente) para que este aviso también salga cuando el
    // conductor ya fue elegido en el buscador estructurado pero todavía no se eligió/escribió
    // una placa: si ese conductor ya tiene otro vehículo en uso en otra celda, se avisa antes
    // de que intente registrar uno nuevo.
    if (conductorIdentificado) {
      const otroEnUso = otroVehiculoDelConductorEnUso(
        conductorIdentificado.id, vehiculoEncontrado?.id ?? null, vehiculos, controlesSalida, reservas
      );
      if (otroEnUso) return otroEnUso.motivo;
    }
    return null;
  }, [celdaActiva, reservas, vehiculoEncontrado, vehiculos, conductorIdentificado, controlesSalida]);

  const conductorAutoRef = useRef(false);
  useEffect(() => {
    if (conductorEncontrado) {
      conductorAutoRef.current = true;
      setVehiculoForm((prev) => (prev.conductor === conductorEncontrado.nombre ? prev : { ...prev, conductor: conductorEncontrado.nombre }));
    } else if (conductorAutoRef.current) {
      conductorAutoRef.current = false;
      setVehiculoForm((prev) => (prev.conductor ? { ...prev, conductor: "" } : prev));
    }
  }, [conductorEncontrado]);

  const vehiculosConductor = useMemo(() => {
    if (!conductorIdentificado) return [];
    return vehiculos.filter((v) => v.conductorId === conductorIdentificado.id);
  }, [conductorIdentificado, vehiculos]);

  /* Validación en vivo del formulario de registro de vehículo: la placa debe coincidir
     con el tipo de la celda seleccionada (carro/moto) y el conductor debe tener nombre completo
     (o, si ya es un conductor real identificado —por placa o por nombre exacto—, ese nombre ya
     es válido de por sí, aunque no cumpla el formato "nombre apellido" del validador genérico:
     el módulo Conductores permite nombres como "Carlos López M.", con inicial abreviada). */
  // Las placas colombianas solo tienen convención para carro o moto — una celda de
  // bicicleta/camión/bus no tiene un formato de placa que validar contra, así que este
  // flujo (registro por placa) simplemente no aplica para ese tipo de celda (antes caía al
  // formato de "carro" por defecto y dejaba pasar cualquier carro, sin avisar del todo).
  const ingresoPlacaOk = celdaActiva && (celdaActiva.tipo === "carro" || celdaActiva.tipo === "moto")
    ? validarPlacaPorTipo(vehiculoForm.placa, celdaActiva.tipo)
    : false;
  // El asistente exige un conductor REAL (elegido en el buscador, resuelto por placa, o
  // recién creado) — ya no basta con escribir un nombre con formato "nombre apellido" sin
  // que exista de verdad: eso dejaba vehículos huérfanos, sin conductor vinculado en la BD.
  // "Inactivo" también bloquea de verdad: un conductor desactivado no puede registrar.
  const ingresoConductorOk = !!conductorIdentificado && conductorIdentificado.estado === "activo";
  // Cuando la placa no coincide con ningún vehículo ya registrado (un vehículo nuevo,
  // típicamente detectado por el escáner OCR), marca y color pasan a ser obligatorios aquí
  // también — mismo criterio que ya aplica al crear un vehículo desde Conductores.
  const datosVehiculoNuevoOk = !!vehiculoEncontrado || (vehiculoForm.marca.trim() !== "" && vehiculoForm.color.trim() !== "");
  const parqueaderoIngresoActivo = parqueaderoActivo?.estado === "activo";
  const ingresoValid = ingresoPlacaOk && ingresoConductorOk && parqueaderoIngresoActivo && !placaYaEstacionada && !motivoBloqueoLive && datosVehiculoNuevoOk;
  const ingresoPlacaHint = celdaActiva
    ? (celdaActiva.tipo === "moto" ? "Formato moto: 3 letras + 2 números + letra final opcional (ABC12D o ABC12)"
      : celdaActiva.tipo === "carro" ? "Formato carro: 3 letras + 3 números (ABC123)"
        : `Esta celda es exclusiva para ${getTipoCeldaConfig(celdaActiva.tipo).label.toLowerCase()} y no admite registro por placa de carro o moto.`)
    : "";

  return {
    vehiculoForm, setVehiculoForm, placaError, setPlacaError,
    registrarEnCelda, registrarVehiculo, abrirIngresoOficial, abrirIngresoVisitante,
    conductoresSugeridos, vehiculoEncontrado, conductorEncontrado, conductorIdentificado, vehiculosConductor,
    ingresoPlacaOk, ingresoConductorOk, ingresoValid, ingresoPlacaHint, parqueaderoIngresoActivo, placaYaEstacionada,
    motivoBloqueoLive,
    conductorQuery, setConductorQuery, seleccionarConductor, cambiarConductor, seleccionarVehiculo,
  };
}

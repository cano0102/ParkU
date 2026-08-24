import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Shield, Search, X, LayoutGrid, Map as MapIcon, Zap, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useParqueaderos, useCreateParqueadero, useUpdateParqueadero } from "@/features/parqueaderos/hooks/useParqueaderos";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { useCeldas, useCreateCelda, useUpdateCelda, useRemoveCelda } from "@/features/parqueaderos/hooks/useCeldas";
import type { Celda } from "@/services/api/celdas";
import { useConductores, useCreateConductor } from "@/features/conductores";
import type { Conductor } from "@/services/api/conductores";
import { useVehiculos, useCreateVehiculo, useUpdateVehiculo } from "@/features/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import {
  useControlSalida,
  useCreateControlSalida,
  useUpdateControlSalida,
} from "@/features/controlSalida";
import type { ControlSalida } from "@/services/api/controlSalida";
import { useReservas, useCreateReserva, useUpdateReserva } from "@/features/reservas";
import type { Reserva } from "@/services/api/reservas";
import { useCreateIncidente } from "@/features/incidentes";
import type { Incidente } from "@/services/api/incidentes";
import { theme } from "@/theme";
import {
  FormParqueadero, VehiculoForm, IncidenteForm,
  CELDA_CONFIG, TIPOS_PARQUEADERO, capitalizar,
  validarPlacaColombiana, validarPlacaPorTipo, validarNombreConductor, tipoVehiculoDesdePlaca, esPlacaOficial,
  normalizarTexto, validarFormParqueadero, NOMBRE_PQ_MAX,
} from "./lib/helpers";
import { useOcrPlaca, preprocesarImagenArchivo, calcularRoiDesdeGuia } from "./lib/ocrAdapter";
import { ParkingMap } from "./components/map/ParkingMap";
import { ParqueaderosTable } from "./components/ParqueaderosTable";
import { SmartAssignModal } from "./components/modals/SmartAssignModal";
import { ParqueaderoFormModal } from "./components/modals/ParqueaderoFormModal";
import { IngresoModal } from "./components/modals/IngresoModal";
import { CeldaInfoModal } from "./components/modals/CeldaInfoModal";
import { ReservaModal, ReservaFormState } from "./components/modals/ReservaModal";
import { IncidenteModal } from "./components/modals/IncidenteModal";
import { ScannerModal } from "./components/modals/ScannerModal";
import { parqueaderosStyles } from "./lib/styles";

const C = theme;
const MAX_EVIDENCIA_MB = 5;

export default function Parqueaderos() {
  const navigate = useNavigate();
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: controlesSalida = [] } = useControlSalida();
  const { data: reservas = [] } = useReservas();

  const createParqueaderoMutation = useCreateParqueadero();
  const updateParqueaderoMutation = useUpdateParqueadero();
  const createCeldaMutation = useCreateCelda();
  const updateCeldaMutation = useUpdateCelda();
  const removeCeldaMutation = useRemoveCelda();
  const createConductorMutation = useCreateConductor();
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();
  const createControlSalidaMutation = useCreateControlSalida();
  const updateControlSalidaMutation = useUpdateControlSalida();
  const createReservaMutation = useCreateReserva();
  const updateReservaMutation = useUpdateReserva();
  const createIncidenteMutation = useCreateIncidente();

  const addParqueadero = (data: Omit<Parqueadero, "id">) => createParqueaderoMutation.mutate(data);
  const updateParqueadero = (id: string, data: Partial<Omit<Parqueadero, "id">>) =>
    updateParqueaderoMutation.mutate({ id, data });
  const addCelda = (data: Omit<Celda, "id">) => createCeldaMutation.mutate(data);
  const updateCelda = (id: string, data: Partial<Omit<Celda, "id">>) => updateCeldaMutation.mutate({ id, data });
  const deleteCelda = (id: string) => removeCeldaMutation.mutate(id);
  // resolverConductor/resolverVehiculo necesitan el id real del registro creado
  // antes de seguir (para encadenar el control de salida), así que estas dos sí
  // esperan a que la mutación termine en vez de disparar y olvidar.
  const addConductor = (data: Omit<Conductor, "id">): Promise<string> =>
    createConductorMutation.mutateAsync(data).then((c) => c.id);
  const addVehiculo = (data: Omit<Vehiculo, "id">): Promise<string> =>
    createVehiculoMutation.mutateAsync(data).then((v) => v.id);
  const updateVehiculo = (id: string, data: Partial<Omit<Vehiculo, "id">>) =>
    updateVehiculoMutation.mutate({ id, data });
  const addControlSalida = (data: Omit<ControlSalida, "id">) => createControlSalidaMutation.mutate(data);
  const updateControlSalida = (id: string, data: Partial<Omit<ControlSalida, "id">>) =>
    updateControlSalidaMutation.mutate({ id, data });
  const addReserva = (data: Omit<Reserva, "id">) => createReservaMutation.mutate(data);
  const updateReserva = (id: string, data: Partial<Omit<Reserva, "id">>) =>
    updateReservaMutation.mutate({ id, data });
  const addIncidente = (data: Omit<Incidente, "id">) => createIncidenteMutation.mutate(data);

  const [activeTab, setActiveTab]   = useState<"map" | "table">("table");
  const [openModal, setOpenModal]   = useState<"create"|"edit"|"ingreso"|"info"|"scanner"|"smartAssign"|"incidente"|"reserva"|null>(null);
  const [pqEditId, setPqEditId]     = useState<string | null>(null);
  const [celdaSeleccionadaId, setCeldaSeleccionadaId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch]         = useState(() => searchParams.get("q") || "");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [pqForm, setPqForm]         = useState<FormParqueadero>({ nombre: "", bloque: "A", tipo: "general", direccion: "", horaInicio: "06:00", horaFin: "22:00", celdasCarros: 8, celdasMotos: 2, celdasMovilidadReducida: 1, descripcion: "" });
  const [formError, setFormError]   = useState<string | null>(null);
  const [vehiculoForm, setVehiculoForm] = useState<VehiculoForm>({ placa: "", conductor: "", esOficial: false, marca: "", modelo: "", color: "" });
  const [incidenteForm, setIncidenteForm] = useState<IncidenteForm>({ descripcion: "", asignadoA: "", notasResolucion: "", evidencia: "" });
  const [incidenteError, setIncidenteError] = useState<string | null>(null);
  const [placaError, setPlacaError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError]     = useState<string | null>(null);
  const [ocrFlash, setOcrFlash]     = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  const [scannerOrigin, setScannerOrigin] = useState<"ingreso"|"smartAssign"|null>(null);
  const [scannedPlate, setScannedPlate]   = useState<string | undefined>(undefined);
  const [, forceTick] = useState(0);

  // Estado para el formulario de reserva
  const [reservaForm, setReservaForm] = useState<ReservaFormState>({
    vehiculoId: "",
    parqueaderoId: "",
    celdaId: "",
    fechaReserva: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    horaFin: "18:00",
    estado: "pendiente",
  });
  const [reservaError, setReservaError] = useState<string | null>(null);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const guiaRef   = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { reconocer, reconocerLicencia, liberarWorker } = useOcrPlaca();

  // Manejador para subir evidencia en incidentes
  const handleIncidenteFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    if (file.size > MAX_EVIDENCIA_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_EVIDENCIA_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setIncidenteForm(prev => ({ ...prev, evidencia: ev.target?.result as string || '' }));
    };
    reader.onerror = () => toast.error('No se pudo cargar la imagen');
    reader.readAsDataURL(file);
  }, []);

  const removeIncidenteEvidencia = useCallback(() => {
    setIncidenteForm(prev => ({ ...prev, evidencia: '' }));
  }, []);

  useEffect(() => { const i = setInterval(() => forceTick(t => t + 1), 30000); return () => clearInterval(i); }, []);

  const cerrarCamara = useCallback(() => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCamaraLista(false); }, []);
  const iniciarCamara = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setOcrError("Cámara no compatible. Usa HTTPS."); return; }
    setOcrError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s;
      } catch { setOcrError("No se pudo iniciar la cámara."); }
    }
  }, []);
  useEffect(() => { if (openModal === "scanner") iniciarCamara(); else cerrarCamara(); return () => cerrarCamara(); }, [openModal, iniciarCamara, cerrarCamara]);
  useEffect(() => () => { liberarWorker(); }, [liberarWorker]);

  /* ── DERIVAR OCUPANTE DE UNA CELDA ── */
  const getOcupante = useCallback((celdaId: string) => {
    // 1. Buscar control de salida activo
    const cs = controlesSalida.find(c => c.celdaId === celdaId && c.estado === "en_parqueadero");
    if (cs) {
      const vehiculo = vehiculos.find(v => v.id === cs.vehiculoId);
      if (vehiculo) {
        const conductor = conductores.find(c => c.id === vehiculo.conductorId);
        return {
          vehiculo,
          conductor,
          esOficial: esPlacaOficial(vehiculo.placa),
          controlId: cs.id,
          fechaEntrada: cs.fechaEntrada
        };
      }
    }

    // 2. Si no hay control activo, buscar vehículo asociado directamente a la celda
    const vehiculoEnCelda = vehiculos.find(v => v.celdaId === celdaId);
    if (vehiculoEnCelda) {
      const conductor = conductores.find(c => c.id === vehiculoEnCelda.conductorId);
      return {
        vehiculo: vehiculoEnCelda,
        conductor: conductor || undefined,
        esOficial: esPlacaOficial(vehiculoEnCelda.placa),
        controlId: "",
        fechaEntrada: vehiculoEnCelda.fechaEntrada || new Date().toISOString(),
      };
    }

    return null;
  }, [controlesSalida, vehiculos, conductores]);

  const stats = useMemo(() => {
    const t = celdas.length;
    const o = celdas.filter(c => c.estado === "no_disponible").length;
    const l = celdas.filter(c => c.estado === "disponible").length;
    const r = celdas.filter(c => c.estado === "reservada").length;
    return { total: t, ocupadas: o, libres: l, reservadas: r, pct: t ? Math.round(o / t * 100) : 0 };
  }, [celdas]);

  const celdaActiva      = useMemo(() => celdas.find(c => c.id === celdaSeleccionadaId) ?? null, [celdas, celdaSeleccionadaId]);
  const parqueaderoActivo = useMemo(() => celdaActiva ? parqueaderos.find(p => p.id === celdaActiva.parqueaderoId) ?? null : null, [celdaActiva, parqueaderos]);
  const ocupanteActivo   = useMemo(() => celdaActiva ? getOcupante(celdaActiva.id) : null, [celdaActiva, getOcupante]);
  const reservaActiva    = useMemo(
    () => celdaActiva ? reservas.find(r => r.celdaId === celdaActiva.id && (r.estado === "pendiente" || r.estado === "activa")) ?? null : null,
    [celdaActiva, reservas]
  );
  const vehiculoReservado = useMemo(
    () => reservaActiva ? vehiculos.find(v => v.id === reservaActiva.vehiculoId) ?? null : null,
    [reservaActiva, vehiculos]
  );

  const cellMatchesSearch = useCallback((celda: Celda) => {
    if (!search.trim()) return false;
    const q = search.toLowerCase();
    const ocupante = getOcupante(celda.id);
    return !!(celda.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q));
  }, [search, getOcupante]);

  const filteredPqs = useMemo(() => parqueaderos.filter(pq => filterTipo === "Todos" || pq.tipo === filterTipo), [parqueaderos, filterTipo]);
  const filteredCeldas = useMemo(() => {
    if (!search.trim()) return celdas;
    const q = search.toLowerCase();
    return celdas.filter(c => {
      const ocupante = getOcupante(c.id);
      return c.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q);
    });
  }, [celdas, search, getOcupante]);
  const filteredPqsConCeldas = useMemo(
    () => filteredPqs.filter(pq => filteredCeldas.some(c => c.parqueaderoId === pq.id) || !search.trim()),
    [filteredPqs, filteredCeldas, search]
  );

  const handleCellClick = useCallback((celda: Celda) => {
    setCeldaSeleccionadaId(celda.id);
    setPlacaError(null);
    setIncidenteError(null);
    // Resetear evidencia al abrir incidente
    setIncidenteForm(prev => ({ ...prev, evidencia: '' }));
    if (celda.estado === "no_disponible") {
      const ocupante = getOcupante(celda.id);
      setVehiculoForm({
        placa: ocupante?.vehiculo.placa || "",
        conductor: ocupante?.conductor?.nombre || "",
        esOficial: ocupante?.esOficial || false,
        marca: ocupante?.vehiculo.marca || "",
        modelo: ocupante?.vehiculo.modelo || "",
        color: ocupante?.vehiculo.color || "",
      });
      setOpenModal("info");
    } else if (celda.estado === "reservada") {
      setVehiculoForm({ placa: "", conductor: "", esOficial: true, marca: "", modelo: "", color: "" });
      setOpenModal("info");
    } else if (celda.estado === "mantenimiento") {
      toast.info("Esta celda está en mantenimiento y no puede usarse.");
    } else {
      setVehiculoForm({ placa: "", conductor: "", esOficial: false, marca: "", modelo: "", color: "" });
      setOpenModal("info");
    }
  }, [getOcupante]);

  /* ── Función para abrir el modal de reserva desde una celda ── */
  const openReservaFromCelda = useCallback((celda: Celda) => {
    setCeldaSeleccionadaId(celda.id);
    setReservaForm(prev => ({
      ...prev,
      parqueaderoId: celda.parqueaderoId,
      celdaId: celda.id,
      fechaReserva: new Date().toISOString().split("T")[0],
      horaInicio: "08:00",
      horaFin: "18:00",
      estado: "pendiente",
    }));
    setReservaError(null);
    setOpenModal("reserva");
  }, []);

  /* ── Función para crear la reserva ── */
  const handleCrearReserva = useCallback(() => {
    if (!reservaForm.vehiculoId) {
      setReservaError("Selecciona un vehículo");
      return;
    }
    if (!reservaForm.celdaId) {
      setReservaError("Selecciona una celda");
      return;
    }
    if (!reservaForm.fechaReserva) {
      setReservaError("La fecha es requerida");
      return;
    }
    if (!reservaForm.horaInicio || !reservaForm.horaFin) {
      setReservaError("El horario es requerido");
      return;
    }

    // Validar que el horario sea válido
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMinutes(reservaForm.horaFin) <= toMinutes(reservaForm.horaInicio)) {
      setReservaError("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    // El <input type="date" min=...> del formulario ya sugiere no elegir un día
    // pasado, pero ese límite es solo de interfaz: se puede editar el campo
    // directamente. Se revalida aquí, incluyendo la hora, para el día de hoy.
    const inicioReserva = new Date(`${reservaForm.fechaReserva}T${reservaForm.horaInicio}`);
    if (inicioReserva.getTime() < Date.now()) {
      setReservaError("No puedes reservar en una fecha u hora que ya pasó");
      return;
    }

    try {
      // Solo se permite una reserva activa por celda a la vez
      const conflicto = reservas.find(r =>
        r.celdaId === reservaForm.celdaId && (r.estado === "pendiente" || r.estado === "activa")
      );

      if (conflicto) {
        const vehiculo = vehiculos.find(v => v.id === conflicto.vehiculoId);
        setReservaError(`La celda ya tiene una reserva activa (vehículo ${vehiculo?.placa || "—"})`);
        return;
      }

      const { parqueaderoId, ...payload } = reservaForm;
      addReserva({ ...payload, estado: "activa" });
      updateCelda(reservaForm.celdaId, { estado: "reservada" });
      toast.success(`Reserva creada para la celda ${celdaActiva?.numero}`);
      setOpenModal(null);
      setReservaError(null);
      setReservaForm(prev => ({ ...prev, vehiculoId: "", horaInicio: "08:00", horaFin: "18:00" }));
    } catch (error) {
      setReservaError("Error al crear la reserva");
      console.error(error);
    }
  }, [reservaForm, addReserva, updateCelda, celdaActiva, reservas, vehiculos]);

  const capacidadForm = pqForm.celdasCarros + pqForm.celdasMotos + pqForm.celdasMovilidadReducida;

  const handleCreate = () => {
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
    if (!pqEditId) return;
    const actual = parqueaderos.find(p => p.id === pqEditId);
    if (!actual) return;
    const error = validarFormParqueadero(pqForm, parqueaderos, pqEditId);
    if (error) return setFormError(error);
    const nombre = normalizarTexto(pqForm.nombre, NOMBRE_PQ_MAX);
    const bloque = pqForm.bloque.trim();

    const celdasPq = celdas.filter(c => c.parqueaderoId === pqEditId);
    const tiposMap: { tipo: Celda["tipo"]; prefix: string; anterior: number; nuevo: number }[] = [
      { tipo: "carro", prefix: "C", anterior: actual.celdasCarros, nuevo: pqForm.celdasCarros },
      { tipo: "moto", prefix: "M", anterior: actual.celdasMotos, nuevo: pqForm.celdasMotos },
      { tipo: "movilidad reducida", prefix: "MR", anterior: actual.celdasMovilidadReducida, nuevo: pqForm.celdasMovilidadReducida },
    ];

    for (const t of tiposMap) {
      if (t.nuevo < t.anterior) {
        const delTipo = celdasPq.filter(c => c.tipo === t.tipo);
        const sobrantes = delTipo.slice(t.nuevo);
        if (sobrantes.some(c => c.estado === "no_disponible" || c.estado === "reservada")) {
          return setFormError(`No se puede reducir ${t.tipo}: hay celdas ocupadas o reservadas en el rango a eliminar.`);
        }
      }
    }

    for (const t of tiposMap) {
      const delTipo = celdasPq.filter(c => c.tipo === t.tipo);
      if (t.nuevo < t.anterior) {
        delTipo.slice(t.nuevo).forEach(c => deleteCelda(c.id));
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
    setOpenModal(null); setPqEditId(null);
  };

  const handleToggleEstadoParqueadero = (p: Parqueadero) => {
    const nuevoEstado = p.estado === "activo" ? "inactivo" : "activo";
    updateParqueadero(p.id, { estado: nuevoEstado });
    toast.success(nuevoEstado === "activo" ? "Parqueadero activado." : "Parqueadero desactivado.");
  };

  const resolverConductor = useCallback(async (nombre: string, tipo: Conductor["tipo"]): Promise<string> => {
    const existente = conductores.find(c => c.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    if (existente) return existente.id;
    return addConductor({
      usuarioId: "", nombre, tipoConductor: "aprendiz", centroFormacion: "",
      discapacidad: false, estado: "activo", tipo, email: "",
    });
  }, [conductores, addConductor]);

  const resolverVehiculo = useCallback(async (placa: string, conductorId: string, tipo: "carro" | "moto", parqueaderoId: string, celdaId: string, fechaEntrada: string, datosVehiculo?: { marca?: string; modelo?: string; color?: string }): Promise<string> => {
    const existente = vehiculos.find(v => v.placa === placa);
    if (existente) return existente.id;
    return addVehiculo({
      conductorId, placa, tipo,
      marca: datosVehiculo?.marca?.trim() || "", modelo: datosVehiculo?.modelo?.trim() || "",
      año: new Date().getFullYear(), color: datosVehiculo?.color?.trim() || "",
      descripcion: "", estado: "activo", parqueaderoId, celdaId, fechaEntrada,
    });
  }, [vehiculos, addVehiculo]);

  const tipoConductorDesdeParqueadero = (tipoPq: string): Conductor["tipo"] => {
    if (tipoPq === "docentes") return "docente";
    if (tipoPq === "administrativos") return "administrativo";
    return "visitante";
  };

  const registrarEnCelda = async (celda: Celda, placaRaw: string, conductorRaw: string, esOficial: boolean, datosVehiculo?: { marca?: string; modelo?: string; color?: string }): Promise<boolean> => {
    const placa = placaRaw.trim().toUpperCase();
    const conductorNombre = normalizarTexto(conductorRaw, 60);
    if (!placa || !conductorNombre) { setPlacaError("Completa todos los campos."); return false; }
    if (!validarPlacaColombiana(placa)) { setPlacaError("Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto)."); return false; }
    // Un conductor ya registrado en el módulo Conductores es válido de por sí, aunque su
    // nombre no cumpla el formato "nombre apellido" del validador genérico (p. ej. "Carlos
    // López M.", con inicial abreviada). El validador de formato solo aplica a nombres nuevos.
    const conductorExistente = conductores.find(c => c.nombre.trim().toLowerCase() === conductorNombre.toLowerCase());
    if (!conductorExistente && !validarNombreConductor(conductorNombre)) { setPlacaError("Ingresa el nombre completo del conductor (nombre y apellido)."); return false; }
    // Un conductor desactivado no puede seguir estacionando vehículos: "inactivo" debe
    // bloquear de verdad, no solo dejar de aparecer en las sugerencias.
    if (conductorExistente && conductorExistente.estado === "inactivo") { setPlacaError("Este conductor está inactivo y no puede registrar vehículos. Actívalo en el módulo Conductores."); return false; }

    const pq = parqueaderos.find(p => p.id === celda.parqueaderoId);
    // Un parqueadero desactivado no acepta nuevos registros de vehículos.
    if (pq && pq.estado !== "activo") { setPlacaError("Este parqueadero está inactivo y no acepta nuevos registros."); return false; }

    const tipoPlaca = tipoVehiculoDesdePlaca(placa);
    if (celda.tipo === "carro" && tipoPlaca !== "carro") { setPlacaError("Esta celda es para automóviles. La placa ingresada tiene formato de moto (ABC12D / ABC12)."); return false; }
    if (celda.tipo === "moto" && tipoPlaca !== "moto") { setPlacaError("Esta celda es para motocicletas. La placa ingresada tiene formato de carro (ABC123)."); return false; }

    const yaActivo = controlesSalida.some(cs => cs.estado === "en_parqueadero" && cs.celdaId !== celda.id && vehiculos.find(v => v.id === cs.vehiculoId)?.placa === placa);
    if (yaActivo) { setPlacaError("Este vehículo ya está estacionado en otra celda."); return false; }

    const tipoConductor = tipoConductorDesdeParqueadero(pq?.tipo || "");
    const conductorId = await resolverConductor(conductorNombre, tipoConductor);
    const fechaEntrada = new Date().toISOString().slice(0, 16);
    const vehiculoTipo: "carro" | "moto" = tipoPlaca === "moto" ? "moto" : "carro";
    const vehiculoId = await resolverVehiculo(placa, conductorId, vehiculoTipo, celda.parqueaderoId, celda.id, fechaEntrada, datosVehiculo);

    const reservaPendiente = reservas.find(r => r.celdaId === celda.id && (r.estado === "pendiente" || r.estado === "activa"));
    if (reservaPendiente) updateReserva(reservaPendiente.id, { estado: "completada" });

    addControlSalida({ vehiculoId, celdaId: celda.id, fechaEntrada, estado: "en_parqueadero" });
    updateCelda(celda.id, { estado: "no_disponible", ocupada: true });
    toast.success(`Vehículo ${placa} registrado.`);
    return true;
  };

  const registrarVehiculo = async () => {
    if (!celdaActiva) return;
    if (await registrarEnCelda(celdaActiva, vehiculoForm.placa, vehiculoForm.conductor, vehiculoForm.esOficial, {
      marca: vehiculoForm.marca, modelo: vehiculoForm.modelo, color: vehiculoForm.color,
    })) {
      setOpenModal(null);
    }
  };

  const handleRequestLiberar = () => {
    if (!celdaActiva) return;
    const ocupante = getOcupante(celdaActiva.id);
    if (ocupante && ocupante.controlId) {
      updateControlSalida(ocupante.controlId, {
        fechaSalida: new Date().toISOString().slice(0, 16),
        estado: "finalizado"
      });
    }
    const vehiculoEnCelda = vehiculos.find(v => v.celdaId === celdaActiva.id);
    if (vehiculoEnCelda) {
      // Limpia la referencia para que la celda liberada no siga apareciendo
      // como "ocupada" por este vehículo (getOcupante la usa como fallback).
      updateVehiculo(vehiculoEnCelda.id, { celdaId: "" });
    }
    updateCelda(celdaActiva.id, { estado: "disponible", ocupada: false });
    toast.info(`Celda ${celdaActiva.numero} liberada.`);
    setOpenModal(null);
  };

  const handleCancelarReserva = () => {
    if (!celdaActiva) return;
    const reserva = reservas.find(r => r.celdaId === celdaActiva.id && (r.estado === "pendiente" || r.estado === "activa"));
    if (reserva) updateReserva(reserva.id, { estado: "cancelada" });
    updateCelda(celdaActiva.id, { estado: "disponible" });
    toast.info("Reserva cancelada.");
    setOpenModal(null);
  };

  const cerrarScanner = useCallback(() => setOpenModal(scannerOrigin === "smartAssign" ? "smartAssign" : "ingreso"), [scannerOrigin]);

  /* Avisa si la placa detectada por OCR no coincide con el tipo de la celda que se
     está registrando (p. ej. escanear una placa de carro para una celda de moto). */
  const avisarSiTipoNoCoincide = useCallback((placaDetectada: string) => {
    if (scannerOrigin !== "ingreso" || !celdaActiva) return;
    if (celdaActiva.tipo !== "carro" && celdaActiva.tipo !== "moto") return;
    const tipoDetectado = tipoVehiculoDesdePlaca(placaDetectada);
    if (tipoDetectado && tipoDetectado !== celdaActiva.tipo) {
      toast.warning(`La placa ${placaDetectada} tiene formato de ${tipoDetectado}, pero la celda ${celdaActiva.numero} es para ${celdaActiva.tipo}s.`);
    }
  }, [scannerOrigin, celdaActiva]);

  const handleCaptureOcr = async () => {
    if (!videoRef.current) return;
    setOcrLoading(true); setOcrError(null);
    try {
      const roi = guiaRef.current ? calcularRoiDesdeGuia(videoRef.current, guiaRef.current) ?? undefined : undefined;
      const d = await reconocer(videoRef.current, roi);
      setOcrFlash(true); setTimeout(() => setOcrFlash(false), 1200);
      setVehiculoForm(prev => ({
        ...prev,
        placa: d.placa,
        conductor: d.conductor || prev.conductor,
        marca: d.marca || prev.marca,
        modelo: d.modelo || prev.modelo,
        color: d.color || prev.color,
      }));
      toast.success(`Placa detectada: ${d.placa}`);
      avisarSiTipoNoCoincide(d.placa);
      if (scannerOrigin === "smartAssign") { setScannedPlate(d.placa); cerrarCamara(); setOpenModal("smartAssign"); }
      else { cerrarCamara(); setOpenModal("ingreso"); }
    } catch (e) { setOcrError(e instanceof Error ? e.message : "Error al escanear."); }
    finally { setOcrLoading(false); }
  };

  const handleFileOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setOcrLoading(true); setOcrError(null);
    try {
      const reader = new FileReader();
      reader.onload = async ev => {
        try {
          const url = await preprocesarImagenArchivo(ev.target?.result as string);
          const d = await reconocerLicencia(url);
          setOcrFlash(true); setTimeout(() => setOcrFlash(false), 1200);
          setVehiculoForm(prev => ({
            ...prev,
            placa: d.placa,
            conductor: d.conductor || prev.conductor,
            marca: d.marca || prev.marca,
            modelo: d.modelo || prev.modelo,
            color: d.color || prev.color,
          }));
          toast.success(`Placa detectada: ${d.placa}`);
          avisarSiTipoNoCoincide(d.placa);
          if (scannerOrigin === "smartAssign") { setScannedPlate(d.placa); setOpenModal("smartAssign"); }
          else { setOpenModal("ingreso"); }
        } catch (err) { setOcrError(err instanceof Error ? err.message : "No se reconoció la placa."); }
        finally { setOcrLoading(false); }
      };
      reader.readAsDataURL(f);
    } catch { setOcrError("No se pudo procesar la imagen."); setOcrLoading(false); }
  };

  const handleSimOCR = (p: string, con: string, rol: string, marca: string, modelo: string, color: string) => {
    setOcrLoading(true);
    setTimeout(() => {
      setOcrLoading(false); setOcrFlash(true);
      setTimeout(() => {
        setOcrFlash(false);
        setVehiculoForm({ placa: p, conductor: con, esOficial: rol === "Oficial", marca, modelo, color });
        avisarSiTipoNoCoincide(p);
        if (scannerOrigin === "smartAssign") { setScannedPlate(p); setOpenModal("smartAssign"); }
        else { setOpenModal("ingreso"); }
      }, 1000);
    }, 800);
  };

  const handleSmartAssign = async (celda: Celda, placa: string, conductorNombre: string, esOficial: boolean) => {
    await registrarEnCelda(celda, placa, conductorNombre, esOficial);
    setScannedPlate(undefined);
  };

  /* ── REGISTRAR INCIDENTE (con evidencia) ── */
  const registrarIncidente = useCallback(() => {
    if (!celdaActiva || !ocupanteActivo) return;
    const { descripcion, asignadoA, notasResolucion, evidencia } = incidenteForm;
    if (!descripcion.trim()) {
      setIncidenteError("La descripción del incidente es obligatoria.");
      return;
    }

    const incidenteData = {
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
    };

    addIncidente(incidenteData);
    setIncidenteForm({ descripcion: "", asignadoA: "", notasResolucion: "", evidencia: "" });
    setIncidenteError(null);
    setOpenModal(null);
    toast.success("Incidente registrado correctamente.");
  }, [celdaActiva, ocupanteActivo, incidenteForm, addIncidente]);

  const activeFilters = [search, filterTipo !== "Todos" ? filterTipo : ""].filter(Boolean).length;

  /* Sugerencias del campo Conductor: nombres de conductores reales ya registrados en el
     módulo Conductores (en vez de la lista genérica de ejemplo), para que el operador
     elija uno existente en lugar de escribir uno cualquiera. Si el conductor buscado no
     aparece, se puede seguir escribiendo su nombre para registrarlo como uno nuevo. */
  const conductoresSugeridos = useMemo(
    () => Array.from(new Set(conductores.filter(c => c.estado === "activo").map(c => c.nombre))).sort((a, b) => a.localeCompare(b, "es")),
    [conductores]
  );

  /* Búsqueda en vivo del vehículo/conductor asociados a la placa escrita: si la placa ya
     está registrada, se muestra (y bloquea) el nombre de su conductor real en lugar de dejar
     que el operador reescriba uno cualquiera; si no se encuentra, el formulario queda libre
     para registrar la placa como un vehículo nuevo. */
  const vehiculoEncontrado = useMemo(() => {
    const placa = vehiculoForm.placa.trim().toUpperCase();
    if (!validarPlacaColombiana(placa)) return null;
    return vehiculos.find(v => v.placa === placa) ?? null;
  }, [vehiculoForm.placa, vehiculos]);

  const conductorEncontrado = useMemo(() => {
    if (!vehiculoEncontrado) return null;
    return conductores.find(c => c.id === vehiculoEncontrado.conductorId) ?? null;
  }, [vehiculoEncontrado, conductores]);

  const conductorAutoRef = useRef(false);
  useEffect(() => {
    if (conductorEncontrado) {
      conductorAutoRef.current = true;
      setVehiculoForm(prev => prev.conductor === conductorEncontrado.nombre ? prev : { ...prev, conductor: conductorEncontrado.nombre });
    } else if (conductorAutoRef.current) {
      conductorAutoRef.current = false;
      setVehiculoForm(prev => (prev.conductor ? { ...prev, conductor: "" } : prev));
    }
  }, [conductorEncontrado]);

  /* Reconoce al conductor no solo por la placa (conductorEncontrado) sino también cuando el
     operador escribe/elige el nombre exacto de alguien ya registrado en el módulo Conductores
     (p. ej. trae un vehículo nuevo, distinto a los que ya tiene a su nombre). Con cualquiera de
     las dos vías se le puede mostrar toda su flota ya registrada, no solo la placa actual. */
  const conductorIdentificado = useMemo(() => {
    if (conductorEncontrado) return conductorEncontrado;
    const nombre = vehiculoForm.conductor.trim().toLowerCase();
    if (!nombre) return null;
    return conductores.find(c => c.nombre.trim().toLowerCase() === nombre) ?? null;
  }, [conductorEncontrado, vehiculoForm.conductor, conductores]);

  const vehiculosConductor = useMemo(() => {
    if (!conductorIdentificado) return [];
    return vehiculos.filter(v => v.conductorId === conductorIdentificado.id);
  }, [conductorIdentificado, vehiculos]);

  /* Validación en vivo del formulario de registro de vehículo: la placa debe coincidir
     con el tipo de la celda seleccionada (carro/moto) y el conductor debe tener nombre completo
     (o, si ya es un conductor real identificado —por placa o por nombre exacto—, ese nombre ya
     es válido de por sí, aunque no cumpla el formato "nombre apellido" del validador genérico:
     el módulo Conductores permite nombres como "Carlos López M.", con inicial abreviada). */
  const ingresoPlacaOk = celdaActiva ? validarPlacaPorTipo(vehiculoForm.placa, celdaActiva.tipo) : false;
  // "Inactivo" debe bloquear de verdad: un conductor desactivado no es un nombre válido
  // para registrar, aunque el resto de su ficha (placa, nombre) sea correcto.
  const ingresoConductorOk = conductorIdentificado
    ? conductorIdentificado.estado === "activo"
    : validarNombreConductor(vehiculoForm.conductor);
  const parqueaderoIngresoActivo = parqueaderoActivo?.estado === "activo";
  const ingresoValid = ingresoPlacaOk && ingresoConductorOk && parqueaderoIngresoActivo;
  const ingresoPlacaHint = celdaActiva
    ? (celdaActiva.tipo === "moto" ? "Formato moto: 3 letras + 2 números + letra final opcional (ABC12D o ABC12)"
      : celdaActiva.tipo === "carro" ? "Formato carro: 3 letras + 3 números (ABC123)"
      : "Formato: ABC123 (carro) o ABC12D / ABC12 (moto)")
    : "";

  return (
    <>
      <style>{parqueaderosStyles}</style>

      <div className="pq-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── HERO ── */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: "linear-gradient(135deg,#39A900,#2D7D00)", padding: "1.4rem 1.6rem", color: "#fff" }}>
          <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
          <div className="pq-hero-banner" style={{ position: "relative", zIndex: 2 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                <Shield size={11} /> Gestión Institucional SENA
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>Gestión de Parqueaderos</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>Registro óptico automatizado, celdas de cortesía institucional y reportes de ocupación en tiempo real.</p>
            </div>
            <div className="pq-hero-stats">
              {[
                { label: "Disponibles",   value: stats.libres,    dot: CELDA_CONFIG.disponible.dotColor },
                { label: "Ocupadas",      value: stats.ocupadas,  dot: CELDA_CONFIG.no_disponible.dotColor },
                { label: "Reservadas",    value: stats.reservadas, dot: CELDA_CONFIG.reservada.dotColor },
                { label: "Ocupación",     value: `${stats.pct}%`, dot: "#94A3B8" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <div className="pq-topbar">
          <div className="pq-search-wrap">
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por placa, celda, conductor..." style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textLight }}><X size={14} /></button>}
          </div>

          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}>
            <option value="Todos">Todos los tipos</option>
            {TIPOS_PARQUEADERO.map(t => <option key={t} value={t}>{capitalizar(t)}</option>)}
          </select>

          <div className="pq-view-toggle">
            {([{ id: "table", label: "Lista", icon: <LayoutGrid size={14} /> }, { id: "map", label: "Plano", icon: <MapIcon size={14} /> }] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 12, fontWeight: 700, border: "none", background: activeTab === t.id ? C.primary : "transparent", color: activeTab === t.id ? "#fff" : C.textLight, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {activeFilters > 0 && <button onClick={() => { setSearch(""); setFilterTipo("Todos"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.textLight, fontSize: 12, fontFamily: "inherit" }}><X size={14} />Limpiar</button>}

          <button onClick={() => setOpenModal("smartAssign")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Zap size={14} color="#F59E0B" />Asignación Inteligente
          </button>
          <button onClick={() => { setPqForm({ nombre: "", bloque: "", tipo: "general", direccion: "", horaInicio: "06:00", horaFin: "22:00", celdasCarros: 8, celdasMotos: 2, celdasMovilidadReducida: 1, descripcion: "" }); setFormError(null); setOpenModal("create"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>
            <Plus size={15} />Nuevo Parqueadero
          </button>
        </div>

        {activeFilters > 0 && <p style={{ fontSize: 11, color: C.textLight }}>Mostrando <strong>{filteredPqsConCeldas.length}</strong> resultado{filteredPqsConCeldas.length !== 1 ? "s" : ""}</p>}

        {/* ── CONTENIDO POR TAB ── */}
        {activeTab === "table" && (
          <ParqueaderosTable
            parqueaderos={filteredPqsConCeldas}
            celdas={search.trim() ? filteredCeldas : celdas}
            getOcupante={getOcupante}
            onEdit={pq => {
              setPqEditId(pq.id);
              setPqForm({ nombre: pq.nombre, bloque: pq.bloque, tipo: pq.tipo, direccion: pq.direccion, horaInicio: pq.horaInicio, horaFin: pq.horaFin, celdasCarros: pq.celdasCarros, celdasMotos: pq.celdasMotos, celdasMovilidadReducida: pq.celdasMovilidadReducida, descripcion: pq.descripcion });
              setFormError(null); setOpenModal("edit");
            }}
            onToggleEstado={handleToggleEstadoParqueadero}
            onCellClick={handleCellClick}
            cellMatchesSearch={cellMatchesSearch}
          />
        )}

        {activeTab === "map" && (
          <ParkingMap parqueaderos={filteredPqsConCeldas} celdas={celdas} getOcupante={getOcupante} onCellClick={handleCellClick} cellMatchesSearch={cellMatchesSearch} />
        )}
      </div>

      {/* ══ MODALES ══ */}

      <ParqueaderoFormModal
        open={openModal === "create" || openModal === "edit"}
        isEdit={openModal === "edit"}
        pqForm={pqForm}
        setPqForm={setPqForm}
        formError={formError}
        onClose={() => setOpenModal(null)}
        onSubmit={openModal === "edit" ? handleEdit : handleCreate}
      />

      <IngresoModal
        open={openModal === "ingreso"}
        celdaActiva={celdaActiva}
        vehiculoForm={vehiculoForm}
        setVehiculoForm={setVehiculoForm}
        placaError={placaError}
        onPlacaChange={() => setPlacaError(null)}
        ingresoPlacaOk={ingresoPlacaOk}
        ingresoConductorOk={ingresoConductorOk}
        ingresoValid={ingresoValid}
        ingresoPlacaHint={ingresoPlacaHint}
        vehiculoEncontrado={vehiculoEncontrado}
        conductorEncontrado={conductorEncontrado}
        conductorIdentificado={conductorIdentificado}
        conductoresSugeridos={conductoresSugeridos}
        vehiculosConductor={vehiculosConductor}
        parqueaderoInactivo={!parqueaderoIngresoActivo}
        onClose={() => setOpenModal(null)}
        onOpenScanner={() => { setScannerOrigin("ingreso"); setOpenModal("scanner"); }}
        onSubmit={registrarVehiculo}
      />

      <CeldaInfoModal
        open={openModal === "info"}
        celdaActiva={celdaActiva}
        ocupanteActivo={ocupanteActivo}
        reservaActiva={reservaActiva}
        vehiculoReservado={vehiculoReservado}
        parqueaderoActivo={parqueaderoActivo}
        onClose={() => setOpenModal(null)}
        onCancelarReserva={handleCancelarReserva}
        onEstacionarOficial={() => { setVehiculoForm({ placa: "", conductor: "", esOficial: true, marca: "", modelo: "", color: "" }); setOpenModal("ingreso"); }}
        onNavigateConductor={(nombre) => navigate(`/app/conductores?q=${encodeURIComponent(nombre)}`)}
        onLiberar={handleRequestLiberar}
        onReportarIncidente={() => setOpenModal("incidente")}
        onEstacionarVehiculo={() => { setVehiculoForm({ placa: "", conductor: "", esOficial: false, marca: "", modelo: "", color: "" }); setOpenModal("ingreso"); }}
        onReservarCelda={() => {
          if (celdaActiva) openReservaFromCelda(celdaActiva);
        }}
      />

      <ReservaModal
        open={openModal === "reserva"}
        celdaActiva={celdaActiva}
        parqueaderoActivo={parqueaderoActivo}
        vehiculos={vehiculos}
        reservaForm={reservaForm}
        setReservaForm={setReservaForm}
        reservaError={reservaError}
        onClose={() => setOpenModal(null)}
        onSubmit={handleCrearReserva}
      />

      <IncidenteModal
        open={openModal === "incidente"}
        celdaActiva={celdaActiva}
        ocupanteActivo={ocupanteActivo}
        parqueaderoActivo={parqueaderoActivo}
        incidenteForm={incidenteForm}
        setIncidenteForm={setIncidenteForm}
        incidenteError={incidenteError}
        onFileChange={handleIncidenteFileChange}
        onRemoveEvidencia={removeIncidenteEvidencia}
        onClose={() => { setOpenModal(null); setIncidenteError(null); setIncidenteForm(prev => ({ ...prev, evidencia: '' })); }}
        onSubmit={registrarIncidente}
      />

      <ScannerModal
        open={openModal === "scanner"}
        videoRef={videoRef}
        guiaRef={guiaRef}
        camaraLista={camaraLista}
        onCamaraLista={() => setCamaraLista(true)}
        ocrLoading={ocrLoading}
        ocrError={ocrError}
        ocrFlash={ocrFlash}
        onClose={cerrarScanner}
        onCapture={handleCaptureOcr}
        onFileOCR={handleFileOCR}
        onSimOCR={handleSimOCR}
      />

      {/* ── SMART ASSIGN MODAL ── */}
      <SmartAssignModal open={openModal === "smartAssign"} parqueaderos={parqueaderos} celdas={celdas} onClose={() => { setOpenModal(null); setScannedPlate(undefined); setScannerOrigin(null); }} onAssign={handleSmartAssign} openScanner={() => { setScannerOrigin("smartAssign"); setOpenModal("scanner"); }} scannedPlate={scannedPlate} />
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Conductor } from "@/services/api/conductores";
import {
  type VehiculoForm,
  normalizarTexto, validarPlacaColombiana, validarPlacaPorTipo, validarNombreConductor, tipoVehiculoDesdePlaca,
} from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";
import type { ModalKind } from "./useModalController";

const emptyVehiculoForm = (esOficial = false): VehiculoForm => ({ placa: "", conductor: "", esOficial, marca: "", modelo: "", color: "" });

function tipoConductorDesdeParqueadero(tipoPq: string): Conductor["tipo"] {
  if (tipoPq === "docentes") return "docente";
  if (tipoPq === "administrativos") return "administrativo";
  return "visitante";
}

/** Formulario de registro/estacionamiento de un vehículo en una celda: identificación de
 * conductor/vehículo (con autocompletado), validación en vivo y el registro final. */
export function useIngresoVehiculo(
  data: ParqueaderosData,
  celdaActiva: Celda | null,
  parqueaderoActivo: Parqueadero | null,
  setOpenModal: (m: ModalKind) => void
) {
  const { conductores, vehiculos, controlesSalida, reservas, addConductor, addVehiculo, addControlSalida, updateCelda, updateReserva } = data;

  const [vehiculoForm, setVehiculoForm] = useState<VehiculoForm>(emptyVehiculoForm());
  const [placaError, setPlacaError] = useState<string | null>(null);

  const resolverConductor = async (nombre: string, tipo: Conductor["tipo"]): Promise<string> => {
    const existente = conductores.find((c) => c.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    if (existente) return existente.id;
    return addConductor({
      usuarioId: "", nombre, tipoConductor: "aprendiz", centroFormacion: "",
      discapacidad: false, estado: "activo", tipo, email: "",
    });
  };

  const resolverVehiculo = async (
    placa: string, conductorId: string, tipo: "carro" | "moto", parqueaderoId: string, celdaId: string,
    fechaEntrada: string, datosVehiculo?: { marca?: string; modelo?: string; color?: string }
  ): Promise<string> => {
    const existente = vehiculos.find((v) => v.placa === placa);
    if (existente) return existente.id;
    return addVehiculo({
      conductorId, placa, tipo,
      marca: datosVehiculo?.marca?.trim() || "", modelo: datosVehiculo?.modelo?.trim() || "",
      año: new Date().getFullYear(), color: datosVehiculo?.color?.trim() || "",
      descripcion: "", estado: "activo", parqueaderoId, celdaId, fechaEntrada,
    });
  };

  const registrarEnCelda = async (
    celda: Celda, placaRaw: string, conductorRaw: string, _esOficial: boolean,
    datosVehiculo?: { marca?: string; modelo?: string; color?: string }
  ): Promise<boolean> => {
    const placa = placaRaw.trim().toUpperCase();
    const conductorNombre = normalizarTexto(conductorRaw, 60);
    if (!placa || !conductorNombre) { setPlacaError("Completa todos los campos."); return false; }
    if (!validarPlacaColombiana(placa)) { setPlacaError("Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto)."); return false; }
    // Un conductor ya registrado en el módulo Conductores es válido de por sí, aunque su
    // nombre no cumpla el formato "nombre apellido" del validador genérico (p. ej. "Carlos
    // López M.", con inicial abreviada). El validador de formato solo aplica a nombres nuevos.
    const conductorExistente = conductores.find((c) => c.nombre.trim().toLowerCase() === conductorNombre.toLowerCase());
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

    const yaActivo = controlesSalida.some((cs) => cs.estado === "en_parqueadero" && cs.celdaId !== celda.id && vehiculos.find((v) => v.id === cs.vehiculoId)?.placa === placa);
    if (yaActivo) { setPlacaError("Este vehículo ya está estacionado en otra celda."); return false; }

    const tipoConductor = tipoConductorDesdeParqueadero(pq?.tipo || "");
    const conductorId = await resolverConductor(conductorNombre, tipoConductor);
    const fechaEntrada = new Date().toISOString().slice(0, 16);
    const vehiculoTipo: "carro" | "moto" = tipoPlaca === "moto" ? "moto" : "carro";
    const vehiculoId = await resolverVehiculo(placa, conductorId, vehiculoTipo, celda.parqueaderoId, celda.id, fechaEntrada, datosVehiculo);

    const reservaPendiente = reservas.find((r) => r.celdaId === celda.id && (r.estado === "pendiente" || r.estado === "activa"));
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

  const abrirIngresoOficial = () => { setVehiculoForm(emptyVehiculoForm(true)); setOpenModal("ingreso"); };
  const abrirIngresoVisitante = () => { setVehiculoForm(emptyVehiculoForm(false)); setOpenModal("ingreso"); };

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

  const conductorEncontrado = useMemo(() => {
    if (!vehiculoEncontrado) return null;
    return conductores.find((c) => c.id === vehiculoEncontrado.conductorId) ?? null;
  }, [vehiculoEncontrado, conductores]);

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

  /* Reconoce al conductor no solo por la placa (conductorEncontrado) sino también cuando el
     operador escribe/elige el nombre exacto de alguien ya registrado en el módulo Conductores
     (p. ej. trae un vehículo nuevo, distinto a los que ya tiene a su nombre). Con cualquiera de
     las dos vías se le puede mostrar toda su flota ya registrada, no solo la placa actual. */
  const conductorIdentificado = useMemo(() => {
    if (conductorEncontrado) return conductorEncontrado;
    const nombre = vehiculoForm.conductor.trim().toLowerCase();
    if (!nombre) return null;
    return conductores.find((c) => c.nombre.trim().toLowerCase() === nombre) ?? null;
  }, [conductorEncontrado, vehiculoForm.conductor, conductores]);

  const vehiculosConductor = useMemo(() => {
    if (!conductorIdentificado) return [];
    return vehiculos.filter((v) => v.conductorId === conductorIdentificado.id);
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

  return {
    vehiculoForm, setVehiculoForm, placaError, setPlacaError,
    registrarEnCelda, registrarVehiculo, abrirIngresoOficial, abrirIngresoVisitante,
    conductoresSugeridos, vehiculoEncontrado, conductorEncontrado, conductorIdentificado, vehiculosConductor,
    ingresoPlacaOk, ingresoConductorOk, ingresoValid, ingresoPlacaHint, parqueaderoIngresoActivo,
  };
}

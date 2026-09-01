import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import {
  validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca,
} from "../lib/helpers";
import type { ConductoresData } from "./useConductoresData";

interface AgregarVehiculoForm {
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  color: string;
  descripcionVehiculo: string;
}

const emptyForm = (): AgregarVehiculoForm => ({ placa: "", tipoVehiculo: "carro", marca: "", color: "", descripcionVehiculo: "" });

export type ModoAgregarVehiculo = "nuevo" | "existente";

/**
 * Agregar un vehículo MÁS a un conductor que ya existe, sin pasar por su
 * ficha completa. Antes la única forma de que un conductor terminara con más
 * de un vehículo era registrando una placa nueva desde el ingreso en
 * Parqueaderos (`useIngresoVehiculo`) — un conductor real puede tener carro Y
 * moto, y eso debería poder registrarse directo desde Conductores.
 *
 * También cubre el otro caso: vincular un vehículo YA EXISTENTE (de otro
 * conductor) como copropietario de este — un vehículo puede tener más de un
 * dueño (p. ej. una pareja compartiendo un carro).
 */
export function useAgregarVehiculo(
  data: Pick<ConductoresData, "vehiculos" | "addVehiculo"> & { agregarPropietario: (vehiculoId: string, conductorId: string) => Promise<unknown> },
  /** Se dispara al terminar con éxito cualquiera de los dos modos (vehículo nuevo creado, o
   *  uno existente vinculado como copropietario), con ese vehículo — lo usa el asistente de
   *  "Estacionar Vehículo" para seleccionarlo de inmediato sin que el operador tenga que
   *  volver a buscarlo. */
  onCreated?: (vehiculo: Vehiculo) => void
) {
  const [open, setOpen] = useState(false);
  const [conductorActivo, setConductorActivo] = useState<Conductor | null>(null);
  const [modo, setModo] = useState<ModoAgregarVehiculo>("nuevo");
  const [form, setForm] = useState<AgregarVehiculoForm>(emptyForm());
  const [touched, setTouched] = useState(false);
  const [busquedaExistente, setBusquedaExistente] = useState("");
  const [vehiculoExistenteId, setVehiculoExistenteId] = useState("");

  const abrir = useCallback((conductor: Conductor) => {
    setConductorActivo(conductor);
    setModo("nuevo");
    setForm(emptyForm());
    setTouched(false);
    setBusquedaExistente("");
    setVehiculoExistenteId("");
    setOpen(true);
  }, []);

  const placasOcupadas = useMemo(
    () => new Set(data.vehiculos.map((v) => v.placa.toUpperCase().trim())),
    [data.vehiculos]
  );

  interface AgregarVehiculoErrors {
    placa?: string;
    marca?: string;
    color?: string;
  }

  const validar = useCallback((f: AgregarVehiculoForm): AgregarVehiculoErrors => {
    const errores: AgregarVehiculoErrors = {};
    const placa = f.placa.trim().toUpperCase();
    if (!placa) {
      errores.placa = "La placa es obligatoria";
    } else if (!validarPlacaColombiana(placa)) {
      errores.placa = "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
    } else if ((f.tipoVehiculo === "carro" || f.tipoVehiculo === "moto") && !validarPlacaPorTipo(placa, f.tipoVehiculo)) {
      const tipoDetectado = tipoVehiculoDesdePlaca(placa);
      errores.placa = `Seleccionaste "${f.tipoVehiculo}", pero la placa tiene formato de ${tipoDetectado}.`;
    } else if (placasOcupadas.has(placa)) {
      errores.placa = "Esta placa ya está registrada en otro vehículo";
    }

    if (!f.marca.trim()) errores.marca = "La marca es obligatoria";
    if (!f.color.trim()) errores.color = "El color es obligatorio";

    return errores;
  }, [placasOcupadas]);

  // Validación en tiempo real, igual que el resto de formularios de la app:
  // se recalcula en cada cambio, pero solo se muestra tras el primer intento.
  const errors: AgregarVehiculoErrors = modo === "nuevo" && touched ? validar(form) : {};

  const markTouched = useCallback(() => setTouched(true), []);

  // Vehículos que este conductor todavía NO tiene vinculados (ni como principal ni como
  // copropietario) — a esos es a los que tiene sentido ofrecerle vincularse como copropietario.
  const vehiculosVinculables = useMemo(() => {
    if (!conductorActivo) return [];
    const q = busquedaExistente.trim().toLowerCase();
    return data.vehiculos.filter((v) => {
      if (v.conductorId === conductorActivo.id) return false;
      if (!q) return true;
      return v.placa.toLowerCase().includes(q) || v.marca.toLowerCase().includes(q) || v.conductorNombre.toLowerCase().includes(q);
    });
  }, [data.vehiculos, conductorActivo, busquedaExistente]);

  const guardar = useCallback(async () => {
    if (!conductorActivo) return;

    if (modo === "existente") {
      if (!vehiculoExistenteId) { toast.error("Selecciona un vehículo para vincular"); return; }
      const vehiculoVinculado = data.vehiculos.find((v) => v.id === vehiculoExistenteId);
      try {
        await data.agregarPropietario(vehiculoExistenteId, conductorActivo.id);
        toast.success(`Vehículo vinculado a ${conductorActivo.nombre} como copropietario`);
        setOpen(false);
        if (vehiculoVinculado) onCreated?.(vehiculoVinculado);
      } catch (error) {
        console.error("Error linking copropietario:", error);
      }
      return;
    }

    setTouched(true);
    if (Object.values(validar(form)).some(Boolean)) return;

    try {
      const creado = await data.addVehiculo({
        conductorId: conductorActivo.id,
        conductorNombre: conductorActivo.nombre,
        placa: form.placa.trim().toUpperCase(),
        tipo: form.tipoVehiculo,
        marca: form.marca.trim(),
        linea: "",
        modelo: null,
        color: form.color.trim(),
        descripcion: form.descripcionVehiculo.trim(),
        estado: "activo",
      });
      toast.success(`Vehículo agregado a ${conductorActivo.nombre}`);
      setOpen(false);
      onCreated?.(creado);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error adding vehiculo:", error);
    }
  }, [form, conductorActivo, data, validar, modo, vehiculoExistenteId, onCreated]);

  return {
    open, setOpen, conductorActivo, modo, setModo, form, setForm,
    errors, touched, markTouched, abrir, guardar,
    busquedaExistente, setBusquedaExistente, vehiculoExistenteId, setVehiculoExistenteId, vehiculosVinculables,
  };
}

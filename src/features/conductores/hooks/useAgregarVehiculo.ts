import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import {
  sanitizeText, validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca,
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
  data: Pick<ConductoresData, "vehiculos" | "addVehiculo"> & { agregarPropietario: (vehiculoId: string, conductorId: string) => Promise<unknown> }
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

  const validar = useCallback((f: AgregarVehiculoForm): string | null => {
    const placa = f.placa.trim().toUpperCase();
    if (!placa) return "La placa es obligatoria";
    if (!validarPlacaColombiana(placa)) return "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
    if ((f.tipoVehiculo === "carro" || f.tipoVehiculo === "moto") && !validarPlacaPorTipo(placa, f.tipoVehiculo)) {
      const tipoDetectado = tipoVehiculoDesdePlaca(placa);
      return `Seleccionaste "${f.tipoVehiculo}", pero la placa tiene formato de ${tipoDetectado}.`;
    }
    if (placasOcupadas.has(placa)) return "Esta placa ya está registrada en otro vehículo";
    return null;
  }, [placasOcupadas]);

  // Validación en tiempo real, igual que el resto de formularios de la app:
  // se recalcula en cada cambio, pero solo se muestra tras el primer intento.
  const error = modo === "nuevo" && touched ? validar(form) : null;

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
      try {
        await data.agregarPropietario(vehiculoExistenteId, conductorActivo.id);
        toast.success(`Vehículo vinculado a ${conductorActivo.nombre} como copropietario`);
        setOpen(false);
      } catch (error) {
        console.error("Error linking copropietario:", error);
      }
      return;
    }

    setTouched(true);
    if (validar(form)) return;

    try {
      await data.addVehiculo({
        conductorId: conductorActivo.id,
        conductorNombre: sanitizeText(conductorActivo.nombre),
        placa: form.placa.trim().toUpperCase(),
        tipo: form.tipoVehiculo,
        marca: sanitizeText(form.marca.trim()),
        linea: "",
        modelo: null,
        color: sanitizeText(form.color.trim()),
        descripcion: sanitizeText(form.descripcionVehiculo.trim()),
        estado: "activo",
      });
      toast.success(`Vehículo agregado a ${conductorActivo.nombre}`);
      setOpen(false);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error adding vehiculo:", error);
    }
  }, [form, conductorActivo, data, validar, modo, vehiculoExistenteId]);

  return {
    open, setOpen, conductorActivo, modo, setModo, form, setForm,
    error, touched, markTouched, abrir, guardar,
    busquedaExistente, setBusquedaExistente, vehiculoExistenteId, setVehiculoExistenteId, vehiculosVinculables,
  };
}

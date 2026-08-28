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

/**
 * Agregar un vehículo MÁS a un conductor que ya existe, sin pasar por su
 * ficha completa. Antes la única forma de que un conductor terminara con más
 * de un vehículo era registrando una placa nueva desde el ingreso en
 * Parqueaderos (`useIngresoVehiculo`) — un conductor real puede tener carro Y
 * moto, y eso debería poder registrarse directo desde Conductores.
 */
export function useAgregarVehiculo(data: Pick<ConductoresData, "vehiculos" | "addVehiculo">) {
  const [open, setOpen] = useState(false);
  const [conductorActivo, setConductorActivo] = useState<Conductor | null>(null);
  const [form, setForm] = useState<AgregarVehiculoForm>(emptyForm());
  const [touched, setTouched] = useState(false);

  const abrir = useCallback((conductor: Conductor) => {
    setConductorActivo(conductor);
    setForm(emptyForm());
    setTouched(false);
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
  const error = touched ? validar(form) : null;

  const markTouched = useCallback(() => setTouched(true), []);

  const guardar = useCallback(async () => {
    setTouched(true);
    if (validar(form)) return;
    if (!conductorActivo) return;

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
  }, [form, conductorActivo, data, validar]);

  return {
    open, setOpen, conductorActivo, form, setForm,
    error, touched, markTouched, abrir, guardar,
  };
}

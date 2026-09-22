import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import {
  validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca,
} from "@/features/conductores/lib/helpers";
import type { ConductoresData } from "@/features/conductores";

interface CrearMiVehiculoForm {
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  descripcionVehiculo: string;
}

const emptyForm = (): CrearMiVehiculoForm => ({
  placa: "", tipoVehiculo: "carro", marca: "", linea: "", modelo: "", color: "", descripcionVehiculo: "",
});

interface Conflicto {
  vehiculoId: string;
  propietario: string;
}

/** Errores 409 de `POST /vehiculos` (placa duplicada) traen el detalle del dueño actual en
 *  `error.data` -- ver services/core/http.ts, que ya no lo descarta. */
interface ErrorConData extends Error {
  status?: number;
  data?: { vehiculo_id?: string | number; conductor_principal_id?: string | number; conductor_principal_nombre?: string };
}

/**
 * Crear MI PROPIO vehículo (rol Conductor), o vincularme como copropietario de uno que ya
 * existe a nombre de otro conductor.
 *
 * A diferencia de `useAgregarVehiculo` (que usa el Admin para dar de alta o vincular
 * vehículos EN NOMBRE de cualquier conductor, con un buscador libre sobre toda la flota),
 * aquí no hay selector de vehículos ajenos: el conductor no puede ni debe navegar la lista
 * completa de vehículos de otras personas. La única vía a un vehículo que no es suyo es el
 * conflicto que el propio backend revela al intentar crear una placa ya registrada
 * (`vehiculo.service.js::create`, 409 con `{vehiculo_id, conductor_principal_nombre}`).
 */
export function useCrearMiVehiculo(
  data: Pick<ConductoresData, "vehiculos" | "addVehiculo" | "agregarPropietario">,
  miConductor: Conductor | null,
  onCreated?: (vehiculo: Vehiculo) => void
) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CrearMiVehiculoForm>(emptyForm());
  const [touched, setTouched] = useState(false);
  const [conflicto, setConflicto] = useState<Conflicto | null>(null);
  const [vinculando, setVinculando] = useState(false);

  const abrir = useCallback(() => {
    setForm(emptyForm());
    setTouched(false);
    setConflicto(null);
    setOpen(true);
  }, []);

  const placasOcupadas = useMemo(
    () => new Set(data.vehiculos.map((v) => v.placa.toUpperCase().trim())),
    [data.vehiculos]
  );

  interface Errores {
    placa?: string;
    marca?: string;
    modelo?: string;
    color?: string;
  }

  const validar = useCallback((f: CrearMiVehiculoForm): Errores => {
    const errores: Errores = {};
    const placa = f.placa.trim().toUpperCase();
    if (!placa) {
      errores.placa = "La placa es obligatoria";
    } else if (!validarPlacaColombiana(placa)) {
      errores.placa = "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
    } else if ((f.tipoVehiculo === "carro" || f.tipoVehiculo === "moto") && !validarPlacaPorTipo(placa, f.tipoVehiculo)) {
      const tipoDetectado = tipoVehiculoDesdePlaca(placa);
      errores.placa = `Seleccionaste "${f.tipoVehiculo}", pero la placa tiene formato de ${tipoDetectado}.`;
    } else if (placasOcupadas.has(placa)) {
      // Aviso solo local (más rápido que esperar al submit); el backend es quien decide de
      // verdad -- puede que esa placa ya sea TUYA (copropietario) y no un conflicto real.
      errores.placa = undefined;
    }

    if (!f.marca.trim()) errores.marca = "La marca es obligatoria";
    if (!f.color.trim()) errores.color = "El color es obligatorio";
    const modelo = f.modelo.trim();
    if (modelo) {
      const anio = Number(modelo);
      const anioMaximo = new Date().getFullYear() + 1;
      if (!Number.isInteger(anio) || anio < 1950 || anio > anioMaximo) {
        errores.modelo = `El modelo es el año del vehículo: entre 1950 y ${anioMaximo}`;
      }
    }
    return errores;
  }, [placasOcupadas]);

  const errors: Errores = touched ? validar(form) : {};

  const markTouched = useCallback(() => setTouched(true), []);

  const guardar = useCallback(async () => {
    if (!miConductor) {
      toast.error("Tu cuenta no tiene un perfil de conductor vinculado.");
      return;
    }

    setTouched(true);
    if (Object.values(validar(form)).some(Boolean)) return;

    setConflicto(null);
    try {
      const creado = await data.addVehiculo({
        conductorId: miConductor.id,
        conductorNombre: miConductor.nombre,
        placa: form.placa.trim().toUpperCase(),
        tipo: form.tipoVehiculo,
        marca: form.marca.trim(),
        linea: form.linea.trim(),
        modelo: form.modelo ? Number(form.modelo) : null,
        color: form.color.trim(),
        descripcion: form.descripcionVehiculo.trim(),
        estado: "activo",
      });
      toast.success("Vehículo agregado");
      setOpen(false);
      onCreated?.(creado);
    } catch (error) {
      const e = error as ErrorConData;
      // El toast del mensaje ("La placa ya está registrada") ya lo muestra el manejador
      // centralizado de mutaciones (queryFactory.ts); aquí solo se agrega la acción de
      // seguimiento cuando el backend identificó de quién es la placa.
      if (e.status === 409 && e.data?.vehiculo_id) {
        setConflicto({
          vehiculoId: String(e.data.vehiculo_id),
          propietario: e.data.conductor_principal_nombre || "otro conductor",
        });
      } else {
        console.error("Error creando vehículo propio:", error);
      }
    }
  }, [form, miConductor, data, validar, onCreated]);

  const vincularmeComoCopropietario = useCallback(async () => {
    if (!miConductor || !conflicto) return;
    setVinculando(true);
    try {
      await data.agregarPropietario(conflicto.vehiculoId, miConductor.id);
      toast.success("Vehículo vinculado a tu cuenta como copropietario");
      setOpen(false);
      setConflicto(null);
      const vinculado = data.vehiculos.find((v) => v.id === conflicto.vehiculoId);
      if (vinculado) onCreated?.(vinculado);
    } catch (error) {
      console.error("Error vinculando copropietario:", error);
    } finally {
      setVinculando(false);
    }
  }, [conflicto, miConductor, data, onCreated]);

  const isValid = Object.values(validar(form)).every((v) => !v);

  return {
    open, setOpen, abrir, form, setForm, errors, touched, markTouched, isValid,
    guardar, conflicto, setConflicto, vincularmeComoCopropietario, vinculando,
  };
}

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useCreateVehiculo, useVehiculos, validarDatosVehiculo, type ErroresVehiculo } from "@/features/conductores";

interface RegistrarVehiculoForm {
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  descripcionVehiculo: string;
}

const emptyForm = (): RegistrarVehiculoForm => ({
  placa: "", tipoVehiculo: "carro", marca: "", linea: "", modelo: "", color: "", descripcionVehiculo: "",
});

/**
 * Registrar un vehículo propio desde el Dashboard del conductor. Antes la única forma
 * de que un usuario de Comunidad SENA sumara un vehículo era pedírselo a portería al
 * ingresar (ver useAgregarVehiculo, en Conductores). Reutiliza la misma validación y
 * el mismo endpoint, pero sin el modo "vincular existente": ese modo lista vehículos
 * de OTROS conductores, algo que este rol no tiene por qué ver.
 */
export function useRegistrarVehiculoConductor(miConductor: Conductor | null) {
  const { data: vehiculos = [] } = useVehiculos();
  const createVehiculo = useCreateVehiculo();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RegistrarVehiculoForm>(emptyForm());
  const [touched, setTouched] = useState(false);

  const abrir = useCallback(() => {
    setForm(emptyForm());
    setTouched(false);
    setOpen(true);
  }, []);

  const placasOcupadas = useMemo(
    () => new Set(vehiculos.map((v) => v.placa.toUpperCase().trim())),
    [vehiculos]
  );

  const errors: ErroresVehiculo = touched ? validarDatosVehiculo(form, placasOcupadas) : {};

  const markTouched = useCallback(() => setTouched(true), []);

  const guardar = useCallback(async () => {
    if (!miConductor) return;
    setTouched(true);
    if (Object.values(validarDatosVehiculo(form, placasOcupadas)).some(Boolean)) return;

    try {
      await createVehiculo.mutateAsync({
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
      toast.success("Vehículo registrado");
      setOpen(false);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts).
      console.error("Error registrando vehiculo propio:", error);
    }
  }, [form, miConductor, placasOcupadas, createVehiculo]);

  return {
    open, setOpen, abrir, form, setForm, errors, touched, markTouched, guardar,
    guardando: createVehiculo.isPending,
  };
}

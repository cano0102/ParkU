import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca } from "../lib/helpers";
import type { VehiculoFormState } from "../components/VehiculoFormModal";
import { useConductoresData } from "./useConductoresData";
import { useConductoresFilters } from "./useConductoresFilters";
import { useConductorForm } from "./useConductorForm";
import { useAgregarVehiculo } from "./useAgregarVehiculo";

/** Compone datos, filtros y formulario de Conductores, y resuelve lo que los cruza:
 * los dos modales de "ver" (vehículo/detalle), agregar vehículo y el toggle de estado. */
export function useConductoresPage() {
  const data = useConductoresData();
  const filters = useConductoresFilters(data);
  const form = useConductorForm(data);
  const agregarVehiculo = useAgregarVehiculo(data);

  // Edición y borrado de un vehículo desde su tarjeta. El formulario del conductor ya no
  // lleva vehículo, así que esta es la única vía para corregirlo o quitarlo.
  const [vehiculoEditando, setVehiculoEditando] = useState<Vehiculo | null>(null);
  const [vehiculoForm, setVehiculoForm] = useState<VehiculoFormState | null>(null);
  const [vehiculoTouched, setVehiculoTouched] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(null);
  // El aviso de "esta persona se quedó sin cuenta": aparece al intentar reactivarla.
  const [conductorSinCuenta, setConductorSinCuenta] = useState<Conductor | null>(null);

  const [viewVehiculoOpen, setViewVehiculoOpen] = useState(false);
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);

  // Confirmación para "quitar copropietario": es una acción destructiva y difícil de revertir
  // (el conductor pierde el vínculo con el vehículo de inmediato), así que sigue el mismo
  // patrón de confirmación de dos pasos que useControlSalidaPage.ts usa para eliminar un
  // registro (estado con el ítem pendiente de confirmar + acción que lo ejecuta).
  const [confirmQuitarCopropietario, setConfirmQuitarCopropietario] = useState<{
    vehiculo: Vehiculo;
    conductorId: string;
    conductorNombre: string;
  } | null>(null);

  const solicitarQuitarPropietario = useCallback(
    (vehiculo: Vehiculo, conductorId: string, conductorNombre: string) => {
      setConfirmQuitarCopropietario({ vehiculo, conductorId, conductorNombre });
    },
    []
  );

  const confirmQuitarCopropietarioAction = useCallback(async () => {
    if (!confirmQuitarCopropietario) return;
    const { vehiculo, conductorId, conductorNombre } = confirmQuitarCopropietario;
    try {
      await data.quitarPropietario(vehiculo.id, conductorId);
      toast.success(`${conductorNombre} ya no es copropietario de ${vehiculo.placa}`);
      setConfirmQuitarCopropietario(null);
    } catch (error) {
      // El toast de error ya lo muestra el manejador centralizado de mutaciones
      // (services/core/queryFactory.ts / useVehiculos.ts).
      console.error("Error quitando copropietario:", error);
    }
  }, [confirmQuitarCopropietario, data]);

  const openVehiculoView = useCallback((vehiculo: Vehiculo) => {
    setViewingVehiculo(vehiculo);
    setViewVehiculoOpen(true);
  }, []);

  const openConductorDetail = useCallback((conductor: Conductor) => {
    setViewingConductor(conductor);
    setViewDetailOpen(true);
  }, []);

  const handleToggleEstado = useCallback(
    async (id: string, currentEstado: "activo" | "inactivo") => {
      const nuevoEstado = currentEstado === "activo" ? "inactivo" : "activo";
      const conductor = data.conductores.find((c) => c.id === id);

      // Reactivar a alguien que se quedó sin cuenta (porque la suya se eliminó) no se hace a
      // ciegas: el backend lo rechaza, así que se avisa antes y se ofrece vincularle otra.
      // Los visitantes nunca tuvieron cuenta, así que a ellos no se les pregunta.
      const esVisitante = (conductor?.tipoUsuarioNombre || "").trim().toLowerCase() === "visitante";
      if (nuevoEstado === "activo" && conductor && !conductor.usuarioId && !esVisitante) {
        setConductorSinCuenta(conductor);
        return;
      }

      try {
        await data.updateConductor(id, { estado: nuevoEstado });
        toast.success(`Conductor ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
      } catch (error) {
        // El toast de error ya lo muestra el manejador centralizado de mutaciones
        // (services/core/queryFactory.ts).
        console.error("Error toggling status:", error);
      }
    },
    [data]
  );

  /** Acepta el aviso: abre la edición de esa ficha para vincularle una cuenta. */
  const vincularCuentaYActivar = useCallback(() => {
    if (!conductorSinCuenta) return;
    form.openEdit(conductorSinCuenta);
    setConductorSinCuenta(null);
  }, [conductorSinCuenta, form]);

  // ----- vehículo: editar -----
  const abrirEditarVehiculo = useCallback((vehiculo: Vehiculo) => {
    setVehiculoEditando(vehiculo);
    setVehiculoTouched(false);
    setVehiculoForm({
      placa: vehiculo.placa,
      tipoVehiculo: vehiculo.tipo,
      marca: vehiculo.marca,
      linea: vehiculo.linea ?? "",
      modelo: vehiculo.modelo ? String(vehiculo.modelo) : "",
      color: vehiculo.color,
      descripcionVehiculo: vehiculo.descripcion ?? "",
    });
  }, []);

  const erroresVehiculo = useMemo(() => {
    const errores: { placa?: string; marca?: string; modelo?: string; color?: string } = {};
    if (!vehiculoForm) return errores;
    const placa = vehiculoForm.placa.trim().toUpperCase();
    if (!placa) {
      errores.placa = "La placa es obligatoria";
    } else if (!validarPlacaColombiana(placa)) {
      errores.placa = "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
    } else if (
      (vehiculoForm.tipoVehiculo === "carro" || vehiculoForm.tipoVehiculo === "moto") &&
      !validarPlacaPorTipo(placa, vehiculoForm.tipoVehiculo)
    ) {
      errores.placa = `Seleccionaste "${vehiculoForm.tipoVehiculo}", pero la placa tiene formato de ${tipoVehiculoDesdePlaca(placa)}.`;
    } else if (data.vehiculos.some((v) => v.id !== vehiculoEditando?.id && v.placa.toUpperCase().trim() === placa)) {
      errores.placa = "Esta placa ya está registrada en otro vehículo";
    }
    if (!vehiculoForm.marca.trim()) errores.marca = "La marca es obligatoria";
    if (!vehiculoForm.color.trim()) errores.color = "El color es obligatorio";
    const modelo = vehiculoForm.modelo.trim();
    if (modelo) {
      const anio = Number(modelo);
      const anioMaximo = new Date().getFullYear() + 1;
      if (!Number.isInteger(anio) || anio < 1950 || anio > anioMaximo) {
        errores.modelo = `El modelo es el año del vehículo: entre 1950 y ${anioMaximo}`;
      }
    }
    return errores;
  }, [vehiculoForm, vehiculoEditando, data.vehiculos]);

  const guardarVehiculo = useCallback(async () => {
    if (!vehiculoEditando || !vehiculoForm) return;
    setVehiculoTouched(true);
    if (Object.keys(erroresVehiculo).length > 0) {
      toast.error(Object.values(erroresVehiculo)[0]);
      return;
    }
    try {
      await data.updateVehiculo(vehiculoEditando.id, {
        placa: vehiculoForm.placa.toUpperCase().trim(),
        tipo: vehiculoForm.tipoVehiculo,
        marca: vehiculoForm.marca.trim(),
        linea: vehiculoForm.linea.trim(),
        modelo: vehiculoForm.modelo ? Number(vehiculoForm.modelo) : null,
        color: vehiculoForm.color.trim(),
        descripcion: vehiculoForm.descripcionVehiculo.trim(),
      });
      toast.success("Vehículo actualizado correctamente");
      setVehiculoEditando(null);
      setVehiculoForm(null);
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  }, [vehiculoEditando, vehiculoForm, erroresVehiculo, data]);

  // ----- vehículo: eliminar -----
  const confirmEliminarVehiculo = useCallback(async () => {
    if (!vehiculoAEliminar) return;
    try {
      await data.removeVehiculo(vehiculoAEliminar.id);
      toast.success(`Vehículo ${vehiculoAEliminar.placa} eliminado.`);
      setVehiculoAEliminar(null);
      setViewVehiculoOpen(false);
    } catch (error) {
      // Si tiene entradas, salidas, parqueos, novedades o reservas, el backend responde 409
      // diciendo cuáles; ese mensaje lo muestra el manejador central de mutaciones.
      console.error("Error deleting vehicle:", error);
      setVehiculoAEliminar(null);
    }
  }, [vehiculoAEliminar, data]);

  return {
    data, filters, form, agregarVehiculo,
    viewVehiculoOpen, setViewVehiculoOpen, viewDetailOpen, setViewDetailOpen,
    viewingVehiculo, viewingConductor,
    openVehiculoView, openConductorDetail, handleToggleEstado,
    confirmQuitarCopropietario, setConfirmQuitarCopropietario,
    solicitarQuitarPropietario, confirmQuitarCopropietarioAction,
    vehiculoEditando, vehiculoForm, setVehiculoForm, vehiculoTouched, erroresVehiculo,
    abrirEditarVehiculo, guardarVehiculo, cerrarEditarVehiculo: () => { setVehiculoEditando(null); setVehiculoForm(null); },
    vehiculoAEliminar, setVehiculoAEliminar, confirmEliminarVehiculo,
    conductorSinCuenta, setConductorSinCuenta, vincularCuentaYActivar,
  };
}

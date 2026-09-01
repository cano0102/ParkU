import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
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

  return {
    data, filters, form, agregarVehiculo,
    viewVehiculoOpen, setViewVehiculoOpen, viewDetailOpen, setViewDetailOpen,
    viewingVehiculo, viewingConductor,
    openVehiculoView, openConductorDetail, handleToggleEstado,
    confirmQuitarCopropietario, setConfirmQuitarCopropietario,
    solicitarQuitarPropietario, confirmQuitarCopropietarioAction,
  };
}

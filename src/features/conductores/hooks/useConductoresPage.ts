import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { useConductoresData } from "./useConductoresData";
import { useConductoresFilters } from "./useConductoresFilters";
import { useConductorForm } from "./useConductorForm";

/** Compone datos, filtros y formulario de Conductores, y resuelve lo que los cruza:
 * los dos modales de "ver" (vehículo/detalle) y el toggle de estado. */
export function useConductoresPage() {
  const data = useConductoresData();
  const filters = useConductoresFilters(data);
  const form = useConductorForm(data);

  const [viewVehiculoOpen, setViewVehiculoOpen] = useState(false);
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);

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
    data, filters, form,
    viewVehiculoOpen, setViewVehiculoOpen, viewDetailOpen, setViewDetailOpen,
    viewingVehiculo, viewingConductor,
    openVehiculoView, openConductorDetail, handleToggleEstado,
  };
}

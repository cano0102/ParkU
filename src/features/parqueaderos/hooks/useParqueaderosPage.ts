import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Celda } from "@/services/api/celdas";
import { useParqueaderosData } from "./useParqueaderosData";
import { useModalController } from "./useModalController";
import { useParqueaderosFilters } from "./useParqueaderosFilters";
import { useParqueaderoForm } from "./useParqueaderoForm";
import { useIngresoVehiculo } from "./useIngresoVehiculo";
import { useOcrScanner } from "./useOcrScanner";
import { useReservaCelda } from "./useReservaCelda";
import { useIncidenteReporte } from "./useIncidenteReporte";

/** Compone todos los hooks de dominio de la página de Parqueaderos y orquesta lo que los cruza
 * (abrir una celda, mantener las estadísticas frescas mientras pasa el tiempo). */
export function useParqueaderosPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const data = useParqueaderosData();
  const modal = useModalController(data);
  const filters = useParqueaderosFilters(data, modal.getOcupante);
  const pqFormState = useParqueaderoForm(data, modal.openModal, modal.setOpenModal);
  const ingreso = useIngresoVehiculo(data, modal.celdaActiva, modal.parqueaderoActivo, modal.setOpenModal);
  const scanner = useOcrScanner(modal.celdaActiva, ingreso.setVehiculoForm, modal.openModal, modal.setOpenModal, ingreso.registrarEnCelda);
  const reserva = useReservaCelda(data, modal.celdaActiva, modal.getOcupante, data.updateControlSalida, modal.setOpenModal);
  const incidente = useIncidenteReporte(data, modal.celdaActiva, modal.ocupanteActivo, modal.setOpenModal);

  // Las celdas no cambian con el paso del tiempo por sí solas, pero una reserva que ya venció
  // sí debería reflejarse en la UI aunque nadie interactúe con la página; este tick fuerza un
  // re-render periódico para que ese vencimiento se note sin recargar.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  const handleCellClick = useCallback((celda: Celda) => {
    modal.setCeldaSeleccionadaId(celda.id);
    ingreso.setPlacaError(null);
    incidente.setIncidenteError(null);
    incidente.resetIncidenteEvidencia();

    if (celda.estado === "no_disponible") {
      const ocupante = modal.getOcupante(celda.id);
      ingreso.setVehiculoForm({
        placa: ocupante?.vehiculo.placa || "",
        conductor: ocupante?.conductor?.nombre || "",
        esOficial: ocupante?.esOficial || false,
        marca: ocupante?.vehiculo.marca || "",
        modelo: ocupante?.vehiculo.modelo || "",
        color: ocupante?.vehiculo.color || "",
      });
      modal.setOpenModal("info");
    } else if (celda.estado === "reservada") {
      ingreso.setVehiculoForm({ placa: "", conductor: "", esOficial: true, marca: "", modelo: "", color: "" });
      modal.setOpenModal("info");
    } else if (celda.estado === "mantenimiento") {
      // Quien puede gestionar celdas ve el modal (con el ajuste manual de
      // estado, para poder sacarla de mantenimiento); el resto solo recibe
      // el aviso, igual que antes.
      if (hasPermission("celdas")) {
        ingreso.setVehiculoForm({ placa: "", conductor: "", esOficial: false, marca: "", modelo: "", color: "" });
        modal.setOpenModal("info");
      } else {
        toast.info("Esta celda está en mantenimiento y no puede usarse.");
      }
    } else {
      ingreso.setVehiculoForm({ placa: "", conductor: "", esOficial: false, marca: "", modelo: "", color: "" });
      modal.setOpenModal("info");
    }
  }, [modal, ingreso, incidente, hasPermission]);

  return { navigate, hasPermission, data, modal, filters, pqFormState, ingreso, scanner, reserva, incidente, handleCellClick };
}

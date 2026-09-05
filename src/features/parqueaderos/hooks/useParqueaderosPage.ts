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
import { useConductoresData, useConductorForm, useAgregarVehiculo } from "@/features/conductores";

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

  // Sub-pasos "Crear conductor" / "Crear vehículo" del asistente de Estacionar Vehículo:
  // mismos hooks que ya usa la pantalla de Conductores (fetch ya cacheado por React Query,
  // no hay llamada de red duplicada), con un callback que selecciona lo recién creado en el
  // asistente y vuelve al modal de ingreso, sin perder la celda ni el resto del formulario.
  const conductoresData = useConductoresData();
  const conductorForm = useConductorForm(conductoresData, (conductor, vehiculo) => {
    ingreso.seleccionarConductor(conductor);
    ingreso.seleccionarVehiculo(vehiculo);
    modal.setOpenModal("ingreso");
  });
  const agregarVehiculo = useAgregarVehiculo(conductoresData, (vehiculo) => {
    // Se selecciona también a su dueño: el vehículo se acaba de registrar a nombre de
    // alguien, y volver al ingreso con el vehículo puesto pero sin conductor obligaba a
    // buscarlo otra vez.
    const duenio = conductoresData.conductores.find((c) => c.id === vehiculo.conductorId);
    if (duenio) ingreso.seleccionarConductor(duenio);
    ingreso.seleccionarVehiculo(vehiculo);
    modal.setOpenModal("ingreso");
  });

  const abrirCrearConductor = useCallback(() => {
    conductorForm.openCreate();
    modal.setOpenModal("crearConductor");
  }, [conductorForm, modal]);

  const abrirCrearVehiculo = useCallback(() => {
    if (!ingreso.conductorIdentificado) return;
    agregarVehiculo.abrir(ingreso.conductorIdentificado);
    modal.setOpenModal("crearVehiculo");
  }, [agregarVehiculo, ingreso.conductorIdentificado, modal]);

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

    if (celda.estado === "no_disponible") {
      const ocupante = modal.getOcupante(celda.id);
      ingreso.setVehiculoForm({
        placa: ocupante?.vehiculo.placa || "",
        conductor: ocupante?.conductor?.nombre || "",
        esOficial: ocupante?.esOficial || false,
        marca: ocupante?.vehiculo.marca || "",
        modelo: ocupante?.vehiculo.modelo ? String(ocupante.vehiculo.modelo) : "",
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
  }, [modal, ingreso, hasPermission]);

  return {
    navigate, hasPermission, data, modal, filters, pqFormState, ingreso, scanner, reserva, incidente, handleCellClick,
    conductorForm, agregarVehiculo, abrirCrearConductor, abrirCrearVehiculo,
  };
}

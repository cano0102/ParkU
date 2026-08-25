import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import { esPlacaOficial, type Ocupante } from "../lib/helpers";
import type { ParqueaderosData } from "./useParqueaderosData";


export type ModalKind = "create" | "edit" | "ingreso" | "info" | "scanner" | "smartAssign" | "incidente" | "reserva" | null;

/** Qué modal está abierto, qué celda está seleccionada, y los datos derivados de esa selección. */
export function useModalController(data: ParqueaderosData) {
  const { parqueaderos, celdas, conductores, vehiculos, controlesSalida, reservas } = data;

  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [celdaSeleccionadaId, setCeldaSeleccionadaId] = useState<string | null>(null);

  const getOcupante = useCallback((celdaId: string): Ocupante | null => {
    // 1. Buscar control de salida activo
    const cs = controlesSalida.find((c) => c.celdaId === celdaId && c.estado === "en_parqueadero");
    if (cs) {
      const vehiculo = vehiculos.find((v) => v.id === cs.vehiculoId);
      if (vehiculo) {
        const conductor = conductores.find((c) => c.id === vehiculo.conductorId);
        return {
          vehiculo, conductor,
          esOficial: esPlacaOficial(vehiculo.placa),
          controlId: cs.id,
          fechaEntrada: cs.fechaEntrada,
        };
      }
    }

    // 2. Si no hay control activo, buscar vehículo asociado directamente a la celda
    const vehiculoEnCelda = vehiculos.find((v) => v.celdaId === celdaId);
    if (vehiculoEnCelda) {
      const conductor = conductores.find((c) => c.id === vehiculoEnCelda.conductorId);
      return {
        vehiculo: vehiculoEnCelda,
        conductor: conductor || undefined,
        esOficial: esPlacaOficial(vehiculoEnCelda.placa),
        controlId: "",
        fechaEntrada: vehiculoEnCelda.fechaEntrada || new Date().toISOString(),
      };
    }

    return null;
  }, [controlesSalida, vehiculos, conductores]);

  const celdaActiva = useMemo(() => celdas.find((c) => c.id === celdaSeleccionadaId) ?? null, [celdas, celdaSeleccionadaId]);
  const parqueaderoActivo = useMemo(
    () => (celdaActiva ? parqueaderos.find((p) => p.id === celdaActiva.parqueaderoId) ?? null : null),
    [celdaActiva, parqueaderos]
  );
  const ocupanteActivo = useMemo(() => (celdaActiva ? getOcupante(celdaActiva.id) : null), [celdaActiva, getOcupante]);
  const reservaActiva = useMemo(
    () => (celdaActiva ? reservas.find((r) => r.celdaId === celdaActiva.id && (r.estado === "pendiente" || r.estado === "activa")) ?? null : null),
    [celdaActiva, reservas]
  );
  const vehiculoReservado = useMemo(
    () => (reservaActiva ? vehiculos.find((v) => v.id === reservaActiva.vehiculoId) ?? null : null),
    [reservaActiva, vehiculos]
  );

  /* Ajuste manual de estado de una celda (Administrador/Vigilante): vía de escape fuera del
     flujo normal (estacionar/reservar/liberar), para corregir una celda que quedó atascada en
     un estado por datos inconsistentes, o para ponerla/sacarla de mantenimiento. */
  const handleSetEstadoCeldaManual = useCallback((estado: Celda["estado"]) => {
    if (!celdaActiva) return;
    data.updateCelda(celdaActiva.id, { estado, ocupada: estado === "no_disponible" });
    toast.success(`Celda ${celdaActiva.numero} marcada como "${estado.replace("_", " ")}"`);
    setOpenModal(null);
  }, [celdaActiva, data]);

  return {
    openModal, setOpenModal,
    celdaSeleccionadaId, setCeldaSeleccionadaId,
    getOcupante,
    celdaActiva, parqueaderoActivo, ocupanteActivo, reservaActiva, vehiculoReservado,
    handleSetEstadoCeldaManual,
  };
}

export type ModalController = ReturnType<typeof useModalController>;

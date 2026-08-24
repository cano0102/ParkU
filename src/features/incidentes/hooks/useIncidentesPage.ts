import { useIncidentesData } from "./useIncidentesData";
import { useIncidenteDialogs } from "./useIncidenteDialogs";

/** Compone los datos de Incidentes con el estado de sus modales en un único objeto para la página. */
export function useIncidentesPage() {
  const data = useIncidentesData();
  const dialogs = useIncidenteDialogs(data);

  return { ...data, ...dialogs };
}

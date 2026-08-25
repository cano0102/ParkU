import { useUsuariosData } from "./useUsuariosData";
import { useUsuariosFilters } from "./useUsuariosFilters";
import { useUsuarioFormState } from "./useUsuarioFormState";

/** Compone datos, filtros y el formulario de la página de Usuarios. */
export function useUsuariosPage() {
  const data = useUsuariosData();
  const filters = useUsuariosFilters(data.usuarios);
  const form = useUsuarioFormState(data);

  return { data, filters, form };
}

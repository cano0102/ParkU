import { DataToolbar } from "@/components/data";

interface UsuariosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | "activo" | "inactivo";
  onFilterEstadoChange: (value: "todos" | "activo" | "inactivo") => void;
  filterRol: string;
  onFilterRolChange: (value: string) => void;
  uniqueRoles: string[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreate: () => void;
}

/** Buscador + filtros (estado, rol) + modo de vista + "Nuevo Usuario". */
export function UsuariosToolbar({
  search, onSearchChange, filterEstado, onFilterEstadoChange, filterRol, onFilterRolChange,
  uniqueRoles, viewMode, onViewModeChange, onCreate,
}: UsuariosToolbarProps) {
  return (
    <DataToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar usuario..."
      searchAriaLabel="Buscar usuarios"
      filters={[
        {
          value: filterEstado,
          onChange: (v) => onFilterEstadoChange(v as "todos" | "activo" | "inactivo"),
          ariaLabel: "Filtrar por estado",
          options: [
            { value: "todos", label: "Todos" },
            { value: "activo", label: "Activos" },
            { value: "inactivo", label: "Inactivos" },
          ],
        },
        {
          value: filterRol,
          onChange: onFilterRolChange,
          ariaLabel: "Filtrar por rol",
          options: [
            { value: "todos", label: "Todos los roles" },
            ...uniqueRoles.map((r) => ({ value: r, label: r })),
          ],
        },
      ]}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      createLabel="Nuevo Usuario"
      onCreate={onCreate}
    />
  );
}

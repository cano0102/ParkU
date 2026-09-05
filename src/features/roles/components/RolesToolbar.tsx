import { DataToolbar } from "@/components/data";

interface RolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | "activo" | "inactivo";
  onFilterEstadoChange: (value: "todos" | "activo" | "inactivo") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreate: () => void;
}

/**
 * Buscador + filtro de estado + modo de vista + "Nuevo Rol".
 *
 * Usa el mismo DataToolbar que Usuarios y Conductores: así los tres módulos comparten el
 * conmutador de tarjetas/lista en vez de que cada uno tenga su propia barra a mano.
 */
export function RolesToolbar({
  search, onSearchChange, filterEstado, onFilterEstadoChange, viewMode, onViewModeChange, onCreate,
}: RolesToolbarProps) {
  return (
    <DataToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar rol..."
      searchAriaLabel="Buscar roles"
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
      ]}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      createLabel="Nuevo Rol"
      onCreate={onCreate}
    />
  );
}

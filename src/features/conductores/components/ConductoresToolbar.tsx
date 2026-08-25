import { DataToolbar } from "@/components/data";

interface ConductoresToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterTipo: string;
  onFilterTipoChange: (value: string) => void;
  filterVehiculoTipo: string;
  onFilterVehiculoTipoChange: (value: string) => void;
  filterEstado: "todos" | "activo" | "inactivo";
  onFilterEstadoChange: (value: "todos" | "activo" | "inactivo") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreate: () => void;
  activeFiltersCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

/** Buscador + filtros (tipo, vehículo, estado) + modo de vista + "Nuevo Conductor". */
export function ConductoresToolbar({
  search, onSearchChange, filterTipo, onFilterTipoChange, filterVehiculoTipo, onFilterVehiculoTipoChange,
  filterEstado, onFilterEstadoChange, viewMode, onViewModeChange, onCreate,
  activeFiltersCount, filteredCount, onClearFilters,
}: ConductoresToolbarProps) {
  return (
    <DataToolbar
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar conductor, vehículo, identificación..."
      searchAriaLabel="Buscar conductores"
      filters={[
        {
          value: filterTipo,
          onChange: onFilterTipoChange,
          ariaLabel: "Filtrar por tipo",
          options: [
            { value: "todos", label: "Todos los tipos" },
            { value: "aprendiz", label: "Aprendiz" },
            { value: "instructor", label: "Instructor" },
          ],
        },
        {
          value: filterVehiculoTipo,
          onChange: onFilterVehiculoTipoChange,
          ariaLabel: "Filtrar por tipo de vehículo",
          options: [
            { value: "todos", label: "Todos los vehículos" },
            { value: "carro", label: "Con Carro" },
            { value: "moto", label: "Con Moto" },
          ],
        },
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
      createLabel="Nuevo Conductor"
      onCreate={onCreate}
      activeFiltersBar={{ activeFiltersCount, filteredCount, onClearFilters }}
    />
  );
}

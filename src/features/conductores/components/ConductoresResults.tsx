import { IconUser as User } from "@tabler/icons-react";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Usuario } from "@/services/api/usuarios";
import { DataGrid, DataList, DataPagination } from "@/components/data";
import { COLORS } from "../lib/helpers";
import { renderConductorCard, getConductorColumns } from "./ConductorCard";

interface ConductoresResultsProps {
  conductores: Conductor[];
  viewMode: "grid" | "list";
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  getUsuario: (id: string) => Usuario | undefined;
  getVehiculosConductor: (id: string) => Vehiculo[];
  onToggleEstado: (id: string, estado: "activo" | "inactivo") => void;
  onViewVehiculo: (vehiculo: Vehiculo) => void;
  onViewDetail: (conductor: Conductor) => void;
  onEdit: (conductor: Conductor) => void;
  onAgregarVehiculo: (conductor: Conductor) => void;
  /** Borra la ficha del conductor, previa confirmación. */
  onDelete: (conductor: Conductor) => void;
  /** Foto del conductor (propia o la de su cuenta vinculada) — ver useConductoresData. */
  fotoDe: (conductor: Conductor) => string | undefined;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

/** Estado vacío, o el grid/lista de conductores paginado. */
export function ConductoresResults({
  conductores, viewMode, currentPage, totalPages, itemsPerPage, totalItems,
  getUsuario, getVehiculosConductor, onToggleEstado, onViewVehiculo, onViewDetail, onEdit, onAgregarVehiculo, onDelete,
  fotoDe, onPageChange, onItemsPerPageChange,
}: ConductoresResultsProps) {
  if (conductores.length === 0) {
    return (
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${COLORS.border}`,
          background: "#fff", color: COLORS.textLight,
        }}
      >
        <User size={36} color={COLORS.border} style={{ marginBottom: 10 }} />
        <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron conductores</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
      </div>
    );
  }

  const cardHandlers = {
    getUsuario, getVehiculosConductor,
    onToggleEstado, onViewVehiculo, onViewDetail, onEdit, onAgregarVehiculo, onDelete, fotoDe,
  };

  return (
    <>
      {viewMode === "grid" ? (
        <DataGrid
          items={conductores}
          getKey={(c) => c.id}
          gridTemplateColumns="repeat(auto-fill,minmax(340px,1fr))"
          gap={14}
          renderCard={(c) => renderConductorCard(c, cardHandlers)}
        />
      ) : (
        <DataList items={conductores} getKey={(c) => c.id} columns={getConductorColumns(cardHandlers)} />
      )}

      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        itemsPerPageOptions={viewMode === "list" ? [15, 25, 50, 100] : [9, 18, 36, 60]}
        entityLabel="Conductores"
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </>
  );
}

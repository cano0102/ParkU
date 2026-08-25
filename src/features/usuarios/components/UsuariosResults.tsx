import { UserCircle } from "lucide-react";
import type { Usuario } from "@/services/api/usuarios";
import { DataGrid, DataList, DataPagination } from "@/components/data";
import { COLORS } from "../lib/helpers";
import { renderUsuarioCard, getUsuarioColumns } from "./UsuarioCard";

interface UsuariosResultsProps {
  usuarios: Usuario[];
  viewMode: "grid" | "list";
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onToggleEstado: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

/** Estado vacío, o el grid/lista de usuarios paginado. */
export function UsuariosResults({
  usuarios, viewMode, currentPage, totalPages, itemsPerPage, totalItems,
  onToggleEstado, onEdit, onPageChange, onItemsPerPageChange,
}: UsuariosResultsProps) {
  if (usuarios.length === 0) {
    return (
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${COLORS.border}`,
          background: "#fff", color: COLORS.textLight,
        }}
      >
        <UserCircle size={40} color={COLORS.border} style={{ marginBottom: 10 }} />
        <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron usuarios</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea uno nuevo</p>
      </div>
    );
  }

  const handlers = { onToggleEstado, onEdit };

  return (
    <>
      {viewMode === "grid" ? (
        <DataGrid items={usuarios} getKey={(u) => u.id} renderCard={(u) => renderUsuarioCard(u, handlers)} />
      ) : (
        <DataList items={usuarios} getKey={(u) => u.id} columns={getUsuarioColumns(handlers)} />
      )}

      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        itemsPerPageOptions={viewMode === "list" ? [15, 25, 50, 100] : [9, 18, 36, 60]}
        entityLabel="Usuarios"
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { theme } from "@/styles/theme";
import { PAGE_SIZE } from "../lib/helpers";

const COLORS = theme;

interface ControlSalidaPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (updater: (page: number) => number) => void;
}

/** Pie de la tabla: resumen "mostrando X–Y de Z" y controles de página. */
export function ControlSalidaPagination({ currentPage, totalPages, totalItems, onPageChange }: ControlSalidaPaginationProps) {
  return (
    <div style={{ padding: "10px 16px", borderTop: `1px solid ${COLORS.border}`, background: "#F8FAF8", fontSize: 11, color: COLORS.textLight, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
      <span>
        Mostrando{" "}
        <strong>
          {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)}
        </strong>{" "}
        de <strong>{totalItems}</strong> registros
      </span>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
            style={{
              width: 26, height: 26, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: "#fff",
              color: currentPage === 1 ? COLORS.textMuted : COLORS.text,
              cursor: currentPage === 1 ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={13} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.text, minWidth: 60, textAlign: "center" }}>
            Pág. {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
            style={{
              width: 26, height: 26, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: "#fff",
              color: currentPage === totalPages ? COLORS.textMuted : COLORS.text,
              cursor: currentPage === totalPages ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

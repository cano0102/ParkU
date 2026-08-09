import { COLORS, inputStyle } from "./helpers";

interface UsuariosPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  viewMode: "grid" | "list";
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}

export function UsuariosPagination({
  currentPage, totalPages, itemsPerPage, totalItems, viewMode,
  onPageChange, onItemsPerPageChange,
}: UsuariosPaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );
  const pageItems = pageNumbers.reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
    acc.push(p);
    return acc;
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 4px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: COLORS.textLight }}>
        <span>
          Mostrando{" "}
          <strong style={{ color: COLORS.text }}>
            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)}
          </strong>{" "}
          de <strong style={{ color: COLORS.text }}>{totalItems}</strong>
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            ...inputStyle,
            width: "auto",
            padding: "6px 10px",
            fontSize: 11,
            appearance: "none",
            cursor: "pointer",
          }}
          aria-label="Usuarios por página"
        >
          {(viewMode === "list" ? [15, 25, 50, 100] : [9, 18, 36, 60]).map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            className="u-page-btn"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: "#fff",
              color: currentPage === 1 ? COLORS.border : COLORS.text,
              fontSize: 11,
              fontWeight: 700,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Anterior
          </button>

          {pageItems.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e-${i}`} style={{ padding: "0 4px", color: COLORS.textLight, fontSize: 11 }}>
                …
              </span>
            ) : (
              <button
                key={p}
                className="u-page-btn"
                onClick={() => onPageChange(p)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: p === currentPage ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                  background: p === currentPage ? COLORS.primary : "#fff",
                  color: p === currentPage ? "#fff" : COLORS.text,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            className="u-page-btn"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: "#fff",
              color: currentPage === totalPages ? COLORS.border : COLORS.text,
              fontSize: 11,
              fontWeight: 700,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

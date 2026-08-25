import { COLORS } from "../helpers";

/** Estilos de página: raíz/fuentes, grid/lista, toggle de vista, paginación, selector de usuario y media queries. */
export const conductoresLayoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');
  .conductores-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .conductores-root .mono{ font-family:'JetBrains Mono','Montserrat',monospace; }

  .conductores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 14px;
  }
  @media (max-width: 640px) {
    .conductores-grid {
      grid-template-columns: 1fr;
    }
  }

  .view-toggle {
    display: flex;
    gap: 2px;
    padding: 3px;
    border-radius: 11px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.bg};
  }
  .view-toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    background: transparent;
    color: ${COLORS.textLight};
  }
  .view-toggle-btn.active {
    background: #fff;
    color: ${COLORS.primaryDark};
    box-shadow: 0 1px 4px rgba(15,23,42,.1);
  }

  .conductores-list {
    border-radius: 16px;
    border: 1px solid ${COLORS.border};
    background: #fff;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(15,23,42,.05);
  }
  .list-header {
    display: grid;
    grid-template-columns: minmax(200px,1.6fr) minmax(140px,1fr) 150px 120px 110px 100px;
    gap: 10px;
    padding: 10px 14px;
    background: ${COLORS.bg};
    border-bottom: 1px solid ${COLORS.border};
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: ${COLORS.textLight};
  }
  .list-row {
    display: grid;
    grid-template-columns: minmax(200px,1.6fr) minmax(140px,1fr) 150px 120px 110px 100px;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid ${COLORS.border};
    font-size: 12px;
    transition: background .15s ease;
  }
  .list-row:last-child { border-bottom: none; }
  .list-row:hover { background: #F8FAFC; }
  .list-plate-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: ${COLORS.text};
    background: #F8FAFC;
    border: 1px solid ${COLORS.border};
    border-radius: 6px;
    padding: 2px 7px;
    display: inline-block;
  }

  .page-btn {
    transition: background .15s, border-color .15s, color .15s;
  }
  .page-btn:not(:disabled):hover {
    border-color: ${COLORS.primary};
    color: ${COLORS.primaryDark};
  }

  .usuario-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 9px;
    cursor: pointer;
    transition: background .15s ease;
  }
  .usuario-option:hover {
    background: #F0FDF4;
  }
  .usuario-option.disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .usuario-option.disabled:hover {
    background: transparent;
  }

  @media (max-width: 780px) {
    .view-toggle-label { display: none; }
    .list-header { display: none; }
    .list-row {
      grid-template-columns: 1fr !important;
      grid-auto-flow: row;
      gap: 6px !important;
    }
  }

  @media (max-width: 480px) {
    .cf-modal-grid { grid-template-columns: 1fr !important; }
  }
`;

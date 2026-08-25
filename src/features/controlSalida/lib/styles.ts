import { theme } from "@/styles/theme";

const COLORS = theme;

export const controlSalidaStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
  .control-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .control-row{
    transition: all 0.15s ease;
    border-bottom: 1px solid ${COLORS.border};
  }
  .control-row:hover{
    background: #F8FAF8;
    transform: scale(1.001);
  }
  .action-btn{
    transition: all 0.15s ease;
    border-radius: 8px;
    padding: 6px 12px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
  }
  .action-btn:hover{
    transform: scale(1.02);
  }
  input:focus,textarea:focus,select:focus{
    outline:none;
    border-color:${COLORS.primary} !important;
    box-shadow:0 0 0 3px rgba(57,169,0,.12);
  }
  ::-webkit-scrollbar{ width:5px; }
  ::-webkit-scrollbar-track{ background:transparent; }
  ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .status-badge.active {
    background: ${COLORS.infoBg};
    color: ${COLORS.info};
  }
  .status-badge.completed {
    background: ${COLORS.successBg};
    color: ${COLORS.success};
  }
  .hero-banner {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 8px;
    min-width: 280px;
  }
  .toolbar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  .toolbar-search {
    flex: 1;
    position: relative;
    min-width: 200px;
  }
  .table-header {
    display: grid;
    background: #F8FAF8;
    border-bottom: 2px solid ${COLORS.border};
    padding: 12px 16px;
    font-size: 10px;
    font-weight: 800;
    color: ${COLORS.textLight};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .table-row {
    display: grid;
    padding: 14px 16px;
    align-items: center;
    font-size: 12px;
  }
  .cell-label {
    display: none;
  }

  @media (max-width: 1024px) {
    .table-header, .table-row {
      grid-template-columns: minmax(140px,1fr) minmax(140px,1fr) 80px minmax(140px,1fr) 150px 150px 90px 110px !important;
      gap: 8px;
    }
  }

  @media (max-width: 768px) {
    .hero-banner {
      flex-direction: column;
      align-items: stretch;
    }
    .hero-stats {
      grid-template-columns: repeat(2,1fr);
      min-width: 0;
      width: 100%;
    }
    .toolbar-search {
      min-width: 100%;
      order: 1;
    }
    .toolbar select {
      flex: 1;
      min-width: 140px;
      order: 2;
    }
    .toolbar > button {
      flex: 1;
      justify-content: center;
      order: 3;
    }
    .table-header, .table-row {
      grid-template-columns: 1fr !important;
      gap: 10px;
      padding: 14px 16px;
    }
    .table-header {
      display: none;
    }
    .table-row {
      border-bottom: none;
      background: #fff;
      border: 1px solid ${COLORS.border};
      border-radius: 14px;
      margin: 0 12px 10px 12px;
      box-shadow: 0 1px 4px rgba(15,23,42,.04);
    }
    .control-row:hover {
      transform: none;
    }
    .cell-label {
      display: block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: ${COLORS.textMuted};
      margin-bottom: 3px;
    }
    .table-row > div {
      display: flex;
      flex-direction: column;
      align-items: flex-start !important;
    }
    .table-row > div:last-child {
      flex-direction: row;
      align-items: center !important;
      justify-content: flex-end !important;
      padding-top: 6px;
      border-top: 1px dashed ${COLORS.border};
      margin-top: 4px;
    }
  }

  @media (max-width: 480px) {
    .hero-stats {
      grid-template-columns: repeat(2,1fr);
    }
  }
`;

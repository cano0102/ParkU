import { theme } from "@/styles/theme";

const C = theme;

export const reservasStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
  .reservas-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .reserva-row{ transition:background .15s; }
  .reserva-row:hover{ background:#F8FAF8; }
  .stat-card{ transition:all .2s; cursor:pointer; }
  .stat-card:hover{ transform:translateY(-2px); }
  .action-btn{ transition:background .15s,color .15s; }
  .action-btn:hover{ background:#F1F5F9 !important; color:#0F172A !important; }
  input:focus,textarea:focus,select:focus{
    outline:none;
    border-color:${C.primary} !important;
    box-shadow:0 0 0 3px rgba(57,169,0,.12);
  }
  ::-webkit-scrollbar{ width:5px; }
  ::-webkit-scrollbar-track{ background:transparent; }
  ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

  @media (max-width: 640px) {
    .reservas-hero-stats { grid-template-columns: repeat(2, 1fr) !important; min-width: 0 !important; }
  }
  @media (max-width: 860px) {
    .reserva-table-header, .reserva-row {
      grid-template-columns: minmax(140px,1fr) minmax(120px,1fr) 90px minmax(120px,1fr) 130px 90px 80px !important;
      gap: 6px !important;
    }
  }
  @media (max-width: 720px) {
    .reserva-table-header { display: none; }
    .reserva-row {
      grid-template-columns: 1fr !important;
      grid-auto-flow: row;
      gap: 8px !important;
      padding: 14px 16px !important;
      border-radius: 14px;
      border: 1px solid ${C.border} !important;
      margin: 0 0 10px 0;
      box-shadow: 0 1px 4px rgba(15,23,42,.04);
    }
  }
`;

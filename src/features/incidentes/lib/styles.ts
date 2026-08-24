import { theme } from "@/styles/theme";

const C = theme;

export const incidentesStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
  .incidentes-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .incidente-card{ transition:box-shadow .18s,transform .18s; }
  .incidente-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-1px); }
  .action-btn{ transition:background .15s,color .15s; }
  .action-btn:hover{ background:#F1F5F9 !important; color:#0F172A !important; }
  .delete-btn:hover{ background:#FEE2E2 !important; color:#DC2626 !important; }
  input:focus,textarea:focus,select:focus{
    outline:none;
    border-color:${C.primary} !important;
    box-shadow:0 0 0 3px rgba(57,169,0,.12);
  }
  select:disabled{ opacity:.55; cursor:not-allowed; }
  ::-webkit-scrollbar{ width:5px; }
  ::-webkit-scrollbar-track{ background:transparent; }
  ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

  @media (max-width: 640px) {
    .incidentes-hero-stats { grid-template-columns: repeat(2, 1fr) !important; min-width: 0 !important; }
  }
  @media (max-width: 480px) {
    .incidentes-form-grid { grid-template-columns: 1fr !important; }
  }
`;

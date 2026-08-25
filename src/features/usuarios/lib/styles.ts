import { theme } from "@/styles/theme";

const COLORS = theme;

export const usuariosStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
  .u-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .u-card{ transition:box-shadow .18s,transform .18s; }
  .u-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-2px); }
  .u-btn{ transition:background .15s,opacity .15s; }
  .u-btn:hover{ opacity:.85; }
  .u-page-btn{ transition:background .15s,border-color .15s,color .15s; }
  .u-page-btn:not(:disabled):hover{ border-color:${COLORS.primary}; color:${COLORS.primaryDark}; }
  input:focus,select:focus,textarea:focus{
    outline:none;
    border-color:${COLORS.primary} !important;
    box-shadow:0 0 0 3px rgba(57,169,0,.12);
  }
  ::-webkit-scrollbar{ width:5px; }
  ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
  @media (max-width:640px){
    .u-view-label{ display:none; }
    .u-list-header{ display:none !important; }
    .u-list-row{
      grid-template-columns:1fr !important;
      grid-auto-flow:row;
      gap:6px !important;
    }
  }
  @media (max-width:480px){
    .uf-modal-grid{ grid-template-columns:1fr !important; }
  }
`;

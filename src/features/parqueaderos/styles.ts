import { theme } from "@/theme";

const C = theme;

export const parqueaderosStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
  .pq-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  input:focus,select:focus,textarea:focus{ outline:none; border-color:${C.primary} !important; box-shadow:0 0 0 3px rgba(57,169,0,.12); }
  ::-webkit-scrollbar{ width:5px; }
  ::-webkit-scrollbar-track{ background:transparent; }
  ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

  .pq-hero-banner{ display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between; }
  .pq-hero-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; min-width:280px; }

  .pq-topbar{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .pq-search-wrap{ flex:1; position:relative; min-width:200px; }
  .pq-view-toggle{ display:flex; border-radius:11px; border:1px solid ${C.border}; overflow:hidden; background:#fff; }

  .pq-table-header{ display:grid; grid-template-columns:minmax(200px,1fr) 120px 100px 80px 80px 80px 100px 90px; background:#F8FAF8; border-bottom:1px solid ${C.border}; padding:12px 16px; font-size:11px; font-weight:800; color:${C.textLight}; text-transform:uppercase; letter-spacing:.5px; }
  .pq-table-row{ display:grid; grid-template-columns:minmax(200px,1fr) 120px 100px 80px 80px 80px 100px 90px; padding:14px 16px; border-bottom:1px solid ${C.border}; align-items:center; font-size:12px; transition:background .15s; cursor:pointer; }
  .pq-cell-label{ display:none; }

  @media (max-width: 860px){
    .pq-hero-stats{ grid-template-columns:repeat(2,1fr); min-width:0; width:100%; }
    .pq-table-header, .pq-table-row{ grid-template-columns:minmax(140px,1fr) 100px 90px 60px 60px 60px 90px 80px; gap:6px; }
  }

  @media (max-width: 720px){
    .pq-topbar > .pq-search-wrap{ order:1; min-width:100%; }
    .pq-topbar > select{ order:2; flex:1; min-width:140px; }
    .pq-view-toggle{ order:3; flex:1; }
    .pq-view-toggle button{ flex:1; justify-content:center; }
    .pq-topbar > button{ order:4; flex:1; justify-content:center; }
  }

  @media (max-width: 640px){
    .pq-hero-stats{ grid-template-columns:repeat(2,1fr); }
    .pq-table-header{ display:none; }
    .pq-table-row{
      grid-template-columns:1fr !important;
      gap:10px; padding:14px 16px;
      border:1px solid ${C.border}; border-radius:14px;
      margin:0 0 10px 0; border-bottom:1px solid ${C.border};
      box-shadow:0 1px 4px rgba(15,23,42,.04);
    }
    .pq-table-row > div{ display:flex; flex-direction:column; align-items:flex-start !important; }
    .pq-table-row > div:last-child{ flex-direction:row; align-items:center !important; justify-content:flex-end !important; padding-top:6px; border-top:1px dashed ${C.border}; margin-top:4px; }
    .pq-cell-label{ display:block; font-size:9px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; color:${C.textLight}; margin-bottom:3px; }
    .pq-modal-two-col{ grid-template-columns:1fr !important; }
  }
`;

import { theme } from "@/styles/theme";

const COLORS = theme;

export const rolesStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
  .roles-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  input:focus,textarea:focus,select:focus{
    outline:none;
    border-color:${COLORS.primary} !important;
    box-shadow:0 0 0 3px rgba(57,169,0,.12);
  }
  ::-webkit-scrollbar{ width:5px; }
  ::-webkit-scrollbar-track{ background:transparent; }
  ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

  @media (max-width: 640px) {
    .roles-hero-stats { grid-template-columns: repeat(2, 1fr) !important; min-width: 0 !important; }
  }
  @media (max-width: 480px) {
    .roles-form-grid, .roles-permiso-grid { grid-template-columns: 1fr !important; }
  }

  /* ---------- Tarjeta de rol (rediseño) ---------- */
  .role-card{
    background: #fff;
    border-radius: 18px;
    border: 1px solid ${COLORS.border};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-shadow: 0 1px 2px rgba(15,23,42,.04);
    transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s cubic-bezier(.4,0,.2,1), border-color .22s ease;
  }
  .role-card:hover{
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(15,23,42,.10);
    border-color: color-mix(in srgb, var(--accent) 40%, ${COLORS.border});
  }

  .role-card-top{
    padding: 16px 16px 12px;
  }
  .role-card-top-row{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .role-icon{
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .role-status-pill{
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .role-switch{
    position: relative;
    width: 30px;
    height: 17px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
    transition: background .18s ease;
  }
  .role-switch-knob{
    display: block;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15,23,42,.25);
    transition: transform .18s ease;
  }

  .role-name-row{
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
  }
  .role-name{
    font-size: 16px;
    font-weight: 900;
    color: ${COLORS.text};
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .role-lock{
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 5px;
    background: #F1F5F9;
    color: ${COLORS.textLight};
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .role-desc{
    margin-top: 4px;
    font-size: 11.5px;
    color: ${COLORS.textLight};
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 33px;
  }

  .role-card-body{
    padding: 14px 16px 4px;
    flex: 1;
  }
  .clearance-row{
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .clearance-label{
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: ${COLORS.textLight};
  }
  .clearance-pct{
    font-size: 14px;
    font-weight: 900;
  }
  .clearance-bars{
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 24px;
    margin-bottom: 14px;
  }
  .clearance-bar{
    flex: 1;
    border-radius: 2px;
    transition: background .3s ease;
  }

  .group-grid{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 14px;
  }
  .group-chip{
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 9px;
    font-size: 10.5px;
    font-weight: 800;
  }

  .role-card-footer{
    margin-top: auto;
    border-top: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    background: ${COLORS.bg};
  }
  .role-action-btn{
    flex: 1;
    padding: 11px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${COLORS.textLight};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s ease, color .15s ease;
  }
  .role-action-btn:hover{
    background: #fff;
    color: ${COLORS.text};
  }
  .role-action-btn.danger:hover{
    background: #FEE2E2;
    color: #DC2626;
  }
  .role-action-divider{
    width: 1px;
    align-self: stretch;
    background: ${COLORS.border};
  }
`;

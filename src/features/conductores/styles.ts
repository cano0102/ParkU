import { COLORS } from "./helpers";

export const conductoresStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');
  .conductores-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .conductores-root .mono{ font-family:'JetBrains Mono','Montserrat',monospace; }

  .conductor-card{
    --accent: ${COLORS.primary};
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
    border: 1px solid ${COLORS.border};
    border-radius: 18px;
    background: #fff;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1px 2px rgba(15,23,42,.04);
    display: flex;
    flex-direction: column;
  }
  .conductor-card:hover{
    transform: translateY(-3px);
    box-shadow: 0 16px 36px rgba(15,23,42,.10);
    border-color: color-mix(in srgb, var(--accent) 45%, ${COLORS.border});
  }
  .conductor-card.is-inactive{
    --accent: #94A3B8;
  }
  .conductor-card.is-inactive .card-top{
    opacity: .82;
  }

  .conductor-card .status-rail{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: var(--accent);
  }

  .card-top{
    padding: 18px 18px 14px 22px;
    display: flex;
    gap: 12px;
  }

  .card-avatar{
    width: 46px;
    height: 46px;
    border-radius: 13px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 900;
    font-size: 15px;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 10px -3px rgba(0,0,0,.25);
  }

  .card-identity{
    flex: 1;
    min-width: 0;
  }
  .card-name{
    font-size: 14px;
    font-weight: 800;
    color: ${COLORS.text};
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-doc{
    font-size: 10.5px;
    color: ${COLORS.textLight};
    margin-top: 2px;
  }

  .card-switch{
    flex-shrink: 0;
    width: 34px;
    height: 19px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background .2s;
  }
  .card-switch .knob{
    position: absolute;
    top: 2px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #fff;
    transition: left .2s;
    box-shadow: 0 1px 3px rgba(0,0,0,.2);
  }

  .card-tags{
    padding: 0 18px 10px 22px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .card-tag{
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
  }

  .plate-block{
    margin: 0 18px 10px 22px;
    padding: 9px 12px;
    border-radius: 10px;
    background: #F8FAFC;
    border: 1px dashed ${COLORS.border};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .plate-block.has-plate{
    border-style: solid;
    background: #fff;
    transition: border-color .2s, background .2s;
  }
  .plate-block.has-plate:hover{
    border-color: ${COLORS.primary};
    background: #F0FDF4;
  }
  .plate-empty{
    font-size: 11px;
    color: ${COLORS.textMuted};
    font-style: italic;
  }
  .plate-chip{
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: ${COLORS.text};
    background: #F1F5F9;
    border-radius: 6px;
    padding: 2px 7px;
  }
  .plate-meta{
    flex: 1;
    font-size: 11px;
    color: ${COLORS.textLight};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .plate-list{
    margin: 0 18px 10px 22px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .plate-row{
    padding: 7px 10px;
    border-radius: 9px;
    background: #F8FAFC;
    border: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: border-color .2s, background .2s;
  }
  .plate-row:hover{
    border-color: ${COLORS.primary};
    background: #F0FDF4;
  }

  .card-center{
    margin: 0 18px 12px 22px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: ${COLORS.textLight};
  }

  .card-footer{
    margin-top: auto;
    border-top: 1px solid ${COLORS.border};
    padding: 8px 12px 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .action-btn{
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.bg};
    color: ${COLORS.textLight};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s, opacity .15s;
  }
  .action-btn:hover{ opacity: .8; }
  .action-btn.danger{
    background: #FEF2F2;
    color: #EF4444;
  }

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
    background: #DCFCE7;
    color: #166534;
  }
  .status-badge.inactive {
    background: #FEE2E2;
    color: #991B1B;
  }
  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
  }
  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    background: ${COLORS.bg};
    border: 1px solid ${COLORS.border};
    transition: all 0.2s ease;
  }
  .info-row:hover {
    border-color: ${COLORS.primary}40;
    background: #F8FAFC;
  }
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

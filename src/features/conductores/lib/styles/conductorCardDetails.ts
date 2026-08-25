import { COLORS } from "../helpers";

/** Etiquetas, bloque de placa(s), pie de tarjeta y las pastillas de estado/tipo/info-row reutilizadas fuera de la tarjeta. */
export const conductorCardDetailsStyles = `
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
`;

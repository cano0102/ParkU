import { COLORS } from "../helpers";

/** Contenedor de la tarjeta de conductor y su cabecera (avatar, nombre, switch de estado). */
export const conductorCardStyles = `
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
`;

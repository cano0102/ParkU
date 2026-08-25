/** CSS responsivo del layout: depende del ancho actual del sidebar (colapsado o no). */
export function mainLayoutStyles(sidebarWidth: number) {
  return `
    /* Desktop: show sidebar, hide mobile chrome */
    @media (min-width: 768px) {
      .mobile-header       { display: none !important; }
      .mobile-bottom-nav   { display: none !important; }
      .hidden-mobile-sidebar { display: flex !important; }
      .main-with-layout {
        margin-left: ${sidebarWidth}px;
        transition: margin-left .22s cubic-bezier(.4,0,.2,1);
        padding-top: 28px;
        padding-bottom: 40px;
        padding-inline: 28px;
      }
    }

    /* Mobile: hide sidebar, show header + bottom nav */
    @media (max-width: 767px) {
      .hidden-mobile-sidebar { display: none !important; }
      .mobile-header       { display: flex !important; }
      .mobile-bottom-nav   { display: flex !important; }
      .main-with-layout {
        padding-top: 76px;
        padding-bottom: 80px;
        padding-inline: 0;
      }
    }

    * { box-sizing: border-box; }

    /* Scrollbar for sidebar */
    nav::-webkit-scrollbar { width: 3px; }
    nav::-webkit-scrollbar-track { background: transparent; }
    nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.25); border-radius: 99px; }

    /* Status indicator pulse */
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: .4; }
    }
  `;
}

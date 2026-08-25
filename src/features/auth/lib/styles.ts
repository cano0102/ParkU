import { theme } from "@/styles/theme";

const COLORS = theme;

export const registerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    background: ${COLORS.background};
  }

  .fade {
    opacity: 0;
    transform: translateY(30px);
    transition: 0.8s ease;
  }

  .fade.active {
    opacity: 1;
    transform: translateY(0);
  }

  input, select {
    font-family: 'Montserrat', sans-serif;
  }

  button {
    font-family: 'Montserrat', sans-serif;
    transition: 0.25s ease;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  button:disabled {
    cursor: not-allowed;
  }

  input:focus, select:focus {
    border-color: ${COLORS.primary} !important;
    box-shadow: 0 0 0 4px rgba(57, 169, 0, 0.12);
  }

  input.input-error:focus {
    border-color: ${COLORS.danger} !important;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .spin {
    animation: spin 0.8s linear infinite;
  }

  @media (max-width: 900px) {
    .register-grid {
      grid-template-columns: 1fr !important;
    }

    .register-left {
      display: none !important;
    }

    .mobile-back {
      display: flex !important;
      align-items: center;
      gap: 8px;
      width: max-content;
      margin-bottom: 1.5rem;
    }
  }
`;

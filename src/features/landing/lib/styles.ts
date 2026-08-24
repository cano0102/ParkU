import { theme } from "@/styles/theme";

const COLORS = theme;

export const landingStyles = `

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  font-family:'Montserrat',sans-serif;
  background:${COLORS.background};
  color:${COLORS.text};
}

button{
  font-family:'Montserrat',sans-serif;
  transition:.25s ease;
}

button:hover{
  transform:translateY(-2px);
}

.container{
  width:100%;
  max-width:1200px;
  margin:auto;
  padding:0 2rem;
}

.fade{
  opacity:0;
  transform:translateY(30px);
  transition:.8s ease;
}

.fade.active{
  opacity:1;
  transform:translateY(0);
}

.card{
  background:${COLORS.surface};
  border:1px solid ${COLORS.border};
  border-radius:24px;
  padding:2rem;
  transition:.3s ease;
}

.card:hover{
  transform:translateY(-6px);
  box-shadow:0 15px 40px rgba(0,0,0,.06);
}

.navbar{
  transition:.3s ease;
}

.nav-link{
  position:relative;
  background:none;
  border:none;
  cursor:pointer;
  font-family:'Montserrat',sans-serif;
  font-weight:700;
  font-size:15px;
  color:${COLORS.text};
  padding:8px 2px;
}

.nav-link::after{
  content:'';
  position:absolute;
  left:0;
  bottom:0;
  width:0;
  height:2px;
  background:${COLORS.primary};
  transition:.25s ease;
}

.nav-link:hover::after{
  width:100%;
}

.nav-link:hover{
  transform:none;
}

.menu-toggle{
  display:none;
  background:none;
  border:none;
  cursor:pointer;
  color:${COLORS.text};
}

.step-line{
  position:absolute;
  top:35px;
  left:calc(50% + 45px);
  width:calc(100% - 90px);
  height:2px;
  background:repeating-linear-gradient(90deg,${COLORS.border} 0 8px,transparent 8px 16px);
}

@media(max-width:900px){

  .hero-grid,
  .features-grid,
  .stats-grid,
  .steps-grid{
    grid-template-columns:1fr !important;
  }

  .nav-links{
    display:none !important;
  }

  .menu-toggle{
    display:flex !important;
  }

  .hero-title{
    font-size:3.5rem !important;
  }

  .step-line{
    display:none;
  }
}

@media(max-width:600px){

  .hero-title{
    font-size:2.7rem !important;
  }

  .hero-buttons{
    flex-direction:column;
  }

  .trust-badges{
    flex-direction:column;
    align-items:flex-start !important;
  }
}

@media(max-width:480px){

  .logo-subtitle{
    display:none;
  }
}

`;

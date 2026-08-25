import { theme } from "@/styles/theme";

const COLORS = theme;

export const notFoundStyles = `

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  font-family:'Montserrat',sans-serif;
  background:${COLORS.background};
}

button{
  font-family:'Montserrat',sans-serif;
  transition:.25s ease;
}

button:hover{
  transform:translateY(-2px);
}

@media(max-width:900px){

  .notfound-grid{
    grid-template-columns:1fr !important;
  }

  .notfound-left{
    display:none !important;
  }

}

`;

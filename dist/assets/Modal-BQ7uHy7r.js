import{j as e,t as n}from"./index-BWzTIa0U.js";import{R as d,P as l,O as c,C as m,T as p}from"./index-BaY7DVG2.js";const f=n,x={position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap",border:0};function b({open:o,onClose:a,children:r,maxWidth:i=640,title:s="Diálogo"}){return e.jsx(d,{open:o,onOpenChange:t=>{t||a()},children:e.jsxs(l,{children:[e.jsx(c,{style:{position:"fixed",inset:0,zIndex:1e3,background:"rgba(15,23,42,.45)",backdropFilter:"blur(4px)",animation:"shared-modal-fade .15s ease"}}),e.jsx("div",{style:{position:"fixed",inset:0,zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",overflowY:"auto",padding:"2rem 1rem"},children:e.jsxs(m,{"aria-describedby":void 0,style:{width:"100%",maxWidth:i,margin:"auto",borderRadius:24,background:"#fff",border:`1px solid ${f.border}`,boxShadow:"0 20px 55px rgba(15,23,42,.12)",outline:"none",animation:"shared-modal-in .18s ease"},children:[e.jsx(p,{style:x,children:s}),r]})}),e.jsx("style",{children:`
          @keyframes shared-modal-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes shared-modal-in {
            from { opacity: 0; transform: scale(.97); }
            to   { opacity: 1; transform: scale(1); }
          }
        `})]})})}export{b as M};

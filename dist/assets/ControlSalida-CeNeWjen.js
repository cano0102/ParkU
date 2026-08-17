import{c as le,a as se,r as n,e as g,j as e,t as de,Y,Z as W,C as U,Q as ce,X as Q,O as pe,b as xe}from"./index-BWzTIa0U.js";import{M as ue}from"./Modal-BQ7uHy7r.js";import{C as he}from"./ConfirmDialog-DUMhrOIl.js";import{S as X}from"./search-DzIGfOaj.js";import{P as ge}from"./plus-D1DmVZ21.js";import{C as Z}from"./car-BmGoQ1Yj.js";import{M as fe}from"./map-pin-D_ohK4DS.js";import"./index-BaY7DVG2.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]],D=le("log-in",me),o=de,G=()=>({vehiculoId:"",celdaId:"",fechaEntrada:new Date().toISOString().slice(0,16),fechaSalida:"",estado:"en_parqueadero"});function ze(){const{controlesSalida:p,addControlSalida:B,updateControlSalida:N,vehiculos:m,celdas:C,updateCelda:w,updateVehiculo:z,conductores:k,usuarios:$,parqueaderos:M}=se(),[J,j]=n.useState(!1),[K,R]=n.useState(!1),[F,P]=n.useState(""),[v,A]=n.useState("todos"),[i,S]=n.useState(G()),[E,T]=n.useState(null),[L,O]=n.useState(""),u=n.useCallback(t=>m.find(r=>r.id===t),[m]),I=n.useCallback(t=>C.find(r=>r.id===t),[C]),ee=n.useCallback(t=>M.find(r=>r.id===t),[M]),V=n.useCallback(t=>{const r=u(t);return r?k.find(a=>a.id===r.conductorId):null},[m,k,u]),q=n.useCallback(t=>{const r=V(t);return r?$.find(a=>a.id===r.usuarioId):null},[k,$,V]),b=n.useMemo(()=>C.filter(t=>t.estado==="disponible"),[C]),_=n.useMemo(()=>{const t=L.toLowerCase().trim();return t?m.filter(r=>r.placa.toLowerCase().includes(t)||r.marca.toLowerCase().includes(t)||r.modelo.toLowerCase().includes(t)):m},[m,L]),s=n.useMemo(()=>i.vehiculoId?u(i.vehiculoId):null,[i.vehiculoId,u]),f=n.useMemo(()=>{if(!s)return b;const t=s.tipo;return t?b.filter(r=>r.tipo===t):b},[s,b]),x=n.useMemo(()=>p.filter(t=>t.estado==="en_parqueadero"),[p]),te=n.useMemo(()=>p.filter(t=>t.estado==="finalizado"),[p]),y=n.useMemo(()=>p.filter(t=>{const r=u(t.vehiculoId),a=I(t.celdaId),l=q(t.vehiculoId),d=F.toLowerCase(),c=(r==null?void 0:r.placa.toLowerCase().includes(d))||(a==null?void 0:a.numero.toLowerCase().includes(d))||(l==null?void 0:l.nombre.toLowerCase().includes(d))||(l==null?void 0:l.identificacion.includes(d))||(r==null?void 0:r.marca.toLowerCase().includes(d))||(r==null?void 0:r.modelo.toLowerCase().includes(d)),h=v==="todos"?!0:t.estado===v;return c&&h}),[p,F,v,u,I,q]),oe=n.useCallback(()=>{S(G()),O(""),j(!0)},[]),re=n.useCallback(t=>{T(t),R(!0)},[]),ie=n.useCallback(()=>{if(!i.vehiculoId){g.error("Selecciona un vehículo");return}if(!i.celdaId){g.error("Selecciona una celda");return}if(x.some(l=>l.vehiculoId===i.vehiculoId)){g.error("Este vehículo ya se encuentra en el parqueadero");return}const r=u(i.vehiculoId),a=I(i.celdaId);if(r&&a&&r.tipo&&a.tipo!==r.tipo){g.error(`El tipo de vehículo (${r.tipo}) no coincide con el tipo de celda (${a.tipo})`);return}try{B(i),w(i.celdaId,{estado:"no_disponible",ocupada:!0}),z(i.vehiculoId,{celdaId:i.celdaId}),g.success("Entrada registrada exitosamente"),j(!1)}catch(l){g.error("Error al registrar la entrada"),console.error("Error saving entry:",l)}},[i,B,w,z,x,u,I]),ae=n.useCallback(()=>{if(E)try{const t=new Date().toISOString().slice(0,16),r=p.find(a=>a.id===E);N(E,{fechaSalida:t,estado:"finalizado"}),r&&(w(r.celdaId,{estado:"disponible",ocupada:!1}),z(r.vehiculoId,{celdaId:""})),g.success("Salida registrada exitosamente"),R(!1),T(null)}catch(t){g.error("Error al registrar la salida"),console.error("Error registering exit:",t)}},[E,N,w,z,p]),H=n.useCallback(t=>{if(!t)return"—";try{return new Date(t).toLocaleString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return t}},[]),ne=n.useCallback((t,r)=>{const a=new Date(t),d=(r?new Date(r):new Date).getTime()-a.getTime(),c=Math.floor(d/(1e3*60*60)),h=Math.floor(d%(1e3*60*60)/(1e3*60));return c>0?`${c}h ${h}min`:`${h}min`},[]);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .control-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .control-row{
          transition: all 0.15s ease;
          border-bottom: 1px solid ${o.border};
        }
        .control-row:hover{
          background: #F8FAF8;
          transform: scale(1.001);
        }
        .action-btn{
          transition: all 0.15s ease;
          border-radius: 8px;
          padding: 6px 12px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .action-btn:hover{
          transform: scale(1.02);
        }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${o.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
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
          background: ${o.infoBg};
          color: ${o.info};
        }
        .status-badge.completed {
          background: ${o.successBg};
          color: ${o.success};
        }
        .hero-banner {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 8px;
          min-width: 280px;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .toolbar-search {
          flex: 1;
          position: relative;
          min-width: 200px;
        }
        .table-header {
          display: grid;
          background: #F8FAF8;
          border-bottom: 2px solid ${o.border};
          padding: 12px 16px;
          font-size: 10px;
          font-weight: 800;
          color: ${o.textLight};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .table-row {
          display: grid;
          padding: 14px 16px;
          align-items: center;
          font-size: 12px;
        }
        .cell-label {
          display: none;
        }

        @media (max-width: 1024px) {
          .table-header, .table-row {
            grid-template-columns: minmax(140px,1fr) minmax(140px,1fr) 80px minmax(140px,1fr) 150px 150px 90px 110px !important;
            gap: 8px;
          }
        }

        @media (max-width: 768px) {
          .hero-banner {
            flex-direction: column;
            align-items: stretch;
          }
          .hero-stats {
            grid-template-columns: repeat(2,1fr);
            min-width: 0;
            width: 100%;
          }
          .toolbar-search {
            min-width: 100%;
            order: 1;
          }
          .toolbar select {
            flex: 1;
            min-width: 140px;
            order: 2;
          }
          .toolbar > button {
            flex: 1;
            justify-content: center;
            order: 3;
          }
          .table-header, .table-row {
            grid-template-columns: 1fr !important;
            gap: 10px;
            padding: 14px 16px;
          }
          .table-header {
            display: none;
          }
          .table-row {
            border-bottom: none;
            background: #fff;
            border: 1px solid ${o.border};
            border-radius: 14px;
            margin: 0 12px 10px 12px;
            box-shadow: 0 1px 4px rgba(15,23,42,.04);
          }
          .control-row:hover {
            transform: none;
          }
          .cell-label {
            display: block;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: ${o.textMuted};
            margin-bottom: 3px;
          }
          .table-row > div {
            display: flex;
            flex-direction: column;
            align-items: flex-start !important;
          }
          .table-row > div:last-child {
            flex-direction: row;
            align-items: center !important;
            justify-content: flex-end !important;
            padding-top: 6px;
            border-top: 1px dashed ${o.border};
            margin-top: 4px;
          }
        }

        @media (max-width: 480px) {
          .hero-stats {
            grid-template-columns: repeat(2,1fr);
          }
        }
      `}),e.jsxs("div",{className:"control-root",style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{style:{position:"relative",overflow:"hidden",borderRadius:20,background:"linear-gradient(135deg,#39A900,#2D7D00)",padding:"1.4rem 1.6rem",color:"#fff"},children:[e.jsx("div",{style:{position:"absolute",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{className:"hero-banner",style:{position:"relative",zIndex:2},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:8},children:[e.jsx(Y,{size:11})," Movimiento de vehículos"]}),e.jsx("h1",{style:{fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:900,lineHeight:1,marginBottom:4},children:"Entrada y Salida"}),e.jsx("p",{style:{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:"Registra y gestiona el flujo de vehículos en el parqueadero institucional."})]}),e.jsx("div",{className:"hero-stats",children:[{label:"En parqueadero",value:x.length,icon:D,color:"#3B82F6"},{label:"Salidas",value:te.length,icon:W,color:"#22C55E"},{label:"Celdas libres",value:b.length,icon:U,color:"#F59E0B"},{label:"Total registros",value:p.length,icon:ce,color:"#8B5CF6"}].map(t=>e.jsxs("div",{style:{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"8px 10px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:8,fontWeight:700,letterSpacing:1,color:"rgba(255,255,255,.65)",textTransform:"uppercase",marginBottom:2},children:t.label}),e.jsxs("div",{style:{fontSize:20,fontWeight:900,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4},children:[e.jsx("span",{children:t.value}),e.jsx("span",{style:{fontSize:12,opacity:.6},children:t.icon&&e.jsx(t.icon,{size:12})})]})]},t.label))})]})]}),e.jsxs("div",{className:"toolbar",children:[e.jsxs("div",{className:"toolbar-search",children:[e.jsx(X,{size:14,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:o.textLight}}),e.jsx("input",{placeholder:"Buscar por placa, celda, conductor...",value:F,onChange:t=>P(t.target.value),style:{width:"100%",padding:"10px 14px 10px 36px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,background:"#fff",fontFamily:"inherit"},"aria-label":"Buscar registros"})]}),e.jsxs("select",{value:v,onChange:t=>A(t.target.value),style:{padding:"10px 14px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",cursor:"pointer"},"aria-label":"Filtrar por estado",children:[e.jsx("option",{value:"todos",children:"Todos"}),e.jsx("option",{value:"en_parqueadero",children:"En parqueadero"}),e.jsx("option",{value:"finalizado",children:"Finalizados"})]}),e.jsxs("button",{onClick:oe,style:{padding:"10px 18px",borderRadius:11,border:"none",background:o.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 14px rgba(57,169,0,.25)",transition:"all 0.2s ease",whiteSpace:"nowrap"},onMouseEnter:t=>{t.currentTarget.style.transform="scale(1.02)",t.currentTarget.style.boxShadow="0 6px 20px rgba(57,169,0,.35)"},onMouseLeave:t=>{t.currentTarget.style.transform="scale(1)",t.currentTarget.style.boxShadow="0 4px 14px rgba(57,169,0,.25)"},children:[e.jsx(ge,{size:15})," Registrar Entrada"]})]}),(F||v!=="todos")&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,padding:"0 4px"},children:[e.jsxs("p",{style:{fontSize:11,color:o.textLight},children:["Mostrando ",e.jsx("strong",{children:y.length})," registro",y.length!==1?"s":""]}),e.jsxs("button",{onClick:()=>{P(""),A("todos")},style:{fontSize:11,fontWeight:600,color:o.primary,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4},children:[e.jsx(Q,{size:12})," Limpiar filtros"]})]}),e.jsxs("div",{style:{borderRadius:16,border:`1px solid ${o.border}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(15,23,42,.05)"},children:[e.jsxs("div",{className:"table-header",style:{gridTemplateColumns:"minmax(180px,1fr) minmax(160px,1fr) 90px minmax(160px,1fr) 160px 160px 100px 120px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Z,{size:12})," Vehículo"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(pe,{size:12})," Conductor"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(fe,{size:12})," Celda"]}),e.jsx("div",{children:"Parqueadero"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(D,{size:12})," Entrada"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(W,{size:12})," Salida"]}),e.jsx("div",{children:"Estadía"}),e.jsx("div",{style:{textAlign:"right"},children:"Acciones"})]}),e.jsx("div",{children:y.length===0?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 24px",color:o.textLight},children:[e.jsx(Y,{size:36,color:o.border,style:{marginBottom:12}}),e.jsx("p",{style:{fontWeight:600,fontSize:13},children:"No se encontraron registros"}),e.jsx("p",{style:{fontSize:11,marginTop:4},children:"Prueba con otros filtros o registra una entrada"})]}):y.map(t=>{const r=u(t.vehiculoId),a=I(t.celdaId),l=q(t.vehiculoId),d=a?ee(a.parqueaderoId):null,c=t.estado==="en_parqueadero";return e.jsxs("div",{className:"control-row table-row",style:{gridTemplateColumns:"minmax(180px,1fr) minmax(160px,1fr) 90px minmax(160px,1fr) 160px 160px 100px 120px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"rgba(57,169,0,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(Z,{size:16,color:o.primary})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:800,color:o.text},children:(r==null?void 0:r.placa)||"—"}),e.jsx("div",{style:{fontSize:10,color:o.textLight},children:r?`${r.marca} ${r.modelo}`:"—"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Conductor"}),e.jsx("div",{style:{fontWeight:600,color:o.text},children:(l==null?void 0:l.nombre)||"—"}),e.jsx("div",{style:{fontSize:10,color:o.textLight},children:(l==null?void 0:l.identificacion)||""})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Celda"}),e.jsx("span",{style:{padding:"2px 10px",borderRadius:999,fontSize:10,fontWeight:700,background:o.infoBg,color:o.info},children:(a==null?void 0:a.numero)||"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Parqueadero"}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:4,fontSize:11,color:o.text},children:[e.jsx(U,{size:12,color:o.textLight}),(d==null?void 0:d.nombre)||"—"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Entrada"}),e.jsx("span",{style:{fontSize:11,color:o.text},children:H(t.fechaEntrada)})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Salida"}),e.jsx("span",{style:{fontSize:11,color:t.fechaSalida?o.text:o.textLight},children:t.fechaSalida?H(t.fechaSalida):"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Estadía"}),e.jsx("span",{style:{fontSize:11,fontWeight:600,color:o.textLight},children:ne(t.fechaEntrada,t.fechaSalida)})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"flex-end",gap:6},children:[c&&e.jsxs("button",{className:"action-btn",onClick:()=>re(t.id),style:{background:o.primary,color:"#fff",padding:"6px 14px"},onMouseEnter:h=>{h.currentTarget.style.background=o.primaryDark},onMouseLeave:h=>{h.currentTarget.style.background=o.primary},children:[e.jsx(W,{size:13}),"Salida"]}),!c&&e.jsxs("span",{style:{fontSize:11,fontWeight:700,color:o.success,display:"flex",alignItems:"center",gap:4},children:[e.jsx(xe,{size:14}),"Completado"]})]})]},t.id)})}),y.length>0&&e.jsxs("div",{style:{padding:"10px 16px",borderTop:`1px solid ${o.border}`,background:"#F8FAF8",fontSize:11,color:o.textLight,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6},children:[e.jsxs("span",{children:["Mostrando ",e.jsx("strong",{children:y.length})," de"," ",e.jsx("strong",{children:p.length})," registros"]}),e.jsxs("span",{style:{fontSize:10,color:o.textMuted},children:["Última actualización: ",new Date().toLocaleTimeString("es-CO")]})]})]})]}),e.jsx(ue,{open:J,onClose:()=>j(!1),maxWidth:580,children:e.jsxs("div",{children:[e.jsxs("div",{style:{padding:"1.4rem 1.8rem",borderBottom:`1px solid ${o.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"rgba(57,169,0,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(D,{size:18,color:o.primary})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:800,letterSpacing:1,color:o.primary,textTransform:"uppercase"},children:"Movimiento de vehículos"}),e.jsx("h2",{style:{fontSize:20,fontWeight:900,color:o.text,lineHeight:1},children:"Registrar Entrada"})]})]}),e.jsx("button",{onClick:()=>j(!1),style:{width:34,height:34,borderRadius:9,border:`1px solid ${o.border}`,background:"#fff",cursor:"pointer",color:o.textLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},"aria-label":"Cerrar formulario",children:e.jsx(Q,{size:16})})]}),e.jsx("div",{style:{padding:"1.4rem 1.8rem"},children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:700,color:o.text,marginBottom:6},children:"Vehículo *"}),e.jsxs("div",{style:{position:"relative",marginBottom:6},children:[e.jsx(X,{size:14,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:o.textLight}}),e.jsx("input",{type:"text",placeholder:"Buscar vehículo por placa, marca o modelo...",value:L,onChange:t=>O(t.target.value),style:{width:"100%",padding:"9px 12px 9px 36px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,background:"#F8FAFC",fontFamily:"inherit",outline:"none"}})]}),e.jsxs("select",{value:i.vehiculoId,onChange:t=>{S({...i,vehiculoId:t.target.value}),S(r=>({...r,celdaId:""}))},style:{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC"},required:!0,children:[e.jsx("option",{value:"",children:"Seleccionar vehículo..."}),_.map(t=>{const r=k.find(c=>c.id===t.conductorId),a=r?$.find(c=>c.id===r.usuarioId):null,l=x.some(c=>c.vehiculoId===t.id),d=t.tipo?` [${t.tipo}]`:"";return e.jsxs("option",{value:t.id,children:[t.placa," — ",t.marca," ",t.modelo,d," (",(a==null?void 0:a.nombre)||"Sin conductor",")",l?" ⚠️ Ya en parqueadero":""]},t.id)})]}),i.vehiculoId&&x.some(t=>t.vehiculoId===i.vehiculoId)&&e.jsx("p",{style:{fontSize:10,color:o.danger,marginTop:4},children:"⚠️ Este vehículo ya se encuentra en el parqueadero"}),L&&_.length===0&&e.jsx("p",{style:{fontSize:10,color:o.warning,marginTop:4},children:"No se encontraron vehículos con ese criterio."})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:700,color:o.text,marginBottom:6},children:"Celda disponible *"}),e.jsxs("select",{value:i.celdaId,onChange:t=>S({...i,celdaId:t.target.value}),style:{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC"},required:!0,children:[e.jsx("option",{value:"",children:"Seleccionar celda..."}),f.map(t=>{const r=M.find(l=>l.id===t.parqueaderoId),a=t.tipo?` (${t.tipo})`:"";return e.jsxs("option",{value:t.id,children:[t.numero," — ",(r==null?void 0:r.nombre)||"Sin parqueadero",a]},t.id)})]}),s&&s.tipo&&e.jsx(e.Fragment,{children:f.length===0?e.jsxs("p",{style:{fontSize:10,color:o.danger,marginTop:4},children:["⚠️ No hay celdas disponibles del tipo ",e.jsx("strong",{children:s.tipo}),". Por favor libera una celda compatible o selecciona otro vehículo."]}):e.jsxs("p",{style:{fontSize:10,color:o.textLight,marginTop:4},children:["Mostrando solo celdas de tipo ",e.jsx("strong",{children:s.tipo}),"."]})}),!s&&b.length===0&&e.jsx("p",{style:{fontSize:10,color:o.danger,marginTop:4},children:"⚠️ No hay celdas disponibles en el sistema."})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:12,fontWeight:700,color:o.text,marginBottom:6},children:"Fecha y hora de entrada *"}),e.jsx("input",{type:"datetime-local",value:i.fechaEntrada,onChange:t=>S({...i,fechaEntrada:t.target.value}),style:{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC"},required:!0})]})]})}),e.jsxs("div",{style:{padding:"1rem 1.8rem",borderTop:`1px solid ${o.border}`,display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap"},children:[e.jsx("button",{onClick:()=>j(!1),style:{padding:"10px 20px",borderRadius:12,border:`1px solid ${o.border}`,background:"#fff",color:o.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flex:"1 1 auto"},children:"Cancelar"}),e.jsx("button",{onClick:ie,disabled:!i.vehiculoId||!i.celdaId||x.some(t=>t.vehiculoId===i.vehiculoId)||s&&s.tipo&&!f.some(t=>t.id===i.celdaId),style:{padding:"10px 24px",borderRadius:12,border:"none",background:i.vehiculoId&&i.celdaId&&!x.some(t=>t.vehiculoId===i.vehiculoId)&&(!s||!s.tipo||f.some(t=>t.id===i.celdaId))?o.primary:o.border,color:i.vehiculoId&&i.celdaId&&!x.some(t=>t.vehiculoId===i.vehiculoId)&&(!s||!s.tipo||f.some(t=>t.id===i.celdaId))?"#fff":o.textLight,fontSize:13,fontWeight:800,cursor:i.vehiculoId&&i.celdaId&&!x.some(t=>t.vehiculoId===i.vehiculoId)&&(!s||!s.tipo||f.some(t=>t.id===i.celdaId))?"pointer":"default",fontFamily:"inherit",boxShadow:i.vehiculoId&&i.celdaId&&!x.some(t=>t.vehiculoId===i.vehiculoId)&&(!s||!s.tipo||f.some(t=>t.id===i.celdaId))?"0 6px 18px rgba(57,169,0,.22)":"none",flex:"1 1 auto"},children:"Registrar Entrada"})]})]})}),e.jsx(he,{open:K,onConfirm:ae,onCancel:()=>{R(!1),T(null)},title:"Registrar Salida",message:"¿Estás seguro de registrar la salida de este vehículo? Esta acción actualizará el estado de la celda a disponible.",confirmLabel:"Confirmar",tone:"info"})]})}export{ze as ControlSalidaPage};

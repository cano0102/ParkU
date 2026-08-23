import{c as O,j as e,t as V,x as ae,r as i,h as re,a2 as B,a3 as N,C as A,$ as ie,X as oe,O as se,d as ne}from"./index-CQbT-iSH.js";import{u as le,c as de}from"./useControlSalida-DkIf0QNw.js";import{u as ce,b as pe,C as _}from"./useConductores-0Y7AHn_F.js";import{a as xe,u as ge}from"./useCeldas-CL0TP7y7.js";import{M as he}from"./Modal-CedKtcXA.js";import{S as fe}from"./search-8LNTG_Jc.js";import{M as ue}from"./map-pin-CPD5C2gs.js";import{T as me}from"./trash-2-BWycFE-z.js";import"./controlSalida-DA1Er7mX.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],ye=O("chevron-left",be);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]],H=O("log-in",je),f=V,ve={danger:f.danger,success:f.success,info:f.info};function we({open:d,onConfirm:x,onCancel:c,title:u,message:k,confirmLabel:m="Eliminar",tone:z="danger"}){return e.jsx(he,{open:d,onClose:c,maxWidth:420,title:u,children:e.jsxs("div",{style:{padding:"1.8rem"},children:[e.jsx("h3",{style:{fontSize:18,fontWeight:900,color:f.text,marginBottom:8},children:u}),e.jsx("p",{style:{fontSize:13,color:f.textLight,lineHeight:1.6,marginBottom:20},children:k}),e.jsxs("div",{style:{display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{onClick:c,style:{padding:"10px 20px",borderRadius:10,border:`1px solid ${f.border}`,background:"#fff",color:f.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},children:"Cancelar"}),e.jsx("button",{onClick:x,style:{padding:"10px 20px",borderRadius:10,border:"none",background:ve[z],color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"},children:m})]})]})})}const a=V,S=8;function Ce(d,x){const c=new Date(d);return c.getFullYear()===x.getFullYear()&&c.getMonth()===x.getMonth()&&c.getDate()===x.getDate()}function Re(){var T;const{data:d=[]}=le(),{data:x=[]}=ce(),{data:c=[]}=xe(),{data:u=[]}=pe(),{data:k=[]}=ae(),{data:m=[]}=ge(),z=de(),F=i.useCallback(t=>z.mutate(t),[z]),[C,R]=i.useState(""),[b,D]=i.useState("todos"),[y,P]=i.useState("todos"),[U,I]=i.useState(1),[j,E]=i.useState(null),v=i.useCallback(t=>x.find(r=>r.id===t),[x]),M=i.useCallback(t=>c.find(r=>r.id===t),[c]),L=i.useCallback(t=>m.find(r=>r.id===t),[m]),W=i.useCallback(t=>{const r=v(t);return r?u.find(o=>o.id===r.conductorId):null},[x,u,v]),$=i.useCallback(t=>{const r=W(t);return r?k.find(o=>o.id===r.usuarioId):null},[u,k,W]),Y=i.useMemo(()=>c.filter(t=>t.estado==="disponible"),[c]),G=i.useMemo(()=>d.filter(t=>t.estado==="en_parqueadero"),[d]),X=i.useMemo(()=>d.filter(t=>t.estado==="finalizado"),[d]),g=i.useMemo(()=>d.filter(t=>{const r=v(t.vehiculoId),o=M(t.celdaId),s=$(t.vehiculoId),p=o?L(o.parqueaderoId):null,l=C.toLowerCase(),w=(r==null?void 0:r.placa.toLowerCase().includes(l))||(o==null?void 0:o.numero.toLowerCase().includes(l))||(s==null?void 0:s.nombre.toLowerCase().includes(l))||(s==null?void 0:s.identificacion.includes(l))||(r==null?void 0:r.marca.toLowerCase().includes(l))||(r==null?void 0:r.modelo.toLowerCase().includes(l)),ee=b==="todos"?!0:t.estado===b,te=y==="todos"?!0:(p==null?void 0:p.id)===y;return w&&ee&&te}).sort((t,r)=>new Date(r.fechaEntrada).getTime()-new Date(t.fechaEntrada).getTime()),[d,C,b,y,v,M,$,L]);i.useEffect(()=>{I(1)},[C,b,y]);const h=Math.max(1,Math.ceil(g.length/S)),n=Math.min(U,h),Z=i.useMemo(()=>g.slice((n-1)*S,n*S),[g,n]),J=i.useCallback(t=>{E(t)},[]),K=i.useCallback(()=>{j&&(F(j.id),re.success("Registro eliminado correctamente"),E(null))},[j,F]),q=i.useCallback(t=>{if(!t)return"—";try{return new Date(t).toLocaleString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return t}},[]),Q=i.useCallback((t,r)=>{const o=new Date(t),p=(r?new Date(r):new Date).getTime()-o.getTime(),l=Math.floor(p/(1e3*60*60)),w=Math.floor(p%(1e3*60*60)/(1e3*60));return l>0?`${l}h ${w}min`:`${w}min`},[]);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .control-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .control-row{
          transition: all 0.15s ease;
          border-bottom: 1px solid ${a.border};
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
          border-color:${a.primary} !important;
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
          background: ${a.infoBg};
          color: ${a.info};
        }
        .status-badge.completed {
          background: ${a.successBg};
          color: ${a.success};
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
          border-bottom: 2px solid ${a.border};
          padding: 12px 16px;
          font-size: 10px;
          font-weight: 800;
          color: ${a.textLight};
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
            border: 1px solid ${a.border};
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
            color: ${a.textMuted};
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
            border-top: 1px dashed ${a.border};
            margin-top: 4px;
          }
        }

        @media (max-width: 480px) {
          .hero-stats {
            grid-template-columns: repeat(2,1fr);
          }
        }
      `}),e.jsxs("div",{className:"control-root",style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{style:{position:"relative",overflow:"hidden",borderRadius:20,background:"linear-gradient(135deg,#39A900,#2D7D00)",padding:"1.4rem 1.6rem",color:"#fff"},children:[e.jsx("div",{style:{position:"absolute",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{className:"hero-banner",style:{position:"relative",zIndex:2},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:8},children:[e.jsx(B,{size:11})," Movimiento de vehículos"]}),e.jsx("h1",{style:{fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:900,lineHeight:1,marginBottom:4},children:"Entrada y Salida"}),e.jsx("p",{style:{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:"Historial de movimientos. Para registrar una entrada o una salida, hazlo desde la celda en el módulo de Parqueaderos."})]}),e.jsx("div",{className:"hero-stats",children:[{label:"En parqueadero",value:G.length,icon:H,color:"#3B82F6"},{label:"Salidas",value:X.length,icon:N,color:"#22C55E"},{label:"Celdas libres",value:Y.length,icon:A,color:"#F59E0B"},{label:"Total registros",value:d.length,icon:ie,color:"#8B5CF6"}].map(t=>e.jsxs("div",{style:{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"8px 10px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:8,fontWeight:700,letterSpacing:1,color:"rgba(255,255,255,.65)",textTransform:"uppercase",marginBottom:2},children:t.label}),e.jsxs("div",{style:{fontSize:20,fontWeight:900,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4},children:[e.jsx("span",{children:t.value}),e.jsx("span",{style:{fontSize:12,opacity:.6},children:t.icon&&e.jsx(t.icon,{size:12})})]})]},t.label))})]})]}),e.jsxs("div",{className:"toolbar",children:[e.jsxs("div",{className:"toolbar-search",children:[e.jsx(fe,{size:14,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:a.textLight}}),e.jsx("input",{placeholder:"Buscar por placa, celda, conductor...",value:C,onChange:t=>R(t.target.value),style:{width:"100%",padding:"10px 14px 10px 36px",borderRadius:11,border:`1px solid ${a.border}`,fontSize:13,background:"#fff",fontFamily:"inherit"},"aria-label":"Buscar registros"})]}),e.jsxs("select",{value:b,onChange:t=>D(t.target.value),style:{padding:"10px 14px",borderRadius:11,border:`1px solid ${a.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",cursor:"pointer"},"aria-label":"Filtrar por estado",children:[e.jsx("option",{value:"todos",children:"Todos los estados"}),e.jsx("option",{value:"en_parqueadero",children:"En parqueadero"}),e.jsx("option",{value:"finalizado",children:"Finalizados"})]}),m.length>1&&e.jsxs("select",{value:y,onChange:t=>P(t.target.value),style:{padding:"10px 14px",borderRadius:11,border:`1px solid ${a.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",cursor:"pointer"},"aria-label":"Filtrar por parqueadero",children:[e.jsx("option",{value:"todos",children:"Todos los parqueaderos"}),m.map(t=>e.jsx("option",{value:t.id,children:t.nombre},t.id))]})]}),(C||b!=="todos"||y!=="todos")&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,padding:"0 4px"},children:[e.jsxs("p",{style:{fontSize:11,color:a.textLight},children:["Mostrando ",e.jsx("strong",{children:g.length})," registro",g.length!==1?"s":""]}),e.jsxs("button",{onClick:()=>{R(""),D("todos"),P("todos")},style:{fontSize:11,fontWeight:600,color:a.primary,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4},children:[e.jsx(oe,{size:12})," Limpiar filtros"]})]}),e.jsxs("div",{style:{borderRadius:16,border:`1px solid ${a.border}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(15,23,42,.05)"},children:[e.jsxs("div",{className:"table-header",style:{gridTemplateColumns:"minmax(155px,1fr) minmax(135px,1fr) 85px minmax(135px,1fr) 150px 150px 90px 140px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(_,{size:12})," Vehículo"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(se,{size:12})," Conductor"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(ue,{size:12})," Celda"]}),e.jsx("div",{children:"Parqueadero"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(H,{size:12})," Entrada"]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(N,{size:12})," Salida"]}),e.jsx("div",{children:"Estadía"}),e.jsx("div",{style:{textAlign:"right"},children:"Acciones"})]}),e.jsx("div",{children:g.length===0?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 24px",color:a.textLight},children:[e.jsx(B,{size:36,color:a.border,style:{marginBottom:12}}),e.jsx("p",{style:{fontWeight:600,fontSize:13},children:"No se encontraron registros"}),e.jsx("p",{style:{fontSize:11,marginTop:4},children:"Prueba con otros filtros. Las entradas se registran desde el módulo de Parqueaderos."})]}):Z.map(t=>{const r=v(t.vehiculoId),o=M(t.celdaId),s=$(t.vehiculoId),p=o?L(o.parqueaderoId):null,l=t.estado==="en_parqueadero",w=Ce(t.fechaEntrada,new Date);return e.jsxs("div",{className:"control-row table-row",style:{gridTemplateColumns:"minmax(155px,1fr) minmax(135px,1fr) 85px minmax(135px,1fr) 150px 150px 90px 140px",borderLeft:`3px solid ${l?a.info:"transparent"}`},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"rgba(57,169,0,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:e.jsx(_,{size:16,color:a.primary})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:800,color:a.text},children:(r==null?void 0:r.placa)||"—"}),e.jsx("div",{style:{fontSize:10,color:a.textLight},children:r?`${r.marca} ${r.modelo}`:"—"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Conductor"}),e.jsx("div",{style:{fontWeight:600,color:a.text},children:(s==null?void 0:s.nombre)||"—"}),e.jsx("div",{style:{fontSize:10,color:a.textLight},children:(s==null?void 0:s.identificacion)||""})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Celda"}),e.jsx("span",{style:{padding:"2px 10px",borderRadius:999,fontSize:10,fontWeight:700,background:a.infoBg,color:a.info},children:(o==null?void 0:o.numero)||"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Parqueadero"}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:4,fontSize:11,color:a.text},children:[e.jsx(A,{size:12,color:a.textLight}),(p==null?void 0:p.nombre)||"—"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Entrada"}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:6,fontSize:11,color:a.text},children:[q(t.fechaEntrada),w&&e.jsx("span",{style:{fontSize:8,fontWeight:800,letterSpacing:.3,textTransform:"uppercase",color:a.primary,background:"rgba(57,169,0,.1)",padding:"1px 6px",borderRadius:999},children:"Hoy"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Salida"}),e.jsx("span",{style:{fontSize:11,color:t.fechaSalida?a.text:a.textLight},children:t.fechaSalida?q(t.fechaSalida):"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"cell-label",children:"Estadía"}),e.jsx("span",{style:{fontSize:11,fontWeight:600,color:a.textLight},children:Q(t.fechaEntrada,t.fechaSalida)})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10},children:[l?e.jsxs("span",{title:"En parqueadero",style:{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,fontSize:10,fontWeight:700,whiteSpace:"nowrap",background:a.infoBg,color:a.info},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:a.info,flexShrink:0}}),"Activo"]}):e.jsxs("span",{title:"Completado",style:{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,fontSize:10,fontWeight:700,whiteSpace:"nowrap",background:a.successBg,color:a.success},children:[e.jsx("span",{style:{width:6,height:6,borderRadius:"50%",background:a.success,flexShrink:0}}),"Completado"]}),e.jsx("button",{className:"action-btn",title:"Eliminar","aria-label":"Eliminar registro",onClick:()=>J(t),style:{background:"transparent",color:a.danger,padding:6},children:e.jsx(me,{size:13})})]})]},t.id)})}),g.length>0&&e.jsxs("div",{style:{padding:"10px 16px",borderTop:`1px solid ${a.border}`,background:"#F8FAF8",fontSize:11,color:a.textLight,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10},children:[e.jsxs("span",{children:["Mostrando"," ",e.jsxs("strong",{children:[(n-1)*S+1,"–",Math.min(n*S,g.length)]})," ","de ",e.jsx("strong",{children:g.length})," registros"]}),h>1&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx("button",{onClick:()=>I(t=>Math.max(1,t-1)),disabled:n===1,"aria-label":"Página anterior",style:{width:26,height:26,borderRadius:7,border:`1px solid ${a.border}`,background:"#fff",color:n===1?a.textMuted:a.text,cursor:n===1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(ye,{size:13})}),e.jsxs("span",{style:{fontSize:11,fontWeight:700,color:a.text,minWidth:60,textAlign:"center"},children:["Pág. ",n," de ",h]}),e.jsx("button",{onClick:()=>I(t=>Math.min(h,t+1)),disabled:n===h,"aria-label":"Página siguiente",style:{width:26,height:26,borderRadius:7,border:`1px solid ${a.border}`,background:"#fff",color:n===h?a.textMuted:a.text,cursor:n===h?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(ne,{size:13})})]})]})]})]}),e.jsx(we,{open:!!j,onConfirm:K,onCancel:()=>E(null),title:"Eliminar registro",message:`El registro del vehículo ${j?((T=v(j.vehiculoId))==null?void 0:T.placa)||"—":""} se eliminará permanentemente. Esta acción no se puede revertir.`,confirmLabel:"Eliminar",tone:"danger"})]})}export{Re as ControlSalidaPage};

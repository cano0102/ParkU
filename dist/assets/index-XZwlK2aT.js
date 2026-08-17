import{c as le,t as eo,j as e,S as ze,U as oo,X as de,g as to,M as io,H as ro,r as s,J as ao,a as so,K as no,e as I,O as lo}from"./index-BWzTIa0U.js";import{M as ke}from"./Modal-BQ7uHy7r.js";import{C as co}from"./ConfirmDialog-DUMhrOIl.js";import{G as po,B as Ee}from"./graduation-cap-Dn1O-iDP.js";import{C as K}from"./car-BmGoQ1Yj.js";import{B as Ie,A as xo}from"./bike-C7O4b7vE.js";import{U as uo,L as go,F as $}from"./FormField-gpf47Gk5.js";import{L as ho}from"./layout-grid-DbPPK8AG.js";import{P as bo}from"./plus-D1DmVZ21.js";import{P as ce}from"./pencil-DDAuoPeN.js";import{T as $e}from"./trash-2-BZ1xZCnb.js";import"./index-BaY7DVG2.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fo=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],mo=le("book-open",fo);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yo=[["path",{d:"M15.6 2.7a10 10 0 1 0 5.7 5.7",key:"1e0p6d"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M13.4 10.6 19 5",key:"1kr7tw"}]],we=le("circle-gauge",yo);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jo=[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]],vo=le("palette",jo),o=eo,Se=[["#39A900","#2D7D00"],["#2563EB","#1D4ED8"],["#8B5CF6","#7C3AED"],["#F59E0B","#D97706"],["#EF4444","#DC2626"],["#0891B2","#0E7490"]],X=a=>{const r=((a==null?void 0:a.charCodeAt(0))??0)%Se.length;return Se[r]},pe=a=>a.split(" ").slice(0,2).map(r=>r[0]).join("").toUpperCase(),Me=a=>a==="instructor"?{bg:"#EFF6FF",text:"#1D4ED8",border:"#BFDBFE",dot:"#2563EB",label:"Instructor",icon:po}:{bg:"#FFFBEB",text:"#92400E",border:"#FDE68A",dot:"#F59E0B",label:"Aprendiz",icon:mo},ne=a=>a==="carro"?{bg:"#EFF6FF",text:"#2563EB",border:"#BFDBFE",dot:"#3B82F6",label:"Carro",icon:K}:{bg:"#FFFBEB",text:"#D97706",border:"#FDE68A",dot:"#F59E0B",label:"Moto",icon:Ie},k=a=>{const r=document.createElement("div");return r.textContent=a,r.innerHTML},Co=/^[A-Z0-9]{5,8}$/,F={width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:o.bg,color:o.text},ko={border:"1px solid #FCA5A5",background:"#FEF2F2"},Fe=()=>({usuarioId:"",tipoConductor:"aprendiz",centroFormacion:"",discapacidad:!1,tipoDiscapacidad:"",estado:"activo",placa:"",tipoVehiculo:"carro",marca:"",descripcionVehiculo:""});function wo({totalConductores:a,totalActivos:r,totalVehiculos:x,totalCarros:g,totalMotos:u}){return e.jsxs("div",{style:{position:"relative",overflow:"hidden",borderRadius:20,background:"linear-gradient(135deg,#39A900,#2D7D00)",padding:"1.4rem 1.6rem",color:"#fff"},children:[e.jsx("div",{style:{position:"absolute",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:8},children:[e.jsx(ze,{size:11})," Gestión integral"]}),e.jsx("h1",{style:{fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:900,lineHeight:1,marginBottom:4},children:"Conductores y Vehículos"}),e.jsx("p",{style:{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:"Administra conductores, aprendices, instructores y vehículos autorizados del sistema SENA."})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,minWidth:280},children:[{label:"Conductores",value:a,icon:oo},{label:"Activos",value:r,icon:uo},{label:"Vehículos",value:x,icon:K},{label:"Carros/Motos",value:`${g}/${u}`,icon:Ie}].map(d=>e.jsxs("div",{style:{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"8px 10px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:8,fontWeight:700,letterSpacing:1,color:"rgba(255,255,255,.65)",textTransform:"uppercase",marginBottom:2},children:d.label}),e.jsx("div",{style:{fontSize:20,fontWeight:900,lineHeight:1},children:d.value})]},d.label))})]})]})}function So({search:a,onSearchChange:r,filterTipo:x,onFilterTipoChange:g,filterVehiculoTipo:u,onFilterVehiculoTipoChange:d,filterEstado:m,onFilterEstadoChange:n,viewMode:y,onViewModeChange:l,onCreate:f,activeFiltersCount:w,filteredCount:S,onClearFilters:j}){return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"},children:[e.jsx("div",{style:{flex:1,position:"relative",minWidth:180},children:e.jsx("input",{placeholder:"Buscar conductor, vehículo, identificación...",value:a,onChange:t=>r(t.target.value),style:F,"aria-label":"Buscar conductores"})}),e.jsxs("select",{value:x,onChange:t=>g(t.target.value),style:{...F,width:"auto",appearance:"none",paddingRight:28,cursor:"pointer"},"aria-label":"Filtrar por tipo",children:[e.jsx("option",{value:"todos",children:"Todos los tipos"}),e.jsx("option",{value:"aprendiz",children:"Aprendiz"}),e.jsx("option",{value:"instructor",children:"Instructor"})]}),e.jsxs("select",{value:u,onChange:t=>d(t.target.value),style:{...F,width:"auto",appearance:"none",paddingRight:28,cursor:"pointer"},"aria-label":"Filtrar por tipo de vehículo",children:[e.jsx("option",{value:"todos",children:"Todos los vehículos"}),e.jsx("option",{value:"carro",children:"Con Carro"}),e.jsx("option",{value:"moto",children:"Con Moto"})]}),e.jsxs("select",{value:m,onChange:t=>n(t.target.value),style:{...F,width:"auto",appearance:"none",paddingRight:28,cursor:"pointer"},"aria-label":"Filtrar por estado",children:[e.jsx("option",{value:"todos",children:"Todos"}),e.jsx("option",{value:"activo",children:"Activos"}),e.jsx("option",{value:"inactivo",children:"Inactivos"})]}),e.jsx("div",{className:"view-toggle",role:"group","aria-label":"Modo de visualización",children:[{mode:"grid",icon:e.jsx(ho,{size:14}),label:"Cuadrícula"},{mode:"list",icon:e.jsx(go,{size:14}),label:"Lista"}].map(t=>e.jsxs("button",{type:"button",onClick:()=>l(t.mode),title:t.label,"aria-label":t.label,"aria-pressed":y===t.mode,className:`view-toggle-btn${y===t.mode?" active":""}`,children:[t.icon,e.jsx("span",{className:"view-toggle-label",children:t.label})]},t.mode))}),e.jsxs("button",{onClick:f,style:{padding:"10px 18px",borderRadius:11,border:"none",background:o.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 14px rgba(57,169,0,.25)",transition:"all 0.2s ease"},onMouseEnter:t=>{t.currentTarget.style.transform="scale(1.02)",t.currentTarget.style.boxShadow="0 6px 20px rgba(57,169,0,.35)"},onMouseLeave:t=>{t.currentTarget.style.transform="scale(1)",t.currentTarget.style.boxShadow="0 4px 14px rgba(57,169,0,.25)"},children:[e.jsx(bo,{size:15})," Nuevo Conductor"]})]}),w>0&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("p",{style:{fontSize:11,color:o.textLight},children:["Mostrando ",e.jsx("strong",{children:S})," resultado",S!==1?"s":""]}),e.jsxs("button",{onClick:j,style:{fontSize:11,fontWeight:600,color:o.primary,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4},children:[e.jsx(de,{size:12})," Limpiar filtros"]})]})]})}function Fo({conductores:a,getUsuario:r,getVehiculosConductor:x,onToggleEstado:g,onViewVehiculo:u,onEdit:d,onDelete:m}){return e.jsx("div",{className:"conductores-grid",children:a.map(n=>{const y=r(n.usuarioId),l=x(n.id);if(!y)return null;const[f,w]=X(n.nombre),S=pe(n.nombre),j=Me(n.tipoConductor),t=n.estado==="activo",h=j.icon,v=l[0],z=v?ne(v.tipo):null;return e.jsxs("div",{className:`conductor-card${t?"":" is-inactive"}`,children:[e.jsx("div",{className:"status-rail",style:{background:t?o.primary:"#CBD5E1"}}),e.jsxs("div",{className:"card-top",children:[e.jsx("div",{className:"card-avatar",style:{background:`linear-gradient(135deg, ${f}, ${w})`},children:S}),e.jsxs("div",{className:"card-identity",children:[e.jsx("p",{className:"card-name",children:k(n.nombre)}),e.jsxs("p",{className:"card-doc",children:[y.tipoDocumento," · ",y.identificacion]})]}),e.jsx("button",{className:"card-switch",onClick:()=>g(n.id,n.estado),style:{background:t?o.primary:"#CBD5E1"},"aria-label":t?"Desactivar conductor":"Activar conductor",children:e.jsx("div",{className:"knob",style:{left:t?17:2}})})]}),e.jsxs("div",{className:"card-tags",children:[e.jsxs("span",{className:"card-tag",style:{background:j.bg,color:j.text},children:[e.jsx(h,{size:10}),j.label]}),e.jsx("span",{className:`status-badge ${t?"active":"inactive"}`,children:n.estado}),n.discapacidad&&e.jsxs("span",{className:"card-tag",style:{background:"#F3E8FF",color:"#9333EA"},children:[e.jsx(xo,{size:10}),"Discapacidad"]})]}),l.length===0?e.jsxs("div",{className:"plate-block",children:[e.jsx(K,{size:15,color:o.textMuted,style:{flexShrink:0}}),e.jsx("span",{className:"plate-empty",children:"Sin vehículo asignado"})]}):l.length===1&&v&&z?e.jsxs("div",{className:"plate-block has-plate",onClick:()=>u(v),style:{cursor:"pointer"},children:[e.jsx("span",{className:"plate-chip",children:v.placa}),e.jsxs("span",{className:"plate-meta",children:[v.marca," ",v.modelo]}),e.jsx(z.icon,{size:15,color:z.dot,style:{flexShrink:0}})]}):e.jsx("div",{className:"plate-list",children:l.map(E=>{const B=ne(E.tipo),Z=B.icon;return e.jsxs("div",{className:"plate-row",onClick:()=>u(E),children:[e.jsx("span",{className:"plate-chip",children:E.placa}),e.jsxs("span",{className:"plate-meta",children:[E.marca," ",E.modelo]}),e.jsx(Z,{size:13,color:B.dot,style:{flexShrink:0}})]},E.id)})}),e.jsxs("div",{className:"card-center",children:[e.jsx(Ee,{size:12,color:o.textLight}),e.jsx("span",{children:k(n.centroFormacion)||"—"})]}),e.jsxs("div",{className:"card-footer",children:[e.jsxs("span",{style:{fontSize:10,color:o.textLight,fontWeight:700},children:[l.length," vehículo",l.length!==1?"s":""]}),e.jsxs("div",{style:{display:"flex",gap:2},children:[e.jsx("button",{className:"action-btn",title:"Editar",onClick:()=>d(n),"aria-label":`Editar ${k(n.nombre)}`,children:e.jsx(ce,{size:14})}),e.jsx("button",{className:"action-btn danger",title:"Eliminar",onClick:()=>m(n),"aria-label":`Eliminar ${k(n.nombre)}`,children:e.jsx($e,{size:14})})]})]})]},n.id)})})}function zo({conductores:a,getUsuario:r,getVehiculosConductor:x,onToggleEstado:g,onViewVehiculo:u,onEdit:d,onDelete:m}){return e.jsxs("div",{className:"conductores-list",children:[e.jsxs("div",{className:"list-header",children:[e.jsx("span",{children:"Conductor"}),e.jsx("span",{children:"Centro de formación"}),e.jsx("span",{children:"Vehículo(s)"}),e.jsx("span",{children:"Tipo"}),e.jsx("span",{children:"Estado"}),e.jsx("span",{style:{textAlign:"right"},children:"Acciones"})]}),a.map(n=>{const y=r(n.usuarioId),l=x(n.id);if(!y)return null;const[f,w]=X(n.nombre),S=pe(n.nombre),j=Me(n.tipoConductor),t=n.estado==="activo",h=j.icon;return e.jsxs("div",{className:"list-row",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,minWidth:0},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:9,flexShrink:0,background:`linear-gradient(135deg,${f},${w})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff"},children:S}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("p",{style:{fontWeight:800,color:o.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:k(n.nombre)}),e.jsxs("p",{style:{fontSize:10,color:o.textLight,marginTop:1},children:[y.tipoDocumento," · ",y.identificacion]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,color:o.textLight,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:n.centroFormacion,children:[e.jsx(Ee,{size:11,style:{flexShrink:0}}),k(n.centroFormacion)||"—"]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[l.length===0?e.jsx("span",{style:{fontSize:11,color:o.textMuted,fontStyle:"italic"},children:"Sin vehículo"}):l.slice(0,2).map(v=>e.jsx("span",{className:"list-plate-chip",style:{cursor:"pointer",width:"fit-content"},onClick:()=>u(v),children:v.placa},v.id)),l.length>2&&e.jsxs("span",{style:{fontSize:10,color:o.textLight},children:["+",l.length-2," más"]})]}),e.jsx("div",{children:e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,fontSize:10,fontWeight:700,background:j.bg,color:j.text,border:`1px solid ${j.border}`,whiteSpace:"nowrap"},children:[e.jsx(h,{size:9})," ",j.label]})}),e.jsx("div",{children:e.jsxs("button",{onClick:()=>g(n.id,n.estado),title:t?"Desactivar":"Activar",style:{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:999,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.3,background:t?"rgba(57,169,0,.1)":"rgba(239,68,68,.08)",color:t?"#166534":"#B91C1C",fontFamily:"inherit"},"aria-label":t?"Desactivar conductor":"Activar conductor",children:[e.jsx("span",{style:{width:5,height:5,borderRadius:"50%",background:t?o.primary:"#EF4444"}}),n.estado]})}),e.jsxs("div",{style:{display:"flex",gap:4,justifyContent:"flex-end"},children:[e.jsx("button",{title:"Editar",onClick:()=>d(n),className:"action-btn",style:{width:26,height:26,border:`1px solid ${o.border}`,background:o.bg},"aria-label":"Editar",children:e.jsx(ce,{size:12})}),e.jsx("button",{title:"Eliminar",onClick:()=>m(n),className:"action-btn danger",style:{width:26,height:26,border:`1px solid ${o.border}`,background:"#FEF2F2",color:"#EF4444"},"aria-label":"Eliminar",children:e.jsx($e,{size:12})})]})]},n.id)})]})}function Eo({currentPage:a,totalPages:r,itemsPerPage:x,totalItems:g,viewMode:u,onPageChange:d,onItemsPerPageChange:m}){const y=Array.from({length:r},(l,f)=>f+1).filter(l=>l===1||l===r||Math.abs(l-a)<=1).reduce((l,f,w,S)=>(w>0&&f-S[w-1]>1&&l.push("ellipsis"),l.push(f),l),[]);return e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",justifyContent:"space-between",padding:"10px 4px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,fontSize:11,color:o.textLight},children:[e.jsxs("span",{children:["Mostrando"," ",e.jsxs("strong",{style:{color:o.text},children:[(a-1)*x+1,"–",Math.min(a*x,g)]})," ","de ",e.jsx("strong",{style:{color:o.text},children:g})]}),e.jsx("select",{value:x,onChange:l=>m(Number(l.target.value)),style:{...F,width:"auto",padding:"6px 10px",fontSize:11,appearance:"none",cursor:"pointer"},"aria-label":"Conductores por página",children:(u==="list"?[15,25,50,100]:[9,18,36,60]).map(l=>e.jsxs("option",{value:l,children:[l," por página"]},l))})]}),r>1&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:4},children:[e.jsx("button",{className:"page-btn",onClick:()=>d(Math.max(1,a-1)),disabled:a===1,style:{padding:"7px 12px",borderRadius:8,border:`1px solid ${o.border}`,background:"#fff",color:a===1?o.border:o.text,fontSize:11,fontWeight:700,cursor:a===1?"not-allowed":"pointer",fontFamily:"inherit"},children:"← Anterior"}),y.map((l,f)=>l==="ellipsis"?e.jsx("span",{style:{padding:"0 4px",color:o.textLight,fontSize:11},children:"…"},`e-${f}`):e.jsx("button",{className:"page-btn",onClick:()=>d(l),style:{width:30,height:30,borderRadius:8,border:l===a?"1px solid transparent":`1px solid ${o.border}`,background:l===a?o.primary:"#fff",color:l===a?"#fff":o.text,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"},children:l},l)),e.jsx("button",{className:"page-btn",onClick:()=>d(Math.min(r,a+1)),disabled:a===r,style:{padding:"7px 12px",borderRadius:8,border:`1px solid ${o.border}`,background:"#fff",color:a===r?o.border:o.text,fontSize:11,fontWeight:700,cursor:a===r?"not-allowed":"pointer",fontFamily:"inherit"},children:"Siguiente →"})]})]})}function Io({isEdit:a,formData:r,setFormData:x,formErrors:g,touched:u,markTouched:d,isValid:m,usuarioSearch:n,setUsuarioSearch:y,usuariosFiltrados:l,usuariosConConductorIds:f,usuarioSeleccionado:w,onSubmit:S,onCancel:j}){return e.jsxs("form",{onSubmit:t=>{t.preventDefault(),S()},children:[e.jsxs("div",{style:{padding:"1.4rem 1.8rem 1.2rem",borderBottom:`1px solid ${o.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"rgba(57,169,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(to,{size:18,color:o.primary})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:800,letterSpacing:1,color:o.primary,textTransform:"uppercase"},children:"Registro integral"}),e.jsx("h2",{style:{fontSize:20,fontWeight:900,color:o.text,lineHeight:1},children:a?"Editar Conductor":"Nuevo Conductor"})]})]}),e.jsx("button",{type:"button",onClick:j,style:{width:34,height:34,borderRadius:9,border:`1px solid ${o.border}`,background:"#fff",cursor:"pointer",color:o.textLight,display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar formulario",children:e.jsx(de,{size:16})})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem",display:"flex",flexDirection:"column",gap:"1.2rem"},children:[e.jsxs("section",{style:{borderRadius:14,border:`1px solid ${o.border}`,overflow:"hidden"},children:[e.jsx("div",{style:{padding:"10px 14px",background:o.bg,borderBottom:`1px solid ${o.border}`},children:e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:o.textLight,textTransform:"uppercase"},children:"Datos del conductor"})}),e.jsxs("div",{style:{padding:"1rem 1.2rem",display:"flex",flexDirection:"column",gap:12},children:[e.jsxs($,{label:"Usuario vinculado *",error:u.usuarioId?g.usuarioId:void 0,children:[e.jsx("input",{type:"text",placeholder:"Buscar por nombre, identificación o correo...",value:n,onChange:t=>y(t.target.value),style:F}),e.jsxs("div",{style:{marginTop:6,borderRadius:11,border:`1px solid ${o.border}`,padding:4,background:"#fff"},children:[l.length===0&&e.jsx("p",{style:{fontSize:11,color:o.textMuted,padding:"10px 8px"},children:"Sin resultados"}),l.map(t=>{const h=f.has(t.id),v=r.usuarioId===t.id;return e.jsxs("div",{className:`usuario-option${h?" disabled":""}`,onClick:()=>{h||(x({...r,usuarioId:t.id}),d("usuarioId"))},style:{background:v?"rgba(57,169,0,.1)":"transparent"},children:[e.jsx("div",{style:{width:30,height:30,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg, ${X(t.nombre)[0]}, ${X(t.nombre)[1]})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800},children:pe(t.nombre)}),e.jsxs("div",{style:{minWidth:0,flex:1},children:[e.jsx("p",{style:{fontSize:12,fontWeight:700,color:o.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:t.nombre}),e.jsxs("p",{style:{fontSize:10,color:o.textLight},children:[t.tipoDocumento," · ",t.identificacion,h?" — ya es conductor":""]})]}),v&&e.jsx(ze,{size:14,color:o.primary})]},t.id)})]}),w&&e.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"#F0FDF4",border:`1px solid ${o.primary}33`},children:[e.jsx(io,{size:13,color:o.primaryDark}),e.jsx("span",{style:{fontSize:11,color:o.primaryDark,fontWeight:700},children:w.correo}),e.jsxs("span",{style:{marginLeft:"auto",fontSize:10,color:o.textLight},children:["Seleccionado: ",w.nombre]})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:a?"1fr 1fr":"1fr",gap:10},children:[e.jsx($,{label:"Tipo de conductor",children:e.jsx("div",{style:{display:"flex",gap:8},children:["aprendiz","instructor"].map(t=>{const h=r.tipoConductor===t;return e.jsx("button",{type:"button",onClick:()=>x({...r,tipoConductor:t}),style:{flex:1,padding:"10px",borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:h?"1px solid transparent":`1px solid ${o.border}`,background:h?"rgba(57,169,0,.1)":o.bg,color:h?o.primaryDark:o.textLight,textTransform:"capitalize"},children:t},t)})})}),a&&e.jsx($,{label:"Estado",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("span",{style:{fontSize:12,fontWeight:600,color:o.textLight},children:"Inactivo"}),e.jsx("button",{type:"button",onClick:()=>x({...r,estado:r.estado==="activo"?"inactivo":"activo"}),style:{width:44,height:24,borderRadius:999,background:r.estado==="activo"?o.primary:"#CBD5E1",border:"none",cursor:"pointer",position:"relative",transition:"background .2s"},"aria-label":r.estado==="activo"?"Desactivar":"Activar",children:e.jsx("div",{style:{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:r.estado==="activo"?22:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}})}),e.jsx("span",{style:{fontSize:12,fontWeight:700,color:r.estado==="activo"?o.primaryDark:"#B91C1C"},children:r.estado==="activo"?"Activo":"Inactivo"})]})})]}),e.jsx($,{label:"Centro de formación *",error:u.centroFormacion?g.centroFormacion:void 0,children:e.jsx("input",{type:"text",placeholder:"ej. Centro de Tecnología",value:r.centroFormacion,onChange:t=>x({...r,centroFormacion:t.target.value}),onBlur:()=>d("centroFormacion"),style:{...F,...u.centroFormacion&&g.centroFormacion?ko:{}},required:!0})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px",borderRadius:11,background:o.bg,border:`1px solid ${o.border}`},children:[e.jsxs("div",{children:[e.jsx("p",{style:{fontSize:12,fontWeight:700,color:o.text},children:"¿Tiene alguna discapacidad?"}),e.jsx("p",{style:{fontSize:10,color:o.textLight},children:"Activa para registrar el tipo"})]}),e.jsx("button",{type:"button",onClick:()=>x({...r,discapacidad:!r.discapacidad}),style:{width:40,height:22,borderRadius:999,background:r.discapacidad?o.primary:"#CBD5E1",border:"none",cursor:"pointer",position:"relative",transition:"background .2s"},"aria-label":r.discapacidad?"Desactivar discapacidad":"Activar discapacidad",children:e.jsx("div",{style:{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:r.discapacidad?20:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}})})]}),r.discapacidad&&e.jsx($,{label:"Tipo de discapacidad",children:e.jsx("input",{type:"text",placeholder:"ej. Visual, Motriz, Auditiva…",value:r.tipoDiscapacidad,onChange:t=>x({...r,tipoDiscapacidad:t.target.value}),style:F})})]})]}),e.jsxs("section",{style:{borderRadius:14,border:`1px solid ${o.border}`,overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"10px 14px",background:o.bg,borderBottom:`1px solid ${o.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:o.textLight,textTransform:"uppercase"},children:"Vehículo asociado"}),r.placa&&e.jsxs("span",{style:{fontSize:11,fontWeight:800,color:o.primary,background:"rgba(57,169,0,.1)",padding:"2px 10px",borderRadius:999},children:["Placa: ",r.placa]})]}),e.jsxs("div",{style:{padding:"1rem 1.2rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:[e.jsx($,{label:"Placa *",error:u.placa?g.placa:void 0,hint:"Sin espacios ni guiones, ej: ABC123",style:{gridColumn:"1 / -1"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg, #F0FDF4, #DCFCE7)",padding:"4px 14px 4px 4px",borderRadius:11,border:`2px solid ${u.placa&&g.placa?"#FCA5A5":o.primary}`},children:[e.jsx("div",{style:{width:42,height:42,borderRadius:8,background:o.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0},children:e.jsx(K,{size:18})}),e.jsx("input",{type:"text",placeholder:"Ej: ABC123",value:r.placa,onChange:t=>x({...r,placa:t.target.value.toUpperCase()}),onBlur:()=>d("placa"),maxLength:10,required:!0,style:{...F,border:"none",background:"transparent",padding:"11px 0",fontSize:16,fontWeight:700,color:o.text,letterSpacing:1}})]})}),e.jsx($,{label:"Tipo de vehículo",children:e.jsx("div",{style:{display:"flex",gap:8},children:["carro","moto"].map(t=>e.jsx("button",{type:"button",onClick:()=>x({...r,tipoVehiculo:t}),style:{flex:1,padding:"10px",borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:r.tipoVehiculo===t?"1px solid transparent":`1px solid ${o.border}`,background:r.tipoVehiculo===t?"rgba(57,169,0,.1)":o.bg,color:r.tipoVehiculo===t?o.primaryDark:o.textLight},children:t==="carro"?"🚗 Carro":"🏍️ Moto"},t))})}),e.jsx($,{label:"Marca",children:e.jsx("input",{type:"text",placeholder:"ej. Chevrolet Spark",value:r.marca,onChange:t=>x({...r,marca:t.target.value}),style:F})}),e.jsx($,{label:"Descripción adicional",hint:`${r.descripcionVehiculo.length}/200`,style:{gridColumn:"1 / -1"},children:e.jsx("textarea",{rows:2,maxLength:200,placeholder:"Observaciones sobre el vehículo…",value:r.descripcionVehiculo,onChange:t=>x({...r,descripcionVehiculo:t.target.value}),style:{...F,resize:"none"}})})]})]})]}),e.jsxs("div",{style:{padding:"1rem 1.8rem",borderTop:`1px solid ${o.border}`,display:"flex",gap:10,justifyContent:"flex-end",alignItems:"center"},children:[!m&&Object.keys(u).length>0&&e.jsxs("span",{style:{fontSize:11,color:"#DC2626",fontWeight:600,marginRight:"auto",display:"flex",alignItems:"center",gap:5},children:[e.jsx(ro,{size:13})," Revisa los campos marcados"]}),e.jsx("button",{type:"button",onClick:j,style:{padding:"11px 20px",borderRadius:12,border:`1px solid ${o.border}`,background:"#fff",color:o.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},children:"Cancelar"}),e.jsx("button",{type:"submit",disabled:!m,style:{padding:"11px 24px",borderRadius:12,border:"none",background:m?o.primary:o.textMuted,color:"#fff",fontSize:13,fontWeight:800,cursor:m?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:m?"0 6px 18px rgba(57,169,0,.22)":"none",opacity:m?1:.65,transition:"opacity .15s ease"},children:a?"Guardar cambios":"Crear Conductor"})]})]})}const Te=s.memo(({vehiculo:a,onEdit:r,onClose:x})=>{const g=ne(a.tipo),u=g.icon;return e.jsxs("div",{children:[e.jsxs("div",{style:{padding:"1.6rem 1.8rem 1.4rem",background:`linear-gradient(135deg, ${g.dot}, ${g.dot}cc)`,color:"#fff",borderRadius:"24px 24px 0 0",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between"},children:[e.jsx("div",{style:{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(u,{size:24})}),e.jsx("button",{onClick:x,style:{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar vista",children:e.jsx(de,{size:15})})]}),e.jsx("h2",{style:{marginTop:14,fontSize:24,fontWeight:900,lineHeight:1,letterSpacing:.5},children:k(a.placa)}),e.jsxs("div",{style:{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:g.label}),e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:a.estado})]})]})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem"},children:[[{label:"Marca",value:a.marca,icon:we},{label:"Modelo",value:a.modelo,icon:we},{label:"Color",value:a.color,icon:vo},{label:"Año",value:a.año,icon:ao}].map(d=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:"#F8FAFC",border:`1px solid ${o.border}`,marginBottom:8},children:[e.jsx(d.icon,{size:14,color:o.textLight}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:9,fontWeight:700,color:o.textLight,textTransform:"uppercase",letterSpacing:.5},children:d.label}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:o.text},children:k(String(d.value))})]})]},d.label)),a.descripcion&&e.jsxs("div",{style:{padding:"10px 12px",borderRadius:12,background:"#F8FAFC",border:`1px solid ${o.border}`,marginBottom:8},children:[e.jsx("div",{style:{fontSize:9,fontWeight:700,color:o.textLight,textTransform:"uppercase",letterSpacing:.5,marginBottom:4},children:"Descripción"}),e.jsx("div",{style:{fontSize:12,color:o.text,lineHeight:1.4},children:k(a.descripcion)})]}),e.jsxs("button",{onClick:r,style:{marginTop:12,width:"100%",padding:"12px 20px",borderRadius:12,border:"none",background:g.dot,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 6px 18px ${g.dot}33`},children:[e.jsx(ce,{size:14}),"Editar Conductor"]})]})]})});Te.displayName="VehiculoView";const $o=`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');
  .conductores-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
  .conductores-root .mono{ font-family:'JetBrains Mono','Montserrat',monospace; }

  .conductor-card{
    --accent: ${o.primary};
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
    border: 1px solid ${o.border};
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
    border-color: color-mix(in srgb, var(--accent) 45%, ${o.border});
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
    color: ${o.text};
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-doc{
    font-size: 10.5px;
    color: ${o.textLight};
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
    border: 1px dashed ${o.border};
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
    border-color: ${o.primary};
    background: #F0FDF4;
  }
  .plate-empty{
    font-size: 11px;
    color: ${o.textMuted};
    font-style: italic;
  }
  .plate-chip{
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: ${o.text};
    background: #F1F5F9;
    border-radius: 6px;
    padding: 2px 7px;
  }
  .plate-meta{
    flex: 1;
    font-size: 11px;
    color: ${o.textLight};
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
    border: 1px solid ${o.border};
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: border-color .2s, background .2s;
  }
  .plate-row:hover{
    border-color: ${o.primary};
    background: #F0FDF4;
  }

  .card-center{
    margin: 0 18px 12px 22px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: ${o.textLight};
  }

  .card-footer{
    margin-top: auto;
    border-top: 1px solid ${o.border};
    padding: 8px 12px 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .action-btn{
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid ${o.border};
    background: ${o.bg};
    color: ${o.textLight};
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
    background: ${o.bg};
    border: 1px solid ${o.border};
    transition: all 0.2s ease;
  }
  .info-row:hover {
    border-color: ${o.primary}40;
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
    border: 1px solid ${o.border};
    background: ${o.bg};
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
    color: ${o.textLight};
  }
  .view-toggle-btn.active {
    background: #fff;
    color: ${o.primaryDark};
    box-shadow: 0 1px 4px rgba(15,23,42,.1);
  }

  .conductores-list {
    border-radius: 16px;
    border: 1px solid ${o.border};
    background: #fff;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(15,23,42,.05);
  }
  .list-header {
    display: grid;
    grid-template-columns: minmax(200px,1.6fr) minmax(140px,1fr) 150px 120px 110px 100px;
    gap: 10px;
    padding: 10px 14px;
    background: ${o.bg};
    border-bottom: 1px solid ${o.border};
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: ${o.textLight};
  }
  .list-row {
    display: grid;
    grid-template-columns: minmax(200px,1.6fr) minmax(140px,1fr) 150px 120px 110px 100px;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid ${o.border};
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
    color: ${o.text};
    background: #F8FAFC;
    border: 1px solid ${o.border};
    border-radius: 6px;
    padding: 2px 7px;
    display: inline-block;
  }

  .page-btn {
    transition: background .15s, border-color .15s, color .15s;
  }
  .page-btn:not(:disabled):hover {
    border-color: ${o.primary};
    color: ${o.primaryDark};
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
`;function Go(){var Ce;const{conductores:a,addConductor:r,updateConductor:x,deleteConductor:g,usuarios:u,vehiculos:d,addVehiculo:m,updateVehiculo:n,deleteVehiculo:y}=so(),[l,f]=s.useState(!1),[w,S]=s.useState(!1),[j,t]=s.useState(!1),[h,v]=s.useState(null),[z,E]=s.useState(null),[B,Z]=s.useState(null),[L,Q]=s.useState(null),[Ae]=no(),[R,xe]=s.useState(()=>Ae.get("q")||""),[M,ue]=s.useState("todos"),[T,ge]=s.useState("todos"),[A,he]=s.useState("todos"),[b,P]=s.useState(Fe()),[ee,G]=s.useState({}),[Be,q]=s.useState({}),[oe,te]=s.useState(""),[ie,Le]=s.useState("grid"),[N,V]=s.useState(1),[D,be]=s.useState(9),Re=s.useCallback(i=>{Le(i),be(i==="list"?15:9),V(1)},[]),O=s.useCallback(i=>u.find(c=>c.id===i),[u]),_=s.useCallback(i=>d.filter(c=>c.conductorId===i),[d]),Ne=s.useMemo(()=>a.filter(i=>i.estado==="activo").length,[a]),We=s.useMemo(()=>d.length,[d]),Ve=s.useMemo(()=>a.length,[a]),De=s.useMemo(()=>d.filter(i=>i.tipo==="carro").length,[d]),Oe=s.useMemo(()=>d.filter(i=>i.tipo==="moto").length,[d]),W=s.useMemo(()=>a.filter(i=>{if(!O(i.usuarioId))return!1;const p=R.toLowerCase(),C=_(i.id),Y=A==="todos"?!0:C.some(U=>U.tipo===A),se=i.nombre.toLowerCase().includes(p)||i.email.toLowerCase().includes(p)||i.centroFormacion.toLowerCase().includes(p)||C.some(U=>U.placa.toLowerCase().includes(p)||U.marca.toLowerCase().includes(p)||U.modelo.toLowerCase().includes(p)),Qe=M==="todos"?!0:i.tipoConductor===M,Pe=T==="todos"?!0:i.estado===T;return se&&Qe&&Pe&&Y}),[a,R,M,T,A,O,_]);s.useEffect(()=>{V(1)},[R,M,T,A]);const H=Math.max(1,Math.ceil(W.length/D));s.useEffect(()=>{N>H&&V(H)},[N,H]);const fe=s.useMemo(()=>W.slice((N-1)*D,N*D),[W,N,D]),re=s.useMemo(()=>{const i=new Set(a.map(c=>c.usuarioId));return h&&i.delete(h.usuarioId),i},[a,h]),Ue=s.useMemo(()=>{const i=oe.toLowerCase().trim();return i?u.filter(c=>c.nombre.toLowerCase().includes(i)||c.identificacion.toLowerCase().includes(i)||c.correo.toLowerCase().includes(i)):u},[u,oe]),Ge=s.useCallback(()=>{v(null),E(null),P(Fe()),G({}),q({}),te(""),f(!0)},[]),ae=s.useCallback((i,c)=>{v(i);const p=c??d.find(C=>C.conductorId===i.id);E((p==null?void 0:p.id)??null),P({usuarioId:i.usuarioId,tipoConductor:i.tipoConductor,centroFormacion:i.centroFormacion,discapacidad:i.discapacidad,tipoDiscapacidad:i.tipoDiscapacidad||"",estado:i.estado,placa:(p==null?void 0:p.placa)||"",tipoVehiculo:(p==null?void 0:p.tipo)||"carro",marca:(p==null?void 0:p.marca)||"",descripcionVehiculo:(p==null?void 0:p.descripcion)||""}),G({}),q({}),te(""),f(!0)},[d]),me=s.useCallback(i=>{Z(i),t(!0)},[]),ye=s.useCallback(i=>{Q(i),S(!0)},[]),je=s.useMemo(()=>new Set(d.filter(i=>i.id!==z).map(i=>i.placa.toUpperCase().trim())),[d,z]),J=s.useCallback(i=>{const c={};i.usuarioId?re.has(i.usuarioId)&&(c.usuarioId="Este usuario ya está registrado como conductor"):c.usuarioId="Selecciona un usuario",i.centroFormacion.trim()||(c.centroFormacion="El centro de formación es requerido");const p=i.placa.trim().toUpperCase();return p?Co.test(p)?je.has(p)&&(c.placa="Esta placa ya está registrada en otro vehículo"):c.placa="Formato de placa inválido (ej: ABC123)":c.placa="La placa es obligatoria",c},[re,je]);s.useEffect(()=>{G(J(b))},[b,J]);const qe=s.useMemo(()=>Object.keys(ee).length===0,[ee]),_e=s.useMemo(()=>u.find(i=>i.id===b.usuarioId),[u,b.usuarioId]),He=s.useCallback(i=>{q(c=>({...c,[i]:!0}))},[]),Je=s.useCallback(()=>{const i=J(b);if(G(i),q({usuarioId:!0,centroFormacion:!0,placa:!0}),Object.keys(i).length>0){const C=Object.values(i)[0];I.error(C||"Revisa los campos del formulario");return}const c=u.find(C=>C.id===b.usuarioId);if(!c){I.error("El usuario seleccionado no es válido");return}const p={usuarioId:b.usuarioId,nombre:c.nombre,email:c.correo,tipoConductor:b.tipoConductor,centroFormacion:k(b.centroFormacion.trim()),discapacidad:b.discapacidad,tipoDiscapacidad:k(b.tipoDiscapacidad.trim()),estado:b.estado,tipo:(h==null?void 0:h.tipo)||"docente"};try{if(h){x(h.id,p);const C={placa:b.placa.toUpperCase().trim(),tipo:b.tipoVehiculo,marca:k(b.marca.trim()),modelo:"",año:new Date().getFullYear(),color:"",descripcion:k(b.descripcionVehiculo.trim()),estado:"activo"},Y=z?d.find(se=>se.id===z):void 0;Y?n(Y.id,C):m({conductorId:h.id,...C,parqueaderoId:"",celdaId:"",fechaEntrada:new Date().toISOString()}),I.success("Conductor actualizado correctamente")}else{const C=r(p);C&&m({conductorId:C,placa:b.placa.toUpperCase().trim(),tipo:b.tipoVehiculo,marca:k(b.marca.trim()),modelo:"",año:new Date().getFullYear(),color:"",descripcion:k(b.descripcionVehiculo.trim()),estado:"activo",parqueaderoId:"",celdaId:"",fechaEntrada:new Date().toISOString()}),I.success("Conductor creado correctamente")}f(!1)}catch(C){I.error("Error al guardar el conductor"),console.error("Error saving conductor:",C)}},[b,h,z,u,d,J,r,x,m,n,y]),Ye=s.useCallback(()=>{if(L)try{d.filter(c=>c.conductorId===L.id).forEach(c=>y(c.id)),g(L.id),I.success("Conductor eliminado correctamente"),S(!1),Q(null)}catch(i){I.error("Error al eliminar el conductor"),console.error("Error deleting conductor:",i)}},[L,d,g,y]),ve=s.useCallback((i,c)=>{try{const p=c==="activo"?"inactivo":"activo";x(i,{estado:p}),I.success(`Conductor ${p==="activo"?"activado":"desactivado"}`)}catch(p){I.error("Error al cambiar el estado"),console.error("Error toggling status:",p)}},[x]),Xe=s.useCallback(()=>{xe(""),ue("todos"),ge("todos"),he("todos")},[]),Ke=s.useMemo(()=>[R,M!=="todos"?M:"",T!=="todos"?T:"",A!=="todos"?A:""].filter(Boolean).length,[R,M,T,A]),Ze=!!h;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:$o}),e.jsxs("div",{className:"conductores-root",style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx(wo,{totalConductores:Ve,totalActivos:Ne,totalVehiculos:We,totalCarros:De,totalMotos:Oe}),e.jsx(So,{search:R,onSearchChange:xe,filterTipo:M,onFilterTipoChange:ue,filterVehiculoTipo:A,onFilterVehiculoTipoChange:he,filterEstado:T,onFilterEstadoChange:ge,viewMode:ie,onViewModeChange:Re,onCreate:Ge,activeFiltersCount:Ke,filteredCount:W.length,onClearFilters:Xe}),W.length===0?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem 1rem",borderRadius:16,border:`2px dashed ${o.border}`,background:"#fff",color:o.textLight},children:[e.jsx(lo,{size:36,color:o.border,style:{marginBottom:10}}),e.jsx("p",{style:{fontWeight:700,fontSize:13},children:"No se encontraron conductores"}),e.jsx("p",{style:{fontSize:11,marginTop:4},children:"Prueba con otros filtros o registra uno nuevo"})]}):e.jsxs(e.Fragment,{children:[ie==="grid"?e.jsx(Fo,{conductores:fe,getUsuario:O,getVehiculosConductor:_,onToggleEstado:ve,onViewVehiculo:me,onEdit:ae,onDelete:ye}):e.jsx(zo,{conductores:fe,getUsuario:O,getVehiculosConductor:_,onToggleEstado:ve,onViewVehiculo:me,onEdit:ae,onDelete:ye}),e.jsx(Eo,{currentPage:N,totalPages:H,itemsPerPage:D,totalItems:W.length,viewMode:ie,onPageChange:V,onItemsPerPageChange:i=>{be(i),V(1)}})]})]}),e.jsx(ke,{open:l,onClose:()=>f(!1),maxWidth:780,children:e.jsx(Io,{isEdit:Ze,formData:b,setFormData:P,formErrors:ee,touched:Be,markTouched:He,isValid:qe,usuarioSearch:oe,setUsuarioSearch:te,usuariosFiltrados:Ue,usuariosConConductorIds:re,usuarioSeleccionado:_e,onSubmit:Je,onCancel:()=>f(!1)})}),e.jsx(ke,{open:j,onClose:()=>t(!1),maxWidth:450,children:B&&e.jsx(Te,{vehiculo:B,onEdit:()=>{const i=a.find(c=>c.id===B.conductorId);i&&(t(!1),ae(i,B))},onClose:()=>t(!1)})}),e.jsx(co,{open:w,onConfirm:Ye,onCancel:()=>{S(!1),Q(null)},title:"Eliminar Conductor",message:`¿Estás seguro de eliminar al conductor "${L?k(((Ce=O(L.usuarioId))==null?void 0:Ce.nombre)||""):""}"? Esta acción eliminará también todos sus vehículos asociados.`})]})}export{Go as Conductores};

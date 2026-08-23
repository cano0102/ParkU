import{c as q,t as io,B as ro,j as e,E as ze,S as Ie,M as Ve,k as ao,r as s,P as so,I as no,X as Ee,F as lo,x as co,G as po,H as xo,J as uo,K as go,h as B,U as ho,O as bo}from"./index-CQbT-iSH.js";import{C as G,b as fo,u as mo,c as yo,d as vo,e as jo,f as Co}from"./useConductores-0Y7AHn_F.js";import{M as ue}from"./Modal-CedKtcXA.js";import{G as ko,B as ge}from"./graduation-cap-DrsN6XF1.js";import{B as $e,A as Me}from"./bike-CgOhsTzj.js";import{E as wo,F as z,S as Fo,D as So,a as zo,b as Io,c as Vo}from"./EntityFormModal-DW6N1X73.js";import{g as _,a as te,s as f}from"./format-CMKEgLnh.js";import{P as ie}from"./pencil-DUTHun5U.js";import{U as Eo}from"./user-check-Am3aKBUB.js";import"./search-8LNTG_Jc.js";import"./plus-CKRpplv8.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $o=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],Mo=q("book-open",$o);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bo=[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]],To=q("briefcase",Bo);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lo=[["path",{d:"M15.6 2.7a10 10 0 1 0 5.7 5.7",key:"1e0p6d"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M13.4 10.6 19 5",key:"1kr7tw"}]],we=q("circle-gauge",Lo);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ao=[["path",{d:"M16 2v2",key:"scm5qe"}],["path",{d:"M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2",key:"1waht3"}],["path",{d:"M8 2v2",key:"pbkmx"}],["circle",{cx:"12",cy:"11",r:"3",key:"itu57m"}],["rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",key:"12vinp"}]],Ro=q("contact",Ao);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Do=[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]],No=q("palette",Do),o=io,Fe={instructor:{bg:"#EFF6FF",text:"#1D4ED8",border:"#BFDBFE",dot:"#2563EB",label:"Instructor",icon:ko},aprendiz:{bg:"#FFFBEB",text:"#92400E",border:"#FDE68A",dot:"#F59E0B",label:"Aprendiz",icon:Mo},administrativo:{bg:"#F5F3FF",text:"#6D28D9",border:"#DDD6FE",dot:"#8B5CF6",label:"Administrativo",icon:To},coordinador:{bg:"#ECFEFF",text:"#0E7490",border:"#A5F3FC",dot:"#0891B2",label:"Coordinador",icon:ro},visitante:{bg:"#F1F5F9",text:"#475569",border:"#CBD5E1",dot:"#64748B",label:"Visitante",icon:Ro}},Wo=["aprendiz","instructor","administrativo","coordinador","visitante"],re=r=>Fe[r]??Fe.aprendiz,oe=r=>r==="carro"?{bg:"#EFF6FF",text:"#2563EB",border:"#BFDBFE",dot:"#3B82F6",label:"Carro",icon:G}:{bg:"#FFFBEB",text:"#D97706",border:"#FDE68A",dot:"#F59E0B",label:"Moto",icon:$e},T={width:"100%",padding:"9px 14px",borderRadius:11,border:`1px solid ${o.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:o.bg,color:o.text},Po={border:"1px solid #FCA5A5",background:"#FEF2F2"},Se=()=>({usuarioId:"",tipoConductor:"aprendiz",centroFormacion:"",discapacidad:!1,tipoDiscapacidad:"",estado:"activo",placa:"",tipoVehiculo:"carro",marca:"",descripcionVehiculo:""});function Oo(r,i){const{getUsuario:l,getVehiculosConductor:h,onToggleEstado:y,onViewVehiculo:m,onViewDetail:w,onEdit:p}=i,n=l(r.usuarioId),x=h(r.id);if(!n)return null;const[F,k]=_(r.nombre),u=te(r.nombre),C=re(r.tipoConductor),a=r.estado==="activo",M=C.icon,v=x[0],j=v?oe(v.tipo):null;return e.jsxs("div",{className:`conductor-card${a?"":" is-inactive"}`,children:[e.jsx("div",{className:"status-rail",style:{background:a?o.primary:"#CBD5E1"}}),e.jsxs("div",{className:"card-top",children:[e.jsx("div",{className:"card-avatar",style:{background:`linear-gradient(135deg, ${F}, ${k})`},children:u}),e.jsxs("div",{className:"card-identity",children:[e.jsx("p",{className:"card-name",children:f(r.nombre)}),e.jsxs("p",{className:"card-doc",children:[n.tipoDocumento," · ",n.identificacion]})]}),e.jsx("button",{className:"card-switch",onClick:()=>y(r.id,r.estado),style:{background:a?o.primary:"#CBD5E1"},"aria-label":a?"Desactivar conductor":"Activar conductor",children:e.jsx("div",{className:"knob",style:{left:a?17:2}})})]}),e.jsxs("div",{className:"card-tags",children:[e.jsxs("span",{className:"card-tag",style:{background:C.bg,color:C.text},children:[e.jsx(M,{size:10}),C.label]}),e.jsx("span",{className:`status-badge ${a?"active":"inactive"}`,children:r.estado}),r.discapacidad&&e.jsxs("span",{className:"card-tag",style:{background:"#F3E8FF",color:"#9333EA"},children:[e.jsx(Me,{size:10}),"Discapacidad"]})]}),x.length===0?e.jsxs("div",{className:"plate-block",children:[e.jsx(G,{size:15,color:o.textMuted,style:{flexShrink:0}}),e.jsx("span",{className:"plate-empty",children:"Sin vehículo asignado"})]}):x.length===1&&v&&j?e.jsxs("div",{className:"plate-block has-plate",onClick:()=>m(v),style:{cursor:"pointer"},children:[e.jsx("span",{className:"plate-chip",children:v.placa}),e.jsxs("span",{className:"plate-meta",children:[v.marca," ",v.modelo]}),e.jsx(j.icon,{size:15,color:j.dot,style:{flexShrink:0}})]}):e.jsx("div",{className:"plate-list",children:x.map(S=>{const I=oe(S.tipo),H=I.icon;return e.jsxs("div",{className:"plate-row",onClick:()=>m(S),children:[e.jsx("span",{className:"plate-chip",children:S.placa}),e.jsxs("span",{className:"plate-meta",children:[S.marca," ",S.modelo]}),e.jsx(H,{size:13,color:I.dot,style:{flexShrink:0}})]},S.id)})}),e.jsxs("div",{className:"card-center",children:[e.jsx(ge,{size:12,color:o.textLight}),e.jsx("span",{children:f(r.centroFormacion)||"—"})]}),e.jsxs("div",{className:"card-footer",children:[e.jsxs("span",{style:{fontSize:10,color:o.textLight,fontWeight:700},children:[x.length," vehículo",x.length!==1?"s":""]}),e.jsxs("div",{style:{display:"flex",gap:2},children:[e.jsx("button",{className:"action-btn",title:"Ver detalles",onClick:()=>w(r),"aria-label":`Ver detalles de ${f(r.nombre)}`,children:e.jsx(ze,{size:14})}),e.jsx("button",{className:"action-btn",title:"Editar",onClick:()=>p(r),"aria-label":`Editar ${f(r.nombre)}`,children:e.jsx(ie,{size:14})})]})]})]})}function Uo(r){const{getUsuario:i,getVehiculosConductor:l,onToggleEstado:h,onViewVehiculo:y,onViewDetail:m,onEdit:w}=r;return[{header:"Conductor",width:"2fr",render:p=>{const n=i(p.usuarioId),[x,F]=_(p.nombre),k=te(p.nombre);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,minWidth:0},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:9,flexShrink:0,background:`linear-gradient(135deg,${x},${F})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff"},children:k}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("p",{style:{fontWeight:800,color:o.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:f(p.nombre)}),e.jsxs("p",{style:{fontSize:10,color:o.textLight,marginTop:1},children:[n==null?void 0:n.tipoDocumento," · ",n==null?void 0:n.identificacion]})]})]})}},{header:"Centro de formación",width:"1.4fr",render:p=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,color:o.textLight,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:p.centroFormacion,children:[e.jsx(ge,{size:11,style:{flexShrink:0}}),f(p.centroFormacion)||"—"]})},{header:"Vehículo(s)",width:"1.2fr",render:p=>{const n=l(p.id);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[n.length===0?e.jsx("span",{style:{fontSize:11,color:o.textMuted,fontStyle:"italic"},children:"Sin vehículo"}):n.slice(0,2).map(x=>e.jsx("span",{className:"list-plate-chip",style:{cursor:"pointer",width:"fit-content"},onClick:()=>y(x),children:x.placa},x.id)),n.length>2&&e.jsxs("span",{style:{fontSize:10,color:o.textLight},children:["+",n.length-2," más"]})]})}},{header:"Tipo",width:"0.9fr",render:p=>{const n=re(p.tipoConductor),x=n.icon;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,fontSize:10,fontWeight:700,background:n.bg,color:n.text,border:`1px solid ${n.border}`,whiteSpace:"nowrap"},children:[e.jsx(x,{size:9})," ",n.label]})}},{header:"Estado",width:"0.8fr",render:p=>{const n=p.estado==="activo";return e.jsxs("button",{onClick:()=>h(p.id,p.estado),title:n?"Desactivar":"Activar",style:{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 9px",borderRadius:999,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.3,background:n?"rgba(57,169,0,.1)":"rgba(239,68,68,.08)",color:n?"#166534":"#B91C1C",fontFamily:"inherit"},"aria-label":n?"Desactivar conductor":"Activar conductor",children:[e.jsx("span",{style:{width:5,height:5,borderRadius:"50%",background:n?o.primary:"#EF4444"}}),p.estado]})}},{header:"Acciones",width:"0.7fr",align:"right",render:p=>e.jsxs("div",{style:{display:"flex",gap:4,justifyContent:"flex-end"},children:[e.jsx("button",{title:"Ver detalles",onClick:()=>m(p),className:"action-btn",style:{width:26,height:26,border:`1px solid ${o.border}`,background:o.bg},"aria-label":"Ver detalles",children:e.jsx(ze,{size:12})}),e.jsx("button",{title:"Editar",onClick:()=>w(p),className:"action-btn",style:{width:26,height:26,border:`1px solid ${o.border}`,background:o.bg},"aria-label":"Editar",children:e.jsx(ie,{size:12})})]})}]}function _o({isEdit:r,formData:i,setFormData:l,formErrors:h,touched:y,markTouched:m,isValid:w,usuarioSearch:p,setUsuarioSearch:n,usuariosFiltrados:x,usuariosConConductorIds:F,usuarioSeleccionado:k,onSubmit:u,onCancel:C}){return e.jsxs(wo,{icon:e.jsx(ao,{size:18,color:o.primary}),eyebrow:"Registro integral",title:r?"Editar Conductor":"Nuevo Conductor",onSubmit:u,onCancel:C,isValid:w,submitLabel:r?"Guardar cambios":"Crear Conductor",showValidationMessage:!w&&Object.keys(y).length>0,children:[e.jsxs("section",{style:{borderRadius:14,border:`1px solid ${o.border}`,overflow:"hidden"},children:[e.jsx("div",{style:{padding:"10px 14px",background:o.bg,borderBottom:`1px solid ${o.border}`},children:e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:o.textLight,textTransform:"uppercase"},children:"Datos del conductor"})}),e.jsxs("div",{style:{padding:"0.85rem 1.1rem",display:"flex",flexDirection:"column",gap:9},children:[e.jsxs(z,{label:"Usuario vinculado *",error:y.usuarioId?h.usuarioId:void 0,children:[e.jsx("input",{type:"text",placeholder:"Buscar por nombre, identificación o correo...",value:p,onChange:a=>n(a.target.value),style:T}),e.jsxs("div",{style:{marginTop:6,borderRadius:11,border:`1px solid ${o.border}`,padding:4,background:"#fff",maxHeight:132,overflowY:"auto"},children:[x.length===0&&e.jsx("p",{style:{fontSize:11,color:o.textMuted,padding:"10px 8px"},children:"Sin resultados"}),x.map(a=>{const M=F.has(a.id),v=i.usuarioId===a.id;return e.jsxs("div",{className:`usuario-option${M?" disabled":""}`,onClick:()=>{M||(l({...i,usuarioId:a.id}),m("usuarioId"))},style:{background:v?"rgba(57,169,0,.1)":"transparent"},children:[e.jsx("div",{style:{width:30,height:30,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg, ${_(a.nombre)[0]}, ${_(a.nombre)[1]})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800},children:te(a.nombre)}),e.jsxs("div",{style:{minWidth:0,flex:1},children:[e.jsx("p",{style:{fontSize:12,fontWeight:700,color:o.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:a.nombre}),e.jsxs("p",{style:{fontSize:10,color:o.textLight},children:[a.tipoDocumento," · ",a.identificacion,M?" — ya es conductor":""]})]}),v&&e.jsx(Ie,{size:14,color:o.primary})]},a.id)})]}),k&&e.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:"#F0FDF4",border:`1px solid ${o.primary}33`},children:[e.jsx(Ve,{size:13,color:o.primaryDark}),e.jsx("span",{style:{fontSize:11,color:o.primaryDark,fontWeight:700},children:k.correo}),e.jsxs("span",{style:{marginLeft:"auto",fontSize:10,color:o.textLight},children:["Seleccionado: ",k.nombre]})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:r?"1fr 1fr 1fr":"1fr 1fr",gap:10},children:[e.jsx(z,{label:"Tipo de conductor",children:e.jsx("select",{value:i.tipoConductor,onChange:a=>l({...i,tipoConductor:a.target.value}),style:{...T,appearance:"none",cursor:"pointer"},children:Wo.map(a=>e.jsx("option",{value:a,children:re(a).label},a))})}),e.jsx(z,{label:"Centro de formación *",error:y.centroFormacion?h.centroFormacion:void 0,children:e.jsx("input",{type:"text",placeholder:"ej. Centro de Tecnología",value:i.centroFormacion,onChange:a=>l({...i,centroFormacion:a.target.value}),onBlur:()=>m("centroFormacion"),style:{...T,...y.centroFormacion&&h.centroFormacion?Po:{}},required:!0})}),r&&e.jsx(z,{label:"Estado",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,height:42},children:[e.jsx("button",{type:"button",onClick:()=>l({...i,estado:i.estado==="activo"?"inactivo":"activo"}),style:{width:44,height:24,borderRadius:999,background:i.estado==="activo"?o.primary:"#CBD5E1",border:"none",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0},"aria-label":i.estado==="activo"?"Desactivar":"Activar",children:e.jsx("div",{style:{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:i.estado==="activo"?22:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}})}),e.jsx("span",{style:{fontSize:12,fontWeight:700,color:i.estado==="activo"?o.primaryDark:"#B91C1C"},children:i.estado==="activo"?"Activo":"Inactivo"})]})})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:11,background:o.bg,border:`1px solid ${o.border}`},children:[e.jsxs("div",{children:[e.jsx("p",{style:{fontSize:12,fontWeight:700,color:o.text},children:"¿Tiene alguna discapacidad?"}),e.jsx("p",{style:{fontSize:10,color:o.textLight},children:"Activa para registrar el tipo"})]}),e.jsx("button",{type:"button",onClick:()=>l({...i,discapacidad:!i.discapacidad}),style:{width:40,height:22,borderRadius:999,background:i.discapacidad?o.primary:"#CBD5E1",border:"none",cursor:"pointer",position:"relative",transition:"background .2s"},"aria-label":i.discapacidad?"Desactivar discapacidad":"Activar discapacidad",children:e.jsx("div",{style:{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:i.discapacidad?20:2,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}})})]}),i.discapacidad&&e.jsx(z,{label:"Tipo de discapacidad",children:e.jsx("input",{type:"text",placeholder:"ej. Visual, Motriz, Auditiva…",value:i.tipoDiscapacidad,onChange:a=>l({...i,tipoDiscapacidad:a.target.value}),style:T})})]})]}),e.jsxs("section",{style:{borderRadius:14,border:`1px solid ${o.border}`,overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"10px 14px",background:o.bg,borderBottom:`1px solid ${o.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:o.textLight,textTransform:"uppercase"},children:"Vehículo asociado"}),i.placa&&e.jsxs("span",{style:{fontSize:11,fontWeight:800,color:o.primary,background:"rgba(57,169,0,.1)",padding:"2px 10px",borderRadius:999},children:["Placa: ",i.placa]})]}),e.jsxs("div",{style:{padding:"0.85rem 1.1rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:9},children:[e.jsx(z,{label:"Placa *",error:y.placa?h.placa:void 0,hint:"Sin espacios ni guiones, ej: ABC123",style:{gridColumn:"1 / -1"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg, #F0FDF4, #DCFCE7)",padding:"4px 14px 4px 4px",borderRadius:11,border:`2px solid ${y.placa&&h.placa?"#FCA5A5":o.primary}`},children:[e.jsx("div",{style:{width:34,height:34,borderRadius:8,background:o.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0},children:e.jsx(G,{size:16})}),e.jsx("input",{type:"text",placeholder:"Ej: ABC123",value:i.placa,onChange:a=>l({...i,placa:a.target.value.toUpperCase()}),onBlur:()=>m("placa"),maxLength:10,required:!0,style:{...T,border:"none",background:"transparent",padding:"8px 0",fontSize:15,fontWeight:700,color:o.text,letterSpacing:1}})]})}),e.jsx(z,{label:"Tipo de vehículo",children:e.jsx("div",{style:{display:"flex",gap:8},children:["carro","moto"].map(a=>e.jsx("button",{type:"button",onClick:()=>l({...i,tipoVehiculo:a}),style:{flex:1,padding:"10px",borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",border:i.tipoVehiculo===a?"1px solid transparent":`1px solid ${o.border}`,background:i.tipoVehiculo===a?"rgba(57,169,0,.1)":o.bg,color:i.tipoVehiculo===a?o.primaryDark:o.textLight},children:a==="carro"?"🚗 Carro":"🏍️ Moto"},a))})}),e.jsx(z,{label:"Marca",children:e.jsx("input",{type:"text",placeholder:"ej. Chevrolet Spark",value:i.marca,onChange:a=>l({...i,marca:a.target.value}),style:T})}),e.jsx(z,{label:"Descripción adicional",hint:`${i.descripcionVehiculo.length}/200`,style:{gridColumn:"1 / -1"},children:e.jsx("textarea",{rows:1,maxLength:200,placeholder:"Observaciones sobre el vehículo…",value:i.descripcionVehiculo,onChange:a=>l({...i,descripcionVehiculo:a.target.value}),style:{...T,resize:"none"}})})]})]})]})}const Be=s.memo(({conductor:r,usuario:i,vehiculos:l,onEdit:h,onViewVehiculo:y,onClose:m})=>{const[w,p]=_(r.nombre),n=re(r.tipoConductor),x=n.icon,F=r.estado==="activo",k=[{label:"Correo",value:i==null?void 0:i.correo,icon:Ve},{label:"Teléfono",value:i==null?void 0:i.numero,icon:so},{label:"Documento",value:i?`${i.tipoDocumento} · ${i.identificacion}`:void 0,icon:no},{label:"Centro de formación",value:r.centroFormacion,icon:ge}].filter(u=>u.value);return e.jsxs("div",{children:[e.jsxs("div",{style:{padding:"1.6rem 1.8rem 1.4rem",background:`linear-gradient(135deg, ${w}, ${p})`,color:"#fff",borderRadius:"24px 24px 0 0",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between"},children:[e.jsx("div",{style:{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900},children:te(r.nombre)}),e.jsx("button",{onClick:m,style:{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar vista",children:e.jsx(Ee,{size:15})})]}),e.jsx("h2",{style:{marginTop:14,fontSize:20,fontWeight:900,lineHeight:1.2},children:f(r.nombre)}),e.jsxs("div",{style:{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:[e.jsx(x,{size:11}),n.label]}),e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:F?"Activo":"Inactivo"}),r.discapacidad&&e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:[e.jsx(Me,{size:11}),r.tipoDiscapacidad?f(r.tipoDiscapacidad):"Discapacidad"]})]})]})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem"},children:[k.map(u=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:"#F8FAFC",border:`1px solid ${o.border}`,marginBottom:8},children:[e.jsx(u.icon,{size:14,color:o.textLight}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{style:{fontSize:9,fontWeight:700,color:o.textLight,textTransform:"uppercase",letterSpacing:.5},children:u.label}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:o.text,wordBreak:"break-word"},children:f(String(u.value))})]})]},u.label)),e.jsxs("div",{style:{marginTop:14},children:[e.jsxs("div",{style:{fontSize:9,fontWeight:800,color:o.textLight,textTransform:"uppercase",letterSpacing:1,marginBottom:8},children:["Vehículo",l.length!==1?"s":""," (",l.length,")"]}),l.length===0?e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:12,background:"#F8FAFC",border:`1px dashed ${o.border}`,color:o.textMuted,fontSize:12},children:[e.jsx(G,{size:14}),"Sin vehículo asignado"]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:6},children:l.map(u=>{const C=oe(u.tipo),a=C.icon;return e.jsxs("button",{onClick:()=>y(u),style:{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:12,background:C.bg,border:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left",fontFamily:"inherit"},children:[e.jsx(a,{size:15,color:C.dot,style:{flexShrink:0}}),e.jsx("span",{style:{fontSize:13,fontWeight:800,color:C.text,letterSpacing:.5},children:u.placa}),e.jsxs("span",{style:{fontSize:11,color:o.textLight,marginLeft:"auto"},children:[u.marca," ",u.modelo]})]},u.id)})})]}),e.jsxs("button",{onClick:h,style:{marginTop:14,width:"100%",padding:"12px 20px",borderRadius:12,border:"none",background:n.dot,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 6px 18px ${n.dot}33`},children:[e.jsx(ie,{size:14}),"Editar Conductor"]})]})]})});Be.displayName="ConductorDetailModal";const Te=s.memo(({vehiculo:r,onEdit:i,onClose:l})=>{const h=oe(r.tipo),y=h.icon;return e.jsxs("div",{children:[e.jsxs("div",{style:{padding:"1.6rem 1.8rem 1.4rem",background:`linear-gradient(135deg, ${h.dot}, ${h.dot}cc)`,color:"#fff",borderRadius:"24px 24px 0 0",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between"},children:[e.jsx("div",{style:{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(y,{size:24})}),e.jsx("button",{onClick:l,style:{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar vista",children:e.jsx(Ee,{size:15})})]}),e.jsx("h2",{style:{marginTop:14,fontSize:24,fontWeight:900,lineHeight:1,letterSpacing:.5},children:f(r.placa)}),e.jsxs("div",{style:{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:h.label}),e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)"},children:r.estado})]})]})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem"},children:[[{label:"Marca",value:r.marca,icon:we},{label:"Modelo",value:r.modelo,icon:we},{label:"Color",value:r.color,icon:No},{label:"Año",value:r.año,icon:lo}].map(m=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:"#F8FAFC",border:`1px solid ${o.border}`,marginBottom:8},children:[e.jsx(m.icon,{size:14,color:o.textLight}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:9,fontWeight:700,color:o.textLight,textTransform:"uppercase",letterSpacing:.5},children:m.label}),e.jsx("div",{style:{fontSize:13,fontWeight:600,color:o.text},children:f(String(m.value))})]})]},m.label)),r.descripcion&&e.jsxs("div",{style:{padding:"10px 12px",borderRadius:12,background:"#F8FAFC",border:`1px solid ${o.border}`,marginBottom:8},children:[e.jsx("div",{style:{fontSize:9,fontWeight:700,color:o.textLight,textTransform:"uppercase",letterSpacing:.5,marginBottom:4},children:"Descripción"}),e.jsx("div",{style:{fontSize:12,color:o.text,lineHeight:1.4},children:f(r.descripcion)})]}),e.jsxs("button",{onClick:i,style:{marginTop:12,width:"100%",padding:"12px 20px",borderRadius:12,border:"none",background:h.dot,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 6px 18px ${h.dot}33`},children:[e.jsx(ie,{size:14}),"Editar Conductor"]})]})]})});Te.displayName="VehiculoView";const qo=`
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
`;function it(){const{data:r=[]}=fo(),{data:i=[]}=co(),{data:l=[]}=mo(),h=yo(),y=vo(),m=jo(),w=Co(),p=t=>h.mutateAsync(t),n=(t,c)=>y.mutate({id:t,data:c}),x=t=>m.mutate(t),F=(t,c)=>w.mutate({id:t,data:c}),[k,u]=s.useState(!1),[C,a]=s.useState(!1),[M,v]=s.useState(!1),[j,S]=s.useState(null),[I,H]=s.useState(null),[J,Le]=s.useState(null),[D,Ae]=s.useState(null),[Re]=po(),[L,he]=s.useState(()=>Re.get("q")||""),[V,be]=s.useState("todos"),[E,fe]=s.useState("todos"),[$,me]=s.useState("todos"),[g,ae]=s.useState(Se()),[se,Y]=s.useState({}),[De,K]=s.useState({}),[ne,le]=s.useState(""),[de,Ne]=s.useState("grid"),[A,N]=s.useState(1),[W,ye]=s.useState(9),We=s.useCallback(t=>{Ne(t),ye(t==="list"?15:9),N(1)},[]),P=s.useCallback(t=>i.find(c=>c.id===t),[i]),O=s.useCallback(t=>l.filter(c=>c.conductorId===t),[l]),Pe=s.useMemo(()=>r.filter(t=>t.estado==="activo").length,[r]),Oe=s.useMemo(()=>l.length,[l]),Ue=s.useMemo(()=>r.length,[r]),_e=s.useMemo(()=>l.filter(t=>t.tipo==="carro").length,[l]),qe=s.useMemo(()=>l.filter(t=>t.tipo==="moto").length,[l]),R=s.useMemo(()=>r.filter(t=>{if(!P(t.usuarioId))return!1;const d=L.toLowerCase(),b=O(t.id),ee=$==="todos"?!0:b.some(U=>U.tipo===$),xe=t.nombre.toLowerCase().includes(d)||t.email.toLowerCase().includes(d)||t.centroFormacion.toLowerCase().includes(d)||b.some(U=>U.placa.toLowerCase().includes(d)||U.marca.toLowerCase().includes(d)||U.modelo.toLowerCase().includes(d)),oo=V==="todos"?!0:t.tipoConductor===V,to=E==="todos"?!0:t.estado===E;return xe&&oo&&to&&ee}),[r,L,V,E,$,P,O]);s.useEffect(()=>{N(1)},[L,V,E,$]);const X=Math.max(1,Math.ceil(R.length/W));s.useEffect(()=>{A>X&&N(X)},[A,X]);const ve=s.useMemo(()=>R.slice((A-1)*W,A*W),[R,A,W]),ce=s.useMemo(()=>{const t=new Set(r.map(c=>c.usuarioId));return j&&t.delete(j.usuarioId),t},[r,j]),Ge=s.useMemo(()=>{const t=ne.toLowerCase().trim();return t?i.filter(c=>c.nombre.toLowerCase().includes(t)||c.identificacion.toLowerCase().includes(t)||c.correo.toLowerCase().includes(t)):i},[i,ne]),He=s.useCallback(()=>{S(null),H(null),ae(Se()),Y({}),K({}),le(""),u(!0)},[]),Q=s.useCallback((t,c)=>{S(t);const d=c??l.find(b=>b.conductorId===t.id);H((d==null?void 0:d.id)??null),ae({usuarioId:t.usuarioId,tipoConductor:t.tipoConductor,centroFormacion:t.centroFormacion,discapacidad:t.discapacidad,tipoDiscapacidad:t.tipoDiscapacidad||"",estado:t.estado,placa:(d==null?void 0:d.placa)||"",tipoVehiculo:(d==null?void 0:d.tipo)||"carro",marca:(d==null?void 0:d.marca)||"",descripcionVehiculo:(d==null?void 0:d.descripcion)||""}),Y({}),K({}),le(""),u(!0)},[l]),pe=s.useCallback(t=>{Le(t),a(!0)},[]),je=s.useCallback(t=>{Ae(t),v(!0)},[]),Ce=s.useMemo(()=>new Set(l.filter(t=>t.id!==I).map(t=>t.placa.toUpperCase().trim())),[l,I]),Z=s.useCallback(t=>{const c={};t.usuarioId?ce.has(t.usuarioId)&&(c.usuarioId="Este usuario ya está registrado como conductor"):c.usuarioId="Selecciona un usuario",t.centroFormacion.trim()||(c.centroFormacion="El centro de formación es requerido");const d=t.placa.trim().toUpperCase();if(!d)c.placa="La placa es obligatoria";else if(!xo(d))c.placa="Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";else if(uo(d,t.tipoVehiculo))Ce.has(d)&&(c.placa="Esta placa ya está registrada en otro vehículo");else{const b=go(d);c.placa=`Seleccionaste "${t.tipoVehiculo}", pero la placa tiene formato de ${b}.`}return c},[ce,Ce]);s.useEffect(()=>{Y(Z(g))},[g,Z]);const Je=s.useMemo(()=>Object.keys(se).length===0,[se]),Ye=s.useMemo(()=>i.find(t=>t.id===g.usuarioId),[i,g.usuarioId]),Ke=s.useCallback(t=>{K(c=>({...c,[t]:!0}))},[]),Xe=s.useCallback(async()=>{const t=Z(g);if(Y(t),K({usuarioId:!0,centroFormacion:!0,placa:!0}),Object.keys(t).length>0){const b=Object.values(t)[0];B.error(b||"Revisa los campos del formulario");return}const c=i.find(b=>b.id===g.usuarioId);if(!c){B.error("El usuario seleccionado no es válido");return}const d={usuarioId:g.usuarioId,nombre:c.nombre,email:c.correo,tipoConductor:g.tipoConductor,centroFormacion:f(g.centroFormacion.trim()),discapacidad:g.discapacidad,tipoDiscapacidad:f(g.tipoDiscapacidad.trim()),estado:g.estado,tipo:(j==null?void 0:j.tipo)||"docente"};try{if(j){n(j.id,d);const b={placa:g.placa.toUpperCase().trim(),tipo:g.tipoVehiculo,marca:f(g.marca.trim()),modelo:"",año:new Date().getFullYear(),color:"",descripcion:f(g.descripcionVehiculo.trim()),estado:"activo"},ee=I?l.find(xe=>xe.id===I):void 0;ee?F(ee.id,b):x({conductorId:j.id,...b,parqueaderoId:"",celdaId:"",fechaEntrada:new Date().toISOString()}),B.success("Conductor actualizado correctamente")}else{const b=await p(d);b!=null&&b.id&&x({conductorId:b.id,placa:g.placa.toUpperCase().trim(),tipo:g.tipoVehiculo,marca:f(g.marca.trim()),modelo:"",año:new Date().getFullYear(),color:"",descripcion:f(g.descripcionVehiculo.trim()),estado:"activo",parqueaderoId:"",celdaId:"",fechaEntrada:new Date().toISOString()}),B.success("Conductor creado correctamente")}u(!1)}catch(b){B.error("Error al guardar el conductor"),console.error("Error saving conductor:",b)}},[g,j,I,i,l,Z,p,n,x,F]),ke=s.useCallback((t,c)=>{try{const d=c==="activo"?"inactivo":"activo";n(t,{estado:d}),B.success(`Conductor ${d==="activo"?"activado":"desactivado"}`)}catch(d){B.error("Error al cambiar el estado"),console.error("Error toggling status:",d)}},[n]),Qe=s.useCallback(()=>{he(""),be("todos"),fe("todos"),me("todos")},[]),Ze=s.useMemo(()=>[L,V!=="todos"?V:"",E!=="todos"?E:"",$!=="todos"?$:""].filter(Boolean).length,[L,V,E,$]),eo=!!j;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:qo}),e.jsxs("div",{className:"conductores-root",style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsx(Fo,{eyebrowIcon:e.jsx(Ie,{size:11}),eyebrowText:"Gestión integral",title:"Conductores y Vehículos",description:"Administra conductores, aprendices, instructores y vehículos autorizados del sistema SENA.",metrics:[{label:"Conductores",value:Ue,icon:e.jsx(ho,{size:11})},{label:"Activos",value:Pe,icon:e.jsx(Eo,{size:11})},{label:"Vehículos",value:Oe,icon:e.jsx(G,{size:11})},{label:"Carros/Motos",value:`${_e}/${qe}`,icon:e.jsx($e,{size:11})}]}),e.jsx(So,{search:L,onSearchChange:he,searchPlaceholder:"Buscar conductor, vehículo, identificación...",searchAriaLabel:"Buscar conductores",filters:[{value:V,onChange:be,ariaLabel:"Filtrar por tipo",options:[{value:"todos",label:"Todos los tipos"},{value:"aprendiz",label:"Aprendiz"},{value:"instructor",label:"Instructor"}]},{value:$,onChange:me,ariaLabel:"Filtrar por tipo de vehículo",options:[{value:"todos",label:"Todos los vehículos"},{value:"carro",label:"Con Carro"},{value:"moto",label:"Con Moto"}]},{value:E,onChange:t=>fe(t),ariaLabel:"Filtrar por estado",options:[{value:"todos",label:"Todos"},{value:"activo",label:"Activos"},{value:"inactivo",label:"Inactivos"}]}],viewMode:de,onViewModeChange:We,createLabel:"Nuevo Conductor",onCreate:He,activeFiltersBar:{activeFiltersCount:Ze,filteredCount:R.length,onClearFilters:Qe}}),R.length===0?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem 1rem",borderRadius:16,border:`2px dashed ${o.border}`,background:"#fff",color:o.textLight},children:[e.jsx(bo,{size:36,color:o.border,style:{marginBottom:10}}),e.jsx("p",{style:{fontWeight:700,fontSize:13},children:"No se encontraron conductores"}),e.jsx("p",{style:{fontSize:11,marginTop:4},children:"Prueba con otros filtros o registra uno nuevo"})]}):e.jsxs(e.Fragment,{children:[de==="grid"?e.jsx(zo,{items:ve,getKey:t=>t.id,gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14,renderCard:t=>Oo(t,{getUsuario:P,getVehiculosConductor:O,onToggleEstado:ke,onViewVehiculo:pe,onViewDetail:je,onEdit:Q})}):e.jsx(Io,{items:ve,getKey:t=>t.id,columns:Uo({getUsuario:P,getVehiculosConductor:O,onToggleEstado:ke,onViewVehiculo:pe,onViewDetail:je,onEdit:Q})}),e.jsx(Vo,{currentPage:A,totalPages:X,itemsPerPage:W,totalItems:R.length,itemsPerPageOptions:de==="list"?[15,25,50,100]:[9,18,36,60],entityLabel:"Conductores",onPageChange:N,onItemsPerPageChange:t=>{ye(t),N(1)}})]})]}),e.jsx(ue,{open:k,onClose:()=>u(!1),maxWidth:780,children:e.jsx(_o,{isEdit:eo,formData:g,setFormData:ae,formErrors:se,touched:De,markTouched:Ke,isValid:Je,usuarioSearch:ne,setUsuarioSearch:le,usuariosFiltrados:Ge,usuariosConConductorIds:ce,usuarioSeleccionado:Ye,onSubmit:Xe,onCancel:()=>u(!1)})}),e.jsx(ue,{open:C,onClose:()=>a(!1),maxWidth:450,children:J&&e.jsx(Te,{vehiculo:J,onEdit:()=>{const t=r.find(c=>c.id===J.conductorId);t&&(a(!1),Q(t,J))},onClose:()=>a(!1)})}),e.jsx(ue,{open:M,onClose:()=>v(!1),maxWidth:450,children:D&&e.jsx(Be,{conductor:D,usuario:P(D.usuarioId),vehiculos:O(D.id),onEdit:()=>{v(!1),Q(D)},onViewVehiculo:t=>{v(!1),pe(t)},onClose:()=>v(!1)})})]})}export{it as Conductores};

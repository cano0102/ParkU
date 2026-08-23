import{c as ee,e as re,f as te,g as oe,r as s,h as w,j as e,t as se,S as B,b as P,i as D,E as ie,X as q,k as ae}from"./index-CQbT-iSH.js";import{M as A}from"./Modal-CedKtcXA.js";import{s as E}from"./format-CMKEgLnh.js";import{S as ne}from"./search-8LNTG_Jc.js";import{P as le}from"./plus-CKRpplv8.js";import{S as W}from"./shield-xskjymXt.js";import{C as H}from"./circle-x-4Ju_pRwG.js";import{P as V}from"./pencil-DUTHun5U.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],ce=ee("layers",de),r=se,N=["Administrador","SuperAdmin"],I={administracion:{usuarios:"Usuarios",roles:"Roles",dashboard:"Dashboard"},operaciones:{entradaSalida:"Entrada / Salida",reservas:"Reservas",asignaciones:"Asignaciones"},parqueadero:{parqueaderos:"Parqueaderos",celdas:"Celdas",vehiculos:"Vehículos",conductores:"Conductores"},seguridad:{incidentes:"Incidentes",reconocimientoPlacas:"Reconocimiento"}},G={administracion:e.jsx(W,{size:13}),operaciones:e.jsx(ce,{size:13}),parqueadero:e.jsx(ae,{size:13}),seguridad:e.jsx(B,{size:13})},_={administracion:"Administración",operaciones:"Operaciones",parqueadero:"Parqueadero",seguridad:"Seguridad"},U={administracion:"#EF4444",operaciones:"#2563EB",parqueadero:"#F59E0B",seguridad:"#8B5CF6"},Y={dashboard:!1,roles:!1,usuarios:!1,conductores:!1,vehiculos:!1,parqueaderos:!1,celdas:!1,asignaciones:!1,entradaSalida:!1,reservas:!1,incidentes:!1,reconocimientoPlacas:!1},pe=Object.values(I).reduce((t,u)=>({...t,...u}),{}),X=t=>{switch(t){case"Administrador":return"#EF4444";case"SuperAdmin":return"#8B5CF6";case"Supervisor":return"#2563EB";case"Vigilante":return"#F59E0B";default:return r.primary}},T=t=>Object.values(t).filter(Boolean).length,Q=s.memo(({initial:t,onSave:u,onCancel:f,title:x,isEditing:h=!1,existingRoles:b,editingRolId:m=null})=>{const[c,p]=s.useState(t),[i,k]=s.useState("");s.useEffect(()=>{p(t),k("")},[t]);const C=s.useCallback(a=>{p(l=>({...l,nombre:a}));const n=a.trim().toLowerCase(),d=b.some(l=>l.id!==m&&l.nombre.trim().toLowerCase()===n);k(n&&d?"Ya existe un rol con este nombre":"")},[b,m]),F=s.useCallback(a=>{p(n=>({...n,permisos:{...n.permisos,[a]:!n.permisos[a]}}))},[]),S=s.useCallback(a=>{const n=Object.keys(I[a]),d=n.every(l=>c.permisos[l]);p(l=>({...l,permisos:n.reduce((v,z)=>({...v,[z]:!d}),l.permisos)}))},[c.permisos]),$=s.useCallback(a=>{a.preventDefault();const n=c.nombre.trim();if(!n){w.error("El nombre es obligatorio");return}if(b.some(v=>v.id!==m&&v.nombre.trim().toLowerCase()===n.toLowerCase())){k("Ya existe un rol con este nombre"),w.error("Ya existe un rol con este nombre");return}const l=E(n);u({...c,nombre:l})},[c,u,b,m]),y=s.useMemo(()=>T(c.permisos),[c.permisos]),g=s.useMemo(()=>Object.keys(c.permisos).length,[c.permisos]);return e.jsxs("form",{onSubmit:$,children:[e.jsxs("div",{style:{padding:"1.1rem 1.6rem 0.9rem",borderBottom:`1px solid ${r.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"rgba(57,169,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(B,{size:18,color:r.primary})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:800,letterSpacing:1,color:r.primary,textTransform:"uppercase"},children:"Seguridad"}),e.jsx("h2",{style:{fontSize:20,fontWeight:900,color:r.text,lineHeight:1},children:x})]})]}),e.jsx("button",{type:"button",onClick:f,style:{width:34,height:34,borderRadius:9,border:`1px solid ${r.border}`,background:"#fff",cursor:"pointer",color:r.textLight,display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar formulario",children:e.jsx(q,{size:16})})]}),e.jsxs("div",{style:{padding:"1rem 1.6rem",display:"flex",flexDirection:"column",gap:"0.6rem"},children:[e.jsxs("section",{children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:r.textLight,textTransform:"uppercase",marginBottom:6},children:"Información básica"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:h?"1fr 1fr":"1fr",gap:10},children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"role-name",style:{display:"block",fontSize:12,fontWeight:700,color:r.text,marginBottom:6},children:"Nombre del rol"}),e.jsx("input",{id:"role-name",type:"text",placeholder:"ej. Operador de turno",value:c.nombre,onChange:a=>C(a.target.value),style:{width:"100%",padding:"9px 14px",borderRadius:11,border:`1px solid ${i?"#EF4444":r.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC"},required:!0,"aria-required":"true","aria-invalid":!!i,"aria-describedby":i?"role-name-error":void 0}),i&&e.jsx("p",{id:"role-name-error",style:{marginTop:5,fontSize:11,fontWeight:700,color:"#EF4444"},children:i})]}),h&&e.jsxs("div",{children:[e.jsx("label",{htmlFor:"role-status",style:{display:"block",fontSize:12,fontWeight:700,color:r.text,marginBottom:6},children:"Estado"}),e.jsxs("select",{id:"role-status",value:c.estado,onChange:a=>p(n=>({...n,estado:a.target.value})),style:{width:"100%",padding:"9px 14px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC",cursor:"pointer"},children:[e.jsx("option",{value:"activo",children:"Activo"}),e.jsx("option",{value:"inactivo",children:"Inactivo"})]})]})]}),e.jsxs("div",{style:{marginTop:8},children:[e.jsx("label",{htmlFor:"role-description",style:{display:"block",fontSize:12,fontWeight:700,color:r.text,marginBottom:6},children:"Descripción"}),e.jsx("textarea",{id:"role-description",placeholder:"Describe las responsabilidades de este rol...",value:c.descripcion,onChange:a=>p(n=>({...n,descripcion:a.target.value})),rows:1,style:{width:"100%",padding:"9px 14px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC",resize:"none"}})]})]}),e.jsxs("section",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:r.textLight,textTransform:"uppercase"},children:"Permisos"}),e.jsxs("span",{style:{fontSize:11,fontWeight:700,color:r.primary},children:[y," / ",g," activos"]})]}),e.jsx("div",{style:{height:4,borderRadius:999,background:"#E2E8F0",marginBottom:9,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",borderRadius:999,background:r.primary,width:`${y/g*100}%`,transition:"width .3s ease"},role:"progressbar","aria-valuenow":y/g*100,"aria-valuemin":0,"aria-valuemax":100})}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,alignItems:"start"},children:Object.entries(I).map(([a,n])=>{const d=U[a]??r.primary,l=Object.keys(n),v=l.filter(R=>c.permisos[R]).length,z=l.length,O=v===z;return e.jsxs("div",{style:{borderRadius:12,border:`1px solid ${r.border}`,background:"#F8FAFC",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderBottom:`1px solid ${r.border}`,background:"#fff"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7},children:[e.jsx("div",{style:{width:24,height:24,borderRadius:7,background:`${d}18`,color:d,display:"flex",alignItems:"center",justifyContent:"center"},children:G[a]}),e.jsx("span",{style:{fontSize:11,fontWeight:800,color:r.text},children:_[a]})]}),e.jsx("button",{type:"button",onClick:()=>S(a),style:{fontSize:10,fontWeight:700,color:d,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"},children:O?"Quitar todo":"Todo"})]}),e.jsx("div",{style:{height:3,background:"#E2E8F0",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",background:d,width:`${v/z*100}%`,transition:"width .3s"}})}),e.jsx("div",{style:{padding:"7px 10px",display:"flex",flexDirection:"column",gap:4},children:Object.entries(n).map(([R,L])=>{const o=c.permisos[R];return e.jsxs("button",{type:"button",onClick:()=>F(R),style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",borderRadius:9,cursor:"pointer",border:`1px solid ${o?`${d}30`:r.border}`,background:o?`${d}08`:"#fff",transition:"all .15s",width:"100%",fontFamily:"inherit",fontSize:11,fontWeight:600,color:r.text},role:"checkbox","aria-checked":o,children:[e.jsx("span",{children:L}),e.jsx("div",{style:{width:16,height:16,borderRadius:5,border:`1.5px solid ${o?d:r.border}`,background:o?d:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"},children:o&&e.jsx("span",{style:{color:"#fff",fontSize:9,fontWeight:900,lineHeight:1},children:"✓"})})]},R)})})]},a)})})]})]}),e.jsxs("div",{style:{padding:"0.8rem 1.6rem",borderTop:`1px solid ${r.border}`,display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:f,style:{padding:"11px 20px",borderRadius:12,border:`1px solid ${r.border}`,background:"#fff",color:r.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},children:"Cancelar"}),e.jsx("button",{type:"submit",style:{padding:"11px 24px",borderRadius:12,border:"none",background:r.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 18px rgba(57,169,0,.22)"},children:x==="Nuevo Rol"?"Crear Rol":"Guardar cambios"})]})]})});Q.displayName="RolForm";const J=s.memo(({rol:t,onClose:u,onEdit:f})=>{const x=X(t.nombre),h=s.useMemo(()=>T(t.permisos),[t.permisos]),b=s.useMemo(()=>Object.keys(t.permisos).length,[t.permisos]),m=N.includes(t.nombre),c=s.useMemo(()=>Object.entries(t.permisos),[t.permisos]);return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{padding:"1.6rem 1.8rem 1.4rem",background:`linear-gradient(135deg, ${x}, ${x}cc)`,color:"#fff",borderRadius:"24px 24px 0 0",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between"},children:[e.jsx("div",{style:{width:42,height:42,borderRadius:11,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(W,{size:20})}),e.jsx("button",{onClick:u,style:{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar vista",children:e.jsx(q,{size:15})})]}),e.jsx("h2",{style:{marginTop:14,fontSize:26,fontWeight:900,lineHeight:1},children:E(t.nombre)}),e.jsx("p",{style:{marginTop:6,fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:t.descripcion||"Sin descripción"}),e.jsxs("div",{style:{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:.5},children:t.estado}),m&&e.jsxs("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)",display:"flex",alignItems:"center",gap:4},children:[e.jsx(D,{size:10})," Protegido"]})]})]})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12},children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:r.textLight,textTransform:"uppercase"},children:"Permisos activos"}),e.jsxs("span",{style:{fontSize:12,fontWeight:700,color:x},children:[h," / ",b]})]}),e.jsx("div",{style:{height:4,borderRadius:999,background:"#E2E8F0",marginBottom:12,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",borderRadius:999,background:x,width:`${h/b*100}%`},role:"progressbar","aria-valuenow":h/b*100,"aria-valuemin":0,"aria-valuemax":100})}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:5},children:c.map(([p,i])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${i?`${x}20`:r.border}`,background:i?`${x}06`:"#FAFAFA",color:i?r.text:r.textLight},children:[e.jsx("span",{children:pe[p]??p}),i?e.jsx(P,{size:14,color:x}):e.jsx(H,{size:14,color:"#CBD5E1"})]},p))}),e.jsxs("button",{onClick:f,style:{marginTop:16,width:"100%",padding:"13px 20px",borderRadius:12,border:"none",background:x,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 6px 18px ${x}33`},children:[e.jsx(V,{size:14}),"Editar este rol"]})]})]})});J.displayName="ViewModal";const K=s.memo(({rol:t,onView:u,onEdit:f,onToggleEstado:x})=>{const h=s.useMemo(()=>T(t.permisos),[t.permisos]),b=s.useMemo(()=>Object.keys(t.permisos).length,[t.permisos]),m=Math.round(h/b*100),c=N.includes(t.nombre),p=X(t.nombre),i=t.estado==="activo",k=s.useMemo(()=>Object.entries(I).map(([g,a])=>{const n=Object.keys(a),d=n.filter(l=>t.permisos[l]).length;return{grupo:g,on:d,total:n.length}}),[t.permisos]),C=m===0?0:Math.max(1,Math.ceil(m/20)),F=[7,11,15,19,23],S=s.useCallback(()=>u(t),[u,t]),$=s.useCallback(()=>f(t),[f,t]),y=s.useCallback(g=>{g.stopPropagation(),x(t)},[x,t]);return e.jsxs("article",{className:"role-card",style:{"--accent":p},children:[e.jsxs("div",{className:"role-card-top",style:{borderBottom:`1px solid ${r.border}`},children:[e.jsxs("div",{className:"role-card-top-row",children:[e.jsx("div",{className:"role-icon",style:{background:`${p}15`},children:e.jsx(W,{size:20,color:p})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsxs("span",{className:"role-status-pill",style:{background:i?"rgba(57,169,0,.12)":"rgba(148,163,184,.16)",color:i?r.primaryDark:r.textLight},children:[i?e.jsx(P,{size:11}):e.jsx(H,{size:11}),t.estado]}),!c&&e.jsx("button",{type:"button",role:"switch","aria-checked":i,"aria-label":i?`Deshabilitar rol ${E(t.nombre)}`:`Habilitar rol ${E(t.nombre)}`,title:i?"Deshabilitar rol":"Habilitar rol",onClick:y,className:"role-switch",style:{background:i?r.primary:"#CBD5E1"},children:e.jsx("span",{className:"role-switch-knob",style:{transform:i?"translateX(14px)":"translateX(0)"}})})]})]}),e.jsxs("div",{className:"role-name-row",children:[e.jsx("h3",{className:"role-name",children:E(t.nombre)}),c&&e.jsx("span",{className:"role-lock",title:"Rol protegido del sistema",children:e.jsx(D,{size:11})})]}),e.jsx("p",{className:"role-desc",children:t.descripcion||"Sin descripción"})]}),e.jsxs("div",{className:"role-card-body",children:[e.jsxs("div",{className:"clearance-row",children:[e.jsx("span",{className:"clearance-label",children:"Nivel de acceso"}),e.jsxs("span",{className:"clearance-pct",style:{color:p},children:[m,"%"]})]}),e.jsx("div",{className:"clearance-bars",children:F.map((g,a)=>e.jsx("div",{className:"clearance-bar",style:{height:g,background:a<C?p:"#E2E8F0"}},a))}),e.jsx("div",{className:"group-grid",children:k.map(({grupo:g,on:a,total:n})=>{const d=U[g],l=a>0;return e.jsxs("div",{className:"group-chip",style:{background:l?`${d}12`:"#F8FAFC",color:l?d:r.textLight,border:`1px solid ${l?`${d}30`:r.border}`},title:_[g],children:[G[g],e.jsxs("span",{children:[a,"/",n]})]},g)})})]}),e.jsxs("div",{className:"role-card-footer",children:[e.jsx("button",{className:"role-action-btn",onClick:S,"aria-label":`Ver detalle de ${E(t.nombre)}`,title:"Ver detalle",children:e.jsx(ie,{size:15})}),e.jsx("span",{className:"role-action-divider"}),e.jsx("button",{className:"role-action-btn",onClick:$,"aria-label":`Editar ${E(t.nombre)}`,title:"Editar",children:e.jsx(V,{size:15})})]})]})});K.displayName="RoleCard";const M=()=>({nombre:"",descripcion:"",permisos:{...Y},estado:"activo"});function je(){const{data:t=[]}=re(),u=te(),f=oe(),x=s.useCallback(o=>u.mutate(o),[u]),h=s.useCallback((o,j)=>f.mutate({id:o,data:j}),[f]),[b,m]=s.useState(!1),[c,p]=s.useState(!1),[i,k]=s.useState(null),[C,F]=s.useState(null),[S,$]=s.useState(""),[y,g]=s.useState("todos"),[a,n]=s.useState(M()),d=s.useMemo(()=>t.filter(o=>{const j=o.nombre.toLowerCase().includes(S.toLowerCase()),Z=y==="todos"||o.estado===y;return j&&Z}),[t,S,y]),l=s.useMemo(()=>({activos:t.filter(o=>o.estado==="activo").length,protegidos:N.length,total:t.length,permisos:Object.keys(Y).length}),[t]),v=s.useCallback(()=>{k(null),n(M()),m(!0)},[]),z=s.useCallback(o=>{k(o),n({nombre:o.nombre,descripcion:o.descripcion,permisos:{...o.permisos},estado:o.estado}),p(!1),m(!0)},[]),O=s.useCallback(o=>{F(o),p(!0)},[]),R=s.useCallback(o=>{if(N.includes(o.nombre)){w.error("Este rol está protegido y no puede deshabilitarse");return}try{const j=o.estado==="activo"?"inactivo":"activo";h(o.id,{nombre:o.nombre,descripcion:o.descripcion,permisos:o.permisos,estado:j}),w.success(j==="activo"?"Rol habilitado correctamente":"Rol deshabilitado correctamente")}catch(j){w.error("Error al cambiar el estado del rol"),console.error("Error toggling role state:",j)}},[h]),L=s.useCallback(o=>{try{i?(h(i.id,o),w.success("Rol actualizado correctamente")):(x(o),w.success("Rol creado correctamente")),m(!1)}catch(j){w.error("Error al guardar el rol"),console.error("Error saving role:",j)}},[i,x,h]);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .roles-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${r.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

        /* ---------- Tarjeta de rol (rediseño) ---------- */
        .role-card{
          background: #fff;
          border-radius: 18px;
          border: 1px solid ${r.border};
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-shadow: 0 1px 2px rgba(15,23,42,.04);
          transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s cubic-bezier(.4,0,.2,1), border-color .22s ease;
        }
        .role-card:hover{
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(15,23,42,.10);
          border-color: color-mix(in srgb, var(--accent) 40%, ${r.border});
        }

        .role-card-top{
          padding: 16px 16px 12px;
        }
        .role-card-top-row{
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .role-icon{
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .role-status-pill{
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .role-switch{
          position: relative;
          width: 30px;
          height: 17px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          padding: 2px;
          flex-shrink: 0;
          transition: background .18s ease;
        }
        .role-switch-knob{
          display: block;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 2px rgba(15,23,42,.25);
          transition: transform .18s ease;
        }

        .role-name-row{
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
        }
        .role-name{
          font-size: 16px;
          font-weight: 900;
          color: ${r.text};
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .role-lock{
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: #F1F5F9;
          color: ${r.textLight};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .role-desc{
          margin-top: 4px;
          font-size: 11.5px;
          color: ${r.textLight};
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 33px;
        }

        .role-card-body{
          padding: 14px 16px 4px;
          flex: 1;
        }
        .clearance-row{
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .clearance-label{
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: ${r.textLight};
        }
        .clearance-pct{
          font-size: 14px;
          font-weight: 900;
        }
        .clearance-bars{
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 24px;
          margin-bottom: 14px;
        }
        .clearance-bar{
          flex: 1;
          border-radius: 2px;
          transition: background .3s ease;
        }

        .group-grid{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-bottom: 14px;
        }
        .group-chip{
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border-radius: 9px;
          font-size: 10.5px;
          font-weight: 800;
        }

        .role-card-footer{
          margin-top: auto;
          border-top: 1px solid ${r.border};
          display: flex;
          align-items: center;
          background: ${r.bg};
        }
        .role-action-btn{
          flex: 1;
          padding: 11px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: ${r.textLight};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s ease, color .15s ease;
        }
        .role-action-btn:hover{
          background: #fff;
          color: ${r.text};
        }
        .role-action-btn.danger:hover{
          background: #FEE2E2;
          color: #DC2626;
        }
        .role-action-divider{
          width: 1px;
          align-self: stretch;
          background: ${r.border};
        }
      `}),e.jsxs("div",{className:"roles-root",style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{style:{position:"relative",overflow:"hidden",borderRadius:20,background:"linear-gradient(135deg,#39A900,#2D7D00)",padding:"1.4rem 1.6rem",color:"#fff"},children:[e.jsx("div",{style:{position:"absolute",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:8},children:[e.jsx(B,{size:11})," Seguridad y permisos"]}),e.jsx("h1",{style:{fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:900,lineHeight:1,marginBottom:4},children:"Gestión de Roles"}),e.jsx("p",{style:{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:"Administra accesos, permisos y niveles de seguridad."})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,minWidth:280},children:[{label:"Activos",value:l.activos},{label:"Protegidos",value:l.protegidos},{label:"Permisos",value:l.permisos},{label:"Total",value:l.total}].map(o=>e.jsxs("div",{style:{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"8px 10px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:8,fontWeight:700,letterSpacing:1,color:"rgba(255,255,255,.65)",textTransform:"uppercase",marginBottom:2},children:o.label}),e.jsx("div",{style:{fontSize:20,fontWeight:900,lineHeight:1},children:o.value})]},o.label))})]})]}),e.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"},children:[e.jsxs("div",{style:{flex:1,position:"relative",minWidth:180},children:[e.jsx(ne,{size:14,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:r.textLight}}),e.jsx("input",{placeholder:"Buscar rol...",value:S,onChange:o=>$(o.target.value),style:{width:"100%",padding:"10px 14px 10px 36px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,background:"#fff",fontFamily:"inherit"},"aria-label":"Buscar roles"})]}),e.jsxs("select",{value:y,onChange:o=>g(o.target.value),style:{padding:"10px 14px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",cursor:"pointer"},"aria-label":"Filtrar por estado",children:[e.jsx("option",{value:"todos",children:"Todos"}),e.jsx("option",{value:"activo",children:"Activos"}),e.jsx("option",{value:"inactivo",children:"Inactivos"})]}),e.jsxs("button",{onClick:v,style:{padding:"10px 18px",borderRadius:11,border:"none",background:r.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 14px rgba(57,169,0,.25)"},children:[e.jsx(le,{size:15})," Nuevo Rol"]})]}),d.length===0?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem 1rem",borderRadius:16,border:`2px dashed ${r.border}`,background:"#fff",color:r.textLight},children:[e.jsx(W,{size:36,color:r.border,style:{marginBottom:10}}),e.jsx("p",{style:{fontWeight:700,fontSize:13},children:"No se encontraron roles"}),e.jsx("p",{style:{fontSize:11,marginTop:4},children:"Prueba con otros filtros o crea uno nuevo"})]}):e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14},children:d.map(o=>e.jsx(K,{rol:o,onView:O,onEdit:z,onToggleEstado:R},o.id))})]}),e.jsx(A,{open:b,onClose:()=>m(!1),maxWidth:780,children:e.jsx(Q,{initial:a,title:i?"Editar Rol":"Nuevo Rol",isEditing:!!i,onSave:L,onCancel:()=>m(!1),existingRoles:t,editingRolId:(i==null?void 0:i.id)??null},(i==null?void 0:i.id)??"new")}),e.jsx(A,{open:c,onClose:()=>p(!1),maxWidth:440,children:C&&e.jsx(J,{rol:C,onClose:()=>p(!1),onEdit:()=>z(C)})})]})}export{je as Roles};

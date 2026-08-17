import{c as se,a as ie,r as o,e as j,j as e,t as ae,S as B,b as P,f as q,E as ne,X as H,g as le}from"./index-BWzTIa0U.js";import{M as D}from"./Modal-BQ7uHy7r.js";import{C as de}from"./ConfirmDialog-DUMhrOIl.js";import{S as ce}from"./search-DzIGfOaj.js";import{P as pe}from"./plus-D1DmVZ21.js";import{S as L}from"./shield-CM41eKaS.js";import{C as V}from"./circle-x-Df7twgti.js";import{P as G}from"./pencil-DDAuoPeN.js";import{T as xe}from"./trash-2-BZ1xZCnb.js";import"./index-BaY7DVG2.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],ge=se("layers",me),r=ae,W=["Administrador","SuperAdmin"],T={administracion:{usuarios:"Usuarios",roles:"Roles",dashboard:"Dashboard"},operaciones:{entradaSalida:"Entrada / Salida",reservas:"Reservas",asignaciones:"Asignaciones"},parqueadero:{parqueaderos:"Parqueaderos",celdas:"Celdas",vehiculos:"Vehículos",conductores:"Conductores"},seguridad:{incidentes:"Incidentes",reconocimientoPlacas:"Reconocimiento"}},_={administracion:e.jsx(L,{size:13}),operaciones:e.jsx(ge,{size:13}),parqueadero:e.jsx(le,{size:13}),seguridad:e.jsx(B,{size:13})},he={administracion:"Administración",operaciones:"Operaciones",parqueadero:"Parqueadero",seguridad:"Seguridad"},Y={administracion:"#EF4444",operaciones:"#2563EB",parqueadero:"#F59E0B",seguridad:"#8B5CF6"},U={dashboard:!1,roles:!1,usuarios:!1,conductores:!1,vehiculos:!1,parqueaderos:!1,celdas:!1,asignaciones:!1,entradaSalida:!1,reservas:!1,incidentes:!1,reconocimientoPlacas:!1},ue=Object.values(T).reduce((t,u)=>({...t,...u}),{}),X=t=>{switch(t){case"Administrador":return"#EF4444";case"SuperAdmin":return"#8B5CF6";case"Supervisor":return"#2563EB";case"Vigilante":return"#F59E0B";default:return r.primary}},A=t=>Object.values(t).filter(Boolean).length,E=t=>{const u=document.createElement("div");return u.textContent=t,u.innerHTML},Q=o.memo(({initial:t,onSave:u,onCancel:f,title:x,isEditing:y=!1,existingRoles:m,editingRolId:v=null})=>{const[a,g]=o.useState(t),[p,l]=o.useState("");o.useEffect(()=>{g(t),l("")},[t]);const $=o.useCallback(n=>{g(c=>({...c,nombre:n}));const i=n.trim().toLowerCase(),d=m.some(c=>c.id!==v&&c.nombre.trim().toLowerCase()===i);l(i&&d?"Ya existe un rol con este nombre":"")},[m,v]),R=o.useCallback(n=>{g(i=>({...i,permisos:{...i.permisos,[n]:!i.permisos[n]}}))},[]),O=o.useCallback(n=>{const i=Object.keys(T[n]),d=i.every(c=>a.permisos[c]);g(c=>({...c,permisos:i.reduce((h,b)=>({...h,[b]:!d}),c.permisos)}))},[a.permisos]),k=o.useCallback(n=>{n.preventDefault();const i=a.nombre.trim();if(!i){j.error("El nombre es obligatorio");return}if(m.some(h=>h.id!==v&&h.nombre.trim().toLowerCase()===i.toLowerCase())){l("Ya existe un rol con este nombre"),j.error("Ya existe un rol con este nombre");return}const c=E(i);u({...a,nombre:c})},[a,u,m,v]),w=o.useMemo(()=>A(a.permisos),[a.permisos]),C=o.useMemo(()=>Object.keys(a.permisos).length,[a.permisos]);return e.jsxs("form",{onSubmit:k,children:[e.jsxs("div",{style:{padding:"1.4rem 1.8rem 1.2rem",borderBottom:`1px solid ${r.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:38,height:38,borderRadius:10,background:"rgba(57,169,0,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(B,{size:18,color:r.primary})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:800,letterSpacing:1,color:r.primary,textTransform:"uppercase"},children:"Seguridad"}),e.jsx("h2",{style:{fontSize:20,fontWeight:900,color:r.text,lineHeight:1},children:x})]})]}),e.jsx("button",{type:"button",onClick:f,style:{width:34,height:34,borderRadius:9,border:`1px solid ${r.border}`,background:"#fff",cursor:"pointer",color:r.textLight,display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar formulario",children:e.jsx(H,{size:16})})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem",display:"flex",flexDirection:"column",gap:"1.2rem"},children:[e.jsxs("section",{children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:r.textLight,textTransform:"uppercase",marginBottom:10},children:"Información básica"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:y?"1fr 1fr":"1fr",gap:10},children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"role-name",style:{display:"block",fontSize:12,fontWeight:700,color:r.text,marginBottom:6},children:"Nombre del rol"}),e.jsx("input",{id:"role-name",type:"text",placeholder:"ej. Operador de turno",value:a.nombre,onChange:n=>$(n.target.value),style:{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${p?"#EF4444":r.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC"},required:!0,"aria-required":"true","aria-invalid":!!p,"aria-describedby":p?"role-name-error":void 0}),p&&e.jsx("p",{id:"role-name-error",style:{marginTop:5,fontSize:11,fontWeight:700,color:"#EF4444"},children:p})]}),y&&e.jsxs("div",{children:[e.jsx("label",{htmlFor:"role-status",style:{display:"block",fontSize:12,fontWeight:700,color:r.text,marginBottom:6},children:"Estado"}),e.jsxs("select",{id:"role-status",value:a.estado,onChange:n=>g(i=>({...i,estado:n.target.value})),style:{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC",cursor:"pointer"},children:[e.jsx("option",{value:"activo",children:"Activo"}),e.jsx("option",{value:"inactivo",children:"Inactivo"})]})]})]}),e.jsxs("div",{style:{marginTop:10},children:[e.jsx("label",{htmlFor:"role-description",style:{display:"block",fontSize:12,fontWeight:700,color:r.text,marginBottom:6},children:"Descripción"}),e.jsx("textarea",{id:"role-description",placeholder:"Describe las responsabilidades de este rol...",value:a.descripcion,onChange:n=>g(i=>({...i,descripcion:n.target.value})),rows:2,style:{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC",resize:"none"}})]})]}),e.jsxs("section",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:r.textLight,textTransform:"uppercase"},children:"Permisos"}),e.jsxs("span",{style:{fontSize:11,fontWeight:700,color:r.primary},children:[w," / ",C," activos"]})]}),e.jsx("div",{style:{height:4,borderRadius:999,background:"#E2E8F0",marginBottom:12,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",borderRadius:999,background:r.primary,width:`${w/C*100}%`,transition:"width .3s ease"},role:"progressbar","aria-valuenow":w/C*100,"aria-valuemin":0,"aria-valuemax":100})}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},children:Object.entries(T).map(([n,i])=>{const d=Y[n]??r.primary,c=Object.keys(i),h=c.filter(F=>a.permisos[F]).length,b=c.length,N=h===b;return e.jsxs("div",{style:{borderRadius:12,border:`1px solid ${r.border}`,background:"#F8FAFC",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderBottom:`1px solid ${r.border}`,background:"#fff"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7},children:[e.jsx("div",{style:{width:24,height:24,borderRadius:7,background:`${d}18`,color:d,display:"flex",alignItems:"center",justifyContent:"center"},children:_[n]}),e.jsx("span",{style:{fontSize:11,fontWeight:800,color:r.text,textTransform:"capitalize"},children:n})]}),e.jsx("button",{type:"button",onClick:()=>O(n),style:{fontSize:10,fontWeight:700,color:d,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"},children:N?"Quitar todo":"Todo"})]}),e.jsx("div",{style:{height:3,background:"#E2E8F0",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",background:d,width:`${h/b*100}%`,transition:"width .3s"}})}),e.jsx("div",{style:{padding:"8px 10px",display:"flex",flexDirection:"column",gap:5},children:Object.entries(i).map(([F,I])=>{const S=a.permisos[F];return e.jsxs("button",{type:"button",onClick:()=>R(F),style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:9,cursor:"pointer",border:`1px solid ${S?`${d}30`:r.border}`,background:S?`${d}08`:"#fff",transition:"all .15s",width:"100%",fontFamily:"inherit",fontSize:11,fontWeight:600,color:r.text},role:"checkbox","aria-checked":S,children:[e.jsx("span",{children:I}),e.jsx("div",{style:{width:16,height:16,borderRadius:5,border:`1.5px solid ${S?d:r.border}`,background:S?d:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"},children:S&&e.jsx("span",{style:{color:"#fff",fontSize:9,fontWeight:900,lineHeight:1},children:"✓"})})]},F)})})]},n)})})]})]}),e.jsxs("div",{style:{padding:"1rem 1.8rem",borderTop:`1px solid ${r.border}`,display:"flex",gap:10,justifyContent:"flex-end"},children:[e.jsx("button",{type:"button",onClick:f,style:{padding:"11px 20px",borderRadius:12,border:`1px solid ${r.border}`,background:"#fff",color:r.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"},children:"Cancelar"}),e.jsx("button",{type:"submit",style:{padding:"11px 24px",borderRadius:12,border:"none",background:r.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 18px rgba(57,169,0,.22)"},children:x==="Nuevo Rol"?"Crear Rol":"Guardar cambios"})]})]})});Q.displayName="RolForm";const J=o.memo(({rol:t,onClose:u,onEdit:f})=>{const x=X(t.nombre),y=o.useMemo(()=>A(t.permisos),[t.permisos]),m=o.useMemo(()=>Object.keys(t.permisos).length,[t.permisos]),v=W.includes(t.nombre),a=o.useMemo(()=>Object.entries(t.permisos),[t.permisos]);return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{padding:"1.6rem 1.8rem 1.4rem",background:`linear-gradient(135deg, ${x}, ${x}cc)`,color:"#fff",borderRadius:"24px 24px 0 0",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between"},children:[e.jsx("div",{style:{width:42,height:42,borderRadius:11,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(L,{size:20})}),e.jsx("button",{onClick:u,style:{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Cerrar vista",children:e.jsx(H,{size:15})})]}),e.jsx("h2",{style:{marginTop:14,fontSize:26,fontWeight:900,lineHeight:1},children:E(t.nombre)}),e.jsx("p",{style:{marginTop:6,fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:t.descripcion||"Sin descripción"}),e.jsxs("div",{style:{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)",textTransform:"uppercase",letterSpacing:.5},children:t.estado}),v&&e.jsxs("span",{style:{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)",display:"flex",alignItems:"center",gap:4},children:[e.jsx(q,{size:10})," Protegido"]})]})]})]}),e.jsxs("div",{style:{padding:"1.4rem 1.8rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12},children:[e.jsx("p",{style:{fontSize:10,fontWeight:800,letterSpacing:1.5,color:r.textLight,textTransform:"uppercase"},children:"Permisos activos"}),e.jsxs("span",{style:{fontSize:12,fontWeight:700,color:x},children:[y," / ",m]})]}),e.jsx("div",{style:{height:4,borderRadius:999,background:"#E2E8F0",marginBottom:12,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",borderRadius:999,background:x,width:`${y/m*100}%`},role:"progressbar","aria-valuenow":y/m*100,"aria-valuemin":0,"aria-valuemax":100})}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:5},children:a.map(([g,p])=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${p?`${x}20`:r.border}`,background:p?`${x}06`:"#FAFAFA",color:p?r.text:r.textLight},children:[e.jsx("span",{children:ue[g]??g}),p?e.jsx(P,{size:14,color:x}):e.jsx(V,{size:14,color:"#CBD5E1"})]},g))}),e.jsxs("button",{onClick:f,style:{marginTop:16,width:"100%",padding:"13px 20px",borderRadius:12,border:"none",background:x,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 6px 18px ${x}33`},children:[e.jsx(G,{size:14}),"Editar este rol"]})]})]})});J.displayName="ViewModal";const K=o.memo(({rol:t,onView:u,onEdit:f,onDelete:x,onToggleEstado:y})=>{const m=o.useMemo(()=>A(t.permisos),[t.permisos]),v=o.useMemo(()=>Object.keys(t.permisos).length,[t.permisos]),a=Math.round(m/v*100),g=W.includes(t.nombre),p=X(t.nombre),l=t.estado==="activo",$=o.useMemo(()=>Object.entries(T).map(([i,d])=>{const c=Object.keys(d),h=c.filter(b=>t.permisos[b]).length;return{grupo:i,on:h,total:c.length}}),[t.permisos]),R=a===0?0:Math.max(1,Math.ceil(a/20)),O=[7,11,15,19,23],k=o.useCallback(()=>u(t),[u,t]),w=o.useCallback(()=>f(t),[f,t]),C=o.useCallback(()=>x(t),[x,t]),n=o.useCallback(i=>{i.stopPropagation(),y(t)},[y,t]);return e.jsxs("article",{className:"role-card",style:{"--accent":p},children:[e.jsxs("div",{className:"role-card-top",style:{borderBottom:`1px solid ${r.border}`},children:[e.jsxs("div",{className:"role-card-top-row",children:[e.jsx("div",{className:"role-icon",style:{background:`${p}15`},children:e.jsx(L,{size:20,color:p})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsxs("span",{className:"role-status-pill",style:{background:l?"rgba(57,169,0,.12)":"rgba(148,163,184,.16)",color:l?r.primaryDark:r.textLight},children:[l?e.jsx(P,{size:11}):e.jsx(V,{size:11}),t.estado]}),!g&&e.jsx("button",{type:"button",role:"switch","aria-checked":l,"aria-label":l?`Deshabilitar rol ${E(t.nombre)}`:`Habilitar rol ${E(t.nombre)}`,title:l?"Deshabilitar rol":"Habilitar rol",onClick:n,className:"role-switch",style:{background:l?r.primary:"#CBD5E1"},children:e.jsx("span",{className:"role-switch-knob",style:{transform:l?"translateX(14px)":"translateX(0)"}})})]})]}),e.jsxs("div",{className:"role-name-row",children:[e.jsx("h3",{className:"role-name",children:E(t.nombre)}),g&&e.jsx("span",{className:"role-lock",title:"Rol protegido del sistema",children:e.jsx(q,{size:11})})]}),e.jsx("p",{className:"role-desc",children:t.descripcion||"Sin descripción"})]}),e.jsxs("div",{className:"role-card-body",children:[e.jsxs("div",{className:"clearance-row",children:[e.jsx("span",{className:"clearance-label",children:"Nivel de acceso"}),e.jsxs("span",{className:"clearance-pct",style:{color:p},children:[a,"%"]})]}),e.jsx("div",{className:"clearance-bars",children:O.map((i,d)=>e.jsx("div",{className:"clearance-bar",style:{height:i,background:d<R?p:"#E2E8F0"}},d))}),e.jsx("div",{className:"group-grid",children:$.map(({grupo:i,on:d,total:c})=>{const h=Y[i],b=d>0;return e.jsxs("div",{className:"group-chip",style:{background:b?`${h}12`:"#F8FAFC",color:b?h:r.textLight,border:`1px solid ${b?`${h}30`:r.border}`},title:he[i],children:[_[i],e.jsxs("span",{children:[d,"/",c]})]},i)})})]}),e.jsxs("div",{className:"role-card-footer",children:[e.jsx("button",{className:"role-action-btn",onClick:k,"aria-label":`Ver detalle de ${E(t.nombre)}`,title:"Ver detalle",children:e.jsx(ne,{size:15})}),e.jsx("span",{className:"role-action-divider"}),e.jsx("button",{className:"role-action-btn",onClick:w,"aria-label":`Editar ${E(t.nombre)}`,title:"Editar",children:e.jsx(G,{size:15})}),!g&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"role-action-divider"}),e.jsx("button",{className:"role-action-btn danger",onClick:C,"aria-label":`Eliminar ${E(t.nombre)}`,title:"Eliminar",children:e.jsx(xe,{size:15})})]})]})]})});K.displayName="RoleCard";const M=()=>({nombre:"",descripcion:"",permisos:{...U},estado:"activo"});function Ee(){const{roles:t,addRol:u,updateRol:f,deleteRol:x}=ie(),[y,m]=o.useState(!1),[v,a]=o.useState(!1),[g,p]=o.useState(!1),[l,$]=o.useState(null),[R,O]=o.useState(null),[k,w]=o.useState(null),[C,n]=o.useState(""),[i,d]=o.useState("todos"),[c,h]=o.useState(M()),b=o.useMemo(()=>t.filter(s=>{const z=s.nombre.toLowerCase().includes(C.toLowerCase()),oe=i==="todos"||s.estado===i;return z&&oe}),[t,C,i]),N=o.useMemo(()=>({activos:t.filter(s=>s.estado==="activo").length,protegidos:W.length,total:t.length,permisos:Object.keys(U).length}),[t]),F=o.useCallback(()=>{$(null),h(M()),m(!0)},[]),I=o.useCallback(s=>{$(s),h({nombre:s.nombre,descripcion:s.descripcion,permisos:{...s.permisos},estado:s.estado}),a(!1),m(!0)},[]),S=o.useCallback(s=>{O(s),a(!0)},[]),Z=o.useCallback(s=>{if(W.includes(s.nombre)){j.error("Este rol está protegido y no puede eliminarse");return}w(s),p(!0)},[]),ee=o.useCallback(s=>{if(W.includes(s.nombre)){j.error("Este rol está protegido y no puede deshabilitarse");return}try{const z=s.estado==="activo"?"inactivo":"activo";f(s.id,{nombre:s.nombre,descripcion:s.descripcion,permisos:s.permisos,estado:z}),j.success(z==="activo"?"Rol habilitado correctamente":"Rol deshabilitado correctamente")}catch(z){j.error("Error al cambiar el estado del rol"),console.error("Error toggling role state:",z)}},[f]),re=o.useCallback(s=>{try{l?(f(l.id,s),j.success("Rol actualizado correctamente")):(u(s),j.success("Rol creado correctamente")),m(!1)}catch(z){j.error("Error al guardar el rol"),console.error("Error saving role:",z)}},[l,u,f]),te=o.useCallback(()=>{if(k)try{x(k.id),j.success("Rol eliminado correctamente"),p(!1),w(null)}catch(s){j.error("Error al eliminar el rol"),console.error("Error deleting role:",s)}},[k,x]);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
      `}),e.jsxs("div",{className:"roles-root",style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{style:{position:"relative",overflow:"hidden",borderRadius:20,background:"linear-gradient(135deg,#39A900,#2D7D00)",padding:"1.4rem 1.6rem",color:"#fff"},children:[e.jsx("div",{style:{position:"absolute",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}),e.jsxs("div",{style:{position:"relative",zIndex:2,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:8},children:[e.jsx(B,{size:11})," Seguridad y permisos"]}),e.jsx("h1",{style:{fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:900,lineHeight:1,marginBottom:4},children:"Gestión de Roles"}),e.jsx("p",{style:{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.5},children:"Administra accesos, permisos y niveles de seguridad."})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,minWidth:280},children:[{label:"Activos",value:N.activos},{label:"Protegidos",value:N.protegidos},{label:"Permisos",value:N.permisos},{label:"Total",value:N.total}].map(s=>e.jsxs("div",{style:{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"8px 10px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:8,fontWeight:700,letterSpacing:1,color:"rgba(255,255,255,.65)",textTransform:"uppercase",marginBottom:2},children:s.label}),e.jsx("div",{style:{fontSize:20,fontWeight:900,lineHeight:1},children:s.value})]},s.label))})]})]}),e.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"},children:[e.jsxs("div",{style:{flex:1,position:"relative",minWidth:180},children:[e.jsx(ce,{size:14,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:r.textLight}}),e.jsx("input",{placeholder:"Buscar rol...",value:C,onChange:s=>n(s.target.value),style:{width:"100%",padding:"10px 14px 10px 36px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,background:"#fff",fontFamily:"inherit"},"aria-label":"Buscar roles"})]}),e.jsxs("select",{value:i,onChange:s=>d(s.target.value),style:{padding:"10px 14px",borderRadius:11,border:`1px solid ${r.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",cursor:"pointer"},"aria-label":"Filtrar por estado",children:[e.jsx("option",{value:"todos",children:"Todos"}),e.jsx("option",{value:"activo",children:"Activos"}),e.jsx("option",{value:"inactivo",children:"Inactivos"})]}),e.jsxs("button",{onClick:F,style:{padding:"10px 18px",borderRadius:11,border:"none",background:r.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 14px rgba(57,169,0,.25)"},children:[e.jsx(pe,{size:15})," Nuevo Rol"]})]}),b.length===0?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem 1rem",borderRadius:16,border:`2px dashed ${r.border}`,background:"#fff",color:r.textLight},children:[e.jsx(L,{size:36,color:r.border,style:{marginBottom:10}}),e.jsx("p",{style:{fontWeight:700,fontSize:13},children:"No se encontraron roles"}),e.jsx("p",{style:{fontSize:11,marginTop:4},children:"Prueba con otros filtros o crea uno nuevo"})]}):e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14},children:b.map(s=>e.jsx(K,{rol:s,onView:S,onEdit:I,onDelete:Z,onToggleEstado:ee},s.id))})]}),e.jsx(D,{open:y,onClose:()=>m(!1),maxWidth:780,children:e.jsx(Q,{initial:c,title:l?"Editar Rol":"Nuevo Rol",isEditing:!!l,onSave:re,onCancel:()=>m(!1),existingRoles:t,editingRolId:(l==null?void 0:l.id)??null},(l==null?void 0:l.id)??"new")}),e.jsx(D,{open:v,onClose:()=>a(!1),maxWidth:440,children:R&&e.jsx(J,{rol:R,onClose:()=>a(!1),onEdit:()=>I(R)})}),e.jsx(de,{open:g,onConfirm:te,onCancel:()=>{p(!1),w(null)},title:"Eliminar Rol",message:`¿Estás seguro de eliminar el rol "${k==null?void 0:k.nombre}"? Esta acción no se puede deshacer.`})]})}export{Ee as Roles};

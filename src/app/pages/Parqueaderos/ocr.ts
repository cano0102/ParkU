import { useCallback, useRef } from "react";
import { createWorker, PSM } from "tesseract.js";
import { extraerDatosDocumento, validarPlacaColombiana } from "./helpers";

function calcularUmbralOtsu(hist:number[],total:number):number{
  let sum=0; for(let i=0;i<256;i++) sum+=i*hist[i];
  let sumB=0,pesoB=0,maxV=0,umbral=127;
  for(let t=0;t<256;t++){
    pesoB+=hist[t]; if(!pesoB) continue;
    const pesoF=total-pesoB; if(!pesoF) break;
    sumB+=t*hist[t];
    const mB=sumB/pesoB,mF=(sum-sumB)/pesoF;
    const v=pesoB*pesoF*(mB-mF)*(mB-mF);
    if(v>maxV){maxV=v;umbral=t;}
  }
  return umbral;
}
function preprocesarDocumento(video:HTMLVideoElement):string{
  if(!video.videoWidth||!video.videoHeight) throw new Error("Cámara no lista.");
  const src=document.createElement("canvas"); src.width=video.videoWidth; src.height=video.videoHeight;
  const ctx=src.getContext("2d"); if(!ctx) throw new Error("Canvas falló.");
  ctx.drawImage(video,0,0);
  const escala=2.4; const dest=document.createElement("canvas");
  dest.width=Math.round(src.width*escala); dest.height=Math.round(src.height*escala);
  const dctx=dest.getContext("2d"); if(!dctx) throw new Error("Canvas OCR falló.");
  dctx.imageSmoothingEnabled=true; dctx.imageSmoothingQuality="high";
  dctx.drawImage(src,0,0,src.width,src.height,0,0,dest.width,dest.height);
  const img=dctx.getImageData(0,0,dest.width,dest.height); const d=img.data;
  const gr=new Uint8ClampedArray(d.length/4); const hist=new Array(256).fill(0);
  for(let i=0,p=0;i<d.length;i+=4,p++){ const g=Math.round(d[i]*.299+d[i+1]*.587+d[i+2]*.114); gr[p]=g; hist[g]++; }
  const u=calcularUmbralOtsu(hist,gr.length);
  for(let p=0,i=0;p<gr.length;p++,i+=4){ const v=gr[p]>u?255:0; d[i]=v;d[i+1]=v;d[i+2]=v; }
  dctx.putImageData(img,0,0); return dest.toDataURL("image/png");
}
export function preprocesarImagenArchivo(dataUrl:string):Promise<string>{
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{
      try{
        const escala=img.width<900?2.4:1.4;
        const dest=document.createElement("canvas");
        dest.width=Math.round(img.width*escala); dest.height=Math.round(img.height*escala);
        const dctx=dest.getContext("2d"); if(!dctx) return rej(new Error("Canvas OCR falló."));
        dctx.imageSmoothingEnabled=true; dctx.imageSmoothingQuality="high";
        dctx.drawImage(img,0,0,dest.width,dest.height);
        const imgD=dctx.getImageData(0,0,dest.width,dest.height); const d=imgD.data;
        const gr=new Uint8ClampedArray(d.length/4); const hist=new Array(256).fill(0);
        for(let i=0,p=0;i<d.length;i+=4,p++){ const g=Math.round(d[i]*.299+d[i+1]*.587+d[i+2]*.114); gr[p]=g; hist[g]++; }
        const u=calcularUmbralOtsu(hist,gr.length);
        for(let p=0,i=0;p<gr.length;p++,i+=4){ const v=gr[p]>u?255:0; d[i]=v;d[i+1]=v;d[i+2]=v; }
        dctx.putImageData(imgD,0,0); res(dest.toDataURL("image/png"));
      }catch(e){ rej(e); }
    };
    img.onerror=()=>rej(new Error("No se pudo cargar la imagen.")); img.src=dataUrl;
  });
}
export function useOcrPlaca(){
  const workerRef=useRef<any>(null); const initRef=useRef<Promise<any>|null>(null);
  const getWorker=useCallback(async()=>{
    if(workerRef.current) return workerRef.current;
    if(!initRef.current){ initRef.current=createWorker("spa").then(async(w:any)=>{
      try{
        await w.setParameters({
          tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ0123456789 .:-/",
          // Placas colombianas (carro ABC123 / moto ABC12D) son una sola línea de texto.
          // Sin esto, Tesseract asume una página completa y no encuentra ningún bloque
          // de texto que analizar, devolviendo siempre una cadena vacía.
          tessedit_pageseg_mode: PSM.SINGLE_LINE,
        });
      }catch{}
      workerRef.current=w; return w;
    }); }
    return initRef.current;
  },[]);
  const procesarImagen=useCallback(async(url:string)=>{ const w=await getWorker(); const {data}=await w.recognize(url); const r=extraerDatosDocumento(data.text||""); if(!r.placa||!validarPlacaColombiana(r.placa)) throw new Error("No se detectó una placa válida."); return r; },[getWorker]);
  const reconocer=useCallback(async(video:HTMLVideoElement)=>procesarImagen(preprocesarDocumento(video)),[procesarImagen]);
  const reconocerLicencia=useCallback(async(url:string)=>procesarImagen(url),[procesarImagen]);
  const liberarWorker=useCallback(async()=>{ try{ if(workerRef.current) await workerRef.current.terminate(); }catch{}finally{ workerRef.current=null; initRef.current=null; } },[]);
  return {reconocer,reconocerLicencia,liberarWorker};
}

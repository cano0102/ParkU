import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Celda } from "@/services/api/celdas";
import type { VehiculoForm } from "../lib/helpers";
import { tipoVehiculoDesdePlaca } from "../lib/helpers";
import { useOcrPlaca, preprocesarImagenArchivo, calcularRoiDesdeGuia } from "../lib/ocrAdapter";
import type { ModalKind } from "./useModalController";

type ScannerOrigin = "ingreso" | null;

/** Cámara + reconocimiento óptico de placas: captura en vivo, archivo subido y el simulador de demo. */
export function useOcrScanner(
  celdaActiva: Celda | null,
  setVehiculoForm: React.Dispatch<React.SetStateAction<VehiculoForm>>,
  openModal: ModalKind,
  setOpenModal: (m: ModalKind) => void,
) {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrFlash, setOcrFlash] = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  const [scannerOrigin, setScannerOrigin] = useState<ScannerOrigin>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const guiaRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { reconocer, reconocerLicencia, liberarWorker } = useOcrPlaca();

  const cerrarCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamaraLista(false);
  }, []);

  const iniciarCamara = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setOcrError("Cámara no compatible. Usa HTTPS."); return; }
    setOcrError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch { setOcrError("No se pudo iniciar la cámara."); }
    }
  }, []);

  useEffect(() => {
    if (openModal === "scanner") iniciarCamara(); else cerrarCamara();
    return () => cerrarCamara();
  }, [openModal, iniciarCamara, cerrarCamara]);

  useEffect(() => () => { liberarWorker(); }, [liberarWorker]);

  const abrirScannerDesde = useCallback((origen: Exclude<ScannerOrigin, null>) => {
    setScannerOrigin(origen);
    setOpenModal("scanner");
  }, [setOpenModal]);

  const cerrarScanner = useCallback(() => setOpenModal("ingreso"), [setOpenModal]);

  /* Avisa si la placa detectada por OCR no coincide con el tipo de la celda que se
     está registrando (p. ej. escanear una placa de carro para una celda de moto). */
  const avisarSiTipoNoCoincide = useCallback((placaDetectada: string) => {
    if (scannerOrigin !== "ingreso" || !celdaActiva) return;
    if (celdaActiva.tipo !== "carro" && celdaActiva.tipo !== "moto") return;
    const tipoDetectado = tipoVehiculoDesdePlaca(placaDetectada);
    if (tipoDetectado && tipoDetectado !== celdaActiva.tipo) {
      toast.warning(`La placa ${placaDetectada} tiene formato de ${tipoDetectado}, pero la celda ${celdaActiva.numero} es para ${celdaActiva.tipo}s.`);
    }
  }, [scannerOrigin, celdaActiva]);

  const aplicarDeteccion = useCallback((d: { placa: string; conductor?: string; marca?: string; modelo?: string; color?: string }) => {
    setVehiculoForm((prev) => ({
      ...prev,
      placa: d.placa,
      conductor: d.conductor || prev.conductor,
      marca: d.marca || prev.marca,
      modelo: d.modelo || prev.modelo,
      color: d.color || prev.color,
    }));
    toast.success(`Placa detectada: ${d.placa}`);
    avisarSiTipoNoCoincide(d.placa);
  }, [setVehiculoForm, avisarSiTipoNoCoincide]);

  const handleCaptureOcr = useCallback(async () => {
    if (!videoRef.current) return;
    setOcrLoading(true); setOcrError(null);
    try {
      const roi = guiaRef.current ? calcularRoiDesdeGuia(videoRef.current, guiaRef.current) ?? undefined : undefined;
      const d = await reconocer(videoRef.current, roi);
      setOcrFlash(true); setTimeout(() => setOcrFlash(false), 1200);
      aplicarDeteccion(d);
      cerrarCamara();
      setOpenModal("ingreso");
    } catch (e) { setOcrError(e instanceof Error ? e.message : "Error al escanear."); }
    finally { setOcrLoading(false); }
  }, [reconocer, aplicarDeteccion, cerrarCamara, setOpenModal]);

  const handleFileOCR = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setOcrLoading(true); setOcrError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const url = await preprocesarImagenArchivo(ev.target?.result as string);
          const d = await reconocerLicencia(url);
          setOcrFlash(true); setTimeout(() => setOcrFlash(false), 1200);
          aplicarDeteccion(d);
          setOpenModal("ingreso");
        } catch (err) { setOcrError(err instanceof Error ? err.message : "No se reconoció la placa."); }
        finally { setOcrLoading(false); }
      };
      reader.readAsDataURL(f);
    } catch { setOcrError("No se pudo procesar la imagen."); setOcrLoading(false); }
  }, [reconocerLicencia, aplicarDeteccion, setOpenModal]);

  const handleSimOCR = useCallback((p: string, con: string, rol: string, marca: string, modelo: string, color: string) => {
    setOcrLoading(true);
    setTimeout(() => {
      setOcrLoading(false); setOcrFlash(true);
      setTimeout(() => {
        setOcrFlash(false);
        setVehiculoForm({ placa: p, conductor: con, esOficial: rol === "Oficial", marca, modelo, color });
        avisarSiTipoNoCoincide(p);
        setOpenModal("ingreso");
      }, 1000);
    }, 800);
  }, [setVehiculoForm, avisarSiTipoNoCoincide, setOpenModal]);

  return {
    videoRef, guiaRef, camaraLista, setCamaraLista,
    ocrLoading, ocrError, ocrFlash,
    abrirScannerDesde, cerrarScanner, handleCaptureOcr, handleFileOCR, handleSimOCR,
  };
}

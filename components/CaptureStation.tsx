
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Video, MonitorStop, Copy, AlertCircle, Maximize2, Minimize2, Loader2, CheckCircle, Upload, Images, Wand2, FolderOpen, X, Move, RotateCw, ZoomIn, Crop, ArrowUpDown, LayoutGrid, Youtube, ArrowRightLeft, AlignVerticalSpaceAround, ImagePlus, Layers, RefreshCw, Scan, Square, Circle as CircleIcon, Pause, Play } from 'lucide-react';
import { CapturedImage, BurstSession } from '../types';

interface CaptureStationProps {
  onCaptureImage: (image: CapturedImage) => void;
  onSetVideoLink: (link: string) => void;
  videoLink: string;
  patientName: string;
  directoryHandle: FileSystemDirectoryHandle | null;
  burstSpeed: number; // fotos por segundo
  shortcuts: {
    photo: string;
    record: string;
    fullscreen: string;
  };
  autoCropEnabled: boolean;
  burstHistory: BurstSession[];
  onBurstComplete: (session: BurstSession) => void;
}

interface MosaicEditorState {
  rotation: number; // degrees
  scale: number;
  panX: number;
  panY: number;
  cropWidth: number;
  cropHeight: number;
  columns: number;
  gapX: number; // Espaçamento Horizontal
  gapY: number; // Espaçamento Vertical
}

interface CropMask {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle';
  active: boolean;
}

const CaptureStation: React.FC<CaptureStationProps> = ({ 
  onCaptureImage, 
  onSetVideoLink, 
  videoLink, 
  patientName, 
  directoryHandle, 
  burstSpeed, 
  shortcuts, 
  autoCropEnabled, 
  burstHistory,
  onBurstComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Used for image processing (hidden)
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Reference for the current Burst sub-folder
  const burstDirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const currentBurstFolderNameRef = useRef<string>("");
  const currentBurstCountRef = useRef<number>(0);

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state for async ops
  const [recordingTime, setRecordingTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFSApiSupported, setIsFSApiSupported] = useState(true);
  
  // Crop Mask State (The Green Frame)
  const [cropMask, setCropMask] = useState<CropMask>({
    x: 100,
    y: 100,
    width: 400,
    height: 400,
    shape: 'circle',
    active: autoCropEnabled
  });
  const isMaskDraggingRef = useRef(false);
  const isMaskResizingRef = useRef(false);
  const maskDragStartRef = useRef({ x: 0, y: 0 });
  
  // Media Recorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileHandleRef = useRef<any>(null);
  const isTogglingRecordRef = useRef(false);
  
  // Mosaic / Burst AI States
  const [selectedBurst, setSelectedBurst] = useState<BurstSession | null>(null);
  const [showBurstActionModal, setShowBurstActionModal] = useState(false);
  const [isMosaicProcessing, setIsMosaicProcessing] = useState(false);
  
  // Manual Mosaic Editor States
  const [showManualMosaicEditor, setShowManualMosaicEditor] = useState(false);
  const [previewImageBitmap, setPreviewImageBitmap] = useState<ImageBitmap | null>(null);
  
  // Estado do Editor de Mosaico (Free Form)
  const [editorState, setEditorState] = useState<MosaicEditorState>({
    rotation: 0,
    scale: 1,
    panX: 0,
    panY: 0,
    cropWidth: 200,
    cropHeight: 300,
    columns: 8,
    gapX: 0,
    gapY: 0
  });

  const editorCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastDragPosRef = useRef({ x: 0, y: 0 });
  
  // Refs for logic
  const burstPressTimerRef = useRef<number | null>(null);
  const recordPressTimerRef = useRef<number | null>(null);
  const longPressHandledRef = useRef<boolean>(false);
  const burstFrameRef = useRef<number>(0);
  const burstRequestRef = useRef<number | null>(null);
  const lastBurstTimeRef = useRef<number>(0);

  // Check API Support
  useEffect(() => {
    setIsFSApiSupported('showDirectoryPicker' in window);
  }, []);

  // Sync autoCropEnabled prop with mask active state
  useEffect(() => {
    setCropMask(prev => ({ ...prev, active: autoCropEnabled }));
  }, [autoCropEnabled]);

  // --- CAMERA INITIALIZATION LOGIC ---

  const initCamera = async () => {
      setErrorMsg(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      console.log("Inicializando câmera (Protocolo Robusto)...");

      const tryGetUserMedia = async (constraints: MediaStreamConstraints) => {
        try {
          return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
          console.warn("Constraint failed:", constraints, e);
          return null;
        }
      };

      try {
        let mediaStream = await tryGetUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: true
        });

        if (!mediaStream) {
            console.log("Fallback: Sem áudio...");
            mediaStream = await tryGetUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false
            });
        }

        if (!mediaStream) {
            console.log("Fallback: Baixa Resolução...");
            mediaStream = await tryGetUserMedia({
                video: true,
                audio: false
            });
        }

        if (!mediaStream) {
            throw new Error("Nenhuma câmera disponível.");
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Fatal Camera Error:", err);
        setErrorMsg("Erro ao acessar câmera. Verifique permissões.");
      }
  };

  useEffect(() => {
    initCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []); 

  useEffect(() => {
    if (stream && videoRef.current) {
        console.log("Conectando stream ao elemento de vídeo...");
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => {
            console.error("Play error:", e);
            videoRef.current!.muted = true;
            videoRef.current!.play().catch(console.error);
        });
    }
  }, [stream]);

  // Timer for recording UI
  useEffect(() => {
    let interval: number;
    if (isRecording && !isPaused) {
      interval = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Handle Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  }, []);

  // --- FILE MANAGEMENT UTILS ---
  const generateFilename = (type: 'FOTO' | 'VIDEO' | 'BURST' | 'MOSAICO', ext: string, index?: number) => {
    const date = new Date().toISOString().split('T')[0];
    const safeName = (patientName || 'SemPaciente').replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    if (type === 'BURST' && typeof index === 'number') {
      return `IMG_${index.toString().padStart(4, '0')}.${ext}`;
    }
    return `${date}_${safeName}_${type}_${timestamp}.${ext}`;
  };

  const verifyPermission = async (handle: FileSystemDirectoryHandle) => {
    const options = { mode: 'readwrite' };
    try {
      // @ts-ignore
      if ((await handle.queryPermission(options)) === 'granted') {
        return true;
      }
      // @ts-ignore
      if ((await handle.requestPermission(options)) === 'granted') {
        return true;
      }
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
    }
    return false;
  };

  const saveBlobToDirectory = async (blob: Blob, filename: string, targetHandle?: FileSystemDirectoryHandle) => {
    const handleToUse = targetHandle || directoryHandle;
    if (!handleToUse) return false;
    try {
      // @ts-ignore
      const fileHandle = await handleToUse.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      console.error("Error saving file:", err);
      return false;
    }
  };

  // --- MASK AUTO-DETECTION LOGIC ---
  const detectScopeArea = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;
    const w = canvas.width;
    const h = canvas.height;
    
    // Find bounding box of bright pixels
    let minX = w, maxX = 0, minY = h, maxY = 0;
    const THRESHOLD = 25; // Brightness threshold
    
    // Optimize scanning: check every 4th pixel
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const i = (y * w + x) * 4;
        const brightness = Math.max(data[i], data[i+1], data[i+2]);
        if (brightness > THRESHOLD) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Add some padding
    const padding = 20;
    minX = Math.max(0, minX - padding);
    maxX = Math.min(w, maxX + padding);
    minY = Math.max(0, minY - padding);
    maxY = Math.min(h, maxY + padding);

    const detectedW = maxX - minX;
    const detectedH = maxY - minY;

    if (detectedW > 50 && detectedH > 50) {
      // Decide shape based on aspect ratio
      const ratio = detectedW / detectedH;
      const isCircle = ratio > 0.8 && ratio < 1.2;
      
      setCropMask(prev => ({
        ...prev,
        x: minX,
        y: minY,
        width: detectedW,
        height: detectedH,
        shape: isCircle ? 'circle' : 'rect',
        active: true
      }));
    } else {
      // If detection fails, don't break, just log
      console.log("Auto-detection uncertain, keeping default or current mask.");
    }
  }, []);

  // --- AUTO-TRIGGER DETECTION ON STARTUP ---
  useEffect(() => {
    if (stream && autoCropEnabled && videoRef.current) {
        // Wait a bit for camera exposure to settle before detecting
        const timer = setTimeout(() => {
            detectScopeArea();
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [stream, autoCropEnabled, detectScopeArea]);


  // --- CAPTURE FRAME LOGIC ---
  const captureFrame = useCallback(async (isBurstMode: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Capture RAW Frame (Always needed for backup or Burst)
    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = video.videoWidth; 
    rawCanvas.height = video.videoHeight;
    const rawCtx = rawCanvas.getContext('2d');
    if (!rawCtx) return;
    rawCtx.drawImage(video, 0, 0);

    // Save RAW to disk if directory is selected (Backgound backup)
    if ((isBurstMode && burstDirHandleRef.current) || (!isBurstMode && directoryHandle)) {
         rawCanvas.toBlob(async (blob) => {
            if (blob) {
              const filename = isBurstMode 
                ? generateFilename('BURST', 'jpg', burstFrameRef.current) 
                : generateFilename('FOTO', 'jpg');
              
              const target = isBurstMode ? burstDirHandleRef.current : directoryHandle;
              if (target) {
                 const success = await saveBlobToDirectory(blob, filename, target);
                 if (success && isBurstMode) {
                     currentBurstCountRef.current += 1;
                 }
                 if (!success && !isBurstMode) {
                     console.error("Falha ao salvar foto.");
                 }
              }
            }
         }, 'image/jpeg', 1.0);
    }

    if (isBurstMode) return; // Burst only saves raw files to disk

    // 2. Process for Report (Apply Green Mask)
    let finalCanvas = rawCanvas;

    if (cropMask.active) {
        // Create a canvas with the size of the mask
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropMask.width;
        croppedCanvas.height = cropMask.height;
        const ctx = croppedCanvas.getContext('2d');
        if (ctx) {
            // Logic: Draw the mask shape, Clip, then Draw Video offset
            ctx.beginPath();
            if (cropMask.shape === 'circle') {
                const cx = cropMask.width / 2;
                const cy = cropMask.height / 2;
                const r = Math.min(cx, cy);
                ctx.ellipse(cx, cy, r, r * (cropMask.height / cropMask.width), 0, 0, 2 * Math.PI);
            } else {
                ctx.rect(0, 0, cropMask.width, cropMask.height);
            }
            ctx.clip();
            
            // Draw video offset by mask position
            ctx.drawImage(video, -cropMask.x, -cropMask.y);
            finalCanvas = croppedCanvas;
        }
    }

    const dataUrl = finalCanvas.toDataURL('image/png');
    const newImage: CapturedImage = {
        id: crypto.randomUUID(),
        url: dataUrl,
        timestamp: Date.now(),
        type: 'regular'
    };
    onCaptureImage(newImage);

  }, [onCaptureImage, directoryHandle, patientName, cropMask]);

  const flashEffect = useCallback(() => {
    const flash = document.createElement('div');
    flash.className = "absolute inset-0 bg-white opacity-50 z-50 pointer-events-none transition-opacity duration-200";
    playerContainerRef.current?.appendChild(flash);
    setTimeout(() => flash.remove(), 150);
  }, []);

  // UPDATED: Async check before capture
  const takeSinglePhoto = useCallback(async () => {
    if (directoryHandle) {
        // Ensure permission is granted explicitly during the click event
        const hasPermission = await verifyPermission(directoryHandle);
        if (!hasPermission) {
            alert("Permissão para salvar na pasta negada pelo navegador.");
            return;
        }
    }
    captureFrame(false); 
    flashEffect();
  }, [captureFrame, flashEffect, directoryHandle]);

  const startBurst = useCallback(async () => {
    if (isBursting) return;
    if (!directoryHandle) {
      if (isFSApiSupported) alert("Para usar o modo Burst, selecione a pasta nas Configurações.");
      else alert("Modo Burst indisponível.");
      return;
    }
    
    // Explicit permission check on start
    if (!(await verifyPermission(directoryHandle))) {
       alert("Permissão de escrita na pasta negada.");
       return;
    }

    const folderName = `${new Date().toISOString().split('T')[0]}_${(patientName || 'SemPaciente').replace(/[^a-z0-9]/gi, '_')}_BURST_${new Date().toTimeString().split(' ')[0].replace(/:/g, '')}`;
    try {
      // @ts-ignore
      const subDir = await directoryHandle.getDirectoryHandle(folderName, { create: true });
      burstDirHandleRef.current = subDir;
      currentBurstFolderNameRef.current = folderName;
      currentBurstCountRef.current = 0;
    } catch (e) {
      console.error(e);
      burstDirHandleRef.current = null;
      alert("Erro ao criar subpasta do Burst.");
      return;
    }
    
    setIsBursting(true); 
    burstFrameRef.current = 0;
    lastBurstTimeRef.current = 0;
    
    const loop = (timestamp: number) => {
      const interval = 1000 / burstSpeed;
      if (timestamp - lastBurstTimeRef.current >= interval) {
        burstFrameRef.current++;
        captureFrame(true);
        lastBurstTimeRef.current = timestamp;
      }
      burstRequestRef.current = requestAnimationFrame(loop);
    };
    burstRequestRef.current = requestAnimationFrame(loop);
  }, [isBursting, captureFrame, directoryHandle, isFSApiSupported, patientName, burstSpeed]);

  const stopBurst = useCallback(() => {
    setIsBursting(false);
    if (burstRequestRef.current) { cancelAnimationFrame(burstRequestRef.current); burstRequestRef.current = null; }
    
    if (currentBurstCountRef.current > 0) {
      const now = new Date();
      // Passa a sessão para o componente pai
      onBurstComplete({
        id: crypto.randomUUID(),
        folderName: currentBurstFolderNameRef.current,
        count: currentBurstCountRef.current,
        timestamp: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      });
    } else {
        console.warn("Burst finalizado, mas 0 fotos foram salvas (verifique permissões).");
    }
    burstDirHandleRef.current = null;
    flashEffect();
  }, [flashEffect, onBurstComplete]);

  // --- RECORDING ---
  const startRecording = useCallback(async () => {
      if (!stream) return;
      if (isTogglingRecordRef.current) return;
      
      let useInMemory = false;
      
      if (directoryHandle) {
         if (!(await verifyPermission(directoryHandle))) {
            alert("Permissão de escrita na pasta negada. Verifique as configurações.");
            return;
         }
      } else if (isFSApiSupported) {
        if (confirm("Pasta de destino não selecionada. Deseja gravar em memória temporária e baixar o arquivo manualmente ao final?")) {
           useInMemory = true;
        } else {
           return;
        }
      }
      
      isTogglingRecordRef.current = true;
      setIsProcessing(true);

      const mimeType = [
        'video/webm;codecs=vp9', 
        'video/webm;codecs=vp8', 
        'video/webm', 
        'video/mp4'
      ].find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

      try {
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        fileHandleRef.current = null;
        
        if (directoryHandle && !useInMemory) {
           const filename = generateFilename('VIDEO', mimeType.includes('mp4') ? 'mp4' : 'webm');
           try {
             // @ts-ignore
             const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
             const writable = await fileHandle.createWritable();
             fileHandleRef.current = writable;
           } catch(e) {
             console.error("FS API Error", e);
             fileHandleRef.current = null;
           }
        }

        recorder.ondataavailable = async (e) => {
           if (e.data && e.data.size > 0) {
              if (fileHandleRef.current) {
                await fileHandleRef.current.write(e.data);
              } else {
                chunksRef.current.push(e.data);
              }
           }
        };

        recorder.onstop = async () => {
           if (fileHandleRef.current) {
             await fileHandleRef.current.close();
             fileHandleRef.current = null;
           } else if (chunksRef.current.length > 0) {
             const blob = new Blob(chunksRef.current, { type: mimeType });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = generateFilename('VIDEO', mimeType.includes('mp4') ? 'mp4' : 'webm');
             a.click();
             URL.revokeObjectURL(url);
           }
           setIsRecording(false);
           setIsPaused(false);
           setRecordingTime(0);
           setShowUploadModal(true);
           isTogglingRecordRef.current = false;
        };

        recorder.start(1000);
        setIsRecording(true);
        setIsPaused(false);
      } catch (e) {
        console.error("Recording error", e);
        alert("Erro ao iniciar gravação.");
        isTogglingRecordRef.current = false;
      } finally {
        setIsProcessing(false);
      }
  }, [stream, directoryHandle, isFSApiSupported, patientName]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // --- KEYBOARD & MOUSE HANDLERS ---
  const handlePhotoAction = useCallback(async (isDown: boolean) => {
    if (isDown) {
      if (burstPressTimerRef.current === null) {
        if (directoryHandle) {
             await verifyPermission(directoryHandle);
        }
        burstPressTimerRef.current = window.setTimeout(() => {
          startBurst();
        }, 1000); 
      }
    } else {
      if (burstPressTimerRef.current !== null) {
        clearTimeout(burstPressTimerRef.current);
        burstPressTimerRef.current = null;
      }
      if (burstRequestRef.current !== null) {
        stopBurst();
      } else {
        takeSinglePhoto();
      }
    }
  }, [startBurst, stopBurst, takeSinglePhoto, directoryHandle]);

  const handleRecordAction = useCallback((isDown: boolean) => {
    if (isDown) {
        if (isRecording) {
             if (recordPressTimerRef.current === null) {
                recordPressTimerRef.current = window.setTimeout(() => {
                   stopRecording();
                   longPressHandledRef.current = true;
                }, 1000);
            }
        }
    } else {
        if (recordPressTimerRef.current !== null) {
            clearTimeout(recordPressTimerRef.current);
            recordPressTimerRef.current = null;
        }
        if (longPressHandledRef.current) {
            longPressHandledRef.current = false;
            return;
        }
        if (!isRecording) {
            startRecording();
        } else {
            if (isPaused) resumeRecording();
            else pauseRecording();
        }
    }
  }, [isRecording, isPaused, startRecording, pauseRecording, resumeRecording, stopRecording]);

  const handleRecordMouseLeave = useCallback(() => {
     if (recordPressTimerRef.current !== null) {
        clearTimeout(recordPressTimerRef.current);
        recordPressTimerRef.current = null;
     }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (!e.key) return; // FIX: Guard against undefined key
        const key = e.key.toUpperCase();
        if (key === shortcuts.photo || key === 'F8') handlePhotoAction(true);
        if (key === shortcuts.record || key === 'F9') handleRecordAction(true);
        if (key === shortcuts.fullscreen || key === 'F10') {
           e.preventDefault(); 
           toggleFullscreen();
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (!e.key) return; // FIX: Guard against undefined key
        const key = e.key.toUpperCase();
        if (key === shortcuts.photo || key === 'F8') handlePhotoAction(false);
        if (key === shortcuts.record || key === 'F9') handleRecordAction(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePhotoAction, handleRecordAction, toggleFullscreen, shortcuts]);

  // --- MANUAL EDITOR LOGIC ---
  const handleBurstClick = (session: BurstSession) => { setSelectedBurst(session); setShowBurstActionModal(true); };
  const initManualEditor = async () => {
    if (!selectedBurst || !directoryHandle) return;
    try {
      // @ts-ignore
      const burstFolder = await directoryHandle.getDirectoryHandle(selectedBurst.folderName);
      // @ts-ignore
      for await (const entry of burstFolder.values()) {
        if (entry.kind === 'file' && entry.name.match(/\.(jpg|jpeg|png)$/i)) {
          const file = await (entry as FileSystemFileHandle).getFile();
          const bmp = await createImageBitmap(file);
          setPreviewImageBitmap(bmp);
          setEditorState({ rotation: 0, scale: 1, panX: 0, panY: 0, cropWidth: 200, cropHeight: 300, columns: 8, gapX: 0, gapY: 0 });
          setShowBurstActionModal(false);
          setShowManualMosaicEditor(true);
          return;
        }
      }
      alert("Nenhuma imagem encontrada.");
    } catch (err) { console.error(err); alert("Erro ao carregar imagem."); }
  };

  // MASK INTERACTION LOGIC
  const handleMaskMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    isMaskDraggingRef.current = type === 'move';
    isMaskResizingRef.current = type === 'resize';
    maskDragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMaskMouseMove = (e: React.MouseEvent) => {
    if (!videoRef.current || !cropMask.active) return;
    
    // We need to calculate scale because the video element might be scaled down visually
    // while the mask state is stored in actual video pixel resolution
    const rect = videoRef.current.getBoundingClientRect();
    const scaleX = videoRef.current.videoWidth / rect.width;
    const scaleY = videoRef.current.videoHeight / rect.height;

    const dx = (e.clientX - maskDragStartRef.current.x) * scaleX;
    const dy = (e.clientY - maskDragStartRef.current.y) * scaleY;
    
    if (isMaskDraggingRef.current) {
        setCropMask(prev => ({
            ...prev,
            x: Math.min(Math.max(0, prev.x + dx), videoRef.current!.videoWidth - prev.width),
            y: Math.min(Math.max(0, prev.y + dy), videoRef.current!.videoHeight - prev.height)
        }));
    } else if (isMaskResizingRef.current) {
        setCropMask(prev => ({
            ...prev,
            width: Math.max(50, prev.width + dx),
            height: Math.max(50, prev.height + dy)
        }));
    }

    if (isMaskDraggingRef.current || isMaskResizingRef.current) {
        maskDragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMaskMouseUp = () => {
    isMaskDraggingRef.current = false;
    isMaskResizingRef.current = false;
  };

  // --- MOSAIC EDITOR HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    lastDragPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastDragPosRef.current.x;
    const dy = e.clientY - lastDragPosRef.current.y;
    setEditorState(prev => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy
    }));
    lastDragPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Generate Mosaic Logic (Simplified for brevity, same as previous)
  // Re-added essential effect and generate function
  useEffect(() => {
    if (!showManualMosaicEditor || !previewImageBitmap || !editorCanvasRef.current) return;
    const canvas = editorCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600; canvas.height = 600;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.save();
    ctx.translate(editorState.panX, editorState.panY);
    ctx.rotate((editorState.rotation * Math.PI) / 180);
    ctx.scale(editorState.scale, editorState.scale);
    ctx.drawImage(previewImageBitmap, -previewImageBitmap.width / 2, -previewImageBitmap.height / 2);
    ctx.restore();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const cw = editorState.cropWidth; const ch = editorState.cropHeight;
    ctx.fillRect(-cx, -cy, canvas.width, (canvas.height - ch) / 2);
    ctx.fillRect(-cx, ch / 2, canvas.width, (canvas.height - ch) / 2);
    ctx.fillRect(-cx, -ch/2, (canvas.width - cw)/2, ch);
    ctx.fillRect(cw/2, -ch/2, (canvas.width - cw)/2, ch);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(-cw/2, -ch/2, cw, ch);
    ctx.restore();
  }, [showManualMosaicEditor, previewImageBitmap, editorState]);

  const generateMosaicBatch = async () => {
    if (!selectedBurst || !directoryHandle || !previewImageBitmap) return;
    setIsMosaicProcessing(true);
    setShowManualMosaicEditor(false);
    try {
      // @ts-ignore
      const burstFolder = await directoryHandle.getDirectoryHandle(selectedBurst.folderName);
      const files: File[] = [];
      // @ts-ignore
      for await (const entry of burstFolder.values()) {
        if (entry.kind === 'file' && entry.name.match(/\.(jpg|jpeg|png)$/i)) {
          files.push(await (entry as FileSystemFileHandle).getFile());
        }
      }
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      
      const userCols = editorState.columns || 8;
      const actualCols = Math.min(userCols, files.length);
      const rows = Math.ceil(files.length / actualCols);
      
      const rectW = editorState.cropWidth; 
      const rectH = editorState.cropHeight;
      const gapX = editorState.gapX || 0;
      const gapY = editorState.gapY || 0;

      // Special Videokymography Mode (Single Column, Thin Slice)
      const isKymogramMode = rectH < 5 && userCols === 1;

      let finalWidth = (rectW * actualCols) + (gapX * Math.max(0, actualCols - 1));
      let finalHeight = (rectH * rows) + (gapY * Math.max(0, rows - 1));

      if (isKymogramMode) {
          finalWidth = previewImageBitmap.width; // Use full width for kymogram usually, or scaled
          finalHeight = rectH * files.length; // Stack all slices
      }

      const masterCanvas = document.createElement('canvas');
      masterCanvas.width = finalWidth;
      masterCanvas.height = finalHeight;
      const masterCtx = masterCanvas.getContext('2d');
      if (!masterCtx) throw new Error("Canvas Error");
      masterCtx.fillStyle = "#ffffff"; 
      masterCtx.fillRect(0, 0, masterCanvas.width, masterCanvas.height);

      const processCanvas = document.createElement('canvas');
      processCanvas.width = rectW; 
      processCanvas.height = rectH;
      const pCtx = processCanvas.getContext('2d');
      if (!pCtx) throw new Error("Canvas Error");

      for (let i = 0; i < files.length; i++) {
        const img = await createImageBitmap(files[i]);
        
        // 1. Create Cropped Segment in Memory
        pCtx.clearRect(0, 0, rectW, rectH);
        pCtx.save();
        pCtx.translate(rectW / 2, rectH / 2);
        pCtx.translate(editorState.panX, editorState.panY);
        pCtx.rotate((editorState.rotation * Math.PI) / 180);
        pCtx.scale(editorState.scale, editorState.scale);
        pCtx.drawImage(img, -img.width / 2, -img.height / 2);
        pCtx.restore();

        // 2. Place on Master Canvas
        if (isKymogramMode) {
             // For kymogram, we stretch the slice width to fill the final image
             const yPos = i * rectH;
             masterCtx.imageSmoothingEnabled = false; // Sharp pixels for slices
             masterCtx.drawImage(processCanvas, 0, 0, rectW, rectH, 0, yPos, finalWidth, rectH);
        } else {
             const col = i % actualCols; 
             const row = Math.floor(i / actualCols);
             const xPos = col * (rectW + gapX); 
             const yPos = row * (rectH + gapY);
             masterCtx.drawImage(processCanvas, 0, 0, rectW, rectH, xPos, yPos, rectW, rectH);
        }
      }
      
      masterCanvas.toBlob(async (blob) => {
          if (blob) {
              const filename = generateFilename('MOSAICO', 'png');
              const saved = await saveBlobToDirectory(blob, filename);
              const url = URL.createObjectURL(blob);
              onCaptureImage({ 
                id: crypto.randomUUID(), 
                url: url, 
                timestamp: Date.now(), 
                type: 'mosaic', // Explicit type
                customWidth: 100 // Default 100% width
              });
              if (saved) alert("Videokimografia salva na pasta e adicionada ao laudo!");
              else alert("Mosaico adicionado ao laudo (Erro ao salvar no disco).");
          } else alert("Erro ao gerar imagem do mosaico.");
      }, 'image/png');
    } catch (err) { console.error(err); alert("Erro ao processar mosaico."); } finally { setIsMosaicProcessing(false); setSelectedBurst(null); }
  };

  const maskStyles = { border: isRecording ? 'border-red-600' : isPaused ? 'border-amber-500' : 'border-blue-500', bg: isRecording ? 'bg-red-600' : isPaused ? 'bg-amber-500' : 'bg-blue-500' };

  return (
    <div ref={playerContainerRef} className="w-full h-full flex flex-col bg-slate-900 text-white relative group">
       {/* Main Video Area */}
       <div 
          className={`relative bg-black overflow-hidden ${isFullscreen ? 'flex-grow flex items-center justify-center' : 'w-full h-auto'}`}
          onMouseMove={cropMask.active ? handleMaskMouseMove : undefined}
          onMouseUp={cropMask.active ? handleMaskMouseUp : undefined}
          onMouseLeave={cropMask.active ? handleMaskMouseUp : undefined}
       >
          {errorMsg ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-red-400">
               <AlertCircle size={48} className="mb-4" />
               <p>{errorMsg}</p>
               <button onClick={() => initCamera()} className="mt-4 bg-red-800 px-4 py-2 rounded text-white text-sm hover:bg-red-700">Tentar Novamente</button>
            </div>
          ) : !stream ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
               <Loader2 size={48} className="animate-spin mb-4" />
               <p>Inicializando Câmera...</p>
            </div>
          ) : (
            <>
               <video 
                  ref={videoRef} 
                  className={`${isFullscreen ? 'max-w-full max-h-full' : 'w-full h-auto'} object-contain`} 
                  autoPlay playsInline muted 
                  onLoadedMetadata={() => videoRef.current?.play().catch(console.error)}
               />
               <canvas ref={canvasRef} className="hidden" />
               
               {/* --- DIGITAL CROP MASK OVERLAY --- */}
               {cropMask.active && videoRef.current && (
                 <div className="absolute inset-0 pointer-events-none">
                   {/* We assume video fills the container for simplicity in this implementation, or center aligned */}
                   {/* Note: In a production app, we would calculate exact video rect vs container rect */}
                   <div 
                      className={`absolute border-2 ${maskStyles.border} box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-auto transition-colors duration-300`}
                      style={{
                        // Convert video pixel coordinates to % for responsive display
                        left: `${(cropMask.x / videoRef.current.videoWidth) * 100}%`,
                        top: `${(cropMask.y / videoRef.current.videoHeight) * 100}%`,
                        width: `${(cropMask.width / videoRef.current.videoWidth) * 100}%`,
                        height: `${(cropMask.height / videoRef.current.videoHeight) * 100}%`,
                        borderRadius: cropMask.shape === 'circle' ? '50%' : '0'
                      }}
                      onMouseDown={(e) => handleMaskMouseDown(e, 'move')}
                   >
                      {/* Resize Handle */}
                      <div 
                        className={`absolute bottom-0 right-0 w-4 h-4 ${maskStyles.bg} cursor-nwse-resize transition-colors duration-300`}
                        onMouseDown={(e) => handleMaskMouseDown(e, 'resize')}
                      />
                   </div>
                 </div>
               )}

               <button onClick={initCamera} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors z-30 text-white/50 hover:text-white" title="Reiniciar Câmera"><RefreshCw size={14} /></button>
               {isBursting && <div className="absolute top-4 right-14 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse font-bold text-sm shadow-lg z-20">BURST REC</div>}
               {isRecording && (
                 <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-md shadow-lg backdrop-blur-sm">
                       <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                       <span className="font-mono font-bold">{Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                    {isPaused && <div className="bg-yellow-500 text-black px-3 py-1 rounded-md text-xs font-bold text-center shadow">PAUSADO</div>}
                 </div>
               )}
               {isFullscreen && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 bg-slate-900/80 p-4 rounded-xl backdrop-blur border border-slate-700 z-50">
                    <button onMouseDown={() => handlePhotoAction(true)} onMouseUp={() => handlePhotoAction(false)} className="flex flex-col items-center gap-1 text-white hover:text-blue-400">
                        <Camera size={32} />
                        <span className="text-[10px] font-bold shadow-black drop-shadow-md">FOTO ({shortcuts.photo})</span>
                    </button>
                    
                    {!isRecording ? (
                        <button onMouseDown={() => handleRecordAction(true)} onMouseUp={() => handleRecordAction(false)} onMouseLeave={handleRecordMouseLeave} className={`flex flex-col items-center gap-1 ${isRecording ? 'text-red-500' : 'text-white hover:text-red-400'}`}>
                            <Video size={32} />
                            <span className="text-[10px] font-bold shadow-black drop-shadow-md">GRAVAR ({shortcuts.record})</span>
                        </button>
                    ) : (
                        <>
                            <button onClick={isPaused ? resumeRecording : pauseRecording} className="flex flex-col items-center gap-1 text-amber-500 hover:text-amber-400">
                                {isPaused ? <Play size={32} /> : <Pause size={32} />}
                                <span className="text-[10px] font-bold shadow-black drop-shadow-md">{isPaused ? 'RETOMAR' : 'PAUSAR'} ({shortcuts.record})</span>
                            </button>
                            <button onClick={stopRecording} className="flex flex-col items-center gap-1 text-red-500 hover:text-red-400">
                                <Square size={32} fill="currentColor" />
                                <span className="text-[10px] font-bold shadow-black drop-shadow-md">PARAR (Segure {shortcuts.record})</span>
                            </button>
                        </>
                    )}

                     <button onClick={(e) => { e.preventDefault(); toggleFullscreen(); }} className="flex flex-col items-center gap-1 text-white hover:text-slate-400">
                        <Minimize2 size={32} />
                        <span className="text-[10px] font-bold shadow-black drop-shadow-md">SAIR ({shortcuts.fullscreen})</span>
                    </button>
                  </div>
               )}
            </>
          )}
       </div>

       {/* Control Bar (Normal Mode) - HIDDEN IN FULLSCREEN */}
       {!isFullscreen && (
         <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col gap-4 z-30">
            <div className="flex justify-between items-center mb-2">
                {/* AUTO CROP / MASK CONTROLS */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCropMask(prev => ({ ...prev, active: !prev.active }))}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors ${cropMask.active ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                    title={cropMask.active ? "Ocultar Máscara" : "Editar Máscara de Captura"}
                  >
                    <Scan size={16} />
                    {cropMask.active ? 'ON' : 'OFF'}
                  </button>
                  {cropMask.active && (
                    <>
                      <button onClick={detectScopeArea} className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs" title="Detectar Área Automaticamente">Auto</button>
                      <button onClick={() => setCropMask(prev => ({...prev, shape: prev.shape === 'circle' ? 'rect' : 'circle'}))} className="text-slate-400 hover:text-white" title="Alternar Formato">
                        {cropMask.shape === 'circle' ? <CircleIcon size={16}/> : <Square size={16}/>}
                      </button>
                    </>
                  )}
                </div>

                <button 
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
                    title="Expandir Vídeo"
                >
                    <span>Tela Cheia ({shortcuts.fullscreen})</span>
                    <Maximize2 size={16} />
                </button>
            </div>

            <div className="flex justify-center items-center gap-8 mb-4">
              <button onMouseDown={() => handlePhotoAction(true)} onMouseUp={() => handlePhotoAction(false)} className="flex flex-col items-center gap-1 group active:scale-95 transition-transform" title={`Captura (${shortcuts.photo})`}>
                  <div className="p-4 bg-blue-600 rounded-full group-hover:bg-blue-500 shadow-lg border-2 border-transparent group-active:border-white"><Camera size={28} className="text-white" /></div>
                  <span className="text-[10px] font-bold text-slate-300">FOTO ({shortcuts.photo})</span>
              </button>
              
              {!isRecording ? (
                  <button onMouseDown={() => handleRecordAction(true)} onMouseUp={() => handleRecordAction(false)} onMouseLeave={handleRecordMouseLeave} className="flex flex-col items-center gap-1 group active:scale-95 transition-transform" title={`Gravação (${shortcuts.record})`} disabled={isProcessing}>
                    <div className={`p-4 rounded-full shadow-lg border-2 border-transparent group-active:border-white bg-red-600 group-hover:bg-red-500 ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                      {isProcessing ? <Loader2 size={28} className="animate-spin text-white"/> : <Video size={28} className="text-white" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">{isProcessing ? '...' : `GRAVAR (${shortcuts.record})`}</span>
                  </button>
              ) : (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <button onClick={isPaused ? resumeRecording : pauseRecording} className="flex flex-col items-center gap-1 group active:scale-95 transition-transform">
                      <div className="p-4 rounded-full shadow-lg border-2 border-transparent group-active:border-white bg-amber-500 hover:bg-amber-600">
                        {isPaused ? <Play size={28} className="text-white"/> : <Pause size={28} className="text-white"/>}
                      </div>
                      <span className="text-[10px] font-bold text-amber-500">{isPaused ? 'RETOMAR' : 'PAUSAR'}</span>
                   </button>
                   <button onClick={stopRecording} className="flex flex-col items-center gap-1 group active:scale-95 transition-transform">
                      <div className="p-4 rounded-full shadow-lg border-2 border-transparent group-active:border-white bg-red-600 hover:bg-red-700">
                        <Square size={28} className="text-white fill-current"/>
                      </div>
                      <span className="text-[10px] font-bold text-red-500">PARAR</span>
                   </button>
                </div>
              )}
            </div>
            
            <label className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded cursor-pointer text-xs transition-colors font-semibold border border-slate-600 text-white w-full">
                <ImagePlus size={16} /><span>Importar Fotos do Arquivo</span>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => { if (e.target.files) { Array.from(e.target.files).forEach(file => { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result) onCaptureImage({ id: crypto.randomUUID(), url: ev.target.result as string, timestamp: Date.now(), type: 'regular' }); }; reader.readAsDataURL(file as Blob); }); } }} />
            </label>

            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide"><Youtube size={14} className="text-red-500" /> Colar Link do YouTube</label>
              <div className="flex-1 bg-slate-900 rounded flex items-center px-2 border border-slate-700 h-9">
                  <input type="text" value={videoLink} onChange={(e) => onSetVideoLink(e.target.value)} placeholder="https://youtu.be/..." className="bg-transparent border-none text-xs text-white w-full focus:ring-0 placeholder-slate-500" />
                  <button onClick={async () => { try { const text = await navigator.clipboard.readText(); onSetVideoLink(text); } catch(e) { alert("Permissão de colar negada."); } }} className="p-1 text-slate-400 hover:text-white" title="Colar"><Copy size={14} /></button>
              </div>
            </div>

            {burstHistory.length > 0 && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1"><Layers size={12} /> Histórico de Bursts</p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {burstHistory.map((session) => (
                    <button key={session.id} onClick={() => handleBurstClick(session)} className="flex flex-col items-center min-w-[60px] group">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600 group-hover:border-blue-500 shadow-sm relative"><Images size={20} className="text-slate-300 group-hover:text-blue-400" /><span className="absolute -top-1 -right-1 bg-blue-600 text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{session.count}</span></div>
                      <span className="text-[9px] text-slate-400 mt-1">{session.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
         </div>
       )}
       {!isFullscreen && <div className="flex-1 bg-slate-900"></div>}

       {/* --- MODALS (Upload, Burst, Mosaic Editor) --- */}
       {/* ... (Keep existing modals unchanged) ... */}
       {showUploadModal && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg p-6 max-w-sm w-full text-slate-900 shadow-2xl">
                <div className="flex justify-center mb-4 text-green-600"><CheckCircle size={48} /></div>
                <h3 className="text-lg font-bold text-center mb-2">Gravação Concluída!</h3>
                <p className="text-sm text-center text-slate-600 mb-6">O arquivo foi salvo na pasta selecionada. Deseja fazer upload para o YouTube agora?</p>
                <div className="flex flex-col gap-3">
                   <a href="https://www.youtube.com/upload" target="_blank" rel="noreferrer" onClick={() => setShowUploadModal(false)} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"><Upload size={18} /> Ir para YouTube Upload</a>
                   <button onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Fechar</button>
                </div>
             </div>
          </div>
       )}
       {/* Burst Action Modal */}
       {showBurstActionModal && selectedBurst && (
         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h3 className="font-bold text-slate-800">Sessão Burst: {selectedBurst.timestamp}</h3>
                 <button onClick={() => setShowBurstActionModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={initManualEditor} className="flex flex-col items-center justify-center gap-2 p-4 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors">
                     <Wand2 size={32} className="text-violet-600" />
                     <span className="font-bold text-violet-800 text-sm">Mosaico / Videoquimografia digital</span>
                     <span className="text-[10px] text-violet-600 text-center leading-tight">Criar mosaico manual</span>
                  </button>
                  <button onClick={() => { alert(`Abra a pasta: ${selectedBurst.folderName}`); setShowBurstActionModal(false); }} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                     <FolderOpen size={32} className="text-slate-600" />
                     <span className="font-bold text-slate-800 text-sm">Abrir Pasta</span>
                     <span className="text-[10px] text-slate-600 text-center leading-tight">Ver arquivos brutos</span>
                  </button>
               </div>
            </div>
         </div>
       )}
       {/* Mosaic Editor Modal */}
       {showManualMosaicEditor && (
          <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col">
             <div className="h-12 border-b border-slate-700 flex justify-between items-center px-4 bg-slate-800">
                <h3 className="text-white font-bold text-sm flex items-center gap-2"><Crop size={16} /> Editor de Videokimografia</h3>
                <button onClick={() => setShowManualMosaicEditor(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
             </div>
             <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900 cursor-move" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <canvas ref={editorCanvasRef} className="shadow-2xl border border-slate-700" />
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">Arraste para mover</div>
             </div>
             <div className="h-44 bg-slate-800 border-t border-slate-700 p-4 grid grid-cols-4 gap-4 overflow-y-auto">
                {/* ... (Keep existing Mosaic Editor controls) ... */}
                <div className="space-y-1"><label className="text-xs text-slate-400 flex items-center gap-1"><RotateCw size={12}/> Rotação ({Math.round(editorState.rotation)}°)</label><input type="range" min="-180" max="180" value={editorState.rotation} onChange={e => setEditorState({...editorState, rotation: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="space-y-1"><label className="text-xs text-slate-400 flex items-center gap-1"><ZoomIn size={12}/> Zoom ({editorState.scale.toFixed(1)}x)</label><input type="range" min="0.5" max="3" step="0.1" value={editorState.scale} onChange={e => setEditorState({...editorState, scale: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="space-y-1"><label className="text-xs text-slate-400 flex items-center gap-1"><Move size={12}/> Largura Corte ({editorState.cropWidth}px)</label><input type="range" min="50" max="500" value={editorState.cropWidth} onChange={e => setEditorState({...editorState, cropWidth: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="space-y-1"><label className="text-xs text-slate-400 flex items-center gap-1"><ArrowUpDown size={12}/> Altura Corte ({editorState.cropHeight}px)</label><input type="range" min="1" max="400" value={editorState.cropHeight} onChange={e => setEditorState({...editorState, cropHeight: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="space-y-1 col-span-2"><label className="text-xs text-slate-400 flex items-center gap-1"><LayoutGrid size={12}/> Colunas ({editorState.columns})</label><input type="range" min="1" max="10" step="1" value={editorState.columns} onChange={e => setEditorState({...editorState, columns: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="space-y-1"><label className="text-xs text-slate-400 flex items-center gap-1"><ArrowRightLeft size={12}/> Espaço H ({editorState.gapX}px)</label><input type="range" min="0" max="50" value={editorState.gapX} onChange={e => setEditorState({...editorState, gapX: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="space-y-1"><label className="text-xs text-slate-400 flex items-center gap-1"><AlignVerticalSpaceAround size={12}/> Espaço V ({editorState.gapY}px)</label><input type="range" min="0" max="50" value={editorState.gapY} onChange={e => setEditorState({...editorState, gapY: Number(e.target.value)})} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                <div className="col-span-4 flex items-end"><button onClick={generateMosaicBatch} disabled={isMosaicProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2">{isMosaicProcessing ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16} />} Confirmar e Gerar</button></div>
             </div>
          </div>
       )}
    </div>
  );
};

export default CaptureStation;

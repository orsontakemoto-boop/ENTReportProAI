
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Wand2, X, Printer, Settings as SettingsIcon, ExternalLink, Bot, FilePlus, Loader2, BookTemplate, Save, Trash2, Plus, FileText, PenTool, HelpCircle, BookOpen, Stethoscope, Layers, Sparkles, Check, Undo2, Zap, ZoomIn, ZoomOut, Move, BrainCircuit, Type } from 'lucide-react';
import { DoctorSettings, PatientData, ReportData, CapturedImage, CustomTemplate, ExamTemplate } from '../types';
import { EXAM_TEMPLATES } from '../constants';
import { refineTextWithAI, enhanceMedicalImage, generateConclusionWithAI } from '../services/geminiService';

// Componente do Ícone Gemini
const GeminiIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 2C12.5 6.5 16 9.5 21 12C16 14.5 12.5 17.5 12 22C11.5 17.5 8 14.5 3 12C8 9.5 11.5 6.5 12 2Z" 
      fill="url(#geminiGradient)" 
    />
    <defs>
      <linearGradient id="geminiGradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4E75F5" />
        <stop offset="1" stopColor="#9C4EF5" />
      </linearGradient>
    </defs>
  </svg>
);

interface ReportEditorProps {
  settings: DoctorSettings;
  patient: PatientData;
  setPatient: (data: PatientData) => void;
  report: ReportData;
  setReport: React.Dispatch<React.SetStateAction<ReportData>>;
  capturedImages: CapturedImage[];
  onRemoveImage: (id: string) => void;
  onUpdateImage: (id: string, updates: Partial<CapturedImage>) => void;
  onAddImageAfter: (targetId: string, newImage: CapturedImage) => void; 
  onOpenSettings: () => void;
  onNewReport: () => void;
  onUpdateSettings: (settings: DoctorSettings) => void;
  onOpenUserManual: () => void;
}

// Função para formatar texto Markdown básico (Negrito e Listas) para o laudo impresso
const renderFormattedText = (text: string) => {
  if (!text) return null;
  
  return text.split('\n').map((line, i) => {
    // Detecta se a linha é um item de lista (começa com "- ")
    const trimmedLine = line.trim();
    const isListItem = trimmedLine.startsWith('- ');
    const content = isListItem ? trimmedLine.substring(2) : line;

    // Divide a linha em partes baseado no padrão de negrito **texto**
    const parts = content.split(/(\*\*.*?\*\*)/g);
    const formattedContent = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isListItem) {
      return (
        <div key={i} className="flex gap-2 mb-1 pl-1">
          <span className="shrink-0">•</span>
          <span className="flex-1">{formattedContent}</span>
        </div>
      );
    }

    return (
      <div key={i} className="mb-1 min-h-[1.2em]">
        {formattedContent}
      </div>
    );
  });
};

const MosaicResizableImage: React.FC<{
  img: CapturedImage;
  onUpdate: (id: string, updates: Partial<CapturedImage>) => void;
  onRemove: (id: string) => void;
}> = ({ img, onUpdate, onRemove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX; const startY = e.clientY;
    const startWidthPct = img.customWidth || 100;
    const startHeightPx = img.customHeight || (imgRef.current?.offsetHeight || 300);
    const parentWidth = containerRef.current?.parentElement?.offsetWidth || 1000;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX; const deltaY = ev.clientY - startY;
      let newWidthPct = startWidthPct; let newHeightPx = startHeightPx;
      if (direction.includes('e')) { const deltaPct = (deltaX / parentWidth) * 100; newWidthPct = Math.min(100, Math.max(10, startWidthPct + deltaPct)); }
      if (direction.includes('s')) { newHeightPx = Math.max(50, startHeightPx + deltaY); }
      onUpdate(img.id, { customWidth: newWidthPct, customHeight: newHeightPx });
    };
    const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
    window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div ref={containerRef} className={`relative group inline-block hover:z-10`} style={{ width: `${img.customWidth || 100}%` }}>
      <img ref={imgRef} src={img.url} alt="Videokimografia" className="border border-slate-100 rounded-sm w-full block" style={{ height: img.customHeight ? `${img.customHeight}px` : 'auto', objectFit: 'fill' }} />
      <button onClick={() => onRemove(img.id)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print shadow-sm z-20"><X size={16} /></button>
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-blue-500 transition-colors z-10">
        <div className="hidden group-hover:block">
          <div className="absolute top-1/2 right-0 w-4 h-8 bg-white border border-blue-600 rounded-full cursor-e-resize translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-sm flex items-center justify-center z-30" onMouseDown={(e) => handleMouseDown(e, 'e')}><div className="w-0.5 h-4 bg-blue-300"></div></div>
          <div className="absolute bottom-0 left-1/2 w-8 h-4 bg-white border border-blue-600 rounded-full cursor-s-resize -translate-x-1/2 translate-y-1/2 pointer-events-auto shadow-sm flex items-center justify-center z-30" onMouseDown={(e) => handleMouseDown(e, 's')}><div className="w-4 h-0.5 bg-blue-300"></div></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 border-2 border-white rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 pointer-events-auto shadow-md z-40" onMouseDown={(e) => handleMouseDown(e, 'se')}/>
        </div>
      </div>
    </div>
  );
};

const DraggableSignature: React.FC<{
  settings: DoctorSettings;
  onUpdateSettings: (settings: DoctorSettings) => void;
}> = ({ settings, onUpdateSettings }) => {
  if (!settings.signatureBase64) return <div className="h-12"></div>;

  const style = settings.signatureStyle || { x: 0, y: 0, width: 200 };
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; initialWidth: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = { 
      x: e.clientX, 
      y: e.clientY, 
      initialX: style.x, 
      initialY: style.y 
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;
      
      onUpdateSettings({
        ...settings,
        signatureStyle: {
          ...style,
          x: dragStartRef.current.initialX + dx,
          y: dragStartRef.current.initialY + dy
        }
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = { x: e.clientX, initialWidth: style.width };

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const dx = ev.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(50, resizeStartRef.current.initialWidth + dx);
      
      onUpdateSettings({
        ...settings,
        signatureStyle: {
          ...style,
          width: newWidth
        }
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resizeStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('Redefinir posição da assinatura?')) {
        onUpdateSettings({
            ...settings,
            signatureStyle: { x: 0, y: 0, width: 200 }
        });
    }
  };

  return (
    <div 
      className="relative group inline-block"
      style={{
        transform: `translate(${style.x}px, ${style.y}px)`,
        width: `${style.width}px`,
        cursor: 'move',
        zIndex: 20,
        mixBlendMode: 'multiply'
      }}
      onMouseDown={handleMouseDown}
      title="Arraste para mover"
    >
      <div className="absolute -top-6 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity no-print z-50">
         <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer" onClick={resetPosition}>
             <Move size={10} /> Mover / Resetar
         </span>
      </div>
      
      <img 
        src={settings.signatureBase64} 
        alt="Assinatura" 
        className="w-full h-auto object-contain pointer-events-none select-none" 
      />
      
      <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity no-print rounded"></div>

      <div 
        className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity no-print flex items-center justify-center shadow-md z-30"
        onMouseDown={handleResizeMouseDown}
        title="Redimensionar"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-white"></div>
      </div>
    </div>
  );
};

const ReportEditor: React.FC<ReportEditorProps> = ({ settings, patient, setPatient, report, setReport, capturedImages, onRemoveImage, onUpdateImage, onAddImageAfter, onOpenSettings, onNewReport, onUpdateSettings, onOpenUserManual }) => {
  const [isListening, setIsListening] = useState<'findings' | 'conclusion' | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingConclusion, setIsGeneratingConclusion] = useState(false);
  const [showLaringoModal, setShowLaringoModal] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showEquipmentMenu, setShowEquipmentMenu] = useState(false);
  const [showNewExamModal, setShowNewExamModal] = useState(false);
  const [newExamData, setNewExamData] = useState<ExamTemplate & { key: string }>({ label: '', equipment: '', findings: '', conclusion: '', key: '' });
  const [enhancingImageId, setEnhancingImageId] = useState<string | null>(null);
  
  const reportContentRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const findingsRef = useRef<HTMLTextAreaElement>(null);
  const conclusionRef = useRef<HTMLTextAreaElement>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const availableExams = { ...EXAM_TEMPLATES, ...(settings.customExamTypes || {}) };
  const regularImages = capturedImages.filter(img => !img.type || img.type === 'regular');
  const mosaicImages = capturedImages.filter(img => img.type === 'mosaic');
  const hasAiImages = regularImages.some(img => img.isAiEnhanced);

  const visible = settings?.visiblePatientFields || { document: true, profession: true, insurance: true, address: true, indicatedBy: true, requestedBy: true };
  const customFields = settings?.customPatientFields || [];

  const getFontClass = () => { switch (settings.fontFamily) { case 'System Sans': return 'font-system-sans'; case 'System Serif': return 'font-system-serif'; case 'Inter': return 'font-inter'; case 'Roboto': return 'font-roboto'; case 'Playfair Display': return 'font-playfair'; case 'Lato': return 'font-lato'; default: return 'font-medical'; } };
  const getThemeColors = () => { switch (settings.themeColor) { case 'teal': return { text: 'text-teal-800', border: 'border-teal-800', lightBorder: 'border-teal-100', bg: 'bg-teal-50', aiBtn: 'from-teal-600 to-emerald-600' }; case 'slate': return { text: 'text-slate-800', border: 'border-slate-800', lightBorder: 'border-slate-200', bg: 'bg-slate-50', aiBtn: 'from-slate-700 to-slate-900' }; case 'black': return { text: 'text-black', border: 'border-black', lightBorder: 'border-gray-200', bg: 'bg-gray-50', aiBtn: 'from-black to-gray-800' }; default: return { text: 'text-blue-900', border: 'border-blue-900', lightBorder: 'border-blue-100', bg: 'bg-slate-50', aiBtn: 'from-indigo-600 to-violet-600' }; } };
  const getSignatureAlignment = () => { switch (settings.signaturePosition) { case 'left': return 'justify-start'; case 'right': return 'justify-end'; default: return 'justify-center'; } };
  const colors = getThemeColors(); const fontClass = getFontClass();
  const getYouTubeId = (url: string) => { const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/; const match = url.match(regExp); return (match && match[2].length === 11) ? match[2] : null; };
  const videoId = getYouTubeId(report.videoLink);
  
  const qrCodeUrl = (videoId || report.videoLink) ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(videoId ? `https://www.youtube.com/watch?v=${videoId}` : report.videoLink)}` : null;

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
    const type = e.target.value; 
    if (type === 'NEW_CUSTOM_EXAM') { setShowNewExamModal(true); return; } 
    const template = availableExams[type]; 
    setReport({ ...report, examType: type, equipment: template ? template.equipment : '', findings: template ? template.findings : '', conclusion: template ? template.conclusion : '', }); 
    if (type === 'laringo') setShowLaringoModal(true); 
  };
  
  const handleSaveNewExam = () => { 
    if (!newExamData.label.trim()) return alert("Nome obrigatório"); 
    const key = newExamData.label.toLowerCase().replace(/[^a-z0-9]/g, '_'); 
    if (availableExams[key]) return alert("Já existe"); 
    const updatedSettings = { ...settings, customExamTypes: { ...(settings.customExamTypes || {}), [key]: { label: newExamData.label, equipment: newExamData.equipment, findings: newExamData.findings, conclusion: newExamData.conclusion } } }; 
    onUpdateSettings(updatedSettings); 
    setReport({ ...report, examType: key, equipment: newExamData.equipment, findings: newExamData.findings, conclusion: newExamData.conclusion }); 
    setShowNewExamModal(false); 
    alert("Salvo!"); 
  };

  const handleSaveTemplate = () => { 
    if (!newTemplateName.trim()) return alert("Nome obrigatório"); 
    const newTemplate: CustomTemplate = { id: crypto.randomUUID(), name: newTemplateName, content: report.findings, examType: report.examType }; 
    onUpdateSettings({ ...settings, customTemplates: [...(settings.customTemplates || []), newTemplate] }); 
    setIsSavingTemplate(false); 
    setNewTemplateName(''); 
    setShowTemplateMenu(false); 
  };

  const handleApplyTemplate = (content: string) => { if (confirm("Substituir texto?")) { setReport({ ...report, findings: content }); setShowTemplateMenu(false); } };
  
  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => { 
    e.stopPropagation(); e.preventDefault(); 
    if (confirm("Excluir?")) { onUpdateSettings({ ...settings, customTemplates: (settings.customTemplates || []).filter(t => t.id !== id) }); } 
  };

  const handleSaveEquipment = () => { 
    const newEq = report.equipment.trim(); 
    if (!newEq || (settings.savedEquipments || []).includes(newEq)) return; 
    onUpdateSettings({ ...settings, savedEquipments: [...(settings.savedEquipments || []), newEq] }); 
    setShowEquipmentMenu(false); 
  };

  const handleDeleteEquipment = (eq: string, e: React.MouseEvent) => { 
    e.stopPropagation(); e.preventDefault(); 
    if (confirm("Excluir?")) { onUpdateSettings({ ...settings, savedEquipments: (settings.savedEquipments || []).filter(item => item !== eq) }); } 
  };

  const currentExamTemplates = (settings.customTemplates || []).filter(t => t.examType === report.examType || t.examType === '');

  const startDictation = (field: 'findings' | 'conclusion') => {
    if (!('webkitSpeechRecognition' in window)) return alert("Sem suporte a voz");
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => { recognition.stop(); }, 4000);
    };

    const handleActivity = () => resetInactivityTimer();

    recognition.onstart = () => {
      setIsListening(field);
      resetInactivityTimer();
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
    };

    recognition.onend = () => {
      setIsListening(null);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };

    recognition.onresult = (event: any) => {
      resetInactivityTimer();
      const currentResultIndex = event.resultIndex;
      const transcript = event.results[currentResultIndex][0].transcript;
      if (event.results[currentResultIndex].isFinal) {
        const textarea = field === 'findings' ? findingsRef.current : conclusionRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentText = textarea.value;
          const prefix = (start > 0 && currentText[start - 1] !== ' ' && currentText[start - 1] !== '\n') ? ' ' : '';
          const newText = currentText.substring(0, start) + prefix + transcript + currentText.substring(end);
          setReport(prev => ({ ...prev, [field]: newText }));
        }
      }
    };
    recognition.start();
  };

  const handleAiRefine = async () => { 
    setIsRefining(true); 
    try { 
      const refined = await refineTextWithAI(report.findings); 
      setReport({ ...report, findings: refined }); 
    } catch (error: any) { 
      alert(error.message); 
    } finally { 
      setIsRefining(false); 
    } 
  };

  const handleAiConclusion = async () => {
    if (!report.findings.trim()) {
      return alert("Descreva os achados do exame primeiro para que a IA possa sugerir uma conclusão.");
    }
    setIsGeneratingConclusion(true);
    try {
      const suggestedConclusion = await generateConclusionWithAI(report.findings);
      setReport({ ...report, conclusion: suggestedConclusion });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGeneratingConclusion(false);
    }
  };
  
  const handleEnhanceImage = async (id: string, currentUrl: string) => {
    setEnhancingImageId(id);
    try {
      const newUrl = await enhanceMedicalImage(currentUrl);
      const newImage: CapturedImage = {
        id: crypto.randomUUID(),
        url: newUrl,
        timestamp: Date.now(),
        type: 'regular',
        isAiEnhanced: true, 
        caption: ''
      };
      onAddImageAfter(id, newImage);
    } catch (e: any) {
      alert("Erro ao aprimorar imagem: " + e.message);
    } finally {
      setEnhancingImageId(null);
    }
  };

  const handlePrint = () => { window.print(); };
  const openLaringoAI = () => { window.open('https://laringoai-analyzer-1012296117240.us-west1.run.app/', '_blank'); setShowLaringoModal(false); };

  const getHeaderLayout = () => { if (settings.logoPosition === 'center') return 'flex flex-col items-center text-center'; if (settings.logoPosition === 'right') return 'flex flex-row-reverse text-right'; return 'flex flex-row text-left'; };
  const getLogoMargins = () => { if (settings.logoPosition === 'center') return 'mb-4'; if (settings.logoPosition === 'right') return 'ml-6'; return 'mr-6'; };
  const getLogoSizeClass = () => { switch (settings.logoSize) { case 'small': return 'h-16 w-auto'; case 'large': return 'h-40 w-auto'; default: return 'h-24 w-auto'; } };
  const gridColsClass = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' }[settings.photosGridColumns || 4] || 'grid-cols-4';
  
  const renderField = (label: string, value: string | undefined, onChange: (val: string) => void, placeholder: string = "", colSpan: string = "col-span-12") => (
    <div className={colSpan}>
      <label className={`text-[10px] font-bold text-slate-500 uppercase block mb-0.5`}>{label}</label>
      <input 
        type="text" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="w-full text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none pb-0.5 text-sm print:hidden" 
        placeholder={placeholder} 
      />
      <div className="hidden print:block text-slate-900 pb-0.5 border-b border-slate-300 text-sm min-h-[1.5em] border-0">
        {value}
      </div>
    </div>
  );
  
  const getExamLabel = () => { const tpl = availableExams[report.examType]; return tpl ? tpl.label : "LAUDO VIDEO-ENDOSCÓPICO"; };

  return (
    <div 
      ref={editorContainerRef}
      className={`
      ${fontClass} font-content-wrapper
      h-full bg-white overflow-y-auto flex justify-center no-scrollbar relative
      print:h-auto print:overflow-visible print:block print:static print:bg-white
    `}>
      
      {/* --- FLOATING ACTIONS --- */}
      <div className="fixed top-4 left-4 flex gap-2 no-print z-40">
          <button onClick={onNewReport} className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-500 transition-all border-2 border-white" title="Novo Exame"><FilePlus size={20} /></button>
          <button onClick={onOpenSettings} className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-all border-2 border-white" title="Configurações"><SettingsIcon size={20} /></button>
          <button onClick={handlePrint} className="bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all border-2 border-white" title="Imprimir"><Printer size={20} /></button>
          <button onClick={onOpenUserManual} className="bg-amber-500 text-white p-3 rounded-full shadow-lg hover:bg-amber-600 transition-all border-2 border-white" title="Manual do Usuário"><BookOpen size={20} /></button>
      </div>

      {showNewExamModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={24} className="text-blue-600" /> Criar Novo Tipo de Exame</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Nome</label><input type="text" value={newExamData.label} onChange={e => setNewExamData({...newExamData, label: e.target.value})} className="w-full border p-2 rounded" autoFocus /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Equipamento</label><input type="text" value={newExamData.equipment} onChange={e => setNewExamData({...newExamData, equipment: e.target.value})} className="w-full border p-2 rounded" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Achados</label><textarea value={newExamData.findings} onChange={e => setNewExamData({...newExamData, findings: e.target.value})} className="w-full border p-2 rounded h-32" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Conclusão</label><textarea value={newExamData.conclusion} onChange={e => setNewExamData({...newExamData, conclusion: e.target.value})} className="w-full border p-2 rounded h-16" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6 border-t pt-4"><button onClick={() => setShowNewExamModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button><button onClick={handleSaveNewExam} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Salvar</button></div>
          </div>
        </div>
      )}

      {showLaringoModal && <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 print:hidden backdrop-blur-sm"><div className="bg-white rounded-lg shadow-2xl w-full max-w-md border-t-4 border-violet-600 overflow-hidden"><div className="p-6"><div className="flex items-center gap-3 mb-4"><div className="bg-violet-100 p-3 rounded-full"><Bot size={28} className="text-violet-600" /></div><h3 className="text-xl font-bold text-slate-800">Laringo AI Detectada</h3></div><p className="text-slate-600 mb-6 leading-relaxed">Você selecionou <b>Vídeo-laringo-estroboscopia</b>. Gostaria de abrir nossa ferramenta de Inteligência Artificial?</p><div className="flex flex-col gap-3"><button onClick={openLaringoAI} className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-violet-200"><ExternalLink size={18} /> Sim, abrir Laringo AI</button><button onClick={() => setShowLaringoModal(false)} className="text-slate-500 hover:text-slate-700 font-medium py-2 px-4 hover:bg-slate-50 rounded-lg">Não, continuar</button></div></div></div></div>}

      <div 
        id="report-content" 
        ref={reportContentRef} 
        className="w-full max-w-5xl h-auto min-h-full p-8 md:p-12 print:p-0 print:w-full print:max-w-none print:shadow-none print:m-0 print-full-width print:pointer-events-auto"
      >
        <header className={`${getHeaderLayout()} border-b-2 ${colors.border} pb-4 mb-6`}>
          <div className={`${getLogoSizeClass()} flex-shrink-0 flex items-center justify-center ${getLogoMargins()}`}>{settings.logoBase64 ? <img src={settings.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" /> : <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 text-center print:hidden">Logo</div>}</div>
          <div className="flex-1 text-slate-800"><h1 className={`text-2xl font-bold ${colors.text} tracking-wide`}>{settings.clinicName || "Nome da Clínica"}</h1>{settings.clinicSubtitle && <p className={`text-xs font-medium opacity-75 ${colors.text} mt-1 mb-1`}>{settings.clinicSubtitle}</p>}<p className="text-sm mt-1">{settings.clinicAddress}</p>{settings.clinicPhone && <div className={`flex items-center gap-2 mt-1 text-sm text-slate-600 font-medium ${settings.logoPosition === 'center' ? 'justify-center' : (settings.logoPosition === 'right' ? 'justify-end' : '')}`}>{settings.clinicPhone}</div>}</div>
        </header>

        <div className={`mb-6 rounded-lg border-2 ${colors.lightBorder} ${colors.bg} p-4 print:border-none print:shadow-none print:bg-transparent print:p-0 print:mb-2`}>
            <div className="grid grid-cols-12 gap-x-4 gap-y-2 mb-2">
              {renderField("Nome do Paciente", patient.name, (val) => setPatient({...patient, name: val}), "Nome completo", "col-span-6")}
              {renderField("Idade", patient.age, (val) => setPatient({...patient, age: val}), "Anos", "col-span-2")}
              {renderField("Sexo", patient.gender, (val) => setPatient({...patient, gender: val as any}), "M/F", "col-span-2")}
              {renderField("Data", patient.date, (val) => setPatient({...patient, date: val}), "DD/MM/AAAA", "col-span-2")}
            </div>
            <div className="grid grid-cols-12 gap-x-4 gap-y-2 mb-2">
              {visible.document && renderField("Documento (RG/CPF)", patient.document, (val) => setPatient({...patient, document: val}), "RG ou CPF", "col-span-4")}
              {visible.profession && renderField("Profissão", patient.profession, (val) => setPatient({...patient, profession: val}), "Opcional", "col-span-4")}
              {visible.insurance && renderField("Convênio", patient.insurance, (val) => setPatient({...patient, insurance: val}), "Particular / Plano", "col-span-4")}
            </div>
            <div className="grid grid-cols-12 gap-x-4 gap-y-2 mb-2">{visible.address && renderField("Endereço / Procedência", patient.address, (val) => setPatient({...patient, address: val}), "Cidade - UF", "col-span-12")}</div>
            <div className="grid grid-cols-12 gap-x-4 gap-y-2 mb-2">
              {renderField("Exame realizado por", patient.performedBy, (val) => setPatient({...patient, performedBy: val}), "Nome do médico", "col-span-4")}
              {visible.indicatedBy && renderField("Referenciado por", patient.indicatedBy, (val) => setPatient({...patient, indicatedBy: val}), "Nome do colega", "col-span-4")}
              {visible.requestedBy && renderField("Médico Solicitante", patient.requestedBy, (val) => setPatient({...patient, requestedBy: val}), "Nome do solicitante", "col-span-4")}
            </div>
            {customFields.length > 0 && <div className="grid grid-cols-12 gap-x-4 gap-y-2 mt-2 pt-2 border-t border-slate-200/50">{customFields.map((field) => renderField(field, patient.customValues[field], (val) => setPatient({...patient, customValues: {...patient.customValues, [field]: val}}), "...", "col-span-4"))}</div>}
        </div>
        
        <div className="mb-4 no-print bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-start gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Exame:</label>
            <select value={report.examType} onChange={handleExamChange} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-medium outline-none focus:border-blue-500 cursor-pointer"><option value="" disabled>Escolha...</option><optgroup label="Padrões">{Object.entries(EXAM_TEMPLATES).map(([key, tpl]) => (<option key={key} value={key}>{(tpl as ExamTemplate).label}</option>))}</optgroup>{(settings.customExamTypes && Object.keys(settings.customExamTypes).length > 0) && (<optgroup label="Meus Exames">{Object.entries(settings.customExamTypes).map(([key, tpl]) => (<option key={key} value={key}>{(tpl as ExamTemplate).label}</option>))}</optgroup>)}<option value="NEW_CUSTOM_EXAM" className="font-bold text-blue-600">+ Criar Novo...</option></select>
        </div>

        <div className="text-center mb-6 break-inside-avoid print:mb-2"><h2 className={`text-xl font-bold uppercase inline-block px-8 pb-1 ${colors.text} tracking-wide`}>{getExamLabel()}</h2></div>

        <div className="mb-6 flex flex-col gap-1 break-inside-avoid print:mb-2">
            <div className="flex justify-between items-end">
               <label className="block text-xs font-bold text-slate-500 uppercase">Equipamento utilizado e Preparo</label>
               <div className="relative no-print"><button onClick={() => setShowEquipmentMenu(!showEquipmentMenu)} className="text-slate-400 hover:text-blue-600 transition-colors p-1"><SettingsIcon size={14} /></button>{showEquipmentMenu && <div className="absolute right-0 top-6 bg-white border shadow-xl rounded-md w-64 z-50 p-2"><h4 className="text-xs font-bold text-slate-500 uppercase mb-2 px-2 border-b pb-1">Meus Equipamentos</h4><div className="max-h-40 overflow-y-auto mb-2">{(settings.savedEquipments || []).map((eq) => (<div key={eq} className="flex justify-between items-center hover:bg-slate-50 p-1 rounded group"><button type="button" onClick={() => { setReport({...report, equipment: eq}); setShowEquipmentMenu(false); }} className="text-sm text-slate-700 text-left truncate flex-1">{eq}</button><button type="button" onClick={(e) => handleDeleteEquipment(eq, e)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button></div>))}</div><button type="button" onClick={handleSaveEquipment} className="w-full text-xs bg-blue-50 text-blue-700 font-bold py-1.5 rounded hover:bg-blue-100 flex items-center justify-center gap-1"><Save size={12} /> Salvar Atual</button></div>}</div>
            </div>
            <input type="text" value={report.equipment} onChange={e => setReport({ ...report, equipment: e.target.value })} className="w-full border-b border-slate-300 py-1 outline-none focus:border-blue-500 text-sm print:hidden" placeholder="Descreva o equipamento e o preparo..." />
            <div className="hidden print:block text-sm border-b border-slate-300 py-1 min-h-[1.5em] border-0">{report.equipment}</div>
        </div>

        {/* --- ACHADOS DO EXAME (REFINED) --- */}
        <div className="mb-8 print:mb-2 group/section">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600 group-hover/section:bg-blue-50 group-hover/section:text-blue-600 transition-colors">
                <FileText size={18} />
              </div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>Descrição do Exame Endoscópico</h3>
              <button 
                onClick={() => startDictation('findings')} 
                className={`no-print p-2 rounded-full shadow-sm transition-all ${isListening === 'findings' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} 
                title="Ditar Achados"
              >
                <Mic size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 relative no-print">
                <button 
                  onClick={() => setShowTemplateMenu(!showTemplateMenu)} 
                  className="flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <BookTemplate size={14} />
                  <span>Modelos</span>
                </button>
                {showTemplateMenu && <div className="absolute right-0 top-10 bg-white border shadow-2xl rounded-xl w-72 z-50 p-3 animate-in fade-in zoom-in-95 duration-150"><div className="flex justify-between items-center border-b pb-2.5 mb-2.5"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meus Modelos</span><button onClick={() => setShowTemplateMenu(false)}><X size={14} className="text-slate-400 hover:text-slate-600"/></button></div><div className="max-h-56 overflow-y-auto space-y-1 mb-3 pr-1 thin-scrollbar">{currentExamTemplates.length > 0 ? (currentExamTemplates.map((tpl) => (<div key={tpl.id} className="group flex items-center justify-between p-2.5 hover:bg-blue-50 rounded-lg cursor-pointer border border-transparent hover:border-blue-100 transition-all"><div onClick={() => handleApplyTemplate(tpl.content)} className="flex-1"><span className="block text-sm font-bold text-slate-800">{tpl.name}</span><span className="block text-[10px] text-slate-400 truncate mt-0.5">{tpl.content.substring(0, 40)}...</span></div><button type="button" onClick={(e) => handleDeleteTemplate(tpl.id, e)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button></div>))) : <div className="text-center py-6 text-xs text-slate-400 italic">Nenhum modelo salvo para este exame.</div>}</div><div className="pt-2.5 border-t bg-slate-50 -mx-3 -mb-3 p-3 rounded-b-xl">{!isSavingTemplate ? (<button onClick={() => setIsSavingTemplate(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-md shadow-blue-100"><Save size={14} /> Salvar Texto Atual</button>) : (<div className="flex gap-2"><input type="text" autoFocus placeholder="Nome do modelo..." value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"/><button onClick={handleSaveTemplate} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"><Save size={16}/></button><button onClick={() => setIsSavingTemplate(false)} className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300"><X size={16}/></button></div>)}</div></div>}
            </div>
          </div>

          <div className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 ${isListening === 'findings' ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 focus-within:shadow-sm'} bg-white print:border-none print:p-0`}>
            {isListening === 'findings' && <div className="absolute top-3 right-3 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse bg-white border border-red-100 px-3 py-1.5 rounded-full shadow-sm z-10"><Mic size={14} /> Gravando...</div>}
            <textarea ref={findingsRef} value={report.findings} onChange={e => setReport({ ...report, findings: e.target.value })} className="w-full min-h-[350px] p-5 outline-none resize-none text-sm leading-relaxed print:hidden bg-slate-50/30 focus:bg-white transition-colors" placeholder="Descreva os achados detalhados do exame..." />
            <div className="hidden print:block p-0 text-sm leading-relaxed min-h-[1em]">
              {renderFormattedText(report.findings)}
            </div>
          </div>
          
          <div className="mt-3 flex justify-end no-print">
            <button 
              onClick={handleAiRefine} 
              disabled={isRefining} 
              className={`flex items-center gap-2 bg-gradient-to-r ${colors.aiBtn} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95`}
            >
              {isRefining ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              <span>Refinar Texto com IA</span>
            </button>
          </div>
        </div>

        {/* --- CONCLUSÃO / HIPÓTESE (REFINED) --- */}
        <div className="mb-10 print:mb-2 group/section">
           <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2.5">
                  <div className="bg-slate-100 p-1.5 rounded-lg text-slate-600 group-hover/section:bg-indigo-50 group-hover/section:text-indigo-600 transition-colors">
                    <BrainCircuit size={18} />
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>Conclusão / Hipótese Diagnóstica</h3>
                  <button 
                    onClick={() => startDictation('conclusion')} 
                    className={`no-print p-2 rounded-full shadow-sm transition-all ${isListening === 'conclusion' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                    title="Ditar Conclusão"
                  >
                    <Mic size={16} />
                  </button>
              </div>
              <button 
                onClick={handleAiConclusion} 
                disabled={isGeneratingConclusion}
                className={`no-print flex items-center gap-2 bg-gradient-to-r ${colors.aiBtn} text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95`}
              >
                {isGeneratingConclusion ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                <span>Sugerir Conclusão com IA</span>
              </button>
           </div>
          <div className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 ${isListening === 'conclusion' ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/50 focus-within:shadow-sm'} bg-slate-50/50 print:bg-white print:border-none print:p-0`}>
            {isListening === 'conclusion' && <div className="absolute top-3 right-3 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse bg-white border border-red-100 px-3 py-1.5 rounded-full shadow-sm z-10"><Mic size={14} /> Gravando...</div>}
            <textarea ref={conclusionRef} value={report.conclusion} onChange={e => setReport({ ...report, conclusion: e.target.value })} className="w-full min-h-[120px] p-5 outline-none resize-none text-sm leading-relaxed bg-transparent font-bold text-slate-800 print:hidden placeholder:font-normal" placeholder="Conclusão diagnóstica final..." />
            <div className="hidden print:block p-0 text-sm leading-relaxed font-bold text-slate-800 min-h-[1em]">
              {renderFormattedText(report.conclusion)}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16 break-inside-avoid print:border-none print:pt-4 flex flex-col">
          <div className={`flex ${getSignatureAlignment()} mb-1`}>
            <div className="flex flex-col items-center min-w-[250px] relative">
              <DraggableSignature settings={settings} onUpdateSettings={onUpdateSettings} />
              <div className="w-full text-center font-bold text-slate-900 border-t border-slate-900 pt-2 mt-1">
                  {settings.doctorName || "Nome do Médico"}
              </div>
              <div className="text-center text-sm text-slate-600">
                  CRM: {settings.crm} {settings.rqe ? `| RQE: ${settings.rqe}` : ''}
              </div>
            </div>
          </div>

          <div className="print:break-after-page"></div>

          {(regularImages.length > 0 || qrCodeUrl) && (
            <div className="mt-8 w-full block">
              {regularImages.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className={`text-sm font-bold uppercase ${colors.text}`}>Documentação Fotográfica</h3></div>
                  <div className={`grid ${gridColsClass} gap-4`}>
                    {regularImages.map((img, index) => (
                      <div key={img.id} className={`relative h-auto group flex flex-col gap-1`}>
                        <div className="relative">
                          <img src={img.url} alt="Exame" className="w-full h-auto object-contain rounded-sm" />
                          {enhancingImageId === img.id && (
                          <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center rounded-sm backdrop-blur-[1px]">
                              <Loader2 size={32} className="text-white animate-spin mb-2" />
                              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Processando...</span>
                          </div>
                          )}
                          {img.isAiEnhanced && (
                            <div className="absolute top-2 left-2 bg-white/90 p-1 rounded-full shadow-sm z-10 pointer-events-none border border-indigo-100">
                               <GeminiIcon size={16} />
                            </div>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRemoveImage(img.id); }} 
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm no-print"
                          >
                          <X size={12} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEnhanceImage(img.id, img.url); }} 
                            className="absolute bottom-1 right-1 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg hover:bg-indigo-500 transition-all z-20 active:scale-95 group-hover:opacity-100 opacity-0 duration-200 no-print"
                            disabled={enhancingImageId === img.id}
                          >
                            <Sparkles size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">
                            Foto {String(index + 1).padStart(2, '0')}
                          </span>
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => onUpdateImage(img.id, { caption: e.target.value })}
                            placeholder="Legenda..."
                            className="flex-1 text-[10px] text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 outline-none w-full placeholder:text-slate-300 print:placeholder:text-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasAiImages && (
                    <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-slate-500 italic border-t border-slate-100 pt-2">
                       <GeminiIcon size={12} className="opacity-75" />
                       <span>AI enhanced</span>
                    </div>
                  )}
                </div>
              )}
              {qrCodeUrl && (
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-row items-center gap-6 break-inside-avoid">
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 border border-slate-100 p-1 bg-white rounded-lg shadow-sm" />
                  <div><h4 className={`text-sm font-bold uppercase ${colors.text} mb-1 flex items-center gap-2`}>Registro de Vídeo</h4><p className="text-xs text-slate-600 mb-1">Aponte a câmera do celular para assistir ao vídeo do exame.</p><a href={report.videoLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 underline break-all block">{report.videoLink}</a></div>
                </div>
              )}
            </div>
          )}

          {mosaicImages.length > 0 && (
            <div className={`mt-8 w-full block ${(!regularImages.length && !qrCodeUrl) ? 'page-break break-before-page' : ''}`}>
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className={`text-sm font-bold uppercase ${colors.text}`}>Mosaico e Videokimografia Digital</h3>
               </div>
               <div className="mb-6 space-y-6">
                  {mosaicImages.map((img) => (
                    <MosaicResizableImage key={img.id} img={img} onUpdate={onUpdateImage} onRemove={onRemoveImage} />
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;

import React, { useState, useEffect } from 'react';
import ReportEditor from './components/ReportEditor';
import CaptureStation from './components/CaptureStation';
import SettingsModal from './components/SettingsModal';
import PatientModal from './components/PatientModal';
import LandingPage from './components/LandingPage';
import UserManual from './components/UserManual'; // Importar Manual
import { DoctorSettings, PatientData, ReportData, CapturedImage, BurstSession } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { getDirectoryHandle, saveDirectoryHandle } from './services/storageService';

const App: React.FC = () => {
  // --- Landing Page State ---
  const [showLandingPage, setShowLandingPage] = useState(true);

  // --- Settings State with Robust Error Handling ---
  const [settings, setSettings] = useState<DoctorSettings>(() => {
    try {
      const saved = localStorage.getItem('ent_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        if (!merged.customTemplates) merged.customTemplates = [];
        // Ensure visiblePatientFields is merged correctly if missing
        if (!merged.visiblePatientFields) merged.visiblePatientFields = DEFAULT_SETTINGS.visiblePatientFields;
        if (!merged.customPatientFields) merged.customPatientFields = [];
        
        return merged;
      }
    } catch (e) {
      console.error("Erro ao carregar configurações salvas, resetando para padrão:", e);
      localStorage.removeItem('ent_settings');
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(true);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false); // Novo estado do Manual

  // Directory Handle (Root Storage)
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  
  // Session Directory Handle (Subfolder for current patient)
  const [sessionDirectoryHandle, setSessionDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  useEffect(() => {
    const loadHandle = async () => {
      try {
        const handle = await getDirectoryHandle();
        if (handle) {
          setDirectoryHandle(handle);
        }
      } catch (e) {
        console.error("Failed to load directory handle", e);
      }
    };
    loadHandle();
  }, []);

  // Patient
  const [patient, setPatient] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    date: new Date().toLocaleDateString('pt-BR'),
    document: '',
    profession: '',
    insurance: '',
    address: '',
    indicatedBy: '',
    requestedBy: '',
    customValues: {}
  });

  // Report
  const [report, setReport] = useState<ReportData>({
    examType: '',
    equipment: '',
    findings: '',
    conclusion: '',
    videoLink: ''
  });

  // Images
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);

  // Burst History (Lifted State)
  const [burstHistory, setBurstHistory] = useState<BurstSession[]>([]);

  // --- Handlers ---

  const handleEnterApp = () => {
    setShowLandingPage(false);
    setIsPatientModalOpen(true);
  };

  const saveSettings = (newSettings: DoctorSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ent_settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  const handleUpdateSettings = (updatedSettings: DoctorSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('ent_settings', JSON.stringify(updatedSettings));
  };

  const handleCaptureImage = (image: CapturedImage) => {
    setCapturedImages(prev => [...prev, image]);
  };

  const handleBurstComplete = (session: BurstSession) => {
    setBurstHistory(prev => [session, ...prev]);
  };

  const handleRemoveImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpdateImage = (id: string, updates: Partial<CapturedImage>) => {
    setCapturedImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const handleSetVideoLink = (link: string) => {
    setReport(prev => ({ ...prev, videoLink: link }));
  };

  const handleSelectDirectory = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert("Seu navegador não suporta esta funcionalidade.");
        return;
      }
      // @ts-ignore
      const handle = await window.showDirectoryPicker({
        id: 'ent-report-pro-storage',
        mode: 'readwrite'
      });
      setDirectoryHandle(handle);
      await saveDirectoryHandle(handle);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        alert("Erro ao selecionar pasta.");
      }
    }
  };

  const handleNewReport = () => {
    if (window.confirm("ATENÇÃO: Deseja iniciar um NOVO LAUDO?\n\nIsso apagará os dados do paciente, imagens e textos atuais da tela para iniciar um novo exame.")) {
      
      // Lógica de limpeza do Burst History
      if (burstHistory.length > 0) {
        const keepBursts = !window.confirm("Deseja remover os ícones de histórico de Burst (Stacks) da tela?\n\n(OBS: As fotos e pastas físicas salvas no computador NÃO serão apagadas, apenas os ícones de atalho sairão da tela).");
        if (!keepBursts) {
          setBurstHistory([]);
        }
      }

      setPatient({
        name: '',
        age: '',
        gender: '',
        date: new Date().toLocaleDateString('pt-BR'),
        document: '',
        profession: '',
        insurance: '',
        address: '',
        indicatedBy: '',
        requestedBy: '',
        customValues: {}
      });
      setReport({
        examType: '',
        equipment: '',
        findings: '',
        conclusion: '',
        videoLink: ''
      });
      setCapturedImages([]);
      setSessionDirectoryHandle(null);
      setIsPatientModalOpen(true);
    }
  };

  const handleStartExam = async (data: PatientData) => {
    setPatient(data);
    setIsPatientModalOpen(false);

    if (directoryHandle) {
       try {
         const today = new Date();
         const yyyy = today.getFullYear();
         const mm = String(today.getMonth() + 1).padStart(2, '0');
         const dd = String(today.getDate()).padStart(2, '0');
         
         const safeName = data.name.trim().replace(/[^a-z0-9]/gi, '_');
         const folderName = `${yyyy}-${mm}-${dd}_${safeName}`;

         // @ts-ignore
         const newSessionHandle = await directoryHandle.getDirectoryHandle(folderName, { create: true });
         setSessionDirectoryHandle(newSessionHandle);
         console.log(`Pasta da sessão criada: ${folderName}`);
       } catch (err) {
         console.error("Erro ao criar subpasta do paciente:", err);
         alert("Atenção: Não foi possível criar a pasta automática do paciente. Os arquivos serão salvos na pasta raiz.");
       }
    }
  };

  const handleSavePdf = async (blob: Blob, fileName: string) => {
    const targetHandle = sessionDirectoryHandle || directoryHandle;

    if (!targetHandle) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      // @ts-ignore
      const fileHandle = await targetHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      alert(`PDF salvo com sucesso na pasta do exame.`);
    } catch (err) {
      console.error("Erro ao salvar PDF:", err);
      alert("Erro ao salvar o PDF na pasta selecionada.");
    }
  };

  if (showLandingPage) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden print:h-auto print:overflow-visible print:block bg-slate-100">
      
      <PatientModal 
        isOpen={isPatientModalOpen} 
        onSubmit={handleStartExam} 
        settings={settings}
      />

      <div className="w-full md:w-2/3 h-full relative z-0 print:w-full print:h-auto print:static">
        <ReportEditor 
          settings={settings}
          patient={patient}
          setPatient={setPatient}
          report={report}
          setReport={setReport}
          capturedImages={capturedImages}
          onRemoveImage={handleRemoveImage}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onUpdateImage={handleUpdateImage}
          onNewReport={handleNewReport}
          onSavePdf={handleSavePdf}
          onUpdateSettings={handleUpdateSettings}
          onOpenUserManual={() => setIsUserManualOpen(true)} // Passar handler
        />
      </div>

      <div className="hidden md:flex w-1/3 h-full bg-slate-900 border-l border-slate-800 z-10 shadow-2xl no-print">
        <CaptureStation 
          onCaptureImage={handleCaptureImage}
          onSetVideoLink={handleSetVideoLink}
          videoLink={report.videoLink}
          patientName={patient.name}
          directoryHandle={sessionDirectoryHandle || directoryHandle}
          burstSpeed={settings.burstSpeed || 15}
          shortcuts={{
            photo: settings.photoShortcut || 'F8',
            record: settings.recordShortcut || 'F9',
            fullscreen: settings.fullscreenShortcut || 'F10'
          }}
          autoCropEnabled={settings.autoCropEnabled !== false}
          burstHistory={burstHistory}
          onBurstComplete={handleBurstComplete}
        />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
        directoryHandle={directoryHandle}
        onSelectDirectory={handleSelectDirectory}
      />

      {/* User Manual Modal */}
      <UserManual 
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import ReportEditor from './components/ReportEditor';
import CaptureStation from './components/CaptureStation';
import SettingsModal from './components/SettingsModal';
import PatientModal from './components/PatientModal';
import LandingPage from './components/LandingPage';
import UserManual from './components/UserManual';
import { DoctorSettings, PatientData, ReportData, CapturedImage, BurstSession } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { getDirectoryHandle, saveDirectoryHandle, verifyPermission } from './services/storageService';

const App: React.FC = () => {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);

  const [settings, setSettings] = useState<DoctorSettings>(() => {
    try {
      const saved = localStorage.getItem('ent_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        if (!merged.customTemplates) merged.customTemplates = [];
        if (!merged.visiblePatientFields) merged.visiblePatientFields = DEFAULT_SETTINGS.visiblePatientFields;
        if (!merged.customPatientFields) merged.customPatientFields = [];
        return merged;
      }
    } catch (e) {
      console.error("Erro ao carregar configurações salvas:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [sessionDirectoryHandle, setSessionDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [burstHistory, setBurstHistory] = useState<BurstSession[]>([]);

  const [patient, setPatient] = useState<PatientData>({
    name: '', age: '', gender: '', performedBy: '', date: new Date().toLocaleDateString('pt-BR'),
    document: '', profession: '', insurance: '', address: '', indicatedBy: '', requestedBy: '',
    customValues: {}
  });

  const [report, setReport] = useState<ReportData>({
    examType: '', equipment: '', findings: '', conclusion: '', videoLink: ''
  });

  useEffect(() => {
    const loadHandle = async () => {
      try {
        const handle = await getDirectoryHandle();
        if (handle) setDirectoryHandle(handle);
      } catch (e) {
        console.error("Failed to load directory handle", e);
      }
    };
    loadHandle();
  }, []);

  const handleEnterApp = () => {
    setShowLandingPage(false);
    setIsPatientModalOpen(true);
    
    // Verificação de primeira vez para o manual v3
    const hasSeenManual = localStorage.getItem('ent_manual_seen_v3');
    if (!hasSeenManual) {
      setIsUserManualOpen(true);
      localStorage.setItem('ent_manual_seen_v3', 'true');
    }
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

  const handleAddImageAfter = (targetId: string, newImage: CapturedImage) => {
    setCapturedImages(prev => {
      const index = prev.findIndex(img => img.id === targetId);
      if (index === -1) return [...prev, newImage];
      const newArr = [...prev];
      newArr.splice(index + 1, 0, newImage);
      return newArr;
    });
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
      const handle = await window.showDirectoryPicker({ id: 'ent-report-pro-storage', mode: 'readwrite' });
      setDirectoryHandle(handle);
      await saveDirectoryHandle(handle);
    } catch (err: any) {
      if (err.name !== 'AbortError') alert("Erro ao selecionar pasta.");
    }
  };

  const handleNewReport = () => {
    if (window.confirm("Deseja iniciar um NOVO LAUDO?")) {
      if (burstHistory.length > 0 && window.confirm("Limpar histórico de Bursts da tela?")) {
        setBurstHistory([]);
      }
      setPatient({
        name: '', age: '', gender: '', performedBy: settings.doctorName || '', 
        date: new Date().toLocaleDateString('pt-BR'), document: '', profession: '', 
        insurance: '', address: '', indicatedBy: '', requestedBy: '', customValues: {}
      });
      setReport({ examType: '', equipment: '', findings: '', conclusion: '', videoLink: '' });
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
         const hasPermission = await verifyPermission(directoryHandle, true);
         if (hasPermission) {
             const today = new Date();
             const folderName = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}_${data.name.trim().replace(/[^a-z0-9]/gi, '_')}`;
             // @ts-ignore
             const newSessionHandle = await directoryHandle.getDirectoryHandle(folderName, { create: true });
             setSessionDirectoryHandle(newSessionHandle);
         }
       } catch (err) {
         console.error("Erro ao criar subpasta:", err);
       }
    }
  };

  if (showLandingPage) {
    return <LandingPage onEnterApp={handleEnterApp} settings={settings} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden print:h-auto print:overflow-visible print:block bg-slate-100">
      
      <PatientModal isOpen={isPatientModalOpen} onSubmit={handleStartExam} settings={settings} />

      <div className="w-full md:w-2/3 h-full relative z-0 print:w-full print:h-auto print:static">
        <ReportEditor 
          settings={settings} patient={patient} setPatient={setPatient}
          report={report} setReport={setReport} capturedImages={capturedImages}
          onRemoveImage={handleRemoveImage} onOpenSettings={() => setIsSettingsOpen(true)}
          onUpdateImage={handleUpdateImage} onAddImageAfter={handleAddImageAfter}
          onNewReport={handleNewReport} onUpdateSettings={handleUpdateSettings}
          onOpenUserManual={() => setIsUserManualOpen(true)}
        />
      </div>

      <div className="hidden md:flex w-1/3 h-full bg-slate-900 border-l border-slate-800 z-10 shadow-2xl no-print">
        <CaptureStation 
          onCaptureImage={handleCaptureImage} onSetVideoLink={handleSetVideoLink}
          videoLink={report.videoLink} patientName={patient.name}
          directoryHandle={sessionDirectoryHandle || directoryHandle}
          burstSpeed={settings.burstSpeed || 15}
          shortcuts={{
            photo: settings.photoShortcut || 'F8',
            record: settings.recordShortcut || 'F9',
            fullscreen: settings.fullscreenShortcut || 'F10'
          }}
          autoCropEnabled={settings.autoCropEnabled !== false}
          burstHistory={burstHistory} onBurstComplete={handleBurstComplete}
        />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSave={saveSettings}
        directoryHandle={directoryHandle} onSelectDirectory={handleSelectDirectory}
      />

      <UserManual isOpen={isUserManualOpen} onClose={() => setIsUserManualOpen(false)} />
    </div>
  );
};

export default App;

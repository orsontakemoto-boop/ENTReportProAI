
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
  const [settings, setSettings] = useState<DoctorSettings>(() => {
    try {
      const saved = localStorage.getItem('ent_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) { console.error(e); }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [sessionDirectoryHandle, setSessionDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const initialPatientState: PatientData = {
    name: '', age: '', gender: '', performedBy: settings.doctorName || '', date: new Date().toLocaleDateString('pt-BR'),
    customValues: {}
  };

  const initialReportState: ReportData = {
    examType: '', equipment: '', findings: '', conclusion: '', videoLink: ''
  };

  const [patient, setPatient] = useState<PatientData>(initialPatientState);
  const [report, setReport] = useState<ReportData>(initialReportState);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [burstHistory, setBurstHistory] = useState<BurstSession[]>([]);

  useEffect(() => {
    const load = async () => {
      const handle = await getDirectoryHandle();
      if (handle) setDirectoryHandle(handle);
    };
    load();
  }, []);

  const [lastDictatedText, setLastDictatedText] = useState<string>('');

  const handleEnterApp = () => {
    setShowLandingPage(false);
    setIsPatientModalOpen(true);

    // Lógica Onboarding: Abre o manual apenas na primeira vez que entrar
    // Lógica Onboarding: Abre o manual apenas na primeira vez que entrar
    const manualSeen = localStorage.getItem('ent_manual_seen_v4');
    if (!manualSeen) {
      setIsUserManualOpen(true);
      localStorage.setItem('ent_manual_seen_v4', 'true');
    }
  };

  const handleStartExam = async (data: PatientData) => {
    setPatient(data);
    setIsPatientModalOpen(false);
    if (directoryHandle) {
      const hasPermission = await verifyPermission(directoryHandle, true);
      if (hasPermission) {
        try {
          const folderName = `${new Date().toISOString().split('T')[0]}_${data.name.replace(/[^a-z0-9]/gi, '_')}`;
          // @ts-ignore
          const newHandle = await directoryHandle.getDirectoryHandle(folderName, { create: true });
          setSessionDirectoryHandle(newHandle);
        } catch (e) { console.error(e); }
      }
    }
  };

  const handleNewReport = () => {
    if (confirm("Deseja realmente descartar o laudo atual e iniciar um novo exame?")) {
      setPatient({
        ...initialPatientState,
        performedBy: settings.doctorName || ''
      });
      setReport(initialReportState);
      setCapturedImages([]);
      setBurstHistory([]);
      setSessionDirectoryHandle(null);
      setIsPatientModalOpen(true);
      setLastDictatedText('');
    }
  };

  const saveSettings = (newSettings: DoctorSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ent_settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  if (showLandingPage) return <LandingPage onEnterApp={handleEnterApp} settings={settings} />;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden print:h-auto print:overflow-visible print:block bg-slate-100">
      <PatientModal isOpen={isPatientModalOpen} onSubmit={handleStartExam} settings={settings} />
      <div className="w-full md:w-2/3 h-full relative z-0 print:w-full print:h-auto print:static">
        <ReportEditor
          settings={settings} patient={patient} setPatient={setPatient}
          report={report} setReport={setReport} capturedImages={capturedImages}
          onRemoveImage={(id) => setCapturedImages(prev => prev.filter(img => img.id !== id))}
          onUpdateImage={(id, up) => setCapturedImages(prev => prev.map(img => img.id === id ? { ...img, ...up } : img))}
          onAddImageAfter={(id, img) => setCapturedImages(prev => {
            const idx = prev.findIndex(i => i.id === id);
            const copy = [...prev];
            copy.splice(idx + 1, 0, img);
            return copy;
          })}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewReport={handleNewReport}
          onUpdateSettings={(s) => { setSettings(s); localStorage.setItem('ent_settings', JSON.stringify(s)); }}
          onOpenUserManual={() => setIsUserManualOpen(true)}
          onDictationResult={(text) => setLastDictatedText(text)}
        />
      </div>
      <div className="hidden md:flex w-1/3 h-full bg-slate-900 no-print">
        <CaptureStation
          onCaptureImage={(img) => setCapturedImages(prev => [...prev, img])}
          onSetVideoLink={(link) => setReport(prev => ({ ...prev, videoLink: link }))}
          videoLink={report.videoLink} patientName={patient.name}
          directoryHandle={sessionDirectoryHandle || directoryHandle}
          burstSpeed={settings.burstSpeed}
          shortcuts={{ photo: settings.photoShortcut, record: settings.recordShortcut, fullscreen: settings.fullscreenShortcut }}
          autoCropEnabled={settings.autoCropEnabled}
          burstHistory={burstHistory}
          onBurstComplete={(session) => setBurstHistory(prev => [session, ...prev])}
          autoCaption={lastDictatedText}
        />
      </div>
      <SettingsModal
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSave={saveSettings} directoryHandle={directoryHandle}
        onSelectDirectory={async () => {
          // @ts-ignore
          const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
          setDirectoryHandle(handle);
          await saveDirectoryHandle(handle);
        }}
      />
      <UserManual isOpen={isUserManualOpen} onClose={() => setIsUserManualOpen(false)} />
    </div>
  );
};

export default App;

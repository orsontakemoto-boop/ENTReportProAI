import React from 'react';
import ReportEditor from './components/ReportEditor';
import CaptureStation from './components/CaptureStation';
import SettingsModal from './components/SettingsModal';
import PatientModal from './components/PatientModal';
import LandingPage from './components/LandingPage';
import UserManual from './components/UserManual';
import { useAppLogic } from './hooks/useAppLogic';

const App: React.FC = () => {
  const {
    showLandingPage,
    settings,
    setSettings,
    isSettingsOpen,
    setIsSettingsOpen,
    isPatientModalOpen,
    setIsPatientModalOpen,
    isUserManualOpen,
    setIsUserManualOpen,
    directoryHandle,
    setDirectoryHandle,
    sessionDirectoryHandle,
    patient,
    setPatient,
    report,
    setReport,
    capturedImages,
    setCapturedImages,
    burstHistory,
    setBurstHistory,
    handleEnterApp,
    handleStartExam,
    handleNewReport,
    saveSettings,
    handleSelectDirectory
  } = useAppLogic();

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
        />
      </div>
      <SettingsModal
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSave={saveSettings} directoryHandle={directoryHandle}
        onSelectDirectory={handleSelectDirectory}
      />
      <UserManual isOpen={isUserManualOpen} onClose={() => setIsUserManualOpen(false)} />
    </div>
  );
};

export default App;

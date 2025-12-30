import { useState, useEffect } from 'react';
import { DoctorSettings, PatientData, ReportData, CapturedImage, BurstSession } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { getDirectoryHandle, saveDirectoryHandle, verifyPermission } from '../services/storageService';

export const useAppLogic = () => {
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

    const handleEnterApp = () => {
        setShowLandingPage(false);
        setIsPatientModalOpen(true);

        // Lógica Onboarding: Abre o manual apenas na primeira vez que entrar
        const manualSeen = localStorage.getItem('ent_manual_seen_v3');
        if (!manualSeen) {
            setIsUserManualOpen(true);
            localStorage.setItem('ent_manual_seen_v3', 'true');
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
        }
    };

    const saveSettings = (newSettings: DoctorSettings) => {
        setSettings(newSettings);
        localStorage.setItem('ent_settings', JSON.stringify(newSettings));
        setIsSettingsOpen(false);
    };

    const handleSelectDirectory = async () => {
        // @ts-ignore
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        setDirectoryHandle(handle);
        await saveDirectoryHandle(handle);
    };

    return {
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
    };
};


export interface DoctorSettings {
  clinicName: string;
  clinicSubtitle: string;
  clinicAddress: string;
  clinicPhone: string;
  doctorName: string;
  crm: string;
  rqe: string;
  logoBase64: string | null;
  signatureBase64: string | null;
  apiKey?: string;

  landingHeroImage: string | null;
  landingShowcaseImage: string | null;

  savedEquipments: string[];
  photosGridColumns: number;
  burstSpeed: number;
  autoCropEnabled: boolean;

  customTemplates: CustomTemplate[];
  customExamTypes: Record<string, ExamTemplate>;

  visiblePatientFields: {
    document: boolean;
    profession: boolean;
    insurance: boolean;
    address: boolean;
    indicatedBy: boolean;
    requestedBy: boolean;
  };
  customPatientFields: string[];

  selectedCameraId: string;

  fontFamily: 'Century Gothic' | 'Inter' | 'Roboto' | 'Playfair Display' | 'Lato' | 'System Sans' | 'System Serif';
  logoPosition: 'left' | 'right' | 'center';
  logoSize: 'small' | 'medium' | 'large';
  themeColor: 'blue' | 'teal' | 'slate' | 'black';
  signaturePosition: 'left' | 'center' | 'right';
  printFontSize: number;

  signatureStyle: {
    x: number;
    y: number;
    width: number;
  } | null;

  photoShortcut: string;
  recordShortcut: string;
  fullscreenShortcut: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  examType: string;
}

export interface PatientData {
  name: string;
  age: string;
  gender: 'M' | 'F' | 'Outro' | '';
  date: string;
  performedBy: string;
  document?: string;
  profession?: string;
  insurance?: string;
  address?: string;
  indicatedBy?: string;
  requestedBy?: string;
  customValues: Record<string, string>;
}

export interface ReportData {
  examType: string;
  equipment: string;
  findings: string;
  conclusion: string;
  videoLink: string;
}

export interface CapturedImage {
  id: string;
  url: string;
  timestamp: number;
  type?: 'regular' | 'mosaic';
  customWidth?: number;
  customHeight?: number;
  originalUrl?: string;
  isAiEnhanced?: boolean;
  caption?: string;
}

export interface ExamTemplate {
  label: string;
  equipment: string;
  findings: string;
  conclusion: string;
}

export interface BurstSession {
  id: string;
  folderName: string;
  timestamp: string;
  count: number;
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    showSaveFilePicker: (options?: any) => Promise<FileSystemFileHandle>;
    showDirectoryPicker: (options?: any) => Promise<FileSystemDirectoryHandle>;
  }
  var html2pdf: any;

  // Augment the NodeJS namespace for global process.env

}

// Ensure the file is a module
export { };

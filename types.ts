
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
  
  // Imagens da Landing Page (Novos campos)
  landingHeroImage: string | null;
  landingShowcaseImage: string | null;

  savedEquipments: string[];
  photosGridColumns: number;
  burstSpeed: number; // Novas fotos por segundo (1-60)
  autoCropEnabled: boolean; // Novo campo para controlar o recorte automático
  
  // Custom Templates
  customTemplates: CustomTemplate[];

  // Novos Tipos de Exame Criados pelo Usuário
  customExamTypes: Record<string, ExamTemplate>;

  // Personalização de Campos do Paciente
  visiblePatientFields: {
    document: boolean;
    profession: boolean;
    insurance: boolean;
    address: boolean;
    indicatedBy: boolean;
    requestedBy: boolean;
  };
  customPatientFields: string[]; // Lista de rótulos ex: ["Religião", "Cor", "Estado Civil"]

  // Câmera Única (Campo mantido para compatibilidade, mas não usado na UI)
  selectedCameraId: string;
  
  // Personalização Visual
  fontFamily: 'Century Gothic' | 'Inter' | 'Roboto' | 'Playfair Display' | 'Lato' | 'System Sans' | 'System Serif';
  logoPosition: 'left' | 'right' | 'center';
  logoSize: 'small' | 'medium' | 'large';
  themeColor: 'blue' | 'teal' | 'slate' | 'black';
  signaturePosition: 'left' | 'center' | 'right'; // Nova opção de posição da assinatura

  // Atalhos
  photoShortcut: string;
  recordShortcut: string;
  fullscreenShortcut: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  content: string;
  examType: string; // Para vincular o template ao tipo de exame (nasofibro, laringo, etc)
}

export interface PatientData {
  name: string;
  age: string;
  gender: 'M' | 'F' | 'Outro' | '';
  date: string;
  // Campos opcionais padrão
  document?: string; // RG ou CPF
  profession?: string;
  insurance?: string; // Convênio
  address?: string;
  indicatedBy?: string; // Referenciado por
  requestedBy?: string; // Solicitado por
  
  // Valores para campos personalizados dinâmicos
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
  customWidth?: number; // porcentagem 10-100
  customHeight?: number; // pixels
  originalUrl?: string; // URL da imagem original (antes da IA)
  isAiEnhanced?: boolean; // Flag para identificar se a imagem foi tratada pela IA
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

// Extend Window interface for Speech API and File System Access API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    showSaveFilePicker: (options?: any) => Promise<FileSystemFileHandle>;
    showDirectoryPicker: (options?: any) => Promise<FileSystemDirectoryHandle>;
  }
  var html2pdf: any;
}

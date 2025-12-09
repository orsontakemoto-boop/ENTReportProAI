
import { ExamTemplate } from './types';

export const EXAM_TEMPLATES: Record<string, ExamTemplate> = {
  nasofibro: {
    label: "Nasofibrolaringoscopia",
    equipment: "Nasofibroscópio flexível de 3.2mm.",
    findings: "Fossas Nasais: \nSepto Nasal: \nCornetos Inferiores: \nMeatos Médios: \nRinofaringe (Cavum): \nOrofaringe: \nBase de Língua e Valéculas: \nHipofaringe / Seios Piriformes: \nLaringe (Epiglote e Aritenoides): \nPregas Vocais: \nMobilidade Laringea: ",
    conclusion: "Exame compatível com: "
  },
  laringo: {
    label: "Laringoestroboscopia",
    equipment: "Telelaringoscópio rígido de 70 graus + Fonte de Luz Estroboscópica.",
    findings: "Orofaringe / Base de Língua: \nValéculas e Seios Piriformes: \nLaringe Supraglótica: \nPregas Vocais (Morfologia): \nFenda Glótica: \nMobilidade das Pregas Vocais: \nOnda Mucosa (Estroboscopia): \nSimetria e Periodicidade: ",
    conclusion: "Exame compatível com: "
  },
  nasossinusal: {
    label: "Endoscopia Nasossinusal",
    equipment: "Ótica rígida de 0 e 30 graus.",
    findings: "Vestíbulos Nasais: \nSepto Nasal: \nCornetos Inferiores: \nCornetos Médios: \nMeatos Médios: \nRecessos Esfenoetmoidais: \nSecreção / Drenagem: \nLesões / Pólipos: ",
    conclusion: "Exame compatível com: "
  },
  degluticao: {
    label: "Videoendoscopia da Deglutição (FEES)",
    equipment: "Nasofibroscópio flexível + Protocolo de alimentos corados.",
    findings: "Anatomia e Sensibilidade: \nControle Oral do Bolo: \nDisparo do Reflexo de Deglutição: \nResíduos (Estase) em Valéculas: \nResíduos (Estase) em Seios Piriformes: \nPenetração Laríngea: \nAspiração Traqueal: \nEficácia da Tosse/Limpeza: ",
    conclusion: "Deglutição funcional caracterizada por: "
  },
  veu: {
    label: "Endoscopia do Véu Palatino",
    equipment: "Nasofibroscópio flexível.",
    findings: "Morfologia do Palato Mole: \nMobilidade do Véu: \nFechamento Velofaríngeo (Fonação): \nPassavant: \nFuga Nasal de Ar: ",
    conclusion: "Esfíncter velofaríngeo: "
  }
};

export const DEFAULT_SETTINGS = {
  clinicName: "Clínica Otorrino Exemplo",
  clinicSubtitle: "Otorrinolaringologia e Cirurgia Cérvico-Facial",
  clinicAddress: "Av. Paulista, 1000 - Sala 101 - São Paulo/SP",
  clinicPhone: "(11) 99999-9999",
  doctorName: "Dr. João Silva",
  crm: "123456",
  rqe: "12345",
  logoBase64: null,
  signatureBase64: null,
  savedEquipments: ["Ótica Rígida 70º", "Nasofibroscópio Flexível 3.2mm", "Ótica Rígida 0º"],
  customTemplates: [], 
  customExamTypes: {}, // Inicialização vazia para exames personalizados
  
  // Configuração de Campos do Paciente
  visiblePatientFields: {
    document: true,
    profession: true,
    insurance: true,
    address: true,
    indicatedBy: true,
    requestedBy: true
  },
  customPatientFields: [], // Lista vazia inicialmente

  photosGridColumns: 4,
  burstSpeed: 15, // 15 fps padrão
  autoCropEnabled: true, // Recorte automático ativado por padrão
  
  // Câmera
  selectedCameraId: '',

  // Novos Padrões de Estilo
  fontFamily: 'Century Gothic',
  logoPosition: 'left',
  logoSize: 'medium',
  themeColor: 'blue',
  signaturePosition: 'center', // Posição padrão da assinatura
  
  // Atalhos
  photoShortcut: 'F8',
  recordShortcut: 'F9',
  fullscreenShortcut: 'F10'
};
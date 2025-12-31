
import { ExamTemplate } from './types';

/**
 * Edite este objeto para alterar os esqueletos padrão que aparecem no seletor de exames.
 * findings: Estrutura que aparece no campo "Descrição". Use \n para pular linha e **texto** para negrito.
 * conclusion: Texto que aparece por padrão no campo "Conclusão".
 */
export const EXAM_TEMPLATES: Record<string, ExamTemplate> = {
  nasofibro: {
    label: "Vídeo-nasofibrolaringoscopia",
    equipment: "Nasofibroscópio flexível de 3.2mm.",
    findings: "**Fossas Nasais:** \n**Septo Nasal:** \n**Cornetos Inferiores:** \n**Meatos Médios:** \n**Rinofaringe (Cavum):** \n**Orofaringe:** \n**Base de Língua e Valéculas:** \n**Hipofaringe / Seios Piriformes:** \n**Laringe (Epiglote e Aritenoides):** \n**Pregas Vocais:** \n**Mobilidade Laringea:** ",
    conclusion: "**Exame compatível com:** "
  },
  laringo: {
    label: "Vídeo-laringo-estroboscopia",
    equipment: "Telelaringoscópio rígido de 70 graus + Fonte de Luz Estroboscópica.",
    findings: "**Orofaringe / Base de Língua:** \n**Valéculas e Seios Piriformes:** \n**Laringe Supraglótica:** \n**Pregas Vocais (Morfologia):** \n**Fenda Glótica:** \n**Mobilidade das Pregas Vocais:** \n**Onda Mucosa (Estroboscopia):** \n**Simetria e Periodicidade:** ",
    conclusion: "**Exame compatível com:** "
  },
  nasossinusal: {
    label: "Vídeo-endoscopia Nasossinusal",
    equipment: "Ótica rígida de 0 e 30 graus.",
    findings: "**Vestíbulos Nasais:** \n**Septo Nasal:** \n**Cornetos Inferiores:** \n**Cornetos Médios:** \n**Meatos Médios:** \n**Recessos Esfenoetmoidais:** \n**Secreção / Drenagem:** \n**Lesões / Pólipos:** ",
    conclusion: "**Exame compatível com:** "
  },
  degluticao: {
    label: "Vídeo-endoscopia da Deglutição (FEES)",
    equipment: "Nasofibroscópio flexível + Protocolo de alimentos corados.",
    findings: "**Anatomia e Sensibilidade:** \n**Controle Oral do Bolo:** \n**Disparo do Reflexo de Deglutição:** \n**Resíduos (Estase) em Valéculas:** \n**Resíduos (Estase) em Seios Piriformes:** \n**Penetração Laríngea:** \n**Aspiração Traqueal:** \n**Eficácia da Tosse/Limpeza:** ",
    conclusion: "**Deglutição funcional caracterizada por:** "
  },
  veu: {
    label: "Vídeo-endoscopia do Esfíncter Velo-palatino",
    equipment: "Nasofibroscópio flexível.",
    findings: "**Morfologia do Palato Mole:** \n**Mobilidade do Véu:** \n**Fechamento Velofaríngeo (Fonação):** \n**Passavant:** \n**Fuga Nasal de Ar:** ",
    conclusion: "**Esfíncter velofaríngeo:** "
  }
};

export const DEFAULT_SETTINGS = {
  clinicName: "Clínica Otorrino Exemplo",
  clinicSubtitle: "Otorrinolaringologia e Criurgia Cérvico-Facial",
  clinicAddress: "Av. Paulista, 1000 - Sala 101 - São Paulo/SP",
  clinicPhone: "(11) 99999-9999",
  doctorName: "Dr. João Silva",
  crm: "123456",
  rqe: "12345",
  logoBase64: null,
  signatureBase64: null,
  apiKey: "",

  landingHeroImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80",
  landingShowcaseImage: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80",

  savedEquipments: ["Ótica Rígida 70º", "Nasofibroscópio Flexível 3.2mm", "Ótica Rígida 0º"],
  customTemplates: [],
  customExamTypes: {},

  visiblePatientFields: {
    document: true,
    profession: true,
    insurance: true,
    address: true,
    indicatedBy: true,
    requestedBy: true
  },
  customPatientFields: [],

  photosGridColumns: 4,
  burstSpeed: 15,
  autoCropEnabled: true,

  selectedCameraId: '',
  fontFamily: 'Century Gothic',
  logoPosition: 'left',
  logoSize: 'medium',
  themeColor: 'blue',
  printFontSize: 100,
  signaturePosition: 'center',
  signatureStyle: null,

  photoShortcut: 'F8',
  recordShortcut: 'F9',
  fullscreenShortcut: 'F10'
};

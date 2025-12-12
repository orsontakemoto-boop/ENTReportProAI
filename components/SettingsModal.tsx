import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Plus, Trash2, PenTool, LayoutGrid, Palette, Type, AlignLeft, AlignCenter, AlignRight, Maximize, Minimize, FolderOpen, CheckCircle, AlertTriangle, Gauge, HelpCircle, ExternalLink, Key, Keyboard, Layers, Droplet, UserCog, ToggleLeft, ToggleRight, LayoutTemplate } from 'lucide-react';
import { DoctorSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DoctorSettings;
  onSave: (settings: DoctorSettings) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  onSelectDirectory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, directoryHandle, onSelectDirectory }) => {
  const [formData, setFormData] = useState<DoctorSettings>(settings);
  const [isFSApiSupported, setIsFSApiSupported] = useState(true);
  const [newCustomField, setNewCustomField] = useState('');

  useEffect(() => {
    setFormData(settings);
    setIsFSApiSupported('showDirectoryPicker' in window);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // @ts-ignore
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (type === 'number' || name === 'photosGridColumns' || name === 'burstSpeed' ? Number(value) : value) 
    }));
  };

  const handlePatientFieldToggle = (field: keyof DoctorSettings['visiblePatientFields']) => {
    setFormData(prev => ({
      ...prev,
      visiblePatientFields: {
        ...prev.visiblePatientFields,
        [field]: !prev.visiblePatientFields[field]
      }
    }));
  };

  const handleAddCustomField = () => {
    if (newCustomField.trim() && !formData.customPatientFields.includes(newCustomField.trim())) {
      setFormData(prev => ({
        ...prev,
        customPatientFields: [...prev.customPatientFields, newCustomField.trim()]
      }));
      setNewCustomField('');
    }
  };

  const handleRemoveCustomField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      customPatientFields: prev.customPatientFields.filter(f => f !== field)
    }));
  };

  const handleKeyRecord = (e: React.KeyboardEvent<HTMLInputElement>, field: 'photoShortcut' | 'recordShortcut' | 'fullscreenShortcut') => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
    const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    setFormData(prev => ({ ...prev, [field]: keyName }));
  };

  const processSignatureImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(base64); // Fallback
            return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Remove white background (make it transparent)
        // Check RGB > 240 (near white)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (r > 230 && g > 230 && b > 230) {
            data[i + 3] = 0; // Set Alpha to 0
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoBase64' | 'signatureBase64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let result = reader.result as string;
        
        // Se for assinatura, processar para remover fundo branco automaticamente
        if (field === 'signatureBase64') {
            try {
                result = await processSignatureImage(result);
            } catch (err) {
                console.error("Erro ao processar assinatura", err);
            }
        }
        
        setFormData(prev => ({ ...prev, [field]: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (field: 'logoBase64' | 'signatureBase64') => {
    setFormData(prev => ({ ...prev, [field]: null }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Configurações do Sistema</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* CAMPOS DE IDENTIFICAÇÃO DO PACIENTE */}
          <section>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2 flex items-center gap-2">
              <UserCog size={18} />
              Identificação do Paciente
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecione quais campos devem aparecer no laudo. Nome, Idade e Sexo são obrigatórios.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               {[
                 { id: 'document', label: 'Documento (RG/CPF)' },
                 { id: 'profession', label: 'Profissão' },
                 { id: 'insurance', label: 'Convênio / Plano' },
                 { id: 'address', label: 'Endereço' },
                 { id: 'indicatedBy', label: 'Indicação (Referência)' },
                 { id: 'requestedBy', label: 'Médico Solicitante' },
               ].map((field) => (
                 <div key={field.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-sm text-slate-700 font-medium">{field.label}</span>
                    <button 
                      onClick={() => handlePatientFieldToggle(field.id as keyof DoctorSettings['visiblePatientFields'])}
                      className={`text-2xl transition-colors ${formData.visiblePatientFields?.[field.id as keyof DoctorSettings['visiblePatientFields']] ? 'text-blue-600' : 'text-slate-300'}`}
                    >
                      {formData.visiblePatientFields?.[field.id as keyof DoctorSettings['visiblePatientFields']] ? <ToggleRight /> : <ToggleLeft />}
                    </button>
                 </div>
               ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <label className="block text-sm font-bold text-blue-800 mb-2">Adicionar Campo Personalizado</label>
               <div className="flex gap-2 mb-3">
                 <input 
                   type="text" 
                   value={newCustomField}
                   onChange={(e) => setNewCustomField(e.target.value)}
                   placeholder="Ex: Religião, Estado Civil, Cor..."
                   className="flex-1 border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                 />
                 <button 
                   onClick={handleAddCustomField}
                   className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                 >
                   Adicionar
                 </button>
               </div>
               
               <div className="flex flex-wrap gap-2">
                 {formData.customPatientFields?.map((field, idx) => (
                   <div key={idx} className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-1 rounded-full text-xs text-blue-700">
                     <span>{field}</span>
                     <button onClick={() => handleRemoveCustomField(field)} className="hover:text-red-500"><X size={12}/></button>
                   </div>
                 ))}
                 {formData.customPatientFields?.length === 0 && (
                   <span className="text-xs text-blue-400 italic">Nenhum campo personalizado.</span>
                 )}
               </div>
            </div>
          </section>

          {/* DADOS DA CLÍNICA */}
          <section>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2">Dados do Médico/Clínica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Clínica</label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo da Clínica</label>
                <input
                  type="text"
                  name="clinicSubtitle"
                  value={formData.clinicSubtitle || ''}
                  onChange={handleChange}
                  placeholder="Ex: Otorrinolaringologia"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  name="clinicPhone"
                  value={formData.clinicPhone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Médico</label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CRM</label>
                  <input
                    type="text"
                    name="crm"
                    value={formData.crm}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">RQE</label>
                  <input
                    type="text"
                    name="rqe"
                    value={formData.rqe}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ARMAZENAMENTO LOCAL */}
          <section>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2 flex items-center gap-2">
              <FolderOpen size={18} />
              Armazenamento de Vídeos e Burst
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-3">
                Selecione uma pasta no seu computador onde os vídeos gravados e as sequências de fotos (Burst) serão salvos automaticamente.
              </p>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                   {directoryHandle ? (
                     <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
                       <CheckCircle size={18} />
                       <div className="flex flex-col">
                         <span className="text-xs font-bold uppercase">Pasta Conectada</span>
                         <span className="text-sm font-medium">{directoryHandle.name}</span>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                       <AlertTriangle size={18} />
                       <span className="text-sm font-medium">Nenhuma pasta selecionada</span>
                     </div>
                   )}
                </div>

                <button
                  onClick={onSelectDirectory}
                  disabled={!isFSApiSupported}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    isFSApiSupported 
                    ? "bg-slate-700 hover:bg-slate-600 text-white shadow-sm"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FolderOpen size={18} />
                  {directoryHandle ? "Alterar Pasta" : "Selecionar Pasta"}
                </button>
              </div>
              
              {!isFSApiSupported && (
                <p className="text-xs text-red-500 mt-2">
                  * Seu navegador não suporta a API de Acesso ao Sistema de Arquivos. Use Google Chrome ou Edge em um computador Desktop.
                </p>
              )}

              {/* VELOCIDADE DO BURST */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center">
                     <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                       <Gauge size={18} />
                       Velocidade do Burst
                     </label>
                     <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                       {formData.burstSpeed || 15} fotos/seg
                     </span>
                   </div>
                   <input 
                      type="range" 
                      name="burstSpeed" 
                      min="1" 
                      max="60" 
                      step="1" 
                      value={formData.burstSpeed || 15} 
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                   <div className="flex justify-between text-xs text-slate-400 px-1">
                     <span>1 fps (Lento)</span>
                     <span>60 fps (Máximo)</span>
                   </div>
                 </div>
              </div>
            </div>
          </section>

          {/* ATALHOS DE TECLADO */}
          <section>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2 flex items-center gap-2">
              <Keyboard size={18} />
              Atalhos de Teclado
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">FOTO</label>
                <input
                  type="text"
                  value={formData.photoShortcut || 'F8'}
                  onKeyDown={(e) => handleKeyRecord(e, 'photoShortcut')}
                  readOnly
                  className="w-full border rounded-md p-2 text-center font-bold text-blue-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-blue-50"
                  title="Clique e pressione uma tecla para alterar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">VÍDEO</label>
                <input
                  type="text"
                  value={formData.recordShortcut || 'F9'}
                  onKeyDown={(e) => handleKeyRecord(e, 'recordShortcut')}
                  readOnly
                  className="w-full border rounded-md p-2 text-center font-bold text-red-700 bg-white focus:ring-2 focus:ring-red-500 outline-none cursor-pointer hover:bg-red-50"
                  title="Clique e pressione uma tecla para alterar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">TELA CHEIA</label>
                <input
                  type="text"
                  value={formData.fullscreenShortcut || 'F10'}
                  onKeyDown={(e) => handleKeyRecord(e, 'fullscreenShortcut')}
                  readOnly
                  className="w-full border rounded-md p-2 text-center font-bold text-slate-700 bg-white focus:ring-2 focus:ring-slate-500 outline-none cursor-pointer hover:bg-slate-50"
                  title="Clique e pressione uma tecla para alterar"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">Clique em um campo e pressione a tecla desejada para redefinir o atalho.</p>
          </section>

          {/* VISUAL / TEMAS */}
          <section>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2 flex items-center gap-2">
              <Palette size={18} />
              Personalização Visual
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Fonte */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                   <Type size={16} /> Tipografia
                 </label>
                 <select 
                    name="fontFamily" 
                    value={formData.fontFamily || 'Century Gothic'} 
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                   <option value="Century Gothic">Century Gothic (Padrão Médico)</option>
                   <option value="System Sans">Sistema (Padrão)</option>
                   <option value="System Serif">Sistema (Serifa)</option>
                   <option value="Inter">Inter (Moderno)</option>
                   <option value="Roboto">Roboto (Neutro)</option>
                   <option value="Playfair Display">Playfair Display (Serifa/Elegante)</option>
                   <option value="Lato">Lato (Amigável)</option>
                 </select>
               </div>

               {/* Tema de Cor */}
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tema de Cores</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'blue', label: 'Clássico', color: 'bg-blue-900' },
                      { id: 'teal', label: 'Cirúrgico', color: 'bg-teal-700' },
                      { id: 'slate', label: 'Moderno', color: 'bg-slate-800' },
                      { id: 'black', label: 'Minimal', color: 'bg-black' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setFormData(prev => ({...prev, themeColor: theme.id as any}))}
                        className={`flex-1 p-2 rounded-md border-2 transition-all flex flex-col items-center gap-1 ${formData.themeColor === theme.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                         <div className={`w-6 h-6 rounded-full ${theme.color} shadow-sm`}></div>
                         <span className="text-xs font-medium text-slate-600">{theme.label}</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* Posição do Logo */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Posição do Logotipo</label>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setFormData(prev => ({...prev, logoPosition: 'left'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.logoPosition === 'left' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignLeft size={16} />
                      <span className="text-xs font-medium">Esq</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({...prev, logoPosition: 'center'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.logoPosition === 'center' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignCenter size={16} />
                      <span className="text-xs font-medium">Centro</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({...prev, logoPosition: 'right'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.logoPosition === 'right' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignRight size={16} />
                      <span className="text-xs font-medium">Dir</span>
                    </button>
                 </div>
               </div>

               {/* Tamanho do Logo */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Tamanho do Logotipo</label>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setFormData(prev => ({...prev, logoSize: 'small'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.logoSize === 'small' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Minimize size={14} />
                      <span className="text-xs font-medium">Peq</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({...prev, logoSize: 'medium'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.logoSize === 'medium' || !formData.logoSize ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Maximize size={16} />
                      <span className="text-xs font-medium">Méd</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({...prev, logoSize: 'large'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.logoSize === 'large' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Maximize size={20} />
                      <span className="text-xs font-medium">Gra</span>
                    </button>
                 </div>
               </div>

               {/* Posição da Assinatura */}
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Posição do Carimbo/Assinatura</label>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setFormData(prev => ({...prev, signaturePosition: 'left'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.signaturePosition === 'left' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignLeft size={16} />
                      <span className="text-xs font-medium">Esquerda</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({...prev, signaturePosition: 'center'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.signaturePosition === 'center' || !formData.signaturePosition ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignCenter size={16} />
                      <span className="text-xs font-medium">Centro</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({...prev, signaturePosition: 'right'}))}
                      className={`flex-1 p-2 border rounded-md flex items-center justify-center gap-1 ${formData.signaturePosition === 'right' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <AlignRight size={16} />
                      <span className="text-xs font-medium">Direita</span>
                    </button>
                 </div>
               </div>

               {/* Colunas de Fotos (NOVO) */}
               <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                       <LayoutGrid size={16} /> 
                       Colunas na Documentação Fotográfica
                    </label>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {formData.photosGridColumns || 4} Colunas
                    </span>
                 </div>
                 <input 
                    type="range" 
                    name="photosGridColumns" 
                    min="2" 
                    max="6" 
                    step="1" 
                    value={formData.photosGridColumns || 4} 
                    onChange={handleChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between text-xs text-slate-400 mt-1">
                   <span>2 (Imagens Grandes)</span>
                   <span>6 (Imagens Pequenas)</span>
                 </div>
               </div>

            </div>
          </section>

          {/* ARQUIVOS (Logo e Assinatura) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2">Logotipo</h3>
              <div className="flex flex-col gap-3">
                <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50 relative group">
                  {formData.logoBase64 ? (
                    <>
                      <img src={formData.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                      <button 
                        onClick={() => removeImage('logoBase64')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover Logo"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 text-center">Sem Logo</span>
                  )}
                </div>
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm">
                  <Upload size={16} />
                  <span>Carregar Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoBase64')} />
                </label>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 border-b pb-2">Assinatura</h3>
              <div className="flex flex-col gap-3">
                <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden bg-white relative group">
                  {formData.signatureBase64 ? (
                    <>
                      <img src={formData.signatureBase64} alt="Assinatura" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                      <button 
                        onClick={() => removeImage('signatureBase64')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover Assinatura"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 text-center flex flex-col items-center gap-1">
                      <PenTool size={20} />
                      Carregar imagem da assinatura<br/>(fundo branco removido automaticamente)
                    </span>
                  )}
                </div>
                <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm">
                  <Upload size={16} />
                  <span>Carregar Assinatura</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'signatureBase64')} />
                </label>
              </div>
            </section>
          </div>

        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-md">Cancelar</button>
          <button
            onClick={() => onSave(formData)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 shadow-sm"
          >
            <Save size={18} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
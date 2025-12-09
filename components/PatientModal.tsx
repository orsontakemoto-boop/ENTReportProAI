
import React, { useState, useEffect } from 'react';
import { User, Calendar, Users, ArrowRight, Activity, FileText, Briefcase, MapPin, UserPlus, FilePlus } from 'lucide-react';
import { PatientData, DoctorSettings } from '../types';

interface PatientModalProps {
  isOpen: boolean;
  onSubmit: (data: PatientData) => void;
  settings?: DoctorSettings; // Configurações para saber quais campos mostrar
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onSubmit, settings }) => {
  const [formData, setFormData] = useState<PatientData>({
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

  // Load visible fields from settings or use defaults
  const visible = settings?.visiblePatientFields || {
    document: true,
    profession: true,
    insurance: true,
    address: true,
    indicatedBy: true,
    requestedBy: true
  };

  const customFields = settings?.customPatientFields || [];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("O nome do paciente é obrigatório.");
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customValues: {
        ...prev.customValues,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-blue-700 p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-inner shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Novo Exame</h2>
            <p className="text-blue-100 text-sm">Identificação Completa do Paciente</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Coluna 1: Dados Principais Obrigatórios */}
            <div className="space-y-4">
               <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                  placeholder="Nome do paciente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    Idade
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Anos"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    Sexo
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {visible.document && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Documento (RG/CPF)
                  </label>
                  <input
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Opcional"
                  />
                </div>
              )}

              {visible.insurance && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-600" />
                    Convênio / Plano
                  </label>
                  <input
                    type="text"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Ex: Unimed, Particular"
                  />
                </div>
              )}
            </div>

            {/* Coluna 2: Dados Complementares e Customizados */}
            <div className="space-y-4">
              
              {visible.profession && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-500" />
                    Profissão
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Opcional"
                  />
                </div>
              )}

              {visible.address && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-500" />
                    Cidade / Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Ex: São Paulo - SP"
                  />
                </div>
              )}

              {visible.indicatedBy && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserPlus size={16} className="text-slate-500" />
                    Referenciado por (Indicação)
                  </label>
                  <input
                    type="text"
                    name="indicatedBy"
                    value={formData.indicatedBy}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Nome do colega / Indicação"
                  />
                </div>
              )}

              {visible.requestedBy && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-slate-500" />
                    Solicitado por
                  </label>
                  <input
                    type="text"
                    name="requestedBy"
                    value={formData.requestedBy}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder="Médico solicitante"
                  />
                </div>
              )}

              {/* CAMPOS PERSONALIZADOS */}
              {customFields.map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FilePlus size={16} className="text-slate-500" />
                    {field}
                  </label>
                  <input
                    type="text"
                    value={formData.customValues?.[field] || ''}
                    onChange={(e) => handleCustomChange(field, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                    placeholder={field}
                  />
                </div>
              ))}
            </div>

          </div>

          <div className="pt-8 flex flex-col items-center">
            <button
              type="submit"
              className="w-full md:w-2/3 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>Iniciar Exame</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Uma pasta será criada automaticamente para este paciente com a data de hoje.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PatientModal;

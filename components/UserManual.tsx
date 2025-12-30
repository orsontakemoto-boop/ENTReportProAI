
import React from 'react';
import { X, Camera, Mic, Wand2, FileText, Settings, Video, Download, Printer, Layers, Crop, Keyboard, Activity, Sparkles, FileCheck, AlertTriangle, ScanFace, Zap, Type, Check, Key } from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20">

        {/* Header - Spielberg Style */}
        <div className="bg-[#020617] text-white p-8 flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase">Manual do <span className="text-cyan-400">Usuário</span></h2>
              <p className="text-slate-400 text-xs font-bold tracking-[0.3em] uppercase opacity-70">ENT Report Pro AI • v3.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all border border-white/10 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-10 space-y-16 bg-slate-50/50 thin-scrollbar">

          {/* SECTION: API KEY EXPLANATION (NEW) */}
          <section className="bg-gradient-to-br from-purple-700 to-indigo-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group mb-8 border border-white/10">
            <div className="absolute -right-10 -top-10 text-white/5 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11V7a5 5 0 0 1 10 0v4h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1zm3-4a2 2 0 0 0-2 2v4h8V7a2 2 0 0 0-2-2h-4z" /></svg>
            </div>
            <h3 className="text-2xl font-black mb-4 flex items-center gap-3 uppercase tracking-wider relative z-10">
              <span className="bg-white/20 p-2 rounded-lg"><Key size={24} className="text-purple-200" /></span>
              Configuração Essencial: Chave de IA
            </h3>
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10 relative z-10">
              <h4 className="font-bold text-purple-200 mb-2 uppercase tracking-wide text-sm">Por que eu preciso de uma chave?</h4>
              <p className="text-white/90 leading-relaxed mb-4 text-sm">
                Para garantir <strong>privacidade total</strong> e evitar interrupções no serviço, o ENT Report Pro AI adotou o modelo <em>"Bring Your Own Key"</em> (Traga Sua Própria Chave).
              </p>
              <ul className="space-y-2 mb-6 text-sm text-purple-100">
                <li className="flex gap-2 items-center"><Check size={16} className="text-green-400" /> <span>Você não depende de cotas compartilhadas com outros médicos.</span></li>
                <li className="flex gap-2 items-center"><Check size={16} className="text-green-400" /> <span>O serviço é <strong>Gratuito</strong> para uso pessoal moderado no Google AI Studio.</span></li>
                <li className="flex gap-2 items-center"><Check size={16} className="text-green-400" /> <span>Sua chave fica salva apenas no <strong>SEU computador</strong>.</span></li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/10">
                  <span className="block text-xs font-bold text-purple-300 uppercase mb-1">Passo 1</span>
                  <span className="text-sm">Gere sua chave em <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-bold hover:text-white">aistudio.google.com</a></span>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/10">
                  <span className="block text-xs font-bold text-purple-300 uppercase mb-1">Passo 2</span>
                  <span className="text-sm">Abra <strong>Configurações</strong> no menu do app e cole a chave na seção de IA.</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: SUPER DICA DE PRODUTIVIDADE */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Zap size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 flex items-center gap-3 uppercase tracking-wider">
                <Zap className="text-cyan-300 animate-pulse" />
                Dica de Ouro: Exame "Mãos Livres"
              </h3>
              <p className="text-blue-50 text-lg leading-relaxed mb-6 max-w-3xl">
                Otimize seu tempo ao máximo: <strong>Ligue o microfone de ditado simultaneamente à gravação do exame.</strong>
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                  <h4 className="font-bold text-cyan-300 mb-2">Como funciona?</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Enquanto você realiza a endoscopia e grava o vídeo (F9), clique no ícone do microfone no campo de "Achados". Vá descrevendo as estruturas em tempo real.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                  <h4 className="font-bold text-cyan-300 mb-2">O Resultado</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Ao terminar o exame e parar a gravação, a descrição textual já estará pronta. Basta um clique em "Refinar com IA" para finalizar o laudo em segundos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Formatação */}
          <section>
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 border-b-2 pb-3 border-slate-200 uppercase tracking-widest">
              <Type className="text-blue-600" /> 1. O Poder do Negrito no Impresso
            </h3>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
              <p className="text-slate-600 mb-6 leading-relaxed">
                Para que seu laudo seja profissional e fácil de ler na impressão, utilize a marcação de negrito para destacar termos importantes ou subtópicos.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">No Editor</h4>
                  <div className="bg-slate-900 text-cyan-400 p-6 rounded-2xl font-mono text-sm shadow-inner">
                    **Septo Nasal:** Desvio para a esquerda.<br />
                    **Cornetos:** Hipertróficos e pálidos.<br />
                    **Conclusão:** Rinite Alérgica.
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Na Impressão</h4>
                  <div className="bg-white border p-6 rounded-2xl text-slate-900 text-sm shadow-md italic">
                    <strong className="font-bold">Septo Nasal:</strong> Desvio para a esquerda.<br />
                    <strong className="font-bold">Cornetos:</strong> Hipertróficos e pálidos.<br />
                    <strong className="font-bold">Conclusão:</strong> Rinite Alérgica.
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-slate-500 font-medium italic">
                Dica: A IA de refinamento preserva automaticamente todos os seus negritos.
              </p>
            </div>
          </section>

          {/* Section: Captura */}
          <section>
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 border-b-2 pb-3 border-slate-200 uppercase tracking-widest">
              <Camera className="text-blue-600" /> 2. Captura Avançada
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-all group">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <h4 className="font-black text-slate-800 mb-2 uppercase text-sm tracking-tighter">Foto Digital (F8)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Captura com remoção automática de bordas pretas (Auto-Crop). O sistema foca no que importa: a imagem endoscópica.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-all group">
                <div className="bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Video size={24} />
                </div>
                <h4 className="font-black text-slate-800 mb-2 uppercase text-sm tracking-tighter">Vídeo HD (F9)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gravação nativa. Clique curto para Pausar/Retomar. Segure por 1 segundo para finalizar e salvar automaticamente no HD.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-all group">
                <div className="bg-amber-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <h4 className="font-black text-slate-800 mb-2 uppercase text-sm tracking-tighter">Burst (Segurar F8)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sequência de fotos em alta velocidade. Essencial para criar Videokimografias detalhadas no editor de mosaico.
                </p>
              </div>
            </div>
          </section>

          {/* Section: AI & Reports */}
          <section>
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 border-b-2 pb-3 border-slate-200 uppercase tracking-widest">
              <Wand2 className="text-blue-600" /> 3. Inteligência Artificial
            </h3>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Sparkles size={60} className="text-cyan-400" />
                </div>
                <h4 className="font-black text-xl mb-4 flex items-center gap-2 text-cyan-400 uppercase tracking-tighter">
                  <Wand2 size={22} /> Refinador de Laudos
                </h4>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  Nossa IA não substitui o médico, ela atua como um secretário acadêmico. Ela entende abreviações médicas e as transforma em textos elegantes.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-white/5 p-3 rounded-xl">
                    <Check size={14} className="text-green-400" /> Melhora gramática e concordância
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-white/5 p-3 rounded-xl">
                    <Check size={14} className="text-green-400" /> Expande termos técnicos
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-white/5 p-3 rounded-xl">
                    <Check size={14} className="text-green-400" /> Mantém sua estrutura de tópicos
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex flex-col justify-center">
                <h4 className="font-black text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                  <Mic size={22} className="text-red-500" /> Ditado Contínuo
                </h4>
                <p className="text-sm text-indigo-800 leading-relaxed mb-4">
                  O sistema de ditado agora é <strong>Contínuo</strong>. Ele não desliga automaticamente.
                </p>
                <ul className="space-y-3 text-xs text-indigo-700 font-medium">
                  <li className="flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                    <span>Fale naturalmente enquanto opera o paciente.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                    <span>O sistema insere o texto onde o cursor estiver posicionado.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                    <span>Clique no botão novamente para encerrar a escuta.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Shortcuts */}
          <section className="pb-10">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 border-b-2 pb-3 border-slate-200 uppercase tracking-widest">
              <Keyboard className="text-blue-600" /> Comandos Rápidos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'F8', action: 'Captura / Burst', color: 'border-blue-200 text-blue-600' },
                { key: 'F9', action: 'Vídeo / Pausa', color: 'border-red-200 text-red-600' },
                { key: 'F10', action: 'Tela Cheia', color: 'border-slate-200 text-slate-600' },
                { key: 'ESC', action: 'Fechar / Sair', color: 'border-slate-200 text-slate-400' },
              ].map((item) => (
                <div key={item.key} className={`bg-white border-2 ${item.color} p-6 rounded-3xl text-center shadow-sm hover:scale-105 transition-transform`}>
                  <span className="block text-3xl font-black mb-1">{item.key}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.action}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 p-8 border-t border-white/5 flex justify-between items-center shrink-0 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none"></div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] relative z-10">
            Desenvolvido para Excelência Clínica • 2024
          </div>
          <div className="flex gap-4 relative z-10">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white font-bold text-xs tracking-widest transition-all uppercase"
            >
              <Printer size={16} />
              Imprimir Guia
            </button>
            <button
              onClick={onClose}
              className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-2xl font-black text-xs tracking-[0.2em] transition-all uppercase shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;

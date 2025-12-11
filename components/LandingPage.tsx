
import React from 'react';
import { 
  ArrowRight, 
  BrainCircuit, 
  Video, 
  Activity, 
  Layers, 
  Play,
  Mic,
  Sparkles,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { DoctorSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface LandingPageProps {
  onEnterApp: () => void;
  settings: DoctorSettings;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, settings }) => {
  
  const scrollToShowcase = () => {
    const element = document.getElementById('showcase-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // DEVELOPER NOTE: Images are now hardcoded in constants.ts (DEFAULT_SETTINGS).
  // This ignores user settings for these specific images to allow developer control.
  const heroImage = DEFAULT_SETTINGS.landingHeroImage;
  const showcaseImage = DEFAULT_SETTINGS.landingShowcaseImage;

  return (
    <div className="h-screen w-full bg-white font-inter text-slate-900 overflow-y-auto overflow-x-hidden scroll-smooth">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">ENT Report Pro AI</h1>
              <span className="text-xs text-blue-600 font-bold tracking-wider uppercase">Medical Systems</span>
            </div>
          </div>
          <button 
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2"
          >
            Acessar Sistema <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="relative z-10 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-indigo-100">
              <Sparkles size={16} />
              Nova IA de Visão Computacional Generativa
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              A Revolução do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Laudo Médico</span>.
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              Ditado inteligente que segue seu cursor, imagens endoscópicas aprimoradas em HD e laudos escritos por IA. A tecnologia mais avançada para Otorrinolaringologistas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onEnterApp}
                className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Iniciar Exame Agora
              </button>
              <button 
                onClick={scrollToShowcase}
                className="px-8 py-4 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} className="text-blue-600" /> Ver Consultório
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                   <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover"/>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                   <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover"/>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                   <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover"/>
                </div>
              </div>
              <p>Tecnologia validada por especialistas.</p>
            </div>
          </div>

          {/* Hero Image (Foto 1: Médico) */}
          <div className="relative lg:h-[600px] w-full animate-in slide-in-from-right duration-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-400/20 rounded-[3rem] transform rotate-3 scale-95 blur-2xl"></div>
            
            <img 
              src={heroImage} 
              alt="Médico Otorrino" 
              className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl border-8 border-white"
            />
            
            {/* Floating Card - Image AI */}
            <div className="absolute top-10 -right-4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs animate-pulse duration-[4000ms]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Restauro de Imagem</p>
                  <p className="text-xs text-slate-500">Padrão → Ultra HD (0.5s)</p>
                </div>
              </div>
            </div>

            {/* Floating Card - Dictation */}
            <div className="absolute bottom-10 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs animate-bounce duration-[3000ms]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <Mic size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ditado Ativo</p>
                  <p className="text-xs text-slate-500">Transcrevendo em tempo real...</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* --- SHOWCASE SECTION (Foto 2: Consultório) --- */}
      <section id="showcase-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-16 relative overflow-hidden shadow-2xl">
             {/* Background Pattern */}
             <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                </svg>
             </div>

             <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="order-2 lg:order-1">
                   <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Seu Consultório. <br/>Digitalizado e Eficiente.</h2>
                   <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                     Uma estação de trabalho completa que se integra ao seu equipamento de endoscopia existente. Capture, edite e laude diretamente no navegador, com a segurança de que seus dados permanecem locais.
                   </p>
                   <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3 text-slate-200">
                        <div className="bg-green-500/20 p-1 rounded-full"><Activity size={16} className="text-green-400"/></div>
                        Compatível com qualquer placa de captura USB.
                      </li>
                      <li className="flex items-center gap-3 text-slate-200">
                        <div className="bg-blue-500/20 p-1 rounded-full"><Video size={16} className="text-blue-400"/></div>
                        Interface otimizada para "Split Screen" (Vídeo + Texto).
                      </li>
                      <li className="flex items-center gap-3 text-slate-200">
                        <div className="bg-purple-500/20 p-1 rounded-full"><BrainCircuit size={16} className="text-purple-400"/></div>
                        Assistência de IA em tempo real.
                      </li>
                   </ul>
                   <button onClick={onEnterApp} className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                     Experimentar Agora
                   </button>
                </div>
                
                {/* Foto 2: Notebook e Equipamento */}
                <div className="order-1 lg:order-2 relative h-[400px] rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl group">
                   <img 
                     src={showcaseImage} 
                     alt="Mesa de consultório médico" 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none"></div>
                   <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <Settings size={14} className="text-blue-400" /> Workstation Pro
                      </p>
                      <p className="text-xs text-slate-300">Ambiente integrado de captura e laudo.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Poder Total no seu Navegador</h2>
            <p className="text-lg text-slate-600">
              Uma suíte completa de ferramentas diagnósticas que substitui softwares caros e complexos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Dictation (NEW) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-red-100 transition-all group">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <Mic size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ditado Inteligente</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Esqueça o teclado. O cursor segue sua voz e permite navegar pelo texto enquanto dita. Pausa automática após 4s de silêncio.
              </p>
            </div>

            {/* Feature 2: Image AI (NEW) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Aprimoramento Visual IA</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Eleve a resolução de qualquer equipamento. Elimine ruídos e granulações, obtendo nitidez comparável a sistemas de vídeo de alta performance.
              </p>
            </div>

            {/* Feature 3: Text AI */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-violet-100 transition-all group">
              <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Redator Médico AI</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Digite tópicos soltos e veja a IA reescrever seus achados em linguagem médica culta, formal e elegante instantaneamente.
              </p>
            </div>

            {/* Feature 4: Capture */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Video size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Captura HD & Burst</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Vídeos com áudio e sequências de fotos (Burst) a 60fps. Perfeito para capturar o ciclo glótico em detalhes.
              </p>
            </div>

            {/* Feature 5: LaringoAI */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-100 transition-all group">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">LaringoAI™ Integration</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Conexão nativa com LaringoAI para análise estroboscópica automatizada de frequência, amplitude e simetria.
              </p>
            </div>

            {/* Feature 6: Kimography */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-teal-100 transition-all group">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <Layers size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Videokimografia Digital</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Crie mosaicos panorâmicos e tiras de tempo (kymograms) a partir de seus vídeos com nosso editor exclusivo.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-4 text-slate-500">Desenvolvido com tecnologia de ponta para Otorrinolaringologia.</p>
          <p className="text-sm">© 2024 ENT Report Pro AI - Dr. Orson Norio Takemoto</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

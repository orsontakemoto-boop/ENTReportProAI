import React from 'react';
import { 
  ArrowRight, 
  BrainCircuit, 
  Video, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Layers, 
  CheckCircle2,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  
  const scrollToShowcase = () => {
    const element = document.getElementById('showcase-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    // FIX: Alterado de min-h-screen para h-screen overflow-y-auto para permitir scroll independente
    // já que o body global tem overflow: hidden
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
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="relative z-10 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-100">
              <BrainCircuit size={16} />
              Potencializado por Google Gemini AI
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              O Futuro do Laudo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Otorrino</span>.
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              Captura de vídeo HD, Videokimografia Digital e Inteligência Artificial para laudos perfeitos em segundos. Tudo em uma única tela, rodando direto no seu navegador.
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
                <Play size={20} className="text-blue-600" /> Ver Demonstração
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Dra" className="w-full h-full object-cover"/>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" alt="Dr" className="w-full h-full object-cover"/>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Dra" className="w-full h-full object-cover"/>
                </div>
              </div>
              <p>Usado por especialistas em todo o Brasil.</p>
            </div>

            {/* Laringo AI Integration Highlight */}
            <div className="mt-8 bg-violet-50 p-4 rounded-xl border border-violet-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
               <div className="w-12 h-12 bg-violet-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-violet-200">
                  <Activity size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-violet-900 text-sm">Integração LaringoAI Nativa</h3>
                  <p className="text-xs text-violet-700 mt-1">
                    Análise automática de vibração e simetria das pregas vocais em laringoestroboscopias.
                  </p>
               </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:h-[600px] w-full animate-in slide-in-from-right duration-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-teal-400/20 rounded-[3rem] transform rotate-3 scale-95 blur-2xl"></div>
            {/* Imagem da Médica Otorrino em frente ao Notebook */}
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Médica Otorrino em consultório usando notebook" 
              className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl border-8 border-white"
            />
            
            {/* Floating Card */}
            <div className="absolute bottom-10 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs animate-bounce duration-[3000ms]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Laudo Finalizado</p>
                  <p className="text-xs text-slate-500">Refinado com IA em 0.4s</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Tecnologia de Ponta para seu Consultório</h2>
            <p className="text-lg text-slate-600">
              O ENT Report Pro AI substitui softwares complexos e caros por uma solução leve, moderna e focada na rotina do Otorrinolaringologista.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Video size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Captura HD & Burst</h3>
              <p className="text-slate-600 leading-relaxed">
                Grave vídeos em alta definição e capture sequências de fotos (Burst) a 60fps para não perder nenhum detalhe da fonação.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">IA Generativa</h3>
              <p className="text-slate-600 leading-relaxed">
                Digite tópicos soltos e deixe o Google Gemini reescrever seus achados em linguagem médica culta e formal instantaneamente.
              </p>
            </div>

            {/* Feature LaringoAI */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-violet-100 hover:shadow-xl hover:border-violet-300 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">NOVO</div>
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">LaringoAI™ Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                Conexão direta com a ferramenta de análise estroboscópica. Detecta frequência fundamental, amplitude e simetria automaticamente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <Layers size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Videokimografia Digital</h3>
              <p className="text-slate-600 leading-relaxed">
                Crie mosaicos panorâmicos das pregas vocais automaticamente a partir de vídeos, com alinhamento e recorte inteligente.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Laudos em PDF</h3>
              <p className="text-slate-600 leading-relaxed">
                Geração de PDF A4 nativa, com cabeçalho personalizado, assinatura digital e QR Code para o paciente acessar o vídeo do exame.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">100% Local e Seguro</h3>
              <p className="text-slate-600 leading-relaxed">
                Seus dados não vão para a nuvem. Vídeos e fotos são salvos diretamente no seu HD, garantindo privacidade total e conformidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SHOWCASE SECTION --- */}
      <section id="showcase-section" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-16 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600 rounded-full blur-[120px] opacity-20"></div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                  Interface Intuitiva.<br/>Fluxo de Trabalho Fluido.
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Esqueça as janelas pop-up e menus confusos. Nossa interface "Split View" coloca o editor de laudos e a captura de vídeo lado a lado. Você examina, captura e lauda simultaneamente.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-slate-900 font-bold text-xs">✓</div>
                    Reconhecimento de Voz para Ditado
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-slate-900 font-bold text-xs">✓</div>
                    Templates Anatômicos Pré-configurados
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-slate-900 font-bold text-xs">✓</div>
                    Recorte Automático de Imagens Endoscópicas
                  </li>
                </ul>
                <button 
                  onClick={onEnterApp}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                >
                  Experimentar Agora
                </button>
              </div>
              
              <div className="relative">
                 <img 
                   src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070" 
                   alt="Interface do sistema em consultório" 
                   className="rounded-2xl shadow-2xl border-4 border-slate-700 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500"
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600" />
            <span className="font-bold text-slate-900">ENT Report Pro AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Desenvolvido para a Excelência Médica.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Termos</a>
            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacidade</a>
            <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
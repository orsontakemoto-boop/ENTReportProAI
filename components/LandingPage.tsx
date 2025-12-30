
import React from 'react';
import { ArrowRight, Sparkles, Activity } from 'lucide-react';
import { DoctorSettings } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  settings: DoctorSettings;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="h-screen w-full bg-[#010409] font-inter text-white overflow-hidden flex items-center justify-center relative">
      
      {/* --- ATMOSFERA SPIELBERG AI (LIGHTS & PARTICLES) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Luzes Volumétricas em Movimento (Orbs) */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full blur-[160px] animate-float-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-indigo-900/30 rounded-full blur-[180px] animate-float-reverse"></div>
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-500/15 rounded-full blur-[140px] animate-float-mid"></div>
        
        {/* Partículas / Bokeh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping-slow shadow-[0_0_10px_white]"></div>
          <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping-slow delay-700 shadow-[0_0_12px_cyan]"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping-slow delay-1000 shadow-[0_0_8px_blue]"></div>
          <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white rounded-full animate-ping-slow delay-300 shadow-[0_0_10px_white]"></div>
        </div>

        {/* Anamorphic Lens Flare Line (Assinatura Spielberg) */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)] rotate-[-1deg]"></div>
        <div className="absolute top-[48%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.3)] rotate-[0.5deg]"></div>

        {/* Noise/Grain para Textura Cinematográfica */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- CONTEÚDO CENTRAL --- */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        
        {/* Portal de Entrada / Logo Icon */}
        <div className="mb-14 animate-in fade-in zoom-in duration-1000">
          <div className="relative group">
             {/* Glow Externo */}
             <div className="absolute inset-[-20px] bg-blue-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
             
             {/* Container do Ícone */}
             <div className="relative w-24 h-24 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <Activity size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
                
                {/* Linha de scan passando pelo ícone */}
                <div className="absolute inset-0 w-full h-1 bg-cyan-400/20 shadow-[0_0_10px_cyan] translate-y-[-100%] animate-scan"></div>
             </div>
          </div>
        </div>

        {/* Título com Efeito de Luz */}
        <div className="space-y-6 mb-20 animate-in slide-in-from-bottom-12 duration-1000">
          <div className="relative">
            <h1 className="text-4xl md:text-7xl font-black tracking-[0.25em] uppercase leading-tight">
              ENT REPORT 
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                PRO AI
              </span>
            </h1>
            {/* Shimmer effect on text */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] translate-x-[-150%] animate-shimmer-text"></div>
          </div>
          
          <div className="flex items-center justify-center gap-4 opacity-60">
             <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
             <p className="text-[10px] md:text-xs font-medium tracking-[0.6em] text-cyan-100/70 uppercase">
               Advanced Surgical Documentation & Analysis
             </p>
             <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </div>

        {/* Botão de Início "Glow Energy" */}
        <div className="animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <button 
            onClick={onEnterApp}
            className="group relative px-16 py-6 bg-white text-slate-950 rounded-full font-black text-xl tracking-[0.2em] transition-all hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_70px_rgba(34,211,238,0.4)] flex items-center gap-5 overflow-hidden"
          >
            {/* Aura de energia interna */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/0 via-cyan-400/20 to-cyan-200/0 translate-x-[-200%] group-hover:animate-shimmer duration-[2000ms]"></div>
            
            <span className="relative z-10">INICIAR EXAME</span>
            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
            
            {/* Border glow sutil */}
            <div className="absolute inset-0 rounded-full border border-white/50 group-hover:border-cyan-400 transition-colors"></div>
          </button>
        </div>

        {/* Footer Tagline */}
        <div className="mt-32 flex items-center gap-3 text-slate-500 animate-in fade-in duration-1000 delay-1000">
          <Sparkles size={16} className="text-cyan-500/40 animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.4em] font-semibold opacity-40">Precision AI Computer Vision Protocol</span>
          <div className="w-1 h-1 bg-cyan-500/30 rounded-full"></div>
          <span className="text-[9px] uppercase tracking-[0.4em] font-semibold opacity-40">v3.0 Secure Node</span>
        </div>
      </div>

      {/* --- ESTILOS DE ANIMAÇÃO PERSONALIZADOS --- */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(5%, 5%) scale(1.1); opacity: 0.3; }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.3; }
          50% { transform: translate(-5%, -5%) scale(1); opacity: 0.2; }
        }
        @keyframes float-mid {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(-3%, 8%) scale(1.2); opacity: 0.25; }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes shimmer-text {
          0% { transform: translateX(-150%) skewX(-20deg); }
          20%, 100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(2400%); opacity: 0; }
        }
        
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 18s ease-in-out infinite; }
        .animate-float-mid { animation: float-mid 12s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 4s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-shimmer-text { animation: shimmer-text 8s infinite; }
        .animate-scan { animation: scan 3s linear infinite; }

        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default LandingPage;

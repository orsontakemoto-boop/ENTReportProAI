
import React from 'react';
import { X, Camera, Mic, Wand2, FileText, Settings, Video, Download, Printer, Layers, Crop, Keyboard, Activity, Sparkles, FileCheck, AlertTriangle, ScanFace } from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Manual do Usuário</h2>
              <p className="text-slate-400 text-sm">ENT Report Pro AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-slate-50">
          
          {/* Section 1: Workflow */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2 border-slate-200">
              <Settings className="text-blue-600" /> 1. Configuração Inicial
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Dados e Armazenamento</h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Antes de começar, clique na engrenagem (Configurações). É <b>obrigatório</b> selecionar uma pasta local para salvar os vídeos.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 rounded">Passo 1</span> Selecione a pasta de destino.</li>
                  <li className="flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 rounded">Passo 2</span> Carregue seu logotipo e assinatura.</li>
                  <li className="flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 rounded">Passo 3</span> Configure cores, fontes e layout.</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Segurança Local</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Este sistema segue o princípio <i>Local-First</i>. Seus vídeos e dados de pacientes <b>nunca</b> são enviados para a nuvem. Tudo fica salvo no seu HD, na pasta que você escolheu.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Capture */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2 border-slate-200">
              <Camera className="text-blue-600" /> 2. Captura de Imagem e Vídeo
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg"><Camera size={20}/></div>
                  <span className="font-bold text-slate-800">Foto Única (F8)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Captura instantânea. O sistema aplica recorte automático (Auto-Crop) para remover bordas pretas circulares do endoscópio.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-red-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-600 text-white p-2 rounded-lg"><Video size={20}/></div>
                  <span className="font-bold text-slate-800">Vídeo (F9)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Grava vídeo HD com áudio. O arquivo é salvo automaticamente no disco ao parar. Clique curto pausa/retoma, clique longo para.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-500 text-white p-2 rounded-lg"><Layers size={20}/></div>
                  <span className="font-bold text-slate-800">Burst (Segurar F8)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Captura sequencial de alta velocidade (até 60fps). Cria uma subpasta com todas as fotos. Ideal para estroboscopia.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: AI & Reports */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2 border-slate-200">
              <Wand2 className="text-blue-600" /> 3. Inteligência Artificial e Laudos
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* REFINAMENTO DE TEXTO */}
              <div className="bg-violet-50 p-6 rounded-xl border border-violet-100">
                <h4 className="font-bold text-violet-900 flex items-center gap-2 mb-3">
                  <Wand2 size={18} /> Refinamento de Texto (Gemini)
                </h4>
                <p className="text-sm text-violet-800 mb-4">
                  Digite tópicos rápidos e soltos no campo de achados (ex: "septo desvio dir, cornetos hipertrofia"). 
                  Clique em <b>"Refinar com IA"</b> e o sistema reescreverá tudo em linguagem médica formal.
                </p>
                <div className="bg-white p-3 rounded border border-violet-200 text-xs font-mono text-slate-600">
                  Antes: "pregas vocais movem bem, fenda triangular"<br/>
                  Depois: "Pregas vocais com mobilidade preservada e simétrica. Observa-se fenda glótica triangular posterior à fonação."
                </div>
              </div>

              {/* DITADO INTELIGENTE */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Mic size={18} className="text-red-500"/> Ditado Inteligente & Contínuo</h4>
                 <ul className="space-y-3 text-sm text-slate-600">
                   <li className="flex gap-2">
                     <span className="font-bold text-slate-800 shrink-0">1. Cursor Dinâmico:</span>
                     <span>O texto é inserido exatamente onde o cursor está piscando. Você pode clicar em outro parágrafo enquanto fala, e o ditado acompanhará a mudança de posição instantaneamente.</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="font-bold text-slate-800 shrink-0">2. Auto-Stop (Economia):</span>
                     <span>Se houver silêncio total ou se você parar de mexer o mouse/teclado por <b>4 segundos</b>, o microfone desliga sozinho para evitar erros.</span>
                   </li>
                 </ul>
              </div>
            </div>

            {/* APRIMORAMENTO DE IMAGEM */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mt-6 relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3 text-lg">
                    <Sparkles size={20} /> Aprimoramento de Imagem: IA Generativa vs. Tradicional
                 </h4>
                 
                 <p className="text-sm text-indigo-800 mb-6 leading-relaxed">
                   O ENT Report Pro utiliza <b>Visão Computacional Generativa (Google Gemini Vision)</b>. É fundamental entender a diferença clínica entre este método e corretores de imagem comuns.
                 </p>

                 <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm">
                       <div className="flex items-center gap-2 mb-2 text-slate-500">
                          <Settings size={16} /> <span className="font-bold text-xs uppercase">Corretor Tradicional (Filtros)</span>
                       </div>
                       <p className="text-xs text-slate-600 leading-relaxed">
                         Aplica fórmulas matemáticas simples (aumentar contraste, "Sharpen"). Isso frequentemente <b>aumenta o ruído (granulação)</b> e cria bordas artificiais, sem entender o que é tecido e o que é artefato.
                       </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border-2 border-indigo-500 shadow-md relative">
                       <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">ENT Pro AI</div>
                       <div className="flex items-center gap-2 mb-2 text-indigo-700">
                          <ScanFace size={16} /> <span className="font-bold text-xs uppercase">IA Generativa (Gemini)</span>
                       </div>
                       <p className="text-xs text-slate-700 leading-relaxed font-medium">
                         A IA "olha" para a imagem e reconhece estruturas anatômicas (vasos, mucosa, pregas). Ela <b>reconstrói</b> os pixels perdidos pelo desfoque da fibra óptica baseando-se em milhões de exemplos médicos, criando uma imagem de alta definição "provável".
                       </p>
                    </div>
                 </div>

                 <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-800 text-sm mb-1">Implicação Ética e Diagnóstica</h5>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Como a IA reconstrói detalhes, existe uma pequena margem de "alucinação" (criar um detalhe que não existe) ou suavização excessiva de uma lesão real. 
                        <br/><br/>
                        <b>Recomendação:</b> Use o recurso para melhorar a documentação visual para o paciente, mas <b>sempre mantenha a imagem original</b> (o sistema cria uma cópia ao lado) para fins legais e diagnóstico definitivo.
                      </p>
                    </div>
                 </div>
               </div>
            </div>

            {/* VIDEOKIMOGRAFIA */}
            <div className="mt-6">
               <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Crop size={16}/> Videokimografia Digital (Mosaico)</h4>
               <p className="text-sm text-slate-600 mb-3">
                 Acesse o histórico de Burst (pilha de ícones) e abra o Editor. Gire a imagem, corte a glote e gere um mosaico panorâmico automático.
               </p>
               <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <strong className="flex items-center gap-1 mb-1 text-slate-900"><Sparkles size={12}/> Dica Avançada:</strong>
                  Faça um corte transversal da glote com altura mínima (1px) e organize em 1 coluna para um efeito semelhante à <b>videokimografia com câmera ultra-rápida</b>.
               </div>
            </div>
          </section>

          {/* Section 4: Finalization (PDF/Print) */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2 border-slate-200">
              <FileCheck className="text-blue-600" /> 4. Finalização e PDF
            </h3>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                <Printer size={18} /> Como Salvar em PDF?
              </h4>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                Para garantir a máxima fidelidade de formatação e compatibilidade, o sistema utiliza a impressora nativa do seu sistema operacional.
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 font-medium">
                <li>Clique no botão azul <b>Imprimir</b> (Ícone de Impressora) no topo da tela.</li>
                <li>Na janela que abrir, em "Destino" ou "Impressora", selecione a opção <b>"Salvar como PDF"</b> ou <b>"Microsoft Print to PDF"</b>.</li>
                <li>Clique em <b>Salvar</b> e escolha onde deseja guardar o arquivo final.</li>
              </ol>
            </div>
          </section>

          {/* Section 5: Shortcuts */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-2 border-slate-200">
              <Keyboard className="text-blue-600" /> Atalhos de Teclado
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-blue-400 mb-1">F8</span>
                 <span className="text-xs uppercase tracking-wider">Foto</span>
               </div>
               <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-red-400 mb-1">F9</span>
                 <span className="text-xs uppercase tracking-wider">Gravar</span>
               </div>
               <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-slate-400 mb-1">F10</span>
                 <span className="text-xs uppercase tracking-wider">Tela Cheia</span>
               </div>
               <div className="bg-slate-800 text-white p-4 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-slate-400 mb-1">ESC</span>
                 <span className="text-xs uppercase tracking-wider">Sair</span>
               </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">* Os atalhos podem ser personalizados nas configurações.</p>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-6 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500 font-medium">
             Desenvolvido por <span className="text-slate-700 font-bold">Dr. Orson Norio Takemoto</span><br/>
             CRM: 13.716-PR
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
            >
              <Printer size={18} />
              Imprimir Manual
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;

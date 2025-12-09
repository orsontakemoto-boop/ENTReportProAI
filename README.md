# ENT Report Pro AI 🩺🤖

> **O Sistema Definitivo para Otorrinolaringologia: Captura, Laudo e IA.**

**ENT Report Pro AI** é uma Single Page Application (SPA) de alta performance projetada para médicos otorrinolaringologistas. O sistema integra captura de vídeo em tempo real, documentação fotográfica avançada (incluindo videokimografia digital), inteligência artificial generativa para refino de textos e total privacidade de dados com armazenamento local.

![ENT Report Pro AI Banner](https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

---

## 🌟 Principais Diferenciais

*   **100% Client-Side:** Roda diretamente no navegador (Chrome/Edge). Seus vídeos e dados de pacientes **nunca** são enviados para nuvem de terceiros.
*   **Google Gemini AI:** Transforma tópicos rápidos em laudos médicos formais e elegantes em segundos.
*   **Videokimografia Digital:** Editor manual avançado para criar mosaicos panorâmicos das pregas vocais a partir de vídeos (Burst), com correção de rotação, recorte preciso e modo "Câmera Ultra-Rápida".
*   **Integração LaringoAI:** Conexão nativa para análise estroboscópica avançada via IA externa.
*   **Captura Inteligente:** Algoritmos de visão computacional (Auto-Crop Radial) removem automaticamente as bordas pretas de imagens endoscópicas circulares.

---

## 🚀 Instalação e Execução

Este projeto foi construído com React, TypeScript e Vite.

### Pré-requisitos
*   Node.js (v18+)
*   Navegador Google Chrome ou Microsoft Edge (Desktop)

### Como rodar
1.  Clone o repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Acesse `http://localhost:5173` no seu navegador.

---

## 📖 Manual de Operação Detalhado

### 1. Configuração Inicial ⚙️
Ao acessar o sistema pela primeira vez, clique na engrenagem no canto superior esquerdo:
1.  **Dados Profissionais:** Preencha o nome da clínica, subtítulo, endereço, telefone, logo e carregue sua assinatura digital (o sistema remove o fundo branco automaticamente).
2.  **Armazenamento (CRÍTICO):** Selecione uma pasta local no seu computador (ex: `C:\MeusExames`). O navegador pedirá permissão de escrita. Todos os arquivos serão salvos lá, organizados em pastas `AAAA-MM-DD_NomePaciente`.
3.  **Inteligência Artificial:** Insira sua **API Key do Google Gemini** para habilitar o botão "Refinar Texto".
4.  **Visual:** Escolha o tema de cores (Azul, Teal, Slate), fonte tipográfica e posição do logotipo.
5.  **Câmera:** O sistema detecta automaticamente a melhor câmera. Você pode ativar/desativar o "Auto-Crop" (recorte automático de bordas).

### 2. Fluxo de Atendimento
1.  **Novo Exame:** Clique no botão verde (+) ou inicie o app. Insira os dados obrigatórios do paciente (Nome, Idade, Sexo). Uma pasta de sessão será criada automaticamente.
2.  **Captura de Imagem e Vídeo:**
    *   **FOTO (F8):** Captura instantânea. Se o Auto-Crop estiver ligado, remove bordas pretas. Uma cópia RAW (original) é salva na pasta.
    *   **BURST (Segurar F8):** Captura sequencial em alta velocidade (configurável até 60fps). Cria uma subpasta "BURST" dentro da pasta do paciente.
    *   **VÍDEO (F9):** Grava o exame com áudio. Ao parar, o arquivo MP4/WebM já está salvo no disco.
3.  **Preenchimento do Laudo:**
    *   **Templates:** Selecione o tipo de exame (Nasofibro, Laringo, etc.) para carregar um esqueleto anatômico.
    *   **Ditado:** Use o ícone de microfone para ditar achados.
    *   **IA Generativa:** Digite tópicos soltos (ex: "septo desvio dir, cornetos hipertrofia") e clique em **"Refinar com IA"**. O texto será reescrito em linguagem médica formal.
    *   **LaringoAI:** Se selecionar Laringoestroboscopia, o sistema oferecerá abrir a análise externa.

### 3. Editor de Videokimografia (Mosaico) 🎞️
Ferramenta poderosa para análise de pregas vocais.
1.  Realize uma captura em **Modo Burst** (F8 longo) durante a fonação.
2.  Na barra inferior (abaixo do vídeo), localize o **Histórico de Bursts** e clique no ícone da pilha (Stack).
3.  Escolha **"Editor de Videokimografia"**.
4.  **Ajustes Manuais:**
    *   **Rotação:** Gire a imagem para alinhar as pregas vocais na vertical (90°).
    *   **Zoom/Pan:** Centralize a glote na tela.
    *   **Corte (Crop):** Defina a caixa verde sobre a área de interesse.
    *   **Colunas e Gaps:** Defina quantas fatias terá o mosaico e o espaçamento entre elas.
5.  **💡 Dica Pro (Efeito Câmera Ultra-Rápida):**
    *   Defina a **Altura do Corte** para o mínimo (1px a 5px).
    *   Defina o número de **Colunas** para 1.
    *   O sistema gerará uma "tira" contínua vertical (Kymogram Mode), onde o eixo Y representa o tempo, similar a exames de videokimografia dedicados.
6.  Clique em **Gerar**. O mosaico é salvo na pasta e adicionado ao laudo.

### 4. Edição no Laudo
*   **Imagens:** Passe o mouse sobre as fotos.
    *   Clique no **X** para remover.
    *   Para Mosaicos, use as alças azuis (cantos e bordas) para redimensionar a imagem livremente ("Free Form"), permitindo esticar ou achatar a imagem para melhor visualização dos ciclos.
*   **Equipamentos e Modelos:** Use os ícones de engrenagem e livro acima dos campos de texto para salvar seus próprios modelos de laudo e listas de equipamentos.

### 5. Finalização 🖨️
*   **PDF:** Clique no botão vermelho "Salvar PDF" no topo. O arquivo é gerado internamente e salvo na pasta do paciente.
*   **Impressão:** Use o botão azul de impressora (Ctrl+P). O layout se adapta automaticamente para papel A4, ocultando a interface de vídeo.
*   **QR Code:** Se houver um link de vídeo do YouTube colado, um QR Code é gerado no rodapé do laudo impresso.

---

## ⌨️ Atalhos de Teclado (Personalizáveis)

| Tecla Padrão | Função | Comportamento |
| :--- | :--- | :--- |
| **F8** | Captura de Imagem | Toque curto: Foto Única / Segurar: Burst |
| **F9** | Gravação de Vídeo | Toque curto: Iniciar-Pausar / Longo (>1s): Parar |
| **F10** | Tela Cheia | Expande o vídeo, ocultando menus secundários |
| **Esc** | Sair | Sai da tela cheia ou fecha modais |

---

## ⚠️ Requisitos de Sistema

*   **Sistema Operacional:** Windows 10/11, macOS ou Linux.
*   **Navegador:** **Google Chrome** ou **Microsoft Edge** (Versões Desktop atualizadas).
    *   *Nota:* Safari e Firefox não suportam a `FileSystemAccessAPI` necessária para o salvamento direto de arquivos.
    *   *Nota:* **Não compatível com Tablets ou Celulares** devido a limitações de hardware e API de arquivos móvel.
*   **Hardware:** Webcam USB ou Placa de Captura (HDMI to USB) conectada ao Endoscópio.

---

## 🔒 Privacidade e Segurança

O **ENT Report Pro AI** segue o princípio **Local-First**.
*   Nenhum vídeo ou foto do paciente trafega pela internet.
*   Os dados persistem apenas no seu computador e no `localStorage` do navegador para configurações.
*   A comunicação com a IA (Google Gemini) envia apenas o *texto* do laudo para processamento, sem identificação do paciente, garantindo conformidade ética.

---

© 2024 ENT Report Pro AI - Medical Systems
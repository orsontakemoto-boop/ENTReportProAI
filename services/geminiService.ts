import { GoogleGenAI } from "@google/genai";

// Adiciona declaração para o TypeScript aceitar 'process' no navegador
declare const process: any;

const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key do Google Gemini não configurada.");
  }
  return apiKey;
};

export const refineTextWithAI = async (text: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!text.trim()) {
    throw new Error("Texto vazio.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const prompt = `
    Atue como um médico otorrinolaringologista sênior e acadêmico.
    
    Abaixo você receberá um rascunho de laudo preenchido em formato de tópicos/esqueleto.
    Sua tarefa é reescrever essas anotações transformando-as em um texto corrido, técnico, elegante e profissional.
    
    Diretrizes:
    1. Mantenha a precisão clínica dos achados informados.
    2. Eleve o nível vocabular (ex: troque 'vermelho' por 'hiperemiado', 'inchado' por 'edemaciado/hipertrófico', 'normal' por 'sem alterações evidentes' ou 'preservado').
    3. Conecte as frases de forma fluida.
    4. Se um tópico estiver vazio ou em branco no rascunho, ignore-o ou assuma a normalidade SE o contexto permitir, caso contrário, apenas omita.
    5. O resultado final deve parecer que foi ditado por um especialista renomado.
    
    Rascunho original:
    "${text}"
    
    Responda APENAS com o texto do laudo reescrito, sem introduções, sem markdown e sem explicações.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const result = response.text;
    return result || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha ao conectar com a IA. Verifique sua chave API.");
  }
};

export const enhanceMedicalImage = async (base64ImageUrl: string): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey: apiKey });

  if (!base64ImageUrl) {
     throw new Error("Imagem inválida.");
  }

  // Extrair o tipo MIME e os dados base64 da string URL
  const matches = base64ImageUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Formato de imagem inválido.");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];

  const prompt = `
    Esta é uma imagem de endoscopia de fibra óptica de baixa qualidade, apresentando desfoque de movimento/foco e artefatos de mosaico/granulação típicos de fibras. Meu objetivo é restaurá-la para a nitidez e riqueza de detalhes comparáveis a uma imagem de endoscopia rígida, focando na clareza total dos detalhes teciduais.
    
    Instrução:
     * Identifique as regiões mais afetadas pelo desfoque e granulação.
     * Restaure digitalmente a imagem, aplicando técnicas de super-resolução e desborramento para eliminar artefatos de fibra óptica e maximizar a nitidez do detalhe (vasos, textura da mucosa, margens).
     * A saída deve ser uma imagem corrigida com alta fidelidade diagnóstica.
     * Mantenha as cores originais e a anatomia exata, apenas melhore a qualidade.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    // Iterar para encontrar a parte da imagem na resposta
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const newBase64 = part.inlineData.data;
          // Retornar no formato Data URL pronto para o <img src>
          return `data:image/png;base64,${newBase64}`;
        }
      }
    }

    throw new Error("A IA não retornou uma imagem válida.");
  } catch (error) {
    console.error("Gemini Image Enhancement Error:", error);
    throw new Error("Falha ao aprimorar a imagem. Tente novamente.");
  }
};
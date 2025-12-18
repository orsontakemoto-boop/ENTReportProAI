
import { GoogleGenAI } from "@google/genai";

declare const process: any;

const getApiKey = () => {
  let apiKey = '';
  try {
     apiKey = process.env.API_KEY;
  } catch (e) {
     console.warn("process.env.API_KEY não acessível diretamente.", e);
  }

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
    Sua tarefa é refinar e melhorar o vocabulário técnico do rascunho de laudo abaixo.
    DIRETRIZES OBRIGATÓRIAS DE FORMATAÇÃO:
    1. **ESTRUTURA EM TÓPICOS**: O texto final DEVE ser apresentado estritamente em lista vertical.
    2. **NÃO USE TEXTO CORRIDO**: Jamais agrupe os achados em um único parágrafo. Cada estrutura anatômica deve ter sua própria linha.
    3. **MARCADORES**: Inicie cada linha com um traço simples "- " para facilitar a leitura.
    Texto original para refinar:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha ao conectar com a IA.");
  }
};

export const generateConclusionWithAI = async (findings: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!findings.trim()) {
    throw new Error("A descrição do exame está vazia. Descreva os achados primeiro.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const prompt = `
    Atue como um médico otorrinolaringologista sênior. 
    Analise a descrição dos achados endoscópicos abaixo e forneça uma "Conclusão" ou "Hipótese Diagnóstica" precisa e concisa.
    
    DIRETRIZES:
    1. Use terminologia médica formal (ex: em vez de 'carne no nariz', use 'hipertrofia de cornetos' ou 'adenoides').
    2. Se houver sinais de refluxo, mencione 'Sinais sugestivos de refluxo laringofaríngeo'.
    3. Se houver desvio de septo, classifique-o se possível.
    4. Seja direto: forneça apenas os diagnósticos encontrados.
    5. Inicie com "Exame compatível com:" ou "Hipótese Diagnóstica:".
    
    Achados descritos:
    "${findings}"
    
    Responda apenas com o texto da conclusão.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini Conclusion Error:", error);
    throw new Error("Falha ao gerar conclusão automática.");
  }
};

export const enhanceMedicalImage = async (base64ImageUrl: string): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey: apiKey });

  if (!base64ImageUrl) {
     throw new Error("Imagem inválida.");
  }

  const matches = base64ImageUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Formato de imagem inválido.");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];

  const prompt = `
    Esta é uma imagem de endoscopia de fibra óptica. Restaure-a para alta definição, 
    eliminando o efeito de mosaico das fibras e melhorando a nitidez da mucosa e vasos sanguíneos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      }
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("A IA não retornou uma imagem válida.");
  } catch (error) {
    console.error("Gemini Image Enhancement Error:", error);
    throw new Error("Falha ao aprimorar a imagem.");
  }
};

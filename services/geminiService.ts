// Use correct import for GoogleGenAI and response types
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getGenAI = (apiKey?: string) => {
  const key = apiKey || import.meta.env.VITE_API_KEY;
  if (!key) throw new Error("API Key não configurada. Por favor, adicione sua chave nas configurações ou no arquivo .env");
  return new GoogleGenAI({ apiKey: key });
};

export const refineTextWithAI = async (text: string, apiKey?: string): Promise<string> => {
  if (!text.trim()) throw new Error("Texto vazio.");
  const ai = getGenAI(apiKey?.trim());

  const prompt = `
    Atue como um médico otorrinolaringologista sênior focado em laudos objetivos.
    Refine o texto abaixo para torná-lo técnico, porém DIRETO e SEM REBUSCAMENTO desnecessário.
    
    REGRAS ESTRITAS:
    1. PRESERVE INTEGRALMENTE a estrutura de tópicos e os termos em NEGRITO (**texto**).
    2. Use linguagem médica clara e funcional. Evite termos literários, arcaicos ou adjetivação excessiva.
    3. Seja conciso: elimine verbos de ligação e preenchimentos irrelevantes (Ex: em vez de "Nota-se a presença de um desvio", use "**Septo:** Desvio...").
    4. Mantenha a precisão técnica sem ser prolixo.
    5. Retorne APENAS o laudo refinado.

    Texto a refinar: 
    "${text}"
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = error.message || JSON.stringify(error);
    throw new Error(`Erro na IA: ${msg}. Verifique sua Chave API em Configurações.`);
  }
};

export const generateConclusionWithAI = async (findings: string, apiKey?: string): Promise<string> => {
  if (!findings.trim()) throw new Error("Achados vazios.");
  const ai = getGenAI(apiKey?.trim());

  const prompt = `
    Atue como um médico otorrinolaringologista sênior.
    Forneça uma conclusão/hipótese diagnóstica baseada nos achados fornecidos.
    
    REGRAS DE OURO:
    1. Retorne EXCLUSIVAMENTE os diagnósticos em TÓPICOS (usando "- ").
    2. NÃO explique os diagnósticos. NÃO adicione justificativas ou descrições para os itens.
    3. Use apenas a NOMENCLATURA TÉCNICA MÉDICA direta.
    4. Use NEGRITO (**texto**) para cada diagnóstico.
    5. Retorno extremamente limpo e conciso.
    
    Achados: "${findings}"
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = error.message || JSON.stringify(error);
    throw new Error(`Erro na IA: ${msg}. Verifique sua Chave API.`);
  }
};

export const enhanceMedicalImage = async (base64ImageUrl: string, apiKey?: string): Promise<string> => {
  const ai = getGenAI(apiKey?.trim());
  const matches = base64ImageUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Imagem inválida.");

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: matches[1], data: matches[2] } },
          { text: "Restaure esta imagem de endoscopia removendo o efeito mosaico das fibras e ruído digital." }
        ]
      }
    });
    const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Sem retorno de imagem.");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = error.message || JSON.stringify(error);
    throw new Error(`Erro no processamento de imagem: ${msg}`);
  }
};

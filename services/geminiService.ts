
// Use correct import for GoogleGenAI and response types
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const refineTextWithAI = async (text: string): Promise<string> => {
  if (!text.trim()) throw new Error("Texto vazio.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Atue como um médico otorrinolaringologista sênior. 
    Refine o vocabulário técnico do laudo abaixo seguindo estas regras estritas:
    1. PRESERVE INTEGRALMENTE a estrutura de tópicos e os termos em NEGRITO (**texto**).
    2. Use linguagem TÉCNICA, PRECISA, FORMAL e CULTA.
    3. Mantenha a concisão técnica, mas GARANTA a precisão e o detalhamento anatômico necessário. Não suprima achados clínicos relevantes.
    4. Elimine termos subjetivos, literários ou adjetivos desnecessários.
    5. Retorne APENAS o laudo refinado.

    Texto a refinar: 
    "${text}"
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha ao conectar com a IA.");
  }
};

export const generateConclusionWithAI = async (findings: string): Promise<string> => {
  if (!findings.trim()) throw new Error("Achados vazios.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Erro na IA.");
  }
};

export const enhanceMedicalImage = async (base64ImageUrl: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const matches = base64ImageUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Imagem inválida.");
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: matches[1], data: matches[2] } },
          { text: "Restaure esta imagem de endoscopia removendo o efeito mosaico das fibras e ruído digital." }
        ]
      }
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Sem retorno de imagem.");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha no processamento de imagem.");
  }
};

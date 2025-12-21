
// Use correct import for GoogleGenAI and response types
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const refineTextWithAI = async (text: string): Promise<string> => {
  if (!text.trim()) throw new Error("Texto vazio.");
  // Always initialize with an options object containing apiKey
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Atue como um médico otorrinolaringologista sênior e acadêmico.
    Refine o vocabulário técnico do laudo abaixo.
    1. PRESERVE O NEGRITO (**texto**).
    2. Retorne apenas o texto refinado em tópicos.
    Texto: "${text}"
  `;

  try {
    // Basic text tasks like summarization and proofreading use gemini-3-flash-preview
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access generated text via the .text property (not a method)
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
    Forneça uma conclusão médica concisa em negrito baseada nestes achados: "${findings}"
  `;

  try {
    // Complex text tasks involving medical reasoning use gemini-3-pro-preview
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Access generated text via the .text property
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
    // Image generation and editing tasks use gemini-2.5-flash-image
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: matches[1], data: matches[2] } },
          { text: "Restaure esta imagem de endoscopia removendo o efeito mosaico das fibras." }
        ]
      }
    });
    // Iterate through parts to find the image part in response candidates
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Sem retorno de imagem.");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha no processamento de imagem.");
  }
};

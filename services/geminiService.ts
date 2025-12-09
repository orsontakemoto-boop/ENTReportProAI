
import { GoogleGenAI } from "@google/genai";

// Adiciona declaração para o TypeScript aceitar 'process' no navegador
declare const process: any;

export const refineTextWithAI = async (text: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key do Google Gemini não configurada.");
  }
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

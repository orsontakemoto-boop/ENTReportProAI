
import { GoogleGenAI } from "@google/genai";

// Declaração para satisfazer o compilador TypeScript (tsc) durante o build no Vercel.
// O valor real é injetado pelo Vite através da diretiva 'define' no vite.config.ts.
declare var process: {
  env: {
    API_KEY: string;
  };
};

export const refineTextWithAI = async (text: string): Promise<string> => {
  if (!text.trim()) {
    throw new Error("Texto vazio.");
  }

  // Always use a new instance with direct process.env.API_KEY access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Atue como um médico otorrinolaringologista sênior e acadêmico.
    Sua tarefa é refinar e melhorar o vocabulário técnico do rascunho de laudo abaixo.
    
    DIRETRIZES OBRIGATÓRIAS:
    1. **PRESERVE O NEGRITO**: Mantenha estritamente todas as marcações de negrito (**texto**) que envolvem os rótulos anatômicos iniciais. Jamais remova os asteriscos duplos.
    2. **APENAS O CONTEÚDO**: Retorne estritamente o texto refinado. Não adicione introduções ou explicações.
    3. **ESTRUTURA EM TÓPICOS**: O texto final DEVE ser apresentado em lista vertical, respeitando a estrutura de parágrafos original.
    4. **REFINAMENTO MÉDICO**: Melhore as descrições técnicas que seguem os rótulos em negrito, utilizando terminologia formal e precisa.
    
    Exemplo:
    Entrada: "**Septo Nasal:** torto pra direita"
    Saída: "**Septo Nasal:** Desvio septal cartilaginoso para a direita, com esporão ósseo associado."

    Texto original para refinar:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Accessing .text property directly as per guidelines
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha ao conectar com a IA.");
  }
};

export const generateConclusionWithAI = async (findings: string): Promise<string> => {
  if (!findings.trim()) {
    throw new Error("A descrição do exame está vazia. Descreva os achados primeiro.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Atue como um médico otorrinolaringologista sênior. 
    Analise a descrição dos achados endoscópicos abaixo e forneça uma "Conclusão" ou "Hipótese Diagnóstica" precisa e concisa.
    
    DIRETRIZES:
    1. Use terminologia médica formal.
    2. Seja direto: forneça apenas os diagnósticos encontrados.
    3. Inicie com o rótulo em negrito: "**Exame compatível com:**" ou "**Hipótese Diagnóstica:**".
    4. **NÃO ADICIONE INTRODUÇÃO**: Responda apenas com o texto da conclusão.
    
    Achados descritos:
    "${findings}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Accessing .text property directly
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Conclusion Error:", error);
    throw new Error("Falha ao gerar conclusão automática.");
  }
};

export const enhanceMedicalImage = async (base64ImageUrl: string): Promise<string> => {
  if (!base64ImageUrl) {
     throw new Error("Imagem inválida.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    // Iterating through all parts to find the inlineData part containing the processed image
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

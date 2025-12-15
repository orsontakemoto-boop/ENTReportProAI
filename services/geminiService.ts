
import { GoogleGenAI } from "@google/genai";

// Declaração para satisfazer o TypeScript.
// O Vite substitui 'process.env.API_KEY' pelo valor real da string durante o build.
// Esta declaração impede que o TS reclame que 'process' não existe.
declare const process: any;

const getApiKey = () => {
  // Tenta acessar a chave injetada pelo Vite.
  // Se o processo de build do Vite funcionar, 'process.env.API_KEY' será substituído por uma string.
  // Se não funcionar e 'process' não estiver definido no navegador, isso pode lançar erro,
  // então fazemos um acesso seguro.
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
    
    DIRETRIZES DE CONTEÚDO:
    1. Eleve o nível do vocabulário (ex: troque 'vermelho' por 'hiperemiado', 'inchado' por 'edemaciado/hipertrófico', 'normal' por 'sem alterações evidentes' ou 'preservado').
    2. Seja conciso e direto.
    3. Se o texto original já estiver em lista, mantenha a estrutura exata, apenas melhorando as descrições.
    
    Exemplo de Saída Desejada:
    - Fossas Nasais: Mucosa trófica, sem secreções patológicas.
    - Septo Nasal: Centrado.
    - Orofaringe: Estruturas preservadas.
    
    Texto original para refinar:
    "${text}"
    
    Responda APENAS com a lista formatada.
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

    // Verificação segura (Optional Chaining) para evitar erros TS2532
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
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

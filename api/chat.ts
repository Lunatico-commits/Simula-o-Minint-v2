import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const { query, history } = body || {};
  const userQuery = query || '';

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no ambiente do servidor.' });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    const apiVersion = 'v1';

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion,
      },
    });

    const systemInstruction = `Você é o Assistente Virtual e Tutor IA oficial especialista na preparação para o Concurso Público do Ministério do Interior de Angola (MININT).

DIRETRIZES DE ATUAÇÃO E CONHECIMENTO:
1. LEGISLAÇÃO E CONTEXTO DE ANGOLA: Responda fundamentando-se na legislação angolana atualizada, Constituição da República de Angola (CRA), Código Penal Angolano, Lei Geral do Trabalho, e Regulamentos dos 5 ramos do MININT:
   - PNA (Polícia Nacional de Angola)
   - SIC (Serviço de Investigação Criminal)
   - SME (Serviço de Migração e Estrangeiros)
   - SP (Serviço Penitenciário)
   - SPCB (Serviço de Protecção Civil e Bombeiros)
   - Nova Divisão Político-Administrativa de Angola (Lei n.º 13/24 - 21 Províncias).

2. MATÉRIAS DO EXAME:
   - Legislação Específica e Direitos Humanos
   - Língua Portuguesa (Gramática, Sintaxe, Interpretação de Texto)
   - Informática BÁSICA e Cibersegurança
   - Cultura Geral, História e Geografia de Angola

3. TOM E FORMATO:
   - Responda dinamicamente de forma direta, motivadora, clara e profissional.
   - Sempre cite artigos, leis ou decretos relevantes quando aplicável (ex: Decreto Presidencial 152/19, CRA Art. 67.º).
   - Respostas organizadas e bem formatadas em Markdown com tópicos, adequadas para ecrãs de telemóvel.

4. RESTRIÇÕES:
   - Não invente leis ou artigos. Se não tiver certeza, esclareça.
   - Foque estritamente na preparação do candidato para o concurso do MININT.`;

    const contents = [
      ...(history || []).map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: typeof h.parts === 'string' ? h.parts : (h.parts?.[0]?.text || String(h.parts || '')) }],
      })),
      { role: 'user', parts: [{ text: userQuery }] },
    ];

    let lastErr: any = null;
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          return res.status(200).json({ reply: response.text });
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`[Vercel API Chat Error] Falha ao tentar modelo '${modelName}':`, err?.message || err);
      }
    }

    if (lastErr) {
      throw lastErr;
    }

    throw new Error('O modelo Gemini não retornou texto de resposta.');
  } catch (error: any) {
    console.error('[Vercel API Chat Error]:', error);
    const errStr = String(error?.message || error);
    const isQuotaError =
      error?.status === 429 ||
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('Quota exceeded') ||
      errStr.includes('quota');

    if (isQuotaError) {
      return res.status(429).json({
        error: 'O Tutor IA está com excesso de pedidos no momento. Aguarde alguns segundos e tente novamente!',
      });
    }

    return res.status(500).json({ error: error?.message || String(error) });
  }
}

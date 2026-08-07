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

    const systemInstruction = `Você é o Tutor Virtual de Inteligência Artificial oficial, especialista e dedicado exclusivamente ao Concurso Público do Ministério do Interior de Angola (MININT).

SUA MISSÃO PRINCIPAL:
Instruir, esclarecer dúvidas e capacitar os candidatos para aprovação nos exames de admissão do MININT em Angola, abrangendo com rigor técnico e clareza didática os 5 ramos institucionais e todas as matérias do concurso.

ÁREAS DE CONHECIMENTO OBRIGATÓRIAS:
1. LEGISLAÇÃO DO MININT E DE ANGOLA:
   - Constituição da República de Angola (CRA), Código Penal e Código de Processo Penal Angolano.
   - Legislação Específica e Regulamentos dos 5 ramos do MININT:
     * PNA (Polícia Nacional de Angola)
     * SIC (Serviço de Investigação Criminal)
     * SME (Serviço de Migração e Estrangeiros)
     * SP (Serviço Penitenciário)
     * SPCB (Serviço de Protecção Civil e Bombeiros)
   - Requisitos de admissão, idades mínimas, altura, aptidão física e documental para a carreira policial e paramilitar.
   - Nova Divisão Político-Administrativa de Angola (Lei n.º 13/24 - 21 Províncias).

2. LÍNGUA PORTUGUESA:
   - Gramática, ortografia (Novo Acordo Ortográfico), sintaxe, regência, concordância, pontuação e interpretação e análise de texto.

3. INFORMÁTICA BÁSICA E TICS:
   - Sistemas operativos, Microsoft Office (Word, Excel, PowerPoint), redes de computadores, conceitos de Internet, correio eletrónico e noções de cibersegurança.

4. CULTURA GERAL, HISTÓRIA E GEOGRAFIA DE ANGOLA:
   - Símbolos nacionais, datas históricas de Angola, organização política do Estado, geografia e atualidades socioeconómicas.

DIRETRIZES DE RESPOSTA E TOM:
- Comporte-se como um mentor rigoroso, motivador e encorajador ("Candidato", "Futuro Agente").
- Sempre que pertinente, inclua enquadramento legal e fundamentação normativa (ex: Art. 67.º da CRA, Decreto Presidencial n.º 152/19).
- Estruture as respostas em tópicos limpos utilizando Markdown para facilidade de leitura em ecrãs móveis.
- Responda apenas dentro do contexto do concurso do MININT e preparação de candidatos.`;

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

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper lazy getter for Gemini AI SDK
  function getGeminiClient(apiVersion: string = 'v1') {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.error('[Gemini API Critical] GEMINI_API_KEY / VITE_GEMINI_API_KEY environment variable is missing or empty.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        apiVersion,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Helper function to call Gemini API with v1 endpoint
  async function generateGeminiContent(ai: GoogleGenAI, contents: any, config?: any) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const apiVersion = 'v1';
        console.log(`[Gemini API] Requisitando modelo: ${model} (API version: ${apiVersion})`);
        const client = getGeminiClient(apiVersion);
        const response = await client.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.error(`[Gemini API Error] Erro ao chamar modelo '${model}':`, {
          message: err?.message || String(err),
          status: err?.status,
          statusText: err?.statusText,
          errorDetails: err?.errorDetails || err?.details,
          stack: err?.stack,
        });
      }
    }

    if (lastError) {
      throw lastError;
    }
    return null;
  }

  // API Route: AI Question Explanation
  app.post('/api/explain-question', async (req, res) => {
    try {
      const { question, options, correctIndex, userChosenIndex, lawReference, categoryName } = req.body;

      const ai = getGeminiClient();
      const isCorrect = userChosenIndex === correctIndex;
      const chosenText = options?.[userChosenIndex] || 'Nenhuma opção';
      const correctText = options?.[correctIndex];

      const prompt = `Você é o Tutor AI oficial especialista na preparação para o Concurso Público do Ministério do Interior de Angola (MININT).
Responda em Português com tom profissional, encorajador, claro e objetivo.

INFORMAÇÃO DA QUESTÃO:
- Categoria: ${categoryName}
- Pergunta: "${question}"
- Opção Correta [${correctIndex + 1}]: "${correctText}"
- Escolha do Candidato [${userChosenIndex + 1}]: "${chosenText}" (${isCorrect ? 'ACERTOU' : 'ERROU'})
- Referência Legal Angolana Registada: "${lawReference}"

INSTRUÇÕES DE RESPOSTA:
1. Explique com rigor e clareza o motivo pelo qual a opção "${correctText}" é a correta, citando o artigo, lei ou regulamento angolano aplicável (ex: Constituição da República de Angola, Estatuto Orgânico do MININT/PNA/SIC/SME/SP/SPCB, Código Penal Angolano).
2. Se o candidato errou, explique por que a opção "${chosenText}" está incorreta.
3. Forneça uma dica prática de estudo para memorizar este tópico para a prova do concurso.

Retorne em formato JSON estrito com a seguinte estrutura:
{
  "explanation": "Texto explicativo detalhado e fundamentado na lei angolana",
  "legalArticles": ["Lista de artigos/leis citados"],
  "studyTips": "Dica de memorização ou foco de estudo"
}`;

      const responseText = await generateGeminiContent(ai, prompt, { responseMimeType: 'application/json' });

      if (responseText) {
        const parsedData = JSON.parse(responseText);
        return res.json({
          explanation: parsedData.explanation || 'Explicação indisponível no momento.',
          legalArticles: parsedData.legalArticles || [lawReference],
          studyTips: parsedData.studyTips || 'Continue a praticar mais questões desta categoria.',
        });
      }

      throw new Error('O modelo Gemini não devolveu nenhum conteúdo de texto.');
    } catch (error: any) {
      console.error('[API Route Error] /api/explain-question falhou:', {
        message: error?.message || String(error),
        status: error?.status,
        stack: error?.stack,
        rawError: error,
      });

      res.status(500).json({
        error: error?.message || 'Erro ao comunicar com a API do Gemini',
        explanation: `A resposta correta é fundamentada no regulamento aplicável: ${req.body.lawReference || 'Legislação do MININT'}. Estude os artigos principais para consolidar a matéria.`,
        legalArticles: [req.body.lawReference || 'Legislação Orgânica do MININT'],
        studyTips: 'Consulte o Decreto Presidencial aplicável no Diário da República.',
      });
    }
  });

  // API Route: AI MININT Chat Tutor (aceita /api/ai-chat, /api/chat ou /api/tutor)
  app.post(['/api/ai-chat', '/api/chat', '/api/tutor'], async (req, res) => {
    const { query, history } = req.body;
    const userQuery = query || '';

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        console.error('[API Route Error] GEMINI_API_KEY ausente em process.env.');
        return res.status(500).json({
          error: 'GEMINI_API_KEY não configurada no ambiente do servidor. Defina a variável GEMINI_API_KEY.',
        });
      }

      const ai = getGeminiClient();

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

      const replyText = await generateGeminiContent(ai, contents, { systemInstruction });

      if (replyText) {
        return res.json({ reply: replyText });
      }

      throw new Error('O modelo Gemini não retornou texto de resposta.');
    } catch (error: any) {
      console.error('[API Route Error] /api/chat falhou ao processar requisição Gemini:', error);
      return res.status(500).json({
        error: error?.message || String(error) || 'Erro ao comunicar com a API do Gemini AI',
        details: error?.stack || String(error),
      });
    }
  });

  // API Route: AI Meme Caption Generator
  app.post('/api/generate-meme', async (req, res) => {
    try {
      const { score, totalQuestions, pct, categoryName, branch, rankTitle, displayName } = req.body;

      const ai = getGeminiClient();
      const pctValue = Number(pct) || 0;

      const prompt = `Você é um gerador de memes engraçados, irónicos e encorajadores para candidatos ao Concurso Público do Ministério do Interior de Angola (MININT).

DADOS DO DESEMPENHO DO CANDIDATO:
- Nome: ${displayName || 'Candidato'}
- Ramos/Serviço: ${branch || 'PNA'} (Polícia Nacional / SIC / SME / SP / SPCB)
- Patente Atual: ${rankTitle || 'Recruta'}
- Aproveitamento: ${pctValue}% (${score || 0} de ${totalQuestions || 10} acertos)
- Matéria/Modo: ${categoryName || 'Simulado Geral'}

REGRAS DO MEME:
1. Responda com uma piada curta, extremamente engraçada, bem-humorada e irónica sobre a rotina de estudo para o concurso de Angola (mencione Diário da República, Decreto Presidencial, CRA, patentes, farda, esquadra, café da noite ou estudo intensivo).
2. Se o aproveitamento for alto (>=80%), faça piadas de que o candidato já está pronto para comandar a tropa.
3. Se for médio (50%-79%), brinque com a hesitação entre passar na prova e ir para a instrução.
4. Se for baixo (<50%), crie uma piada amigável e cómico-dramática sobre ter de reestudar urgentemente a lei orgânica.

Formato JSON estrito:
{
  "headline": "Título cômico em maiúsculas com emoji (ex: COMANDANTE SUPREMO DA PNA 🎖️)",
  "caption": "Frase engraçada e irónica de 1 a 2 frases curtas sobre o resultado.",
  "punchline": "Hashtag ou slogan divertido (ex: #DiarioDaRepublicaNaVeia #MININT2026)"
}`;

      const responseText = await generateGeminiContent(ai, prompt, { responseMimeType: 'application/json' });

      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          headline: parsed.headline || 'MEME DO CONCURSO MININT 🎯',
          caption: parsed.caption || `Aproveitamento de ${pctValue}%! Foco contínuo nos cadernos e na legislação angolana.`,
          punchline: parsed.punchline || '#MININT2026 #RumoAAprovação',
        });
      }

      throw new Error('Gemini não devolveu conteúdo para o meme.');
    } catch (error: any) {
      console.error('[API Route Error] /api/generate-meme falhou:', {
        message: error?.message || String(error),
        status: error?.status,
        stack: error?.stack,
        rawError: error,
      });

      const pctValue = Number(req.body.pct) || 0;

      let fallbackHeadline = 'CANDIDATO EM INSTRUÇÃO 🚔';
      let fallbackCaption = `Pontuação de ${pctValue}%! Hora de reforçar a leitura dos artigos e leis de Angola.`;
      let fallbackPunchline = '#MININT2026 #FocoNoConcurso';

      if (pctValue >= 90) {
        fallbackHeadline = 'AGENTE DE ELITE MININT 🎖️';
        fallbackCaption = 'Gabaritou quase tudo! O Comandante Geral já mandou separar a farda nova para a tomada de posse.';
        fallbackPunchline = '#ProntoParaOComando #MININT2026';
      } else if (pctValue >= 70) {
        fallbackHeadline = 'INSPECTOR QUASE APROVADO 🔍';
        fallbackCaption = 'Aproveitamento sólido! A Constituição da República de Angola já decorre espontaneamente nas suas orações.';
        fallbackPunchline = '#GabaritandoALei #MININT2026';
      } else if (pctValue < 50) {
        fallbackHeadline = 'RECRUTA NO SEGUNDO TURNO ☕';
        fallbackCaption = 'A intenção foi louvável, mas a lei orgânica cobrou caro! Mais um café forte e de volta ao Diário da República.';
        fallbackPunchline = '#ReestudarAEstaHora #MININT2026';
      }

      res.json({
        headline: fallbackHeadline,
        caption: fallbackCaption,
        punchline: fallbackPunchline,
      });
    }
  });

  // Vite middleware for dev or Static serve for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor MININT Angola a rodar em http://0.0.0.0:${PORT}`);
  });
}

startServer();

import { AIExplanationResponse, Question } from '../types';
import { GoogleGenAI } from '@google/genai';

const MININT_SYSTEM_INSTRUCTION = `Você é o Tutor Virtual de Inteligência Artificial oficial, especialista e dedicado exclusivamente ao Concurso Público do Ministério do Interior de Angola (MININT).

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

export async function askMININTAITutorClientDirect(
  userQuery: string,
  history: { role: 'user' | 'model'; parts: string }[] = []
): Promise<string> {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY : '');

  if (!apiKey) {
    return '⚠️ Olá, candidato! A chave de API do Gemini (GEMINI_API_KEY ou VITE_GEMINI_API_KEY) não está configurada no ambiente. Por favor, certifique-se de que a chave está configurada nas definições para utilizar todas as funcionalidades do Tutor IA!';
  }

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  const apiVersion = 'v1';

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion,
    },
  });

  const contents = [
    ...(history || []).map((h: any) => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: typeof h.parts === 'string' ? h.parts : (h.parts?.[0]?.text || String(h.parts || '')) }],
    })),
    { role: 'user', parts: [{ text: userQuery }] },
  ];

  let lastErr: any = null;
  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: MININT_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastErr = err;
        const errStr = String(err?.message || err);
        const isQuota =
          err?.status === 429 ||
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('Quota exceeded') ||
          errStr.includes('quota');

        if (isQuota && attempt === 1) {
          console.warn(`[Client Direct Gemini 429 Quota] Modelo '${modelName}' limite atingido. Aguardando 2s para retry automático...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        console.warn(`[Client Direct Gemini Error] Falha ao tentar modelo '${modelName}' (tentativa ${attempt}):`, err?.message || err);
        break;
      }
    }
  }

  if (lastErr) {
    const err = lastErr;
    const errStr = String(err?.message || err);
    if (
      err?.status === 429 ||
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('Quota exceeded') ||
      errStr.includes('quota')
    ) {
      return 'O Tutor IA está com um elevado volume de consultas no momento. Por favor, aguarde alguns segundos e tente novamente!';
    }
    if (
      errStr.includes('API key') ||
      errStr.includes('API_KEY') ||
      errStr.includes('invalid') ||
      errStr.includes('401') ||
      errStr.includes('403')
    ) {
      return '⚠️ Não foi possível autenticar o Tutor IA com a chave fornecida. Por favor, verifique se a sua chave GEMINI_API_KEY ou VITE_GEMINI_API_KEY é válida.';
    }
    throw err;
  }
  throw new Error('O modelo Gemini não retornou texto de resposta.');
}

export async function explainQuestionWithAI(
  question: Question,
  userChosenIndex: number
): Promise<AIExplanationResponse> {
  try {
    const response = await fetch('/api/explain-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
        userChosenIndex,
        lawReference: question.lawReference,
        categoryName: question.categoryName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na comunicação com a IA: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao chamar API Gemini:', error);
    // Fallback response if offline or API error
    return {
      explanation: `${question.explanation} (Referência legal: ${question.lawReference})`,
      legalArticles: [question.lawReference],
      studyTips: 'Estude o Estatuto Orgânico do MININT e a Constituição de Angola para fixar os conceitos.'
    };
  }
}

export async function askMININTAITutor(
  userQuery: string,
  history: { role: 'user' | 'model'; parts: string }[] = []
): Promise<string> {
  const doFetch = async () => {
    return await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userQuery,
        history,
      }),
    });
  };

  try {
    let response = await doFetch();

    if (response.status === 429) {
      console.warn('[API /api/chat HTTP 429] Limite de pedidos atingido. Aguardando 2 segundos para retry automático...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await doFetch();
    }

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return data.reply;
      }
    } else {
      const errText = await response.text();
      let parsedErr = '';
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.error || jsonErr.message;
      } catch (e) {
        parsedErr = errText;
      }

      if (
        response.status === 429 ||
        parsedErr.includes('429') ||
        parsedErr.includes('excesso de pedidos') ||
        parsedErr.includes('RESOURCE_EXHAUSTED') ||
        parsedErr.includes('Quota exceeded') ||
        parsedErr.includes('quota')
      ) {
        console.warn('[API /api/chat Quota Limit Error] Tentando fallback para chamada direta no cliente com retry...');
        return await askMININTAITutorClientDirect(userQuery, history);
      }

      console.warn(`[API /api/chat HTTP ${response.status}] ${parsedErr || response.statusText}. Tentando chamada direta no cliente com @google/genai...`);
    }
  } catch (backendError: any) {
    const bMsg = String(backendError?.message || backendError);
    if (
      bMsg.includes('429') ||
      bMsg.includes('excesso de pedidos') ||
      bMsg.includes('RESOURCE_EXHAUSTED') ||
      bMsg.includes('Quota exceeded')
    ) {
      return 'O Tutor IA está com um elevado volume de consultas no momento. Por favor, aguarde alguns segundos e tente novamente!';
    }
    console.warn('[API /api/chat Fetch Error] Falha de rota backend. Tentando chamada direta no cliente:', backendError?.message || backendError);
  }

  // Fallback para chamada direta do cliente via @google/genai (evita erro 404 na Vercel ou ambientes sem rota Express)
  try {
    return await askMININTAITutorClientDirect(userQuery, history);
  } catch (clientError: any) {
    console.error('[Tutor IA Direct Client Error] Erro exato na chamada Gemini:', clientError);
    const cMsg = String(clientError?.message || clientError);
    if (
      clientError?.status === 429 ||
      cMsg.includes('429') ||
      cMsg.includes('excesso de pedidos') ||
      cMsg.includes('RESOURCE_EXHAUSTED') ||
      cMsg.includes('Quota exceeded') ||
      cMsg.includes('quota')
    ) {
      return 'O Tutor IA está com um elevado volume de consultas no momento. Por favor, aguarde alguns segundos e tente novamente!';
    }
    return `⚠️ Erro na comunicação com o Tutor IA: ${clientError?.message || String(clientError)}. Verifique se a chave GEMINI_API_KEY ou VITE_GEMINI_API_KEY está configurada no projeto.`;
  }
}

export interface MemeDataResponse {
  headline: string;
  caption: string;
  punchline: string;
  templateIndex?: number;
}

export interface MemeParams {
  score: number;
  totalQuestions: number;
  pct?: number;
  timeSeconds?: number;
  categoryName?: string;
  branch?: string;
  rankTitle?: string;
  displayName?: string;
  lastIndex?: number;
}

type TemplateBuilder = (ctx: {
  name: string;
  score: number;
  total: number;
  pct: number;
  timeStr: string | null;
  rank: string;
  categoryName: string;
  branch: string;
}) => MemeDataResponse;

// ----------------------------------------------------
// BRANCH SPECIFIC TEMPLATES (PNA, SIC, SPCB, SP, SME)
// ----------------------------------------------------

const BRANCH_TEMPLATES: Record<string, Record<'vitoria' | 'empate' | 'derrota', TemplateBuilder[]>> = {
  PNA: {
    vitoria: [
      ({ name, score, total, timeStr }) => ({
        headline: '🚔 COMISSÁRIO DE ELITE PNA',
        caption: `${name} garantiu a ordem pública com ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}! A viatura da PNA já vem a caminho para a escolta de honra.`,
        punchline: '#OrdemESegurança #ComandoPNA #MININT2026',
      }),
      ({ name, score, total }) => ({
        headline: '👮 PATRULHA DA VITÓRIA',
        caption: `${name} manteve o patrulhamento impecável acertando ${score} de ${total}! A farda número 1 da Polícia Nacional já tem dono.`,
        punchline: '#PoliciaNacional #ProntoParaOServiço #Angola',
      }),
      ({ name, pct }) => ({
        headline: '🚨 SIRENE DE APROVAÇÃO PNA',
        caption: `${name} obteve ${pct}% no simulado da PNA! O Comandante da Esquadra dispensou o piquete e autorizou a comemoração.`,
        punchline: '#SegurançaPública #DueloPNA #VagaGarantida',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🛡️ OPERAÇÃO POLICIAL PERFEITA',
        caption: `Com ${score}/${total} certas${timeStr ? ` em ${timeStr}` : ''}, ${name} demonstrou disciplina tática e domínio total do regulamento policial.`,
        punchline: '#CorpoPolicial #FocoEPatrulha #MININT2026',
      }),
      ({ name, pct }) => ({
        headline: '🏅 INSPECTOR DA POLÍCIA NACIONAL',
        caption: `${name} dominou as leis de trânsito e segurança pública com ${pct}% de acertos. Nenhuma infração escapou no duelo!`,
        punchline: '#PNAAngola #FuturoComissario #AltaPerformance',
      }),
    ],
    empate: [
      ({ name, score, total }) => ({
        headline: '🚔 PATRULHA DE ROTINA PNA',
        caption: `${name} somou ${score}/${total} acertos. A esquadra autorizou o patrulhamento, mas exige revisão das normas de trânsito!`,
        punchline: '#PiqueteDeEstudo #PersistenciaPNA #MININT',
      }),
      ({ name, pct }) => ({
        headline: '📋 FISCALIZAÇÃO NO CORREDOR',
        caption: `${name} conseguiu ${pct}% de aproveitamento na PNA. Faltou pouco para a nota máxima, falta só afinar o código de trânsito.`,
        punchline: '#ReforçoNaEsquadra #FocoNoManual',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🛑 POSTO DE CONTROLO POLICIAL',
        caption: `${name} registou ${score}/${total} certas${timeStr ? ` em ${timeStr}` : ''}. O adjunto de serviço mandou tomar um café forte e voltar aos cadernos.`,
        punchline: '#TurnoDeEstudo #SegurançaEmConstrução',
      }),
      ({ name, score, total }) => ({
        headline: '🪖 RECRUTA EM REVISÃO DE TROPA',
        caption: `${name} pontuou ${score} em ${total}. O comandante da Polícia Nacional deu 10 flexões e autorizou mais um simulado!`,
        punchline: '#LutaETrabalho #DisciplinaMilitar',
      }),
      ({ name, pct }) => ({
        headline: '🚘 VIATURA EM MANUTENÇÃO',
        caption: `${name} fechou o duelo com ${pct}%. A patrulha está na rua, mas a legislação precisa de um ajuste antes da prova final.`,
        punchline: '#RumoÀAprovação #PNA2026',
      }),
    ],
    derrota: [
      ({ name, score, total }) => ({
        headline: '🚨 PIQUETE DE EMERGÊNCIA PNA',
        caption: `${name} acertou apenas ${score}/${total}. O Comandante da Esquadra da PNA ordenou estudo obrigatório na sala de instrução!`,
        punchline: '#RecolherObrigatório #EstudarMaisPNA',
      }),
      ({ name, pct }) => ({
        headline: '⚠️ MULTA POR FALTA DE ESTUDO',
        caption: `${name} ficou nos ${pct}% de acertos. Calma candidato! Até os grandes comandantes da PNA começaram a ler o regulamento do zero.`,
        punchline: '#SemRecuar #RegulamentoEmMãos',
      }),
      ({ score, total }) => ({
        headline: '📢 CONVOCAÇÃO DA ESQUADRA',
        caption: `${score}/${total} acertos! A Polícia Nacional sugere reforço imediato na leitura da Lei Geral do Trabalho e Código Penal.`,
        punchline: '#FocoEInstrução #PNAAngola',
      }),
      ({ name, score, total }) => ({
        headline: '🚔 VIATURA FICOU SEM COMBUSTÍVEL',
        caption: `${name} pontuou ${score}/${total} no teste da PNA. Hora de abastecer a mente com mais leitura da Constituição!`,
        punchline: '#RecomporAForça #MININT2026',
      }),
      ({ name, pct }) => ({
        headline: '🪖 SENTINELA DORMIDO NA GUARITA',
        caption: `${name} fez ${pct}% no duelo. O instrutor da PNA mandou lavar o rosto e repassar todos os artigos de segurança pública.`,
        punchline: '#DisciplinaSemFolga #PNAForte',
      }),
    ],
  },

  SIC: {
    vitoria: [
      ({ name, score, total }) => ({
        headline: '🕵️ INVESTIGADOR DE ELITE SIC',
        caption: `${name} desvendou ${score}/${total} questões no teste do SIC! As evidências comprovam que a vaga na Investigação Criminal é sua.`,
        punchline: '#CasoSolucionado #PeríciaCriminal #SIC2026',
      }),
      ({ name, score, total }) => ({
        headline: '🔎 PROVAS CONCLUDENTES',
        caption: `${name} recolheu ${score} de ${total} acertos com inteligência criminal apurada! Nem o suspeito mais esquivo escaparia a esta dedução.`,
        punchline: '#InteligenciaSIC #SemPistasFalsas',
      }),
      ({ name, pct, timeStr }) => ({
        headline: '🎯 OPERAÇÃO SIC BEM-SUCEDIDA',
        caption: `${name} concluiu o inquérito com ${pct}% de aproveitamento${timeStr ? ` em ${timeStr}` : ''}! Mandado de aprovação no concurso devidamente cumprido.`,
        punchline: '#MissaoCumprida #InvestigacaoAngola',
      }),
      ({ name, score, total }) => ({
        headline: '📁 CASO ENCERRADO COM LOUVOR',
        caption: `${score}/${total} certas! ${name} analisou a cena do duelo com precisão de perito e não deixou nenhuma dúvida jurídica.`,
        punchline: '#PericiaSIC #MestreDaLei',
      }),
      ({ name, pct }) => ({
        headline: '🕵️‍♂️ SUPERINTENDENTE DO SIC',
        caption: `${name} gabaritou ${pct}% das perguntas sobre o Código Penal! O Laboratório Central de Criminalística já felicitou o candidato.`,
        punchline: '#AnaliseTatica #SICAngola',
      }),
    ],
    empate: [
      ({ name, score, total }) => ({
        headline: '🕵️ PERÍCIA EM ANDAMENTO SIC',
        caption: `${name} colheu ${score}/${total} provas no duelo do SIC. A investigação avança, mas o laboratório pede análise do Código Penal.`,
        punchline: '#InvestigacaoEmCurso #FocoNasProvas',
      }),
      ({ name, pct }) => ({
        headline: '📁 MANDADO DE REVISÃO',
        caption: `${name} conseguiu ${pct}% no simulado do SIC. Faltam poucas evidências para fechar o inquérito com nota 100%.`,
        punchline: '#AprofundarAPesquisa #SICInquerito',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🔎 PISTA EM ANÁLISE NO LABORATÓRIO',
        caption: `${name} registou ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}. O perito chefe recomendou checar os detalhes da legislação penal.`,
        punchline: '#AnaliseDetida #PistaCerta',
      }),
      ({ name, score, total }) => ({
        headline: '📋 INQUÉRITO PRELIMINAR APROVADO',
        caption: `${name} pontuou ${score} de ${total}. O dossier do candidato ao SIC está bem encaminhado, mas exige mais leituras.`,
        punchline: '#CaminhoAberto #SIC2026',
      }),
      ({ name, pct }) => ({
        headline: '🔍 DEPOIMENTO COERENTE',
        caption: `${name} fez ${pct}% no duelo do SIC. O interrogatório correu bem, mas é preciso revisar o código de processo penal!`,
        punchline: '#SegredoDeJustiça #MenteAfiada',
      }),
    ],
    derrota: [
      ({ name, score, total }) => ({
        headline: '⚠️ PISTA FALSA NA INVESTIGAÇÃO',
        caption: `${name} acertou apenas ${score}/${total}. O Perito Principal do SIC ordenou reabertura do inquérito e estudo intensivo das evidências!`,
        punchline: '#ReabrirOCaso #EstudarOInquerito',
      }),
      ({ name, pct }) => ({
        headline: '📁 CASO ARQUIVADO POR FALTA DE PROVAS',
        caption: `${name} ficou nos ${pct}% de aproveitamento. Não entre em pânico! Reúna os livros de Direito Penal e recomece a perícia.`,
        punchline: '#ProvasInsuficientes #RevisarCodigos',
      }),
      ({ score, total }) => ({
        headline: '🕵️ INFORMANTE DEU PISTA ERRADA',
        caption: `${score}/${total} acertos no teste do SIC! O Chefe das Operações mandou examinar melhor os artigos antes de atuar em campo.`,
        punchline: '#FocoNaMateria #SICAlertas',
      }),
      ({ name, score, total }) => ({
        headline: '🚫 CENA DO CRIME CONTAMINADA',
        caption: `${name} pontuou ${score}/${total}. O laboratório pericial do SIC sugere fazer mais 5 simulados para limpar as dúvidas.`,
        punchline: '#LimparAsDuvidas #TreinoRigido',
      }),
      ({ name, pct }) => ({
        headline: '🔍 SUSPEITO ESCAPOU NO DUELO',
        caption: `${name} teve ${pct}% no teste do SIC. Pegue uma lupa, abra a Constituição de Angola e não deixe escapar nenhum detalhe.`,
        punchline: '#MenteDetetive #PersistenciaSIC',
      }),
    ],
  },

  SPCB: {
    vitoria: [
      ({ name, score, total, timeStr }) => ({
        headline: '🔥 BOMBEIRO DE ELITE SPCB',
        caption: `${name} dominou a prova com ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}! Nem um incêndio de grau 4 conseguiria parar este salvamento.`,
        punchline: '#ProtecçãoCivil #HeroiDoSPCB #MININT2026',
      }),
      ({ name, score, total }) => ({
        headline: '🚒 APAGOU A CONCORRÊNCIA',
        caption: `${name} extinguiu todas as dúvidas acertando ${score} de ${total}! O auto-tanque do SPCB já está a postos para o desfile.`,
        punchline: '#FogoNaMateria #SalvarEVencer',
      }),
      ({ name, pct }) => ({
        headline: '⚡ RESGATE EM TEMPO RECORD',
        caption: `${name} fez ${pct}% no simulado de emergência do SPCB! Operação de resgate de vaga concluída com sucesso absoluto.`,
        punchline: '#ProntidaoTotal #SPCBAngola',
      }),
      ({ name, score, total }) => ({
        headline: '🧯 COMBATE AO FOGO PERFEITO',
        caption: `Com ${score}/${total} certas, ${name} demonstrou frieza e precisão dignas do corpo de bombeiros de Angola.`,
        punchline: '#SemChamas #MenteFria',
      }),
      ({ name, pct }) => ({
        headline: '🏅 COMANDANTE DE OPERAÇÕES SPCB',
        caption: `${name} gabaritou as normas de prevenção e socorro com ${pct}%! A sirene do SPCB toca em sinal de vitória.`,
        punchline: '#VozDeComando #SocorroImediato',
      }),
    ],
    empate: [
      ({ name, score, total }) => ({
        headline: '🚒 RESGATE PARCIAL NA EMERGÊNCIA',
        caption: `${name} conseguiu ${score}/${total} no teste SPCB. Faltou um pouco de água na mangueira, mas o socorro foi prestado com bravura!`,
        punchline: '#ChamaControlada #SPCBEmergencia',
      }),
      ({ name, pct }) => ({
        headline: '⚠️ INCÊNDIO SOB CONTROLO',
        caption: `${name} obteve ${pct}% de aproveitamento. O fogo foi contido, mas o combate às questões exige revisão do manual de resgate.`,
        punchline: '#PrevencaoECombate #FocoNoSPCB',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🚨 SIRENE EM PRONTIDÃO',
        caption: `${name} registou ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}. Equipe de bombeiros a postos para o próximo turno de estudos!`,
        punchline: '#Prontidao24h #BravuraEHonra',
      }),
      ({ name, score, total }) => ({
        headline: '🧯 SIMULADO DE EVACUAÇÃO',
        caption: `${name} fez ${score} de ${total}. A evacuação foi segura, mas a Protecção Civil recomenda reforçar o plano de estudo.`,
        punchline: '#PlanoDeEmergencia #EstudoContinuo',
      }),
      ({ name, pct }) => ({
        headline: '🪜 ESCADA DE SALVAMENTO',
        caption: `${name} atingiu ${pct}% no duelo SPCB. Falta subir mais alguns degraus do regulamento para alcançar a nota máxima.`,
        punchline: '#PassoAPasso #SPCB2026',
      }),
    ],
    derrota: [
      ({ name, score, total }) => ({
        headline: '🚨 ALERTA DE INCÊNDIO NOS ESTUDOS',
        caption: `${name} acertou apenas ${score}/${total}. O instrutor do SPCB mandou pegar no extintor e reestudar os manuais de salvamento!`,
        punchline: '#ExtintorNaMão #RecomporOBatalhao',
      }),
      ({ name, pct }) => ({
        headline: '🧯 MANGUEIRA SEM PRESSÃO',
        caption: `${name} ficou nos ${pct}% de aproveitamento. Calma soldado! Abra o manual de bombeiros e acenda a chama do conhecimento.`,
        punchline: '#AumentarAPressao #SPCBResgate',
      }),
      ({ score, total }) => ({
        headline: '📢 ALARME DE EMERGÊNCIA DISPARADO',
        caption: `${score}/${total} acertos! A Protecção Civil acionou o plano de contingência: 3 simulados de estudo antes da próxima prova.`,
        punchline: '#PlanoDeContingencia #FocoTotal',
      }),
      ({ name, score, total }) => ({
        headline: '🔥 FOGO NO CADERNO DE MATÉRIA',
        caption: `${name} pontuou ${score}/${total}. Não deixe o conhecimento queimar! Pegue no código e apague as dúvidas.`,
        punchline: '#CombateAoErro #Persistencia',
      }),
      ({ name, pct }) => ({
        headline: '🚒 AUTO-TANQUE FICOU RETIDO',
        caption: `${name} fez ${pct}% no duelo SPCB. O quartel mandou reforçar a instrução teórica antes de voltar ao campo de operações.`,
        punchline: '#QuartelGeral #SPCBAngola',
      }),
    ],
  },

  SP: {
    vitoria: [
      ({ name, score, total, timeStr }) => ({
        headline: '🛡️ COMANDANTE DE CUSTÓDIA SP',
        caption: `${name} manteve custódia firme e gabaritou ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}! Nenhuma questão conseguiu escapar à vigilância sem falhas.`,
        punchline: '#CustódiaFirme #ServiçoPenitenciario #ReabilitaçãoEOrdem',
      }),
      ({ name, score, total }) => ({
        headline: '🔒 VIGILÂNCIA DE ELITE SP',
        caption: `${name} demonstrou disciplina de ferro no estabelecimento prisional acertando ${score} de ${total}! Portaria e guarita sob controlo absoluto.`,
        punchline: '#DisciplinaDeFerro #VigilanciaSemFalhas #SP2026',
      }),
      ({ name, pct }) => ({
        headline: '🏰 GUARITA IMPENETRÁVEL SP',
        caption: `${name} atingiu ${pct}% de aproveitamento no Serviço Penitenciário! Padrão de segurança máximo e reabilitação e ordem mantidos.`,
        punchline: '#SegurançaPenitenciaria #ReabilitaçãoEOrdem #CustódiaFirme',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🔑 CHAVE DA APROVAÇÃO SP',
        caption: `Com ${score}/${total} certas${timeStr ? ` em ${timeStr}` : ''}, ${name} abriu as portas da vaga no Serviço Penitenciário com custódia firme e rigor.`,
        punchline: '#CustódiaFirme #SPAngola #VigilanciaSemFalhas',
      }),
      ({ name, pct }) => ({
        headline: '🏅 SUPERINTENDENTE PRISIONAL',
        caption: `${name} dominou os regulamentos de reabilitação e ordem com ${pct}% de acertos! Disciplina de ferro exemplar no Serviço Penitenciário.`,
        punchline: '#DisciplinaDeFerro #ReabilitaçãoEOrdem #SP2026',
      }),
    ],
    empate: [
      ({ name, score, total }) => ({
        headline: '👮 GUARDA EM REGIME DE TURNO SP',
        caption: `${name} fez ${score}/${total} acertos. A custódia firme no estabelecimento foi mantida, mas a guarita exige mais atenção no próximo turno.`,
        punchline: '#VigilanciaSemFalhas #TurnoSP #ServiçoPenitenciario',
      }),
      ({ name, pct }) => ({
        headline: '⛓️ REABILITAÇÃO E ORDEM EM CURSO',
        caption: `${name} conseguiu ${pct}% no duelo do SP. A guarda mantém vigilância sem falhas, falta só afinar a lei da execução das penas.`,
        punchline: '#NormasPrisionais #SPReabilitação #CustódiaFirme',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🏰 POSTO DE SENTINELA SP',
        caption: `${name} registou ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}. O adjunto do presídio autorizou a rendição com alerta de disciplina de ferro.`,
        punchline: '#SemBaixarAGuarda #DisciplinaDeFerro #SP2026',
      }),
      ({ name, score, total }) => ({
        headline: '📋 INSPECÇÃO DE CUSTÓDIA PRISIONAL',
        caption: `${name} pontuou ${score} de ${total}. O serviço de vigilância aprovou o desempenho, exigindo reabilitação e ordem no estudo da lei penitenciária.`,
        punchline: '#ControloDisciplinar #ReabilitaçãoEOrdem',
      }),
      ({ name, pct }) => ({
        headline: '🔑 CONTROLO DE PORTARIA PENITENCIÁRIA',
        caption: `${name} ficou nos ${pct}% no simulado SP. A portaria está segura, mas é preciso manter vigilância sem falhas na legislação!`,
        punchline: '#VigilanciaSemFalhas #GuardaAlertaSP #CustódiaFirme',
      }),
    ],
    derrota: [
      ({ name, score, total }) => ({
        headline: '🚨 RECLUSO FUGIU DA MATÉRIA',
        caption: `${name} acertou apenas ${score}/${total}. O Diretor do Serviço Penitenciário ordenou custódia firme nos cadernos até ao próximo turno!`,
        punchline: '#ReforçarAGuarda #CustódiaFirme #EstudarSP',
      }),
      ({ name, pct }) => ({
        headline: '🔑 CHAVE PERDIDA NA PORTARIA SP',
        caption: `${name} ficou pelos ${pct}% de acertos. Calma oficial! Abra o regulamento do Serviço Penitenciário e imponha disciplina de ferro nos estudos.`,
        punchline: '#RecuperarOControlo #SPAngola #DisciplinaDeFerro',
      }),
      ({ score, total }) => ({
        headline: '📢 ALERTA DISCIPLINAR NO PRESÍDIO',
        caption: `${score}/${total} acertos! O Comando do SP determinou recolha à biblioteca do estabelecimento para manter reabilitação e ordem.`,
        punchline: '#RecolhaGeral #EstudoPenitenciario #ReabilitaçãoEOrdem',
      }),
      ({ name, score, total }) => ({
        headline: '🏰 GUARITA SEM SENTINELA SP',
        caption: `${name} pontuou ${score}/${total}. A disciplina de ferro exige vigilância sem falhas nas leis e estatutos do Serviço Penitenciário.`,
        punchline: '#DisciplinaDeFerro #VigilanciaSemFalhas #CustódiaFirme',
      }),
      ({ name, pct }) => ({
        headline: '👮 TURNO EXTRAPOLADO NA VIGILÂNCIA',
        caption: `${name} fez ${pct}% no duelo SP. Hora de render a guarda do cansaço e renovar a vigilância sem falhas para o próximo simulado!`,
        punchline: '#RendimentoSP #ReabilitaçãoEOrdem #ServiçoPenitenciario',
      }),
    ],
  },

  SME: {
    vitoria: [
      ({ name, score, total }) => ({
        headline: '🛂 CHEFE DE FRONTEIRA SME',
        caption: `${name} carimbou ${score}/${total} acertos no teste do SME! Passaporte para o concurso aprovado sem restrições migratórias.`,
        punchline: '#FronteiraSegura #ControloMigratorio #SME2026',
      }),
      ({ name, score, total }) => ({
        headline: '✈️ VISTO DE APROVAÇÃO EMITIDO',
        caption: `${name} autorizou a entrada no concurso acertando ${score} de ${total}! Posto aeroportuário do SME em festa total.`,
        punchline: '#PassaporteAprovado #SMEAngola',
      }),
      ({ name, pct }) => ({
        headline: '🌐 CONTROLO MIGRATÓRIO PERFEITO',
        caption: `${name} dominou ${pct}% das perguntas sobre a Lei de Migração! Nenhuma irregularidade transfronteiriça passou no duelo.`,
        punchline: '#LivreTrânsito #MestreDoSME',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '📋 CHECK-IN DE ELITE SME',
        caption: `Com ${score}/${total} certas${timeStr ? ` em ${timeStr}` : ''}, ${name} cumpriu todos os requisitos do controlo de fronteiras.`,
        punchline: '#FronteiraNacional #SMEPronto',
      }),
      ({ name }) => ({
        headline: '🏅 INSPECTOR SUPERIOR DO SME',
        caption: `${name} gabaritou os estatutos do Serviço de Migração e Estrangeiros! Carimbo ouro concedido pela comissão examinadora.`,
        punchline: '#CarimboDeOuro #AprovadoSME',
      }),
    ],
    empate: [
      ({ name, score, total }) => ({
        headline: '🛃 INSPEÇÃO DE FRONTEIRA SME',
        caption: `${name} somou ${score}/${total} no duelo SME. Documentação aceita com ressalvas, falta carimbar a lei de estrangeiros.`,
        punchline: '#AnaliseMigratoria #PostoSME',
      }),
      ({ name, pct }) => ({
        headline: '📋 VISTO EM ANÁLISE NO POSTO',
        caption: `${name} conseguiu ${pct}% no simulado do SME. O visto temporário de aprovação foi emitido, mas exige revisão dos manuais!`,
        punchline: '#EmAnalise #FocoNoSME',
      }),
      ({ name, score, total, timeStr }) => ({
        headline: '🛂 CONTROLO AEROPORTUÁRIO',
        caption: `${name} registou ${score}/${total} acertos${timeStr ? ` em ${timeStr}` : ''}. A travessia transfronteiriça correu bem, mas pede mais estudo na legislação.`,
        punchline: '#LivreTrânsitoEmConstrução #SME2026',
      }),
      ({ name, score, total }) => ({
        headline: '✈️ TRAVESSIA REGULAR',
        caption: `${name} fez ${score} de ${total}. O passaporte do candidato está em ordem, bastando afinar as regras de permanência.`,
        punchline: '#PassaporteEmOrdem #SMEForte',
      }),
      ({ name, pct }) => ({
        headline: '📑 PONTOS DE FRONTEIRA SOB FISCALIZAÇÃO',
        caption: `${name} atingiu ${pct}% no duelo. O Inspector de serviço aprovou a passagem, com ordem de revisão dos decretos migratórios.`,
        punchline: '#FiscalizacaoSME #EstudoMigratorio',
      }),
    ],
    derrota: [
      ({ name, score, total }) => ({
        headline: '⛔ ENTRADA RECUSADA NA FRONTEIRA',
        caption: `${name} fez apenas ${score}/${total}. O Inspector-Chefe do SME barrou a passagem no posto de controlo até decorar a Lei de Migração!`,
        punchline: '#EntradaBarrada #RevisarLeiSME',
      }),
      ({ name, pct }) => ({
        headline: '📄 PASSAPORTE SEM CARIMBO',
        caption: `${name} ficou nos ${pct}% de aproveitamento. Não desanime! Pegue no Diário da República e regularize o visto de estudos.`,
        punchline: '#RegularizarVisto #SMEAngola',
      }),
      ({ score, total }) => ({
        headline: '📢 ALERTA MIGRATÓRIO NO AEROPORTO',
        caption: `${score}/${total} acertos! O Serviço de Migração e Estrangeiros reteve o dossier até à realização de 3 novos simulados.`,
        punchline: '#DossierReticulo #FocoSME',
      }),
      ({ name, score, total }) => ({
        headline: '🛃 POSTO TERRESTRE RETIDO',
        caption: `${name} pontuou ${score}/${total}. O controlo transfronteiriço exige conhecimento afiado das fronteiras de Angola.`,
        punchline: '#FronteiraExigente #EstudarSME',
      }),
      ({ name, pct }) => ({
        headline: '✈️ VISTO EXPIRADO NO DUELO',
        caption: `${name} teve ${pct}% no teste do SME. Renove o stock de café, abra os regulamentos migratórios e conquiste o visto definitivo!`,
        punchline: '#RenovarVisto #PersistenciaSME',
      }),
    ],
  },
};

// Fallback generic MININT templates
const DEFAULT_TEMPLATES: Record<'vitoria' | 'empate' | 'derrota', TemplateBuilder[]> = {
  vitoria: [
    ({ name, score, total, timeStr, branch }) => ({
      headline: '⚡ GABARITO DE ELITE MININT',
      caption: timeStr
        ? `${name} liquidou ${score}/${total} perguntas em insanos ${timeStr}! O Comandante do ${branch} mandou examinar se usou inteligência artificial.`
        : `${name} gabaritou todas as ${total} questões! A farda número 1 do ${branch} já foi encomendada na alfaiataria central.`,
      punchline: '#GabaritoTotal #ComandoAprovou #MININT2026',
    }),
    ({ name, score, total, categoryName }) => ({
      headline: '🎖️ RAIO HUMANO DO DUELO',
      caption: `${name} destruiu a concorrência no ${categoryName || 'Duelo'} com ${score} acertos em ${total}! Nem o instrutor acertava tão rápido.`,
      punchline: '#NivelSuperintendente #Imparavel #Angola',
    }),
    ({ name, score, total, timeStr, branch }) => ({
      headline: '🏆 PERFEIÇÃO ABSOLUTA NA PROVA',
      caption: `Zero erros! ${name} acertou ${score}/${total}${timeStr ? ` em escassos ${timeStr}` : ''}. O lugar no ${branch} já é uma questão de tempo.`,
      punchline: '#100PorCento #FuturoComissario',
    }),
    ({ name, score, total }) => ({
      headline: '🚔 CANDIDATO DE ELITE APROVADO',
      caption: `${name} acertou ${score} de ${total} com grande precisão tática. O Decreto Presidencial de aprovação está a ser redigido.`,
      punchline: '#MININTAngola #AprovadoComLouvor',
    }),
    ({ name, pct, branch }) => ({
      headline: '🛡️ TÁTICA E DOMÍNIO DA LEI',
      caption: `${name} conquistou ${pct}% no teste do ${branch}. A Constituição da República de Angola apoia a sua aprovação!`,
      punchline: '#ConstituicaoDeAngola #DominioAbsoluto',
    }),
  ],
  empate: [
    ({ name, score, total, timeStr }) => ({
      headline: '🚔 FUTURO COMISSÁRIO EM AÇÃO',
      caption: `${name} somou ${score} de ${total} acertos${timeStr ? ` em ${timeStr}` : ''}. Falhou apenas o artigo que nem o Diário da República conhecia!`,
      punchline: '#ConsistenciaMilitar #AprovadoComLouvor',
    }),
    ({ name, score, total, pct }) => ({
      headline: '⚔️ VETERANO DOS DUELOS MININT',
      caption: `${name} fez ${pct}% de aproveitamento (${score}/${total}). O adversário já pediu transferência de pelotão!`,
      punchline: '#DominioDaMateria #RumoAoTopo',
    }),
    ({ name, score, total }) => ({
      headline: '🪖 RECRUTA EM INSTRUÇÃO INTENSIVA',
      caption: `${name} acertou ${score}/${total} perguntas. O Instrutor deu 20 flexões mas autorizou o almoço na parada!`,
      punchline: '#LutaETrabalho #FocoNosCadernos',
    }),
    ({ name, pct, branch }) => ({
      headline: '🚨 NA FRONTEIRA DA APROVAÇÃO',
      caption: `${name} conseguiu ${pct}% de aproveitamento. Falta só afinar a lei orgânica do ${branch} para atingir a nota máxima.`,
      punchline: '#QuaseLa #RevisarDiarioDaRepublica',
    }),
    ({ name, score, total }) => ({
      headline: '☕ SEGUNDO TURNO DE ESTUDOS',
      caption: `${name} pontuou ${score}/${total} no duelo. Pega um café bem forte e volta para as leis da Constituição de Angola!`,
      punchline: '#Persistencia #MININT2026',
    }),
  ],
  derrota: [
    ({ name, score, total, timeStr }) => ({
      headline: '🏃‍♂️ MARCHA DE RECOMPOSIÇÃO',
      caption: `${name} acertou apenas ${score} de ${total}${timeStr ? ` em ${timeStr}` : ''}. O Comandante ordenou leitura obrigatória da Constituição de Angola!`,
      punchline: '#EstrategiaDeEmergencia #EstudarMais',
    }),
    ({ name, pct }) => ({
      headline: '⚠️ ALERTA VERMELHO NA PARADA',
      caption: `${name} ficou pelos ${pct}% no duelo. Calma candidato! Até os grandes comandantes começaram a ler o regulamento do zero.`,
      punchline: '#SemRecuar #TreinoEHardcore',
    }),
    ({ score, total }) => ({
      headline: '📢 CONVOCAÇÃO URGENTE DA ACADEMIA',
      caption: `${score}/${total} acertos! O sistema sugere realizar 3 simulados de treino antes do próximo desafio 1v1.`,
      punchline: '#FocoEInstrução #MININTAngola',
    }),
    ({ name, score, total, branch }) => ({
      headline: '☕ CAFEÍNA E LEIS DA REPÚBLICA',
      caption: `${name} obteve ${score}/${total} no teste do ${branch}. Pega numa chávena de café e estuda o Decreto Presidencial.`,
      punchline: '#CafeinaELegislação #MININT2026',
    }),
    ({ name, pct }) => ({
      headline: '🪖 INSTRUÇÃO BÁSICA DE RECALIBRAÇÃO',
      caption: `${name} fez ${pct}% no simulado. A marcha é longa, mas com determinação a vaga no MININT será conquistada.`,
      punchline: '#RumoAoSucesso #MININT2026',
    }),
  ],
};

export function generateDynamicMemeText(params: MemeParams): MemeDataResponse {
  const total = Math.max(1, params.totalQuestions || 5);
  const score = Math.min(Math.max(0, params.score || 0), total);
  const pct = params.pct ?? Math.round((score / total) * 100);
  const name = params.displayName || 'Candidato';
  const branchKey = (params.branch || 'PNA').toUpperCase().trim();
  const rank = params.rankTitle || 'Agente';
  const timeStr = params.timeSeconds ? `${params.timeSeconds}s` : null;
  const categoryName = params.categoryName || 'Duelo MININT';

  // Determine outcome tier
  let outcome: 'vitoria' | 'empate' | 'derrota';
  if (pct >= 70) {
    outcome = 'vitoria';
  } else if (pct >= 40) {
    outcome = 'empate';
  } else {
    outcome = 'derrota';
  }

  // Get matching template list
  const branchMap = BRANCH_TEMPLATES[branchKey] || DEFAULT_TEMPLATES;
  const templateList = branchMap[outcome] || DEFAULT_TEMPLATES[outcome];

  // Prevent immediate repetition if lastIndex is provided
  let selectedIdx: number;
  if (templateList.length > 1 && params.lastIndex !== undefined) {
    const validIndices = templateList
      .map((_, i) => i)
      .filter((i) => i !== params.lastIndex);
    selectedIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
  } else {
    selectedIdx = Math.floor(Math.random() * templateList.length);
  }

  const chosenBuilder = templateList[selectedIdx];
  const memeResult = chosenBuilder({
    name,
    score,
    total,
    pct,
    timeStr,
    rank,
    categoryName,
    branch: branchKey,
  });

  return {
    ...memeResult,
    templateIndex: selectedIdx,
  };
}

export async function generateMemeCaption(params: MemeParams): Promise<MemeDataResponse> {
  return generateDynamicMemeText(params);
}


import { Question } from '../../types';

export const LEGISLACAO_MININT_QUESTIONS: Question[] = [
  // =========================================================================
  // GERAL / ESTATUTO ORGÂNICO DO MININT (Decreto Presidencial n.º 32/18)
  // =========================================================================
  {
    id: 'min_g_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o diploma legal que aprova o Estatuto Orgânico do Ministério do Interior (MININT) actualmente vigente?',
    options: [
      'Decreto Presidencial n.º 32/18, de 7 de Fevereiro',
      'Decreto Presidencial n.º 152/12, de 2 de Julho',
      'Lei n.º 26/22, de 22 de Agosto',
      'Decreto-Lei n.º 4/05, de 18 de Maio'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 32/18 (Estatuto Orgânico do MININT)',
    explanation: 'O Decreto Presidencial n.º 32/18, de 7 de Fevereiro, estabelece a organização, atribuições, competências e estrutura de todos os órgãos e serviços centrais e executivos do MININT.',
    difficulty: 'médio'
  },
  {
    id: 'min_g_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Constitui missão fundamental e atribuição geral do Ministério do Interior (MININT):',
    options: [
      'Garantir a ordem e segurança públicas, a protecção de pessoas e bens, a tranquilidade pública e a gestão penitenciária e migratória',
      'Gerir a exploração mineira de diamantes e hidrocarbonetos no mar',
      'Fixar a taxa de câmbio oficial da moeda nacional perante as divisas estrangeiras',
      'Proferir sentenças finais irrecorríveis em julgamentos penais de primeira instância'
    ],
    correctIndex: 0,
    lawReference: 'DP n.º 32/18 - Artigo 2.º (Missão e Atribuições Gerais do MININT)',
    explanation: 'O MININT é o departamento ministerial responsável pela segurança interna, ordem pública, investigação criminal, controlo migratório, custódia prisional e protecção civil e bombeiros.',
    difficulty: 'fácil'
  },
  {
    id: 'min_g_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Quais são os cinco Órgãos Executivos Centrais directos que integram a estrutura de actuação do Ministério do Interior?',
    options: [
      'PNA (Polícia Nacional), SIC (Investigação Criminal), SME (Migração e Estrangeiros), SPCB (Protecção Civil e Bombeiros) e SP (Serviço Penitenciário)',
      'FAA, SINSE, Tribunal Constitucional, ANPG e BNA',
      'Comissariado de Finanças, Inspecção do Trabalho, Alfândegas e Portos',
      'Polícia Municipal de Luanda, Polícia Fiscal Aduaneira e Capitanias'
    ],
    correctIndex: 0,
    lawReference: 'DP n.º 32/18 - Artigo 18.º e seguintes (Órgãos Executivos Directos)',
    explanation: 'Os 5 ramos executivos operacionais sob tutela directa do MININT são: PNA, SIC, SME, SPCB e SP.',
    difficulty: 'médio'
  },
  {
    id: 'min_g_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A quem responde e subordina-se politicamente o Ministro do Interior no exercício do Poder Executivo em Angola?',
    options: [
      'Directamente ao Presidente da República, Titular do Poder Executivo',
      'Ao Presidente da Assembleia Nacional',
      'Ao Juiz Presidente do Tribunal Supremo',
      'Ao Provedor de Justiça'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 120.º e DP n.º 32/18',
    explanation: 'Os Ministros de Estado e Ministros são auxiliares do Presidente da República na condução da política geral de governação e respondem perante o Chefe do Executivo.',
    difficulty: 'difícil'
  },

  // =========================================================================
  // 1. POLÍCIA NACIONAL DE ANGOLA (PNA)
  // =========================================================================
  {
    id: 'pna_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o lema oficial e histórico que sintetiza o espírito de missão da Polícia Nacional de Angola (PNA)?',
    options: [
      '"Pela Ordem e Pela Pátria, Ao Serviço da Nação"',
      '"Investigar para a Verdade e a Justiça"',
      '"Vigilância, Firmeza e Segurança nas Fronteiras"',
      '"Vida por Vidas, na Paz e na Emergência"'
    ],
    correctIndex: 0,
    lawReference: 'Polícia Nacional de Angola (PNA) - Doutrina Policial e Regulamento de Símbolos',
    explanation: 'O lema oficial da PNA é "Pela Ordem e Pela Pátria, Ao Serviço da Nação", simbolizando o compromisso inquebrantável do efectivo com a protecção do cidadão e do Estado.',
    difficulty: 'fácil'
  },
  {
    id: 'pna_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em que data se comemora anualmente o Dia da Polícia Nacional de Angola?',
    options: [
      '28 de Fevereiro',
      '11 de Novembro',
      '4 de Abril',
      '17 de Setembro'
    ],
    correctIndex: 0,
    lawReference: 'Efemérides da Polícia Nacional de Angola - 28 de Fevereiro de 1976',
    explanation: 'O dia 28 de Fevereiro assinala o juramento de bandeira e encerramento do primeiro curso de polícia após a Independência na Escola de Polícia Mártires do Kapolo em 1976.',
    difficulty: 'fácil'
  },
  {
    id: 'pna_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é a natureza institucional e jurídica da Polícia Nacional de Angola (PNA) nos termos da Lei n.º 6/20?',
    options: [
      'Instituição policial civil, uniformizada, armada e de estrutura hierarquizada e disciplinada',
      'Força militar de reserva estratégica sem funções de policiamento urbano',
      'Associação privada de segurança comunitária',
      'Empresa pública prestadora de serviços de vigilância por avença'
    ],
    correctIndex: 0,
    lawReference: 'Lei de Bases da PNA (Lei n.º 6/20, de 24 de Março) - Artigo 1.º e 2.º',
    explanation: 'A PNA é uma instituição policial uniformizada e armada, vocacionada para a manutenção da ordem pública, prevenção da criminalidade e segurança rodoviária e fiscal em todo o território.',
    difficulty: 'médio'
  },
  {
    id: 'pna_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A Unidade Especial da PNA vocacionada para a reposição célere da ordem pública e combate a situações de violência complexa e motins denomina-se:',
    options: [
      'PIR - Polícia de Intervenção Rápida',
      'Polícia Fiscal Aduaneira',
      'Direcção de Trânsito e Segurança Rodoviária',
      'Guarda Fronteira de Angola'
    ],
    correctIndex: 0,
    lawReference: 'Estrutura Orgânica da PNA - Unidades Especiais (PIR)',
    explanation: 'A PIR é a força de intervenção e reserva táctica da PNA, actuando em controlo de tumultos, antiterrorismo e operações de alto risco.',
    difficulty: 'médio'
  },
  {
    id: 'pna_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'No uso legítimo de armas de fogo e meios coercivos por agentes da PNA (Lei n.º 6/20 e Princípios Básicos da ONU), a força armada só pode ser empregue em casos de:',
    options: [
      'Absoluta necessidade, subsidiariedade e proporcionalidade em legítima defesa de vida humana contra perigo grave e iminente',
      'Desobediência verbal a uma ordem de circulação no trânsito',
      'Fuga desarmada de um suspeito de roubo simples de telemóvel',
      'Intimidação intimidatória sem prévia advertência em manifestações pacíficas'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 6/20 e Código de Conduta para os Encarregados da Aplicação da Lei (ONU)',
    explanation: 'O uso de arma de fogo é uma medida extrema de última ratio regida pelos princípios da necessidade estrita, adequação e proporcionalidade.',
    difficulty: 'difícil'
  },
  {
    id: 'pna_6',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A quem compete o comando supremo operacional da Polícia Nacional de Angola?',
    options: [
      'Ao Comandante-Geral da PNA',
      'Ao Governador Provincial da província mais populosa',
      'Ao Chefe do Estado-Maior das Forças Armadas',
      'Ao Presidente do Tribunal de Contas'
    ],
    correctIndex: 0,
    lawReference: 'Lei Orgânica da PNA (Lei n.º 6/20)',
    explanation: 'O Comandante-Geral da Polícia Nacional exerce a direcção técnica, operacional e disciplinar de todos os comandos provinciais e direcções da PNA.',
    difficulty: 'difícil'
  },

  // =========================================================================
  // 2. SERVIÇO DE INVESTIGAÇÃO CRIMINAL (SIC)
  // =========================================================================
  {
    id: 'sic_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o diploma que aprova a Lei Orgânica do Serviço de Investigação Criminal (SIC)?',
    options: [
      'Decreto Presidencial n.º 200/18, de 23 de Agosto',
      'Decreto Presidencial n.º 32/18, de 7 de Fevereiro',
      'Lei n.º 15/16, de 12 de Setembro',
      'Decreto Executivo n.º 10/11, de 4 de Janeiro'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 200/18 (Estatuto Orgânico do SIC)',
    explanation: 'O Decreto Presidencial n.º 200/18 regulamenta a orgânica, carreiras e competências técnico-científicas do Serviço de Investigação Criminal em Angola.',
    difficulty: 'médio'
  },
  {
    id: 'sic_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Constitui atribuição nuclear e especializada do Serviço de Investigação Criminal (SIC):',
    options: [
      'A prevenção, investigação criminal e instrução processual preparatória de crimes sob direcção funcional do Ministério Público',
      'A cobrança de imposto predial e fiscalização aduaneira marítima',
      'A fiscalização dos semáforos e aplicação de coimas de trânsito ligeiro',
      'A guarda estática das chaves das portas dos tribunais de comarca'
    ],
    correctIndex: 0,
    lawReference: 'DP n.º 200/18 e Código de Processo Penal Angolano (Lei n.º 39/20)',
    explanation: 'O SIC é o órgão de polícia criminal superior do Estado responsável por investigar delitos, recolher provas periciais e submeter os autos ao Ministério Público.',
    difficulty: 'fácil'
  },
  {
    id: 'sic_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'No processo penal angolano (Lei n.º 39/20), os investigadores do SIC actuam na fase de Instrução Preparatória sob dependência funcional de que entidade?',
    options: [
      'Do Ministério Público (Procurador da República)',
      'Do Governador Provincial',
      'Do Presidente da Assembleia Nacional',
      'Do Comandante do Quartel Militar local'
    ],
    correctIndex: 0,
    lawReference: 'Código do Processo Penal (Lei n.º 39/20) - Direcção da Instrução Preparatória',
    explanation: 'Nos termos do Código do Processo Penal, o Ministério Público dirige a instrução preparatória, sendo coadjuvado tecnicamente pelos órgãos de polícia criminal (SIC).',
    difficulty: 'médio'
  },
  {
    id: 'sic_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o ramo pericial do SIC encarregue da recolha e análise de vestígios dactiloscópicos, balística e DNA nos locais de crime?',
    options: [
      'Laboratório Central de Criminalística (LCC)',
      'Direcção de Finanças e Património',
      'Gabinete de Relações Públicas',
      'Secção de Transporte Automóvel'
    ],
    correctIndex: 0,
    lawReference: 'Orgânica do SIC - Direcção de Criminalística',
    explanation: 'A Criminalística do SIC realiza exames periciais, identificação lofoscópica, toxicologia forense e perícias biológicas com suporte científico.',
    difficulty: 'fácil'
  },
  {
    id: 'sic_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A quem compete autorizar as escutas telefónicas e a quebra de sigilo bancário em investigações do SIC, nos termos do Código do Processo Penal?',
    options: [
      'Ao Juiz de Garantias durante a fase de instrução preparatória',
      'Ao próprio Inspector que conduz a investigação sem qualquer despacho',
      'Ao Director Provincial do SIC em acta interna confidencial',
      'À operadora de telecomunicações mediante simples ofício de rotina'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 39/20 (Código do Processo Penal) - Juiz de Garantias e Meios Especiais de Obtenção de Prova',
    explanation: 'A realização de escutas e quebra de sigilo constitucional exige mandado fundamentado e autorização prévia privativa do Juiz de Garantias.',
    difficulty: 'difícil'
  },

  // =========================================================================
  // 3. SERVIÇO DE MIGRAÇÃO E ESTRANGEIROS (SME)
  // =========================================================================
  {
    id: 'sme_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o diploma legal que estabelece o Estatuto Orgânico do Serviço de Migração e Estrangeiros (SME)?',
    options: [
      'Decreto Presidencial n.º 107/20, de 16 de Abril',
      'Decreto Presidencial n.º 32/18, de 7 de Fevereiro',
      'Lei n.º 2/07, de 31 de Agosto',
      'Decreto Executivo n.º 45/14, de 12 de Março'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 107/20 (Estatuto Orgânico do SME)',
    explanation: 'O Decreto Presidencial n.º 107/20 aprova a organização e funcionamento do SME como órgão encarregue da política migratória em Angola.',
    difficulty: 'médio'
  },
  {
    id: 'sme_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Constitui missão primordial e atribuição estatutária do Serviço de Migração e Estrangeiros (SME):',
    options: [
      'O controlo da entrada, trânsito, permanência, residência e saída de cidadãos nacionais e estrangeiros nos postos de fronteira terrestre, aérea e marítima',
      'A construção e pavimentação de autoestradas nacionais',
      'O combate directo a incêndios florestais nas províncias do interior',
      'A emissão de cartas de condução para veículos pesados de carga'
    ],
    correctIndex: 0,
    lawReference: 'DP n.º 107/20 e Lei n.º 13/19 (Regime Jurídico dos Estrangeiros na RA)',
    explanation: 'O SME assegura a soberania migratória do país, a fiscalização da permanência de estrangeiros e a emissão de passaportes e vistos de entrada.',
    difficulty: 'fácil'
  },
  {
    id: 'sme_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da Lei sobre o Regime Jurídico dos Estrangeiros (Lei n.º 13/19), o estrangeiro em situação de permanência ilegal em território angolano fica sujeito a:',
    options: [
      'Processo de notificação para abandono voluntário ou expulsão administrativa/judicial do país e interdição temporária de reentrada',
      'Concessão compulsória de nacionalidade angolana originária',
      'Isenção total de vistos e entrega gratuita de terras agricultáveis',
      'Emprego obrigatório nos órgãos da função pública sem concurso'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 (Lei sobre o Regime Jurídico dos Cidadãos Estrangeiros em Angola)',
    explanation: 'A infracção às normas de permanência migratória sujeita o infractor a coima, detenção em centro de acolhimento e expulsão territorial nos termos da lei.',
    difficulty: 'médio'
  },
  {
    id: 'sme_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o documento oficial de viagem emitido pelo SME que habilita os cidadãos angolanos a viajar para o exterior do país?',
    options: [
      'Passaporte Nacional (Ordinário)',
      'Bilhete de Identidade simples',
      'Cartão de Eleitor',
      'Livrete de circulação rodoviária'
    ],
    correctIndex: 0,
    lawReference: 'Regulamento de Passaportes Nacionais (Decreto Presidencial n.º 21/20)',
    explanation: 'O Passaporte da República de Angola é o documento oficial individual emitido pelo SME para deslocação internacional.',
    difficulty: 'fácil'
  },
  {
    id: 'sme_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Regime de Isenção e Simplificação de Vistos de Turismo aprovado por Decreto Presidencial abrange cidadãos de diversos países para estadas de curta duração com o propósito de:',
    options: [
      'Promover o turismo, o comércio e o investimento estrangeiro sem descurar o controlo fronteiriço biométrico',
      'Eliminar permanentemente a fiscalização migratória nos aeroportos',
      'Permitir o exercício de cargos políticos por não nacionais',
      'Substituir a emissão de passaportes angolanos no exterior'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 189/23 (Medidas de Isenção e Simplificação de Vistos)',
    explanation: 'A política migratória moderna conjuga a facilitação económica com a rigorosa verificação de segurança no Sistema Integrado de Gestão Migratória.',
    difficulty: 'difícil'
  },

  // =========================================================================
  // 4. SERVIÇO DE PROTECÇÃO CIVIL E BOMBEIROS (SPCB)
  // =========================================================================
  {
    id: 'spcb_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o diploma que aprova a Lei de Bases da Protecção Civil na República de Angola?',
    options: [
      'Lei n.º 28/03, de 7 de Novembro',
      'Decreto Presidencial n.º 32/18, de 7 de Fevereiro',
      'Lei n.º 14/11, de 18 de Agosto',
      'Decreto-Lei n.º 5/06, de 22 de Março'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 28/03 (Lei de Bases da Protecção Civil em Angola)',
    explanation: 'A Lei n.º 28/03 estabelece as bases gerais da protecção civil, prevenção de riscos colectivos e socorro a populações em situações de calamidade ou catástrofe.',
    difficulty: 'médio'
  },
  {
    id: 'spcb_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Constitui missão prioritária e permanente do Serviço de Protecção Civil e Bombeiros (SPCB):',
    options: [
      'A prevenção e combate a incêndios, busca, salvamento, socorro e assistência a vítimas de catástrofes e acidentes graves',
      'A investigação de crimes económicos e financeiros complexos',
      'A concessão de vistos de trabalho para cidadãos estrangeiros',
      'A vigilância alfandegária de mercadorias no porto de Luanda'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 28/03 e Regulamento do SPCB (MININT)',
    explanation: 'O lema tradicional dos bombeiros "Vida por Vidas" sintetiza a prontidão de socorro em incêndios, desabamentos, inundações e acidentes terrestres e aquáticos.',
    difficulty: 'fácil'
  },
  {
    id: 'spcb_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em que data se comemora em Angola o Dia Nacional do Bombeiro?',
    options: [
      '30 de Novembro',
      '11 de Novembro',
      '4 de Fevereiro',
      '28 de Fevereiro'
    ],
    correctIndex: 0,
    lawReference: 'Efemérides do SPCB - 30 de Novembro',
    explanation: 'O dia 30 de Novembro é consagrado ao Bombeiro Angolano, honrando a coragem e a entrega abnegada dos efectivos na salvaguarda de vidas e bens da comunidade.',
    difficulty: 'fácil'
  },
  {
    id: 'spcb_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o número telefónico de emergência nacional de chamada gratuita para acionar imediatamente os Bombeiros (SPCB)?',
    options: [
      '115',
      '113',
      '112',
      '111'
    ],
    correctIndex: 0,
    lawReference: 'Linhas Telefónicas Nacionais de Emergência (MININT/INACOM)',
    explanation: 'O 115 é a linha de emergência directa do Serviço de Protecção Civil e Bombeiros (enquanto o 113 é da Polícia Nacional).',
    difficulty: 'fácil'
  },
  {
    id: 'spcb_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Comissão Nacional de Protecção Civil (CNPC) é o órgão multissectorial coordenado pelo Ministro do Interior com competência para:',
    options: [
      'Planear, coordenar e activar os planos de emergência e contingência nacionais em casos de catástrofes naturais, epidemias e calamidades públicas',
      'Fixar os preços de venda de extintores de incêndio no comércio local',
      'Autorizar a construção de refinarias de petróleo no alto mar',
      'Realizar julgamentos sumários de piromaníacos sem intervenção judicial'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 28/03 (Lei de Bases da Protecção Civil) - Estrutura da CNPC',
    explanation: 'A CNPC articula todos os ministérios (Saúde, Obras Públicas, Defesa, Ambiente) para responder a grandes emergências de âmbito nacional ou provincial.',
    difficulty: 'difícil'
  },

  // =========================================================================
  // 5. SERVIÇO PENITENCIÁRIO (SP)
  // =========================================================================
  {
    id: 'sp_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é a principal finalidade da execução das penas de prisão no Sistema Penitenciário Angolano (Lei n.º 8/08)?',
    options: [
      'A reinserção social do recluso, a reeducação e a prevenção da prática de novos crimes',
      'O castigo físico corporal doloroso e a vingança privada das vítimas',
      'A exploração comercial do trabalho forçado perpétuo sem remuneração nem formação',
      'O isolamento absoluto em masmorras sem acesso a alimentação nem cuidados de saúde'
    ],
    correctIndex: 0,
    lawReference: 'Lei Penitenciária (Lei n.º 8/08, de 29 de Agosto) - Artigo 3.º (Princípios)',
    explanation: 'A Lei Penitenciária consagra o respeito pela dignidade humana do cidadão privado de liberdade e tem como meta a sua capacitação profissional e reintegração harmónica na sociedade.',
    difficulty: 'médio'
  },
  {
    id: 'sp_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em que data se assinala anualmente o Dia do Serviço Penitenciário de Angola?',
    options: [
      '20 de Março',
      '11 de Novembro',
      '4 de Fevereiro',
      '28 de Fevereiro'
    ],
    correctIndex: 0,
    lawReference: 'Efemérides do Serviço Penitenciário (MININT) - 20 de Março de 1979',
    explanation: 'O dia 20 de Março assinala a criação e estruturação do Serviço Penitenciário em Angola pelo Decreto n.º 23/79.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da Lei n.º 8/08, nenhum cidadão pode ser admitido num estabelecimento prisional sem:',
    options: [
      'Mandado de condução à prisão emitido por autoridade judiciária competente (Juiz ou Magistrado do MP) ou certidão de sentença condenatória',
      'Autorização verbal por telefone de um funcionário da administração municipal',
      'Entrega de uma garantia em ouro na secretaria do estabelecimento',
      'Consentimento expresso assinado pela família do detido'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 (Lei Penitenciária) - Artigo 14.º (Admissão de Reclusos)',
    explanation: 'A legalidade da privação de liberdade exige mandado formal e ordem escrita irrevogável de autoridade judiciária legalmente competente.',
    difficulty: 'médio'
  },
  {
    id: 'sp_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O lema do Serviço Penitenciário "Reeducar para Reintegrar" significa que o sistema prisional foca em:',
    options: [
      'Educação escolar, formação profissional técnico-agrícola e apoio psicológico para o recluso voltar à sociedade',
      'Apenas manter as celas trancadas 24 horas por dia',
      'Cobrar rendas diárias pelas camas dos reclusos',
      'Separar os reclusos por time de futebol de preferência'
    ],
    correctIndex: 0,
    lawReference: 'Doutrina Penitenciária do MININT - Reeducação e Reinserção Social',
    explanation: 'Os estabelecimentos penitenciários promovem polos de produção agro-pecuária e oficinas profissionais para garantir que o condenado aprenda um ofício digno.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Instituto da Liberdade Condicional (Código Penal - Lei n.º 38/20 e Lei Penitenciária) pode ser concedido ao condenado que tenha cumprido:',
    options: [
      'Metade ou dois terços da pena (conforme a gravidade), demonstre bom comportamento carcerário e prognóstico favorável de reinserção',
      'Apenas 5 dias de prisão preventiva sem necessidade de parecer',
      'O pagamento de uma indemnização confidencial ao director do presídio',
      'Qualquer período desde que seja o primeiro recluso a pedir no ano'
    ],
    correctIndex: 0,
    lawReference: 'Código Penal Angolano (Lei n.º 38/20) - Artigo 61.º (Liberdade Condicional)',
    explanation: 'A liberdade condicional é uma decisão jurisdicional privativa do tribunal após análise do relatório de evolução prisional do Serviço Penitenciário.',
    difficulty: 'difícil'
  }
];

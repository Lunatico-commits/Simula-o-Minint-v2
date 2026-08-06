import { Question, QuestionCategory, AcademicLevel } from '../types';

export const QUESTION_BANK: Question[] = [
  // ==========================================
  // 1. NÍVEL: 9.ª CLASSE (AGENTES DE 2.ª CLASSE / APOIO)
  // ==========================================

  // --- LEGISLAÇÃO BÁSICA DO MININT & CIDADANIA (9.ª CLASSE) ---
  {
    id: 'g9_leg_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o principal dever de um Agente da Polícia Nacional de Angola perante um cidadão que solicita auxílio na via pública?',
    options: [
      'Prestar assistência imediata com cortesia, aprumo e respeito pela dignidade humana',
      'Exigir o pagamento de uma taxa antes de prestar qualquer esclarecimento',
      'Encaminhar o cidadão exclusivamente para uma empresa privada de segurança',
      'Ignorar o pedido se o agente estiver no final do seu turno de serviço'
    ],
    correctIndex: 0,
    lawReference: 'Regulamento de Disciplina da PNA - Deveres Gerais do Agente',
    explanation: 'O agente de autoridade tem o dever de permanente disponibilidade e prontidão para socorrer e orientar os cidadãos, respeitando escrupulosamente a dignidade humana e os direitos fundamentais.',
    difficulty: 'fácil'
  },
  {
    id: 'g9_leg_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O Serviço de Protecção Civil e Bombeiros (SPCB) atende emergências através do número nacional gratuito de socorro. Qual é esse número?',
    options: [
      '113',
      '115',
      '118',
      '111'
    ],
    correctIndex: 1,
    lawReference: 'Linhas de Emergência Nacional de Angola',
    explanation: 'O número 115 é a linha de emergência directa do Serviço de Protecção Civil e Bombeiros em Angola. O 113 pertence à Polícia Nacional.',
    difficulty: 'fácil'
  },
  {
    id: 'g9_leg_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a cor predominantemente associada ao fardamento do Serviço Penitenciário (SP) de Angola?',
    options: [
      'Azul-escuro com listas amarelas',
      'Verde-azeitona / caqui operacional',
      'Vermelho e preto',
      'Branco total com boina azul'
    ],
    correctIndex: 1,
    lawReference: 'Regulamento de Uniformes e Insígnias do Serviço Penitenciário',
    explanation: 'O uniforme institucional do Serviço Penitenciário utiliza a tonalidade verde-azeitona/caqui, identificando as suas forças de guarda e custódia prisional.',
    difficulty: 'fácil'
  },
  {
    id: 'g9_leg_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O documento oficial de identificação emitido pelo Estado Angolano que prova a cidadania nacional designa-se por:',
    options: [
      'Passe de Travessia Fronteiriça',
      'Bilhete de Identidade (BI)',
      'Cartão de Eleitor Provisório',
      'Cédula Pessoal Marítima'
    ],
    correctIndex: 1,
    lawReference: 'Lei da Identificação Civil e do Bilhete de Identidade de Cidadão Nacional',
    explanation: 'O Bilhete de Identidade (BI) é o documento autêntico bastante para provar a identidade civil e a nacionalidade angolana do cidadão.',
    difficulty: 'fácil'
  },

  // --- LÍNGUA PORTUGUESA BÁSICA (9.ª CLASSE) ---
  {
    id: 'g9_port_1',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual das alternativas apresenta a divisão silábica CORRECTA da palavra "SEGURA"?',
    options: [
      'SE - GU - RA',
      'SEG - U - RA',
      'SEGU - RA',
      'S - E - GU - RA'
    ],
    correctIndex: 0,
    lawReference: 'Gramática de Língua Portuguesa - Divisão Silábica',
    explanation: 'A palavra "segura" é trissílaba e divide-se foneticamente em SE - GU - RA.',
    difficulty: 'fácil'
  },
  {
    id: 'g9_port_2',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Assinale o plural correcto do substantivo "ORDEM":',
    options: [
      'Ordens',
      'Ordenses',
      'Ordemes',
      'Ordenss'
    ],
    correctIndex: 0,
    lawReference: 'Morfologia - Plural dos Substantivos terminados em M',
    explanation: 'Os substantivos terminados em "m" fazem o plural mudando o "m" para "ns" (Ordem -> Ordens).',
    difficulty: 'fácil'
  },
  {
    id: 'g9_port_3',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Identifique o sinónimo (palavra com significado idêntico ou semelhante) de "PROTEGER":',
    options: [
      'Defender / Guardar',
      'Atacar / Agredir',
      'Abandonar / Negligenciar',
      'Destruir / Danificar'
    ],
    correctIndex: 0,
    lawReference: 'Lexicologia - Sinonímia na Língua Portuguesa',
    explanation: 'Proteger significa abrigar, resguardar, defender ou guardar contra o perigo.',
    difficulty: 'fácil'
  },

  // --- MATEMÁTICA ELEMENTAR & HISTÓRIA/GEOGRAFIA (9.ª CLASSE) ---
  {
    id: 'g9_mat_1',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral & Matemática',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Se uma patrulha da PNA percorrer 12 quilómetros na primeira hora e 15 quilómetros na segunda hora, quantos quilómetros percorreu no total?',
    options: [
      '27 km',
      '30 km',
      '22 km',
      '25 km'
    ],
    correctIndex: 0,
    lawReference: 'Raciocínio Quantitativo Elemental',
    explanation: 'A soma simples das distâncias percorrida é: 12 km + 15 km = 27 km.',
    difficulty: 'fácil'
  },
  {
    id: 'g9_geo_1',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a Capital da República de Angola?',
    options: [
      'Luanda',
      'Huambo',
      'Benguela',
      'Lubango'
    ],
    correctIndex: 0,
    lawReference: 'Constituição da República de Angola - Capital do País',
    explanation: 'Luanda é a capital política e administrativa da República de Angola.',
    difficulty: 'fácil'
  },
  {
    id: 'g9_geo_2',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o maior rio cujo curso se desenvolve totalmente em território angolano?',
    options: [
      'Rio Kwanza',
      'Rio Cunene',
      'Rio Cubango',
      'Rio Zaire'
    ],
    correctIndex: 0,
    lawReference: 'Geografia Física de Angola',
    explanation: 'O Rio Kwanza tem a sua nascente no Mungo (Huambo) e foz no Oceano Atlântico (Barra do Kwanza), sendo o maior rio exclusivamente nacional.',
    difficulty: 'fácil'
  },


  // ==========================================
  // 2. NÍVEL: ENSINO MÉDIO (SUBCHEFES & TÉCNICOS)
  // ==========================================

  // --- LEGISLAÇÃO ORGÂNICA DO MININT (ENSINO MÉDIO) ---
  {
    id: 'gm_leg_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos do Decreto Presidencial n.º 32/18 (Estatuto Orgânico do MININT), qual é a entidade executiva máxima responsável pela gestão global do Ministério do Interior?',
    options: [
      'O Ministro do Interior',
      'O Comandante Geral da Polícia Nacional',
      'O Director Geral do SIC',
      'O Chefe do Estado Maior General das FAA'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 32/18 - Estatuto Orgânico do MININT',
    explanation: 'O Ministro do Interior é o órgão singular que dirige, coordena e orienta toda a actividade do Ministério do Interior e dos seus órgãos executivos centrais.',
    difficulty: 'médio'
  },
  {
    id: 'gm_leg_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Serviço de Investigação Criminal (SIC) enquadra-se no MININT como um órgão executivo central encarregado de:',
    options: [
      'Instrução preparatória dos processos-crime e investigação de infracções penais',
      'Emissão de vistos de trabalho para cidadãos expatriados',
      'Policiamento ostensivo e regulação do trânsito automóvel',
      'Segurança e manutenção de edifícios governamentais'
    ],
    correctIndex: 0,
    lawReference: 'Estatuto Orgânico do SIC - Decreto Presidencial n.º 211/19',
    explanation: 'O SIC tem a incumbência de investigar os crimes de acção pública e semi-pública, prevenir a criminalidade organizada e instruir os respectivos processos penais.',
    difficulty: 'médio'
  },
  {
    id: 'gm_leg_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Em que consistem as medidas preventivas do Serviço de Migração e Estrangeiros (SME) relativamente à permanência de estrangeiros ilegais?',
    options: [
      'Notificação para abandono voluntário e expulsão administrativa nos termos da lei',
      'Incarceramento perpétuo sem decisão judicial',
      'Concessão automática de nacionalidade angolana',
      'Aplicação de multas cobradas sem recibo oficial'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 - Regime Jurídico dos Estrangeiros na República de Angola',
    explanation: 'Estrangeiros em situação irregular são sujeitos a notificação para abandono do país ou expulsão compulsiva assegurada pelo SME conforme regulamentação legal.',
    difficulty: 'médio'
  },

  // --- RACIOCÍNIO LÓGICO & INFORMÁTICA BÁSICA (ENSINO MÉDIO) ---
  {
    id: 'gm_inf_1',
    category: 'cultura_geral',
    categoryName: 'Informática e Raciocínio Lógico',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'No âmbito da segurança da informação institucional, qual é a boa prática recomendada ao criar senhas de acesso aos sistemas do MININT?',
    options: [
      'Combinar letras maiúsculas, minúsculas, números e caracteres especiais com no mínimo 8 a 12 caracteres',
      'Utilizar a data de nascimento ou o próprio nome em minúsculas',
      'Anotar a senha num papel colado ao monitor do computador',
      'Partilhar a senha com todos os colegas de gabinete'
    ],
    correctIndex: 0,
    lawReference: 'Boas Práticas de Segurança da Informação e Cibersegurança',
    explanation: 'Senhas fortes e complexas reduzem substancialmente os riscos de invasão, garantindo a confidencialidade das bases de dados do Estado.',
    difficulty: 'médio'
  },
  {
    id: 'gm_log_1',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Observe a sequência numérica: 3, 6, 12, 24, 48, ... Qual é o próximo número desta progressão?',
    options: [
      '96',
      '60',
      '72',
      '80'
    ],
    correctIndex: 0,
    lawReference: 'Raciocínio Lógico - Sequências Geométricas',
    explanation: 'A sequência multiplica cada termo por 2 (3x2=6; 6x2=12; 12x2=24; 24x2=48; 48x2=96).',
    difficulty: 'médio'
  },
  {
    id: 'gm_log_2',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Se 4 agentes do SIC realizam a perícia de um local em 6 horas, quantas horas levariam 8 agentes, trabalhando no mesmo ritmo, para realizar a mesma tarefa?',
    options: [
      '3 horas',
      '4 horas',
      '12 horas',
      '2 horas'
    ],
    correctIndex: 0,
    lawReference: 'Matemática - Regra de Três Inversamente Proporcional',
    explanation: 'Trata-se de grandeza inversamente proporcional: dobrando o número de agentes (de 4 para 8), o tempo necessário reduz-se para metade (de 6 para 3 horas).',
    difficulty: 'médio'
  },
  {
    id: 'gm_log_3',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    question: 'Em um destacamento da PNA com 150 efectivos, 60% estão afectos ao patrulhamento ostensivo. Quantos agentes estão em patrulhamento?',
    options: [
      '90 agentes',
      '80 agentes',
      '100 agentes',
      '75 agentes'
    ],
    correctIndex: 0,
    lawReference: 'Matemática - Percentagem e Cálculo Proporcional',
    explanation: 'Cálculo de percentagem: 60% de 150 = (60 / 100) * 150 = 0.6 * 150 = 90 agentes.',
    difficulty: 'fácil'
  },
  {
    id: 'gm_adm_1',
    category: 'cultura_geral',
    categoryName: 'Administração Pública',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual dos princípios da Administração Pública Angolana exige que os agentes do Estado pautem a sua conduta com imparcialidade, sem privilégios ou descriminações?',
    options: [
      'Princípio da Imparcialidade e Igualdade',
      'Princípio da Supressão de Direitos',
      'Princípio da Discricionariedade Absoluta',
      'Princípio da Confidencialidade Pessoal'
    ],
    correctIndex: 0,
    lawReference: 'Código do Procedimento Administrativo - Decreto Legislativo Presidencial n.º 2/13',
    explanation: 'A Administração Pública deve tratar de forma justa e igual todos os cidadãos, proibindo discriminações injustificadas ou favorecimentos institucionais.',
    difficulty: 'médio'
  },

  // --- LÍNGUA PORTUGUESA & REDACÇÃO OFICIAL (ENSINO MÉDIO) ---
  {
    id: 'gm_port_1',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Na redacção de um relatório oficial policial, a linguagem utilizada deve caracterizar-se sobretudo por ser:',
    options: [
      'Clara, objectiva, precisa e isenta de marcas de subjectividade',
      'Poética, figurada e repleta de gírias locais',
      'Ambígua e informal para aproximar-se do leitor',
      'Prolixa e carregada de termos coloquiais do quotidiano'
    ],
    correctIndex: 0,
    lawReference: 'Técnicas de Redacção de Documentos Oficiais e Policiais',
    explanation: 'Documentos oficiais do Estado exigem rigor terminológico, concisão, clareza e neutralidade absoluta.',
    difficulty: 'médio'
  },


  // ==========================================
  // 3. NÍVEL: ENSINO SUPERIOR (OFICIAIS & ESPECIALISTAS)
  // ==========================================

  // --- DIREITO CONSTITUCIONAL & CRA (ENSINO SUPERIOR) ---
  {
    id: 'gs_cra_1',
    category: 'direito_penal',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Nos termos da Constituição da República de Angola (CRA), qual é o órgão soberano a quem compete o poder legislativo do Estado?',
    options: [
      'A Assembleia Nacional',
      'O Tribunal Constitucional',
      'O Conselho da República',
      'A Procuradoria-Geral da República'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 141.º da Constituição da República de Angola (CRA)',
    explanation: 'A Assembleia Nacional é o parlamento da República de Angola, órgão soberano que representa todos os angolanos e expressa a vontade legislativa do povo.',
    difficulty: 'médio'
  },
  {
    id: 'gs_cra_2',
    category: 'direito_penal',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O procedimento de Habeas Corpus previsto no artigo 68.º da CRA pode ser impetrado por qualquer cidadão quando verificada qual situação jurídica?',
    options: [
      'Prisão ou detenção ilegal ou abuso de poder que atente contra a liberdade ambulatória',
      'Atraso na promoção de carreira administrativa ou pagamento de subsídios',
      'Divergência contratual em transacção comercial de bens imóveis',
      'Aplicação de processo disciplinar interno sem pena de demissão'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 68.º da Constituição da República de Angola - Habeas Corpus',
    explanation: 'O Habeas Corpus é a providência extraordinária de tutela urgente destinada a fazer cessar prisões ou detenções arbitrárias, ilegais ou abusivas.',
    difficulty: 'difícil'
  },

  // --- LEI GERAL DO TRABALHO EM FUNÇÕES PÚBLICAS - LEI N.º 26/22 (ENSINO SUPERIOR) ---
  {
    id: 'gs_lgt_1',
    category: 'legislacao_minint',
    categoryName: 'Lei Geral do Trabalho em Funções Públicas',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'De acordo com a Lei n.º 26/22 (Lei Geral do Trabalho em Funções Públicas em Angola), qual é o prazo prescricional do procedimento disciplinar contra um funcionário público a contar da data em que a infracção foi cometida?',
    options: [
      '1 Ano a contar do cometimento da infracção',
      '5 Anos consecutivos sem interrupção',
      '15 Dias úteis a contar da nota de culpa',
      'Não prescreve nunca em nenhuma circunstância'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 - Lei Geral do Trabalho em Funções Públicas (Art. 138.º)',
    explanation: 'O procedimento disciplinar prescreve decorrido 1 ano sobre a data em que a infracção tenha sido praticada, ressalvadas infracções que constituam também crime.',
    difficulty: 'difícil'
  },
  {
    id: 'gs_lgt_2',
    category: 'legislacao_minint',
    categoryName: 'Lei Geral do Trabalho em Funções Públicas',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A avaliação do desempenho dos funcionários públicos visa primordialmente:',
    options: [
      'Melhorar a eficiência do serviço, fundamentar a progressão na carreira e reconhecer o mérito profissional',
      'Punir financeiramente os funcionários mais antigos da instituição',
      'Substituir a necessidade de concursos públicos de ingresso',
      'Permitir transferências compulsivas sem fundamentação jurídica'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 - Regime de Avaliação de Desempenho na Função Pública',
    explanation: 'A avaliação contínua do desempenho mede o cumprimento dos objectivos individuais e institucionais, incentivando a excelência e a meritocracia.',
    difficulty: 'médio'
  },

  // --- ÉTICA, DEONTOLOGIA & PROBIDADE PÚBLICA (ENSINO SUPERIOR) ---
  {
    id: 'gs_etic_1',
    category: 'cultura_geral',
    categoryName: 'Ética e Deontologia Profissional',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Nos termos da Lei da Probidade Pública (Lei n.º 3/10), constitui acto de corrupção passiva ou enriquecimento ilícito do agente público:',
    options: [
      'Aceitar vantagem patrimonial ou oferta em dinheiro para praticar ou omitir acto oficioso do seu cargo',
      'Recusar gratificações não devidas oferecidas por utentes dos serviços',
      'Denunciar às autoridades competentes indícios de fraude em licitação',
      'Participar em acções de formação promovidas pelo próprio ministério'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 - Lei da Probidade Pública',
    explanation: 'O recebimento de benefícios indevidos no exercício da função pública atenta directamente contra a probidade, legalidade e moralidade administrativa.',
    difficulty: 'difícil'
  },

  // --- DIREITO PENAL & PROCESSUAL PENAL AVANÇADO (ENSINO SUPERIOR) ---
  {
    id: 'gs_pen_1',
    category: 'direito_penal',
    categoryName: 'Direito Penal & Processual',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'No novo Código de Processo Penal Angolano (Lei n.º 39/20), qual é a entidade judiciária competente para decretar a medida de coacção pessoal de Prisão Preventiva?',
    options: [
      'O Juiz de Garantias',
      'O Comandante Provincial da Polícia Nacional',
      'O Director Provincial do SIC',
      'O Chefe do Posto Policial de Turno'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 39/20 - Código de Processo Penal Angolano (Juiz de Garantias)',
    explanation: 'A aplicação da prisão preventiva é de competência reservada e exclusiva do Juiz de Garantias na fase de instrução preparatória, reforçando o controlo jurisdicional das liberdades.',
    difficulty: 'difícil'
  },

  // ==========================================
  // 4. QUESTÕES MULTI-NÍVEL (TODOS OS NÍVEIS)
  // ==========================================
  {
    id: 'leg_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'Segundo a legislação orgânica do Ministério do Interior de Angola, qual é a principal missão comum aos seus órgãos executivos diretos?',
    options: [
      'Garantir exclusivamente o transporte e segurança do Presidente da República',
      'Assegurar a ordem, segurança e tranquilidade públicas, e o cumprimento das leis',
      'Gerir o sistema judiciário civil e tribunais provinciais de Angola',
      'Representar o Estado Angolano nas missões diplomáticas no estrangeiro'
    ],
    correctIndex: 1,
    lawReference: 'Decreto Presidencial n.º 152/19 e Estatuto Orgânico do MININT',
    explanation: 'A missão fundamental do MININT e dos seus órgãos integrados (PNA, SIC, SME, SP, SPCB) consiste na manutenção da ordem pública, segurança dos cidadãos, protecção da propriedade e aplicação intransigente da legalidade no território nacional.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'A Polícia Nacional de Angola (PNA) é definida como uma força armada de natureza militar ou paramilitar?',
    options: [
      'Força armada estritamente civil sem uso de armamento',
      'Força paramilitar permanente, encarregada da segurança e ordem pública',
      'Órgão privado de segurança subordinado às Forças Armadas Angolanas',
      'Força de vigilância comunitária sem hierarquia operacional'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 1.º da Lei n.º 9/19 e Estatuto Orgânico da PNA',
    explanation: 'A PNA é uma força paramilitar permanente, pública, uniformizada e armada, com estrutura hierarquizada, encarregada de assegurar a ordem e segurança pública nos termos da Constituição e das leis.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'Qual dos órgãos a seguir enquadrados no MININT é responsável directo pelo controlo da entrada, permanência e saída de estrangeiros do território de Angola?',
    options: [
      'Serviço de Investigação Criminal (SIC)',
      'Polícia de Guarda Fronteiras (PGF)',
      'Serviço de Migração e Estrangeiros (SME)',
      'Serviço Penitenciário (SP)'
    ],
    correctIndex: 2,
    lawReference: 'Decreto Presidencial n.º 106/19 - Estatuto Orgânico do SME',
    explanation: 'O Serviço de Migração e Estrangeiros (SME) é o órgão executivo central do MININT encarregado de gerir a política migratória, emissão de passaportes e vistos, e controlo fronteiriço de cidadãos nacionais e estrangeiros.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'O Serviço de Investigação Criminal (SIC) actua sob a direcção funcional de qual órgão do Estado durante a instrução preparatória dos processos crimes?',
    options: [
      'Ministério da Defesa Nacional',
      'Ministério Público / Procuradoria-Geral da República (PGR)',
      'Tribunal Constitucional de Angola',
      'Governo Provincial do local do crime'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 4.º do Decreto Presidencial n.º 211/19 (Estatuto Orgânico do SIC)',
    explanation: 'No âmbito da investigação criminal e instrução preparatória, o SIC actua sob a direcção processual e funcional do Ministério Público (PGR), nos termos previstos no Código de Processo Penal Angolano.',
    difficulty: 'médio'
  },
  {
    id: 'leg_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'Qual é o órgão responsável pelo combate a incêndios, busca e salvamento e protecção civil em Angola?',
    options: [
      'Polícia de Intervenção Rápida (PIR)',
      'Serviço de Protecção Civil e Bombeiros (SPCB)',
      'Serviço Penitenciário Nacional',
      'Direcção de Operações da PNA'
    ],
    correctIndex: 1,
    lawReference: 'Estatuto Orgânico do SPCB - Decreto Presidencial n.º 160/19',
    explanation: 'O SPCB tem a incumbência legal de planear e executar acções de prevenção de riscos, combate a incêndios, resgate de vítimas e apoio à população em situações de emergência ou calamidade.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_6',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'De acordo com os deveres dos agentes da autoridade e forças de segurança em Angola, o uso da força física e armas de fogo deve pautar-se por quais princípios essenciais?',
    options: [
      'Livre arbítrio e autonomia do agente em serviço',
      'Necessidade, proporcionalidade e adequação',
      'Execução imediata de qualquer ordem verbal sem avaliação prévia',
      'Uso preferencial de armas em qualquer infracção administrativa'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 210.º da Constituição da República de Angola e Princípios do Uso da Força',
    explanation: 'O recurso à força por agentes de autoridade é estritamente limitado aos casos previstos na lei e deve obedecer rigorosamente aos princípios da necessidade, oportunidade, proporcionalidade e gradação do uso dos meios coercivos.',
    difficulty: 'médio'
  },
  {
    id: 'leg_7',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    question: 'A execução das penas privativas de liberdade e as medidas de segurança decretadas pelos Tribunais em Angola compete a qual órgão do MININT?',
    options: [
      'Serviço Penitenciário (SP)',
      'Polícia Ordem Pública (POP)',
      'Serviço de Inteligência e Segurança do Estado (SINSE)',
      'Inspecção Geral do MININT'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 212/19 - Estatuto Orgânico do Serviço Penitenciário',
    explanation: 'O Serviço Penitenciário (SP) é o órgão encarregado da gestão dos estabelecimentos prisionais, execução das penas e reabilitação psicossocial dos reclusos para reintegração na sociedade.',
    difficulty: 'fácil'
  },

  // PORTUGUÊS MULTI-NÍVEL
  {
    id: 'port_1',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    question: 'Assinale a opção em que a concordância verbal está CORRECTA de acordo com a norma padrão da língua portuguesa:',
    options: [
      'Fazia cinco anos que os agentes não realizavam a formação contínua.',
      'Haviam muitos candidatos inscritos no concurso do MININT.',
      'Existia vários documentos pendentes na inspecção.',
      'Deve haverem novos regulamentos publicados amanhã.'
    ],
    correctIndex: 0,
    lawReference: 'Gramática da Língua Portuguesa - Verbos Impessoais',
    explanation: 'O verbo "fazer" indicando tempo decorrido é impessoal (fica no singular: "Fazia cinco anos"). Da mesma forma, o verbo "haver" no sentido de existir é impessoal ("Havia muitos candidatos"). "Existir" flexiona normalmente ("Existiam vários documentos").',
    difficulty: 'médio'
  },
  {
    id: 'port_2',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    question: 'Na frase: "O inspector dirigiu-se ___ Esquadra para apresentar o relatório ___ altas autoridades", a preenchimento correcto dos espaços com crase ou preposição é:',
    options: [
      'à / às',
      'a / as',
      'há / as',
      'à / as'
    ],
    correctIndex: 0,
    lawReference: 'Gramática da Língua Portuguesa - Regência e Crase',
    explanation: 'Quem se dirige, dirige-se "a" algum lugar (preposição a + artigo definido a = à Esquadra). Apresentar o relatório "a" alguém (preposição a + artigo definido plural as = às altas autoridades).',
    difficulty: 'médio'
  },
  {
    id: 'port_3',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    question: 'Qual das palavras abaixo apresenta acentuação gráfica INCORRECTA de acordo com as regras ortográficas em vigor?',
    options: [
      'Relatório',
      'Constituição',
      'Caráter',
      'Rubrica (com acento na sílaba ru - "rúbrica")'
    ],
    correctIndex: 3,
    lawReference: 'Ortografia e Prosódia da Língua Portuguesa',
    explanation: 'A palavra "rubrica" é paroxítona (a pronúncia correcta é ru-BRI-ca). A pronúncia ou grafia "rúbrica" com acento é um erro de caturrice/cacoepia.',
    difficulty: 'fácil'
  },
  {
    id: 'port_4',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    question: 'Indique a frase onde o pronome oblíquo está devidamente colocado conforme a norma culta:',
    options: [
      'Me entregaram o processo na recepção da direcção.',
      'Não se encontraram irregularidades durante a auditoria.',
      'Lhe disseram que o concurso seria publicado no Diário da República.',
      'Jamais informaram-nos sobre a alteração do horário.'
    ],
    correctIndex: 1,
    lawReference: 'Colocação Pronominal - Próclise Obrigatória',
    explanation: 'A palavra de sentido negativo "Não" atrai obrigatoriamente o pronome oblíquo antes do verbo (próclise: "Não se encontraram"). Iniciar frases com pronome oblíquo ("Me entregaram", "Lhe disseram") é inadequado na norma culta escrita.',
    difficulty: 'médio'
  },

  // CULTURA GERAL MULTI-NÍVEL
  {
    id: 'cult_1',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    question: 'Em que data memorável foi proclamada a Independência Nacional da República de Angola por António Agostinho Neto?',
    options: [
      '11 de Novembro de 1975',
      '4 de Fevereiro de 1961',
      '17 de Setembro de 1979',
      '4 de Abril de 2002'
    ],
    correctIndex: 0,
    lawReference: 'Constituição da República de Angola - História Patriótica',
    explanation: 'A Independência Nacional foi proclamada às 00:00 do dia 11 de Novembro de 1975 pelo Primeiro Presidente de Angola, Doutor António Agostinho Neto, em Luanda.',
    difficulty: 'fácil'
  },
  {
    id: 'cult_2',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    question: 'Qual é a lei suprema do Estado angolano, aprovada em 2010 e revista em 2021, que fundamenta os direitos fundamentais e o ordenamento jurídico?',
    options: [
      'Constituição da República de Angola (CRA)',
      'Código Penal Angolano',
      'Lei Geral do Trabalho',
      'Regulamento Geral de Disciplina do MININT'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 6.º da Constituição da República de Angola',
    explanation: 'A Constituição é a Lei Suprema de Angola. Todas as demais leis e actos normativos do Estado só são válidos se estiverem em conformidade com a Constituição.',
    difficulty: 'fácil'
  },
  {
    id: 'cult_3',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    question: 'Quantas Províncias compõem administrativamente a República de Angola (com base na divisão político-administrativa estabelecida no ordenamento em vigor)?',
    options: [
      '18 Províncias',
      '21 Províncias',
      '12 Províncias',
      '15 Províncias'
    ],
    correctIndex: 1,
    lawReference: 'Lei n.º 13/24 - Divisão Político-Administrativa da República de Angola',
    explanation: 'Nos termos da nova Lei da Divisão Político-Administrativa (Lei n.º 13/24), a República de Angola passa a organizar-se territorialmente em 21 Províncias, com a criação das províncias de Ícolo e Bengo, Moxico-Leste e Quando (resultado da divisão da província do Cuando Cubango em Quando e Cubango).',
    difficulty: 'fácil'
  },
  {
    id: 'cult_4',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    question: 'A data do dia 4 de Abril é celebrada em todo o território nacional angolano como o Dia de:',
    options: [
      'Paz e Reconciliação Nacional',
      'Início da Luta Armada de Libertação Nacional',
      'Herói Nacional',
      'Fundação da Polícia Nacional'
    ],
    correctIndex: 0,
    lawReference: 'Feriados Nacionais e Datas Históricas de Angola',
    explanation: 'O dia 4 de Abril de 2002 assinala a assinatura dos Acordos de Paz de Luena, sendo feriado nacional dedicado à Paz e Reconciliação entre todos os angolanos.',
    difficulty: 'fácil'
  },
  {
    id: 'cult_5',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    question: 'Quais são as três figuras presentes na Insígnia da República de Angola que simbolizam a agricultura, a indústria e o trabalho?',
    options: [
      'A Katana, a Enxada e a Estrela de Cinco Pontas',
      'A Roda Dentada, a Enxada e o Catana',
      'O Livro, a Espada e o Diamante',
      'O Sol, a Palmeira e o Leão'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 18.º da Constituição da República de Angola - Símbolos Nacionais',
    explanation: 'A Insígnia da República é composta por uma Roda Dentada (indústria e operariado), uma Enxada e uma Katana (trabalho agrícola e luta), um Livro (educação/cultura) e o Sol Nascente (nova nação).',
    difficulty: 'médio'
  },

  // DIREITO PENAL MULTI-NÍVEL
  {
    id: 'dir_1',
    category: 'direito_penal',
    categoryName: 'Direito Penal e Processual',
    academicLevel: 'todos',
    question: 'O princípio basilar do Direito Penal que estabelece que "Não há crime nem pena sem lei prévia" designa-se por:',
    options: [
      'Princípio da Legalidade / Nullum crimen sine lege',
      'Princípio da Oportunidade Processual',
      'Princípio da Culpabilidade presumida',
      'Princípio da Subsidiariedade relativa'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 67.º da CRA e Artigo 1.º do Código Penal Angolano',
    explanation: 'O Princípio da Legalidade proíbe a punição de qualquer conduta humana que não esteja previamente tipificada na lei como crime no momento da sua prática.',
    difficulty: 'médio'
  },
  {
    id: 'dir_2',
    category: 'direito_penal',
    categoryName: 'Direito Penal e Processual',
    academicLevel: 'todos',
    question: 'De acordo com a Constituição e o Código de Processo Penal de Angola, qual é o prazo máximo de detenção de um cidadão por suspeita de crime antes de ser presente a um Magistrado do Ministério Público?',
    options: [
      '48 Horas',
      '24 Horas',
      '7 Dias',
      '15 Dias'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 64.º da CRA e Código de Processo Penal Angolano',
    explanation: 'A detenção em flagrante delito ou por mandado policial caduca se no prazo máximo de 48 horas o detido não for apresentado ao Juiz de Garantias ou Magistrado do Ministério Público para validação.',
    difficulty: 'médio'
  },
  {
    id: 'dir_3',
    category: 'direito_penal',
    categoryName: 'Direito Penal e Processual',
    academicLevel: 'todos',
    question: 'Qual é o princípio constitucional segundo o qual "Todo o arguido se presume inocente até ao trânsito em julgado da sentença de condenação"?',
    options: [
      'Presunção de Inocência',
      'Presunção de Culpa',
      'In dubio pro reo exclusivo',
      'Livre apreciação da prova'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 67.º, n.º 2 da Constituição da República de Angola',
    explanation: 'É garantia fundamental da pessoa humana que ninguém pode ser considerado culpado antes de decisão judicial condenatória definitiva e irrecorrível.',
    difficulty: 'fácil'
  },
  {
    id: 'dir_4',
    category: 'direito_penal',
    categoryName: 'Direito Penal e Processual',
    academicLevel: 'todos',
    question: 'Quando um cidadão atua legitimamente para repelir uma agressão actual e ilícita contra a sua integridade física ou de terceiros, utilizando meios proporcionais, verifica-se qual causa de exclusão da ilicitude?',
    options: [
      'Legítima Defesa',
      'Estado de Necessidade',
      'Cumprimento de Dever de Função',
      'Consentimento do Ofendido'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 42.º do Código Penal Angolano',
    explanation: 'A Legítima Defesa exclui a ilicitude do facto quando o meio empregado é estritamente proporcional e necessário para repelir agressão injusta, iminente ou actual.',
    difficulty: 'médio'
  },

  // --- SERVIÇO PENITENCIÁRIO (SP), LEI N.º 8/08 E DIREITOS DOS RECLUSOS ---
  {
    id: 'sp_leg_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'De acordo com a Lei n.º 8/08 (Lei do Regime Penitenciário de Angola), qual é a finalidade fundamental da execução das penas e medidas privativas de liberdade?',
    options: [
      'A reintegração social do recluso, promovendo a sua reabilitação, sentido de responsabilidade e prevenção da reincidência',
      'A punição física severa e isolamento definitivo da sociedade sem qualquer tipo de formação',
      'O trabalho forçado obrigatório sem remuneração e sem descanso semanal',
      'A perda automática da nacionalidade angolana durante o cumprimento da pena'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08, de 29 de Agosto (Lei do Regime Penitenciário) - Artigo 2.º',
    explanation: 'A execução das penas privativas de liberdade visa a reintegração social do recluso, preparando-o para conduzir a sua vida de forma socialmente responsável sem cometer novos crimes.',
    difficulty: 'médio'
  },
  {
    id: 'sp_leg_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Segundo o Princípio da Separação dos Reclusos nos estabelecimentos prisionais em Angola, qual das seguintes regras é de cumprimento OBRIGATÓRIO?',
    options: [
      'Mulheres e homens devem ser instalados em edifícios ou secções completamente separadas',
      'Detidos em prisão preventiva devem partilhar a mesma cela com condenados definitivos',
      'Jovens réus e adultos com penas longas devem ser alojados juntos para disciplinarização',
      'Não existe critério de separação por género ou situação jurídica'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 - Regra de Separação Prisional & CRA Artigo 60.º',
    explanation: 'A lei estabelece rigorosamente a separação por sexos (homens e mulheres em instalações totalmente separadas), bem como a separação entre detidos preventivos e condenados definitivos.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_leg_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da legislação penitenciária angolana, qual dos seguintes Direitos Fundamentais permanece GARANTIDO ao cidadão recluso?',
    options: [
      'Direito à integridade física, assistência médica, alimentação adequada, vestuário e apoio religioso',
      'Direito de votar e exercer cargos públicos executivos enquanto cumpre pena prisional',
      'Direito de recusar todas as revistas corporais efetuadas pela guarda penitenciária',
      'Direito de portar bens de valor ilimitado dentro da cela'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08, de 29 de Agosto - Direitos e Deveres dos Reclusos',
    explanation: 'A privação de liberdade atinge a liberdade de circulação, mas preserva a dignidade humana, integridade física/moral, saúde, alimentação, higiene, instrução e religião.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_leg_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Decreto Presidencial n.º 212/19 aprova o Estatuto Orgânico do Serviço Penitenciário (SP). Como se define a natureza jurídica deste serviço?',
    options: [
      'Órgão executivo central do MININT encarregado de gerir o sistema penitenciário, a execução das penas e a reintegração social',
      'Empresa pública de capital misto tutelada pelo Ministério da Justiça',
      'Associação privada de solidariedade social sem vínculo com o Ministério do Interior',
      'Departamento militar subordinado exclusivamente às Forças Armadas Angolanas (FAA)'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 212/19 - Estatuto Orgânico do Serviço Penitenciário',
    explanation: 'O Serviço Penitenciário (SP) é o órgão executivo central do Ministério do Interior (MININT) responsável pelo controlo das instituições prisionais e reabilitação de reclusos em Angola.',
    difficulty: 'médio'
  },
  {
    id: 'sp_leg_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Em relação ao trabalho dos reclusos nos estabelecimentos prisionais angolanos, qual das alternativas respeita os ditames da Lei do Regime Penitenciário?',
    options: [
      'O trabalho tem carácter educativo e produtivo, sendo remunerado e visando a formação profissional do recluso',
      'O trabalho penitenciário tem natureza exclusivamente aflitiva e de castigo corporal',
      'É proibido qualquer tipo de trabalho ou ocupação laboral dentro das prisões em Angola',
      'O salário do trabalho prisional é revertido 100% a favor da direcção do estabelecimento'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 (Regime Penitenciário) - Trabalho Prisional e Reabilitação',
    explanation: 'O trabalho nos estabelecimentos prisionais angolanos não é um castigo, mas sim um meio de reabilitação e capacitação profissional com remuneração justa.',
    difficulty: 'médio'
  },
  {
    id: 'sp_leg_6',
    category: 'direito_penal',
    categoryName: 'Direito Penal e Processual',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'A Constituição da República de Angola (CRA) estabelece que ninguém pode ser submetido a tortura, tratamentos cruéis, degradantes ou desumanos. Qual é o artigo constitucional correspondente?',
    options: [
      'Artigo 60.º da CRA (Proibição da tortura e penas ou tratamentos cruéis)',
      'Artigo 1.º da CRA (Independência nacional)',
      'Artigo 200.º da CRA (Administração Local)',
      'Artigo 150.º da CRA (Orçamento Geral do Estado)'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 60.º da Constituição da República de Angola (CRA)',
    explanation: 'O Artigo 60.º da CRA proíbe expressamente a tortura, os trabalhos forçados e as penas ou tratamentos cruéis, degradantes ou desumanos em todas as instituições, incluindo o sistema penitenciário.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_leg_7',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'No Serviço Penitenciário (SP) de Angola, o acesso de advogados e defensores aos reclusos detidos ou condenados é garantido sob quais condições?',
    options: [
      'Em qualquer momento e em condições de confidencialidade, respeitando a segurança do estabelecimento prisional',
      'Apenas uma vez por ano e na presença obrigatória do director do presídio',
      'Apenas após o pagamento de taxa de audiência à guarda penitenciária',
      'É estritamente proibido o contacto com advogados nas prisões angolanas'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 & Constituição da República de Angola (Artigo 67.º)',
    explanation: 'O direito à assistência jurídica por advogado e a comunicação confidencial com o defensor constituem garantia inalienável e constitucional de qualquer cidadão privado de liberdade.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_leg_8',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Qual é o órgão responsável pelo controlo da legalidade da execução das penas privativas de liberdade em Angola, apreciando concessões de Liberdade Condicional?',
    options: [
      'O Tribunal de Execução de Penas (TEP) e o Ministério Público',
      'O Comando Geral da Polícia Nacional',
      'A Direcção Provincial do Serviço de Investigação Criminal',
      'O Conselho Nacional de Viação e Ordenamento do Trânsito'
    ],
    correctIndex: 0,
    lawReference: 'Lei de Organização e Funcionamento dos Tribunais da Jurisdição Comum & Lei 8/08',
    explanation: 'A fiscalização judicial da execução das penas e a decisão sobre incidentes de execução (como a concessão de liberdade condicional) competem ao Tribunal de Execução de Penas.',
    difficulty: 'difícil'
  },

  // --- HISTÓRIA DE ANGOLA & DATAS HISTÓRICAS ---
  {
    id: 'hist_1',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'A data histórica do 4 de Fevereiro de 1961 é celebrada nacionalmente em Angola como o Dia:',
    options: [
      'Do Início da Luta Armada de Libertação Nacional',
      'Da Proclamação da Independência Nacional',
      'Da Paz e Reconciliação Nacional',
      'Do Herói Nacional'
    ],
    correctIndex: 0,
    lawReference: 'Datas Históricas da República de Angola',
    explanation: 'O 4 de Fevereiro de 1961 assinala os ataques às cadeias coloniais de Luanda, marcando o início da Luta Armada de Libertação Nacional contra o domínio colonial português.',
    difficulty: 'fácil'
  },
  {
    id: 'hist_2',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Quem é o ilustre escritor e poeta angolano autor da letra do Hino Nacional da República de Angola ("Angola Avante")?',
    options: [
      'Manuel Rui Monteiro',
      'Agostinho Neto',
      'Pepetela',
      'Lopo do Nascimento'
    ],
    correctIndex: 0,
    lawReference: 'Constituição da República de Angola - Artigo 18.º (Símbolos Nacionais)',
    explanation: 'A letra do Hino Nacional "Angola Avante" foi escrita por Manuel Rui Monteiro, com música composta por Rui Mingas.',
    difficulty: 'médio'
  },
  {
    id: 'hist_3',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'O dia 17 de Setembro é feriado nacional em Angola em homenagem ao nascimento de qual figura histórica?',
    options: [
      'António Agostinho Neto (Primeiro Presidente da República e Herói Nacional)',
      'Holden Roberto',
      'Jonas Savimbi',
      'Rainha Ginga Mbandi'
    ],
    correctIndex: 0,
    lawReference: 'Feriados Nacionais da República de Angola',
    explanation: 'O dia 17 de Setembro assinala a data de nascimento do Dr. António Agostinho Neto (1922-1979), Poeta Maior, Fundador da Nação e Primeiro Presidente de Angola.',
    difficulty: 'fácil'
  },

  // --- ORGANIZAÇÃO POLÍTICO-ADMINISTRATIVA (PROVÍNCIAS E CAPITAIS) ---
  {
    id: 'geo_3',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Qual é a capital da Província da Huíla, importante centro do sul de Angola?',
    options: [
      'Lubango',
      'Namibe',
      'Ondjiva',
      'Menongue'
    ],
    correctIndex: 0,
    lawReference: 'Divisão Político-Administrativa da República de Angola',
    explanation: 'Lubango é a capital administrativa e económica da Província da Huíla.',
    difficulty: 'fácil'
  },
  {
    id: 'geo_4',
    category: 'cultura_geral',
    categoryName: 'Cultura Geral de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'A Província do Moxico, com vasta extensão territorial no leste de Angola, tem como capital a cidade de:',
    options: [
      'Luena',
      'Saurimo',
      'Dundo',
      'Mbanza Kongo'
    ],
    correctIndex: 0,
    lawReference: 'Divisão Político-Administrativa da República de Angola',
    explanation: 'Luena é a cidade capital da Província do Moxico.',
    difficulty: 'fácil'
  },

  // --- DIREITO, CONSTITUIÇÃO (CRA) E ÉTICA PÚBLICA ---
  {
    id: 'cra_3',
    category: 'direito_penal',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'De acordo com o Artigo 2.º da Constituição da República de Angola, a República de Angola é um Estado Democrático de Direito baseado em quais pilares?',
    options: [
      'Soberania popular, primazia da Constituição e da lei, separação de poderes e respeito pelos direitos humanos',
      'Concentração absoluta de poderes e suspensão permanente de garantias individuais',
      'Regime de partido único sem liberdade de expressão ou de reunião',
      'Prevalência de normas costumeiras locais sobre o texto constitucional'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 2.º da Constituição da República de Angola (CRA)',
    explanation: 'O Artigo 2.º consagra Angola como um Estado Democrático de Direito fundamentado no respeito da dignidade humana, vontade popular, pluralismo e separação de poderes.',
    difficulty: 'médio'
  },
  {
    id: 'adm_2',
    category: 'cultura_geral',
    categoryName: 'Administração Pública & Probidade',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da Lei da Probidade Pública (Lei n.º 3/10), o agente público que utiliza bens ou funcionários da administração para fins particulares comete:',
    options: [
      'Acto de improbidade administrativa que atenta contra os princípios da Administração Pública e gera enriquecimento ilícito',
      'Falta leve isenta de qualquer responsabilidade disciplinar ou criminal',
      'Procedimento padrão autorizado pelo regulamento geral',
      'Infracção exclusivamente civil sem sanção aplicável'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 (Lei da Probidade Pública) - Artigos 9.º a 11.º',
    explanation: 'O uso indevido de bens ou recursos do Estado para proveito pessoal viola flagrantemente a Lei da Probidade Pública, sujeitando o agente a perda do cargo, ressarcimento e sanções penais.',
    difficulty: 'médio'
  },

  // --- LEGISLAÇÃO E ÓRGÃOS DEPENDENTES DO MININT ---
  {
    id: 'minint_org_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'A Polícia de Guarda Fronteiras (PGF), encarregada da vigilância e protecção das fronteiras terrestres e fluviais de Angola, é uma especialidade de qual órgão do MININT?',
    options: [
      'Polícia Nacional de Angola (PNA)',
      'Serviço de Migração e Estrangeiros (SME)',
      'Serviço de Investigação Criminal (SIC)',
      'Serviço Penitenciário (SP)'
    ],
    correctIndex: 0,
    lawReference: 'Estatuto Orgânico da PNA e Estrutura Operacional das Forças de Segurança',
    explanation: 'A PGF é um comando de especialidade integrante da Polícia Nacional de Angola (PNA) responsável pela integridade das fronteiras do País.',
    difficulty: 'fácil'
  },
  {
    id: 'minint_org_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Qual é o órgão do MININT competente em Angola para a emissão do Passaporte Ordinário e controlo de vistos de entrada e permanência?',
    options: [
      'Serviço de Migração e Estrangeiros (SME)',
      'Polícia Nacional de Angola (PNA)',
      'Serviço de Protecção Civil e Bombeiros (SPCB)',
      'Inspecção-Geral do Ministério do Interior'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 106/19 - Estatuto Orgânico do SME',
    explanation: 'O SME tem atribuição exclusiva para a instrução, emissão e controlo de passaportes nacionais e gestão do regime jurídico de vistos a estrangeiros.',
    difficulty: 'fácil'
  },

  // --- APTIDÃO: MATEMÁTICA BÁSICA & RACIOCÍNIO LÓGICO ---
  {
    id: 'mat_2',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Uma unidade do SPCB registou 15 chamadas de emergência em Janeiro, 20 em Fevereiro e 25 em Março. Qual foi a média mensal de chamadas no primeiro trimestre?',
    options: [
      '20 chamadas por mês',
      '18 chamadas por mês',
      '22 chamadas por mês',
      '25 chamadas por mês'
    ],
    correctIndex: 0,
    lawReference: 'Matemática Básica - Média Aritmética Simples',
    explanation: 'A média aritmética calcula-se somando os valores e dividindo pelo número de meses: (15 + 20 + 25) / 3 = 60 / 3 = 20 chamadas por mês.',
    difficulty: 'fácil'
  },
  {
    id: 'log_4',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Num posto de atendimento do SME com 100 utentes em espera, 45% possuem atendimento prioritário por lei. Quantos utentes NÃO possuem atendimento prioritário?',
    options: [
      '55 utentes',
      '45 utentes',
      '50 utentes',
      '60 utentes'
    ],
    correctIndex: 0,
    lawReference: 'Matemática - Percentagem e Complementar',
    explanation: 'Se 45% são prioritários, o percentual de utentes não prioritários é 100% - 45% = 55%. Em 100 utentes, correspondem exactamente a 55 utentes.',
    difficulty: 'fácil'
  },

  // --- APTIDÃO: LÍNGUA PORTUGUESA (ORTOGRAFIA & USO DE HÁ / A) ---
  {
    id: 'port_5',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Assinale a alternativa que emprega CORRECTAMENTE as palavras "HÁ" (verbo haver/tempo decorrido) e "A" (preposição de tempo futuro/distância):',
    options: [
      'O agente ingressou na corporação há 3 anos e será promovido daqui a 6 meses.',
      'O agente ingressou na corporação a 3 anos e será promovido daqui há 6 meses.',
      'O agente ingressou na corporação ah 3 anos e será promovido daqui a 6 meses.',
      'O agente ingressou na corporação há 3 anos e será promovido daqui há 6 meses.'
    ],
    correctIndex: 0,
    lawReference: 'Gramática da Língua Portuguesa - Distinção entre "Há" e "A"',
    explanation: 'Usa-se "Há" para indicar tempo decorrido do passado (equivalente a faz: "há 3 anos"). Usa-se "a" para indicar tempo futuro ou distância ("daqui a 6 meses").',
    difficulty: 'médio'
  },

  // =========================================================================
  // NOVO PACOTE EXPANDIDO: INFORMÁTICA BÁSICA (15 QUESTÕES)
  // =========================================================================
  {
    id: 'inf_1',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'No Sistema Operativo Microsoft Windows, qual é o atalho de teclado utilizado para alternar rapidamente entre as janelas de aplicações abertas?',
    options: [
      'Ctrl + C',
      'Alt + Tab',
      'Ctrl + V',
      'Win + L'
    ],
    correctIndex: 1,
    lawReference: 'Sistemas Operativos - Atalhos Padrão do Windows',
    explanation: 'O atalho Alt + Tab permite alternar instantaneamente entre janelas e programas ativos na barra de tarefas do Windows.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_2',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'No Windows Explorer (ou Explorador de Ficheiros), qual o comando rápido para criar uma nova pasta no directório seleccionado?',
    options: [
      'Ctrl + Shift + N',
      'Ctrl + N',
      'Alt + F4',
      'Ctrl + P'
    ],
    correctIndex: 0,
    lawReference: 'Gestão de Ficheiros no Windows',
    explanation: 'O atalho Ctrl + Shift + N cria imediatamente uma nova pasta na directoria activa do Explorador de Ficheiros.',
    difficulty: 'médio'
  },
  {
    id: 'inf_3',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Ao selecionar um ficheiro de texto confidencial no Windows e premir a combinação de teclas "Shift + Delete", o que acontece?',
    options: [
      'O ficheiro é movido para a Lixeira temporariamente.',
      'O ficheiro é eliminado permanentemente sem passar pela Lixeira.',
      'O ficheiro é ocultado nas propriedades da pasta.',
      'O ficheiro é duplicado na mesma pasta.'
    ],
    correctIndex: 1,
    lawReference: 'Gestão de Lixeira e Eliminação no Windows',
    explanation: 'A combinação Shift + Delete ignora a Lixeira e apaga permanentemente o ficheiro ou pasta do disco rígido.',
    difficulty: 'médio'
  },
  {
    id: 'inf_4',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'Qual atalho de teclado no Windows abre diretamente o Explorador de Ficheiros (Windows Explorer)?',
    options: [
      'Win + E',
      'Win + R',
      'Win + D',
      'Win + P'
    ],
    correctIndex: 0,
    lawReference: 'Atalhos de Teclado do Windows',
    explanation: 'Pressionar a tecla do logótipo do Windows + E abre directamente uma nova janela do Explorador de Ficheiros.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_5',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'No Windows, a funcionalidade "Copiar" e "Colar" utiliza qual conceito do sistema operativo para armazenar temporariamente os dados seleccionados?',
    options: [
      'Memória ROM',
      'Área de Transferência (Clipboard)',
      'Disco Externo Virtual',
      'Fila de Impressão'
    ],
    correctIndex: 1,
    lawReference: 'Conceitos Básicos de Sistema Operativo',
    explanation: 'Ao copiar (Ctrl+C), a informação é armazenada temporariamente na Área de Transferência (Clipboard) até ser colada (Ctrl+V).',
    difficulty: 'fácil'
  },
  {
    id: 'inf_6',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'No Microsoft Word, qual é o atalho de teclado padrão para desfazer a última ação efetuada na dactilografia de um documento?',
    options: [
      'Ctrl + Z',
      'Ctrl + Y',
      'Ctrl + S',
      'Ctrl + X'
    ],
    correctIndex: 0,
    lawReference: 'Edição de Texto no Microsoft Word',
    explanation: 'O atalho Ctrl + Z anula (desfaz) a última alteração efetuada no texto ou na formatação do documento.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_7',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'No processamento de texto no Microsoft Word, para ajustar o texto de forma que fique alinhado simultaneamente à margem esquerda e à margem direita, utiliza-se o alinhamento:',
    options: [
      'Centralizado',
      'À Esquerda',
      'Justificado',
      'À Direita'
    ],
    correctIndex: 2,
    lawReference: 'Formatador de Texto - Parágrafos e Alinhamentos',
    explanation: 'O alinhamento "Justificado" distribui o texto uniformemente entre as margens esquerda e direita, criando bordas retas em ambos os lados.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_8',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'No Microsoft Word, qual o recurso utilizado para inserir informações como o título do documento ou número de página no topo de todas as páginas de forma automática?',
    options: [
      'Nota de Rodapé',
      'Cabeçalho',
      'Marca de Água',
      'Margem Superior'
    ],
    correctIndex: 1,
    lawReference: 'Estruturação de Documentos Oficiais no MS Word',
    explanation: 'O Cabeçalho é a secção localizada na margem superior da página, repetindo-se automaticamente em todo o documento ou secção.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_9',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'No Microsoft Word, o atalho de teclado "Ctrl + P" aciona qual comando funcional?',
    options: [
      'Procurar texto no documento',
      'Imprimir o documento ou abrir o menu de impressão',
      'Substituir palavras',
      'Salvar como PDF'
    ],
    correctIndex: 1,
    lawReference: 'Comandos Rápidos do MS Word',
    explanation: 'Ctrl + P abre imediatamente o painel de Impressão (Print) para configurar páginas e enviar o documento à impressora.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_10',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Na folha de cálculo Microsoft Excel, qual das seguintes expressões representa uma fórmula correta para somar o valor do intervalo de células da célula A1 até a célula A10?',
    options: [
      '=SOMA(A1:A10)',
      '=SOMAR(A1..A10)',
      '=ADICIONAR(A1;A10)',
      '=SUMA(A1-A10)'
    ],
    correctIndex: 0,
    lawReference: 'Fórmulas de Folhas de Cálculo MS Excel',
    explanation: 'A sintaxe padrão em português para somar um intervalo contínuo é =SOMA(célula_inicial:célula_final), utilizando dois pontos (:).',
    difficulty: 'médio'
  },
  {
    id: 'inf_11',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'No Microsoft Excel, a fórmula =MÉDIA(B2:B6) é utilizada para calcular:',
    options: [
      'A soma total dos valores de B2 a B6',
      'O maior valor contido entre as células B2 e B6',
      'A média aritmética simples dos valores numéricos contidos no intervalo de B2 a B6',
      'A contagem de células preenchidas'
    ],
    correctIndex: 2,
    lawReference: 'Funções Estatísticas Básicas do MS Excel',
    explanation: 'A função =MÉDIA calcula a média aritmética somando os valores numéricos do intervalo e dividindo pelo total de elementos.',
    difficulty: 'médio'
  },
  {
    id: 'inf_12',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'No Excel, como se identifica uma célula localizada na terceira coluna e na quinta linha de uma folha de trabalho?',
    options: [
      '5C',
      'C5',
      '3-5',
      'COL3-LIN5'
    ],
    correctIndex: 1,
    lawReference: 'Endereçamento de Células no MS Excel',
    explanation: 'No Excel, as colunas são identificadas por letras (A, B, C...) e as linhas por números (1, 2, 3...). A 3.ª coluna (C) na 5.ª linha é a célula C5.',
    difficulty: 'fácil'
  },
  {
    id: 'inf_13',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Na utilização do Correio Eletrónico (E-mail), qual é a função do campo "Cco" (Cópia de Cortesia Oculta / Blind Carbon Copy)?',
    options: [
      'Enviar a mensagem com prioridade alta.',
      'Enviar uma cópia do e-mail sem que os demais destinatários vejam o endereço desse contacto.',
      'Confirmar a leitura da mensagem pelo destinatário.',
      'Anexar ficheiros protegidos com senha.'
    ],
    correctIndex: 1,
    lawReference: 'Segurança e Comunicação por Correio Eletrónico',
    explanation: 'O campo Cco (ou Bcc) esconde o endereço dos destinatários ali inseridos em relação a quem recebe nos campos Para e Cc.',
    difficulty: 'médio'
  },
  {
    id: 'inf_14',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'O protocolo HTTPS (HyperText Transfer Protocol Secure), visível no início de endereços de navegação na web, garante que:',
    options: [
      'A página é gratuita e sem anúncios comerciais.',
      'A navegação entre o browser e o servidor é encriptada por certificado de segurança SSL/TLS.',
      'O computador está imune a vírus sem necessidade de antivírus.',
      'A velocidade da internet é duplicada durante a navegação.'
    ],
    correctIndex: 1,
    lawReference: 'Segurança da Informação e Cibersegurança',
    explanation: 'O "S" em HTTPS refere-se a Secure. Significa que os dados trafegados entre o navegador e o site são encriptados.',
    difficulty: 'médio'
  },
  {
    id: 'inf_15',
    category: 'informatica_basica',
    categoryName: 'Informática Básica',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Como se chama a técnica fraudulenta na internet em que cibercriminosos enviam e-mails ou mensagens falsas imitando instituições oficiais (como bancos ou órgãos públicos) para roubar senhas e dados confidenciais?',
    options: [
      'Phishing',
      'Backup',
      'Download',
      'Firewall'
    ],
    correctIndex: 0,
    lawReference: 'Segurança Digital e Combate a Crimes Cibernéticos',
    explanation: 'Phishing é uma técnica de engenharia social destinada a enganar utilizadores e obter credenciais através de mensagens ou sites falsos.',
    difficulty: 'médio'
  },

  // =========================================================================
  // NOVO PACOTE EXPANDIDO: LEGISLAÇÃO MININT, CRA & DPO 2025 (15 QUESTÕES)
  // =========================================================================
  {
    id: 'leg_minint_cra_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Nos termos do Decreto Presidencial n.º 32/18 (Estatuto Orgânico do MININT), qual dos seguintes órgãos integra a categoria de Órgãos Executivos Directos do Ministério do Interior?',
    options: [
      'Polícia Nacional de Angola (PNA)',
      'Gabinete do Ministro',
      'Secretaria Geral',
      'Inspecção Geral do Ministério do Interior'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 12.º do DP n.º 32/18 - Estatuto Orgânico do MININT',
    explanation: 'A Polícia Nacional de Angola (PNA), juntamente com o SIC, SME e SPCB, integra a estrutura dos Órgãos Executivos Directos do MININT.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Segundo o Estatuto Orgânico do MININT, a qual órgão executivo direto compete especificamente a prevenção, investigação criminal e instrução preparatória dos processos-crime?',
    options: [
      'Serviço de Investigação Criminal (SIC)',
      'Serviço de Migração e Estrangeiros (SME)',
      'Serviço de Protecção Civil e Bombeiros (SPCB)',
      'Serviço Penitenciário (SP)'
    ],
    correctIndex: 0,
    lawReference: 'DP n.º 32/18 - Atribuições Específicas do SIC',
    explanation: 'O Serviço de Investigação Criminal (SIC) é o órgão encarregue da prevenção e investigação de crimes e instrução preparatória.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'De acordo com o Estatuto Orgânico do Ministério do Interior, o Serviço de Migração e Estrangeiros (SME) responde directamente pela:',
    options: [
      'Execução das penas privativas de liberdade.',
      'Gestão, controlo da entrada, permanência, trânsito e saída de cidadãos nacionais e estrangeiros das fronteiras nacionais.',
      'Combate a incêndios e calamidades naturais.',
      'Manutenção da ordem pública nas vias urbanas.'
    ],
    correctIndex: 1,
    lawReference: 'DP n.º 32/18 - Atribuições do SME',
    explanation: 'O SME é o órgão executivo encarregado de promover e orientar a execução das medidas relativas à migração, controlo de fronteiras e estrangeiros.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Qual é a missão fundamental do Serviço de Protecção Civil e Bombeiros (SPCB) no âmbito da segurança pública ministerial?',
    options: [
      'Fiscalização de documentos de viaturas automóveis.',
      'Prevenção e combate a incêndios, busca, salvamento, e gestão de socorro em situações de catástrofe e emergência.',
      'Guarda de presídios de alta segurança.',
      'Investigação de crimes financeiros estatais.'
    ],
    correctIndex: 1,
    lawReference: 'DP n.º 32/18 - Atribuições do SPCB',
    explanation: 'O SPCB responde pelas ações de prevenção de riscos, combate a incêndios, socorro e proteção civil da população angolana.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'No exercício da atividade policial e de segurança interna sob tutela do MININT, qual princípio constitucional impõe que todos os agentes atuem com rigorosa submissão à lei e aos direitos humanos?',
    options: [
      'Princípio da Legalidade',
      'Princípio do Favor Debitoris',
      'Princípio da Autonomia Privada',
      'Princípio da Livre Concorrência'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 6.º da Constituição da República de Angola (CRA)',
    explanation: 'O Princípio da Legalidade consagra que a atuação dos órgãos de defesa e segurança está estritamente subordinada à Constituição e à Lei.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_6',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior & Oficiais',
    question: 'Nos termos da Lei Geral do Trabalho em Funções Públicas (Lei n.º 26/22) aplicável com ajustamentos aos funcionários civis do MININT, qual é a sanção disciplinar máxima aplicável em caso de infração grave e insanável?',
    options: [
      'Repreensão por escrito',
      'Desconto no salário de 5 dias',
      'Demissão (ou Expulsão)',
      'Transferência compulsória de província'
    ],
    correctIndex: 2,
    lawReference: 'Lei n.º 26/22 - Regime Disciplinar da Função Pública',
    explanation: 'A demissão (ou expulsão para efetivos das carreiras especiais) é a pena máxima aplicável a faltas graves que inviabilizem a manutenção da relação laboral.',
    difficulty: 'médio'
  },
  {
    id: 'leg_minint_cra_7',
    category: 'direito_constituicao',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Nos termos do Artigo 67.º da Constituição da República de Angola (CRA), a qualquer cidadão acusado da prática de uma infração penal assiste o direito de ser presumido:',
    options: [
      'Culpado até prova em contrário.',
      'Inocente até ao trânsito em julgado da sentença condenatória.',
      'Suspeito por tempo indeterminado.',
      'Julgado sem necessidade de defensor judiciário.'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 67.º, n.º 2 da Constituição da República de Angola (CRA)',
    explanation: 'O princípio da presunção de inocência estabelece que todo o cidadão se presume inocente até que a sua condenação transite em julgado.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_8',
    category: 'direito_constituicao',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Qual a providência jurídica constitucional (garantia fundamental) consagrada na CRA contra a prisão ou detenção ilegal efetuada por autoridade incompetente ou sem fundamentação legal?',
    options: [
      'Ação Popular',
      'Habeas Corpus',
      'Recurso de Cassação',
      'Pedido de Indulto'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 68.º da Constituição da República de Angola (CRA)',
    explanation: 'O Habeas Corpus é a providência constitucional urgente colocada à disposição de qualquer indivíduo que se encontre ilegalmente privado da liberdade.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_9',
    category: 'direito_constituicao',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'De acordo com a CRA (Artigo 23.º - Princípio da Igualdade), nenhum cidadão angolano pode ser privilegiado, beneficiado, prejudicado ou privado de qualquer direito em razão de:',
    options: [
      'Ascendência, sexo, raça, língua, território de origem, religião, convicções políticas ou condição social.',
      'Competência técnica comprovada por concurso público.',
      'Desempenho no teste de aptidão física.',
      'Apenas o nível escolar detido.'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 23.º da Constituição da República de Angola (CRA)',
    explanation: 'O Artigo 23.º consagra a igualdade absoluta de todos os cidadãos perante a Constituição e a lei sem qualquer discriminação.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_10',
    category: 'direito_constituicao',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'O Artigo 30.º da CRA consagra o Direito à Vida como um direito inviolável. Qual a consequência direta dessa disposição constitucional no ordenamento jurídico de Angola?',
    options: [
      'A pena de morte é permitida apenas em caso de traição militar.',
      'Não há pena de morte em Angola sob circunstância alguma.',
      'A pena de morte pode ser decretada pelo Ministro do Interior.',
      'A pena de morte é aplicável a crimes graves de homicídio.'
    ],
    correctIndex: 1,
    lawReference: 'Artigo 30.º da CRA - Direito à Vida',
    explanation: 'A Constituição de Angola proíbe expressamente a pena de morte no seu Artigo 30.º, afirmando a inviolabilidade do direito à vida.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_11',
    category: 'direito_constituicao',
    categoryName: 'Direito Constitucional & CRA',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Segundo a Constituição (Artigo 64.º), a privação da liberdade de qualquer cidadão (detenção ou prisão) só é permitida nos casos previstos na lei e deve ser comunicada à família ou a pessoa indicada no prazo máximo de:',
    options: [
      '24 horas',
      '72 horas',
      '48 horas',
      '8 dias'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 64.º, n.º 2 da CRA',
    explanation: 'A detenção deve ser comunicada à família do detido ou pessoa por ele indicada num prazo não superior a 24 horas.',
    difficulty: 'médio'
  },
  {
    id: 'leg_minint_cra_12',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Com a aprovação da Nova Divisão Político-Administrativa de Angola (DPO Lei n.º 13/24, com aplicação em 2025), a República de Angola passa a ser constituída por quantas Províncias?',
    options: [
      '18 Províncias',
      '20 Províncias',
      '21 Províncias',
      '25 Províncias'
    ],
    correctIndex: 2,
    lawReference: 'Lei n.º 13/24 - Divisão Político-Administrativa de Angola (DPO 2025)',
    explanation: 'A reorganização territorial aprovada na Lei n.º 13/24 eleva a divisão política do país de 18 para 21 Províncias.',
    difficulty: 'fácil'
  },
  {
    id: 'leg_minint_cra_13',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Na Nova Divisão Político-Administrativa de Angola (DPO 2025), qual nova província resultou da divisão da extensão territorial da província do Moxico?',
    options: [
      'Moxico Leste',
      'Cuando Cubango Leste',
      'Icolo e Bengo',
      'Cassai Leste'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/24 - Reorganização Territorial de Angola',
    explanation: 'A antiga província do Moxico foi dividida, dando origem à nova província do Moxico Leste (com sede no Cazombo) e Moxico.',
    difficulty: 'médio'
  },
  {
    id: 'leg_minint_cra_14',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'No âmbito da DPO 2025 (Lei n.º 13/24), a província do Cuando Cubango foi reestruturada administrativamente gerando duas províncias denominadas:',
    options: [
      'Cuando e Cubango',
      'Menongue e Cuito',
      'Cuando Leste e Cubango Sul',
      'Cassinga e Cuando'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/24 - DPO 2025',
    explanation: 'A extensa província do Cuando Cubango deu origem às províncias autónomas do "Cuando" e do "Cubango".',
    difficulty: 'médio'
  },
  {
    id: 'leg_minint_cra_15',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'A elevação de novos municípios a municípios autónomos na DPO 2025 visa primordialmente:',
    options: [
      'Aumentar o número de impostos estaduais.',
      'Aproximar os serviços públicos das populações, promover o desenvolvimento harmonioso e descentralizar a administração.',
      'Limitar o acesso a rodovias nacionais.',
      'Eliminar os governos provinciais.'
    ],
    correctIndex: 1,
    lawReference: 'Preâmbulo da Lei n.º 13/24 - Princípios da DPO',
    explanation: 'O objetivo estratégico da Nova Divisão Político-Administrativa é aproximar a governação e os serviços essenciais (segurança, saúde, educação) do cidadão.',
    difficulty: 'fácil'
  },

  // =========================================================================
  // NOVO PACOTE EXPANDIDO: CULTURA GERAL, HISTÓRIA & MININT (10 QUESTÕES)
  // =========================================================================
  {
    id: 'hist_cultura_1',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Qual evento histórico marcante é comemorado anualmente em Angola no dia 4 de Fevereiro?',
    options: [
      'Independência Nacional de Angola',
      'Inicio da Luta Armada de Libertação Nacional (Assalto às Cadeias de Luanda em 1961)',
      'Dia da Paz e Reconciliação Nacional',
      'Dia da Polícia Nacional'
    ],
    correctIndex: 1,
    lawReference: 'Efemérides Nacionais de Angola - 4 de Fevereiro de 1961',
    explanation: 'O 4 de Fevereiro marca o início da Luta Armada de Libertação Nacional contra o regime colonial português em 1961.',
    difficulty: 'fácil'
  },
  {
    id: 'hist_cultura_2',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Quem foi a figura histórica angolana nomeada como o PRIMEIRO MINISTRO DO INTERIOR da República Popular de Angola em 11 de Novembro de 1975?',
    options: [
      'Alves Bernardo Baptista (Nito Alves)',
      'Holden Roberto',
      'Jonas Savimbi',
      'Agostinho Neto'
    ],
    correctIndex: 0,
    lawReference: 'História das Instituições do MININT em Angola',
    explanation: 'Nito Alves foi o primeiro Ministro do Interior de Angola após a proclamação da Independência em 1975.',
    difficulty: 'médio'
  },
  {
    id: 'hist_cultura_3',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'O dia 28 de Fevereiro é celebrado em toda a extensão do território angolano como a efeméride festiva dedicada a:',
    options: [
      'Dia das Forças Armadas Angolanas (FAA)',
      'Dia da Polícia Nacional de Angola (PNA)',
      'Dia do Serviço de Investigação Criminal',
      'Dia dos Heróis Nacionais'
    ],
    correctIndex: 1,
    lawReference: 'Efemérides Históricas da Polícia Nacional',
    explanation: 'O dia 28 de Fevereiro marca a fundação e o Dia da Polícia Nacional de Angola (PNA).',
    difficulty: 'fácil'
  },
  {
    id: 'hist_cultura_4',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'O Hino Nacional da República de Angola intitula-se "Angola Avante". Quem foram os autores da sua letra e música, respetivamente?',
    options: [
      'Manuel Rui Monteiro (letra) e Rui Mingas (música)',
      'Agostinho Neto (letra) e Lichinga (música)',
      'Pepetela (letra) e Bonga (música)',
      'Geraldo Bessa (letra) e Teta Lando (música)'
    ],
    correctIndex: 0,
    lawReference: 'Símbolos Nacionais - CRA e Legislação dos Símbolos',
    explanation: 'O Hino Nacional "Angola Avante" tem letra do escritor Manuel Rui Monteiro e composição musical de Rui Mingas.',
    difficulty: 'médio'
  },
  {
    id: 'hist_cultura_5',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Na Bandeira Nacional de Angola, o que simbolizam a cor VERMELHA e a cor PRETA nas suas duas faixas horizontais?',
    options: [
      'Vermelho: o sangue derramado pelos angolanos na luta libertadora; Preto: o continente africano.',
      'Vermelho: as riquezas minerais; Preto: a noite colonial.',
      'Vermelho: a agricultura; Preto: o mar angolano.',
      'Vermelho: a paz; Preto: o petróleo.'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 18.º da Constituição da República de Angola',
    explanation: 'O vermelho representa o sangue vertido pelos angolanos na opressão colonial e na luta de libertação; o preto representa o continente africano.',
    difficulty: 'fácil'
  },
  {
    id: 'hist_cultura_6',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Na Insígnia da República de Angola (Escudo Nacional), qual elemento simboliza a agricultura e os camponeses do país?',
    options: [
      'A Catana e o Milho/Algodão/Café',
      'A Estrela de Cinco Pontas',
      'A Roda Dentada',
      'O Livro Aberto'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 18.º da CRA - Símbolos da República',
    explanation: 'A catana e os ramos de milho, algodão e café simbolizam os camponeses, a produção agrícola e a fertilidade do solo nacional.',
    difficulty: 'fácil'
  },
  {
    id: 'hist_cultura_7',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Qual o nome do famoso Rei do Reino do Kongo que se notabilizou no século XVI pelo envio de embaixadores a Roma e pela correspondência diplomática com a Europa?',
    options: [
      'Nzinga a Nkuwu (D. João I)',
      'Mpanzu a Nzinga',
      'Nzinga Mbandi (D. Afonso I)',
      'Mandume ya Ndemufayo'
    ],
    correctIndex: 2,
    lawReference: 'História de Angola - Reinos Tradicionais',
    explanation: 'O Rei Afonso I (Nzinga Mbandi / Mvemba a Nzinga) governou o Reino do Kongo de 1506 a 1543 estabelecendo relações diplomáticas de relevo.',
    difficulty: 'médio'
  },
  {
    id: 'hist_cultura_8',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'A célebre Rainha Njinga Mbandi é historicamente aclamada em Angola por:',
    options: [
      'Ter liderado a resistência anticolonial nos reinos do Ndongo e Matamba durante décadas no século XVII.',
      'Fundar a cidade de Benguela em 1617.',
      'Construir a Fortaleza de São Miguel.',
      'Escrever o primeiro dicionário em língua Kimbundu.'
    ],
    correctIndex: 0,
    lawReference: 'História de Angola - Figuras Nacionais',
    explanation: 'A Rainha Njinga Mbandi simboliza a coragem e a resistência heroica contra a penetração e dominação colonial no século XVII.',
    difficulty: 'fácil'
  },
  {
    id: 'hist_cultura_9',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'O 17 de Setembro é feriado nacional em Angola e é consagrado à celebração do:',
    options: [
      'Dia do Herói Nacional (Nascimento do Dr. António Agostinho Neto)',
      'Dia da Mulher Angolana',
      'Dia da Juventude',
      'Dia dos Mártires da Baixa de Cassanje'
    ],
    correctIndex: 0,
    lawReference: 'Efemérides Nacionais de Angola',
    explanation: 'O dia 17 de Setembro assinala o nascimento do primeiro Presidente de Angola, Dr. António Agostinho Neto, Pai da Nação e Poeta Maior.',
    difficulty: 'fácil'
  },
  {
    id: 'hist_cultura_10',
    category: 'historia_cultura_geral',
    categoryName: 'Cultura Geral & História de Angola',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Qual é o ponto de maior altitude (ponto culminante) do relevo de Angola, situado na província do Huambo?',
    options: [
      'Monte Moco (2.620 metros)',
      'Serra da Leba',
      'Pedras Negras de Pungo Andongo',
      'Morro do Moco (1.200 metros)'
    ],
    correctIndex: 0,
    lawReference: 'Geografia Física de Angola',
    explanation: 'O Monte Moco, com aproximadamente 2.620 metros de altitude, é o ponto mais alto do território angolano.',
    difficulty: 'médio'
  },

  // =========================================================================
  // NOVO PACOTE EXPANDIDO: RACIOCÍNIO LÓGICO & MATEMÁTICA (10 QUESTÕES)
  // =========================================================================
  {
    id: 'rac_mat_1',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Considere a sequência lógica de números de patrulha: 3, 7, 11, 15, 19, ... Qual é o próximo número dessa sequência?',
    options: [
      '21',
      '23',
      '25',
      '27'
    ],
    correctIndex: 1,
    lawReference: 'Raciocínio Lógico - Progressões Aritméticas',
    explanation: 'A sequência soma 4 unidades a cada termo (3 + 4 = 7; 7 + 4 = 11...). Logo, 19 + 4 = 23.',
    difficulty: 'fácil'
  },
  {
    id: 'rac_mat_2',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'Na palavra oficial "SEGURANÇA", quantas VOGAIS e quantas CONSOANTES existem, respetivamente?',
    options: [
      '4 vogais e 5 consoantes',
      '4 vogais e 4 consoantes',
      '3 vogais e 6 consoantes',
      '5 vogais e 4 consoantes'
    ],
    correctIndex: 0,
    lawReference: 'Aptidão Verbal e Lógica',
    explanation: 'S-E-G-U-R-A-N-Ç-A: Vogais = E, U, A, A (4). Consoantes = S, G, R, N, Ç (5). Total: 9 letras.',
    difficulty: 'fácil'
  },
  {
    id: 'rac_mat_3',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe & Geral',
    question: 'Quantas sílabas gramaticais possui a palavra administrativa "INVESTIGAÇÃO"?',
    options: [
      '4 sílabas',
      '5 sílabas',
      '6 sílabas',
      '3 sílabas'
    ],
    correctIndex: 1,
    lawReference: 'Divisão Silábica da Língua Portuguesa',
    explanation: 'Divisão silábica: IN - VES - TI - GA - ÇÃO (5 sílabas - polissílaba).',
    difficulty: 'fácil'
  },
  {
    id: 'rac_mat_4',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Uma esquadra da PNA possui 80 agentes. Se 35% dos agentes estão escalados para o turno da noite, quantos agentes patrulham no turno da noite?',
    options: [
      '24 agentes',
      '28 agentes',
      '32 agentes',
      '35 agentes'
    ],
    correctIndex: 1,
    lawReference: 'Cálculo de Percentagens',
    explanation: '35% de 80 = (35 x 80) / 100 = 2800 / 100 = 28 agentes.',
    difficulty: 'médio'
  },
  {
    id: 'rac_mat_5',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Resolva a equação do 1.º grau referente ao orçamento de patrulha: 3x + 15 = 45. Qual o valor de x?',
    options: [
      'x = 8',
      'x = 10',
      'x = 12',
      'x = 15'
    ],
    correctIndex: 1,
    lawReference: 'Álgebra Elementar - Equação do 1.º Grau',
    explanation: '3x + 15 = 45 -> 3x = 45 - 15 -> 3x = 30 -> x = 30 / 3 -> x = 10.',
    difficulty: 'fácil'
  },
  {
    id: 'rac_mat_6',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Se 4 viaturas de patrulha consomem 200 litros de combustível por dia, quantos litros consumirão 7 viaturas do mesmo modelo nas mesmas condições?',
    options: [
      '300 litros',
      '350 litros',
      '400 litros',
      '420 litros'
    ],
    correctIndex: 1,
    lawReference: 'Proporcionalidade - Regra de Três Simples',
    explanation: 'Cada viatura consome 200 / 4 = 50 litros/dia. Para 7 viaturas: 7 x 50 = 350 litros.',
    difficulty: 'médio'
  },
  {
    id: 'rac_mat_7',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Análise da sequência de letras operacionais: B, D, F, H, J, ... Qual a letra seguinte segundo o alfabeto português?',
    options: [
      'K',
      'L',
      'M',
      'N'
    ],
    correctIndex: 1,
    lawReference: 'Raciocínio Sequencial Alfabético',
    explanation: 'A sequência salta uma letra do alfabeto: B (c) D (e) F (g) H (i) J (k) L. A letra seguinte é L.',
    difficulty: 'fácil'
  },
  {
    id: 'rac_mat_8',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Num destacamento do SME com 120 efetivos, a razão entre oficiais e agentes é de 1 para 3. Quantos oficiais trabalham no destacamento?',
    options: [
      '20 oficiais',
      '30 oficiais',
      '40 oficiais',
      '60 oficiais'
    ],
    correctIndex: 1,
    lawReference: 'Razões e Proporções',
    explanation: 'Razão 1:3 significa 1 parte de oficiais e 3 partes de agentes (total 4 partes). 120 / 4 = 30 oficiais.',
    difficulty: 'médio'
  },
  {
    id: 'rac_mat_9',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Em um teste de tiro de precisão, um candidato acertou 18 dos 20 tiros efetuados. Qual foi a taxa percentual de acerto do candidato?',
    options: [
      '80%',
      '85%',
      '90%',
      '95%'
    ],
    correctIndex: 2,
    lawReference: 'Cálculo de Percentagens e Proporções',
    explanation: '(18 / 20) x 100 = 0.9 x 100 = 90% de taxa de acerto.',
    difficulty: 'fácil'
  },
  {
    id: 'rac_mat_10',
    category: 'raciocinio_logico',
    categoryName: 'Raciocínio Lógico & Matemática',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Se o triplo do número de viaturas de um quartel do SPCB somado a 8 é igual a 32, quantas viaturas possui esse quartel?',
    options: [
      '6 viaturas',
      '8 viaturas',
      '10 viaturas',
      '12 viaturas'
    ],
    correctIndex: 1,
    lawReference: 'Problemas do 1.º Grau',
    explanation: '3x + 8 = 32 -> 3x = 24 -> x = 8 viaturas.',
    difficulty: 'fácil'
  },

  // =========================================================================
  // NOVO PACOTE EXPANDIDO: LÍNGUA PORTUGUESA & REDAÇÃO ADM (10 QUESTÕES)
  // =========================================================================
  {
    id: 'port_adm_1',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Assinale a alternativa que apresenta a concordância verbal CORRETA na redação de um relatório policial:',
    options: [
      'Havia muitos cidadãos na esquadra aguardando atendimento.',
      'Haviam muitos cidadãos na esquadra aguardando atendimento.',
      'Houveram sérios incidentes na via pública ontem.',
      'Faziam dois meses que a patrulha não passava no bairro.'
    ],
    correctIndex: 0,
    lawReference: 'Gramática da Língua Portuguesa - Verbo Haver Impessoal',
    explanation: 'O verbo "haver" no sentido de existir ou ocorrer é impessoal e fica sempre no singular ("Havia muitos cidadãos").',
    difficulty: 'médio'
  },
  {
    id: 'port_adm_2',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Assinale a alternativa que contém erro de acentuação gráfica na documentação oficial:',
    options: [
      'O agente apresentou um relatório circunstanciado.',
      'A policia manteve a ordem pública.',
      'O oficial agiu com elevado caráter moral.',
      'A lei orgânica foi publicada no Diário da República.'
    ],
    correctIndex: 1,
    lawReference: 'Ortografia e Acentuação Gráfica em Português',
    explanation: 'A palavra "polícia" deve ser acentuada no "i" por ser uma palavra paroxítona terminada em ditongo crescente ("-ia").',
    difficulty: 'fácil'
  },
  {
    id: 'port_adm_3',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Na correspondência administrativa oficial do MININT, qual é o meio de comunicação formal interno utilizado entre chefias e subordinados de um mesmo órgão para transmitir ordens e orientações de serviço?',
    options: [
      'Memorando',
      'Ofício',
      'Decreto',
      'Carta Pessoal'
    ],
    correctIndex: 0,
    lawReference: 'Técnicas de Redação Administrativa e Oficial',
    explanation: 'O Memorando é a forma de comunicação interna, expedida entre unidades administrativas de um mesmo órgão para tratar de assuntos de rotina.',
    difficulty: 'fácil'
  },
  {
    id: 'port_adm_4',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Em um documento oficial, a frase "O comandante solicitou _____ comparência do acusado _____ esquadra" fica corretamente preenchida com:',
    options: [
      'a / à',
      'à / a',
      'a / a',
      'à / à'
    ],
    correctIndex: 0,
    lawReference: 'Uso da Crase na Língua Portuguesa',
    explanation: '"A comparência" (artigo definido simples) e "à esquadra" (preposição a + artigo a = crase).',
    difficulty: 'médio'
  },
  {
    id: 'port_adm_5',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Assinale a opção com a pontuação e concordância nominal inteiramente CORRETAS:',
    options: [
      'Os documentos solicitados seguem anexos ao processo.',
      'Os documentos solicitados seguem anexo ao processo.',
      'As cópias seguem anexo ao relatório.',
      'Seguem em anexo os foto.'
    ],
    correctIndex: 0,
    lawReference: 'Concordância Nominal - Uso de "Anexo"',
    explanation: 'A palavra "anexo" é um adjetivo e concorda em género e número com o substantivo a que se refere ("documentos anexos").',
    difficulty: 'médio'
  },
  {
    id: 'port_adm_6',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Qual das seguintes frases apresenta um vício de linguagem conhecido como "pleonasmo vicioso" que deve ser evitado em atas e participações policiais?',
    options: [
      'O agente entrou para dentro do edifício.',
      'O inspetor ouviu a testemunha no gabinete.',
      'A patrulha interceptou a viatura suspeita.',
      'O relatório foi entregue no prazo estipulado.'
    ],
    correctIndex: 0,
    lawReference: 'Redação de Documentos Oficiais - Redundâncias',
    explanation: '"Entrar para dentro" é uma redundância desnecessária e viciosa, pois o verbo entrar já significa mover-se para o interior.',
    difficulty: 'fácil'
  },
  {
    id: 'port_adm_7',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior & Oficiais',
    question: 'O vocativo adequado a ser utilizado no início de um Ofício dirigido ao Exmo. Senhor Ministro do Interior é:',
    options: [
      'Excelentíssimo Senhor Ministro,',
      'Querido Ministro,',
      'Prezado Amigo Ministro,',
      'Ao Senhor do Interior,'
    ],
    correctIndex: 0,
    lawReference: 'Manual de Redação Oficial - Pronomes de Tratamento',
    explanation: 'Para Ministros de Estado em Angola, o pronome de tratamento correto é "Vossa Excelência" e o vocativo "Excelentíssimo Senhor Ministro,".',
    difficulty: 'fácil'
  },
  {
    id: 'port_adm_8',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'Na frase "A patrulha deteve o suspeito PORQUE ele tentou fugir", a palavra destacada desempenha a função de conjunção:',
    options: [
      'Causal (indica a causa ou motivo da ação)',
      'Concessiva',
      'Final',
      'Temporal'
    ],
    correctIndex: 0,
    lawReference: 'Sintaxe da Língua Portuguesa - Conjunções Subordinativas',
    explanation: 'A conjunção "porque" introduz a causa/motivo pelo qual a patrulha efetuou a detenção.',
    difficulty: 'fácil'
  },
  {
    id: 'port_adm_9',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'todos',
    academicLevelLabel: 'Todos os Níveis',
    question: 'Assinale a palavra cuja grafia está CORRETA segundo a norma culta da Língua Portuguesa:',
    options: [
      'Exceção',
      'Esseção',
      'Excecão',
      'Eceção'
    ],
    correctIndex: 0,
    lawReference: 'Ortografia Oficial da Língua Portuguesa',
    explanation: 'A grafia correta da palavra é "Exceção" (grafada com x e ç).',
    difficulty: 'fácil'
  },
  {
    id: 'port_adm_10',
    category: 'lingua_portuguesa',
    categoryName: 'Língua Portuguesa',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio & Superior',
    question: 'No contexto da elaboração de um Auto de Notícia, o termo "circunstanciado" significa que o relato deve ser:',
    options: [
      'Resumido em poucas palavras genéricas.',
      'Detalhado com a descrição minuciosa dos factos, hora, local, intervenientes e provas.',
      'Escrito com opiniões pessoais do relator.',
      'Guardado em segredo sem assinatura.'
    ],
    correctIndex: 1,
    lawReference: 'Terminologia Jurídico-Policial',
    explanation: 'Um auto circunstanciado exige a exposição completa, precisa e objetiva de todas as circunstâncias em que o facto ocorreu.',
    difficulty: 'fácil'
  }
];

/**
 * Filter questions by Category and Academic Level, applying Fisher-Yates random shuffle
 * to ensure non-repetitive selection per session.
 */
export const getQuestionsByFilter = (
  category: QuestionCategory | 'todas' | 'misto' = 'todas',
  level: AcademicLevel | 'todos' = 'todos',
  count: number = 10,
  excludeIds: string[] = []
): Question[] => {
  // Step 1: Filter matching questions excluding previously answered IDs in session if possible
  let pool = QUESTION_BANK.filter(q => {
    const matchCategory = category === 'todas' || category === 'misto' || q.category === category;
    const matchLevel =
      level === 'todos' ||
      !q.academicLevel ||
      q.academicLevel === 'todos' ||
      q.academicLevel === level;
    const notExcluded = !excludeIds.includes(q.id);
    return matchCategory && matchLevel && notExcluded;
  });

  // Fallback if pool is too small: drop exclusion condition
  if (pool.length < count) {
    pool = QUESTION_BANK.filter(q => {
      const matchCategory = category === 'todas' || category === 'misto' || q.category === category;
      const matchLevel =
        level === 'todos' ||
        !q.academicLevel ||
        q.academicLevel === 'todos' ||
        q.academicLevel === level;
      return matchCategory && matchLevel;
    });
  }

  // Fallback 2: if still less than required count (e.g. strict level filter with few questions), fallback to all levels for that category
  if (pool.length < count) {
    pool = QUESTION_BANK.filter(q => {
      return category === 'todas' || category === 'misto' || q.category === category;
    });
  }

  // Robust Fisher-Yates Shuffle Algorithm (No duplicates in single draw)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Shuffle options A, B, C, D using Fisher-Yates while preserving correctIndex accuracy
  return selected.map((q) => {
    if (!q || !Array.isArray(q.options) || q.options.length <= 1) return q;
    const indexed = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correctIndex }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    const newOptions = indexed.map((item) => item.text);
    const newCorrectIndex = indexed.findIndex((item) => item.isCorrect);
    return {
      ...q,
      options: newOptions,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    };
  });
};

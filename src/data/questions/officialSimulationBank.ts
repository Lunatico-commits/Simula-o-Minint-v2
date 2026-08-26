import { Question } from '../../types';

export const OFFICIAL_SIMULATION_BANK: Question[] = [
  // --- HISTÓRIA DE ANGOLA ---
  {
    id: 'sim_ha_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual foi o histórico líder da resistência no Reino dos Cuanhamas que proferiu a famosa frase: "Se os brancos me querem, venham buscar-me, aqui estou"?',
    options: [
      'Rei Mandume ya Ndemufayo',
      'Rei Ekwikwi II',
      'Rei Muene Puto Kabamba',
      'Rei Nimi a Lukeni'
    ],
    correctIndex: 0,
    lawReference: 'História da Resistência Anticolonial - Rei Mandume',
    explanation: 'O Rei Mandume preferiu lutar até à morte em Oihole a render-se às forças coloniais invasoras.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_ha_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Acordo de Alvor foi assinado em Janeiro de 1975 na região de:',
    options: [
      'Algarve (Portugal)',
      'Lisboa (Portugal)',
      'Lusaka (Zâmbia)',
      'Gbadolite (Zaire)'
    ],
    correctIndex: 0,
    lawReference: 'História Política Contemporânea - Acordo de Alvor',
    explanation: 'O Acordo do Alvor foi assinado na vila do Alvor, em Portimão, no Algarve, Portugal.',
    difficulty: 'médio'
  },
  {
    id: 'sim_ha_3',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A criação da OUA (Organização da Unidade Africana), precursora da União Africana, em 25 de Maio de 1963, teve como líder nacionalista angolano signatário do apoio à libertação:',
    options: [
      'Comité de Libertação da OUA em Adis Abeba',
      'Comissão Trilateral de Genebra',
      'Pacto de Varsóvia',
      'Conferência de Bandung'
    ],
    correctIndex: 0,
    lawReference: 'História Diplomática Pan-Africana - 25 de Maio',
    explanation: 'A OUA criou o Comité Especial de Descolonização para prestar apoio directo aos movimentos de libertação nacional em Angola e África.',
    difficulty: 'difícil'
  },
  {
    id: 'sim_ha_4',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O célebre monumento "O Kifangondo" localiza-se na província de:',
    options: [
      'Luanda',
      'Cuanza Norte',
      'Bengo',
      'Uíge'
    ],
    correctIndex: 0,
    lawReference: 'Património Histórico de Angola - Monumento aos Heróis de Kifangondo',
    explanation: 'O monumento aos heróis de Kifangondo ergue-se na localidade de Kifangondo, em Luanda.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_ha_5',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O segundo Presidente da República de Angola, que liderou o país durante o alcance da Paz em 2002, foi:',
    options: [
      'José Eduardo dos Santos',
      'João Lourenço',
      'António Agostinho Neto',
      'Lopo do Nascimento'
    ],
    correctIndex: 0,
    lawReference: 'História dos Presidentes da República de Angola',
    explanation: 'José Eduardo dos Santos governou de 1979 a 2017 e ficou historicamente conhecido como o "Arquitecto da Paz".',
    difficulty: 'médio'
  },
  {
    id: 'sim_ha_6',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Reino de Matamba destacou-se no século XVII por ter sido refúgio estratégico e polo militar da Rainha Njinga após o cerco ao:',
    options: [
      'Reino do Ndongo e Ilhas das Pedras Negras de Pungo Andongo',
      'Reino do Congo',
      'Reino da Huíla',
      'Território de Benguela-a-Velha'
    ],
    correctIndex: 0,
    lawReference: 'História dos Reinos Pré-Coloniais - Matamba e Ndongo',
    explanation: 'A Rainha Njinga fundou o poderoso estado unificado Ndongo-Matamba, resistindo durante mais de quatro décadas ao expansionismo colonial.',
    difficulty: 'difícil'
  },

  // --- ORGANIZAÇÃO POLÍTICA / CRA ---
  {
    id: 'sim_cra_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Segundo o Artigo 107.º da CRA, o sufrágio eleitoral em Angola é:',
    options: [
      'Universal, directo, secreto e periódico',
      'Indirecto e censitário conforme a renda',
      'Aberto e público por voto de mão erguida',
      'Exclusivo para maiores de 40 anos de idade'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 107.º (Sufrágio)',
    explanation: 'O direito de voto é universal, directo, igual e secreto para todos os cidadãos angolanos maiores de 18 anos.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_cra_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o quórum de deputados que compõe plenariamente a Assembleia Nacional de Angola?',
    options: [
      '220 Deputados',
      '180 Deputados',
      '250 Deputados',
      '150 Deputados'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 144.º (Composição da Assembleia Nacional)',
    explanation: 'A Assembleia Nacional é composta por 220 deputados: 130 eleitos pelo círculo nacional e 90 pelos círculos provinciais (5 por cada província).',
    difficulty: 'médio'
  },
  {
    id: 'sim_cra_3',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Conselho de Segurança Nacional (Artigo 136.º da CRA) é o órgão consultivo do Presidente da República competente para assuntos relativos a:',
    options: [
      'Segurança nacional, defesa da soberania, integridade territorial e funcionamento das Forças Armadas e órgãos policiais',
      'Concessão de alvarás de táxi e transportes públicos municipais',
      'Organização de campeonatos desportivos juvenis',
      'Fixação de calendários de exames escolares do ensino primário'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 136.º (Conselho de Segurança Nacional)',
    explanation: 'O Conselho de Segurança Nacional assessora o Chefe de Estado em matérias estratégicas de defesa militar e segurança interna.',
    difficulty: 'difícil'
  },
  {
    id: 'sim_cra_4',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O Princípio da Igualdade perante a Lei (Artigo 23.º da CRA) proíbe qualquer discriminação fundada em:',
    options: [
      'Sexo, raça, etnia, cor, língua, religião, convicções políticas ou condição social',
      'Apenas na cor dos sapatos do cidadão',
      'Na data de compra de um veículo',
      'No tipo de cartão bancário utilizado'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 23.º (Princípio da Igualdade)',
    explanation: 'Todos os cidadãos são iguais perante a Constituição e a lei, gozando dos mesmos direitos e deveres sem discriminação.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_cra_5',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o tribunal superior da jurisdição comum em Angola com competência de última instância em matéria cível e criminal?',
    options: [
      'Tribunal Supremo',
      'Tribunal Constitucional',
      'Tribunal de Contas',
      'Supremo Tribunal Militar'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 181.º (Tribunal Supremo)',
    explanation: 'O Tribunal Supremo é a instância superior da jurisdição comum ordinária na República de Angola.',
    difficulty: 'médio'
  },

  // --- ADMINISTRAÇÃO PÚBLICA ---
  {
    id: 'sim_adm_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O que deve fazer o funcionário público que constata um conflito de interesses entre a sua função e um negócio privado de um familiar directo?',
    options: [
      'Declarar-se imediatamente impedido e suscitar a sua escusa formal do processo perante o seu superior hierárquico',
      'Acelerar a aprovação do negócio em segredo',
      'Fazer chantagem com a empresa concorrente',
      'Destruir o processo administrativo'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 (Lei da Probidade Pública) - Regime de Impedimentos e Suspeições',
    explanation: 'O agente público está legalmente obrigado a declarar impedimento quando intervenha em assunto onde tenha interesse pessoal ou familiar directo.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_adm_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O que se entende por "Presunção de Legalidade" do Acto Administrativo?',
    options: [
      'Presume-se que o acto administrativo praticado pelo órgão público é legal e válido até que seja declarada a sua invalidade por órgão ou tribunal competente',
      'Presume-se que todo acto da administração é automaticamente criminoso',
      'Presume-se que os funcionários não precisam de ler as leis',
      'Presume-se que os actos são todos temporários e duram 24 horas'
    ],
    correctIndex: 0,
    lawReference: 'Direito Administrativo Geral - Atributos do Acto Administrativo',
    explanation: 'A presunção de legalidade e veracidade permite a execução imediata das decisões públicas para salvaguarda do interesse colectivo.',
    difficulty: 'médio'
  },
  {
    id: 'sim_adm_3',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Reclamação Graciosa no procedimento administrativo angolano dirige-se a:',
    options: [
      'Ao próprio autor do acto administrativo impugnado, solicitando a sua revogação, anulação ou modificação',
      'Ao tribunal de comarca em processo judicial contencioso',
      'À Assembleia Nacional para alteração do estatuto',
      'Ao Provedor de Justiça da União Africana'
    ],
    correctIndex: 0,
    lawReference: 'Decreto-Lei n.º 16-A/95 (Normas do Procedimento Administrativo) - Reclamação e Recurso Hierárquico',
    explanation: 'A reclamação administrativa é dirigida ao próprio autor do acto (enquanto o recurso hierárquico é dirigido ao superior deste).',
    difficulty: 'difícil'
  },
  {
    id: 'sim_adm_4',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O dever de Zelo e Dedicação do funcionário público implica:',
    options: [
      'Conhecer as normas legais e regulamentares e desempenhar as funções com rigor, competência técnica e eficácia',
      'Deixar os expedientes acumularem na secretária por semanas',
      'Transferir as tarefas de rotina para cidadãos que aguardam atendimento',
      'Utilizar os veículos de serviço para fins exclusivamente recreativos particulares'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 (LGTFP) - Dever de Zelo',
    explanation: 'O dever de zelo obriga o servidor a aprimorar constantemente os seus conhecimentos e a executar as tarefas públicas com brio profissional.',
    difficulty: 'fácil'
  },

  // --- LEGISLAÇÃO MININT (TODOS OS 5 RAMOS) ---
  {
    id: 'sim_pna_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'A Direcção de Protecção de Objectivos Estratégicos (DPOE) da PNA tem como função:',
    options: [
      'Garantir a segurança estática e dinâmica das infraestruturas públicas vitais do país (centrais eléctricas, pontes, reservatórios e ministérios)',
      'Organizar desfiles escolares de fim de ano',
      'Emitir vistos de trânsito em aeroportos',
      'Tratar de reclusos no interior dos presídios'
    ],
    correctIndex: 0,
    lawReference: 'Estatuto Orgânico da PNA - DPOE',
    explanation: 'A DPOE protege os alvos e infraestruturas cruciais para a sobrevivência e funcionamento do Estado.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_pna_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A Polícia de Guarda Fronteiras de Angola (PGFA) é o órgão da PNA vocacionado para:',
    options: [
      'A vigilância, patrulhamento e protecção das fronteiras terrestres e fluviais da República de Angola',
      'O combate a incêndios florestais no litoral',
      'A investigação de fraudes cibernéticas em redes bancárias',
      'A instrução de processos disciplinares na função pública'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 6/20 - Polícia de Guarda Fronteiras',
    explanation: 'A PGFA guarnece a linha de fronteira nacional, impedindo violações de fronteira e invasões.',
    difficulty: 'médio'
  },
  {
    id: 'sim_sic_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O SIC coadjuva tecnicamente que instituição na direcção da acção penal em Angola?',
    options: [
      'A Procuradoria-Geral da República (Ministério Público)',
      'O Ministério da Justiça e dos Direitos Humanos',
      'A Inspecção-Geral da Administração do Estado (IGAE)',
      'A Ordem dos Médicos de Angola'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 186.º e Lei Orgânica do SIC',
    explanation: 'O Ministério Público é o titular da acção penal e o SIC actua sob a sua orientação jurídica processual.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_sic_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'No processo penal angolano, a cadeia de custódia da prova pericial recolhida pelo SIC tem como finalidade garantir:',
    options: [
      'A rastreabilidade, idoneidade, integridade e inviolabilidade dos vestígios do crime desde a recolha no local até à apresentação em julgamento',
      'A venda rápida dos bens apreendidos antes do fim do processo',
      'A divulgação imediata das provas nos canais de televisão',
      'O descarte de provas após 24 horas'
    ],
    correctIndex: 0,
    lawReference: 'Código de Processo Penal (Lei n.º 39/20) - Cadeia de Custódia da Prova Pericial',
    explanation: 'A quebra injustificada da cadeia de custódia pode acarretar a nulidade insanável da prova pericial em juízo.',
    difficulty: 'difícil'
  },
  {
    id: 'sim_sme_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Nos aeroportos internacionais de Angola, o controlo do fluxo de passageiros e carimbo de entrada/saída é efectuado por:',
    options: [
      'Serviço de Migração e Estrangeiros (SME)',
      'Serviço Penitenciário (SP)',
      'Serviço de Protecção Civil e Bombeiros (SPCB)',
      'Direcção Nacional de Viação e Trânsito'
    ],
    correctIndex: 0,
    lawReference: 'Estatuto Orgânico do SME (DP n.º 107/20)',
    explanation: 'O SME tem competência exclusiva para o controlo migratório de fronteira nos aeroportos, portos e postos terrestres.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_sme_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Visto de Turismo emitido pelo SME autoriza o titular a:',
    options: [
      'Viagens de carácter recreativo, desportivo ou cultural, sendo expressamente vedado o exercício de actividade de trabalho remunerada',
      'Trabalhar como empregado de comércio por 5 anos',
      'Votar nas Eleições Gerais angolanas',
      'Comprar armas de fogo em armarias civis'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 (Regime Jurídico dos Estrangeiros)',
    explanation: 'O visto turístico veda terminantemente o exercício de qualquer actividade profissional assalariada no país.',
    difficulty: 'médio'
  },
  {
    id: 'sim_spcb_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em caso de fuga de gás butano de cozinha com cheiro intenso, qual é a primeira acção correcta antes da chegada dos Bombeiros (SPCB)?',
    options: [
      'Fechar imediatamente a válvula de segurança do botijão, abrir portas e janelas para ventilação e NÃO accionar interruptores nem fósforos',
      'Ligar a luz do tecto para ver de onde vem a fuga',
      'Acender uma vela para queimar o gás acumulado',
      'Ligar o aspirador de pó para retirar o gás do quarto'
    ],
    correctIndex: 0,
    lawReference: 'Manual de Segurança Doméstica e Prevenção de Acidentes (SPCB)',
    explanation: 'Faíscas eléctricas de interruptores ou chamas abertas provocam a deflagração e explosão imediata da mistura gasosa.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_spcb_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'As actividades de Socorrismo e Suporte Básico de Vida (SBV) realizadas pelos operacionais do SPCB incluem prioritariamente:',
    options: [
      'Desobstrução de vias aéreas, reanimação cardiopulmonar (RCP) e estancamento de hemorragias externas graves',
      'Prescrição de antibióticos e cirurgias complexas no local',
      'Venda de medicamentos de balcão aos transeuntes',
      'Julgamento de culpados no acidente de viação'
    ],
    correctIndex: 0,
    lawReference: 'Protocolos de Atendimento Pré-Hospitalar (APH) do SPCB',
    explanation: 'O suporte básico de vida mantém a oxigenação e a circulação da vítima até à sua admissão na urgência hospitalar.',
    difficulty: 'médio'
  },
  {
    id: 'sim_sp_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o direito fundamental do recluso consagrado na Lei Penitenciária que não pode ser suspenso durante a pena?',
    options: [
      'Direito à vida, à integridade física e moral, à alimentação, à saúde e à assistência religiosa',
      'Direito de circular livremente pelas ruas da cidade durante a noite',
      'Direito de portar armas de fogo dentro do pavilhão prisional',
      'Direito de recusar todas as regras de segurança do presídio'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 (Lei Penitenciária) - Artigo 19.º (Direitos dos Reclusos)',
    explanation: 'O recluso perde unicamente o direito à liberdade de locomoção, mantendo intactos todos os demais direitos inerentes à dignidade da pessoa humana.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_sp_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'No regime penitenciário progressivo angolano, a transição do Regime Fechado para o Regime Semiaberto visa:',
    options: [
      'Promover a progressiva adaptação do recluso à vida em liberdade, mediante trabalho exterior e saídas jurisdicionais vigiadas',
      'Aumentar o número de dias de punição em isolamento celular',
      'Permitir o encerramento definitivo dos tribunais de comarca',
      'Transferir a custódia para empresas privadas sem controlo do Estado'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 - Regime de Execução das Penas',
    explanation: 'A progressão de regime baseia-se no mérito, disciplina e preparação do condenado para o convívio social produtivo.',
    difficulty: 'difícil'
  },

  // --- PATRIOTISMO E VALORES CÍVICOS ---
  {
    id: 'sim_pvc_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'A Bandeira Nacional deve ser hasteada nos edifícios públicos e quartéis:',
    options: [
      'Ao nascer do sol e arriada ao pôr do sol (ou mantida iluminada durante a noite)',
      'Apenas nos dias de chuva torrencial',
      'Exclusivamente aos domingos à meia-noite',
      'Uma vez a cada 5 anos durante as eleições'
    ],
    correctIndex: 0,
    lawReference: 'Regulamento do Cerimonial do Estado e Uso dos Símbolos Nacionais',
    explanation: 'A Bandeira Nacional é hasteada ao romper da alvorada e arriada ao crepúsculo com honras de guarda.',
    difficulty: 'fácil'
  },
  {
    id: 'sim_pvc_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O amor à Pátria e o patriotismo saudável diferenciam-se do chauvinismo intolerante porque:',
    options: [
      'O patriotismo promove o orgulho pela história e cultura nacional respeitando a dignidade e a soberania de todos os demais povos e nações',
      'O patriotismo defende o ódio obrigatório a estrangeiros',
      'O patriotismo proíbe o estudo de línguas internacionais',
      'O patriotismo estimula a desobediência às autoridades legais'
    ],
    correctIndex: 0,
    lawReference: 'Educação Moral e Cívica e Princípios Constitucionais (CRA - Artigo 12.º)',
    explanation: 'O patriotismo angolano inspira-se na solidariedade, fraternidade e respeito mútuo nas relações internacionais e comunitárias.',
    difficulty: 'médio'
  },
  {
    id: 'sim_pvc_3',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Nos termos da CRA, a preservação do património histórico, artístico e arqueológico de Angola constitui uma obrigação:',
    options: [
      'Do Estado e da sociedade civil, garantindo a sua integridade e transmissão às gerações vindouras',
      'Exclusiva dos museus estrangeiros na Europa',
      'Apenas dos turistas que visitam o país',
      'Que cessa quando o monumento tem mais de 50 anos'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 87.º (Património Histórico, Cultural e Artístico)',
    explanation: 'O património cultural integra a memória colectiva e a identidade histórica inestimável da Nação Angolana.',
    difficulty: 'difícil'
  }
];

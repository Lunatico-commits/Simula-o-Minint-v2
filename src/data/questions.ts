import { Question, QuestionCategory, AcademicLevel, MININTBranch } from '../types';

export const QUESTION_BANK: Question[] = [
  // =========================================================================
  // 1. MATÉRIA OFICIAL: HISTÓRIA DE ANGOLA (historia_angola)
  // Factos históricos, datas marcantes, heróis nacionais e evolução do país
  // =========================================================================

  // --- 9.ª CLASSE ---
  {
    id: 'ha_9_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em que data foi proclamada a Independência Nacional da República de Angola?',
    options: [
      '11 de Novembro de 1975',
      '4 de Fevereiro de 1961',
      '17 de Setembro de 1979',
      '4 de Abril de 2002'
    ],
    correctIndex: 0,
    lawReference: 'História Contemporânea de Angola - Proclamação da Independência',
    explanation: 'A Independência Nacional de Angola foi solenemente proclamada à meia-noite de 11 de Novembro de 1975 pelo Dr. António Agostinho Neto, no Largo 1.º de Maio em Luanda.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_9_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O dia 4 de Fevereiro de 1961 é celebrado em Angola como um marco histórico de:',
    options: [
      'Início da Luta Armada de Libertação Nacional',
      'Assinatura do Acordo de Paz de Bicesse',
      'Dia do Herói Nacional',
      'Criação da Polícia Nacional de Angola'
    ],
    correctIndex: 0,
    lawReference: 'Efemérides Nacionais de Angola - 4 de Fevereiro',
    explanation: 'O 4 de Fevereiro de 1961 assinala o ataque patriótico às cadeias de Luanda (Casa de Reclusão, Cadeia da PIDE e 7.ª Esquadra), desencadeando a Luta Armada de Libertação Nacional.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_9_3',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Quem foi o primeiro Presidente da República de Angola e proclamador da Independência Nacional?',
    options: [
      'Dr. António Agostinho Neto',
      'José Eduardo dos Santos',
      'Holden Roberto',
      'Jonas Savimbi'
    ],
    correctIndex: 0,
    lawReference: 'Figuras Históricas da Nação Angolana',
    explanation: 'O Dr. António Agostinho Neto foi o líder nacionalista que proclamou a Independência Nacional e tornou-se o primeiro Presidente de Angola e Pai da Nação.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_9_4',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual soberana e heroína histórica angolana liderou a resistência armada contra a ocupação colonial portuguesa nos reinos do Ndongo e de Matamba no século XVII?',
    options: [
      'Rainha Nzinga Mbandi',
      'Rainha Lueji A\'Nkonde',
      'Dona Beatriz Kimpa Vita',
      'Princesa Teresa Gomes'
    ],
    correctIndex: 0,
    lawReference: 'Resistência Anticolonial nos Reinos Pré-coloniais',
    explanation: 'A Rainha Nzinga Mbandi (1583-1663) é uma das maiores figuras da história militar e diplomática de Angola, tendo combatido a invasão colonial com brilhantismo táctico.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_9_5',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O dia 4 de Abril é comemorado anualmente em Angola como o Dia Nacional de:',
    options: [
      'Paz e Reconciliação Nacional',
      'Herói Nacional',
      'Independência Nacional',
      'Defesa Nacional e Forças Armadas'
    ],
    correctIndex: 0,
    lawReference: 'Lei das Efemérides Nacionais de Angola - 4 de Abril',
    explanation: 'Em 4 de Abril de 2002 foi assinado no Palácio dos Congressos em Luanda o Memorando de Entendimento Complementar ao Protocolo de Lusaka (Memorando do Luena), selando a Paz definitiva.',
    difficulty: 'fácil'
  },

  // --- ENSINO MÉDIO ---
  {
    id: 'ha_m_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A histórica Batalha do Cuito Cuanavale (1987-1988), na província do Cuando Cubango, teve como consequência geopolítica fundamental:',
    options: [
      'A defesa da integridade e soberania de Angola, a libertação de Nelson Mandela e a independência da Namíbia',
      'A divisão territorial provisória do Sul de Angola sob mandato internacional',
      'A dissolução imediata do Ministério do Interior',
      'O encerramento do porto marítimo do Namibe'
    ],
    correctIndex: 0,
    lawReference: 'História Militar de Angola - Batalha de Cuito Cuanavale',
    explanation: 'A vitória das forças angolanas no Cuito Cuanavale alterou o equilíbrio de poder na África Austral, acelerou o fim do regime de Apartheid e viabilizou a independência da Namíbia.',
    difficulty: 'médio'
  },
  {
    id: 'ha_m_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Rei Mandume ya Ndemufayo, lendário soberano dos Kwanhama no Sul de Angola, destacou-se na história nacional por:',
    options: [
      'Liderar uma heróica resistência contra a ocupação colonial portuguesa e alemã até tombar em combate em 1917',
      'Assinar a rendição incondicional perante as forças coloniais em 1885',
      'Compor o primeiro hino monárquico do Reino do Congo',
      'Fundar a primeira capitania militar da província do Bengo'
    ],
    correctIndex: 0,
    lawReference: 'Resistência no Sul de Angola - Reino dos Kwanhama',
    explanation: 'Mandume ya Ndemufayo foi o último soberano do Reino Kwanhama; recusou submeter-se ao jugo colonial e preferiu a morte à rendição na Batalha de Oihole (Fevereiro de 1917).',
    difficulty: 'médio'
  },
  {
    id: 'ha_m_3',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Os Acordos de Alvor, assinados em Janeiro de 1975 em Portugal entre o governo português e os movimentos de libertação angolanos, estabeleceram:',
    options: [
      'O reconhecimento formal do direito de Angola à independência e a criação de um Governo de Transição',
      'A prorrogação da soberania ultramarina portuguesa por mais duas décadas',
      'A divisão de Angola em três repúblicas soberanas autónomas',
      'A exclusão de Luanda do território nacional angolano'
    ],
    correctIndex: 0,
    lawReference: 'História Política de Angola - Acordos de Alvor de 1975',
    explanation: 'Os Acordos de Alvor fixaram a data de 11 de Novembro de 1975 para a proclamação da Independência de Angola e definiram a integridade territorial nacional.',
    difficulty: 'médio'
  },
  {
    id: 'ha_m_4',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Tratado de Simulambuco, firmado a 1 de Fevereiro de 1885, ocorreu no contexto histórico de qual região angolana?',
    options: [
      'Cabinda',
      'Cunene',
      'Moxico',
      'Malanje'
    ],
    correctIndex: 0,
    lawReference: 'História Diplomática e Colonial de Angola',
    explanation: 'O Tratado de Simulambuco foi celebrado entre os príncipes e governantes de Cabinda e a coroa portuguesa nas vésperas da Conferência de Berlim.',
    difficulty: 'médio'
  },

  // --- ENSINO SUPERIOR ---
  {
    id: 'ha_s_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Na historiografia angolana, a revolta da Baixa de Cassanje, deflagrada a 4 de Janeiro de 1961, é reconhecida como:',
    options: [
      'O massacre dos camponeses do algodão pela Cotonang, prelúdio inspirador do início da Luta Armada',
      'A primeira conferência constitucional para a redacção da Lei Fundamental',
      'A rebelião dos comerciantes portugueses contra o comércio com a Europa',
      'O encerramento do Porto de Benguela e da ferrovia de Benguela'
    ],
    correctIndex: 0,
    lawReference: 'História do Nacionalismo Angolano - Baixa de Cassanje',
    explanation: 'A 4 de Janeiro de 1961, os camponeses da Baixa de Cassanje revoltaram-se contra o trabalho forçado do algodão imposto pela Cotonang, sendo brutalmente reprimidos pela aviação colonial.',
    difficulty: 'difícil'
  },
  {
    id: 'ha_s_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Rei Ekuikui II destacou-se no século XIX na região central de Angola como soberano de qual histórico reino?',
    options: [
      'Reino do Bailundo',
      'Reino do Ndongo',
      'Reino da Matamba',
      'Reino do Congo'
    ],
    correctIndex: 0,
    lawReference: 'História dos Reinos do Planalto Central de Angola',
    explanation: 'O Rei Ekuikui II governou o Reino do Bailundo entre 1876 e 1890, promovendo uma aliança entre os reinos ovimbundu e forte diplomacia para preservar a soberania das terras altas.',
    difficulty: 'difícil'
  },


  // =========================================================================
  // 2. MATÉRIA OFICIAL: ORGANIZAÇÃO POLÍTICA E ADMINISTRATIVA / CRA (organizacao_politica_cra)
  // Estrutura do Estado, Constituição da República de Angola e órgãos de soberania
  // =========================================================================

  // --- 9.ª CLASSE ---
  {
    id: 'cra_9_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'De acordo com o artigo 1.º da Constituição da República de Angola (CRA), Angola é uma República soberana baseada em quê?',
    options: [
      'Na dignidade da pessoa humana e na vontade do povo angolano',
      'No poder exclusivo dos comandantes militares das forças armadas',
      'Na divisão permanente das receitas fiscais entre regiões autónomas',
      'No sistema monárquico constitucional hereditário'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 1.º da Constituição da República de Angola (CRA)',
    explanation: 'O Artigo 1.º da CRA consagra: "Angola é uma República soberana, una e indivisível, baseada na dignidade da pessoa humana e na vontade do povo angolano".',
    difficulty: 'fácil'
  },
  {
    id: 'cra_9_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Quais são os Órgãos de Soberania da República de Angola consagrados no artigo 105.º da Constituição?',
    options: [
      'O Presidente da República, a Assembleia Nacional e os Tribunais',
      'O Ministro do Interior, os Governadores e os Administradores Municipais',
      'A Polícia Nacional, o Exército e o Serviço Penitenciário',
      'O Conselho de Ministros, os Partidos Políticos e a Ordem dos Advogados'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 105.º da Constituição da República de Angola (CRA)',
    explanation: 'São órgãos de soberania da República de Angola: o Presidente da República, a Assembleia Nacional e os Tribunais.',
    difficulty: 'fácil'
  },
  {
    id: 'cra_9_3',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Nos termos da nova Divisão Político-Administrativa da República de Angola, o país passou a estar estruturado em quantas províncias?',
    options: [
      '21 Províncias',
      '18 Províncias',
      '14 Províncias',
      '25 Províncias'
    ],
    correctIndex: 0,
    lawReference: 'Lei da Nova Divisão Político-Administrativa de Angola',
    explanation: 'A reforma da Divisão Político-Administrativa de Angola estabeleceu 21 províncias no território nacional (com a criação de novas províncias como Moxico-Leste, Cubango e Ícolo e Bengo).',
    difficulty: 'fácil'
  },
  {
    id: 'cra_9_4',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'De acordo com o artigo 59.º da CRA, a que autoridade pertence o monopólio do uso legítimo da força e da coacção armada em Angola?',
    options: [
      'Exclusivamente ao Estado, através das Forças Armadas e dos órgãos de segurança e ordem pública',
      'Às empresas privadas de segurança e vigilância comercial',
      'A qualquer cidadão que possua licença de porte de arma de caça',
      'Aos comités comunitários de moradores dos bairros'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 59.º da Constituição da República de Angola',
    explanation: 'O Estado detém o monopólio exclusivo do uso da força e coacção armada para assegurar a defesa nacional, a segurança pública e a integridade do território.',
    difficulty: 'fácil'
  },

  // --- ENSINO MÉDIO ---
  {
    id: 'cra_m_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da Constituição da República de Angola, quantos deputados compõem a Assembleia Nacional e qual é a duração normal da legislatura?',
    options: [
      '220 Deputados, eleitos para um mandato de 5 anos',
      '180 Deputados, eleitos para um mandato de 4 anos',
      '250 Deputados, eleitos para um mandato vitalício',
      '150 Deputados, eleitos para um mandato de 3 anos'
    ],
    correctIndex: 0,
    lawReference: 'Artigos 143.º e 144.º da Constituição da República de Angola',
    explanation: 'A Assembleia Nacional é composta por 220 deputados eleitos por sufrágio universal, igual, directo e secreto para um mandato de 5 anos.',
    difficulty: 'médio'
  },
  {
    id: 'cra_m_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Conselho da República em Angola é configurado constitucionalmente como:',
    options: [
      'Um órgão colegial de consulta política do Chefe de Estado',
      'O tribunal supremo encarregado de julgar crimes de sangue',
      'A comissão permanente de gestão das receitas do petróleo',
      'A direcção executiva de trânsito rodoviário nacional'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 134.º da Constituição da República de Angola',
    explanation: 'O Conselho da República é o órgão colegial consultivo do Presidente da República, integrando figuras de destaque do Estado e da sociedade civil.',
    difficulty: 'médio'
  },
  {
    id: 'cra_m_3',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o órgão jurisdicional a quem compete a administração da justiça em matéria de natureza jurídico-constitucional na República de Angola?',
    options: [
      'Tribunal Constitucional',
      'Tribunal Supremo',
      'Tribunal de Contas',
      'Supremo Tribunal Militar'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 180.º da Constituição da República de Angola',
    explanation: 'Ao Tribunal Constitucional compete administrar a justiça em matérias de fiscalização da constitucionalidade das leis e validação de processos eleitorais.',
    difficulty: 'médio'
  },

  // --- ENSINO SUPERIOR ---
  {
    id: 'cra_s_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A providência constitucional de "Habeas Data" (Artigo 69.º da CRA) tem por finalidade primordial garantir ao cidadão:',
    options: [
      'O direito de aceder, retificar ou atualizar informações sobre si constantes de ficheiros informáticos ou arquivos públicos e privados',
      'A libertação imediata em caso de detenção policial ilegal',
      'A suspensão cautelar de impostos aduaneiros sobre veículos',
      'A concessão de passaporte diplomático para viagens ao exterior'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 69.º da Constituição da República de Angola - Habeas Data',
    explanation: 'O Habeas Data assegura a todos o conhecimento do que constar a seu respeito em arquivos ou registos de dados, bem como o direito à respectiva retificação ou atualização.',
    difficulty: 'difícil'
  },
  {
    id: 'cra_s_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Nos termos da CRA, a declaração de Estado de Sítio ou de Estado de Emergência pelo Presidente da República carece de qual formalidade essencial prévia?',
    options: [
      'Audição do Conselho da República e autorização da Assembleia Nacional',
      'Votação popular por referendo em todas as províncias',
      'Aprovação da União Africana e das Nações Unidas',
      'Parecer vinculativo da Ordem dos Advogados de Angola'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 58.º e 119.º da Constituição da República de Angola',
    explanation: 'O Presidente da República declara o estado de sítio ou de emergência após ouvir o Conselho de Segurança Nacional, o Conselho da República e com autorização da Assembleia Nacional.',
    difficulty: 'difícil'
  },


  // =========================================================================
  // 3. MATÉRIA OFICIAL: NOÇÕES DE ADMINISTRAÇÃO PÚBLICA (nocoes_administracao_publica)
  // Princípios de gestão estatal, probidade pública, ética e regime da função pública
  // =========================================================================

  // --- 9.ª CLASSE ---
  {
    id: 'adm_9_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o princípio fundamental segundo o qual todo o funcionário público deve agir estritamente em conformidade com as leis do Estado?',
    options: [
      'Princípio da Legalidade',
      'Princípio do Lucro Financeiro',
      'Princípio da Conivência Familiar',
      'Princípio da Informalidade dos Serviços'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 198.º da CRA e Princípios Gerais da Administração Pública',
    explanation: 'O Princípio da Legalidade obriga a Administração Pública e os seus agentes a actuarem em total subordinação à Constituição e à Lei.',
    difficulty: 'fácil'
  },
  {
    id: 'adm_9_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O dever de "Segredo Profissional / Sigilo Funcional" na Administração Pública proíbe o funcionário de:',
    options: [
      'Divulgar ou utilizar factos ou informações confidenciais de que tenha conhecimento no exercício das suas funções',
      'Cumprir ordens legítimas emitidas pelos seus superiores hierárquicos',
      'Atender os cidadãos com simpatia e urbanidade nos balcões de atendimento',
      'Participar em formações técnicas promovidas pelo Ministério'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 - Deveres Especiais dos Funcionários Públicos',
    explanation: 'O sigilo funcional é dever ético e jurídico fundamental que resguarda a segurança do Estado, os dados pessoais dos utentes e as operações confidenciais.',
    difficulty: 'fácil'
  },
  {
    id: 'adm_9_3',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O que caracteriza a prática criminosa de "Corrupção Passiva" ou recebimento indevido por parte de um agente público?',
    options: [
      'Solicitar ou aceitar dinheiro, bens ou vantagens pessoais para praticar ou omitir um acto oficial',
      'Prestar informações gratuitas sobre os horários de expediente ao público',
      'Orientar um utente sobre os procedimentos legais de obtenção de um bilhete de identidade',
      'Recusar gorjetas e cumprir escrupulosamente os prazos do serviço'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 - Lei da Probidade Pública e Código Penal',
    explanation: 'A corrupção passiva consiste no acto ilícito de receber, aceitar promessa ou solicitar vantagem indevida em razão do cargo público desempenhado.',
    difficulty: 'fácil'
  },

  // --- ENSINO MÉDIO ---
  {
    id: 'adm_m_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'De acordo com a Lei n.º 26/22 (Lei de Bases da Função Pública), o princípio da Imparcialidade impõe que a Administração Pública trate todos os cidadãos:',
    options: [
      'Com total equidade e neutralidade, sem privilégios ou discriminações de raça, género, filiação partidária ou credo',
      'Dando prioridade automática aos amigos e familiares directos dos funcionários',
      'Cobrando valores não previstos na tabela de taxas e emolumentos do Estado',
      'Concedendo favores aos cidadãos com maior património financeiro'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 - Princípios da Função Pública em Angola',
    explanation: 'A imparcialidade veda o favoritismo e exige que o agente público tome decisões baseadas unicamente no interesse colectivo e nos critérios legais vigentes.',
    difficulty: 'médio'
  },
  {
    id: 'adm_m_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da Lei da Probidade Pública (Lei n.º 3/10), os agentes públicos em cargos de direcção, chefia e responsabilidade fiscal têm o dever de entregar periodicamente:',
    options: [
      'Declaração de Bens e Rendimentos junto da Procuradoria-Geral da República',
      'Um relatório com as suas opiniões pessoais sobre os vizinhos do bairro',
      'O passaporte original para retenção nos arquivos centrais',
      'Um plano de investimentos na bolsa de valores estrangeira'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 - Declaração de Bens dos Agentes Públicos',
    explanation: 'A Declaração de Bens e Rendimentos assegura a transparência patrimonial, prevenindo o enriquecimento ilícito no exercício de cargos de autoridade pública.',
    difficulty: 'médio'
  },
  {
    id: 'adm_m_3',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Na redacção de correspondência e expedientes oficiais (ofícios, despachos e relatórios policiais), deve predominar qual atributo estilístico?',
    options: [
      'Clareza, precisão terminológica, sobriedade e concisão técnica',
      'Metáforas poéticas, calão urbano e adjetivação sentimental',
      'Linguagem telegráfica e omissão intencional de datas e assinaturas',
      'Vocabulário arcaico de difícil compreensão pelos destinatários'
    ],
    correctIndex: 0,
    lawReference: 'Normas de Redacção de Actos Administrativos Oficiais',
    explanation: 'A redacção oficial no serviço público rege-se pelo padrão culto da língua, clareza, concisão e impessoalidade na transmissão de actos do Estado.',
    difficulty: 'médio'
  },

  // --- ENSINO SUPERIOR ---
  {
    id: 'adm_s_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Nos termos da Lei n.º 26/22, a exoneração de um funcionário público provido por nomeação definitiva só pode ocorrer validamente através de:',
    options: [
      'Acto formal fundamentado nos termos da lei, na sequência de procedimento disciplinar garantístico ou a pedido do próprio funcionário',
      'Decisão verbal informal comunicada por mensagem telefónica sem registo escrito',
      'Decisão arbitrária imediata sem direito a audição ou defesa prévia',
      'Acordo sigiloso entre os colegas de trabalho do mesmo escalão'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 - Lei de Bases da Função Pública (Cessação do Vínculo)',
    explanation: 'A estabilidade no vínculo público impõe que qualquer cessação forçada seja precedida de processo administrativo-disciplinar com respeito pelo contraditório.',
    difficulty: 'difícil'
  },
  {
    id: 'adm_s_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O princípio da Proporcionalidade na actividade administrativa do Estado desdobra-se em três subprincípios essenciais, que são:',
    options: [
      'Adequação, Necessidade (ou exigibilidade) e Proporcionalidade em sentido estrito',
      'Celeridade, Publicidade e Arbitrariedade',
      'Hierarquia, Obediência cega e Imunidade judicial',
      'Onerosidade, Complexidade e Reciprocidade diplomática'
    ],
    correctIndex: 0,
    lawReference: 'Direito Administrativo Angolano - Princípio da Proporcionalidade',
    explanation: 'A intervenção da autoridade pública deve ser adequada ao fim, necessária (menor restrição de direitos possível) e justa em sentido estrito (equilíbrio custos/benefícios).',
    difficulty: 'difícil'
  },


  // =========================================================================
  // 4. MATÉRIA OFICIAL: LEGISLAÇÃO E FUNCIONAMENTO DO MININT (legislacao_minint)
  // Leis orgânicas, estatutos de carreira e competências específicas por ramo
  // =========================================================================

  // --- MININT GERAL (GERAL) ---
  {
    id: 'min_g_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a principal missão comum do Ministério do Interior (MININT) na República de Angola?',
    options: [
      'Garantir a ordem, segurança e tranquilidade públicas, e assegurar a protecção de pessoas e bens',
      'Gerir o sistema bancário e fixar a taxa de câmbio nacional',
      'Construir e asfaltar estradas e pontes em todas as províncias',
      'Administrar exclusivamente a rede de escolas e hospitais municipais'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 32/18 - Estatuto Orgânico do MININT',
    explanation: 'O MININT é o departamento ministerial responsável pela segurança interna, ordem pública, investigação penal, fiscalização migratória, protecção civil e custódia prisional.',
    difficulty: 'fácil'
  },
  {
    id: 'min_g_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos do Estatuto Orgânico do MININT (DP n.º 32/18), quais são os 5 órgãos executivos directos integrados no Ministério do Interior?',
    options: [
      'PNA, SIC, SME, SPCB e Serviço Penitenciário (SP)',
      'FAA, Polícia Militar, Guarda Presidencial, SINSE e Capitania dos Portos',
      'Tribunal Supremo, PGR, Ordem dos Advogados, Casa Militar e INSS',
      'ENSA, Sonangol, AGT, Porto de Luanda e Caminhos de Ferro'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial n.º 32/18 - Órgãos Executivos Directos do MININT',
    explanation: 'Os órgãos executivos do MININT são: Polícia Nacional de Angola (PNA), Serviço de Investigação Criminal (SIC), Serviço de Migração e Estrangeiros (SME), Serviço de Protecção Civil e Bombeiros (SPCB) e Serviço Penitenciário (SP).',
    difficulty: 'médio'
  },

  // --- POLÍCIA NACIONAL DE ANGOLA (PNA) ---
  {
    id: 'pna_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o número telefónico de emergência nacional gratuito e directo da Polícia Nacional de Angola (PNA)?',
    options: [
      '113',
      '115',
      '118',
      '111'
    ],
    correctIndex: 0,
    lawReference: 'Linha de Emergência Policial da República de Angola',
    explanation: 'O número 113 é a linha directa de emergência da Polícia Nacional de Angola (o 115 é dos Bombeiros).',
    difficulty: 'fácil'
  },
  {
    id: 'pna_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'PNA',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'De acordo com a Lei n.º 25/20 (Estatuto do Pessoal da Polícia Nacional), o uso de armas de fogo por agentes da PNA só é juridicamente admissível quando:',
    options: [
      'Estritamente necessário, proporcional e para repelir agressão iminente, grave e ilegítima contra a vida',
      'O cidadão se recuse verbalmente a cumprir uma ordem de trânsito menor',
      'O agente pretenda dispersar uma multidão pacífica num festival cultural',
      'O agente pretenda acelerar o encerramento do seu turno de serviço'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 25/20 e Princípios Internacionais do Uso da Força e Armas de Fogo',
    explanation: 'O uso de armas de fogo é uma medida extrema de última instância que exige obediência escrupulosa aos princípios da necessidade, adequação e proporcionalidade.',
    difficulty: 'médio'
  },
  {
    id: 'pna_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'PNA',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Polícia de Intervenção Rápida (PIR) e a Polícia de Guarda Fronteiras (PGF) integram a estrutura orgânica da PNA como:',
    options: [
      'Forças de especialidade operacional de reserva e segurança estratégica da Polícia Nacional',
      'Direcções financeiras de cobrança de multas fiscais',
      'Empresas privadas terceirizadas sob concessão pública',
      'Órgãos sindicais de representação dos subchefes da polícia'
    ],
    correctIndex: 0,
    lawReference: 'Estrutura Orgânica Operacional da Polícia Nacional de Angola',
    explanation: 'A PIR e a PGF constituem especialidades táctico-operacionais da Polícia Nacional vocacionadas para segurança reforçada, choque, antiterrorismo e integridade das fronteiras terrestres.',
    difficulty: 'difícil'
  },

  // --- SERVIÇO DE INVESTIGAÇÃO CRIMINAL (SIC) ---
  {
    id: 'sic_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SIC',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a principal atribuição institucional do Serviço de Investigação Criminal (SIC) no quadro da segurança pública angolana?',
    options: [
      'Investigar infracções penais, recolher provas e identificar os autores de crimes',
      'Emitir vistos de turismo para cidadãos estrangeiros nas fronteiras',
      'Combater focos de incêndio em edifícios urbanos e florestas',
      'Guardar e custodiar reclusos condenados nas comarcas prisionais'
    ],
    correctIndex: 0,
    lawReference: 'Estatuto Orgânico do Serviço de Investigação Criminal (SIC)',
    explanation: 'O SIC é o órgão executivo encarregado da investigação criminal, instrução de processos penais sob direcção do Ministério Público e perícias de criminalística.',
    difficulty: 'fácil'
  },
  {
    id: 'sic_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SIC',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A actuação do SIC na fase de instrução preparatória do processo-crime desenvolve-se sob a direcção jurídica e funcional de qual entidade judiciária?',
    options: [
      'Ministério Público (Magistrados do Ministério Público / Procuradoria-Geral da República)',
      'Governador Provincial da circunscrição territorial',
      'Comandante de Trânsito Municipal',
      'Director Geral dos Serviços Prisionais'
    ],
    correctIndex: 0,
    lawReference: 'Código de Processo Penal Angolano (Lei n.º 39/20) e Lei Orgânica do SIC',
    explanation: 'Nos termos da lei processual penal angolana, a instrução preparatória corre sob a direcção exclusiva do Ministério Público, coadjuvado pelos órgãos de polícia criminal (SIC).',
    difficulty: 'médio'
  },
  {
    id: 'sic_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SIC',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Laboratório Central de Criminalística (LCC) do SIC é a unidade técnica e científica responsável por:',
    options: [
      'Realizar perícias de balística, datiloscopia, genética forense (ADN), toxicologia e grafotécnica',
      'Elaborar o orçamento anual das compras de fardamento do MININT',
      'Conceder alvarás de exploração comercial a feirantes informais',
      'Administrar o regime disciplinar dos reclusos em meio aberto'
    ],
    correctIndex: 0,
    lawReference: 'Lei de Perícias Forenses e Regulamento da Criminalística do SIC',
    explanation: 'O Laboratório de Criminalística produz a prova pericial e técnico-científica indispensável para a demonstração da materialidade e autoria dos delitos criminais.',
    difficulty: 'difícil'
  },

  // --- SERVIÇO DE MIGRAÇÃO E ESTRANGEIROS (SME) ---
  {
    id: 'sme_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SME',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a principal responsabilidade do Serviço de Migração e Estrangeiros (SME) em Angola?',
    options: [
      'Controlar a entrada, permanência, trânsito e saída de pessoas nas fronteiras nacionais e fiscalizar o regime de estrangeiros',
      'Registar automóveis e emitir cartas de condução ligeira e pesada',
      'Socorrer banhistas nas praias marítimas e fluviais',
      'Julgar litígios de herança familiar nos tribunais de comarca'
    ],
    correctIndex: 0,
    lawReference: 'Estatuto Orgânico do Serviço de Migração e Estrangeiros (SME)',
    explanation: 'O SME é o órgão do MININT encarregado de fazer cumprir a política migratória, controlar os postos de fronteira aéreos, marítimos e terrestres e fiscalizar cidadãos estrangeiros.',
    difficulty: 'fácil'
  },
  {
    id: 'sme_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SME',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos termos da Lei n.º 13/19 (Regime Jurídico dos Cidadãos Estrangeiros em Angola), qual tipo de visto autoriza o cidadão estrangeiro a exercer actividade profissional remunerada por conta de outrem?',
    options: [
      'Visto de Trabalho',
      'Visto de Turismo',
      'Visto de Curta Duração',
      'Visto de Escala Aeroportuária'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 - Tipologias de Vistos de Entrada em Angola',
    explanation: 'O Visto de Trabalho é o único que habilita legalmente o estrangeiro a prestar trabalho subordinado no país perante contrato homologado pelas autoridades competentes.',
    difficulty: 'médio'
  },
  {
    id: 'sme_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SME',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A medida coerciva de Expulsão Administrativa ou Judicial de um cidadão estrangeiro que cometa graves atentados contra a segurança nacional ou permaneça clandestino no país é executada por qual órgão do MININT?',
    options: [
      'Serviço de Migração e Estrangeiros (SME)',
      'Serviço de Protecção Civil e Bombeiros (SPCB)',
      'Direcção de Trânsito da Polícia Nacional',
      'Comissão Provincial Eleitoral'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 - Processo de Afastamento Coercivo e Repatriamento',
    explanation: 'Compete ao SME a condução dos centros de detenção temporária para imigrantes ilegais e a execução dos mandados de repatriamento e expulsão do território nacional.',
    difficulty: 'difícil'
  },

  // --- SERVIÇO DE PROTECÇÃO CIVIL E BOMBEIROS (SPCB) ---
  {
    id: 'spcb_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SPCB',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o número telefónico nacional gratuito de socorro para accionar o Serviço de Protecção Civil e Bombeiros (SPCB)?',
    options: [
      '115',
      '113',
      '112',
      '118'
    ],
    correctIndex: 0,
    lawReference: 'Linhas Nacionais de Emergência de Angola',
    explanation: 'O 115 é a linha de emergência e socorro de combate a incêndios e protecção civil dos Bombeiros de Angola.',
    difficulty: 'fácil'
  },
  {
    id: 'spcb_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SPCB',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'De acordo com a Lei de Bases da Protecção Civil (Lei n.º 14/02), a actividade de protecção civil visa prioritariamente:',
    options: [
      'Prevenir riscos colectivos, socorrer pessoas e salvar património em caso de acidentes graves, incêndios e calamidades naturais',
      'Controlar a entrada de cargas contentorizadas no porto marítimo de Luanda',
      'Fiscalizar o pagamento de impostos sobre rendimento de trabalho',
      'Emitir certidões de registo criminal a requerimento dos interessados'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 14/02 - Lei de Bases da Protecção Civil em Angola',
    explanation: 'A protecção civil tem carácter permanente e multidisciplinar, integrando prevenção de catástrofes, apoio a sinistrados e reabilitação de infra-estruturas críticas.',
    difficulty: 'médio'
  },
  {
    id: 'spcb_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SPCB',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'No âmbito da segurança contra incêndios em edifícios públicos e privados em Angola, a emissão do "Certificado de Segurança Contra Incêndios" compete privativamente a qual entidade?',
    options: [
      'Serviço de Protecção Civil e Bombeiros (SPCB)',
      'Empresas de telecomunicações móveis',
      'Tribunais de Relação Provinciais',
      'Inspecção Geral da Administração do Território'
    ],
    correctIndex: 0,
    lawReference: 'Regulamento de Segurança Contra Incêndios em Edifícios e Instalações',
    explanation: 'O SPCB fiscaliza as condições de habitabilidade, vias de evacuação, hidrantes e extintores, sendo a autoridade competente para licenciar e certificar edifícios.',
    difficulty: 'difícil'
  },

  // --- SERVIÇO PENITENCIÁRIO (SP) ---
  {
    id: 'sp_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SP',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a finalidade essencial da pena privativa de liberdade no âmbito da actuação do Serviço Penitenciário (SP) de Angola?',
    options: [
      'Garantir a custódia legal do recluso, promovendo a sua reabilitação e reintegração social na sociedade',
      'Aplicar castigos corporais e tortura psicológica aos condenados',
      'Impedir os reclusos de receberem alimentação saudável e cuidados médicos',
      'Manter os reclusos incomunicáveis indefinidamente sem julgamento'
    ],
    correctIndex: 0,
    lawReference: 'Lei Penitenciária e Artigo 60.º da Constituição de Angola',
    explanation: 'A execução penitenciária é orientada pelos princípios da humanização, respeito pela dignidade humana, capacitação profissional e ressocialização dos cidadãos reclusos.',
    difficulty: 'fácil'
  },
  {
    id: 'sp_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SP',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nos estabelecimentos prisionais sob custódia do Serviço Penitenciário, os reclusos em prisão preventiva devem estar alojados:',
    options: [
      'Em secções rigorosamente separadas dos reclusos condenados por sentença transitada em julgado',
      'Misturados indiferenciadamente com reclusos de alta perigosidade em celas comuns',
      'Fora do perímetro prisional sob custódia de seguranças privados',
      'Exclusivamente em tendas de campanha provisórias no pátio exterior'
    ],
    correctIndex: 0,
    lawReference: 'Lei Penitenciária e Normas Mínimas das Nações Unidas para o Tratamento de Reclusos',
    explanation: 'A separação de preventivos e condenados é uma garantia fundamental de legalidade e protecção dos direitos humanos, impedindo a contaminação criminógena.',
    difficulty: 'médio'
  },
  {
    id: 'sp_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação e Funcionamento do MININT',
    branch: 'SP',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A concessão da Liberdade Condicional a um recluso que cumpra metade ou dois terços da pena privativa de liberdade depende de decisão exclusiva de qual autoridade?',
    options: [
      'Do Juiz do Tribunal de Execução de Penas (Poder Judicial)',
      'Do Director da Cadeia Provincial por despacho verbal',
      'Do Chefe de Posto da Guarda Penitenciária de turno',
      'Da Comissão de Bairro onde o recluso residia antes da condenação'
    ],
    correctIndex: 0,
    lawReference: 'Código Penal Angolano e Lei de Organização dos Tribunais de Execução de Penas',
    explanation: 'A liberdade condicional é um benefício judicial outorgado pelo Tribunal de Execução de Penas, mediante parecer fundamentado dos serviços penitenciários e verificação da boa conduta.',
    difficulty: 'difícil'
  },


  // =========================================================================
  // 5. MATÉRIA OFICIAL: PATRIOTISMO E VALORES CÍVICOS (patriotismo_valores_civicos)
  // Símbolos nacionais, deveres cívicos, bandeira, hino nacional e cidadania
  // =========================================================================

  // --- 9.ª CLASSE ---
  {
    id: 'pvc_9_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Quais são as cores e elementos centrais da Bandeira Nacional da República de Angola?',
    options: [
      'Duas faixas horizontais (Vermelha e Preta) com um Machete, Roda Dentada e Estrela Amarela no centro',
      'Três faixas verticais (Verde, Branca e Azul) com uma águia imperial prateada',
      'Duas faixas diagonais (Azul e Amarela) com um leão dourado coroado',
      'Fundo totalmente vermelho com um sol nascente no canto superior direito'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 18.º e Anexo I da Constituição da República de Angola',
    explanation: 'A Bandeira Nacional é composta por duas cores em faixas horizontais (vermelho-rubro no topo e preto em baixo), encimada por um segmento de roda dentada, catana/machete e estrela amarela.',
    difficulty: 'fácil'
  },
  {
    id: 'pvc_9_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Na Bandeira Nacional de Angola, o que simbolizam respectivamente as cores Vermelha e Preta?',
    options: [
      'O sangue derramado pelos patriotas na luta contra a opressão colonial (Vermelho) e o Continente Africano (Preto)',
      'O fogo dos vulcões e as minas de carvão vegetal do Leste',
      'A paixão pelo desporto nacional e a riqueza do petróleo das plataformas',
      'A bravura dos cavaleiros antigos e a escuridão da noite equatorial'
    ],
    correctIndex: 0,
    lawReference: 'Constituição da República de Angola - Simbologia dos Símbolos Nacionais',
    explanation: 'A faixa vermelha representa o sangue derramado pelos angolanos na resistência e luta pela liberdade; a faixa preta representa o continente africano.',
    difficulty: 'fácil'
  },
  {
    id: 'pvc_9_3',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o título do Hino Nacional da República de Angola?',
    options: [
      'Angola Avante!',
      'Avante Patriotas!',
      'Pátria Amada de África',
      'Hino da Paz e da Ordem'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 18.º e Anexo III da Constituição da República de Angola',
    explanation: 'O Hino Nacional de Angola intitula-se "Angola Avante!", com letra de Manuel Rui Monteiro e música de Rui Mingas.',
    difficulty: 'fácil'
  },
  {
    id: 'pvc_9_4',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'De acordo com o artigo 52.º da CRA, qual é o dever cívico e de honra de todos os cidadãos angolanos relativamente à Nação?',
    options: [
      'Defender a Pátria, a soberania e a integridade territorial nacional',
      'Comprar exclusivamente bens importados no estrangeiro',
      'Recusar prestar apoio às autoridades em casos de emergência ou calamidade',
      'Abandonar a cidadania ao ingressar no mercado de trabalho'
    ],
    correctIndex: 0,
    lawReference: 'Artigo 52.º da Constituição da República de Angola',
    explanation: 'O artigo 52.º consagra: "A defesa da Pátria e da integridade do território nacional é um direito e um dever fundamental de todos os angolanos".',
    difficulty: 'fácil'
  },

  // --- ENSINO MÉDIO ---
  {
    id: 'pvc_m_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Na Insígnia da República de Angola (Armas da República), o que representam conjuntamente a Catana (Machete) e a Enxada?',
    options: [
      'A aliança entre o campesinato, a produção agrícola, o trabalho e a luta pela liberdade',
      'A cobrança de taxas florestais pelo ministério das pescas',
      'O comércio internacional de ferramentas e ferragens industriais',
      'A caça tradicional de animais de grande porte nas savanas'
    ],
    correctIndex: 0,
    lawReference: 'Constituição da República de Angola - Anexo II (Insígnia da República)',
    explanation: 'A catana e a enxada cruzadas na Insígnia simbolizam o trabalho, a agricultura, a produção e a gesta heróica de libertação do povo angolano.',
    difficulty: 'médio'
  },
  {
    id: 'pvc_m_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Na Insígnia da República de Angola, o "Livro Aberto" e o "Sol Nascente" simbolizam respectivamente:',
    options: [
      'A Educação, a Cultura e a Instrução (Livro Aberto) e o Novo País em Prosperidade e Luz (Sol Nascente)',
      'O código civil de comércio e o clima tropical da costa atlântica',
      'A constituição de 1975 e o pôr-do-sol sobre o deserto do Namibe',
      'A história dos reinos europeus e os minerais diamantíferos do Leste'
    ],
    correctIndex: 0,
    lawReference: 'Constituição da República de Angola - Anexo II (Insígnia Nacional)',
    explanation: 'O livro aberto representa a educação e cultura enquanto motores do progresso humano; o sol nascente representa o nascimento de uma nova e luminosa Nação.',
    difficulty: 'médio'
  },
  {
    id: 'pvc_m_3',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O respeito pelos bens públicos e infra-estruturas do Estado (escolas, hospitais, pontes, iluminação pública e esquadras) decorre de qual princípio cívico fundamental?',
    options: [
      'Preservação do património comum do povo e cidadania participativa responsável',
      'Medo exclusivo de punição por processo disciplinar',
      'Obrigação imposta por tratados comerciais internacionais',
      'Direito de apropriação pessoal pelos moradores mais antigos do bairro'
    ],
    correctIndex: 0,
    lawReference: 'Cidadania e Deveres Fundamentais na República de Angola',
    explanation: 'Os bens públicos pertencem a toda a colectividade e garantem serviços fundamentais; a sua salvaguarda é dever cívico indeclinável de cada cidadão e agente do Estado.',
    difficulty: 'médio'
  },

  // --- ENSINO SUPERIOR ---
  {
    id: 'pvc_s_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Unidade Nacional e a Coesão Territorial (Artigos 3.º e 5.º da CRA) impõem ao funcionário e agente do MININT o dever patriótico de:',
    options: [
      'Combater todo e qualquer acto de tribalismo, racismo, regionalismo ou discriminação que ameace a paz e integridade da Nação',
      'Privilegiar candidatos e utentes oriundos da sua própria província de nascimento',
      'Defender a separação territorial de províncias com reservas minerais',
      'Recusar prestar serviço fora da capital Luanda'
    ],
    correctIndex: 0,
    lawReference: 'Artigos 3.º, 5.º e 21.º da Constituição da República de Angola',
    explanation: 'A República de Angola é una e indivisível. Os agentes da autoridade pública têm a missão de salvaguardar a unidade nacional e a igualdade de todos perante a lei.',
    difficulty: 'difícil'
  },
  {
    id: 'pvc_s_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O conceito moderno de "Segurança Cidadã" e serviço comunitário no MININT assenta em qual postulado deontológico?',
    options: [
      'A autoridade policial como guardiã dos direitos fundamentais e servidora do bem comum, gerando confiança na comunidade',
      'O isolamento absoluto das forças de ordem em relação à população civil',
      'A substituição das leis nacionais por costumes particulares de cada grupo local',
      'O uso desproporcional da intimidação física como primeira medida em todas as ocorrências'
    ],
    correctIndex: 0,
    lawReference: 'Doutrina de Polícia Comunitária e Direitos Humanos do MININT',
    explanation: 'O verdadeiro patriotismo no MININT expressa-se na protecção e respeito pelo cidadão, conciliando a firmeza na aplicação da lei com a proximidade comunitária.',
    difficulty: 'difícil'
  }
];

/**
 * Função utilitária de busca e filtragem do banco de questões
 */
export function getFilteredQuestions(options?: {
  category?: QuestionCategory | 'todas' | 'misto';
  branch?: MININTBranch | 'GERAL' | 'todos' | string;
  academicLevel?: AcademicLevel;
  difficulty?: 'fácil' | 'médio' | 'difícil' | 'todas';
}): Question[] {
  let pool = [...QUESTION_BANK];

  if (options?.category && options.category !== 'todas' && options.category !== 'misto') {
    pool = pool.filter(q => q.category === options.category);
  }

  if (options?.branch && options.branch !== 'todos') {
    pool = pool.filter(q => q.branch === options.branch || q.branch === 'GERAL');
  }

  if (options?.academicLevel) {
    pool = pool.filter(q => q.academicLevel === options.academicLevel || q.academicLevel === 'todos' || !q.academicLevel);
  }

  if (options?.difficulty && options.difficulty !== 'todas') {
    pool = pool.filter(q => q.difficulty === options.difficulty);
  }

  return pool;
}

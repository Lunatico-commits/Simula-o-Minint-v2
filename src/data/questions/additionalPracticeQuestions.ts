import { Question } from '../../types';

export const ADDITIONAL_PRACTICE_QUESTIONS: Question[] = [
  // --- HISTÓRIA DE ANGOLA (ha_add_1 a ha_add_10) ---
  {
    id: 'ha_add_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o nome da província onde nasceu o primeiro Presidente de Angola, Dr. António Agostinho Neto?',
    options: [
      'Bengo (Ícolo e Bengo)',
      'Huambo',
      'Huíla',
      'Cunene'
    ],
    correctIndex: 0,
    lawReference: 'Biografia Oficial do Herói Nacional António Agostinho Neto (1922-1979)',
    explanation: 'Agostinho Neto nasceu a 17 de Setembro de 1922 na localidade de Caxicane, município de Ícolo e Bengo.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_add_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O célebre navio "Santa Maria" (1961), desviado pelo capitão Henrique Galvão para denunciar o colonialismo português, visava chamar a atenção para a opressão em:',
    options: [
      'Angola e demais colónias sob ditadura de Salazar',
      'Países da América do Norte',
      'Territórios do extremo oriente',
      'Ilhas do Caribe'
    ],
    correctIndex: 0,
    lawReference: 'História Anticolonial - Operação Dulcineia (1961)',
    explanation: 'O assalto ao Santa Maria foi a primeira acção internacional de grande impacto que denunciou a opressão em Angola ao mundo.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_add_3',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A criação do Caminho de Ferro de Benguela (CFB) ligou o Porto do Lobito no Oceano Atlântico até:',
    options: [
      'À fronteira leste de Luau (Moxico) e às regiões mineiras da RDC e Zâmbia',
      'À cidade do Namibe no litoral sul',
      'Ao porto de Cabinda por via terrestre',
      'Ao deserto do Saara no norte de África'
    ],
    correctIndex: 0,
    lawReference: 'História Económica e de Infraestruturas de Angola - Caminho de Ferro de Benguela',
    explanation: 'O CFB (Corredor do Lobito) é a linha férrea transcontinental mais estratégica da África Austral.',
    difficulty: 'médio'
  },
  {
    id: 'ha_add_4',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual foi o histórico soberano do Reino de Cokwe que chefiou a grande expansão territorial no leste de Angola no século XIX?',
    options: [
      'Mwana Pwó e Mwata Yanvo',
      'Rei Muene Puto Kabamba',
      'Rei Nimi a Lukeni',
      'Rei Kiluanje Kia Samba'
    ],
    correctIndex: 0,
    lawReference: 'História dos Reinos Tradicionais do Leste de Angola',
    explanation: 'A expansão Cokwe no século XIX estabeleceu uma vasta rede de comércio e poder político no planalto leste.',
    difficulty: 'médio'
  },
  {
    id: 'ha_add_5',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Resolução 435 do Conselho de Segurança das Nações Unidas (1978), cuja implementação decorreu dos Acordos de Nova Iorque de 1988 com participação de Angola, estabeleceu:',
    options: [
      'O plano para a retirada das tropas sul-africanas de Angola e a independência da Namíbia sob supervisão da UNTAG',
      'A divisão definitiva do território angolano em duas repúblicas',
      'A anexação de Cabinda à República do Congo',
      'A cobrança de indemnizações de guerra aos cidadãos de Luanda'
    ],
    correctIndex: 0,
    lawReference: 'História das Relações Internacionais e Diplomacia Angolana - Acordos Tripartidos de 1988',
    explanation: 'A diplomacia angolana e o desfecho da Batalha do Cuito Cuanavale permitiram a aplicação da Resolução 435 e a liberdade da Namíbia.',
    difficulty: 'difícil'
  },
  {
    id: 'ha_add_6',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Conferência de Bandung (1955), na Indonésia, foi marcante para o nacionalismo angolano porque:',
    options: [
      'Consolidou o Movimento dos Não-Alinhados e aprovou a condenação formal do colonialismo e da discriminação racial no mundo',
      'Aprovou a venda de armamento pesado para os governadores coloniais',
      'Reconheceu a soberania colonial portuguesa como perpétua',
      'Criou o Banco Africano de Desenvolvimento'
    ],
    correctIndex: 0,
    lawReference: 'História Mundial e Descolonização - Conferência de Bandung (1955)',
    explanation: 'Bandung inspirou os líderes africanos e angolanos a organizar as frentes de libertação nacional.',
    difficulty: 'difícil'
  },

  // --- ORGANIZAÇÃO POLÍTICA E CRA (cra_add_1 a cra_add_8) ---
  {
    id: 'cra_add_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Nos termos da CRA, as Forças Armadas Angolanas (FAA) e a Polícia Nacional são instituições:',
    options: [
      'Apartidárias, obedientes aos órgãos de soberania e ao serviço exclusivo de todo o povo angolano',
      'Filiadas obrigatoriamente a partidos políticos de oposição',
      'Subordinadas a empresas privadas de exploração mineral',
      'Criadas apenas para actuar fora das fronteiras nacionais'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 206.º e 207.º (Segurança Nacional e Forças de Defesa)',
    explanation: 'As forças de defesa e segurança são estritamente apartidárias e orientadas pelo interesse supremo da Nação.',
    difficulty: 'fácil'
  },
  {
    id: 'cra_add_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Princípio da Presunção de Inocência (Artigo 67.º da CRA) garante que todo o cidadão arguido:',
    options: [
      'Presume-se inocente até ao trânsito em julgado da sentença condenatória proferida por tribunal competente',
      'É considerado culpado assim que for detido pela polícia',
      'Deve provar a sua própria inocência sob pena de prisão imediata',
      'Não tem direito a contactar um advogado de defesa'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 67.º (Garantias do Processo Criminal)',
    explanation: 'A presunção de inocência é uma garantia pétrea do Estado de Direito contra condenações arbitrárias.',
    difficulty: 'médio'
  },
  {
    id: 'cra_add_3',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A quem compete privativamente julgar os recursos em matéria de contencioso eleitoral em Angola?',
    options: [
      'Ao Tribunal Constitucional em plenário',
      'Ao Tribunal Provincial de Comarca',
      'Ao Ministério do Interior',
      'À Presidência da Assembleia Nacional'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 180.º (Competências do Tribunal Constitucional)',
    explanation: 'O Tribunal Constitucional valida os resultados eleitorais e aprecia os recursos interpostos pelos concorrentes.',
    difficulty: 'médio'
  },
  {
    id: 'cra_add_4',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'Nos termos da CRA (Artigo 211.º), o Estatuto dos Magistrados Judiciais garante aos juízes as garantias de:',
    options: [
      'Inamovibilidade, irresponsabilidade por suas decisões judiciais (salvo dolo ou culpa grave) e independência hierárquica',
      'Poder absoluto de criar novos impostos',
      'Imunidade para desrespeitar o Código Penal',
      'Eleição a cada dois anos pela população local'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 179.º e Artigo 211.º (Garantias dos Juízes)',
    explanation: 'A inamovibilidade e a independência garantem que o juiz julgue exclusivamente de acordo com a Constituição e a lei.',
    difficulty: 'difícil'
  },

  // --- NOÇÕES DE ADMINISTRAÇÃO PÚBLICA (adm_add_1 a adm_add_8) ---
  {
    id: 'adm_add_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O uso indevido de materiais e viaturas do Estado para fins particulares configura:',
    options: [
      'Violação grave dos deveres funcionais e acto de improbidade administrativa patrimonial',
      'Um bónus salarial normal concedido aos funcionários',
      'Prática recomendada pelas normas de procedimento',
      'Uma contravenção sem qualquer importância jurídica'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 (Lei da Probidade Pública) - Danos ao Património Público',
    explanation: 'O património do Estado deve ser utilizado exclusivamente para a satisfação do interesse público.',
    difficulty: 'fácil'
  },
  {
    id: 'adm_add_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Princípio da Boa-Fé na Administração Pública exige que:',
    options: [
      'A Administração e os administrados actuem com lealdade, confiança mútua e transparência nas suas relações recíprocas',
      'A Administração engane os cidadãos para cobrar multas surpresa',
      'O cidadão apresente documentos falsificados sem punição',
      'O funcionário descumpra os acordos firmados por escrito'
    ],
    correctIndex: 0,
    lawReference: 'Normas do Procedimento Administrativo - Princípio da Boa-Fé',
    explanation: 'A boa-fé protege as legítimas expectativas dos cidadãos criadas pela conduta coerente dos órgãos públicos.',
    difficulty: 'médio'
  },
  {
    id: 'adm_add_3',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A "Autoexecutoriedade" dos Actos Administrativos consiste na prerrogativa conferida à Administração Pública de:',
    options: [
      'Executar materialmente as suas decisões com recurso à coacção pública legítima sem necessidade de autorização judicial prévia, nos casos expressamente previstos na lei',
      'Comprar ações em bolsas de valores internacionais',
      'Revogar sentenças dos juízes do Supremo Tribunal',
      'Modificar os limites territoriais das províncias por portaria municipal'
    ],
    correctIndex: 0,
    lawReference: 'Direito Administrativo - Privilégio de Execução Prévia e Autoexecutoriedade',
    explanation: 'A autoexecutoriedade permite agir prontamente em situações de urgência e defesa da segurança pública e da ordem.',
    difficulty: 'difícil'
  },

  // --- LEGISLAÇÃO E MININT RAMOS (min_add_1 a min_add_10) ---
  {
    id: 'min_add_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é o número telefónico de chamada de emergência nacional para chamar a Polícia Nacional de Angola?',
    options: [
      '113',
      '115',
      '111',
      '112'
    ],
    correctIndex: 0,
    lawReference: 'Comando Geral da PNA - Centro Integrado de Segurança Pública (CISP 111 / PNA 113)',
    explanation: 'O 113 é a linha clássica e directa de emergência da Polícia Nacional de Angola.',
    difficulty: 'fácil'
  },
  {
    id: 'min_add_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O CISP (Centro Integrado de Segurança Pública) integra tecnologia de videovigilância urbana e despacho operacional para:',
    options: [
      'PNA, SIC, SME, SPCB e serviços de emergência médica (INEMA) de forma coordenada e centralizada',
      'Apenas empresas privadas de aluguer de viaturas',
      'A direcção de tráfego de aviões civis',
      'Apenas controlo de frequência escolar'
    ],
    correctIndex: 0,
    lawReference: 'Decreto Presidencial de Criação do CISP (MININT)',
    explanation: 'O CISP moderniza a segurança pública integrando respostas de emergência rápidas e videovigilância em tempo real.',
    difficulty: 'médio'
  },
  {
    id: 'min_add_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Qual é a autoridade a quem o agente do SIC deve entregar imediatamente a arma do crime apreendida para junção aos autos?',
    options: [
      'Ao Instrutor do Processo e Peritos de Balística Forense para elaboração do competente exame pericial',
      'A um vendedor no mercado informal',
      'Ao vizinho da vítima do crime',
      'Ao motorista da viatura de patrulha para guardar em casa'
    ],
    correctIndex: 0,
    lawReference: 'Código de Processo Penal - Apreensões e Exames Periciais Balísticos',
    explanation: 'A arma do crime é objecto pericial de prova de valor probatório fundamental para o apuramento da autoria.',
    difficulty: 'fácil'
  },
  {
    id: 'min_add_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A recolha de amostras biológicas de ADN em suspeitos de crimes violentos para inclusão na base de dados forense do SIC:',
    options: [
      'Rege-se por lei específica, garantindo a dignidade da pessoa humana, estrita confidencialidade e prévia validação judicial',
      'Pode ser feita à força sem qualquer registo nem controlo judicial',
      'É vendida a laboratórios privados de outros países',
      'É proibida para qualquer tipo de crime mesmo sob autorização judicial'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 39/20 (Código do Processo Penal) e Regulamentação Forense do ADN',
    explanation: 'A obtenção de ADN forense é regulada para garantir a idoneidade da prova pericial e proteger os direitos fundamentais do cidadão.',
    difficulty: 'difícil'
  },
  {
    id: 'min_add_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Visto de Estudo emitido pelo SME destina-se a permitir a entrada e permanência em Angola de cidadão estrangeiro para:',
    options: [
      'Frequentar cursos escolares do ensino regular, superior ou técnico em estabelecimentos de ensino devidamente reconhecidos no país',
      'Trabalhar como gerente comercial em supermercados',
      'Comprar ouro e diamantes no mercado paralelo',
      'Fundar um partido político local'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 - Visto de Estudo',
    explanation: 'O visto de estudo é intransmissível e autoriza a permanência durante a vigência do ano lectivo comprovado por matrícula.',
    difficulty: 'médio'
  },
  {
    id: 'min_add_6',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Ao deparar-se com um incêndio em fase inicial num recipiente com óleo de fritura a ferver na cozinha, o que NUNCA deve ser jogado?',
    options: [
      'NUNCA jogar água (pois causa violenta explosão de vapor e chamas), devendo abafar a panela com a tampa ou pano húmido',
      'Nunca desligar o bico do fogão',
      'Nunca abrir a porta da cozinha',
      'Nunca chamar os adultos'
    ],
    correctIndex: 0,
    lawReference: 'Manual de Prevenção e Segurança Contra Incêndios Domésticos (SPCB)',
    explanation: 'A água evapora violentamente sob óleo fervente arremessando gotículas incandescentes (fenómeno boilover doméstico).',
    difficulty: 'fácil'
  },
  {
    id: 'min_add_7',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Plano de Emergência Interno (PEI) obrigatório em edifícios de grande altura e centros comerciais deve ser aprovado por:',
    options: [
      'Serviço de Protecção Civil e Bombeiros (SPCB) após vistoria técnica de segurança contra incêndios',
      'Comissão de Moradores do quarteirão em acta simples',
      'Associação dos taxistas da província',
      'Empresa fabricante dos elevadores'
    ],
    correctIndex: 0,
    lawReference: 'Regulamento de Segurança Contra Incêndios em Edifícios e Vistoria do SPCB',
    explanation: 'O SPCB fiscaliza rotas de fuga, hidrantes, sinalização fotoluminescente e sistemas de detecção automática de fumo.',
    difficulty: 'difícil'
  },
  {
    id: 'min_add_8',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Regime Disciplinar Prisional (Lei n.º 8/08) veda expressamente a aplicação de punições disciplinares que consistam em:',
    options: [
      'Castigos corporais físicos, redução de alimentação básica, privação de água potável ou confinamento em cela escura sem ventilação',
      'Advertência verbal registada no processo do recluso',
      'Suspensão temporária de jogos recreativos',
      'Transferência de cela para o mesmo regime'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 (Lei Penitenciária) - Artigo 50.º e Regras de Mandela',
    explanation: 'A integridade física e psíquica do recluso é inviolável, sendo as sanções estritamente limitadas pelo princípio da humanidade.',
    difficulty: 'médio'
  },

  // --- PATRIOTISMO E VALORES CÍVICOS (pvc_add_1 a pvc_add_5) ---
  {
    id: 'pvc_add_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O lema oficial da República de Angola consagrado no Hino Nacional incentiva o povo a:',
    options: [
      'Marchar pela paz, pelo progresso e pela construção de uma Pátria livre e próspera',
      'Desistir perante as primeiras dificuldades económicas',
      'Dividir o território nacional em pequenas parcelas isoladas',
      'Recusar o diálogo fraterno entre irmãos'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Anexo III (Hino Nacional)',
    explanation: 'O hino "Angola Avante!" conclama a marcha firme de todos os angolanos rumo ao futuro e à grandeza do país.',
    difficulty: 'fácil'
  },
  {
    id: 'pvc_add_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A tolerância cívica, política e religiosa constitui um dos alicerces do Estado laico e democrático porque:',
    options: [
      'Garante que todos os cidadãos vivam em harmonia, expressando livremente as suas ideias e crenças sem medo de perseguição',
      'Permite a criação de polícias privadas religiosas',
      'Obriga todos os cidadãos a terem a mesma opinião partidária',
      'Elimina o cumprimento das leis comuns'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 10.º (Estado Laico) e Artigo 41.º (Liberdade de Consciência e Religião)',
    explanation: 'A laicidade do Estado garante a separação entre Estado e confissões religiosas, promovendo o respeito à diversidade de culto.',
    difficulty: 'médio'
  },
  {
    id: 'pvc_add_3',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Princípio da Solidariedade Nacional (CRA - Artigo 90.º) impõe como dever patriótico a contribuição de todos os cidadãos através de:',
    options: [
      'Pagamento pontual e justo de impostos conforme a capacidade contributiva de cada um para financiar a saúde, educação e segurança colectiva',
      'Fuga ao fisco e transferência de divisas por vias clandestinas',
      'Recusa em declarar rendimentos à Administração Tributária',
      'Uso exclusivo de serviços privados sem pagar qualquer taxa pública'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 90.º alínea b) (Dever de Contribuir para as Despesas Públicas)',
    explanation: 'Os impostos constituem o meio essencial através do qual o Estado garante serviços essenciais, hospitais, estradas e escolas para todo o povo.',
    difficulty: 'difícil'
  }
];
